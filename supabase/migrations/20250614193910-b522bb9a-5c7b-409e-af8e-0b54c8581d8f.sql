
-- D'abord, supprimer les doublons en gardant seulement le plus récent pour chaque combinaison candidate_id/sub_module_id
DELETE FROM public.dhs_sub_module_appreciations a
WHERE a.id NOT IN (
    SELECT DISTINCT ON (candidate_id, sub_module_id) id
    FROM public.dhs_sub_module_appreciations
    ORDER BY candidate_id, sub_module_id, created_at DESC
);
