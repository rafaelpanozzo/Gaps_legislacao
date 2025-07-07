
import React, { useState, useEffect } from 'react';
import { DECISION_TREE, INITIAL_QUESTION_ID, LOCAL_STORAGE_KEY } from '../constants.js';
import type { Answer, HistoricalEntry, QuestionAnswer, FinalAnalysisResultType, QuestionAnalysisResultDisplay } from '../types.js';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, ArrowRightIcon, ArrowPathIcon, BugAntIcon, ArrowUturnLeftIcon, ArchiveBoxIcon } from '@heroicons/react/24/solid';

const QuestionnaireForm: React.FC = () => {
  const [formStep, setFormStep] = useState<'answering_questions' | 'providing_details' | 'submission_complete'>('answering_questions');
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(INITIAL_QUESTION_ID);
  const [answeredQuestionsLog, setAnsweredQuestionsLog] = useState<QuestionAnswer[]>([]);
  const [currentAnswerForFocusedQuestion, setCurrentAnswerForFocusedQuestion] = useState<Answer | null>(null);

  const [details, setDetails] = useState<string>('');
  const [submitterName, setSubmitterName] = useState<string>('');

  const [analysisOutcomeForSave, setAnalysisOutcomeForSave] = useState<FinalAnalysisResultType | null>(null);
  const [questionAnalysisResultDisplay, setQuestionAnalysisResultDisplay] = useState<QuestionAnalysisResultDisplay | null>(null);
  const [currentMessage, setCurrentMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [formKey, setFormKey] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isHintVisible, setIsHintVisible] = useState<boolean>(false);


  useEffect(() => {
    setCurrentQuestionId(INITIAL_QUESTION_ID);
    setAnsweredQuestionsLog([]);
    setCurrentAnswerForFocusedQuestion(null);
    setDetails('');
    setSubmitterName('');
    setAnalysisOutcomeForSave(null);
    setQuestionAnalysisResultDisplay(null);
    setCurrentMessage(null);
    setFormStep('answering_questions');
    setIsSubmitting(false);
    setIsHintVisible(false);
  }, [formKey]);


  const clearCurrentMessage = () => {
    if (currentMessage) setCurrentMessage(null);
  };

  const handleCurrentAnswerSelection = (answer: Answer) => {
    clearCurrentMessage();
    setCurrentAnswerForFocusedQuestion(answer);
  };

  const finalizeAnalysis = (
    outcome: FinalAnalysisResultType,
    questionsAnsweredInFlow: QuestionAnswer[]
  ) => {
    setAnalysisOutcomeForSave(outcome);
    setAnsweredQuestionsLog(questionsAnsweredInFlow); 
    setIsHintVisible(false); 

    let title: string;
    let description: string;
    let isGapDerived = false;

    switch (outcome) {
      case 'GAP_LEGISLACAO':
        title = "É um Gap de Legislação";
        description = "A análise indica uma alta probabilidade de ser um gap de legislação. Por favor, preencha os detalhes abaixo para registro.";
        isGapDerived = true;
        break;
      case 'BUG':
        title = "Indica ser um Bug";
        description = "A análise indica que a demanda se refere a um bug no sistema que necessita correção. Por favor, preencha os detalhes abaixo para registro.";
        isGapDerived = true; 
        break;
      case 'REQUISITO_MELHORIA_CORRECAO':
      default:
        title = "Não parece ser Gap ou Bug específico";
        description = "A análise indica que a demanda pode ser tratada como um requisito de negócio, melhoria ou correção não classificada como gap ou bug técnico evidente. Por favor, preencha os detalhes abaixo para registro.";
        isGapDerived = false;
        break;
    }
    setQuestionAnalysisResultDisplay({ outcome, title, description, isGap: isGapDerived });
    setFormStep('providing_details');
    setCurrentQuestionId(null); 
    setCurrentAnswerForFocusedQuestion(null);
  };

  const handleNextQuestion = () => {
    if (!currentQuestionId || !currentAnswerForFocusedQuestion) {
      setCurrentMessage({ message: 'Por favor, selecione uma resposta.', type: 'error' });
      return;
    }
    clearCurrentMessage();
    setIsHintVisible(false); 

    const currentNode = DECISION_TREE[currentQuestionId];
    if (!currentNode) {
      setCurrentMessage({ message: 'Erro: Nó da decisão não encontrado.', type: 'error' });
      return;
    }

    const newLogEntry: QuestionAnswer = {
      questionId: currentNode.questionId,
      questionText: currentNode.questionText,
      answer: currentAnswerForFocusedQuestion,
    };
    const updatedLog = [...answeredQuestionsLog, newLogEntry];

    const decisionPath = currentAnswerForFocusedQuestion === 'sim' ? currentNode.onSim : currentNode.onNao;

    if (decisionPath.result) {
      finalizeAnalysis(decisionPath.result, updatedLog);
    } else if (decisionPath.nextQuestionId) {
      setCurrentQuestionId(decisionPath.nextQuestionId);
      setAnsweredQuestionsLog(updatedLog);
      setCurrentAnswerForFocusedQuestion(null); 
    } else {
      setCurrentMessage({ message: 'Erro: Configuração de fluxo inválida.', type: 'error' });
    }
  };

  const handlePreviousQuestion = () => {
    if (answeredQuestionsLog.length > 0) {
      clearCurrentMessage();
      setIsHintVisible(false); 
      const lastAnswered = answeredQuestionsLog[answeredQuestionsLog.length - 1];
      setCurrentQuestionId(lastAnswered.questionId);
      setCurrentAnswerForFocusedQuestion(lastAnswered.answer);
      setAnsweredQuestionsLog(answeredQuestionsLog.slice(0, -1));
      
      if (formStep === 'providing_details' || formStep === 'submission_complete') {
        setFormStep('answering_questions');
        setQuestionAnalysisResultDisplay(null);
        setAnalysisOutcomeForSave(null);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearCurrentMessage();

    if (!submitterName.trim()) {
      setCurrentMessage({ message: 'Por favor, informe seu nome.', type: 'error' });
      return;
    }
    if (!details.trim()) {
      setCurrentMessage({ message: 'Por favor, forneça os detalhes da situação.', type: 'error' });
      return;
    }
    if (!analysisOutcomeForSave) {
      setCurrentMessage({ message: 'Resultado da análise não definido. Por favor, reinicie.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    const newEntry: HistoricalEntry = {
      clientGeneratedId: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      answeredQuestions: answeredQuestionsLog,
      analysisOutcome: analysisOutcomeForSave,
      isGap: questionAnalysisResultDisplay?.isGap || false,
      details: details.trim(),
      submitterName: submitterName.trim(),
    };

    try {
      const existingEntriesString = localStorage.getItem(LOCAL_STORAGE_KEY);
      const existingEntries: HistoricalEntry[] = existingEntriesString ? JSON.parse(existingEntriesString) : [];
      existingEntries.unshift(newEntry); 
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingEntries));
      
      setCurrentMessage({ message: 'Análise registrada com sucesso localmente!', type: 'success' });
      setFormStep('submission_complete');
    } catch (error) {
      console.error('Failed to save to LocalStorage:', error);
      setCurrentMessage({ 
        message: `Falha ao registrar a análise localmente. Verifique as permissões de armazenamento do navegador. Detalhes: ${error instanceof Error ? error.message : String(error)}`, 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setFormKey(Date.now()); 
  };

  const currentQuestionNode = currentQuestionId ? DECISION_TREE[currentQuestionId] : null;

  const renderCurrentQuestion = () => {
    if (!currentQuestionNode) return null;
    const isSpecialCaseSim = currentQuestionNode.questionId === 'q_nunca_teve_func';

    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto">
        <div className={`text-center pt-4 ${isHintVisible && currentQuestionNode.hintText ? 'mb-2' : 'mb-6'}`}>
          <div className="inline-flex items-baseline justify-center flex-wrap gap-x-2">
            <p className="text-xl sm:text-2xl font-semibold text-slate-800 leading-tight">
                {currentQuestionNode.questionText}
            </p>
            {currentQuestionNode.hintText && (
              <button
                onClick={() => setIsHintVisible(prev => !prev)}
                className="text-sky-600 hover:text-sky-700 text-xs font-medium inline-flex items-center py-0.5 px-1.5 rounded-md hover:bg-sky-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 self-center"
                aria-expanded={isHintVisible}
                aria-controls={`hint-${currentQuestionNode.questionId}`}
              >
                <InformationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                {isHintVisible ? 'Ocultar Dica' : 'Ver Dica'}
              </button>
            )}
          </div>
        </div>

        {currentQuestionNode.hintText && isHintVisible && (
          <div
            id={`hint-${currentQuestionNode.questionId}`}
            className="mb-6 p-3 bg-sky-50 border border-sky-200 rounded-lg text-sm text-slate-700 text-left shadow-sm"
            style={{ whiteSpace: 'pre-line' }} 
          >
            {currentQuestionNode.hintText}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {[
            { value: 'sim' as Answer, label: isSpecialCaseSim ? 'Sim (nunca teve)' : 'Sim', Icon: CheckCircleIcon, color: 'sky' },
            { value: 'nao' as Answer, label: 'Não', Icon: XCircleIcon, color: 'red' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleCurrentAnswerSelection(option.value)}
              aria-pressed={currentAnswerForFocusedQuestion === option.value}
              className={`w-full flex items-center justify-center text-left p-4 sm:p-5 border-2 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50
                ${currentAnswerForFocusedQuestion === option.value
                  ? `bg-${option.color}-500 border-${option.color}-600 text-white shadow-lg scale-105`
                  : `bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400`}
                ${currentAnswerForFocusedQuestion === option.value ? `focus:ring-${option.color}-400` : `focus:ring-slate-300`}
              `}
            >
              <option.Icon className={`h-6 w-6 sm:h-7 sm:w-7 mr-3 flex-shrink-0 ${currentAnswerForFocusedQuestion === option.value ? 'text-white' : `text-${option.color}-500`}`} />
              <span className="text-base sm:text-lg font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handlePreviousQuestion}
            disabled={answeredQuestionsLog.length === 0}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Voltar para pergunta anterior"
          >
            <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
            Voltar
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={!currentAnswerForFocusedQuestion}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Avançar para próxima pergunta ou resultado"
          >
            Avançar
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    );
  };

  const renderDetailsForm = () => {
    if (!questionAnalysisResultDisplay) return null;
    const { title, description, outcome } = questionAnalysisResultDisplay;
    let IconComponent;
    let iconColorClass;

    switch (outcome) {
        case 'GAP_LEGISLACAO': IconComponent = ExclamationTriangleIcon; iconColorClass = 'text-amber-500'; break;
        case 'BUG': IconComponent = BugAntIcon; iconColorClass = 'text-red-500'; break;
        case 'REQUISITO_MELHORIA_CORRECAO':
        default: IconComponent = InformationCircleIcon; iconColorClass = 'text-sky-500'; break;
    }

    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <IconComponent className={`h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 ${iconColorClass}`} />
          <h2 className={`text-2xl sm:text-3xl font-bold ${iconColorClass.replace('text-', 'text-')}`}>{title}</h2>
          <p className="mt-2 text-slate-600 text-base sm:text-lg">{description}</p>
        </div>

        {outcome === 'GAP_LEGISLACAO' && (
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-amber-700">Atenção! Levar para a daily para análise da priorização versus a complexidade.</p>
                <p className="text-sm text-amber-600 mt-1">Se mudar a regra de negócio lembre de envolver o PO.</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="submitterName" className="block text-sm font-medium text-slate-700 mb-1">
              Seu Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="submitterName"
              value={submitterName}
              onChange={e => setSubmitterName(e.target.value)}
              required
              className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              placeholder="Ex: João Silva"
              aria-describedby="submitterName-help"
            />
            <p id="submitterName-help" className="mt-1.5 text-xs text-slate-500">
              Campo obrigatório.
            </p>
          </div>
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-slate-700 mb-1">
              Detalhes da Situação <span className="text-red-500">*</span>
            </label>
            <textarea
              id="details"
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={5}
              required
              className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              placeholder="Descreva a situação, inclua links para tickets (Jira, etc.), nome da lei/norma, artigos, e qualquer outra informação relevante para a análise e registro."
              aria-describedby="details-help"
            />
            <p id="details-help" className="mt-1.5 text-xs text-slate-500">
              Campo obrigatório. Forneça o máximo de contexto possível.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
            <button
              type="button"
              onClick={handlePreviousQuestion} 
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Voltar para as perguntas"
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
              Voltar e Rever Respostas
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ArchiveBoxIcon className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? 'Registrando...' : 'Registrar Análise'}
            </button>
          </div>
        </form>
      </div>
    );
  };

 const renderSubmissionComplete = () => {
    let IconComponent;
    let titleText;
    let messageText;
    let bgColorClass;
    let textColorClass;
    let borderColorClass;

    if (currentMessage?.type === 'success') {
        IconComponent = CheckCircleIcon;
        titleText = "Análise Registrada!";
        messageText = currentMessage.message;
        bgColorClass = "bg-green-50";
        textColorClass = "text-green-700";
        borderColorClass = "border-green-400";
    } else { 
        IconComponent = XCircleIcon;
        titleText = "Falha no Registro";
        messageText = currentMessage?.message || "Ocorreu um erro inesperado.";
        bgColorClass = "bg-red-50";
        textColorClass = "text-red-700";
        borderColorClass = "border-red-400";
    }

    return (
        <div className={`bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-xl mx-auto`}>
            <div className={`p-4 sm:p-6 border-l-4 ${borderColorClass} ${bgColorClass} rounded-md`}>
                <div className="flex">
                    <div className="flex-shrink-0">
                        <IconComponent className={`h-10 w-10 sm:h-12 sm:w-12 ${textColorClass.replace('700', '500')}`} aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                        <h3 className={`text-xl sm:text-2xl font-bold ${textColorClass}`}>{titleText}</h3>
                        <div className={`mt-2 text-base ${textColorClass}`}>
                            <p>{messageText}</p>
                        </div>
                         <div className="mt-6">
                            <button
                                onClick={handleRestart}
                                className={`w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white 
                                ${currentMessage?.type === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 transition-colors`}
                            >
                                Iniciar Nova Análise
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


  return (
    <div className="py-6 sm:py-10">
      {currentMessage && (
        <div 
          className={`fixed top-5 right-5 max-w-sm w-full p-4 rounded-lg shadow-lg z-50 text-white
            ${currentMessage.type === 'success' ? 'bg-green-500' : ''}
            ${currentMessage.type === 'error' ? 'bg-red-500' : ''}
            ${currentMessage.type === 'info' ? 'bg-sky-500' : ''}
          `}
          role="alert"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{currentMessage.message}</span>
            <button onClick={clearCurrentMessage} aria-label="Fechar notificação" className="ml-2 text-xl font-bold leading-none">&times;</button>
          </div>
        </div>
      )}

      {formStep === 'answering_questions' && renderCurrentQuestion()}
      {formStep === 'providing_details' && renderDetailsForm()}
      {formStep === 'submission_complete' && renderSubmissionComplete()}
    </div>
  );
};

export default QuestionnaireForm;
