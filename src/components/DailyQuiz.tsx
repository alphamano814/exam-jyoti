import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string;
  category: string;
}

interface DailyQuizProps {
  language: "en" | "np";
}

const categories = [
  "universe", "geography", "world-history", "nepal-history", 
  "culture-society", "economy", "health-technology", "eco-system", 
  "international-relations"
];

const categoryNames = {
  en: {
    "universe": "Universe",
    "geography": "Geography", 
    "world-history": "World History",
    "nepal-history": "Nepal History",
    "culture-society": "Culture and Society",
    "economy": "Economy",
    "health-technology": "Health and Technology",
    "eco-system": "Eco System",
    "international-relations": "International Relations"
  },
  np: {
    "universe": "ब्रह्माण्ड",
    "geography": "भूगोल",
    "world-history": "विश्व इतिहास", 
    "nepal-history": "नेपाल इतिहास",
    "culture-society": "संस्कृति र समाज",
    "economy": "अर्थतन्त्र",
    "health-technology": "स्वास्थ्य र प्रविधि",
    "eco-system": "पारिस्थितिकी तन्त्र",
    "international-relations": "अन्तर्राष्ट्रिय सम्बन्ध"
  }
};

// Get deterministic date string for consistent daily questions
const getDailyQuizKey = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Deterministic random based on date and category
const getDeterministicRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 0x80000000; // Normalize to 0-1
};

export const DailyQuiz: React.FC<DailyQuizProps> = ({ language }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeToNext, setTimeToNext] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  // Calculate time until next quiz (midnight)
  useEffect(() => {
    const updateTimeToNext = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeDiff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeToNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    };

    updateTimeToNext();
    const interval = setInterval(updateTimeToNext, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const fetchDailyQuestions = async () => {
    try {
      setLoading(true);
      const dailyKey = getDailyQuizKey();
      const selectedQuestions: Question[] = [];

      // Get 1 question from each category (2 from nepal-history)
      for (const category of categories) {
        const questionsToFetch = category === "nepal-history" ? 2 : 1;
        
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("category", category);

        if (error || !data || data.length === 0) {
          console.warn(`No questions found for category: ${category}`);
          continue;
        }

        // Use deterministic selection based on date + category
        for (let i = 0; i < questionsToFetch; i++) {
          const seed = `${dailyKey}-${category}-${i}`;
          const randomValue = getDeterministicRandom(seed);
          const questionIndex = Math.floor(randomValue * data.length);
          
          if (data[questionIndex] && !selectedQuestions.find(q => q.id === data[questionIndex].id)) {
            selectedQuestions.push(data[questionIndex]);
          }
        }
      }

      // Shuffle the final questions deterministically
      const shuffledQuestions = [...selectedQuestions];
      for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const seed = `${dailyKey}-shuffle-${i}`;
        const randomValue = getDeterministicRandom(seed);
        const j = Math.floor(randomValue * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
      }

      setQuestions(shuffledQuestions.slice(0, 10)); // Ensure exactly 10 questions
    } catch (error) {
      console.error("Error fetching daily questions:", error);
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to load daily quiz" : "दैनिक क्विज लोड गर्न असफल",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDailyQuizResults = async () => {
    if (!user) return;
    
    try {
      // Save quiz results to quiz_results table
      await supabase.from("quiz_results").insert({
        user_id: user.id,
        score,
        total_questions: questions.length,
        questions_attempted: questions.map((q, index) => ({
          question_id: q.id,
          user_answer: index < currentQuestionIndex ? "answered" : "not_answered",
          is_correct: index < score
        }))
      });

      // Update leaderboard points using the database function
      await supabase.rpc("update_leaderboard_points", {
        p_user_id: user.id,
        p_quiz_type: "daily",
        p_correct_answers: score,
        p_total_questions: questions.length
      });

      toast({
        title: language === "en" ? "Results Saved!" : "परिणाम सुरक्षित!",
        description: language === "en" 
          ? `Earned ${(score * 0.5).toFixed(2)} points!` 
          : `${(score * 0.5).toFixed(2)} अंक कमाइयो!`,
      });
    } catch (error) {
      console.error("Error saving daily quiz results:", error);
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to save results" : "परिणाम सुरक्षित गर्न असफल",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDailyQuestions();
  }, []); // Removed language dependency

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (answer === questions[currentQuestionIndex].correct_option) {
      setScore(score + 1);
    }

    // Auto advance after 3 seconds
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
        setShowExplanation(false);
      } else {
        // Daily quiz completed - save points to leaderboard
        saveDailyQuizResults();
        setQuizCompleted(true);
      }
    }, 3000);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setShowExplanation(false);
    setQuizCompleted(false);
    setQuizStarted(false);
  };

  if (loading) {
    return (
      <div className="text-center space-y-4 pb-20">
        <Card className="glass p-8">
          <CardContent className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p>{language === "en" ? "Loading daily quiz..." : "दैनिक क्विज लोड हुँदै..."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="text-center space-y-4 pb-20">
        <Card className="glass p-8">
          <CardContent className="space-y-6">
            <Calendar size={48} className="mx-auto text-primary" />
            <h2 className="text-2xl font-bold">
              {language === "en" ? "Daily Quiz" : "दैनिक क्विज"}
            </h2>
            <p className="text-muted-foreground">
              {language === "en" 
                ? "Today's challenge: 10 questions from mixed categories" 
                : "आजको चुनौती: मिश्रित श्रेणीबाट १० प्रश्न"}
            </p>
            <div className="space-y-4">
              <div className="text-lg">
                <span className="text-muted-foreground">
                  {language === "en" ? "Questions available: " : "उपलब्ध प्रश्नहरू: "}
                </span>
                <span className="font-bold text-primary">{questions.length}</span>
              </div>
              
              {questions.length === 10 ? (
                <Button 
                  onClick={() => setQuizStarted(true)}
                  size="lg"
                  className="w-full"
                >
                  {language === "en" ? "Start Daily Quiz" : "दैनिक क्विज सुरु गर्नुहोस्"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-destructive">
                    {language === "en" 
                      ? "Not enough questions available for today's quiz" 
                      : "आजको क्विजको लागि पर्याप्त प्रश्नहरू उपलब्ध छैनन्"}
                  </p>
                  <Button 
                    onClick={fetchDailyQuestions}
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {language === "en" ? "Retry" : "पुनः प्रयास"}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {language === "en" ? "Next quiz in: " : "अर्को क्विज: "}
                <span className="font-mono text-primary">{timeToNext}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center space-y-4 pb-20">
        <Card className="glass p-8">
          <CardContent className="space-y-6">
            <Trophy size={48} className="mx-auto text-warning" />
            <h2 className="text-2xl font-bold">
              {language === "en" ? "Daily Quiz Complete!" : "दैनिक क्विज सम्पन्न!"}
            </h2>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary">{score}/{questions.length}</div>
              <div className="text-xl text-muted-foreground">{percentage}%</div>
              <Progress value={percentage} className="w-full" />
            </div>
            <p className="text-muted-foreground">
              {language === "en" 
                ? "Come back tomorrow for a new set of questions!" 
                : "नयाँ प्रश्नहरूको लागि भोलि फर्कनुहोस्!"}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {language === "en" ? "Next quiz in: " : "अर्को क्विज: "}
                <span className="font-mono text-primary">{timeToNext}</span>
              </span>
            </div>
            <Button onClick={resetQuiz} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              {language === "en" ? "Review Questions" : "प्रश्नहरू समीक्षा गर्नुहोस्"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const options = [
    { key: "A", value: currentQuestion.option_a },
    { key: "B", value: currentQuestion.option_b },
    { key: "C", value: currentQuestion.option_c },
    { key: "D", value: currentQuestion.option_d },
  ];

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-4 pb-20">
      {/* Progress Header */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">
              {language === "en" ? "Daily Quiz" : "दैनिक क्विज"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-muted-foreground">
              {categoryNames[language][currentQuestion.category as keyof typeof categoryNames.en]}
            </span>
            <span className="font-medium">
              {language === "en" ? "Score: " : "स्कोर: "}{score}/{questions.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="glass">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-6 leading-relaxed">
            {currentQuestion.question}
          </h3>
          
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isCorrect = option.key === currentQuestion.correct_option;
              const showResult = showExplanation;
              
              let buttonVariant: "default" | "outline" | "destructive" | "secondary" = "outline";
              let buttonClass = "";
              
              if (showResult) {
                if (isCorrect) {
                  buttonVariant = "default";
                  buttonClass = "bg-success text-success-foreground border-success";
                } else if (isSelected && !isCorrect) {
                  buttonVariant = "destructive";
                }
              } else if (isSelected) {
                buttonVariant = "secondary";
              }

              return (
                <Button
                  key={option.key}
                  variant={buttonVariant}
                  className={`w-full text-left justify-start h-auto p-4 ${buttonClass}`}
                  onClick={() => handleAnswerSelect(option.key)}
                  disabled={showExplanation}
                >
                  <span className="font-medium mr-3">{option.key}.</span>
                  <span className="flex-1">{option.value}</span>
                </Button>
              );
            })}
          </div>

          {showExplanation && currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">
                {language === "en" ? "Explanation:" : "व्याख्या:"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};