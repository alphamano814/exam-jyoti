import { useState, useEffect } from "react";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { HomePage } from "./HomePage";
import { MCQPage } from "./MCQPage";
import { AllQuestionsPage } from "./AllQuestionsPage";
import { AuthForm } from "./AuthForm";
import { DailyQuiz } from "./DailyQuiz";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, User, BookOpen, LogOut } from "lucide-react";
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
        username={user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
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
  <div className="space-y-4 pb-20">
    <div className="text-center space-y-2">
      <Trophy size={48} className="mx-auto text-nepal-gold" />
      <h2 className="text-2xl font-bold">
        {language === "en" ? "Leaderboard" : "लिडरबोर्ड"}
      </h2>
      <p className="text-muted-foreground nepali-text">
        {language === "en" ? "Top performers this week" : "यस हप्ताका शीर्ष प्रदर्शनकर्ताहरू"}
      </p>
    </div>

    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((rank) => (
        <Card key={rank} className="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              rank === 1 ? "gradient-nepal" : rank === 2 ? "gradient-sunset" : rank === 3 ? "gradient-success" : "bg-muted"
            }`}>
              {rank}
            </div>
            <div className="flex-1">
              <div className="font-medium">Student {rank}</div>
              <div className="text-sm text-muted-foreground">
                {950 - rank * 50} {language === "en" ? "points" : "अंक"}
              </div>
            </div>
            {rank <= 3 && <Trophy size={20} className="text-nepal-gold" />}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const ProfilePage = ({ language, user, authUser, onLogout }: { 
  language: "en" | "np";
  user: any;
  authUser: any;
  onLogout: () => void;
}) => {
  // Get full name from database profile or auth metadata
  const fullName = user?.full_name || authUser?.user_metadata?.full_name || 'Student';
  
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
            {user?.total_quizzes || 0}
          </div>
          <div className="text-sm text-muted-foreground nepali-text">
            {language === "en" ? "Quizzes Completed" : "पूरा गरिएका क्विज"}
          </div>
        </CardContent>
      </Card>
      <Card className="glass text-center">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-success">
            {user?.highest_score || 0}
          </div>
          <div className="text-sm text-muted-foreground nepali-text">
            {language === "en" ? "Highest Score" : "उच्चतम स्कोर"}
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="glass">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold nepali-text">
          {language === "en" ? "Study Progress" : "अध्ययन प्रगति"}
        </h3>
        <div className="space-y-3">
          {["Lok Sewa", "General Knowledge", "Science"].map((subject, index) => (
            <div key={subject} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{subject}</span>
                <span>{85 - index * 10}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div 
                  className="h-full gradient-nepal rounded-full"
                  style={{ width: `${85 - index * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

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