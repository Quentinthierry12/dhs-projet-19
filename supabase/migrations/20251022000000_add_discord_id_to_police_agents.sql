-- Add discord_id column to dhs_police_agents table
ALTER TABLE public.dhs_police_agents
ADD COLUMN IF NOT EXISTS discord_id text;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_police_agents_discord_id
ON public.dhs_police_agents(discord_id);

-- Add comment to document the column
COMMENT ON COLUMN public.dhs_police_agents.discord_id IS 'Discord user ID for notifications (optional)';
