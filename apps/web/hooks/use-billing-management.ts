import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { manageBillingAction } from "@/features/payments/actions";

export function useBillingManagement() {
  const { execute, isPending } = useAction(manageBillingAction, {
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    execute,
    isPending,
  };
}
