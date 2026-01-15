import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/types';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './Icons';
import { CreateRoutineModal } from './CreateRoutineModal';

type Routine = Database['public']['Tables']['routines']['Row'];

export const RoutinesList: React.FC = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRoutines = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutines(data || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoutine = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem a certeza que deseja eliminar esta rotina?')) return;

    try {
      const { error } = await supabase.from('routines').delete().eq('id', id);
      if (error) throw error;
      setRoutines(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting routine:', error);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [user]);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-2xl font-bold">Gestão de Rotinas</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-blue-600 text-white p-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
        >
          <Icon name="Plus" className="w-5 h-5" />
        </button>
      </div>
      
      {loading ? (
        <div className="space-y-3">
             {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface/50 rounded-xl animate-pulse"></div>)}
        </div>
      ) : routines.length === 0 ? (
        <div className="bg-surface/50 border border-slate-700 rounded-xl p-8 text-center flex flex-col items-center">
          <Icon name="List" className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-slate-400 mb-4">Ainda não criou nenhuma rotina de treino.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-primary font-bold hover:underline"
          >
            Criar a primeira rotina
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
            {routines.map((routine) => (
                <div key={routine.id} className="bg-surface border border-slate-700 p-4 rounded-xl flex justify-between items-center group active:border-primary transition-all cursor-pointer hover:shadow-lg">
                    <div className="flex-1">
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{routine.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{routine.description || 'Sem descrição'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-primary">
                            <Icon name="Dumbbell" className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => deleteRoutine(routine.id, e)}
                            className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-red-900/50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                        >
                            <Icon name="Trash" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {isModalOpen && (
        <CreateRoutineModal 
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
                setIsModalOpen(false);
                fetchRoutines();
            }}
        />
      )}
    </div>
  );
};