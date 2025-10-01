
-- Ajouter une contrainte unique sur la combinaison candidate_id et sub_module_id
ALTER TABLE public.dhs_sub_module_appreciations 
ADD CONSTRAINT unique_candidate_submodule_appreciation 
UNIQUE (candidate_id, sub_module_id);
