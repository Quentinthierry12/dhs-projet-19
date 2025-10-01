-- Ajouter la fonction dhs_log_activity qui manque
CREATE OR REPLACE FUNCTION public.dhs_log_activity(
  activity_type text,
  author_email text,
  author_role text,
  activity_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.dhs_activity_logs (type, author_email, role, details)
  VALUES (activity_type, author_email, author_role, activity_details);
END;
$function$