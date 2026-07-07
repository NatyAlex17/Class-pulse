'use client';

import * as React from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { Button } from '@/components/ui/button';

type EnrollmentPaymentSectionProps = {
  amount: number;
  clientSecret: string;
  cohortName: string;
  publishableKey: string;
  onError: (message: string) => void;
  onSuccess: (paymentIntentId: string) => Promise<void>;
};

function formatMoney(amount: number) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `$${safeAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function EnrollmentPaymentForm({
  amount,
  cohortName,
  onError,
  onSuccess,
}: Omit<EnrollmentPaymentSectionProps, 'clientSecret' | 'publishableKey'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe is still loading. Please wait a moment and try again.');
      return;
    }

    setIsSubmitting(true);
    onError('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message ?? 'Payment could not be completed.');
      setIsSubmitting(false);
      return;
    }

    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      onError('Payment did not finish successfully. Please try again.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSuccess(paymentIntent.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[22px] border border-border-subtle bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">Secure payment</p>
          <h4 className="mt-2 font-display text-[24px] font-semibold text-on-surface">{cohortName}</h4>
        </div>
        <div className="text-right">
          <p className="font-display text-[26px] font-semibold text-primary">{formatMoney(amount)}</p>
          <p className="text-xs text-on-surface-variant">processed with Stripe</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-info/20 bg-info/5 p-4 text-sm text-on-surface-variant">
        Test mode is enabled. Use card number `4242 4242 4242 4242`, any future expiry, any CVC, and any ZIP.
      </div>

      <PaymentElement options={{ layout: 'tabs' }} />

      <Button type="submit" className="w-full" disabled={isSubmitting || !stripe || !elements}>
        {isSubmitting ? `Processing ${formatMoney(amount)}...` : `Pay ${formatMoney(amount)} and enroll`}
      </Button>
    </form>
  );
}

export function EnrollmentPaymentSection({
  amount,
  clientSecret,
  cohortName,
  publishableKey,
  onError,
  onSuccess,
}: EnrollmentPaymentSectionProps) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const stripePromise = React.useMemo(() => loadStripe(publishableKey), [publishableKey]);

  if (!clientSecret || !publishableKey) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <EnrollmentPaymentForm amount={safeAmount} cohortName={cohortName} onError={onError} onSuccess={onSuccess} />
    </Elements>
  );
}
