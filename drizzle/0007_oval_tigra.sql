ALTER TABLE "flow_versions" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "flow_versions" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "flow_versions" ADD COLUMN "published_by" uuid;--> statement-breakpoint
ALTER TABLE "flow_versions" ADD CONSTRAINT "flow_versions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;