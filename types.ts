export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          height: number | null
          weight: number | null
          age: number | null
          gender: string | null
          fitness_goal: 'hypertrophy' | 'strength' | 'weight_loss' | 'endurance' | null
          experience_level: 'beginner' | 'intermediate' | 'advanced' | null
          xp: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          height?: number | null
          weight?: number | null
          age?: number | null
          gender?: string | null
          fitness_goal?: 'hypertrophy' | 'strength' | 'weight_loss' | 'endurance' | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null
          xp?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          height?: number | null
          weight?: number | null
          age?: number | null
          gender?: string | null
          fitness_goal?: 'hypertrophy' | 'strength' | 'weight_loss' | 'endurance' | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null
          xp?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          name: string
          muscle_group: string
          equipment: string
          instructions: string | null
          video_url: string | null
          image_url: string | null
          created_by: string | null
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          muscle_group: string
          equipment: string
          instructions?: string | null
          video_url?: string | null
          image_url?: string | null
          created_by?: string | null
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          muscle_group?: string
          equipment?: string
          instructions?: string | null
          video_url?: string | null
          image_url?: string | null
          created_by?: string | null
          is_verified?: boolean
          created_at?: string
        }
        Relationships: []
      }
      routines: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          id: string
          routine_id: string
          exercise_id: string
          order_index: number
          target_sets: number
          target_reps: string
          rest_seconds: number
          notes: string | null
        }
        Insert: {
          id?: string
          routine_id: string
          exercise_id: string
          order_index: number
          target_sets?: number
          target_reps?: string
          rest_seconds?: number
          notes?: string | null
        }
        Update: {
          id?: string
          routine_id?: string
          exercise_id?: string
          order_index?: number
          target_sets?: number
          target_reps?: string
          rest_seconds?: number
          notes?: string | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          routine_id: string | null
          name: string | null
          start_time: string
          end_time: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          routine_id?: string | null
          name?: string | null
          start_time?: string
          end_time?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string | null
          name?: string | null
          start_time?: string
          end_time?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          set_number: number
          weight: number | null
          reps: number | null
          rpe: number | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          set_number: number
          weight?: number | null
          reps?: number | null
          rpe?: number | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          set_number?: number
          weight?: number | null
          reps?: number | null
          rpe?: number | null
          completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
  }
}