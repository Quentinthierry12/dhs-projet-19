
export type QuestionType = 'text' | 'qcm' | 'section';

export interface CompetitionQuestion {
  id: string;
  competitionId: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  maxPoints: number;
  orderNumber: number;
  createdAt: string;
}

export interface CompetitionParticipation {
  id: string;
  competitionId: string;
  participantName: string;
  participantRio?: string;
  answers: Record<string, string>;
  score?: number;
  maxScore?: number;
  percentage?: number;
  submittedAt: string;
  comment?: string;
}

export interface Competition {
  id: string;
  title: string;
  description?: string;
  type: 'externe' | 'interne' | 'privé';
  specialty?: string;
  maxScore: number;
  isActive: boolean;
  isEntryTest?: boolean;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionInvitation {
  id: string;
  competitionId: string;
  candidateName: string;
  candidateEmail?: string;
  loginIdentifier: string;
  loginPassword: string;
  status: 'created' | 'used';
  createdAt: string;
  usedAt?: string;
}
