CREATE TABLE IF NOT EXISTS "entry_conditions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "flow_version_id" uuid NOT NULL REFERENCES "flow_versions" ("id"),
    "variable_id" uuid NOT NULL REFERENCES "variables" ("id"),
    "operator" text NOT NULL CHECK ("operator" IN ('equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_equals', 'less_than_equals', 'contains', 'not_contains')),
    "value" jsonb NOT NULL
);
