
export interface Question { // Mantido para possível uso futuro, mas não diretamente pelo novo fluxo.
  id: string;
  text: string;
}

export type Answer = 'sim' | 'nao';

export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  answer: Answer;
}

export type FinalAnalysisResultType = 'GAP_LEGISLACAO' | 'BUG' | 'REQUISITO_MELHORIA_CORRECAO';

export interface HistoricalEntry {
  clientGeneratedId: string; // ID gerado pelo cliente no momento da submissão
  timestamp: string; // ISO string for the submission date
  answeredQuestions: QuestionAnswer[]; // Armazenado como array
  analysisOutcome: FinalAnalysisResultType;
  isGap: boolean; // Derivado de analysisOutcome: true para GAP_LEGISLACAO e BUG
  details: string;
  submitterName?: string;
}

export type ViewMode = 'form' | 'history';

// Usado internamente no QuestionnaireForm para exibir o resultado antes dos detalhes
export interface QuestionAnalysisResultDisplay {
  outcome: FinalAnalysisResultType;
  isGap: boolean; // Derivado
  title: string;
  description: string;
}