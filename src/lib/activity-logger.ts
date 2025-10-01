
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "./auth-service";

export interface ActivityLogDetails {
  entityType?: string;
  entityId?: string;
  entityName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export const logActivity = async (
  type: string,
  details?: ActivityLogDetails
) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    // Enrichir les détails avec des informations système
    const enrichedDetails = {
      ...details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      }
    };

    await supabase.rpc("dhs_log_activity", {
      activity_type: type,
      author_email: currentUser.email,
      author_role: currentUser.role,
      activity_details: enrichedDetails
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Fonctions spécialisées pour différents types d'activités
export const logAgentActivity = async (
  action: string,
  agentId: string,
  agentName: string,
  details?: Partial<ActivityLogDetails>
) => {
  await logActivity(`agent_${action}`, {
    entityType: 'agent',
    entityId: agentId,
    entityName: agentName,
    ...details
  });
};

export const logSpecialtyActivity = async (
  action: string,
  specialtyId: string,
  specialtyName: string,
  agentId?: string,
  agentName?: string,
  details?: Partial<ActivityLogDetails>
) => {
  await logActivity(`specialty_${action}`, {
    entityType: 'specialty',
    entityId: specialtyId,
    entityName: specialtyName,
    metadata: {
      agentId,
      agentName,
      ...details?.metadata
    },
    ...details
  });
};

export const logTrainingActivity = async (
  action: string,
  trainingId: string,
  trainingTitle: string,
  agentId?: string,
  agentName?: string,
  details?: Partial<ActivityLogDetails>
) => {
  await logActivity(`training_${action}`, {
    entityType: 'training',
    entityId: trainingId,
    entityName: trainingTitle,
    metadata: {
      agentId,
      agentName,
      ...details?.metadata
    },
    ...details
  });
};

export const logUserActivity = async (
  action: string,
  userId: string,
  userName: string,
  details?: Partial<ActivityLogDetails>
) => {
  await logActivity(`user_${action}`, {
    entityType: 'user',
    entityId: userId,
    entityName: userName,
    ...details
  });
};

export const logSystemActivity = async (
  action: string,
  details?: Partial<ActivityLogDetails>
) => {
  await logActivity(`system_${action}`, {
    entityType: 'system',
    ...details
  });
};
