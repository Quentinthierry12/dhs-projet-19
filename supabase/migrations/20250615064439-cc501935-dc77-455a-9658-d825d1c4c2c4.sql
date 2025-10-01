
-- Supprimer la fonction de hachage qui n'est plus nécessaire
DROP FUNCTION IF EXISTS generate_secure_password();

-- Recréer la fonction pour générer un mot de passe en clair
CREATE OR REPLACE FUNCTION generate_secure_password()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  password TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    password := password || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN password;
END;
$$ LANGUAGE plpgsql;
