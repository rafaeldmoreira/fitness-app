import React from 'react';

// Navigation Items
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'Home' },
  { label: 'Treinar', path: '/workout', icon: 'Dumbbell' },
  { label: 'Rotinas', path: '/routines', icon: 'List' },
  { label: 'Exercícios', path: '/exercises', icon: 'Search' },
  { label: 'Perfil', path: '/profile', icon: 'User' },
];

export const APP_NAME = "IronTrack";

// Sample Data for UI Testing (Before DB connection)
export const MOCK_STATS = [
  { label: 'Treinos', value: '42' },
  { label: 'Volume (kg)', value: '12.5k' },
  { label: 'Sequência', value: '4 dias' },
];

export const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdómen', 'Cardio'
];