import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { Database } from './types';

type FitnessGoal = Database['public']['Tables']['profiles']['Row']['fitness_goal'];
type ExperienceLevel = Database['public']['Tables']['profiles']['Row']['experience_level'];
type Gender = Database['public']['Tables']['profiles']['Row']['gender'];

export const Onboarding: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'male' as Gender,
    experience_level: 'beginner' as ExperienceLevel,
    fitness_goal: 'hypertrophy' as FitnessGoal,
  });

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          age: parseInt(formData.age) || null,
          weight: parseFloat(formData.weight) || null,
          height: parseFloat(formData.height) || null,
          gender: formData.gender,
          experience_level: formData.experience_level,
          fitness_goal: formData.fitness_goal,
        } as any)
        .eq('id', user.id);

      if (error) throw error;
      
      // Update context state
      await refreshProfile();
      
    } catch (error) {
      console.error(error);
      alert('Erro ao guardar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-white mb-4">Sobre ti</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Idade</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="block w-full rounded-lg bg-surface border-slate-700 text-white p-3 focus:ring-primary focus:border-primary"
            placeholder="Ex: 25"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Peso (kg)</label>
            <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="block w-full rounded-lg bg-surface border-slate-700 text-white p-3 focus:ring-primary focus:border-primary"
                placeholder="75.5"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Altura (cm)</label>
            <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                className="block w-full rounded-lg bg-surface border-slate-700 text-white p-3 focus:ring-primary focus:border-primary"
                placeholder="180"
            />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Género</label>
            <div className="grid grid-cols-3 gap-2">
                {['male', 'female', 'other'].map((g) => (
                    <button
                        key={g}
                        onClick={() => setFormData({...formData, gender: g as Gender})}
                        className={`p-2 rounded-lg border ${formData.gender === g ? 'bg-primary border-primary text-white' : 'bg-surface border-slate-700 text-slate-400'}`}
                    >
                        {g === 'male' ? 'H' : g === 'female' ? 'M' : 'Outro'}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        className="w-full bg-primary py-3 rounded-xl font-bold text-white mt-6"
      >
        Continuar
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-4">Objetivos</h3>

        <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Experiência</label>
            <div className="space-y-2">
                {[
                    { val: 'beginner', label: 'Iniciante', desc: 'Menos de 6 meses de treino' },
                    { val: 'intermediate', label: 'Intermédio', desc: '6 meses a 2 anos' },
                    { val: 'advanced', label: 'Avançado', desc: '+2 anos de treino sério' }
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => setFormData({...formData, experience_level: opt.val as ExperienceLevel})}
                        className={`w-full p-4 rounded-xl border text-left flex flex-col transition-all ${
                            formData.experience_level === opt.val 
                            ? 'bg-primary/20 border-primary' 
                            : 'bg-surface border-slate-700 hover:border-slate-500'
                        }`}
                    >
                        <span className={`font-bold ${formData.experience_level === opt.val ? 'text-primary' : 'text-white'}`}>{opt.label}</span>
                        <span className="text-xs text-slate-400">{opt.desc}</span>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Qual o teu foco principal?</label>
            <div className="grid grid-cols-2 gap-2">
                {[
                    { val: 'hypertrophy', label: 'Hipertrofia' },
                    { val: 'strength', label: 'Força' },
                    { val: 'weight_loss', label: 'Perda Peso' },
                    { val: 'endurance', label: 'Resistência' }
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => setFormData({...formData, fitness_goal: opt.val as FitnessGoal})}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                            formData.fitness_goal === opt.val 
                            ? 'bg-secondary/20 border-secondary text-secondary' 
                            : 'bg-surface border-slate-700 text-slate-300'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex gap-3 mt-8">
            <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-400 bg-surface border border-slate-700"
            >
                Voltar
            </button>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] py-3 rounded-xl font-bold text-dark bg-secondary hover:bg-emerald-400 disabled:opacity-50"
            >
                {loading ? 'A guardar...' : 'Começar!'}
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Configurar Perfil</h2>
            <div className="flex justify-center gap-2 mt-4">
                <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-800'}`}></div>
                <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-800'}`}></div>
            </div>
        </div>
        
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
};