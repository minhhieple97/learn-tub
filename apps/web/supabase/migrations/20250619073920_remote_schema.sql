create type "public"."subscription_status" as enum ('active', 'exhausted', 'expired', 'cancelled');

alter table "public"."user_subscriptions" alter column "status" drop default;

alter table "public"."user_subscriptions" alter column "status" set data type subscription_status using "status"::subscription_status;


