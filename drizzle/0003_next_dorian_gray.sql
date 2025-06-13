CREATE TABLE "entry_conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_version_id" uuid NOT NULL,
	"variable_id" uuid NOT NULL,
	"operator" text NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entry_conditions" ADD CONSTRAINT "entry_conditions_flow_version_id_flow_versions_id_fk" FOREIGN KEY ("flow_version_id") REFERENCES "public"."flow_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_conditions" ADD CONSTRAINT "entry_conditions_variable_id_variables_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."variables"("id") ON DELETE no action ON UPDATE no action;