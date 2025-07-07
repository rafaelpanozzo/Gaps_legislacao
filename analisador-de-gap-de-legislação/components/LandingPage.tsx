import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircleIcon, DocumentMagnifyingGlassIcon, QuestionMarkCircleIcon, CogIcon, ArrowRightCircleIcon, PresentationChartLineIcon, ScaleIcon } from '@heroicons/react/24/outline'; // MODIFICADO AQUI

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl max-w-5xl mx-auto text-slate-700">
      <header className="text-center mb-10 sm:mb-12">
        <ScaleIcon className="h-20 w-20 sm:h-24 sm:w-24 text-sky-600 mx-auto mb-4" /> {/* MODIFICADO AQUI */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
          Sistema de Identificação de Gaps de Legislação
        </h1>
        <p className="mt-3 sm:mt-4 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
          Avalie se sua demanda representa um gap de legislação através de perguntas direcionadas.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start">
        {/* Coluna da Esquerda: Como Funciona */}
        <div className="bg-slate-50 p-6 rounded-lg shadow-lg border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
            <CogIcon className="h-7 w-7 mr-3 text-sky-600" />
            Como Funciona
          </h2>
          <ol className="space-y-5">
            {[
              { text: "Responda as perguntas objetivas com Sim ou Não.", icon: QuestionMarkCircleIcon },
              { text: "O sistema avalia automaticamente suas respostas com base em um fluxo lógico.", icon: ArrowRightCircleIcon },
              { text: "Receba o resultado da avaliação (Gap, Bug ou Melhoria).", icon: PresentationChartLineIcon },
              { text: "Forneça detalhes obrigatórios sobre a situação (ticket, issue Jira, etc.) para registro.", icon: DocumentMagnifyingGlassIcon },
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 bg-sky-600 text-white text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mr-4 mt-1">
                  {index + 1}
                </span>
                <span className="text-slate-700 leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Coluna da Direita: Regras e Botões */}
        <div className="bg-sky-50 p-6 rounded-lg shadow-lg border border-sky-200">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
            <DocumentMagnifyingGlassIcon className="h-7 w-7 mr-3 text-sky-600" />
            Entendendo a Análise
          </h2>
          <p className="text-slate-700 mb-6 leading-relaxed">
            O sistema utiliza um fluxo de perguntas predefinidas para determinar se a sua necessidade pode ser classificada como um Gap de Legislação, um Bug ou uma Melhoria. Cada resposta direciona para a próxima etapa, culminando em uma análise preliminar. Responda com atenção para obter a classificação mais precisa.
          </p>
          <div className="mt-8 space-y-4">
            <Link
              to="/questionario"
              className="w-full flex items-center justify-center px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg"
            >
              <PlayCircleIcon className="h-6 w-6 mr-2.5" />
              Iniciar Análise
            </Link>
            <Link
              to="/historico"
              className="w-full flex items-center justify-center px-8 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg"
            >
              <PresentationChartLineIcon className="h-6 w-6 mr-2.5" />
              Consultar Histórico
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;