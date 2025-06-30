import { createClient } from "@/lib/supabase/server";
import { WEBHOOK_EVENT_STATUS } from "../constants";
import type { IWebhookEventType, IWebhookEventStatus } from "../types";
import { Tables, TablesInsert, TablesUpdate } from "@/database.types";

type WebhookEventRow = Tables<"webhook_events">;
type WebhookEventInsert = TablesInsert<"webhook_events">;
type WebhookEventUpdate = TablesUpdate<"webhook_events">;

type WebhookJobRow = Tables<"webhook_jobs">;
type WebhookJobInsert = TablesInsert<"webhook_jobs">;

export async function createWebhookEvent(
  stripeEventId: string,
  eventType: IWebhookEventType,
  payload: any,
): Promise<{ data: WebhookEventRow | null; error: any }> {
  const supabase = await createClient();

  const eventData: WebhookEventInsert = {
    stripe_event_id: stripeEventId,
    event_type: eventType,
    status: WEBHOOK_EVENT_STATUS.PENDING as IWebhookEventStatus,
    raw_payload: payload,
    attempts: 0,
    max_attempts: 3,
  };

  const { data, error } = await supabase
    .from("webhook_events")
    .insert(eventData)
    .select()
    .single();

  if (error) {
    console.error("Failed to create webhook event:", error);
  }

  return { data, error };
}

export async function getWebhookEventByStripeId(
  stripeEventId: string,
): Promise<{ data: WebhookEventRow | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("webhook_events")
    .select("*")
    .eq("stripe_event_id", stripeEventId)
    .single();

  return { data, error };
}

export async function updateWebhookEventStatus(
  eventId: string,
  status: IWebhookEventStatus,
  errorMessage?: string,
  incrementAttempts = false,
): Promise<{ data: WebhookEventRow | null; error: any }> {
  const supabase = await createClient();

  const updateData: WebhookEventUpdate = {
    status,
    error_message: errorMessage || null,
    processed_at:
      status === WEBHOOK_EVENT_STATUS.COMPLETED
        ? new Date().toISOString()
        : null,
  };

  if (incrementAttempts) {
    const { data: currentEvent } = await supabase
      .from("webhook_events")
      .select("attempts")
      .eq("id", eventId)
      .single();

    if (currentEvent) {
      updateData.attempts = (currentEvent.attempts || 0) + 1;
    }
  }

  const { data, error } = await supabase
    .from("webhook_events")
    .update(updateData)
    .eq("id", eventId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update webhook event status:", error);
  }

  return { data, error };
}

export async function createWebhookJob(
  webhookEventId: string,
  queueName: string,
  priority = 0,
  delayMs = 0,
): Promise<{ data: WebhookJobRow | null; error: any }> {
  const supabase = await createClient();

  const jobData: WebhookJobInsert = {
    webhook_event_id: webhookEventId,
    queue_name: queueName,
    priority,
    delay_ms: delayMs,
  };

  const { data, error } = await supabase.from('webhook_jobs').insert(jobData).select().single();

  if (error) {
    console.error('Failed to create webhook job:', error);
  }

  return { data, error };
}

export async function getWebhookEventsByStatus(
  status: IWebhookEventStatus,
  limit = 100,
): Promise<{ data: WebhookEventRow[] | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("webhook_events")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: true })
    .limit(limit);

  return { data, error };
}

export async function getRetryableWebhookEvents(
  limit = 50,
): Promise<{ data: WebhookEventRow[] | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("webhook_events")
    .select("*")
    .eq("status", WEBHOOK_EVENT_STATUS.FAILED)
    .lt("attempts", 3) // Only events that haven't exceeded max attempts
    .order("created_at", { ascending: true })
    .limit(limit);

  return { data, error };
}

export async function getWebhookEventStats(): Promise<{
  data: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  } | null;
  error: any;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("webhook_events")
    .select("status")
    .then(async (result) => {
      if (result.error) return result;

      const stats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: result.data?.length || 0,
      };

      result.data?.forEach((event) => {
        switch (event.status) {
          case WEBHOOK_EVENT_STATUS.PENDING:
            stats.pending++;
            break;
          case WEBHOOK_EVENT_STATUS.PROCESSING:
            stats.processing++;
            break;
          case WEBHOOK_EVENT_STATUS.COMPLETED:
            stats.completed++;
            break;
          case WEBHOOK_EVENT_STATUS.FAILED:
            stats.failed++;
            break;
        }
      });

      return { data: stats, error: null };
    });

  return { data, error };
}

export async function cleanupOldWebhookEvents(
  olderThanDays = 30,
): Promise<{ deletedCount: number; error: any }> {
  const supabase = await createClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const { error, count } = await supabase
    .from("webhook_events")
    .delete({ count: "exact" })
    .lt("created_at", cutoffDate.toISOString())
    .eq("status", WEBHOOK_EVENT_STATUS.COMPLETED);

  if (error) {
    console.error("Failed to cleanup old webhook events:", error);
    return { deletedCount: 0, error };
  }

  return { deletedCount: count || 0, error: null };
}

export async function isWebhookEventProcessed(
  stripeEventId: string,
): Promise<{ processed: boolean; event: WebhookEventRow | null; error: any }> {
  const { data: event, error } = await getWebhookEventByStripeId(stripeEventId);

  if (error) {
    if (error.code === "PGRST116") {
      return { processed: false, event: null, error: null };
    }
    return { processed: false, event: null, error };
  }

  const processed = event?.status === WEBHOOK_EVENT_STATUS.COMPLETED;
  return { processed, event, error: null };
}

export async function markWebhookEventAsProcessing(
  eventId: string,
): Promise<{ data: WebhookEventRow | null; error: any }> {
  return updateWebhookEventStatus(eventId, WEBHOOK_EVENT_STATUS.PROCESSING);
}

export async function markWebhookEventAsCompleted(
  eventId: string,
): Promise<{ data: WebhookEventRow | null; error: any }> {
  return updateWebhookEventStatus(eventId, WEBHOOK_EVENT_STATUS.COMPLETED);
}

export async function markWebhookEventAsFailed(
  eventId: string,
  errorMessage: string,
  incrementAttempts = true,
): Promise<{ data: WebhookEventRow | null; error: any }> {
  return updateWebhookEventStatus(
    eventId,
    WEBHOOK_EVENT_STATUS.FAILED,
    errorMessage,
    incrementAttempts,
  );
}
