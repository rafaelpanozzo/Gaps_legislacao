
import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import QuestionnaireForm from './components/QuestionnaireForm.js';
import HistoryView from './components/HistoryView.js';
import LandingPage from './components/LandingPage.js'; // Importa a nova LandingPage
import { DocumentTextIcon, ClockIcon, Bars3Icon, HomeIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const commonLinkClasses = "flex items-center px-4 py-3 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors duration-150 rounded-lg";
  const activeLinkClasses = "bg-sky-100 text-sky-700 font-semibold shadow-inner";
  const headerCommonLinkClasses = "flex items-center px-3 py-2 rounded-md text-sm font-medium";
  const headerActiveLinkClasses = "bg-sky-600 text-white";
  const headerInactiveLinkClasses = "text-slate-300 hover:bg-slate-700 hover:text-white";


  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-100"> {/* Alterado para slate-100 */}
        <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <NavLink to="/" className="flex items-center group">
                <DocumentTextIcon className="h-9 w-9 text-sky-400 group-hover:text-sky-300 transition-colors" />
                <h1 className="ml-3 text-xl sm:text-2xl font-bold tracking-tight group-hover:text-slate-200 transition-colors">
                  Analisador de Gaps
                </h1>
              </NavLink>
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-slate-300 hover:text-white focus:outline-none focus:text-white"
                  aria-label="Abrir menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <Bars3Icon className="h-7 w-7" />
                </button>
              </div>
              <nav className="hidden md:flex space-x-2">
                <NavLink
                  to="/"
                  className={({ isActive }) => `${headerCommonLinkClasses} ${isActive ? headerActiveLinkClasses : headerInactiveLinkClasses}`}
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Início
                </NavLink>
                <NavLink
                  to="/questionario"
                  className={({ isActive }) => `${headerCommonLinkClasses} ${isActive ? headerActiveLinkClasses : headerInactiveLinkClasses}`}
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Análise
                </NavLink>
                <NavLink
                  to="/historico"
                  className={({ isActive }) => `${headerCommonLinkClasses} ${isActive ? headerActiveLinkClasses : headerInactiveLinkClasses}`}
                >
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Histórico
                </NavLink>
              </nav>
            </div>
          </div>
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-slate-700 absolute w-full shadow-lg">
              <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <NavLink
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `${commonLinkClasses} w-full ${isActive ? activeLinkClasses : 'hover:bg-slate-600 text-slate-200'}`}
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Início
                </NavLink>
                <NavLink
                  to="/questionario"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `${commonLinkClasses} w-full ${isActive ? activeLinkClasses : 'hover:bg-slate-600 text-slate-200'}`}
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Análise
                </NavLink>
                <NavLink
                  to="/historico"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `${commonLinkClasses} w-full ${isActive ? activeLinkClasses : 'hover:bg-slate-600 text-slate-200'}`}
                >
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Histórico
                </NavLink>
              </nav>
            </div>
          )}
        </header>

        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/questionario" element={<QuestionnaireForm />} />
            <Route path="/historico" element={<HistoryView />} />
          </Routes>
        </main>

        <footer className="bg-slate-800 text-slate-400 text-center p-4 shadow-inner-top mt-auto">
          <p>&copy; {new Date().getFullYear()} Sistema de Identificação de Gaps de Legislação.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
