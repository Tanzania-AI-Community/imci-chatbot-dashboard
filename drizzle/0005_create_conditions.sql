-- Create unified conditions table
CREATE TABLE IF NOT EXISTS "conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_version_id" uuid NOT NULL,
	"variable_id" uuid NOT NULL,
	"operator" text NOT NULL,
	"value" jsonb NOT NULL,
	"type" text NOT NULL,
	"reference_id" uuid,
	"logical_operator" text,
	"group_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conditions" ADD CONSTRAINT "conditions_flow_version_id_flow_versions_id_fk" FOREIGN KEY ("flow_version_id") REFERENCES "flow_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conditions" ADD CONSTRAINT "conditions_variable_id_variables_id_fk" FOREIGN KEY ("variable_id") REFERENCES "variables"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
