import { Calendar } from 'lucide-react';
import type { ISubscriptionDatesProps } from '../types';

export const SubscriptionDates = ({
  currentPeriodStart,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: ISubscriptionDatesProps) => {
  return (
    <div className="space-y-3">
      {currentPeriodStart && (
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Subscribe Date</p>
            <p className="font-medium">{new Date(currentPeriodStart).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {currentPeriodEnd && (
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">
              {cancelAtPeriodEnd ? 'Expires' : 'Renews'}
            </p>
            <p className="font-medium">{new Date(currentPeriodEnd).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};
