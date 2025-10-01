
export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'text';

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: QuizQuestionType;
  options?: string[];
  correctAnswer: string;
  points: number;
  orderNumber: number;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  moduleId?: string;
  subModuleId?: string;
  maxScore: number;
  timeLimit?: number;
  isActive: boolean;
  allowRetakes: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  moduleName?: string;
  subModuleName?: string;
}

export interface QuizParticipant {
  id: string;
  quizId: string;
  candidateId?: string;
  externalLogin?: string;
  externalPassword?: string;
  isCompleted: boolean;
  createdAt: string;
  candidateName?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  candidateId?: string;
  externalLogin?: string;
  participantName: string;
  answers: Record<string, any>;
  score: number;
  maxPossibleScore: number;
  percentage: number;
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  pointsEarned?: number;
}
