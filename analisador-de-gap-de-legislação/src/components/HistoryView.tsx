
import React, { useState, useEffect } from 'react';
import { LOCAL_STORAGE_KEY } from '../constants'; 
import type { HistoricalEntry, FinalAnalysisResultType, QuestionAnswer } from '../types'; 
import { FunnelIcon, MagnifyingGlassIcon, CalendarDaysIcon, UserCircleIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, InformationCircleIcon, ExclamationTriangleIcon, BugAntIcon, ArrowPathIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

// Helper function to get display properties for each outcome
const getOutcomeDisplayProps = (outcome: FinalAnalysisResultType) => {
  switch (outcome) {
    case 'GAP_LEGISLACAO':
      return { text: "Gap de Legislação", color: "text-amber-600", Icon: ExclamationTriangleIcon, iconColor: "text-amber-500" };
    case 'BUG':
      return { text: "Bug", color: "text-red-600", Icon: BugAntIcon, iconColor: "text-red-500" };
    case 'REQUISITO_MELHORIA_CORRECAO':
      return { text: "Requisito/Melhoria", color: "text-green-600", Icon: InformationCircleIcon, iconColor: "text-green-500" };
    default:
      return { text: "Indefinido", color: "text-slate-600", Icon: InformationCircleIcon, iconColor: "text-slate-500" };
  }
};


const HistoryView: React.FC = () => {
  const [allEntries, setAllEntries] = useState<HistoricalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<HistoricalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [keyword, setKeyword] = useState<string>('');
  const [submitterFilter, setSubmitterFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const fetchHistory = () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedEntriesString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedEntriesString) {
        const parsedEntries: HistoricalEntry[] = JSON.parse(storedEntriesString);
        // Ensure answeredQuestions is always an array, even if old data had it as string by mistake
        const sanitizedEntries = parsedEntries.map(entry => ({
          ...entry,
          answeredQuestions: Array.isArray(entry.answeredQuestions) ? entry.answeredQuestions : [],
          timestamp: entry.timestamp || new Date(0).toISOString(), // Fallback for old data
        }));
        // Sort by timestamp descending
        sanitizedEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAllEntries(sanitizedEntries);
      } else {
        setAllEntries([]); // No entries found
      }
    } catch (err) {
      console.error("Failed to load history from LocalStorage:", err);
      setError(err instanceof Error ? `Erro ao processar dados locais: ${err.message}` : 'Erro desconhecido ao carregar histórico local.');
      setAllEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    let tempEntries = [...allEntries];

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      tempEntries = tempEntries.filter(entry => 
        entry.details.toLowerCase().includes(lowerKeyword)
      );
    }

    if (submitterFilter) {
      const lowerSubmitter = submitterFilter.toLowerCase();
      tempEntries = tempEntries.filter(entry => 
        entry.submitterName?.toLowerCase().includes(lowerSubmitter)
      );
    }

    if (startDate) {
      const startDateTime = new Date(startDate).setHours(0,0,0,0);
      tempEntries = tempEntries.filter(entry => new Date(entry.timestamp).getTime() >= startDateTime);
    }

    if (endDate) {
      const endDateTime = new Date(endDate).setHours(23,59,59,999);
      tempEntries = tempEntries.filter(entry => new Date(entry.timestamp).getTime() <= endDateTime);
    }

    setFilteredEntries(tempEntries);
  }, [keyword, submitterFilter, startDate, endDate, allEntries]);

  const clearFilters = () => {
    setKeyword('');
    setSubmitterFilter('');
    setStartDate('');
    setEndDate('');
  };

  const toggleEntryExpansion = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };
  
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return "Data inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-4xl mx-auto text-center">
         <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center border-b-2 border-sky-500 pb-4">
            Histórico de Análises
        </h2>
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="ml-3 text-slate-600 text-lg">Carregando histórico local...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center border-b-2 border-sky-500 pb-4">
            Histórico de Análises
        </h2>
        <div className="py-10 text-red-600 bg-red-50 p-4 rounded-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="font-semibold">Erro ao carregar o histórico local:</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center mx-auto"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center border-b-2 border-sky-500 pb-4">
        Histórico de Análises
      </h2>

      {/* Filters Section */}
      <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
          <FunnelIcon className="h-6 w-6 mr-2 text-sky-600"/> Filtros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-slate-600 mb-1">Palavra-chave nos Detalhes</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Ex: Jira-123, específico"
                className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="submitterFilter" className="block text-sm font-medium text-slate-600 mb-1">Nome do Solicitante</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircleIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="submitterFilter"
                value={submitterFilter}
                onChange={e => setSubmitterFilter(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-600 mb-1">Data Inicial</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-600 mb-1">Data Final</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Results Section */}
      {allEntries.length === 0 && !isLoading ? (
        <div className="text-center py-10">
          <ArchiveBoxXMarkIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Nenhum histórico encontrado.</p>
          <p className="text-slate-500 text-sm">Comece uma nova análise para ver os registros aqui.</p>
        </div>
      ) : filteredEntries.length === 0 && allEntries.length > 0 ? (
         <div className="text-center py-10">
          <MagnifyingGlassIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Nenhum registro corresponde aos filtros aplicados.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map(entry => {
            const outcomeProps = getOutcomeDisplayProps(entry.analysisOutcome);
            const IconComponent = outcomeProps.Icon;
            return (
              <div key={entry.clientGeneratedId} className="bg-slate-50 border border-slate-200 rounded-lg shadow-md overflow-hidden">
                <div 
                  className="p-5 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => toggleEntryExpansion(entry.clientGeneratedId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleEntryExpansion(entry.clientGeneratedId)}}
                  aria-expanded={expandedEntryId === entry.clientGeneratedId}
                  aria-controls={`details-${entry.clientGeneratedId}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        {formatDate(entry.timestamp)} 
                        {entry.submitterName && ` - Por: ${entry.submitterName}`}
                      </p>
                      <p className={`font-semibold text-lg ${outcomeProps.color}`}>
                        <span className="flex items-center">
                          <IconComponent className={`h-5 w-5 mr-1.5 ${outcomeProps.iconColor}`}/> 
                          {outcomeProps.text}
                        </span>
                      </p>
                    </div>
                    <button className="text-sky-600 hover:text-sky-800" aria-label={expandedEntryId === entry.clientGeneratedId ? "Recolher detalhes" : "Expandir detalhes"}>
                      {expandedEntryId === entry.clientGeneratedId ? <ChevronUpIcon className="h-6 w-6"/> : <ChevronDownIcon className="h-6 w-6"/>}
                    </button>
                  </div>
                </div>
                
                {expandedEntryId === entry.clientGeneratedId && (
                  <div id={`details-${entry.clientGeneratedId}`} className="px-5 pb-5 pt-3 border-t border-slate-200 bg-white">
                    <h4 className="font-semibold text-slate-700 mb-2">Detalhes da Situação:</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-md border border-slate-200">{entry.details}</p>
                    
                    <h4 className="font-semibold text-slate-700 mt-4 mb-2">Respostas do Questionário:</h4>
                    <ul className="space-y-2 text-sm">
                      {entry.answeredQuestions.map(aq => (
                        <li key={aq.questionId} className="p-2 border border-slate-200 rounded-md bg-slate-50">
                          <p className="font-medium text-slate-700">{aq.questionText}</p>
                          <p className={`capitalize font-semibold ${aq.answer === 'sim' ? 'text-sky-600' : 'text-red-600'}`}>
                            Resposta: {aq.answer === 'sim' ? (aq.questionId === 'q_nunca_teve_func' ? 'Sim (nunca teve)' : 'Sim') : 'Não'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
