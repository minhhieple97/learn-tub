import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type ManageBillingButtonProps = {
  onExecute: () => void;
  isPending: boolean;
};

export function ManageBillingButton({
  onExecute,
  isPending,
}: ManageBillingButtonProps) {
  return (
    <Button onClick={onExecute} disabled={isPending} className="w-auto">
      {isPending ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          Opening...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Manage Billing
        </div>
      )}
    </Button>
  );
}
