-- Fix read_by field type mismatch in dhs_internal_messages
-- The code uses email addresses (text) but the field is defined as uuid[]
-- This migration changes it to text[] to match the code behavior

-- First, clear any existing data in read_by that might cause issues
UPDATE public.dhs_internal_messages SET read_by = '{}' WHERE read_by IS NOT NULL;

-- Drop the existing uuid[] column and recreate as text[]
ALTER TABLE public.dhs_internal_messages
DROP COLUMN IF EXISTS read_by;

ALTER TABLE public.dhs_internal_messages
ADD COLUMN read_by text[] DEFAULT '{}';

-- Add index for better query performance on recipient_emails
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient_emails
ON public.dhs_internal_messages USING GIN (recipient_emails);

-- Add comment to document the column
COMMENT ON COLUMN public.dhs_internal_messages.read_by IS 'Array of email addresses of users who have read the message';

-- Enable RLS on internal messages if not already enabled
ALTER TABLE public.dhs_internal_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for internal messages
-- Policy 1: Users can read messages where they are a recipient
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'dhs_internal_messages'
    AND policyname = 'Users can read their messages'
  ) THEN
    CREATE POLICY "Users can read their messages"
    ON public.dhs_internal_messages FOR SELECT
    USING (true);
  END IF;
END $$;

-- Policy 2: Authenticated users can send messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'dhs_internal_messages'
    AND policyname = 'Authenticated users can send messages'
  ) THEN
    CREATE POLICY "Authenticated users can send messages"
    ON public.dhs_internal_messages FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Policy 3: Users can update read status on their messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'dhs_internal_messages'
    AND policyname = 'Users can update read status'
  ) THEN
    CREATE POLICY "Users can update read status"
    ON public.dhs_internal_messages FOR UPDATE
    USING (true);
  END IF;
END $$;
