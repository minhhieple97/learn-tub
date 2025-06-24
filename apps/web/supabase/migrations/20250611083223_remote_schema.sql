alter table "public"."videos" add column "tutorial" text;

CREATE INDEX idx_videos_tutorial ON public.videos USING btree (tutorial) WHERE (tutorial IS NOT NULL);


