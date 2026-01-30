import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string;
  category?: string;
  subject?: string;
  difficulty?: string;
  language?: string;
}

// Fetch all questions - cached for 5 minutes
export const useAllQuestions = () => {
  return useQuery({
    queryKey: ['questions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Question[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

// Fetch questions by category - cached for 5 minutes
export const useQuestionsByCategory = (category: string | null) => {
  return useQuery({
    queryKey: ['questions', 'category', category],
    queryFn: async () => {
      if (!category) return [];
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category);

      if (error) throw error;
      return data as Question[];
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Fetch questions for multiple categories in a single query (for daily quiz)
export const useDailyQuizQuestions = () => {
  return useQuery({
    queryKey: ['questions', 'daily-quiz'],
    queryFn: async () => {
      // Fetch all questions at once instead of 9 separate queries
      const { data, error } = await supabase
        .from('questions')
        .select('*');

      if (error) throw error;
      return data as Question[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
