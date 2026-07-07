import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { CohortsConfigService } from './cohorts-config.service';
import { LearningResourcesConfigService } from './learning-resources-config.service';

type EnrollmentPricing = {
  cohortId: string;
  cohortName: string;
  amount: number;
};

@Injectable()
export class StripePaymentsService {
  private stripeClient: Stripe | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly cohortsConfigService: CohortsConfigService,
    private readonly learningResourcesConfigService: LearningResourcesConfigService,
  ) {}

  getEnrollmentPricing(cohortId: string): EnrollmentPricing {
    const normalizedCohortId = cohortId.trim();
    const cohort = this.cohortsConfigService.findCohort(normalizedCohortId);

    if (!cohort) {
      throw new BadRequestException(`Cohort "${normalizedCohortId}" was not found.`);
    }

    if (!cohort.isOpen) {
      throw new BadRequestException(`Cohort "${cohort.name}" is not open for registration.`);
    }

    const modulesById = new Map(
      this.learningResourcesConfigService.getConfig().modules.map((module) => [module.id, module]),
    );
    const amount = cohort.moduleIds.reduce((sum, moduleId) => {
      const module = modulesById.get(moduleId);
      return sum + Math.max(0, module?.moduleFee ?? 0);
    }, 0);

    return {
      cohortId: cohort.id,
      cohortName: cohort.name,
      amount,
    };
  }

  async createEnrollmentPaymentIntent(studentId: string, cohortId: string) {
    const pricing = this.getEnrollmentPricing(cohortId);

    if (pricing.amount <= 0) {
      throw new BadRequestException('This cohort does not require payment.');
    }

    const stripe = this.getStripeClient();
    const publishableKey = this.getPublishableKey();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: this.toMinorUnit(pricing.amount),
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        studentId,
        cohortId: pricing.cohortId,
        cohortName: pricing.cohortName,
        purpose: 'cohort_enrollment',
      },
    });

    if (!paymentIntent.client_secret) {
      throw new InternalServerErrorException('Stripe did not return a client secret for the enrollment payment.');
    }

    return {
      cohortId: pricing.cohortId,
      cohortName: pricing.cohortName,
      amount: pricing.amount,
      currency: 'usd',
      clientSecret: paymentIntent.client_secret,
      publishableKey,
    };
  }

  async verifyEnrollmentPayment(studentId: string, cohortId: string, paymentIntentId: string) {
    if (!paymentIntentId.trim()) {
      throw new BadRequestException('A paymentIntentId is required for paid enrollments.');
    }

    const pricing = this.getEnrollmentPricing(cohortId);
    const stripe = this.getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId.trim());

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment has not completed successfully yet.');
    }

    if (paymentIntent.metadata.studentId !== studentId) {
      throw new BadRequestException('This payment does not belong to the current student.');
    }

    if (paymentIntent.metadata.cohortId !== pricing.cohortId) {
      throw new BadRequestException('This payment does not match the selected cohort.');
    }

    const expectedAmount = this.toMinorUnit(pricing.amount);
    if ((paymentIntent.amount_received || paymentIntent.amount) < expectedAmount) {
      throw new BadRequestException('The paid amount does not cover the required enrollment fee.');
    }

    return {
      cohortId: pricing.cohortId,
      cohortName: pricing.cohortName,
      amount: pricing.amount,
      paymentIntentId: paymentIntent.id,
      methodLabel: this.describePaymentMethod(paymentIntent),
    };
  }

  private getPublishableKey() {
    const key = this.configService.get<string>('STRIPE_PUBLISHABLE_KEY')?.trim();
    if (!key) {
      throw new InternalServerErrorException('Stripe publishable key is not configured.');
    }
    return key;
  }

  private getStripeClient() {
    if (this.stripeClient) {
      return this.stripeClient;
    }

    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY')?.trim();
    if (!secretKey) {
      throw new InternalServerErrorException('Stripe secret key is not configured.');
    }

    this.stripeClient = new Stripe(secretKey);
    return this.stripeClient;
  }

  private toMinorUnit(amount: number) {
    return Math.round(amount * 100);
  }

  private describePaymentMethod(paymentIntent: Stripe.PaymentIntent) {
    const type = paymentIntent.payment_method_types[0] ?? 'card';
    const suffix = paymentIntent.id.slice(-6).toUpperCase();
    return `Stripe ${type} (${suffix})`;
  }
}
