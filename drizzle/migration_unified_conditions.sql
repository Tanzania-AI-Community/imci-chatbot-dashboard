-- Migration: Convert entry_conditions to unified conditions table
-- This migration creates the new conditions table and migrates existing data

-- Create the new conditions table
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

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "conditions" ADD CONSTRAINT "conditions_flow_version_id_flow_versions_id_fk" FOREIGN KEY ("flow_version_id") REFERENCES "flow_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "conditions" ADD CONSTRAINT "conditions_variable_id_variables_id_fk" FOREIGN KEY ("variable_id") REFERENCES "variables"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Migrate existing data from entry_conditions to conditions
INSERT INTO "conditions" (
	"id",
	"flow_version_id", 
	"variable_id",
	"operator",
	"value",
	"type",
	"reference_id",
	"logical_operator",
	"group_id",
	"created_at"
)
SELECT 
	"id",
	"flow_version_id",
	"variable_id", 
	"operator",
	"value",
	'entry' as "type",
	NULL as "reference_id",
	NULL as "logical_operator", 
	NULL as "group_id",
	NOW() as "created_at"
FROM "entry_conditions"
WHERE EXISTS (SELECT 1 FROM "entry_conditions");

-- Drop the old entry_conditions table
DROP TABLE IF EXISTS "entry_conditions";
