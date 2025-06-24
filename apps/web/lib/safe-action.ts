import { getUserInSession } from "@/features/profile/queries";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

export class ActionError extends Error {}

export const action = createSafeActionClient({
  throwValidationErrors: false,
  defaultValidationErrorsShape: "flattened",
  handleServerError: (error) => {
    if (error instanceof ActionError) {
      return error.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authAction = action.use(async ({ next }) => {
  const user = await getUserInSession();
  if (!user) {
    throw new ActionError("Authentication failed");
  }
  return next({ ctx: { user } });
});
