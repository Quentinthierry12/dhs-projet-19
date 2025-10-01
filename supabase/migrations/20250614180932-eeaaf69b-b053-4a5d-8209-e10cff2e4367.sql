
-- Add status column to dhs_competition_participations table
ALTER TABLE public.dhs_competition_participations 
ADD COLUMN status text DEFAULT 'pending';

-- Add a check constraint to ensure valid status values
ALTER TABLE public.dhs_competition_participations 
ADD CONSTRAINT check_status_valid 
CHECK (status IN ('pending', 'accepted', 'rejected'));
