import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  quiz_points: number;
  daily_quiz_points: number;
  total_quizzes_completed: number;
  total_daily_quizzes_completed: number;
  user_profile?: {
    full_name: string;
    email: string;
  };
}

interface LeaderboardProps {
  language: "en" | "np";
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ language }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // First get leaderboard data
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("leaderboard")
        .select("*")
        .order("total_points", { ascending: false })
        .limit(50);

      if (leaderboardError) {
        throw leaderboardError;
      }

      // Then get user profiles for the leaderboard entries
      if (leaderboardData && leaderboardData.length > 0) {
        const userIds = leaderboardData.map(entry => entry.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", userIds);

        if (profilesError) {
          console.warn("Could not fetch user profiles:", profilesError);
        }

        // Combine leaderboard data with profile data
        const combinedData = leaderboardData.map(entry => {
          const userProfile = profilesData?.find(profile => profile.id === entry.user_id);
          
          // Generate a better display name
          let displayName = "Anonymous User";
          if (userProfile?.full_name && userProfile.full_name.trim()) {
            displayName = userProfile.full_name;
          } else if (userProfile?.email) {
            displayName = userProfile.email.split('@')[0];
          } else {
            displayName = `User ${entry.user_id.slice(0, 8)}`;
          }
          
          return {
            ...entry,
            user_profile: {
              full_name: displayName,
              email: userProfile?.email || ""
            }
          };
        });

        setLeaderboard(combinedData);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to load leaderboard" : "लिडरबोर्ड लोड गर्न असफल",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-warning" />;
      case 2:
        return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getRankBadgeVariant = (rank: number): "default" | "secondary" | "destructive" | "outline" => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-20">
        <Card className="glass">
          <CardContent className="p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-center mt-4">
              {language === "en" ? "Loading leaderboard..." : "लिडरबोर्ड लोड हुँदै..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <Card className="glass">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-warning" />
            {language === "en" ? "Leaderboard" : "लिडरबोर्ड"}
          </CardTitle>
          <p className="text-muted-foreground">
            {language === "en" 
              ? "Top performers ranked by total points earned" 
              : "कुल अंकहरूको आधारमा शीर्ष प्रदर्शनकर्ताहरू"}
          </p>
        </CardHeader>
      </Card>

      {/* Point System Info */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-primary">
                {language === "en" ? "Normal Quiz" : "सामान्य क्विज"}
              </div>
              <div className="text-muted-foreground">
                {language === "en" ? "0.25 points per correct answer" : "प्रत्येक सहि उत्तरमा ०.२५ अंक"}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">
                {language === "en" ? "Daily Quiz" : "दैनिक क्विज"}
              </div>
              <div className="text-muted-foreground">
                {language === "en" ? "0.5 points per correct answer" : "प्रत्येक सहि उत्तरमा ०.५ अंक"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Entries */}
      {leaderboard.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {language === "en" ? "No Rankings Yet" : "अहिलेसम्म कुनै र्यांकिंग छैन"}
            </h3>
            <p className="text-muted-foreground">
              {language === "en" 
                ? "Be the first to complete a quiz and earn points!" 
                : "क्विज पूरा गरेर अंक कमाउने पहिलो व्यक्ति बन्नुहोस्!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const displayName = entry.user_profile?.full_name || 
              entry.user_profile?.email?.split('@')[0] || 
              `User ${rank}`;

            return (
              <Card key={entry.user_id} className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(rank)}
                        <Badge variant={getRankBadgeVariant(rank)}>
                          #{rank}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">{displayName}</h3>
                        <div className="text-sm text-muted-foreground">
                          {language === "en" ? "Quizzes: " : "क्विजहरू: "}
                          {entry.total_quizzes_completed + entry.total_daily_quizzes_completed}
                          {entry.total_daily_quizzes_completed > 0 && (
                            <span className="ml-2">
                              ({entry.total_daily_quizzes_completed} {language === "en" ? "daily" : "दैनिक"})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {entry.total_points.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {language === "en" ? "points" : "अंकहरू"}
                      </div>
                      {(entry.quiz_points > 0 || entry.daily_quiz_points > 0) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {entry.quiz_points > 0 && (
                            <span>{language === "en" ? "Quiz: " : "क्विज: "}{entry.quiz_points.toFixed(2)}</span>
                          )}
                          {entry.quiz_points > 0 && entry.daily_quiz_points > 0 && " | "}
                          {entry.daily_quiz_points > 0 && (
                            <span>{language === "en" ? "Daily: " : "दैनिक: "}{entry.daily_quiz_points.toFixed(2)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};