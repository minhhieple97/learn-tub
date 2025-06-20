alter type "public"."credit_source_type_enum" rename to "credit_source_type_enum__old_version_to_be_dropped";

create type "public"."credit_source_type_enum" as enum ('subscription', 'purchase', 'bonus', 'gift', 'refund', 'admin_adjustment', 'referral_bonus', 'promotional', 'compensation', 'cancelled_plan');

alter table "public"."credit_buckets" alter column source_type type "public"."credit_source_type_enum" using source_type::text::"public"."credit_source_type_enum";

drop type "public"."credit_source_type_enum__old_version_to_be_dropped";


