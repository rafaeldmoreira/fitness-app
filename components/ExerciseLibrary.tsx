import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/types';
import { ExerciseCard } from './ExerciseCard';
import { CreateExerciseModal } from './CreateExerciseModal';
import { Icon } from './Icons';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../utils/constants';

type Exercise = Database['public']['Tables']['exercises']['Row'];

export const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (filterMuscle) {
        query = query.eq('muscle_group', filterMuscle);
      }
      if (filterEquipment) {
        query = query.eq('equipment', filterEquipment);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExercises();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterMuscle, filterEquipment]);

  return (
    <div className="space-y-4 pb-20 relative h-full flex flex-col">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-dark/95 backdrop-blur pt-2 pb-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Icon name="Search" className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border ${showFilters ? 'bg-primary border-primary text-white' : 'bg-surface border-slate-700 text-slate-400'}`}
          >
            <Icon name="Filter" className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-surface border border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-3 animate-fade-in">
             <div>
                <label className="text-xs text-slate-500 mb-1 block">Grupo Muscular</label>
                <select 
                    className="w-full bg-dark border border-slate-600 rounded-lg p-2 text-sm text-white"
                    value={filterMuscle}
                    onChange={(e) => setFilterMuscle(e.target.value)}
                >
                    <option value="">Todos</option>
                    {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>
             <div>
                <label className="text-xs text-slate-500 mb-1 block">Equipamento</label>
                <select 
                    className="w-full bg-dark border border-slate-600 rounded-lg p-2 text-sm text-white"
                    value={filterEquipment}
                    onChange={(e) => setFilterEquipment(e.target.value)}
                >
                    <option value="">Todos</option>
                    {EQUIPMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
             </div>
             {(filterMuscle || filterEquipment) && (
                 <button 
                    onClick={() => { setFilterMuscle(''); setFilterEquipment(''); }}
                    className="col-span-2 text-xs text-red-400 font-medium text-right mt-1"
                 >
                    Limpar Filtros
                 </button>
             )}
          </div>
        )}
      </div>

      {/* Exercise Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-48 bg-surface/50 rounded-xl animate-pulse"></div>
                ))}
            </div>
        ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Icon name="Dumbbell" className="w-16 h-16 opacity-20 mb-4" />
                <p className="text-lg font-medium">Nenhum exercício encontrado</p>
                <p className="text-sm">Tente outros termos ou crie um novo.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exercises.map((exercise) => (
                <ExerciseCard 
                    key={exercise.id} 
                    exercise={exercise} 
                    onClick={() => console.log('View details', exercise.id)}
                />
            ))}
            </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 bg-secondary text-dark p-4 rounded-full shadow-lg shadow-emerald-900/40 hover:bg-emerald-400 hover:scale-105 transition-all z-20"
      >
        <Icon name="Plus" className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <CreateExerciseModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
                setIsModalOpen(false);
                fetchExercises();
            }}
        />
      )}
    </div>
  );
};
