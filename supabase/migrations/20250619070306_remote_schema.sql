create type "public"."credit_bucket_status_enum" as enum ('active', 'exhausted', 'expired', 'cancelled');

create type "public"."credit_source_type_enum" as enum ('subscription', 'purchase', 'bonus', 'gift', 'refund', 'admin_adjustment', 'referral_bonus', 'promotional', 'compensation');

drop trigger if exists "update_user_credits_updated_at" on "public"."user_credits";

revoke delete on table "public"."user_credits" from "anon";

revoke insert on table "public"."user_credits" from "anon";

revoke references on table "public"."user_credits" from "anon";

revoke select on table "public"."user_credits" from "anon";

revoke trigger on table "public"."user_credits" from "anon";

revoke truncate on table "public"."user_credits" from "anon";

revoke update on table "public"."user_credits" from "anon";

revoke delete on table "public"."user_credits" from "authenticated";

revoke insert on table "public"."user_credits" from "authenticated";

revoke references on table "public"."user_credits" from "authenticated";

revoke select on table "public"."user_credits" from "authenticated";

revoke trigger on table "public"."user_credits" from "authenticated";

revoke truncate on table "public"."user_credits" from "authenticated";

revoke update on table "public"."user_credits" from "authenticated";

revoke delete on table "public"."user_credits" from "service_role";

revoke insert on table "public"."user_credits" from "service_role";

revoke references on table "public"."user_credits" from "service_role";

revoke select on table "public"."user_credits" from "service_role";

revoke trigger on table "public"."user_credits" from "service_role";

revoke truncate on table "public"."user_credits" from "service_role";

revoke update on table "public"."user_credits" from "service_role";

alter table "public"."user_credits" drop constraint "chk_credits_purchase_non_negative";

alter table "public"."user_credits" drop constraint "chk_credits_subscription_non_negative";

alter table "public"."user_credits" drop constraint "user_credits_user_id_fkey";

alter table "public"."user_credits" drop constraint "user_credits_user_id_key";

alter table "public"."user_subscriptions" drop constraint "user_subscriptions_user_id_key";

alter table "public"."user_credits" drop constraint "user_credits_pkey";

drop index if exists "public"."idx_user_credits_last_reset_purchase";

drop index if exists "public"."idx_user_credits_last_reset_subscription";

drop index if exists "public"."idx_user_credits_purchase";

drop index if exists "public"."idx_user_credits_subscription";

drop index if exists "public"."idx_user_credits_user_id";

drop index if exists "public"."user_credits_pkey";

drop index if exists "public"."user_credits_user_id_key";

drop index if exists "public"."user_subscriptions_user_id_key";

drop table "public"."user_credits";

create table "public"."credit_buckets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "credits_total" integer not null,
    "credits_used" integer not null default 0,
    "credits_remaining" integer generated always as ((credits_total - credits_used)) stored,
    "source_type" credit_source_type_enum not null,
    "expires_at" timestamp with time zone,
    "status" credit_bucket_status_enum not null default 'active'::credit_bucket_status_enum,
    "description" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "user_subscription_id" uuid
);


CREATE UNIQUE INDEX credit_buckets_pkey ON public.credit_buckets USING btree (id);

alter table "public"."credit_buckets" add constraint "credit_buckets_pkey" PRIMARY KEY using index "credit_buckets_pkey";

alter table "public"."credit_buckets" add constraint "credit_buckets_credits_total_check" CHECK ((credits_total > 0)) not valid;

alter table "public"."credit_buckets" validate constraint "credit_buckets_credits_total_check";

alter table "public"."credit_buckets" add constraint "credit_buckets_credits_used_check" CHECK ((credits_used >= 0)) not valid;

alter table "public"."credit_buckets" validate constraint "credit_buckets_credits_used_check";

alter table "public"."credit_buckets" add constraint "credit_buckets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."credit_buckets" validate constraint "credit_buckets_user_id_fkey";

alter table "public"."credit_buckets" add constraint "credits_used_not_exceed_total" CHECK ((credits_used <= credits_total)) not valid;

alter table "public"."credit_buckets" validate constraint "credits_used_not_exceed_total";

alter table "public"."credit_buckets" add constraint "fk_user_subscription" FOREIGN KEY (user_subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL not valid;

alter table "public"."credit_buckets" validate constraint "fk_user_subscription";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  free_plan_id UUID := '207cd634-648a-44a3-982a-5605ef25fb7c'::UUID;
  free_plan_credits INTEGER;
  profile_id UUID;
  bucket_id UUID;
BEGIN
  -- First, create the profile record
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.created_at,
    NEW.created_at
  )
  RETURNING id INTO profile_id;

  -- Get the credits per month for the known free plan
  SELECT credits_per_month INTO free_plan_credits
  FROM public.subscription_plans
  WHERE id = free_plan_id AND is_active = true;

  -- If plan not found or not active, use default credits
  IF free_plan_credits IS NULL THEN
    free_plan_credits := 50; -- Default free credits
  END IF;

  -- Create initial credit bucket for subscription credits
  INSERT INTO public.credit_buckets (
    user_id,
    credits_total,
    credits_used,
    source_type,
    expires_at, -- Set to end of current month for subscription credits
    status,
    description,
    metadata
  ) VALUES (
    profile_id,
    free_plan_credits,
    0,
    'subscription',
    (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 second')::TIMESTAMPTZ, -- End of current month
    'active',
    'Initial free credits from Basic plan subscription',
    jsonb_build_object(
      'plan_id', free_plan_id,
      'plan_name', 'Basic',
      'billing_period', 'monthly',
      'granted_at', NOW()
    )
  )
  RETURNING id INTO bucket_id;

  -- Create initial credit transaction record
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    profile_id,
    free_plan_credits,
    'subscription_grant',
    'Initial free credits from Basic plan subscription'
  );

  -- Create default subscription (free plan)
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    profile_id,
    free_plan_id,
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user function: %', SQLERRM;
    RAISE;
END;
$function$
;

grant delete on table "public"."credit_buckets" to "anon";

grant insert on table "public"."credit_buckets" to "anon";

grant references on table "public"."credit_buckets" to "anon";

grant select on table "public"."credit_buckets" to "anon";

grant trigger on table "public"."credit_buckets" to "anon";

grant truncate on table "public"."credit_buckets" to "anon";

grant update on table "public"."credit_buckets" to "anon";

grant delete on table "public"."credit_buckets" to "authenticated";

grant insert on table "public"."credit_buckets" to "authenticated";

grant references on table "public"."credit_buckets" to "authenticated";

grant select on table "public"."credit_buckets" to "authenticated";

grant trigger on table "public"."credit_buckets" to "authenticated";

grant truncate on table "public"."credit_buckets" to "authenticated";

grant update on table "public"."credit_buckets" to "authenticated";

grant delete on table "public"."credit_buckets" to "service_role";

grant insert on table "public"."credit_buckets" to "service_role";

grant references on table "public"."credit_buckets" to "service_role";

grant select on table "public"."credit_buckets" to "service_role";

grant trigger on table "public"."credit_buckets" to "service_role";

grant truncate on table "public"."credit_buckets" to "service_role";

grant update on table "public"."credit_buckets" to "service_role";


