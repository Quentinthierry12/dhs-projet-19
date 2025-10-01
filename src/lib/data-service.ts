import { supabase } from "@/integrations/supabase/client";
import { Candidate, Module, SubModule, Class, SubModuleScore, SubModuleAppreciation } from "@/types";

export interface ModuleScore {
  subModuleId: string;
  score: number;
  maxScore: number;
  comment?: string;
  instructorId?: string;
}

export const getCandidates = async (): Promise<Candidate[]> => {
  console.log('Fetching candidates...');
  
  const { data: candidatesData, error: candidatesError } = await supabase
    .from('dhs_candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (candidatesError) {
    console.error('Error fetching candidates:', candidatesError);
    throw candidatesError;
  }

  console.log('Raw candidates data:', candidatesData);

  if (!candidatesData || candidatesData.length === 0) {
    console.log('No candidates found');
    return [];
  }

  // Fetch all module scores for all candidates
  const { data: scoresData, error: scoresError } = await supabase
    .from('dhs_sub_module_scores')
    .select('*');

  if (scoresError) {
    console.error('Error fetching module scores:', scoresError);
    // Don't throw here, just continue with empty scores
  }

  console.log('Raw scores data:', scoresData);

  const candidates: Candidate[] = candidatesData.map(candidate => {
    // Find scores for this candidate
    const candidateScores = scoresData?.filter(score => score.candidate_id === candidate.id) || [];
    
    console.log(`Scores for candidate ${candidate.name} (${candidate.id}):`, candidateScores);

    const moduleScores: SubModuleScore[] = candidateScores.map(score => ({
      id: score.id,
      candidateId: score.candidate_id,
      subModuleId: score.sub_module_id,
      score: score.score,
      maxScore: score.max_score,
      comment: score.comment,
      instructorId: score.instructor_id,
      timestamp: score.timestamp,
    }));

    return {
      id: candidate.id,
      name: candidate.name,
      serverId: candidate.server_id,
      isCertified: candidate.is_certified || false,
      certifiedBy: candidate.certified_by || undefined,
      certificationDate: candidate.certification_date || undefined,
      classIds: candidate.class_ids || [],
      createdAt: candidate.created_at,
      moduleScores: moduleScores,
    };
  });

  console.log('Processed candidates with scores:', candidates);
  return candidates;
};

export const getModules = async (): Promise<Module[]> => {
  console.log('Fetching modules...');
  
  const { data: modulesData, error: modulesError } = await supabase
    .from('dhs_modules')
    .select('*')
    .order('order_number', { ascending: true });

  if (modulesError) {
    console.error('Error fetching modules:', modulesError);
    throw modulesError;
  }

  console.log('Raw modules data:', modulesData);

  if (!modulesData || modulesData.length === 0) {
    console.log('No modules found');
    return [];
  }

  // Fetch all sub-modules
  const { data: subModulesData, error: subModulesError } = await supabase
    .from('dhs_sub_modules')
    .select('*')
    .order('order_number', { ascending: true });

  if (subModulesError) {
    console.error('Error fetching sub-modules:', subModulesError);
    throw subModulesError;
  }

  console.log('Raw sub-modules data:', subModulesData);

  const modules: Module[] = modulesData.map(module => {
    const subModules = subModulesData?.filter(subModule => subModule.module_id === module.id) || [];
    
    return {
      id: module.id,
      name: module.name,
      description: module.description,
      orderNumber: module.order_number,
      order: module.order_number,
      instructorInCharge: module.instructor_in_charge,
      createdAt: module.created_at,
      subModules: subModules.map(subModule => ({
        id: subModule.id,
        moduleId: subModule.module_id,
        name: subModule.name,
        orderNumber: subModule.order_number,
        order: subModule.order_number,
        maxScore: subModule.max_score,
        isOptional: subModule.is_optional,
        appreciation: subModule.appreciation,
        createdAt: subModule.created_at,
      })),
    };
  });

  console.log('Processed modules with sub-modules:', modules);
  return modules;
};

export const getClasses = async (): Promise<Class[]> => {
  const { data, error } = await supabase
    .from('dhs_classes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }

  return (data || []).map(classData => ({
    id: classData.id,
    name: classData.name,
    instructorName: classData.instructor_name,
    candidateIds: classData.candidate_ids || [],
    status: (classData.status || 'active') as 'active' | 'completed' | 'cancelled',
    createdAt: classData.created_at,
  }));
};

export const getCandidateById = async (id: string): Promise<Candidate | null> => {
  const { data, error } = await supabase
    .from('dhs_candidates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching candidate:', error);
    throw error;
  }

  // Fetch module scores for this candidate
  const { data: scoresData, error: scoresError } = await supabase
    .from('dhs_sub_module_scores')
    .select('*')
    .eq('candidate_id', id);

  if (scoresError) {
    console.error('Error fetching candidate scores:', scoresError);
  }

  const moduleScores: SubModuleScore[] = (scoresData || []).map(score => ({
    id: score.id,
    candidateId: score.candidate_id,
    subModuleId: score.sub_module_id,
    score: score.score,
    maxScore: score.max_score,
    comment: score.comment,
    instructorId: score.instructor_id,
    timestamp: score.timestamp,
  }));

  return {
    id: data.id,
    name: data.name,
    serverId: data.server_id,
    isCertified: data.is_certified || false,
    certifiedBy: data.certified_by || undefined,
    certificationDate: data.certification_date || undefined,
    classIds: data.class_ids || [],
    createdAt: data.created_at,
    moduleScores: moduleScores,
  };
};

export const getClassById = async (id: string): Promise<Class | null> => {
  const { data, error } = await supabase
    .from('dhs_classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching class:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    instructorName: data.instructor_name,
    candidateIds: data.candidate_ids || [],
    status: (data.status || 'active') as 'active' | 'completed' | 'cancelled',
    createdAt: data.created_at,
  };
};

export const addCandidate = async (candidateData: { name: string; serverId: string }): Promise<Candidate> => {
  const { data, error } = await supabase
    .from('dhs_candidates')
    .insert({
      name: candidateData.name,
      server_id: candidateData.serverId,
      is_certified: false,
      class_ids: []
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding candidate:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    serverId: data.server_id,
    isCertified: data.is_certified || false,
    certifiedBy: data.certified_by || undefined,
    certificationDate: data.certification_date || undefined,
    classIds: data.class_ids || [],
    createdAt: data.created_at,
    moduleScores: [],
  };
};

export const addClass = async (classData: { name: string; instructorName: string; candidateIds: string[] }): Promise<Class> => {
  const { data, error } = await supabase
    .from('dhs_classes')
    .insert({
      name: classData.name,
      instructor_name: classData.instructorName,
      candidate_ids: classData.candidateIds,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding class:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    instructorName: data.instructor_name,
    candidateIds: data.candidate_ids || [],
    status: (data.status || 'active') as 'active' | 'completed' | 'cancelled',
    createdAt: data.created_at,
  };
};

export const sendClassCreationWebhook = async (classData: Class): Promise<void> => {
  // Fetch webhook config
  const { data: config } = await supabase
    .from('dhs_webhook_config')
    .select('*')
    .eq('id', 'default')
    .single();

  if (config?.class_creation_url) {
    try {
      await fetch(config.class_creation_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class: classData,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }
};

export const removeCandidate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('dhs_candidates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing candidate:', error);
    throw error;
  }
};

export const addSubModuleScore = async (scoreData: {
  candidateId: string;
  subModuleId: string;
  score: number;
  maxScore: number;
  comment?: string;
  instructorId?: string;
}): Promise<ModuleScore> => {
  const { data, error } = await supabase
    .from('dhs_sub_module_scores')
    .insert({
      candidate_id: scoreData.candidateId,
      sub_module_id: scoreData.subModuleId,
      score: scoreData.score,
      max_score: scoreData.maxScore,
      comment: scoreData.comment,
      instructor_id: scoreData.instructorId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding sub module score:', error);
    throw error;
  }

  return {
    subModuleId: data.sub_module_id,
    score: data.score,
    maxScore: data.max_score,
    comment: data.comment,
    instructorId: data.instructor_id,
  };
};

export const calculateCandidateProgress = async (candidate: Candidate): Promise<{ totalScore: number; maxPossibleScore: number; percentage: number }> => {
  // Fetch all modules and sub-modules to get the total possible score
  const modules = await getModules();
  
  // Calculate total possible score from ALL sub-modules
  const maxPossibleScore = modules.reduce((total, module) => {
    return total + (module.subModules?.reduce((moduleTotal, subModule) => {
      return moduleTotal + (subModule.maxScore || 0);
    }, 0) || 0);
  }, 0);

  // If candidate has no module scores, return 0 total score but real max possible score
  if (!candidate.moduleScores || candidate.moduleScores.length === 0) {
    console.log(`No module scores for candidate ${candidate.name}, max possible: ${maxPossibleScore}`);
    return {
      totalScore: 0,
      maxPossibleScore,
      percentage: 0,
    };
  }

  // Calculate total score from candidate's actual scores
  const totalScore = candidate.moduleScores.reduce((sum, score) => sum + (score.score || 0), 0);
  
  // Ensure we don't get NaN by handling division by zero
  let percentage = 0;
  if (maxPossibleScore > 0) {
    percentage = Math.round((totalScore / maxPossibleScore) * 100);
  }
  
  // Ensure percentage is never NaN
  if (isNaN(percentage)) {
    percentage = 0;
  }

  console.log(`Progress calculation for candidate ${candidate.name}:`, {
    totalScore,
    maxPossibleScore,
    percentage,
    moduleScoresCount: candidate.moduleScores?.length || 0
  });

  return {
    totalScore,
    maxPossibleScore,
    percentage,
  };
};

export const certifyCandidate = async (id: string, certifiedBy: string): Promise<Candidate | null> => {
  const { data, error } = await supabase
    .from('dhs_candidates')
    .update({
      is_certified: true,
      certified_by: certifiedBy,
      certification_date: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error certifying candidate:', error);
    throw error;
  }

  return getCandidateById(id);
};

export const getCandidatesByClassId = async (classId: string): Promise<Candidate[]> => {
  const classData = await getClassById(classId);
  if (!classData) return [];

  const candidates = await Promise.all(
    classData.candidateIds.map(id => getCandidateById(id))
  );

  return candidates.filter(candidate => candidate !== null) as Candidate[];
};

export const deleteClass = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('dhs_classes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};

export const addModule = async (moduleData: { 
  name: string; 
  description?: string; 
  orderNumber: number;
  instructorInCharge?: string;
}): Promise<Module> => {
  const { data, error } = await supabase
    .from('dhs_modules')
    .insert({
      name: moduleData.name,
      description: moduleData.description,
      order_number: moduleData.orderNumber,
      instructor_in_charge: moduleData.instructorInCharge,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding module:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    orderNumber: data.order_number,
    order: data.order_number,
    instructorInCharge: data.instructor_in_charge,
    createdAt: data.created_at,
    subModules: [],
  };
};

export const updateModule = async (id: string, moduleData: { 
  name?: string; 
  description?: string; 
  orderNumber?: number;
  instructorInCharge?: string;
}): Promise<Module | null> => {
  const updates: any = {};
  if (moduleData.name !== undefined) updates.name = moduleData.name;
  if (moduleData.description !== undefined) updates.description = moduleData.description;
  if (moduleData.orderNumber !== undefined) updates.order_number = moduleData.orderNumber;
  if (moduleData.instructorInCharge !== undefined) updates.instructor_in_charge = moduleData.instructorInCharge;

  const { data, error } = await supabase
    .from('dhs_modules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating module:', error);
    throw error;
  }

  const modules = await getModules();
  return modules.find(m => m.id === id) || null;
};

export const removeModule = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('dhs_modules')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing module:', error);
    throw error;
  }
};

export const addSubModule = async (subModuleData: { 
  moduleId: string; 
  name: string; 
  orderNumber: number; 
  maxScore: number;
  isOptional?: boolean;
  appreciation?: string;
}): Promise<SubModule> => {
  const { data, error } = await supabase
    .from('dhs_sub_modules')
    .insert({
      module_id: subModuleData.moduleId,
      name: subModuleData.name,
      order_number: subModuleData.orderNumber,
      max_score: subModuleData.maxScore,
      is_optional: subModuleData.isOptional || false,
      appreciation: subModuleData.appreciation,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding sub module:', error);
    throw error;
  }

  return {
    id: data.id,
    moduleId: data.module_id,
    name: data.name,
    orderNumber: data.order_number,
    order: data.order_number,
    maxScore: data.max_score,
    isOptional: data.is_optional,
    appreciation: data.appreciation,
    createdAt: data.created_at,
  };
};

export const updateSubModule = async (id: string, subModuleData: { 
  name?: string; 
  orderNumber?: number; 
  maxScore?: number;
  isOptional?: boolean;
  appreciation?: string;
}): Promise<SubModule | null> => {
  const updates: any = {};
  if (subModuleData.name !== undefined) updates.name = subModuleData.name;
  if (subModuleData.orderNumber !== undefined) updates.order_number = subModuleData.orderNumber;
  if (subModuleData.maxScore !== undefined) updates.max_score = subModuleData.maxScore;
  if (subModuleData.isOptional !== undefined) updates.is_optional = subModuleData.isOptional;
  if (subModuleData.appreciation !== undefined) updates.appreciation = subModuleData.appreciation;

  const { data, error } = await supabase
    .from('dhs_sub_modules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating sub module:', error);
    throw error;
  }

  return {
    id: data.id,
    moduleId: data.module_id,
    name: data.name,
    orderNumber: data.order_number,
    order: data.order_number,
    maxScore: data.max_score,
    isOptional: data.is_optional,
    appreciation: data.appreciation,
    createdAt: data.created_at,
  };
};

export const removeSubModule = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('dhs_sub_modules')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing sub module:', error);
    throw error;
  }
};

export const getModuleById = async (id: string): Promise<Module | null> => {
  const modules = await getModules();
  return modules.find(m => m.id === id) || null;
};

export const getWebhookConfig = async (): Promise<any> => {
  const { data, error } = await supabase
    .from('dhs_webhook_config')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error) {
    console.error('Error fetching webhook config:', error);
    throw error;
  }

  return data;
};

export const updateWebhookConfig = async (config: any): Promise<any> => {
  const { data, error } = await supabase
    .from('dhs_webhook_config')
    .upsert({
      id: 'default',
      ...config,
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating webhook config:', error);
    throw error;
  }

  return data;
};

export const addSubModuleAppreciation = async (appreciationData: {
  candidateId: string;
  subModuleId: string;
  appreciation?: string;
  instructorId?: string;
}): Promise<SubModuleAppreciation> => {
  const { data, error } = await supabase
    .from('dhs_sub_module_appreciations')
    .upsert({
      candidate_id: appreciationData.candidateId,
      sub_module_id: appreciationData.subModuleId,
      appreciation: appreciationData.appreciation,
      instructor_id: appreciationData.instructorId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'candidate_id,sub_module_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding sub module appreciation:', error);
    throw error;
  }

  return {
    id: data.id,
    candidateId: data.candidate_id,
    subModuleId: data.sub_module_id,
    appreciation: data.appreciation,
    instructorId: data.instructor_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const getSubModuleAppreciations = async (candidateId: string): Promise<SubModuleAppreciation[]> => {
  const { data, error } = await supabase
    .from('dhs_sub_module_appreciations')
    .select('*')
    .eq('candidate_id', candidateId);

  if (error) {
    console.error('Error fetching sub module appreciations:', error);
    throw error;
  }

  return (data || []).map(appreciation => ({
    id: appreciation.id,
    candidateId: appreciation.candidate_id,
    subModuleId: appreciation.sub_module_id,
    appreciation: appreciation.appreciation,
    instructorId: appreciation.instructor_id,
    createdAt: appreciation.created_at,
    updatedAt: appreciation.updated_at,
  }));
};

export const removeSubModuleAppreciation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('dhs_sub_module_appreciations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing sub module appreciation:', error);
    throw error;
  }
};

// Aliases for backward compatibility
export const getAllCandidates = getCandidates;
export const getAllModules = getModules;
export const getAllClasses = getClasses;
