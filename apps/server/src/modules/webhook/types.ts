import { webhook_event_status, webhook_event_type } from '@prisma/client';

export type CreateWebhookEventData = {
  stripe_event_id: string;
  event_type: webhook_event_type;
  status: webhook_event_status;
  raw_payload: any;
  max_attempts: number;
  attempts: number;
};

export type CreateWebhookJobData = {
  webhook_event_id: string;
  job_id: string;
  queue_name: string;
  priority: number;
  delay_ms: number;
};

export type UpdateWebhookEventData = {
  status?: webhook_event_status;
  error_message?: string | null;
  attempts?: { increment: number } | number;
};
