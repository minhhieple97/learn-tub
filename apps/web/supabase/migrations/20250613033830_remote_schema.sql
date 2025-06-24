drop index if exists "public"."idx_ai_usage_logs_model";

drop index if exists "public"."idx_ai_usage_logs_provider";

drop index if exists "public"."idx_ai_usage_logs_analytics";

alter table "public"."ai_usage_logs" drop column "model";

alter table "public"."ai_usage_logs" drop column "provider";

alter table "public"."ai_usage_logs" add column "provider_id" uuid;

alter table "public"."note_interactions" add column "ai_model_id" uuid;

CREATE INDEX idx_ai_usage_logs_provider_id ON public.ai_usage_logs USING btree (provider_id);

CREATE INDEX idx_ai_usage_logs_analytics ON public.ai_usage_logs USING btree (user_id, provider_id, command, status, created_at DESC);

alter table "public"."ai_usage_logs" add constraint "ai_usage_logs_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES ai_model_pricing(id) ON DELETE RESTRICT not valid;

alter table "public"."ai_usage_logs" validate constraint "ai_usage_logs_provider_id_fkey";

alter table "public"."note_interactions" add constraint "note_interactions_ai_model_id_fkey" FOREIGN KEY (ai_model_id) REFERENCES ai_model_pricing(id) not valid;

alter table "public"."note_interactions" validate constraint "note_interactions_ai_model_id_fkey";


