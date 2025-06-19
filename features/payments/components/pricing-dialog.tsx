'use client';

import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PricingSection } from './pricing-section';



export function PricingDialog() {
  return (
    <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-lg pt-4">
      <DialogHeader className="px-6 pt-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
          Plans & Pricing
        </DialogTitle>
      </DialogHeader>

      <div className="pt-4 pb-6">
        <PricingSection compact />
      </div>
    </div>
  );
}
