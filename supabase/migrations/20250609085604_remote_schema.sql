drop policy "Users can manage own AI interactions" on "public"."ai_interactions";

revoke delete on table "public"."ai_interactions" from "anon";

revoke insert on table "public"."ai_interactions" from "anon";

revoke references on table "public"."ai_interactions" from "anon";

revoke select on table "public"."ai_interactions" from "anon";

revoke trigger on table "public"."ai_interactions" from "anon";

revoke truncate on table "public"."ai_interactions" from "anon";

revoke update on table "public"."ai_interactions" from "anon";

revoke delete on table "public"."ai_interactions" from "authenticated";

revoke insert on table "public"."ai_interactions" from "authenticated";

revoke references on table "public"."ai_interactions" from "authenticated";

revoke select on table "public"."ai_interactions" from "authenticated";

revoke trigger on table "public"."ai_interactions" from "authenticated";

revoke truncate on table "public"."ai_interactions" from "authenticated";

revoke update on table "public"."ai_interactions" from "authenticated";

revoke delete on table "public"."ai_interactions" from "service_role";

revoke insert on table "public"."ai_interactions" from "service_role";

revoke references on table "public"."ai_interactions" from "service_role";

revoke select on table "public"."ai_interactions" from "service_role";

revoke trigger on table "public"."ai_interactions" from "service_role";

revoke truncate on table "public"."ai_interactions" from "service_role";

revoke update on table "public"."ai_interactions" from "service_role";

alter table "public"."ai_interactions" drop constraint "ai_interactions_note_id_fkey";

alter table "public"."ai_interactions" drop constraint "ai_interactions_user_id_fkey";

alter table "public"."ai_interactions" drop constraint "ai_interactions_pkey";

drop index if exists "public"."ai_interactions_pkey";

drop table "public"."ai_interactions";

create table "public"."note_interactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "note_id" uuid,
    "interaction_type" text not null,
    "input_data" jsonb,
    "output_data" jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."note_interactions" enable row level security;

CREATE UNIQUE INDEX ai_interactions_pkey ON public.note_interactions USING btree (id);

alter table "public"."note_interactions" add constraint "ai_interactions_pkey" PRIMARY KEY using index "ai_interactions_pkey";

alter table "public"."note_interactions" add constraint "ai_interactions_note_id_fkey" FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE not valid;

alter table "public"."note_interactions" validate constraint "ai_interactions_note_id_fkey";

alter table "public"."note_interactions" add constraint "ai_interactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."note_interactions" validate constraint "ai_interactions_user_id_fkey";

grant delete on table "public"."note_interactions" to "anon";

grant insert on table "public"."note_interactions" to "anon";

grant references on table "public"."note_interactions" to "anon";

grant select on table "public"."note_interactions" to "anon";

grant trigger on table "public"."note_interactions" to "anon";

grant truncate on table "public"."note_interactions" to "anon";

grant update on table "public"."note_interactions" to "anon";

grant delete on table "public"."note_interactions" to "authenticated";

grant insert on table "public"."note_interactions" to "authenticated";

grant references on table "public"."note_interactions" to "authenticated";

grant select on table "public"."note_interactions" to "authenticated";

grant trigger on table "public"."note_interactions" to "authenticated";

grant truncate on table "public"."note_interactions" to "authenticated";

grant update on table "public"."note_interactions" to "authenticated";

grant delete on table "public"."note_interactions" to "service_role";

grant insert on table "public"."note_interactions" to "service_role";

grant references on table "public"."note_interactions" to "service_role";

grant select on table "public"."note_interactions" to "service_role";

grant trigger on table "public"."note_interactions" to "service_role";

grant truncate on table "public"."note_interactions" to "service_role";

grant update on table "public"."note_interactions" to "service_role";

create policy "Users can manage own AI interactions"
on "public"."note_interactions"
as permissive
for all
to public
using ((auth.uid() = user_id));



