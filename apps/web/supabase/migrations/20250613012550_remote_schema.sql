create table "public"."ai_model_pricing" (
    "id" uuid not null default gen_random_uuid(),
    "provider_id" uuid not null,
    "model_name" text not null,
    "input_cost_per_million_tokens" numeric(10,6) not null,
    "output_cost_per_million_tokens" numeric(10,6) not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."ai_model_pricing" enable row level security;

create table "public"."ai_providers" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "display_name" text not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."ai_providers" enable row level security;

CREATE UNIQUE INDEX ai_model_pricing_pkey ON public.ai_model_pricing USING btree (id);

CREATE UNIQUE INDEX ai_model_pricing_provider_id_model_name_key ON public.ai_model_pricing USING btree (provider_id, model_name);

CREATE UNIQUE INDEX ai_providers_name_key ON public.ai_providers USING btree (name);

CREATE UNIQUE INDEX ai_providers_pkey ON public.ai_providers USING btree (id);

CREATE INDEX idx_ai_model_pricing_provider_model ON public.ai_model_pricing USING btree (provider_id, model_name);

CREATE INDEX idx_ai_providers_name ON public.ai_providers USING btree (name);

alter table "public"."ai_model_pricing" add constraint "ai_model_pricing_pkey" PRIMARY KEY using index "ai_model_pricing_pkey";

alter table "public"."ai_providers" add constraint "ai_providers_pkey" PRIMARY KEY using index "ai_providers_pkey";

alter table "public"."ai_model_pricing" add constraint "ai_model_pricing_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE not valid;

alter table "public"."ai_model_pricing" validate constraint "ai_model_pricing_provider_id_fkey";

alter table "public"."ai_model_pricing" add constraint "ai_model_pricing_provider_id_model_name_key" UNIQUE using index "ai_model_pricing_provider_id_model_name_key";

alter table "public"."ai_providers" add constraint "ai_providers_name_key" UNIQUE using index "ai_providers_name_key";

set check_function_bodies = off;

create or replace view "public"."ai_model_pricing_view" as  SELECT mp.id,
    p.name AS provider_name,
    p.display_name AS provider_display_name,
    mp.model_name,
    mp.input_cost_per_million_tokens,
    mp.output_cost_per_million_tokens,
    mp.is_active,
    mp.created_at,
    mp.updated_at
   FROM (ai_model_pricing mp
     JOIN ai_providers p ON ((p.id = mp.provider_id)));


CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."ai_model_pricing" to "anon";

grant insert on table "public"."ai_model_pricing" to "anon";

grant references on table "public"."ai_model_pricing" to "anon";

grant select on table "public"."ai_model_pricing" to "anon";

grant trigger on table "public"."ai_model_pricing" to "anon";

grant truncate on table "public"."ai_model_pricing" to "anon";

grant update on table "public"."ai_model_pricing" to "anon";

grant delete on table "public"."ai_model_pricing" to "authenticated";

grant insert on table "public"."ai_model_pricing" to "authenticated";

grant references on table "public"."ai_model_pricing" to "authenticated";

grant select on table "public"."ai_model_pricing" to "authenticated";

grant trigger on table "public"."ai_model_pricing" to "authenticated";

grant truncate on table "public"."ai_model_pricing" to "authenticated";

grant update on table "public"."ai_model_pricing" to "authenticated";

grant delete on table "public"."ai_model_pricing" to "service_role";

grant insert on table "public"."ai_model_pricing" to "service_role";

grant references on table "public"."ai_model_pricing" to "service_role";

grant select on table "public"."ai_model_pricing" to "service_role";

grant trigger on table "public"."ai_model_pricing" to "service_role";

grant truncate on table "public"."ai_model_pricing" to "service_role";

grant update on table "public"."ai_model_pricing" to "service_role";

grant delete on table "public"."ai_providers" to "anon";

grant insert on table "public"."ai_providers" to "anon";

grant references on table "public"."ai_providers" to "anon";

grant select on table "public"."ai_providers" to "anon";

grant trigger on table "public"."ai_providers" to "anon";

grant truncate on table "public"."ai_providers" to "anon";

grant update on table "public"."ai_providers" to "anon";

grant delete on table "public"."ai_providers" to "authenticated";

grant insert on table "public"."ai_providers" to "authenticated";

grant references on table "public"."ai_providers" to "authenticated";

grant select on table "public"."ai_providers" to "authenticated";

grant trigger on table "public"."ai_providers" to "authenticated";

grant truncate on table "public"."ai_providers" to "authenticated";

grant update on table "public"."ai_providers" to "authenticated";

grant delete on table "public"."ai_providers" to "service_role";

grant insert on table "public"."ai_providers" to "service_role";

grant references on table "public"."ai_providers" to "service_role";

grant select on table "public"."ai_providers" to "service_role";

grant trigger on table "public"."ai_providers" to "service_role";

grant truncate on table "public"."ai_providers" to "service_role";

grant update on table "public"."ai_providers" to "service_role";

create policy "Allow full access to model pricing for service role"
on "public"."ai_model_pricing"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Allow read access to model pricing"
on "public"."ai_model_pricing"
as permissive
for select
to authenticated
using (true);


create policy "Allow full access to providers for service role"
on "public"."ai_providers"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Allow read access to providers"
on "public"."ai_providers"
as permissive
for select
to authenticated
using (true);


CREATE TRIGGER update_ai_model_pricing_updated_at BEFORE UPDATE ON public.ai_model_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON public.ai_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


