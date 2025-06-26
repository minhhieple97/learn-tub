import type { z } from "zod";
import type { ProfileSchema } from "./schemas";

export type ProfileFormData = z.infer<typeof ProfileSchema>;

export type ProfileUpdateData = {
  full_name?: string;
  avatar_url?: string;
};

export type AvatarUploadResult = {
  url: string | null;
  error?: string;
};

// Component types
export type ICurrentUserAvatarProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export type IManageBillingButtonProps = {
  onExecute: () => void;
  isPending: boolean;
};

export type INoSubscriptionCardProps = {
  onDialogOpenChange: (open: boolean) => void;
  isDialogOpen: boolean;
};

export type ISubscription = {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  subscription_plans: {
    id: string;
    name: string;
    price_cents: number;
    credits_per_month: number;
    stripe_price_id: string;
    stripe_product_id: string;
  };
};

export type ISubscriptionCardProps = {
  subscription: ISubscription;
  onExecuteBilling: () => void;
  isBillingPending: boolean;
};

export type ISubscriptionDatesProps = {
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean | null;
};
