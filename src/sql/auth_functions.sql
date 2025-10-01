
-- Function to authenticate a user without using RLS policies for DHS system
CREATE OR REPLACE FUNCTION public.dhs_authenticate_user(p_identifier TEXT, p_password TEXT)
RETURNS SETOF public.dhs_users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.dhs_users
  WHERE (email = p_identifier OR identifiant = p_identifier)
    AND password = p_password
    AND active = true;
END;
$$;

-- Function to update a user's last login time for DHS system
CREATE OR REPLACE FUNCTION public.dhs_update_user_last_login(user_id UUID, login_time TIMESTAMPTZ)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.dhs_users
  SET last_login = login_time
  WHERE id = user_id;
END;
$$;

-- Function to check if a user is active for DHS system
CREATE OR REPLACE FUNCTION public.dhs_check_user_active(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT active INTO is_active
  FROM public.dhs_users
  WHERE id = p_user_id;
  
  RETURN COALESCE(is_active, false);
END;
$$;

-- Function to log activity for DHS system
CREATE OR REPLACE FUNCTION public.dhs_log_activity(
  activity_type TEXT,
  author_email TEXT,
  author_role TEXT,
  activity_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.dhs_activity_logs (type, author_email, role, details)
  VALUES (activity_type, author_email, author_role, activity_details);
END;
$$;
