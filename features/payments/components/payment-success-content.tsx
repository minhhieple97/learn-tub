'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { routes } from '@/routes';
import { usePaymentDetails } from '../hooks/use-payment-detail';
import { IPaymentDetails } from '../types';

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { data: paymentDetails, isLoading, error } = usePaymentDetails(sessionId);

  if (isLoading) {
    return <PaymentSuccessLoading />;
  }

  if (error) {
    return <PaymentError error={error.message} />;
  }

  return <PaymentSuccessDetails paymentDetails={paymentDetails} />;
}

function PaymentSuccessLoading() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
          Payment Successful!
        </CardTitle>
        <CardDescription>Processing your payment details...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentError({ error }: { error: string }) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Error</CardTitle>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={routes.dashboard.root}>Return to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PaymentSuccessDetails({ paymentDetails }: { paymentDetails?: IPaymentDetails }) {
  if (!paymentDetails) return null;

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
          Payment Successful!
        </CardTitle>
        <CardDescription>Your payment has been processed successfully.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              {paymentDetails.paymentType === 'subscription' ? (
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              )}
              <div>
                <p className="font-medium">
                  {paymentDetails.paymentType === 'subscription'
                    ? paymentDetails.planName || 'Subscription Plan'
                    : `${paymentDetails.creditsAmount} AI Credits`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {paymentDetails.paymentType === 'subscription'
                    ? 'Monthly subscription'
                    : 'One-time purchase'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">${(paymentDetails.amount / 100).toFixed(2)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 uppercase">
                {paymentDetails.currency}
              </p>
            </div>
          </div>

          {paymentDetails.paymentType === 'subscription' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Your subscription is now active! You can manage your subscription in your account
                settings.
              </p>
            </div>
          )}

          {paymentDetails.paymentType === 'credits' && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {paymentDetails.creditsAmount} AI credits have been added to your account and are
                ready to use!
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <Link href={routes.learn}>Continue to Learning</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href={routes.settings.root}>Manage Account</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
