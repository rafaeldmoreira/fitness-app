import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './Icons';

interface CreateRoutineModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('routines')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          is_public: false
        });

      if (error) throw error;
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating routine:', error);
      alert('Erro ao criar rotina: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-xl font-bold text-white">Nova Rotina</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <form id="create-routine-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Rotina</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-dark border border-slate-700 rounded-lg p-3 text-white focus:ring-primary focus:border-primary"
                placeholder="Ex: Treino A - Peito e Tríceps"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-dark border border-slate-700 rounded-lg p-3 text-white focus:ring-primary focus:border-primary"
                placeholder="Ex: Foco em força máxima, descansos de 3min..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="create-routine-form"
            disabled={loading}
            className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            {loading ? 'A criar...' : 'Criar Rotina'}
          </button>
        </div>

      </div>
    </div>
  );
};