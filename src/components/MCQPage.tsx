import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Clock, CheckCircle, XCircle, Bookmark, ArrowLeft } from "lucide-react";

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

const sampleQuestions = {
  en: {
    question: "What is the capital of Nepal?",
    options: ["Kathmandu", "Pokhara", "Chitwan", "Biratnagar"],
    correct: 0,
    explanation: "Kathmandu is the capital and largest city of Nepal."
  },
  np: {
    question: "नेपालको राजधानी कुन हो?",
    options: ["काठमाडौं", "पोखरा", "चितवन", "बिराटनगर"],
    correct: 0,
    explanation: "काठमाडौं नेपालको राजधानी र सबैभन्दा ठूलो शहर हो।"
  }
};

export const MCQPage = ({ language, onNavigate }: MCQPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  if (selectedCategory) {
    const question = sampleQuestions[language];
    
    const handleAnswerSelect = (index: number) => {
      setSelectedAnswer(index);
      setShowResult(true);
      
      if (index === question.correct) {
        setScore(prev => prev + 1);
      }
    };

    const nextQuestion = () => {
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentQuestion(prev => prev + 1);
    };

    return (
      <div className="space-y-6 pb-20">
        {/* Quiz Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedCategory(null)}
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
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="nepali-text">
              {language === "en" ? `Question ${currentQuestion + 1} of 10` : `प्रश्न ${currentQuestion + 1} को 10`}
            </span>
            <span className="nepali-text">
              {language === "en" ? `Score: ${score}` : `अंक: ${score}`}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full">
            <div 
              className="h-full gradient-nepal rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
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
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === null ? "quiz" : 
                  index === question.correct ? "success" : 
                  selectedAnswer === index ? "destructive" : "quiz"
                }
                className={`w-full text-left justify-start h-auto p-4 ${
                  showResult && index === question.correct ? "animate-pulse-glow" : ""
                }`}
                onClick={() => !showResult && handleAnswerSelect(index)}
                disabled={showResult}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    showResult && index === question.correct ? "border-white bg-white/20" :
                    showResult && selectedAnswer === index && index !== question.correct ? "border-white bg-white/20" :
                    "border-current"
                  }`}>
                    {showResult && index === question.correct ? <CheckCircle size={16} /> :
                     showResult && selectedAnswer === index && index !== question.correct ? <XCircle size={16} /> :
                     String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 nepali-text">{option}</span>
                </div>
              </Button>
            ))}

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
                  {language === "en" ? "Next Question" : "अर्को प्रश्न"}
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
            onClick={() => setSelectedCategory(category.id)}
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
                      {category.questions} {language === "en" ? "questions" : "प्रश्नहरू"}
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