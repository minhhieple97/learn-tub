import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { routes } from "@/routes";
import {
  getProfileByUserId,
  getProfileInSession,
  getUserInSession,
} from "@/features/profile/queries";

export const checkAuth = cache(async () => {
  const user = await getUserInSession();
  if (!user) {
    redirect(routes.login);
  }
  return user;
});

export const checkProfile = cache(async () => {
  const profile = await getProfileInSession();
  if (!profile) {
    redirect(routes.login);
  }
  return profile;
});

export const checkProfileByUserId = async (userId: string) => {
  const profile = await getProfileByUserId(userId);
  if (!profile) {
    redirect(routes.login);
  }
  return profile;
};
