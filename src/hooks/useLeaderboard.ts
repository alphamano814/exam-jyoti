import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  quiz_points: number;
  daily_quiz_points: number;
  total_quizzes_completed: number;
  total_daily_quizzes_completed: number;
  display_name?: string;
}

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as LeaderboardEntry[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - leaderboard updates more frequently
    gcTime: 5 * 60 * 1000,
  });
};
