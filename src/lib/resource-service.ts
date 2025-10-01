
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Resource = Database['public']['Tables']['dhs_resources']['Row'];
export type ResourceInsert = Database['public']['Tables']['dhs_resources']['Insert'];
export type ResourceUpdate = Database['public']['Tables']['dhs_resources']['Update'];

export const getResources = async () => {
  const { data, error } = await supabase
    .from('dhs_resources')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const addResource = async (resource: ResourceInsert) => {
  const { data, error } = await supabase
    .from('dhs_resources')
    .insert(resource)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const updateResource = async (id: string, resource: ResourceUpdate) => {
    const { data, error } = await supabase
    .from('dhs_resources')
    .update(resource)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const deleteResource = async (id: string) => {
  const { error } = await supabase.from('dhs_resources').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};
