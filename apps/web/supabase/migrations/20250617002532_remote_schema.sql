create table "public"."credit_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "type" character varying(20) not null,
    "amount" integer not null,
    "description" text,
    "stripe_payment_intent_id" character varying(100),
    "related_action_id" uuid,
    "created_at" timestamp with time zone default now()
);


create table "public"."payment_history" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "stripe_payment_intent_id" character varying(100),
    "stripe_invoice_id" character varying(100),
    "amount_cents" integer not null,
    "currency" character varying(3) default 'usd'::character varying,
    "status" character varying(20) not null,
    "payment_type" character varying(20) not null,
    "description" text,
    "created_at" timestamp with time zone default now()
);


create table "public"."subscription_plans" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(50) not null,
    "stripe_product_id" character varying(100) not null,
    "stripe_price_id" character varying(100) not null,
    "price_cents" integer not null,
    "credits_per_month" integer not null,
    "features" jsonb,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."user_credits" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "credits_available" integer not null default 0,
    "credits_used_this_month" integer not null default 0,
    "last_reset_date" date default CURRENT_DATE,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."user_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "plan_id" uuid not null,
    "stripe_subscription_id" character varying(100),
    "stripe_customer_id" character varying(100),
    "status" character varying(20) not null default 'active'::character varying,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


CREATE UNIQUE INDEX credit_transactions_pkey ON public.credit_transactions USING btree (id);

CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions USING btree (created_at);

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions USING btree (user_id);

CREATE INDEX idx_payment_history_user_id ON public.payment_history USING btree (user_id);

CREATE INDEX idx_user_credits_user_id ON public.user_credits USING btree (user_id);

CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions USING btree (stripe_subscription_id);

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions USING btree (user_id);

CREATE UNIQUE INDEX payment_history_pkey ON public.payment_history USING btree (id);

CREATE UNIQUE INDEX payment_history_stripe_payment_intent_id_key ON public.payment_history USING btree (stripe_payment_intent_id);

CREATE UNIQUE INDEX subscription_plans_pkey ON public.subscription_plans USING btree (id);

CREATE UNIQUE INDEX subscription_plans_stripe_price_id_key ON public.subscription_plans USING btree (stripe_price_id);

CREATE UNIQUE INDEX subscription_plans_stripe_product_id_key ON public.subscription_plans USING btree (stripe_product_id);

CREATE UNIQUE INDEX user_credits_pkey ON public.user_credits USING btree (id);

CREATE UNIQUE INDEX user_credits_user_id_key ON public.user_credits USING btree (user_id);

CREATE UNIQUE INDEX user_subscriptions_pkey ON public.user_subscriptions USING btree (id);

CREATE UNIQUE INDEX user_subscriptions_stripe_subscription_id_key ON public.user_subscriptions USING btree (stripe_subscription_id);

CREATE UNIQUE INDEX user_subscriptions_user_id_key ON public.user_subscriptions USING btree (user_id);

alter table "public"."credit_transactions" add constraint "credit_transactions_pkey" PRIMARY KEY using index "credit_transactions_pkey";

alter table "public"."payment_history" add constraint "payment_history_pkey" PRIMARY KEY using index "payment_history_pkey";

alter table "public"."subscription_plans" add constraint "subscription_plans_pkey" PRIMARY KEY using index "subscription_plans_pkey";

alter table "public"."user_credits" add constraint "user_credits_pkey" PRIMARY KEY using index "user_credits_pkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_pkey" PRIMARY KEY using index "user_subscriptions_pkey";

alter table "public"."credit_transactions" add constraint "credit_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."credit_transactions" validate constraint "credit_transactions_user_id_fkey";

alter table "public"."payment_history" add constraint "payment_history_stripe_payment_intent_id_key" UNIQUE using index "payment_history_stripe_payment_intent_id_key";

alter table "public"."payment_history" add constraint "payment_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."payment_history" validate constraint "payment_history_user_id_fkey";

alter table "public"."subscription_plans" add constraint "subscription_plans_stripe_price_id_key" UNIQUE using index "subscription_plans_stripe_price_id_key";

alter table "public"."subscription_plans" add constraint "subscription_plans_stripe_product_id_key" UNIQUE using index "subscription_plans_stripe_product_id_key";

alter table "public"."user_credits" add constraint "user_credits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_credits" validate constraint "user_credits_user_id_fkey";

alter table "public"."user_credits" add constraint "user_credits_user_id_key" UNIQUE using index "user_credits_user_id_key";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_plan_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_stripe_subscription_id_key" UNIQUE using index "user_subscriptions_stripe_subscription_id_key";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_user_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_key" UNIQUE using index "user_subscriptions_user_id_key";

grant delete on table "public"."credit_transactions" to "anon";

grant insert on table "public"."credit_transactions" to "anon";

grant references on table "public"."credit_transactions" to "anon";

grant select on table "public"."credit_transactions" to "anon";

grant trigger on table "public"."credit_transactions" to "anon";

grant truncate on table "public"."credit_transactions" to "anon";

grant update on table "public"."credit_transactions" to "anon";

grant delete on table "public"."credit_transactions" to "authenticated";

grant insert on table "public"."credit_transactions" to "authenticated";

grant references on table "public"."credit_transactions" to "authenticated";

grant select on table "public"."credit_transactions" to "authenticated";

grant trigger on table "public"."credit_transactions" to "authenticated";

grant truncate on table "public"."credit_transactions" to "authenticated";

grant update on table "public"."credit_transactions" to "authenticated";

grant delete on table "public"."credit_transactions" to "service_role";

grant insert on table "public"."credit_transactions" to "service_role";

grant references on table "public"."credit_transactions" to "service_role";

grant select on table "public"."credit_transactions" to "service_role";

grant trigger on table "public"."credit_transactions" to "service_role";

grant truncate on table "public"."credit_transactions" to "service_role";

grant update on table "public"."credit_transactions" to "service_role";

grant delete on table "public"."payment_history" to "anon";

grant insert on table "public"."payment_history" to "anon";

grant references on table "public"."payment_history" to "anon";

grant select on table "public"."payment_history" to "anon";

grant trigger on table "public"."payment_history" to "anon";

grant truncate on table "public"."payment_history" to "anon";

grant update on table "public"."payment_history" to "anon";

grant delete on table "public"."payment_history" to "authenticated";

grant insert on table "public"."payment_history" to "authenticated";

grant references on table "public"."payment_history" to "authenticated";

grant select on table "public"."payment_history" to "authenticated";

grant trigger on table "public"."payment_history" to "authenticated";

grant truncate on table "public"."payment_history" to "authenticated";

grant update on table "public"."payment_history" to "authenticated";

grant delete on table "public"."payment_history" to "service_role";

grant insert on table "public"."payment_history" to "service_role";

grant references on table "public"."payment_history" to "service_role";

grant select on table "public"."payment_history" to "service_role";

grant trigger on table "public"."payment_history" to "service_role";

grant truncate on table "public"."payment_history" to "service_role";

grant update on table "public"."payment_history" to "service_role";

grant delete on table "public"."subscription_plans" to "anon";

grant insert on table "public"."subscription_plans" to "anon";

grant references on table "public"."subscription_plans" to "anon";

grant select on table "public"."subscription_plans" to "anon";

grant trigger on table "public"."subscription_plans" to "anon";

grant truncate on table "public"."subscription_plans" to "anon";

grant update on table "public"."subscription_plans" to "anon";

grant delete on table "public"."subscription_plans" to "authenticated";

grant insert on table "public"."subscription_plans" to "authenticated";

grant references on table "public"."subscription_plans" to "authenticated";

grant select on table "public"."subscription_plans" to "authenticated";

grant trigger on table "public"."subscription_plans" to "authenticated";

grant truncate on table "public"."subscription_plans" to "authenticated";

grant update on table "public"."subscription_plans" to "authenticated";

grant delete on table "public"."subscription_plans" to "service_role";

grant insert on table "public"."subscription_plans" to "service_role";

grant references on table "public"."subscription_plans" to "service_role";

grant select on table "public"."subscription_plans" to "service_role";

grant trigger on table "public"."subscription_plans" to "service_role";

grant truncate on table "public"."subscription_plans" to "service_role";

grant update on table "public"."subscription_plans" to "service_role";

grant delete on table "public"."user_credits" to "anon";

grant insert on table "public"."user_credits" to "anon";

grant references on table "public"."user_credits" to "anon";

grant select on table "public"."user_credits" to "anon";

grant trigger on table "public"."user_credits" to "anon";

grant truncate on table "public"."user_credits" to "anon";

grant update on table "public"."user_credits" to "anon";

grant delete on table "public"."user_credits" to "authenticated";

grant insert on table "public"."user_credits" to "authenticated";

grant references on table "public"."user_credits" to "authenticated";

grant select on table "public"."user_credits" to "authenticated";

grant trigger on table "public"."user_credits" to "authenticated";

grant truncate on table "public"."user_credits" to "authenticated";

grant update on table "public"."user_credits" to "authenticated";

grant delete on table "public"."user_credits" to "service_role";

grant insert on table "public"."user_credits" to "service_role";

grant references on table "public"."user_credits" to "service_role";

grant select on table "public"."user_credits" to "service_role";

grant trigger on table "public"."user_credits" to "service_role";

grant truncate on table "public"."user_credits" to "service_role";

grant update on table "public"."user_credits" to "service_role";

grant delete on table "public"."user_subscriptions" to "anon";

grant insert on table "public"."user_subscriptions" to "anon";

grant references on table "public"."user_subscriptions" to "anon";

grant select on table "public"."user_subscriptions" to "anon";

grant trigger on table "public"."user_subscriptions" to "anon";

grant truncate on table "public"."user_subscriptions" to "anon";

grant update on table "public"."user_subscriptions" to "anon";

grant delete on table "public"."user_subscriptions" to "authenticated";

grant insert on table "public"."user_subscriptions" to "authenticated";

grant references on table "public"."user_subscriptions" to "authenticated";

grant select on table "public"."user_subscriptions" to "authenticated";

grant trigger on table "public"."user_subscriptions" to "authenticated";

grant truncate on table "public"."user_subscriptions" to "authenticated";

grant update on table "public"."user_subscriptions" to "authenticated";

grant delete on table "public"."user_subscriptions" to "service_role";

grant insert on table "public"."user_subscriptions" to "service_role";

grant references on table "public"."user_subscriptions" to "service_role";

grant select on table "public"."user_subscriptions" to "service_role";

grant trigger on table "public"."user_subscriptions" to "service_role";

grant truncate on table "public"."user_subscriptions" to "service_role";

grant update on table "public"."user_subscriptions" to "service_role";

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


