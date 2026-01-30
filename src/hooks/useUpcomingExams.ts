import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UpcomingExam {
  id: string;
  title: string;
  description: string | null;
  exam_date: string;
  exam_time: string | null;
  venue: string | null;
}

export const useUpcomingExams = (limit?: number) => {
  return useQuery({
    queryKey: ['upcoming-exams', limit],
    queryFn: async () => {
      let query = supabase
        .from('upcoming_exams')
        .select('*')
        .order('exam_date', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UpcomingExam[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};
