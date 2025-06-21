import { CacheClient } from "./cache-client";
import { getUserTotalCredits } from "@/features/payments/queries/credit-buckets";
import { getUserActiveSubscription } from "@/features/payments/queries/user-subscriptions";
import { getUserInSession } from "@/features/profile/queries";
import { IUserProfile } from "@/features/auth/types";

export class CacheService {
  static async warmUserCache(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const [userResult, creditsResult, subscriptionResult] =
        await Promise.allSettled([
          getUserInSession(),
          getUserTotalCredits(userId),
          getUserActiveSubscription(userId),
        ]);

      let user = null;
      if (userResult.status === "fulfilled") {
        user = userResult.value;
      }

      let credits = 0;
      if (creditsResult.status === "fulfilled") {
        credits = creditsResult.value.totalCredits;
      }

      let subscription = null;
      if (subscriptionResult.status === "fulfilled") {
        subscription = subscriptionResult.value;
      }

      if (user) {
        const profile: IUserProfile = {
          ...user,
          credits,
        };

        await CacheClient.warmUserCache(userId, profile, credits, subscription);
      }

      return { success: true };
    } catch (error) {
      console.error("Cache warming failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async invalidateUserCache(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await CacheClient.invalidateUserCache(userId);
      return { success: true };
    } catch (error) {
      console.error("Cache invalidation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async warmSubscriptionPlansCache(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data: plans, error } = await supabase
        .from("subscription_plans")
        .select(
          "id, name, stripe_product_id, stripe_price_id, price_cents, credits_per_month",
        )
        .eq("is_active", true)
        .order("price_cents", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch subscription plans: ${error.message}`);
      }

      const response = { plans: plans || [] };
      await CacheClient.setSubscriptionPlans(response);

      return { success: true };
    } catch (error) {
      console.error("Subscription plans cache warming failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Smart cache refresh - only refresh if cache is about to expire
   */
  static async smartRefreshUserCache(userId: string): Promise<{
    refreshed: boolean;
    error?: string;
  }> {
    try {
      // Check if cache exists
      const [cachedProfile, cachedCredits, cachedSubscription] =
        await Promise.all([
          CacheClient.getUserProfile(userId),
          CacheClient.getUserCredits(userId),
          CacheClient.getUserSubscription(userId),
        ]);

      // If any cache is missing, refresh all
      if (!cachedProfile || cachedCredits === null || !cachedSubscription) {
        const warmResult = await this.warmUserCache(userId);
        return { refreshed: warmResult.success, error: warmResult.error };
      }

      return { refreshed: false };
    } catch (error) {
      console.error("Smart cache refresh failed:", error);
      return {
        refreshed: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Background cache maintenance - clean up expired keys
   */
  static async performCacheMaintenance(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // This could be extended to include cleanup operations
      // For now, we'll just refresh subscription plans cache
      await this.warmSubscriptionPlansCache();

      return { success: true };
    } catch (error) {
      console.error("Cache maintenance failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
