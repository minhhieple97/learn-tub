alter table "public"."quiz_sessions" drop column "ai_model";

alter table "public"."quiz_sessions" drop column "ai_provider";

alter table "public"."quiz_sessions" add column "ai_model_id" uuid;

alter table "public"."quiz_sessions" add constraint "quiz_sessions_ai_model_id_fkey" FOREIGN KEY (ai_model_id) REFERENCES ai_model_pricing(id) not valid;

alter table "public"."quiz_sessions" validate constraint "quiz_sessions_ai_model_id_fkey";


