import { CacheClient } from "@/lib/cache-client";

export async function invalidateUserCacheOnCreditChange(
  userId: string,
): Promise<void> {
  await Promise.all([
    CacheClient.invalidateUserCredits(userId),
    CacheClient.invalidateUserProfile(userId),
  ]);
}

export async function invalidateUserCacheOnSubscriptionChange(
  userId: string,
): Promise<void> {
  await Promise.all([
    CacheClient.invalidateUserSubscription(userId),
    CacheClient.invalidateUserProfile(userId),
  ]);
}

export async function invalidateMultipleUsersCacheOnCreditChange(
  userIds: string[],
): Promise<void> {
  const uniqueUserIds = [...new Set(userIds)];
  await Promise.all(
    uniqueUserIds.map((userId) => invalidateUserCacheOnCreditChange(userId)),
  );
}

export async function invalidateMultipleUsersCacheOnSubscriptionChange(
  userIds: string[],
): Promise<void> {
  const uniqueUserIds = [...new Set(userIds)];
  await Promise.all(
    uniqueUserIds.map((userId) =>
      invalidateUserCacheOnSubscriptionChange(userId),
    ),
  );
}

export async function invalidateAllUserCache(userId: string): Promise<void> {
  await CacheClient.invalidateUserCache(userId);
}

export async function invalidateUserCacheOnDeduction(
  userId: string,
): Promise<void> {
  await invalidateUserCacheOnCreditChange(userId);
}
