CREATE TABLE "track" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playlist_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"artist" text NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"note" text
);
--> statement-breakpoint
ALTER TABLE "track" ADD CONSTRAINT "track_playlist_id_playlist_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "track_playlist_position_idx" ON "track" USING btree ("playlist_id","position");