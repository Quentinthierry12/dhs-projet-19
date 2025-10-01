
-- Create a table for resources
CREATE TABLE dhs_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments for clarity
COMMENT ON TABLE dhs_resources IS 'Stores links to various documents and resources like training manuals, procedures, etc.';
COMMENT ON COLUMN dhs_resources.name IS 'The display name of the resource.';
COMMENT ON COLUMN dhs_resources.url IS 'The URL pointing to the resource. Must be unique.';
COMMENT ON COLUMN dhs_resources.category IS 'Category to organize resources (e.g., "Manual", "Procedure", "Form").';
COMMENT ON COLUMN dhs_resources.created_by IS 'Name/email of the user who created the resource.';
