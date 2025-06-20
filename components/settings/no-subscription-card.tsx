import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard } from "lucide-react";
import { PricingDialog } from "@/features/payments/components/pricing-dialog";

type NoSubscriptionCardProps = {
  onDialogOpenChange: (open: boolean) => void;
  isDialogOpen: boolean;
};

export function NoSubscriptionCard({
  onDialogOpenChange,
  isDialogOpen,
}: NoSubscriptionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Subscription Management
        </CardTitle>
        <CardDescription>
          You don&apos;t have an active subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-muted-foreground mb-4">
            Subscribe to a plan to unlock premium features and get monthly AI
            credits.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>Explore Plans</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <PricingDialog />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
