import { useState, useEffect } from "react";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { HomePage } from "./HomePage";
import { MCQPage } from "./MCQPage";
import { AllQuestionsPage } from "./AllQuestionsPage";
import { AuthForm } from "./AuthForm";
import { DailyQuiz } from "./DailyQuiz";
import { Leaderboard } from "./Leaderboard";
import { UpcomingExams } from "./UpcomingExams";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, User, BookOpen, LogOut, Info, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const NepalMCQApp = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState<"en" | "np">("en");
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user, loading, signOut } = useAuth();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            setUserProfile(data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === "en" ? "np" : "en");
  };

  const handleNavigate = (page: string) => {
    setActiveTab(page);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage language={language} onNavigate={handleNavigate} />;
      case "mcqs":
        return <MCQPage language={language} onNavigate={handleNavigate} />;
      case "all-questions":
        return <AllQuestionsPage language={language} onNavigate={handleNavigate} />;
      case "daily-quiz":
        return <DailyQuizPage language={language} />;
      case "upcoming-exams":
        return <UpcomingExams />;
      case "leaderboard":
        return <LeaderboardPage language={language} />;
      case "profile":
        return <ProfilePage language={language} user={userProfile} authUser={user} onLogout={signOut} />;
      default:
        return <HomePage language={language} onNavigate={handleNavigate} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepal-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm language={language} onLanguageToggle={handleLanguageToggle} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        language={language}
        onLanguageToggle={handleLanguageToggle}
        username={(() => {
          if (userProfile?.full_name && userProfile.full_name.trim() && !userProfile.full_name.startsWith('User ')) {
            return userProfile.full_name;
          } else if (user?.user_metadata?.full_name && user.user_metadata.full_name.trim()) {
            return user.user_metadata.full_name;
          } else if (userProfile?.email) {
            return userProfile.email.split('@')[0];
          } else if (user?.email) {
            return user.email.split('@')[0];
          }
          return 'User';
        })()}
        userImage={user.user_metadata?.avatar_url}
      />
      
      <main className="px-4 py-6 max-w-md mx-auto">
        {renderContent()}
      </main>

      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

// Placeholder components for other pages
const DailyQuizPage = ({ language }: { language: "en" | "np" }) => (
  <DailyQuiz language={language} />
);

const LeaderboardPage = ({ language }: { language: "en" | "np" }) => (
  <Leaderboard language={language} />
);

const ProfilePage = ({ language, user, authUser, onLogout }: { 
  language: "en" | "np";
  user: any;
  authUser: any;
  onLogout: () => void;
}) => {
  const [stats, setStats] = useState({ totalQuizzes: 0, highestScore: 0 });
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!authUser?.id) return;
      
      try {
        // Fetch quiz results to calculate stats
        const { data: quizResults } = await supabase
          .from('quiz_results')
          .select('score')
          .eq('user_id', authUser.id);
        
        if (quizResults) {
          const totalQuizzes = quizResults.length;
          const highestScore = quizResults.length > 0 
            ? Math.max(...quizResults.map(result => result.score))
            : 0;
          
          setStats({ totalQuizzes, highestScore });
          
          // Update user profile with latest stats
          await supabase
            .from('users')
            .update({ 
              total_quizzes: totalQuizzes,
              highest_score: highestScore 
            })
            .eq('id', authUser.id);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    
    fetchUserStats();
  }, [authUser?.id]);
  
  // Get full name from database profile or auth metadata
  // Handle cases where full_name might be auto-generated fallback
  let fullName = 'Student';
  
  if (user?.full_name && user.full_name.trim() && !user.full_name.startsWith('User ')) {
    fullName = user.full_name;
  } else if (authUser?.user_metadata?.full_name && authUser.user_metadata.full_name.trim()) {
    fullName = authUser.user_metadata.full_name;
  } else if (user?.email) {
    fullName = user.email.split('@')[0];
  } else if (authUser?.email) {
    fullName = authUser.email.split('@')[0];
  }
  
  return (
    <div className="space-y-6 pb-20">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 rounded-full gradient-nepal flex items-center justify-center text-white text-3xl font-bold mx-auto">
          {fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold">
            {fullName}
          </h2>
          <p className="text-muted-foreground">
            {language === "en" ? "Exam Aspirant" : "परीक्षा आकांक्षी"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="glass text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {stats.totalQuizzes}
            </div>
            <div className="text-sm text-muted-foreground nepali-text">
              {language === "en" ? "Quizzes Completed" : "पूरा गरिएका क्विज"}
            </div>
          </CardContent>
        </Card>
        <Card className="glass text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {stats.highestScore}
            </div>
            <div className="text-sm text-muted-foreground nepali-text">
              {language === "en" ? "Highest Score" : "उच्चतम स्कोर"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="w-full glass"
        >
          <Info size={16} className="mr-2" />
          {language === "en" ? "About Us" : "हाम्रो बारेमा"}
        </Button>
        <Button 
          variant="outline" 
          className="w-full glass"
        >
          <MessageSquare size={16} className="mr-2" />
          {language === "en" ? "Feedback" : "प्रतिक्रिया"}
        </Button>
      </div>

      <Button 
        variant="destructive" 
        className="w-full" 
        onClick={onLogout}
      >
        <LogOut size={16} className="mr-2" />
        {language === "en" ? "Logout" : "लगआउट"}
      </Button>
    </div>
  );
};