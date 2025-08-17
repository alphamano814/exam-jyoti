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
    { id: "lok-sewa", name: "Lok Sewa", description: "Government service preparation", questions: 245, color: "bg-nepal-red" },
    { id: "see", name: "SEE", description: "Secondary Education Examination", questions: 189, color: "bg-nepal-blue" },
    { id: "general", name: "General Knowledge", description: "Current affairs & GK", questions: 156, color: "bg-nepal-gold" },
    { id: "science", name: "Science", description: "Physics, Chemistry, Biology", questions: 134, color: "bg-success" },
    { id: "math", name: "Mathematics", description: "Arithmetic to Advanced", questions: 178, color: "bg-warning" },
    { id: "english", name: "English", description: "Grammar & Comprehension", questions: 167, color: "bg-primary" },
    { id: "nepali", name: "Nepali", description: "Literature & Grammar", questions: 145, color: "bg-destructive" },
  ],
  np: [
    { id: "lok-sewa", name: "लोक सेवा", description: "सरकारी सेवा तयारी", questions: 245, color: "bg-nepal-red" },
    { id: "see", name: "एसईई", description: "माध्यमिक शिक्षा परीक्षा", questions: 189, color: "bg-nepal-blue" },
    { id: "general", name: "सामान्य ज्ञान", description: "समसामयिक र सामान्य ज्ञान", questions: 156, color: "bg-nepal-gold" },
    { id: "science", name: "विज्ञान", description: "भौतिक, रसायन, जीवविज्ञान", questions: 134, color: "bg-success" },
    { id: "math", name: "गणित", description: "अंकगणितदेखि उन्नत सम्म", questions: 178, color: "bg-warning" },
    { id: "english", name: "अंग्रेजी", description: "व्याकरण र बुझाइ", questions: 167, color: "bg-primary" },
    { id: "nepali", name: "नेपाली", description: "साहित्य र व्याकरण", questions: 145, color: "bg-destructive" },
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

  const fetchQuestions = async (categoryName: string, isNewSet: boolean = false) => {
    setLoading(true);
    try {
      // Use the exact category name as stored in database
      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', categoryName);

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
            .slice(0, Math.min(10, allQuestions.length));
          setQuestions(randomQuestions);
          setUsedQuestionIds(randomQuestions.map(q => q.id));
        } else {
          // Select 10 random questions from available ones
          const randomQuestions = [...availableQuestions]
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(10, availableQuestions.length));
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

    const question = questions[currentQuestion];
    
    const handleAnswerSelect = (index: number) => {
      setSelectedAnswer(index);
      setShowResult(true);
      
      // Convert A,B,C,D to 0,1,2,3
      const correctIndex = question.correct_option.charCodeAt(0) - 65;
      if (index === correctIndex) {
        setScore(prev => prev + 1);
      }
    };

    const nextQuestion = () => {
      if (currentQuestion < questions.length - 1) {
        setSelectedAnswer(null);
        setShowResult(false);
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Set completed - show completion screen
        setTotalScore(prev => prev + score);
        setShowResult(false);
        setSelectedAnswer(null);
        setCurrentQuestion(0);
        setScore(0);
        setCurrentSet(prev => prev + 1);
      }
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

            {showResult && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2 nepali-text">
                  {language === "en" ? "Explanation:" : "व्याख्या:"}
                </h4>
                <p className="text-sm text-muted-foreground nepali-text">
                  {question.explanation}
                </p>
                <Button 
                  variant="nepal" 
                  size="sm" 
                  className="mt-4" 
                  onClick={nextQuestion}
                >
                  {currentQuestion < questions.length - 1 
                    ? (language === "en" ? "Next Question" : "अर्को प्रश्न")
                    : (language === "en" ? "Finish Quiz" : "क्विज समाप्त गर्नुहोस्")}
                </Button>
              </div>
            )}
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