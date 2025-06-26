import { USER_SUBSCRIPTION_STATUS } from "@/config/constants";

export const calculateDaysRemaining = (
  periodEndDate: string | null,
): number => {
  if (!periodEndDate) return 0;

  const now = new Date();
  const endDate = new Date(periodEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

export const isSubscriptionCancelled = (subscription: any): boolean => {
  return (
    subscription?.cancel_at_period_end === true &&
    subscription?.status === USER_SUBSCRIPTION_STATUS.ACTIVE
  );
};

export const isSubscriptionPeriodValid = (subscription: any): boolean => {
  if (!subscription?.current_period_end) return false;

  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);

  return now < periodEnd;
};

export const getSubscriptionStatusText = (subscription: any): string => {
  if (!subscription) return "No subscription";

  if (isSubscriptionCancelled(subscription)) {
    const daysRemaining = calculateDaysRemaining(
      subscription.current_period_end,
    );
    return `Cancelled (expires in ${daysRemaining} days)`;
  }

  if (subscription.status === USER_SUBSCRIPTION_STATUS.ACTIVE) {
    return "Active";
  }

  return subscription.status;
};

export const formatSubscriptionEndDate = (
  periodEndDate: string | null,
): string => {
  if (!periodEndDate) return "Unknown";

  const endDate = new Date(periodEndDate);
  return endDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
