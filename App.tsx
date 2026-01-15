import React, { useState } from 'react';
import { NAV_ITEMS, APP_NAME, MOCK_STATS } from './utils/constants';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { Icon } from './components/Icons';

const DashboardView = ({ profile }: { profile: any }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-2xl shadow-xl text-white">
      <p className="text-blue-100 text-sm font-medium mb-1">Bem-vindo de volta,</p>
      <h2 className="text-3xl font-bold mb-4 capitalize">{profile?.username || 'Atleta'}</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{profile?.level || 1}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">Nível</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{profile?.weight || '--'}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">Kg</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{MOCK_STATS[0].value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">Treinos</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
        Atividade Recente
        <span className="text-xs text-primary font-medium">Ver tudo</span>
      </h3>
      <div className="bg-surface rounded-xl p-4 border border-slate-700 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-slate-700 last:border-0 pb-3 last:pb-0">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400">
               <span className="text-xs font-bold">2{i} FEV</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-slate-200">Upper Body Power</h4>
              <p className="text-xs text-slate-500">55 min • 12,500kg vol</p>
            </div>
            <div className="text-right">
              <span className="block text-xs text-secondary font-bold">+2 PRs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const WorkoutView = () => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-2">Hora do Show</h2>
      <p className="text-slate-400 text-sm px-8">Selecione uma rotina ou comece um treino livre para registar o seu progresso.</p>
    </div>

    <button className="w-full bg-secondary hover:bg-emerald-400 text-dark font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-900/20 transform transition active:scale-95 flex items-center justify-center gap-2">
      <Icon name="Plus" className="w-6 h-6" />
      INICIAR TREINO LIVRE
    </button>

    <div>
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">As tuas Rotinas</h3>
      <div className="grid gap-3">
        {['Push Day A', 'Pull Day B', 'Legs Hypertrophy'].map((routine) => (
          <div key={routine} className="bg-surface border border-slate-700 p-4 rounded-xl flex justify-between items-center group active:border-primary transition-colors cursor-pointer">
            <div>
              <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{routine}</h4>
              <p className="text-xs text-slate-500">6 Exercícios • ~45 min</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-primary">
              <Icon name="Dumbbell" className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RoutinesView = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-end mb-2">
      <h2 className="text-2xl font-bold">Gestão de Rotinas</h2>
      <button className="bg-primary text-white p-2 rounded-lg">
        <Icon name="Plus" className="w-5 h-5" />
      </button>
    </div>
    
    <div className="bg-surface/50 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
      <p>Aqui você poderá criar, editar e organizar os seus planos de treino.</p>
    </div>
  </div>
);

const MainApp: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('/');

  const renderContent = () => {
    switch (activeTab) {
      case '/':
        return <DashboardView profile={profile} />;
      case '/workout':
        return <WorkoutView />;
      case '/routines':
        return <RoutinesView />;
      case '/exercises':
        return <ExerciseLibrary />;
      case '/profile':
        return (
          <div className="space-y-4">
             <h2 className="text-2xl font-bold">Perfil</h2>
             <div className="bg-surface p-4 rounded-xl">
                 <p className="text-slate-400 mb-4">Logado como: <span className="text-white">{profile?.username}</span></p>
                 <button onClick={signOut} className="flex items-center gap-2 text-red-400 hover:text-red-300">
                     <Icon name="LogOut" className="w-5 h-5" /> Terminar Sessão
                 </button>
             </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <h2 className="text-xl font-bold mb-2">Em Construção</h2>
            <p className="text-sm">O módulo {activeTab} estará disponível em breve.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark text-slate-100 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur-md border-b border-slate-700 px-4 py-3 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
          <Icon name="Dumbbell" className="w-6 h-6" />
          {APP_NAME}
        </h1>
        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
             <img src={profile?.avatar_url || "https://picsum.photos/100/100"} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-slate-700 pb-safe pt-2 px-2 z-20">
        <ul className="flex justify-around items-center">
          {NAV_ITEMS.map((item) => (
            <li key={item.path} className="flex-1">
              <button
                onClick={() => setActiveTab(item.path)}
                className={`w-full flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                  activeTab === item.path 
                    ? 'text-primary' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Icon name={item.icon} className={`w-6 h-6 ${activeTab === item.path ? 'fill-primary/10' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

const AppContent: React.FC = () => {
    const { session, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!session) {
        return <Auth />
    }

    // Check if onboarding is needed (e.g. fitness_goal is missing)
    if (session && profile && !profile.fitness_goal) {
        return <Onboarding />
    }

    return <MainApp />
}

const App: React.FC = () => {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
};

export default App;
