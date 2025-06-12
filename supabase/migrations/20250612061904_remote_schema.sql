create table "public"."ai_usage_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "command" text not null,
    "provider" text not null,
    "model" text not null,
    "status" text not null,
    "tokens_used" integer,
    "input_tokens" integer,
    "output_tokens" integer,
    "cost_usd" numeric(10,6) default NULL::numeric,
    "request_duration_ms" integer,
    "error_message" text,
    "request_payload" jsonb,
    "response_payload" jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."ai_usage_logs" enable row level security;

CREATE UNIQUE INDEX ai_usage_logs_pkey ON public.ai_usage_logs USING btree (id);

CREATE INDEX idx_ai_usage_logs_analytics ON public.ai_usage_logs USING btree (user_id, provider, model, command, status, created_at DESC);

CREATE INDEX idx_ai_usage_logs_command ON public.ai_usage_logs USING btree (command);

CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs USING btree (created_at DESC);

CREATE INDEX idx_ai_usage_logs_model ON public.ai_usage_logs USING btree (model);

CREATE INDEX idx_ai_usage_logs_provider ON public.ai_usage_logs USING btree (provider);

CREATE INDEX idx_ai_usage_logs_status ON public.ai_usage_logs USING btree (status);

CREATE INDEX idx_ai_usage_logs_user_created ON public.ai_usage_logs USING btree (user_id, created_at DESC);

CREATE INDEX idx_ai_usage_logs_user_id ON public.ai_usage_logs USING btree (user_id);

alter table "public"."ai_usage_logs" add constraint "ai_usage_logs_pkey" PRIMARY KEY using index "ai_usage_logs_pkey";

alter table "public"."ai_usage_logs" add constraint "ai_usage_logs_status_check" CHECK ((status = ANY (ARRAY['success'::text, 'error'::text]))) not valid;

alter table "public"."ai_usage_logs" validate constraint "ai_usage_logs_status_check";

alter table "public"."ai_usage_logs" add constraint "ai_usage_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."ai_usage_logs" validate constraint "ai_usage_logs_user_id_fkey";

grant delete on table "public"."ai_usage_logs" to "anon";

grant insert on table "public"."ai_usage_logs" to "anon";

grant references on table "public"."ai_usage_logs" to "anon";

grant select on table "public"."ai_usage_logs" to "anon";

grant trigger on table "public"."ai_usage_logs" to "anon";

grant truncate on table "public"."ai_usage_logs" to "anon";

grant update on table "public"."ai_usage_logs" to "anon";

grant delete on table "public"."ai_usage_logs" to "authenticated";

grant insert on table "public"."ai_usage_logs" to "authenticated";

grant references on table "public"."ai_usage_logs" to "authenticated";

grant select on table "public"."ai_usage_logs" to "authenticated";

grant trigger on table "public"."ai_usage_logs" to "authenticated";

grant truncate on table "public"."ai_usage_logs" to "authenticated";

grant update on table "public"."ai_usage_logs" to "authenticated";

grant delete on table "public"."ai_usage_logs" to "service_role";

grant insert on table "public"."ai_usage_logs" to "service_role";

grant references on table "public"."ai_usage_logs" to "service_role";

grant select on table "public"."ai_usage_logs" to "service_role";

grant trigger on table "public"."ai_usage_logs" to "service_role";

grant truncate on table "public"."ai_usage_logs" to "service_role";

grant update on table "public"."ai_usage_logs" to "service_role";

create policy "Users can insert their own AI usage logs"
on "public"."ai_usage_logs"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view their own AI usage logs"
on "public"."ai_usage_logs"
as permissive
for select
to public
using ((auth.uid() = user_id));



