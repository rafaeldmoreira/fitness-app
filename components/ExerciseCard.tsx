import React from 'react';
import { Database } from '../types/types';
import { Icon } from './Icons';

type Exercise = Database['public']['Tables']['exercises']['Row'];

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-surface border border-slate-700 rounded-xl overflow-hidden hover:border-primary transition-all active:scale-98 cursor-pointer flex flex-col h-full shadow-sm"
    >
      <div className="relative aspect-video bg-slate-800 w-full overflow-hidden">
        {exercise.image_url ? (
          <img 
            src={exercise.image_url} 
            alt={exercise.name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <Icon name="Dumbbell" className="w-12 h-12 opacity-20" />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
            <span className="bg-dark/80 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-white border border-slate-600 capitalize">
                {exercise.muscle_group}
            </span>
        </div>
        
        {exercise.is_verified && (
            <div className="absolute top-2 left-2" title="Verificado">
                <span className="bg-primary/90 backdrop-blur-sm p-1 rounded-full text-white">
                    <Icon name="Check" className="w-3 h-3" />
                </span>
            </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-white text-lg leading-tight mb-1">{exercise.name}</h3>
        <p className="text-xs text-slate-400 capitalize mb-2">{exercise.equipment}</p>
        
        {/* Future placeholder for user stats */}
        <div className="mt-auto pt-2 border-t border-slate-700/50 flex items-center gap-2">
           <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">
              Ver detalhes
           </span>
        </div>
      </div>
    </div>
  );
};
