import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Clock, CheckCircle, XCircle, Bookmark, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MCQPageProps {
  language: "en" | "np";
  onNavigate: (page: string) => void;
}

const categories = {
  en: [
    { id: "universe", name: "Universe", description: "Astronomy & Space Science", questions: 0, color: "bg-nepal-red" },
    { id: "geography", name: "Geography", description: "World & Physical Geography", questions: 0, color: "bg-nepal-gold" },
    { id: "world-history", name: "World History", description: "Global Historical Events", questions: 0, color: "bg-success" },
    { id: "nepal-history", name: "Nepal History", description: "Nepal's Historical Journey", questions: 0, color: "bg-warning" },
    { id: "culture-society", name: "Culture and Society", description: "Social Sciences & Culture", questions: 0, color: "bg-primary" },
    { id: "economy", name: "Economy", description: "Economics & Financial Studies", questions: 0, color: "bg-destructive" },
    { id: "health-technology", name: "Health and Technology", description: "Medical Science & Tech", questions: 0, color: "bg-purple-600" },
    { id: "eco-system", name: "Eco System", description: "Environment & Ecology", questions: 0, color: "bg-green-600" },
    { id: "international-relations", name: "International Relations", description: "Global Politics & Diplomacy", questions: 0, color: "bg-blue-600" },
  ],
  np: [
    { id: "universe", name: "ब्रह्माण्ड", description: "खगोल विज्ञान र अन्तरिक्ष विज्ञान", questions: 0, color: "bg-nepal-red" },
    { id: "geography", name: "भूगोल", description: "विश्व र भौतिक भूगोल", questions: 0, color: "bg-nepal-gold" },
    { id: "world-history", name: "विश्व इतिहास", description: "विश्वव्यापी ऐतिहासिक घटनाहरू", questions: 0, color: "bg-success" },
    { id: "nepal-history", name: "नेपाल इतिहास", description: "नेपालको ऐतिहासिक यात्रा", questions: 0, color: "bg-warning" },
    { id: "culture-society", name: "संस्कृति र समाज", description: "सामाजिक विज्ञान र संस्कृति", questions: 0, color: "bg-primary" },
    { id: "economy", name: "अर्थतन्त्र", description: "अर्थशास्त्र र वित्तीय अध्ययन", questions: 0, color: "bg-destructive" },
    { id: "health-technology", name: "स्वास्थ्य र प्रविधि", description: "चिकित्सा विज्ञान र प्रविधि", questions: 0, color: "bg-purple-600" },
    { id: "eco-system", name: "पारिस्थितिकी तन्त्र", description: "वातावरण र पारिस्थितिकी", questions: 0, color: "bg-green-600" },
    { id: "international-relations", name: "अन्तर्राष्ट्रिय सम्बन्ध", description: "विश्वव्यापी राजनीति र कूटनीति", questions: 0, color: "bg-blue-600" },
  ]
};

export const MCQPage = ({ language, onNavigate }: MCQPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [showScorecard, setShowScorecard] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const fetchQuestions = async (categoryName: string, isNewSet: boolean = false) => {
    setLoading(true);
    console.log('Fetching questions for:', { categoryName, language, isNewSet });
    try {
      // Use the exact category name as stored in database and filter by language
      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', categoryName)
        .eq('language', language);

      console.log('Query result:', { allQuestions, error, count: allQuestions?.length });

      if (error) throw error;
      
      if (allQuestions && allQuestions.length > 0) {
        // Filter out already used questions if continuing with new set
        const availableQuestions = isNewSet 
          ? allQuestions.filter(q => !usedQuestionIds.includes(q.id))
          : allQuestions;
        
        if (availableQuestions.length === 0) {
          // If no unused questions, reset and start over
          setUsedQuestionIds([]);
          const randomQuestions = [...allQuestions]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);
          setQuestions(randomQuestions);
          setUsedQuestionIds(randomQuestions.map(q => q.id));
        } else {
          // Select 10 random questions from available ones
          const randomQuestions = [...availableQuestions]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);
          setQuestions(randomQuestions);
          setUsedQuestionIds(prev => [...prev, ...randomQuestions.map(q => q.id)]);
        }
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset state when language changes
  useEffect(() => {
    if (selectedCategory) {
      setSelectedCategory(null);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentSet(1);
      setTotalScore(0);
      setUsedQuestionIds([]);
      setQuestions([]);
    }
  }, [language]);

  const startNewSet = () => {
    const categoryName = categories[language].find(cat => cat.id === selectedCategory)?.name;
    if (categoryName) {
      fetchQuestions(categoryName, true);
    }
  };

  const goBack = () => {
    setSelectedCategory(null);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentSet(1);
    setTotalScore(0);
    setUsedQuestionIds([]);
  };

  if (selectedCategory) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepal-primary"></div>
        </div>
      );
    }

    // Show set completion screen when a set is finished
    if (currentQuestion === 0 && currentSet > 1 && questions.length > 0) {
      return (
        <div className="text-center space-y-6 pb-20">
          <Card className="glass p-8">
            <CardContent className="space-y-6">
              <Trophy size={48} className="mx-auto text-nepal-gold" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  {language === "en" ? `Set ${currentSet - 1} Completed!` : `सेट ${currentSet - 1} सम्पन्न!`}
                </h2>
                <p className="text-lg font-medium text-primary">
                  {language === "en" ? `Score: ${totalScore}/10` : `अंक: ${totalScore}/10`}
                </p>
              </div>
              
              {totalScore > 0 && (
                <div className="text-center">
                  <p className="text-muted-foreground nepali-text">
                    {language === "en" ? `Total Score: ${totalScore}` : `जम्मा अंक: ${totalScore}`}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                <Button 
                  variant="nepal" 
                  className="w-full" 
                  onClick={startNewSet}
                >
                  {language === "en" ? "Start New Set" : "नयाँ सेट सुरु गर्नुहोस्"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={goBack}
                >
                  {language === "en" ? "Choose Different Category" : "फरक श्रेणी छान्नुहोस्"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="text-center space-y-4 pb-20">
          <Card className="glass p-8">
            <CardContent className="space-y-4">
              <BookOpen size={48} className="mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">
                {language === "en" ? "No Questions Available" : "कुनै प्रश्न उपलब्ध छैन"}
              </h2>
              <p className="text-muted-foreground nepali-text">
                {language === "en" 
                  ? "Questions for this category haven't been uploaded yet." 
                  : "यस श्रेणीका लागि प्रश्नहरू अझै अपलोड गरिएको छैन।"}
              </p>
              <Button onClick={() => setSelectedCategory(null)}>
                {language === "en" ? "Go Back" : "फिर्ता जानुहोस्"}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show scorecard when quiz is completed
    if (showScorecard) {
      const finalScore = totalScore;
      const percentage = Math.round((finalScore / 10) * 100);
      
      return (
        <div className="text-center space-y-6 pb-20">
          <Card className="glass p-8">
            <CardContent className="space-y-6">
              <Trophy size={64} className="mx-auto text-nepal-gold" />
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">
                  {language === "en" ? "Quiz Completed!" : "क्विज सम्पन्न!"}
                </h2>
                <div className="text-center space-y-2">
                  <div className="text-6xl font-bold text-primary">
                    {finalScore}/10
                  </div>
                  <p className="text-xl text-muted-foreground">
                    {language === "en" ? `${percentage}% Correct` : `${percentage}% सही`}
                  </p>
                </div>
                
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="h-full gradient-nepal rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <p className="text-lg text-muted-foreground">
                  {language === "en" 
                    ? finalScore >= 7 ? "Excellent work! 🎉" : finalScore >= 5 ? "Good job! 👍" : "Keep practicing! 💪"
                    : finalScore >= 7 ? "उत्कृष्ट काम! 🎉" : finalScore >= 5 ? "राम्रो काम! 👍" : "अभ्यास जारी राख्नुहोस्! 💪"}
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                <Button 
                  variant="nepal" 
                  className="w-full" 
                  onClick={() => {
                    setShowScorecard(false);
                    setQuizCompleted(false);
                    setCurrentQuestion(0);
                    setScore(0);
                    setCurrentSet(prev => prev + 1);
                    startNewSet();
                  }}
                >
                  {language === "en" ? "Start New Set" : "नयाँ सेट सुरु गर्नुहोस्"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setShowScorecard(false);
                    setQuizCompleted(false);
                    goBack();
                  }}
                >
                  {language === "en" ? "Choose Different Category" : "फरक श्रेणी छान्नुहोस्"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const question = questions[currentQuestion];
    
    const handleAnswerSelect = (index: number) => {
      setSelectedAnswer(index);
      setShowResult(true);
      
      // Convert A,B,C,D to 0,1,2,3
      const correctIndex = question.correct_option.charCodeAt(0) - 65;
      if (index === correctIndex) {
        setScore(prev => prev + 1);
      }

      // Auto-advance after 1.5 seconds
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setSelectedAnswer(null);
          setShowResult(false);
          setCurrentQuestion(prev => prev + 1);
        } else {
          // Quiz completed - show scorecard
          const finalScore = score + (index === correctIndex ? 1 : 0);
          setTotalScore(prev => prev + finalScore);
          setShowScorecard(true);
          setQuizCompleted(true);
          setShowResult(false);
          setSelectedAnswer(null);
        }
      }, 1500);
    };


    return (
      <div className="space-y-6 pb-20">
        {/* Quiz Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goBack}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            {language === "en" ? "Back" : "फिर्ता"}
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              <span className="text-sm">05:30</span>
            </div>
            <Button variant="ghost" size="sm">
              <Bookmark size={16} />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="nepali-text">
              {language === "en" ? `Set ${currentSet} • Question ${currentQuestion + 1} of ${questions.length}` : `सेट ${currentSet} • प्रश्न ${currentQuestion + 1} को ${questions.length}`}
            </div>
            <div className="flex items-center gap-4">
              <span className="nepali-text">
                {language === "en" ? `Current: ${score}` : `हालको: ${score}`}
              </span>
              {totalScore > 0 && (
                <span className="nepali-text text-primary font-medium">
                  {language === "en" ? `Total: ${totalScore + score}` : `जम्मा: ${totalScore + score}`}
                </span>
              )}
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full">
            <div 
              className="h-full gradient-nepal rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="glass shadow-elevated">
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed nepali-text">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[question.option_a, question.option_b, question.option_c, question.option_d].map((option, index) => {
              const correctIndex = question.correct_option.charCodeAt(0) - 65; // Convert A,B,C,D to 0,1,2,3
              return (
                <Button
                  key={index}
                  variant={selectedAnswer === null ? "quiz" : 
                    index === correctIndex ? "success" : 
                    selectedAnswer === index ? "destructive" : "quiz"
                  }
                  className={`w-full text-left justify-start h-auto p-4 ${
                    showResult && index === correctIndex ? "animate-pulse-glow" : ""
                  }`}
                onClick={() => !showResult && handleAnswerSelect(index)}
                disabled={showResult}
              >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      showResult && index === correctIndex ? "border-white bg-white/20" :
                      showResult && selectedAnswer === index && index !== correctIndex ? "border-white bg-white/20" :
                      "border-current"
                    }`}>
                      {showResult && index === correctIndex ? <CheckCircle size={16} /> :
                       showResult && selectedAnswer === index && index !== correctIndex ? <XCircle size={16} /> :
                       String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 nepali-text">{option}</span>
                  </div>
                </Button>
              )
            })}

          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {language === "en" ? "Choose Your Subject" : "आफ्नो विषय छान्नुहोस्"}
        </h2>
        <p className="text-muted-foreground nepali-text">
          {language === "en" ? "Select a category to start practicing" : "अभ्यास सुरु गर्न श्रेणी छान्नुहोस्"}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4">
        {categories[language].map((category) => (
          <Card 
            key={category.id} 
            className="glass hover:shadow-nepal transition-smooth cursor-pointer group"
            onClick={() => {
              setSelectedCategory(category.id);
              fetchQuestions(category.name);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center text-white shadow-soft`}>
                  <BookOpen size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground nepali-text group-hover:text-primary transition-smooth">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground nepali-text">
                    {category.description}
                  </p>
                   <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {language === "en" ? "Available" : "उपलब्ध"}
                    </Badge>
                    <Trophy size={14} className="text-nepal-gold" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};