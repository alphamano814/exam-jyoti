import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxocrboy6742o0okpy25qg.supabase.co'
const supabaseAnonKey = 'sb_publishable_hXOCrBOY6742O0oKPY25qg_T3RrpIji'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      questions: {
        Row: {
          id: number
          question: string
          options: string[]
          correct_answer: number
          explanation?: string
          category: string
          subject: string
          difficulty: 'easy' | 'medium' | 'hard'
          language: 'en' | 'ne'
          created_at: string
        }
        Insert: {
          question: string
          options: string[]
          correct_answer: number
          explanation?: string
          category: string
          subject: string
          difficulty?: 'easy' | 'medium' | 'hard'
          language?: 'en' | 'ne'
        }
        Update: {
          question?: string
          options?: string[]
          correct_answer?: number
          explanation?: string
          category?: string
          subject?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          language?: 'en' | 'ne'
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          total_quizzes: number
          highest_score: number
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          total_quizzes?: number
          highest_score?: number
        }
        Update: {
          full_name?: string
          avatar_url?: string
          total_quizzes?: number
          highest_score?: number
        }
      }
      quiz_results: {
        Row: {
          id: number
          user_id: string
          score: number
          total_questions: number
          category: string
          completed_at: string
        }
        Insert: {
          user_id: string
          score: number
          total_questions: number
          category: string
        }
        Update: {
          score?: number
          total_questions?: number
        }
      }
    }
  }
}