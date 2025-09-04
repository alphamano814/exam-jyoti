import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, Trophy, Users, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';
import heroBanner from "@/assets/hero-banner.jpg";

interface UpcomingExam {
  id: string
  title: string
  description: string | null
  exam_date: string
  exam_time: string | null
  venue: string | null
}

interface HomePageProps {
  language: "en" | "np";
  onNavigate: (page: string) => void;
}

const motivationalQuotes = {
  en: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    "Your limitation—it's only your imagination."
  ],
  np: [
    "सफलता अन्तिम होइन, असफलता घातक होइन: निरन्तरता नै मुख्य कुरा हो।",
    "सपनाको सुन्दरतामा विश्वास गर्नेहरूको भविष्य हो।",
    "शिक्षा भविष्यको राहदानी हो, भोलि तयार हुनेहरूको हो।",
    "तपाईंको सीमा - यो केवल तपाईंको कल्पना हो।"
  ]
};

const quickActions = {
  en: [
    { icon: BookOpen, label: "Start Quiz", description: "Begin your practice", action: "mcqs", color: "nepal" },
    { icon: Calendar, label: "Daily Challenge", description: "Today's special quiz", action: "daily-quiz", color: "gold" },
    { icon: Trophy, label: "Leaderboard", description: "Check your ranking", action: "leaderboard", color: "success" },
    { icon: Users, label: "All Questions", description: "Browse by category", action: "all-questions", color: "category" },
  ],
  np: [
    { icon: BookOpen, label: "क्विज सुरु गर्नुहोस्", description: "अभ्यास सुरु गर्नुहोस्", action: "mcqs", color: "nepal" },
    { icon: Calendar, label: "दैनिक चुनौती", description: "आजको विशेष क्विज", action: "daily-quiz", color: "gold" },
    { icon: Trophy, label: "लिडरबोर्ड", description: "तपाईंको स्थान हेर्नुहोस्", action: "leaderboard", color: "success" },
    { icon: Users, label: "सबै प्रश्नहरू", description: "श्रेणी अनुसार हेर्नुहोस्", action: "all-questions", color: "category" },
  ]
};


export const HomePage = ({ language, onNavigate }: HomePageProps) => {
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([])
  const [loadingExams, setLoadingExams] = useState(true)
  
  const currentQuote = motivationalQuotes[language][Math.floor(Math.random() * motivationalQuotes[language].length)];

  useEffect(() => {
    fetchUpcomingExams()
    
    // Set up real-time subscription for exam updates
    const subscription = supabase
      .channel('home_exams_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'upcoming_exams' }, 
        () => {
          fetchUpcomingExams()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUpcomingExams = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_exams')
        .select('*')
        .order('exam_date', { ascending: true })
        .limit(3) // Only show first 3 exams on home page

      if (error) throw error
      setUpcomingExams(data || [])
    } catch (error) {
      console.error('Error fetching upcoming exams:', error)
    } finally {
      setLoadingExams(false)
    }
  }

  const getExamStatus = (examDate: string) => {
    const date = parseISO(examDate)
    
    if (isPast(date)) {
      return { text: language === "en" ? "Past" : "बितेको", color: "text-muted-foreground" }
    } else if (isToday(date)) {
      return { text: language === "en" ? "Today" : "आज", color: "text-destructive" }
    } else if (isTomorrow(date)) {
      return { text: language === "en" ? "Tomorrow" : "भोलि", color: "text-warning" }
    } else {
      return { text: language === "en" ? "Upcoming" : "आगामी", color: "text-success" }
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl shadow-elevated">
        <div 
          className="h-48 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-nepal-red/80 via-nepal-blue/70 to-transparent" />
          <div className="relative h-full flex items-center justify-center p-6 text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white leading-tight">
                {language === "en" ? "Welcome to Nepal MCQ" : "नेपाल एमसीक्यूमा स्वागतम्"}
              </h2>
              <p className="text-white/90 text-sm max-w-xs mx-auto nepali-text">
                {currentQuote}
              </p>
              <Button 
                variant="gold" 
                size="sm" 
                onClick={() => onNavigate("mcqs")}
                className="animate-pulse-glow"
              >
                <BookOpen size={16} />
                {language === "en" ? "Start Learning" : "सिक्न सुरु गर्नुहोस्"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {language === "en" ? "Quick Actions" : "द्रुत कार्यहरू"}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions[language].map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.action}
                variant={action.color as any}
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => onNavigate(action.action)}
              >
                <Icon size={24} />
                <div className="text-center">
                  <div className="font-medium text-sm nepali-text">{action.label}</div>
                  <div className="text-xs opacity-80 nepali-text">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-xs text-muted-foreground nepali-text">
              {language === "en" ? "Questions" : "प्रश्नहरू"}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">856</div>
            <div className="text-xs text-muted-foreground nepali-text">
              {language === "en" ? "Students" : "विद्यार्थी"}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">92%</div>
            <div className="text-xs text-muted-foreground nepali-text">
              {language === "en" ? "Success Rate" : "सफलता दर"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {language === "en" ? "Upcoming Exams" : "आगामी परीक्षाहरू"}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate("upcoming-exams")}
            className="text-xs"
          >
            {language === "en" ? "View All" : "सबै हेर्नुहोस्"}
          </Button>
        </div>
        
        {loadingExams ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : upcomingExams.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground nepali-text">
                {language === "en" ? "No upcoming exams" : "कुनै आगामी परीक्षा छैन"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingExams.map((exam) => {
              const status = getExamStatus(exam.exam_date)
              return (
                <Card key={exam.id} className="glass hover:shadow-soft transition-smooth">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-medium text-foreground nepali-text">{exam.title}</h4>
                        {exam.description && (
                          <p className="text-xs text-muted-foreground nepali-text">{exam.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span className="nepali-text">
                              {format(parseISO(exam.exam_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {exam.exam_time && (
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{exam.exam_time}</span>
                            </div>
                          )}
                          {exam.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              <span className="nepali-text">{exam.venue}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`px-2 py-1 bg-primary/10 text-xs rounded-full nepali-text ${status.color}`}>
                        {status.text}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};