import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/types';
import { useAuth } from '../contexts/AuthContext';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../utils/constants';
import { Icon } from './Icons';

interface CreateExerciseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    muscle_group: MUSCLE_GROUPS[0],
    equipment: EQUIPMENT_TYPES[0],
    instructions: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // 1. Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to Supabase Storage 'exercise-media' bucket
      const { error: uploadError } = await supabase.storage
        .from('exercise-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data } = supabase.storage
        .from('exercise-media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const newExercise: Database['public']['Tables']['exercises']['Insert'] = {
        name: formData.name,
        muscle_group: formData.muscle_group,
        equipment: formData.equipment,
        instructions: formData.instructions,
        image_url: imageUrl,
        created_by: user.id,
        is_verified: false, // Default for user created
      };

      const { error } = await supabase
        .from('exercises')
        .insert(newExercise);

      if (error) throw error;
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating exercise:', error);
      alert('Erro ao criar exercício: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-xl font-bold text-white">Novo Exercício</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 flex-1">
          <form id="create-exercise-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Imagem de Capa</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-video rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-slate-700 transition-all overflow-hidden"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Icon name="Camera" className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Toque para adicionar foto</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Exercício</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-dark border border-slate-700 rounded-lg p-3 text-white focus:ring-primary focus:border-primary"
                placeholder="Ex: Supino Reto com Halteres"
              />
            </div>

            {/* Selects Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Músculo Alvo</label>
                <div className="relative">
                    <select
                        value={formData.muscle_group}
                        onChange={e => setFormData({...formData, muscle_group: e.target.value})}
                        className="w-full bg-dark border border-slate-700 rounded-lg p-3 text-white appearance-none focus:ring-primary focus:border-primary"
                    >
                        {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <Icon name="ChevronDown" className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Equipamento</label>
                <div className="relative">
                    <select
                        value={formData.equipment}
                        onChange={e => setFormData({...formData, equipment: e.target.value})}
                        className="w-full bg-dark border border-slate-700 rounded-lg p-3 text-white appearance-none focus:ring-primary focus:border-primary"
                    >
                        {EQUIPMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <Icon name="ChevronDown" className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Instruções (Opcional)</label>
              <textarea
                rows={3}
                value={formData.instructions}
                onChange={e => setFormData({...formData, instructions: e.target.value})}
                className="w-full bg-dark border border-slate-700 rounded-lg p-3 text-white focus:ring-primary focus:border-primary"
                placeholder="Descreva a execução correta..."
              />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
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
            form="create-exercise-form"
            disabled={loading}
            className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'A guardar...' : 'Criar Exercício'}
          </button>
        </div>

      </div>
    </div>
  );
};
