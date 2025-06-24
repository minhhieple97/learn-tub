create table "public"."quiz_attempts" (
    "id" uuid not null default gen_random_uuid(),
    "quiz_session_id" uuid not null,
    "user_id" uuid not null,
    "answers" jsonb not null,
    "score" integer not null default 0,
    "total_questions" integer not null,
    "correct_answers" integer not null default 0,
    "feedback" jsonb,
    "time_taken_seconds" integer,
    "completed_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now()
);


alter table "public"."quiz_attempts" enable row level security;

create table "public"."quiz_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "video_id" uuid not null,
    "title" text not null,
    "difficulty" text not null,
    "question_count" integer not null default 10,
    "topics" text[] default '{}'::text[],
    "ai_provider" text not null,
    "ai_model" text not null,
    "questions" jsonb not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."quiz_sessions" enable row level security;

CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts USING btree (completed_at);

CREATE INDEX idx_quiz_attempts_quiz_session_id ON public.quiz_attempts USING btree (quiz_session_id);

CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts USING btree (user_id);

CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions USING btree (user_id);

CREATE INDEX idx_quiz_sessions_video_id ON public.quiz_sessions USING btree (video_id);

CREATE UNIQUE INDEX quiz_attempts_pkey ON public.quiz_attempts USING btree (id);

CREATE UNIQUE INDEX quiz_sessions_pkey ON public.quiz_sessions USING btree (id);

alter table "public"."quiz_attempts" add constraint "quiz_attempts_pkey" PRIMARY KEY using index "quiz_attempts_pkey";

alter table "public"."quiz_sessions" add constraint "quiz_sessions_pkey" PRIMARY KEY using index "quiz_sessions_pkey";

alter table "public"."quiz_attempts" add constraint "quiz_attempts_quiz_session_id_fkey" FOREIGN KEY (quiz_session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."quiz_attempts" validate constraint "quiz_attempts_quiz_session_id_fkey";

alter table "public"."quiz_attempts" add constraint "quiz_attempts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."quiz_attempts" validate constraint "quiz_attempts_user_id_fkey";

alter table "public"."quiz_sessions" add constraint "quiz_sessions_difficulty_check" CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text, 'mixed'::text]))) not valid;

alter table "public"."quiz_sessions" validate constraint "quiz_sessions_difficulty_check";

alter table "public"."quiz_sessions" add constraint "quiz_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."quiz_sessions" validate constraint "quiz_sessions_user_id_fkey";

alter table "public"."quiz_sessions" add constraint "quiz_sessions_video_id_fkey" FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE not valid;

alter table "public"."quiz_sessions" validate constraint "quiz_sessions_video_id_fkey";

grant delete on table "public"."quiz_attempts" to "anon";

grant insert on table "public"."quiz_attempts" to "anon";

grant references on table "public"."quiz_attempts" to "anon";

grant select on table "public"."quiz_attempts" to "anon";

grant trigger on table "public"."quiz_attempts" to "anon";

grant truncate on table "public"."quiz_attempts" to "anon";

grant update on table "public"."quiz_attempts" to "anon";

grant delete on table "public"."quiz_attempts" to "authenticated";

grant insert on table "public"."quiz_attempts" to "authenticated";

grant references on table "public"."quiz_attempts" to "authenticated";

grant select on table "public"."quiz_attempts" to "authenticated";

grant trigger on table "public"."quiz_attempts" to "authenticated";

grant truncate on table "public"."quiz_attempts" to "authenticated";

grant update on table "public"."quiz_attempts" to "authenticated";

grant delete on table "public"."quiz_attempts" to "service_role";

grant insert on table "public"."quiz_attempts" to "service_role";

grant references on table "public"."quiz_attempts" to "service_role";

grant select on table "public"."quiz_attempts" to "service_role";

grant trigger on table "public"."quiz_attempts" to "service_role";

grant truncate on table "public"."quiz_attempts" to "service_role";

grant update on table "public"."quiz_attempts" to "service_role";

grant delete on table "public"."quiz_sessions" to "anon";

grant insert on table "public"."quiz_sessions" to "anon";

grant references on table "public"."quiz_sessions" to "anon";

grant select on table "public"."quiz_sessions" to "anon";

grant trigger on table "public"."quiz_sessions" to "anon";

grant truncate on table "public"."quiz_sessions" to "anon";

grant update on table "public"."quiz_sessions" to "anon";

grant delete on table "public"."quiz_sessions" to "authenticated";

grant insert on table "public"."quiz_sessions" to "authenticated";

grant references on table "public"."quiz_sessions" to "authenticated";

grant select on table "public"."quiz_sessions" to "authenticated";

grant trigger on table "public"."quiz_sessions" to "authenticated";

grant truncate on table "public"."quiz_sessions" to "authenticated";

grant update on table "public"."quiz_sessions" to "authenticated";

grant delete on table "public"."quiz_sessions" to "service_role";

grant insert on table "public"."quiz_sessions" to "service_role";

grant references on table "public"."quiz_sessions" to "service_role";

grant select on table "public"."quiz_sessions" to "service_role";

grant trigger on table "public"."quiz_sessions" to "service_role";

grant truncate on table "public"."quiz_sessions" to "service_role";

grant update on table "public"."quiz_sessions" to "service_role";

create policy "Users can manage own quiz attempts"
on "public"."quiz_attempts"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage own quiz sessions"
on "public"."quiz_sessions"
as permissive
for all
to public
using ((auth.uid() = user_id));



