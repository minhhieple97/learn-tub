create type "public"."transaction_type_enum" as enum ('monthly_reset', 'purchase', 'evaluate_note', 'generate_quizz_questions', 'evaluate_quizz_answers', 'refund', 'bonus', 'subscription_grant', 'admin_adjustment');

alter table "public"."credit_transactions" alter column "type" set data type transaction_type_enum using "type"::transaction_type_enum;

alter table "public"."user_credits" drop column "credits_available";

alter table "public"."user_credits" drop column "last_reset_date";

alter table "public"."user_credits" add column "credits_purchase" integer default 0;

alter table "public"."user_credits" add column "credits_subscription" integer not null default 0;

alter table "public"."user_credits" add column "last_reset_purchase_date" date;

alter table "public"."user_credits" add column "last_reset_subscription_date" date default CURRENT_DATE;

CREATE INDEX idx_credit_transactions_type ON public.credit_transactions USING btree (type);

CREATE INDEX idx_user_credits_last_reset_purchase ON public.user_credits USING btree (last_reset_purchase_date);

CREATE INDEX idx_user_credits_last_reset_subscription ON public.user_credits USING btree (last_reset_subscription_date);

CREATE INDEX idx_user_credits_purchase ON public.user_credits USING btree (credits_purchase);

CREATE INDEX idx_user_credits_subscription ON public.user_credits USING btree (credits_subscription);

alter table "public"."user_credits" add constraint "chk_credits_purchase_non_negative" CHECK ((credits_purchase >= 0)) not valid;

alter table "public"."user_credits" validate constraint "chk_credits_purchase_non_negative";

alter table "public"."user_credits" add constraint "chk_credits_subscription_non_negative" CHECK ((credits_subscription >= 0)) not valid;

alter table "public"."user_credits" validate constraint "chk_credits_subscription_non_negative";


