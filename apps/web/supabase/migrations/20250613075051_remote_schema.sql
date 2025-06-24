alter table "public"."ai_usage_logs" drop constraint "ai_usage_logs_provider_id_fkey";

drop index if exists "public"."idx_ai_usage_logs_analytics";

drop index if exists "public"."idx_ai_usage_logs_provider_id";

alter table "public"."ai_usage_logs" drop column "provider_id";

alter table "public"."ai_usage_logs" add column "ai_model_id" uuid;

CREATE INDEX idx_ai_usage_logs_ai_model_id ON public.ai_usage_logs USING btree (ai_model_id);

alter table "public"."ai_usage_logs" add constraint "ai_usage_logs_ai_model_id_fkey" FOREIGN KEY (ai_model_id) REFERENCES ai_model_pricing(id) ON DELETE SET NULL not valid;

alter table "public"."ai_usage_logs" validate constraint "ai_usage_logs_ai_model_id_fkey";


