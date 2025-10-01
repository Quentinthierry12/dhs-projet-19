
import { logActivity } from "./activity-logger";
import { getCurrentUser } from "./auth-service";

// Logger pour les activités liées aux modules
export const logModuleActivity = async (
  action: string,
  moduleId: string,
  moduleName: string,
  details?: any
) => {
  await logActivity(`module_${action}`, {
    entityType: 'module',
    entityId: moduleId,
    entityName: moduleName,
    ...details
  });
};

// Logger pour les activités liées aux sous-modules
export const logSubModuleActivity = async (
  action: string,
  subModuleId: string,
  subModuleName: string,
  moduleId?: string,
  moduleName?: string,
  details?: any
) => {
  await logActivity(`submodule_${action}`, {
    entityType: 'submodule',
    entityId: subModuleId,
    entityName: subModuleName,
    metadata: {
      moduleId,
      moduleName,
      ...details?.metadata
    },
    ...details
  });
};

// Logger pour les validations de modules
export const logModuleValidation = async (
  candidateId: string,
  candidateName: string,
  moduleId: string,
  moduleName: string,
  validationDetails: {
    validated: boolean;
    score?: number;
    maxScore?: number;
    instructorId?: string;
    comment?: string;
  }
) => {
  await logActivity('module_validation', {
    entityType: 'module_validation',
    entityId: moduleId,
    entityName: `Validation du module ${moduleName}`,
    metadata: {
      candidateId,
      candidateName,
      moduleId,
      moduleName,
      validated: validationDetails.validated,
      score: validationDetails.score,
      maxScore: validationDetails.maxScore,
      instructorId: validationDetails.instructorId,
      comment: validationDetails.comment
    }
  });
};

// Logger pour les corrections et appréciations
export const logModuleCorrection = async (
  candidateId: string,
  candidateName: string,
  moduleId: string,
  moduleName: string,
  correctionDetails: {
    oldScore?: number;
    newScore?: number;
    oldComment?: string;
    newComment?: string;
    correctedBy?: string;
    reason?: string;
  }
) => {
  await logActivity('module_correction', {
    entityType: 'module_correction',
    entityId: moduleId,
    entityName: `Correction du module ${moduleName}`,
    oldValues: {
      score: correctionDetails.oldScore,
      comment: correctionDetails.oldComment
    },
    newValues: {
      score: correctionDetails.newScore,
      comment: correctionDetails.newComment
    },
    metadata: {
      candidateId,
      candidateName,
      moduleId,
      moduleName,
      correctedBy: correctionDetails.correctedBy,
      reason: correctionDetails.reason
    }
  });
};

// Logger pour les appréciations de sous-modules
export const logSubModuleAppreciation = async (
  candidateId: string,
  candidateName: string,
  subModuleId: string,
  subModuleName: string,
  appreciationDetails: {
    appreciation: string;
    instructorId?: string;
    previousAppreciation?: string;
  }
) => {
  await logActivity('submodule_appreciation', {
    entityType: 'submodule_appreciation',
    entityId: subModuleId,
    entityName: `Appréciation du sous-module ${subModuleName}`,
    oldValues: appreciationDetails.previousAppreciation ? {
      appreciation: appreciationDetails.previousAppreciation
    } : undefined,
    newValues: {
      appreciation: appreciationDetails.appreciation
    },
    metadata: {
      candidateId,
      candidateName,
      subModuleId,
      subModuleName,
      instructorId: appreciationDetails.instructorId
    }
  });
};

// Logger pour les scores de sous-modules
export const logSubModuleScore = async (
  candidateId: string,
  candidateName: string,
  subModuleId: string,
  subModuleName: string,
  scoreDetails: {
    score: number;
    maxScore: number;
    instructorId?: string;
    comment?: string;
    previousScore?: number;
  }
) => {
  await logActivity('submodule_score', {
    entityType: 'submodule_score',
    entityId: subModuleId,
    entityName: `Score du sous-module ${subModuleName}`,
    oldValues: scoreDetails.previousScore !== undefined ? {
      score: scoreDetails.previousScore
    } : undefined,
    newValues: {
      score: scoreDetails.score,
      maxScore: scoreDetails.maxScore,
      comment: scoreDetails.comment
    },
    metadata: {
      candidateId,
      candidateName,
      subModuleId,
      subModuleName,
      instructorId: scoreDetails.instructorId
    }
  });
};

// Logger pour les certifications
export const logCertification = async (
  candidateId: string,
  candidateName: string,
  certificationDetails: {
    certified: boolean;
    certifiedBy?: string;
    certificationDate?: string;
    reason?: string;
  }
) => {
  await logActivity('candidate_certification', {
    entityType: 'certification',
    entityId: candidateId,
    entityName: `Certification de ${candidateName}`,
    newValues: {
      certified: certificationDetails.certified,
      certifiedBy: certificationDetails.certifiedBy,
      certificationDate: certificationDetails.certificationDate,
      reason: certificationDetails.reason
    },
    metadata: {
      candidateId,
      candidateName
    }
  });
};

// Logger pour les classes
export const logClassActivity = async (
  action: string,
  classId: string,
  className: string,
  details?: any
) => {
  await logActivity(`class_${action}`, {
    entityType: 'class',
    entityId: classId,
    entityName: className,
    ...details
  });
};

// Logger pour l'ajout/retrait de candidats dans une classe
export const logCandidateClassAssignment = async (
  action: 'add' | 'remove',
  candidateId: string,
  candidateName: string,
  classId: string,
  className: string,
  instructorName?: string
) => {
  await logActivity(`candidate_class_${action}`, {
    entityType: 'candidate_class_assignment',
    entityId: candidateId,
    entityName: `${action === 'add' ? 'Ajout' : 'Retrait'} de ${candidateName} ${action === 'add' ? 'à' : 'de'} la classe ${className}`,
    metadata: {
      candidateId,
      candidateName,
      classId,
      className,
      instructorName
    }
  });
};
