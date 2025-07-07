

import type { FinalAnalysisResultType } from './types';

export interface DecisionNode {
  questionId: string;
  questionText: string;
  hintText?: string; // Nova propriedade para a dica
  onSim: { nextQuestionId?: string; result?: FinalAnalysisResultType };
  onNao: { nextQuestionId?: string; result?: FinalAnalysisResultType };
}

export const INITIAL_QUESTION_ID = 'q_vigente';

export const DECISION_TREE: Record<string, DecisionNode> = {
  [INITIAL_QUESTION_ID]: {
    questionId: INITIAL_QUESTION_ID,
    questionText: 'A demanda se refere a uma norma/lei que já está vigente?',
    hintText: "Exemplo: nova versão da TISS ainda não vigente",
    onSim: { nextQuestionId: 'q_combinado_issue' },
    onNao: { result: 'GAP_LEGISLACAO' },
  },
  'q_combinado_issue': {
    questionId: 'q_combinado_issue',
    questionText: 'O comportamento do sistema é um combinado do time ou está em critérios de alguma issue que "fizemos assim" por conta de prazo, conhecimento, etc?',
    onSim: { result: 'GAP_LEGISLACAO' },
    onNao: { nextQuestionId: 'q_nunca_teve_func' },
  },
  'q_nunca_teve_func': {
    questionId: 'q_nunca_teve_func',
    questionText: 'O sistema nunca teve funcionalidade ou tratamento para essa exigência legal?',
    hintText: "Exemplos: \nexportação de ressarcimento ao SUS no A500. O sistema não tem essa funcionalidade.\nexportação de recurso de glosas TISS (sistema atende apenas a importação)",
    onSim: { result: 'GAP_LEGISLACAO' }, 
    onNao: { nextQuestionId: 'q_parcial_manual' },
  },
  'q_parcial_manual': {
    questionId: 'q_parcial_manual',
    questionText: 'Significa que o sistema atende de forma parcial, logo a necessidade está explícita em manual?',
    hintText: "Exemplo: \n\nquantidade reconhecida no A550 deve ser menor que a cobrada em determinadas situações - é algo que nunca fizemos certo mas em dado momento passou a gerar erros de postagem na CMB.\nexportação de lote de guias não está seguindo uma regra do manual da TISS",
    onSim: { result: 'BUG' },
    onNao: { nextQuestionId: 'q_boletim_brasil' },
  },
  'q_boletim_brasil': {
    questionId: 'q_boletim_brasil',
    questionText: 'Possui boletim ou documento da Brasil indicando alteração?',
    onSim: { result: 'GAP_LEGISLACAO' },
    onNao: { result: 'REQUISITO_MELHORIA_CORRECAO' }, // Assumindo este desfecho
  },
};

export const LOCAL_STORAGE_KEY = 'legislationGapAnalysisHistory';
