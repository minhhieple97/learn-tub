"use client";

import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { routes } from "@/routes";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const creditsCanceled = searchParams.get("credits_canceled");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              Payment Canceled
            </CardTitle>
            <CardDescription>
              {creditsCanceled
                ? "Your credit purchase was canceled. No charges were made to your account."
                : "Your payment was canceled. No charges were made to your account."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    What happened?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    You chose to cancel the payment process. Your payment method
                    was not charged, and no changes were made to your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link
                  href={routes.dashboard.root}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Dashboard
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href={routes.settings.root}>View Pricing Plans</Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need help?{" "}
                <Link
                  href="/support"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Contact our support team
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
