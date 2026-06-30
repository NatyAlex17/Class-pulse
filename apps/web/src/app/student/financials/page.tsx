 'use client';

import * as React from 'react';
import {
  IconCalendarDue,
  IconCheck,
  IconCreditCard,
  IconDownload,
  IconRobot,
  IconSearch,
  IconTrendingDown,
  IconX,
  IconLock,
  IconAlertCircle,
  IconPrinter,
  IconFile,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StudentShell } from '@/components/student/student-shell';

type PaymentRow = {
  date: string;
  amount: string;
  status: 'Completed';
  transactionId: string;
};

const paymentRows: PaymentRow[] = [
  { date: 'July 15, 2024', amount: '$875.00', status: 'Completed', transactionId: '#TXN_JUL_24_001' },
  { date: 'April 15, 2024', amount: '$875.00', status: 'Completed', transactionId: '#TXN_APR_24_001' },
  { date: 'January 15, 2024', amount: '$875.00', status: 'Completed', transactionId: '#TXN_JAN_24_001' },
];

export default function StudentFinancialsPage() {
  const { onboardingSteps, completeOnboardingStep, paymentHistory, paymentBalance, makePayment, lastAction } = useStudentDemo();
  const billingStep = onboardingSteps.find((step) => step.id === 'billing');

  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [paymentStep, setPaymentStep] = React.useState<'select' | 'form' | 'processing' | 'success'>('select');
  const [selectedAmount, setSelectedAmount] = React.useState(paymentBalance);
  const [cardData, setCardData] = React.useState({
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const [processingError, setProcessingError] = React.useState('');

  const [showReceiptModal, setShowReceiptModal] = React.useState(false);
  const [selectedReceipt, setSelectedReceipt] = React.useState<PaymentRow | null>(null);

  const columns: DataTableColumn<PaymentRow>[] = [
    { id: 'date', header: 'Date', accessorKey: 'date' },
    { id: 'amount', header: 'Amount', accessorKey: 'amount' },
    {
      id: 'status',
      header: 'Status',
      cell: () => <Badge variant="success">Completed</Badge>,
    },
    {
      id: 'receipt',
      header: 'Receipt',
      cell: (row) => (
        <button
          onClick={() => {
            setSelectedReceipt(row);
            setShowReceiptModal(true);
          }}
          className="text-outline transition hover:text-primary"
          title="View Receipt"
        >
          <IconDownload className="size-5" />
        </button>
      ),
    },
  ];

  const handlePaymentClick = () => {
    if (paymentBalance > 0) {
      setShowPaymentModal(true);
      setPaymentStep('select');
      setSelectedAmount(paymentBalance);
      setProcessingError('');
    }
  };

  const handleFormSubmit = async () => {
    if (!cardData.cardNumber || !cardData.expiry || !cardData.cvc) {
      setProcessingError('Please fill in all card details');
      return;
    }

    setPaymentStep('processing');
    setProcessingError('');

    // Simulate Stripe payment processing
    setTimeout(() => {
      makePayment();
      setPaymentStep('success');
    }, 2000);
  };

  const resetPaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStep('select');
    setCardData({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      cardNumber: '',
      expiry: '',
      cvc: '',
    });
    setProcessingError('');
  };

  return (
    <StudentShell
      title="Financial Overview"
      subtitle="Manage your tuition, payment plans, and scholarship disbursement."
      topActions={
        <div className="hidden items-center gap-8 md:flex">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <Input
              placeholder="Search financials..."
              className="h-9 w-64 rounded-full border-0 bg-surface-low pl-10"
            />
          </div>
        </div>
      }
      profileName="Sarah Jenkins"
      profileMeta="BNS Nursing Student"
      profileImageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDf6HnCMkNHZlbyGnX9vhP7RdDxyWbBaIIvXRMM6AM4S-bbpGQRU46l3YXzTF8-_L7cHkf-nq43C-CgNbOiDLrLSZC6b8YLzSnR5dfcYGlqDMXFe8qHChFUDNXqt3nHhsXnXNGLqgH8cFVDQYPvtdtcyPc5C8tWwClRE8ZjiciWKqDyQulGMA89qV1H3sy3Z3EnN_kK8bB_Ac8zPicp7arwLtTO37sFPfHjLvWSHbSK6IDeIf80QN1EY5raYQeXcSdbN9Pwy3pKsLDn"
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div />
        <div className="flex items-center gap-3 rounded-[16px] border border-success/20 bg-success/10 px-4 py-2.5 text-success">
          <IconCheck className="size-5" />
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">On Track</span>
            <span className="text-[12px] opacity-90">
              {billingStep?.complete
                ? 'Payment preference confirmed for the walkthrough'
                : 'Final payment scheduled for Oct 15, 2024'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            label: 'Total Tuition',
            value: '$3,500.00',
            note: 'Annual Program Fee (2023-2024)',
            width: '100%',
            tone: 'bg-primary',
          },
          {
            label: 'Amount Paid',
            value: '$2,625.00',
            note: '75% of total balance cleared',
            width: '75%',
            tone: 'bg-success',
          },
          {
            label: 'Balance Due',
            value: '$875.00',
            note: 'Remaining in 1 installment',
            width: '25%',
            tone: 'bg-primary-container',
          },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-border-subtle bg-surface p-6 transition hover:border-primary/30">
            <div className="mb-4 flex items-start justify-between">
              <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-outline">{card.label}</span>
              <IconCreditCard className="size-6 text-outline/50" />
            </div>
            <div className="font-mono text-[32px] font-bold tracking-tight text-on-surface">
              {card.label === 'Amount Paid'
                ? `$${(3500 - paymentBalance).toFixed(2)}`
                : card.label === 'Balance Due'
                  ? `$${paymentBalance.toFixed(2)}`
                  : card.value}
            </div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-surface-container">
              <div className={`h-full rounded-full ${card.tone}`} style={{ width: card.width }} />
            </div>
            <p className="mt-2 text-[11px] text-outline">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 rounded-[18px] border border-border-subtle bg-surface p-6 lg:col-span-4">
          <h3 className="mb-6 font-display text-[18px] font-semibold">Installment Plan</h3>
          <div className="relative space-y-0">
            <div className="absolute bottom-10 left-[19px] top-4 w-0.5 bg-border-subtle" />
            {paymentHistory.map((payment, index) => (
              <div key={payment.id} className={`relative flex gap-4 ${index < paymentHistory.length - 1 ? 'pb-8' : ''}`}>
                <div
                  className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    payment.status === 'Completed'
                      ? 'border-success bg-success/10 text-success'
                      : 'border-warning bg-warning/10 text-warning'
                  }`}
                >
                  {payment.status === 'Completed' ? <IconCheck className="size-4" /> : <IconCalendarDue className="size-4" />}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-on-surface">Installment {String(index + 1).padStart(2, '0')}</h4>
                    <Badge variant={payment.status === 'Completed' ? 'success' : 'warning'}>{payment.status === 'Completed' ? 'Paid' : 'Upcoming'}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-[12px] text-outline">
                    ${payment.amount.toFixed(2)} / {payment.status === 'Completed' ? `Paid ${payment.date}` : `Due ${payment.date}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[18px] bg-primary p-6 text-white shadow-xl shadow-primary/20 md:flex-row">
            <div className="flex items-center gap-5">
              <div className="flex h-9 w-14 items-center justify-center rounded-md border border-white/20 bg-surface/10">
                <span className="text-[14px] font-bold italic">VISA</span>
              </div>
              <div>
                <h4 className="text-base font-bold">Active Card on File</h4>
                <p className="font-mono text-sm text-white/70">.... .... .... 4242 / Exp 09/27</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full rounded-[16px] bg-surface text-primary hover:bg-surface-low md:w-auto" onClick={handlePaymentClick}>
              {paymentBalance > 0 ? 'Pay Next Installment' : 'All Payments Complete'}
            </Button>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-5">
              <h3 className="font-display text-[18px] font-semibold">Payment History</h3>
              <button className="text-sm font-semibold text-primary hover:underline">View All</button>
            </div>
            <div className="p-6">
              <DataTable
                columns={columns}
                data={paymentRows}
                classNames={{
                  desktopWrapper: 'rounded-none border-0 shadow-none bg-transparent',
                  toolbar: 'hidden',
                }}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="relative mt-12 flex flex-col gap-8 overflow-hidden rounded-[24px] bg-surface-high p-8 md:flex-row md:items-center">
        <div className="relative z-10 md:w-2/3">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-md bg-primary-container p-1 text-white">
              <IconRobot className="size-4" />
            </span>
            <h4 className="font-bold text-primary">Student Finance AI</h4>
          </div>
          <h3 className="font-display text-[22px] font-semibold text-on-surface">
            Need help understanding your financial aid package?
          </h3>
          <p className="mb-6 mt-4 text-on-surface-variant">
            Our intelligent assistant can explain scholarship terms, grant eligibility, or help you
            adjust your monthly payment schedule.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => billingStep && completeOnboardingStep(billingStep.id)}>
              Ask Assistant
            </Button>
            <Button variant="secondary" onClick={() => billingStep && completeOnboardingStep(billingStep.id)}>
              View FAQ
            </Button>
          </div>
          <p className="mt-6 text-[11px] italic text-outline">
            Notice: AI Assistant provides guidance based on official student policy documents.
            Official financial decisions are subject to university bursar approval. {lastAction}
          </p>
        </div>
        <div className="flex justify-center md:w-1/3">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-primary/10 bg-primary/5">
            <IconCreditCard className="size-16 text-primary/40" />
            <div className="absolute -right-2 -top-2 rounded-[14px] border border-border-subtle bg-surface p-3 shadow-sm">
              <span className="flex items-center gap-1 text-xs font-bold text-success">
                <IconTrendingDown className="size-4" />
                -2% Rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-surface shadow-xl max-h-[90vh] overflow-y-auto" style={{ fontFamily: 'system-ui, -apple-system, monospace' }}>
            {/* Close Button */}
            <div className="sticky top-0 flex justify-end bg-surface p-4 border-b border-border-subtle">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt(null);
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="p-8 border-b border-dashed border-on-surface-variant/30">
              {/* Company Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-on-surface">CLASS PULSE</h2>
                <p className="text-xs text-on-surface-variant mt-1">Academy</p>
                <p className="text-[11px] text-on-surface-variant mt-2">123 Education Street</p>
                <p className="text-[11px] text-on-surface-variant">support@classpulse.com</p>
              </div>

              {/* Receipt Title and Numbers */}
              <div className="text-center mb-8 pb-6 border-b border-on-surface-variant/20">
                <h3 className="text-lg font-bold text-on-surface">PAYMENT RECEIPT</h3>
                <div className="mt-4 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Receipt No.</span>
                    <span className="font-mono font-bold text-on-surface">{selectedReceipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Date</span>
                    <span className="font-mono text-on-surface">{selectedReceipt.date}</span>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-2">Bill To</p>
                <p className="font-bold text-on-surface text-sm">Sarah Jenkins</p>
                <p className="text-[11px] text-on-surface-variant">sarah.jenkins@example.com</p>
                <p className="text-[11px] text-on-surface-variant">BNS Nursing Student</p>
              </div>

              {/* Line Items */}
              <div className="mb-6 border-y border-on-surface-variant/20 py-3">
                <div className="flex justify-between items-start mb-3 pb-2 border-b border-on-surface-variant/10">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Description</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Amount</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-semibold text-on-surface">Tuition Installment</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">BNS Program Payment - 2024</p>
                  </div>
                  <p className="text-sm font-mono font-bold text-on-surface whitespace-nowrap">{selectedReceipt.amount}</p>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6 pb-6 border-b border-on-surface-variant/20">
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-mono text-on-surface">{selectedReceipt.amount}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Tax (0%)</span>
                  <span className="font-mono text-on-surface">$0.00</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Processing Fee</span>
                  <span className="font-mono text-on-surface">$0.00</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mb-6 pb-6 border-b border-on-surface-variant/20">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-on-surface">TOTAL</span>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-bold text-primary">{selectedReceipt.amount}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-2">Payment Details</p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Payment Method</span>
                    <span className="font-mono text-on-surface">Visa •••• 4242</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Status</span>
                    <span className="font-mono text-success font-bold">PAID</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Transaction ID</span>
                    <span className="font-mono text-on-surface text-[10px]">{selectedReceipt.transactionId}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center space-y-2 pt-6 border-t border-dashed border-on-surface-variant/30">
                <div className="flex items-center justify-center gap-1 mb-3">
                  <IconLock className="h-3 w-3 text-primary" />
                  <p className="text-[9px] font-bold text-primary">SECURE TRANSACTION</p>
                </div>
                <p className="text-[10px] text-on-surface-variant">Processed securely through Stripe</p>
                <p className="text-[10px] text-on-surface-variant">PCI DSS Compliant • Encrypted</p>
                <p className="text-[9px] text-on-surface-variant mt-3 italic">Thank you for your payment</p>
                <p className="text-[9px] text-on-surface-variant">Please keep this receipt for your records</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const receiptHTML = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Receipt - ${selectedReceipt.transactionId}</title>
                        <style>
                          body { font-family: monospace; margin: 20px; color: #333; background: white; }
                          .receipt { max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
                          .header { text-align: center; border-bottom: 2px dashed #999; padding-bottom: 15px; margin-bottom: 15px; }
                          .header h1 { margin: 0; font-size: 18px; }
                          .header p { margin: 5px 0; font-size: 12px; }
                          .section { margin-bottom: 15px; }
                          .line { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; }
                          .label { color: #666; }
                          .total { border-top: 2px dashed #999; padding-top: 10px; font-weight: bold; }
                          .footer { text-align: center; font-size: 10px; color: #666; border-top: 2px dashed #999; padding-top: 15px; margin-top: 15px; }
                        </style>
                      </head>
                      <body>
                        <div class="receipt">
                          <div class="header">
                            <h1>CLASS PULSE ACADEMY</h1>
                            <p>123 Education Street</p>
                            <p>support@classpulse.com</p>
                          </div>

                          <div class="header" style="border-bottom-width: 1px;">
                            <h2 style="font-size: 14px; margin: 0;">PAYMENT RECEIPT</h2>
                            <div class="line" style="margin-top: 10px;">
                              <span>Receipt No.</span>
                              <span>${selectedReceipt.transactionId}</span>
                            </div>
                            <div class="line">
                              <span>Date</span>
                              <span>${selectedReceipt.date}</span>
                            </div>
                          </div>

                          <div class="section">
                            <div class="label">BILL TO</div>
                            <p style="margin: 5px 0; font-weight: bold;">Sarah Jenkins</p>
                            <p style="margin: 2px 0; font-size: 12px;">sarah.jenkins@example.com</p>
                            <p style="margin: 2px 0; font-size: 12px;">BNS Nursing Student</p>
                          </div>

                          <div class="section">
                            <div class="line">
                              <span>Tuition Installment</span>
                              <span></span>
                            </div>
                            <div class="line" style="font-size: 11px; color: #666; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
                              <span>BNS Program Payment - 2024</span>
                              <span>${selectedReceipt.amount}</span>
                            </div>
                          </div>

                          <div class="section">
                            <div class="line">
                              <span>Subtotal</span>
                              <span>${selectedReceipt.amount}</span>
                            </div>
                            <div class="line">
                              <span>Tax</span>
                              <span>$0.00</span>
                            </div>
                            <div class="line total">
                              <span>TOTAL</span>
                              <span>${selectedReceipt.amount}</span>
                            </div>
                          </div>

                          <div class="section" style="font-size: 11px;">
                            <div class="line">
                              <span>Payment Method</span>
                              <span>Visa •••• 4242</span>
                            </div>
                            <div class="line">
                              <span>Status</span>
                              <span>PAID</span>
                            </div>
                          </div>

                          <div class="footer">
                            <p style="margin: 0;">Processed securely through Stripe</p>
                            <p style="margin: 3px 0;">PCI DSS Compliant • Encrypted</p>
                            <p style="margin-top: 10px;">Thank you for your payment</p>
                            <p>Please keep receipt for your records</p>
                          </div>
                        </div>
                      </body>
                    </html>
                  `;
                  const printWindow = window.open('', '', 'width=400,height=600');
                  if (printWindow) {
                    printWindow.document.write(receiptHTML);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                className="flex-1 gap-2"
              >
                <IconPrinter className="h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={() => {
                  const receiptText = `CLASS PULSE ACADEMY
123 Education Street
support@classpulse.com

========================================
PAYMENT RECEIPT
========================================

Receipt No: ${selectedReceipt.transactionId}
Date: ${selectedReceipt.date}

BILL TO
Sarah Jenkins
sarah.jenkins@example.com
BNS Nursing Student

========================================
DESCRIPTION                       AMOUNT
========================================
Tuition Installment               ${selectedReceipt.amount}
BNS Program Payment - 2024

========================================
Subtotal                          ${selectedReceipt.amount}
Tax (0%)                          $0.00
Processing Fee                    $0.00
----------------------------------------
TOTAL                             ${selectedReceipt.amount}
========================================

PAYMENT DETAILS
Payment Method: Visa •••• 4242
Status: PAID
Transaction ID: ${selectedReceipt.transactionId}

========================================
Processed securely through Stripe
PCI DSS Compliant • Encrypted

Thank you for your payment
Please keep this receipt for your records
========================================
                  `;
                  const element = document.createElement('a');
                  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptText));
                  element.setAttribute('download', `receipt_${selectedReceipt.transactionId.replace('#', '')}.txt`);
                  element.style.display = 'none';
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="flex-1 gap-2"
              >
                <IconDownload className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-[24px] bg-surface p-8 shadow-xl">
            {paymentStep === 'select' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-on-surface">Select Payment Amount</h2>
                  <button
                    onClick={resetPaymentModal}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    <IconX className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6 space-y-3">
                  <div
                    onClick={() => {
                      setSelectedAmount(paymentBalance);
                      setPaymentStep('form');
                    }}
                    className="cursor-pointer rounded-[16px] border-2 border-primary bg-primary/5 p-4 transition hover:bg-primary/10"
                  >
                    <p className="text-sm text-on-surface-variant">Next Installment</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-primary">${paymentBalance.toFixed(2)}</p>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedAmount(500);
                      setPaymentStep('form');
                    }}
                    className="cursor-pointer rounded-[16px] border-2 border-border-subtle bg-surface-muted p-4 transition hover:border-primary/30"
                  >
                    <p className="text-sm text-on-surface-variant">Custom Amount</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-on-surface">$500.00</p>
                  </div>

                  <div className="rounded-[16px] border-2 border-border-subtle p-4">
                    <label className="block text-sm font-semibold text-on-surface">Custom Amount</label>
                    <Input
                      type="number"
                      min="1"
                      max={paymentBalance}
                      value={selectedAmount === paymentBalance ? '' : selectedAmount}
                      onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount"
                      className="mt-2 rounded-[12px]"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setPaymentStep('form')}
                  disabled={selectedAmount <= 0}
                  className="w-full rounded-[14px]"
                >
                  Continue to Payment
                </Button>
              </>
            )}

            {paymentStep === 'form' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-on-surface">Payment Details</h2>
                  <button
                    onClick={resetPaymentModal}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    <IconX className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6 rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                  <p className="text-[12px] text-on-surface-variant">Amount to Pay</p>
                  <p className="mt-1 font-mono text-3xl font-bold text-primary">${selectedAmount.toFixed(2)}</p>
                </div>

                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Full Name</label>
                    <Input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      className="rounded-[12px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={cardData.email}
                      onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                      className="rounded-[12px]"
                    />
                  </div>

                  <div className="rounded-[14px] border border-border-subtle p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <IconLock className="h-4 w-4 text-primary" />
                      <p className="font-mono text-[12px] font-semibold text-primary">Secure Stripe Payment</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[12px] font-semibold text-on-surface-variant mb-2">Card Number</label>
                        <Input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                          maxLength={16}
                          className="rounded-[10px] text-sm font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[12px] font-semibold text-on-surface-variant mb-2">Expiry (MM/YY)</label>
                          <Input
                            type="text"
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setCardData({ ...cardData, expiry: value });
                            }}
                            maxLength={5}
                            className="rounded-[10px] text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[12px] font-semibold text-on-surface-variant mb-2">CVC</label>
                          <Input
                            type="text"
                            placeholder="123"
                            value={cardData.cvc}
                            onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                            maxLength={3}
                            className="rounded-[10px] text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {processingError && (
                    <div className="flex items-start gap-3 rounded-[12px] border border-error/30 bg-error/10 p-3">
                      <IconAlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-error" />
                      <p className="text-sm text-error">{processingError}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setPaymentStep('select')}
                    className="flex-1 rounded-[12px]"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleFormSubmit}
                    className="flex-1 rounded-[12px]"
                  >
                    Pay ${selectedAmount.toFixed(2)}
                  </Button>
                </div>
              </>
            )}

            {paymentStep === 'processing' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-surface-container border-t-primary" />
                </div>
                <p className="text-center font-semibold text-on-surface">Processing your payment...</p>
                <p className="text-center text-sm text-on-surface-variant">Please wait while we securely process your payment with Stripe.</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <IconCheck className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-center text-xl font-bold text-on-surface">Payment Successful!</h3>
                <p className="text-center text-sm text-on-surface-variant">
                  Your payment of ${selectedAmount.toFixed(2)} has been processed successfully.
                </p>
                <div className="w-full rounded-[12px] border border-success/30 bg-success/10 p-4">
                  <p className="text-[12px] font-mono text-on-surface-variant">Transaction ID</p>
                  <p className="mt-1 font-mono font-bold text-success">#TXN_{Math.random().toString(36).slice(2, 10).toUpperCase()}</p>
                </div>
                <Button
                  onClick={resetPaymentModal}
                  className="w-full rounded-[12px]"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </StudentShell>
  );
}
