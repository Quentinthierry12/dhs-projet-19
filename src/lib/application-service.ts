
import { supabase } from "@/integrations/supabase/client";
import { ApplicationForm, FormField, Application, ApplicationStatus, FieldResponse } from "@/types/police";
import { Candidate } from "@/types";
import { addCandidate } from "./data-service";

// Helper function to convert database fields to FormField[] type
const convertJsonToFormFields = (fields: any): FormField[] => {
  if (!fields) return [];
  if (Array.isArray(fields)) return fields as FormField[];
  try {
    return JSON.parse(fields) as FormField[];
  } catch (e) {
    console.error("Error parsing form fields:", e);
    return [];
  }
};

// Helper function to convert database responses to FieldResponse[] type
const convertJsonToResponses = (responses: any): FieldResponse[] => {
  if (!responses) return [];
  if (Array.isArray(responses)) return responses as FieldResponse[];
  try {
    return JSON.parse(responses) as FieldResponse[];
  } catch (e) {
    console.error("Error parsing responses:", e);
    return [];
  }
};

// Get all application forms, with option to filter only active ones
export const getAllApplicationForms = async (onlyActive = false): Promise<ApplicationForm[]> => {
  let query = supabase
    .from('dhs_application_forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (onlyActive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching application forms:', error);
    throw error;
  }

  return data.map(form => ({
    id: form.id,
    name: form.name,
    description: form.description,
    fields: convertJsonToFormFields(form.fields),
    isActive: form.is_active,
    createdAt: form.created_at,
    updatedAt: form.updated_at,
    createdBy: form.created_by,
  }));
};

// Get application form by ID
export const getApplicationFormById = async (id: string): Promise<ApplicationForm | null> => {
  const { data, error } = await supabase
    .from('dhs_application_forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No form found
    }
    console.error('Error fetching application form:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    fields: convertJsonToFormFields(data.fields),
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
  };
};

// Create a new application form
export const createApplicationForm = async (form: {
  name: string;
  description: string;
  fields: FormField[];
  createdBy: string;
}): Promise<ApplicationForm> => {
  // Fix the type issue by stringifying the fields
  const { data, error } = await supabase
    .from('dhs_application_forms')
    .insert({
      name: form.name,
      description: form.description,
      fields: JSON.stringify(form.fields),
      created_by: form.createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating application form:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    fields: convertJsonToFormFields(data.fields),
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
  };
};

// Update an application form
export const updateApplicationForm = async (
  id: string,
  form: {
    name?: string;
    description?: string;
    fields?: FormField[];
    isActive?: boolean;
  }
): Promise<ApplicationForm> => {
  const updates: any = {};
  if (form.name !== undefined) updates.name = form.name;
  if (form.description !== undefined) updates.description = form.description;
  if (form.fields !== undefined) updates.fields = JSON.stringify(form.fields); // Fix type issue
  if (form.isActive !== undefined) updates.is_active = form.isActive;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('dhs_application_forms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating application form:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    fields: convertJsonToFormFields(data.fields),
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
  };
};

// Add the missing deleteApplicationForm function
export const deleteApplicationForm = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('dhs_application_forms')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting application form:', error);
    throw error;
  }
};

// Submit a new application
export const submitApplication = async (application: {
  formId: string;
  formName: string;
  applicantName: string;
  serverId: string;
  responses: FieldResponse[];
}): Promise<Application> => {
  // Fix type issue with responses
  const { data, error } = await supabase
    .from('dhs_applications')
    .insert({
      form_id: application.formId,
      form_name: application.formName,
      applicant_name: application.applicantName,
      server_id: application.serverId,
      responses: JSON.stringify(application.responses),
      status: 'pending', // Default status is pending
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting application:', error);
    throw error;
  }

  return {
    id: data.id,
    formId: data.form_id,
    formName: data.form_name,
    applicantName: data.applicant_name,
    serverId: data.server_id,
    responses: convertJsonToResponses(data.responses),
    status: data.status as ApplicationStatus,
    totalScore: data.total_score,
    maxPossibleScore: data.max_possible_score,
    reviewerComment: data.reviewer_comment,
    reviewedBy: data.reviewed_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Get all applications
export const getAllApplications = async (): Promise<Application[]> => {
  const { data, error } = await supabase
    .from('dhs_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }

  return data.map(app => ({
    id: app.id,
    formId: app.form_id,
    formName: app.form_name,
    applicantName: app.applicant_name,
    serverId: app.server_id,
    responses: convertJsonToResponses(app.responses),
    status: app.status as ApplicationStatus,
    totalScore: app.total_score || 0,
    maxPossibleScore: app.max_possible_score || 0,
    reviewerComment: app.reviewer_comment || '',
    reviewedBy: app.reviewed_by || '',
    createdAt: app.created_at,
    updatedAt: app.updated_at,
  }));
};

// Get application by ID
export const getApplicationById = async (id: string): Promise<Application | null> => {
  const { data, error } = await supabase
    .from('dhs_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No application found
    }
    console.error('Error fetching application:', error);
    throw error;
  }

  return {
    id: data.id,
    formId: data.form_id,
    formName: data.form_name,
    applicantName: data.applicant_name,
    serverId: data.server_id,
    responses: convertJsonToResponses(data.responses),
    status: data.status as ApplicationStatus,
    totalScore: data.total_score || 0,
    maxPossibleScore: data.max_possible_score || 0,
    reviewerComment: data.reviewer_comment || '',
    reviewedBy: data.reviewed_by || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Update application status and review information
export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus,
  reviewData?: {
    reviewerComment?: string;
    totalScore?: number;
    maxPossibleScore?: number;
    reviewedBy: string;
  }
): Promise<Application> => {
  const updates: any = {
    status: status,
    updated_at: new Date().toISOString(),
  };

  if (reviewData) {
    if (reviewData.reviewerComment !== undefined) updates.reviewer_comment = reviewData.reviewerComment;
    if (reviewData.totalScore !== undefined) updates.total_score = reviewData.totalScore;
    if (reviewData.maxPossibleScore !== undefined) updates.max_possible_score = reviewData.maxPossibleScore;
    if (reviewData.reviewedBy !== undefined) updates.reviewed_by = reviewData.reviewedBy;
  }

  const { data, error } = await supabase
    .from('dhs_applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating application status:', error);
    throw error;
  }

  return {
    id: data.id,
    formId: data.form_id,
    formName: data.form_name,
    applicantName: data.applicant_name,
    serverId: data.server_id,
    responses: convertJsonToResponses(data.responses),
    status: data.status as ApplicationStatus,
    totalScore: data.total_score || 0,
    maxPossibleScore: data.max_possible_score || 0,
    reviewerComment: data.reviewer_comment || '',
    reviewedBy: data.reviewed_by || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Add this function to handle review updates in ApplicationDetail.tsx
export const updateApplicationReview = async (
  id: string, 
  reviewData: {
    status: ApplicationStatus,
    reviewerComment?: string;
    totalScore?: number;
    maxPossibleScore?: number;
    reviewedBy: string;
  }
): Promise<Application> => {
  return updateApplicationStatus(id, reviewData.status, {
    reviewerComment: reviewData.reviewerComment,
    totalScore: reviewData.totalScore,
    maxPossibleScore: reviewData.maxPossibleScore,
    reviewedBy: reviewData.reviewedBy
  });
};

// Accept an application and create a candidate
export const acceptApplication = async (applicationId: string, reviewedBy: string): Promise<{ application: Application; candidate: Candidate }> => {
  // First get the application data
  const application = await getApplicationById(applicationId);
  
  if (!application) {
    throw new Error('Application not found');
  }

  // Create the candidate
  const candidate = await addCandidate({
    name: application.applicantName,
    serverId: application.serverId,
  });

  // Update the application status
  const updatedApplication = await updateApplicationStatus(
    applicationId, 
    'accepted', 
    {
      reviewedBy,
      reviewerComment: `Accepted and candidate created on ${new Date().toLocaleDateString()}`
    }
  );

  // Call webhook if needed
  // TODO: Implement webhook call

  return {
    application: updatedApplication,
    candidate
  };
};
