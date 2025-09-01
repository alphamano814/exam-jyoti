import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AllQuestionsPageProps {
  language: "en" | "np";
  onNavigate: (page: string) => void;
}

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

export const AllQuestionsPage = ({ language, onNavigate }: AllQuestionsPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState<{ [key: string]: boolean }>({});

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('category')
          .not('category', 'is', null);

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        // Get unique categories
        const uniqueSubjects = [...new Set(data.map(item => item.category))].filter(Boolean);
        setCategories(uniqueSubjects);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch questions by category
  const fetchQuestionsByCategory = async (category: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category);

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      setQuestions(data || []);
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (questionId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getOptionLabel = (option: string) => {
    return option.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepal-primary"></div>
      </div>
    );
  }

  // Show categories if no category selected
  if (!selectedCategory) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate("home")}
          >
            <ArrowLeft size={16} />
          </Button>
          <h2 className="text-2xl font-bold">
            {language === "en" ? "All Questions" : "सबै प्रश्नहरू"}
          </h2>
        </div>

        <p className="text-muted-foreground nepali-text">
          {language === "en" 
            ? "Select a category to view questions" 
            : "प्रश्नहरू हेर्न श्रेणी छान्नुहोस्"}
        </p>

        {categories.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground nepali-text">
                {language === "en" 
                  ? "No questions available yet" 
                  : "अहिले कुनै प्रश्नहरू उपलब्ध छैनन्"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <Card key={category} className="glass hover:shadow-soft transition-smooth">
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full text-left justify-start"
                    onClick={() => fetchQuestionsByCategory(category)}
                  >
                    <BookOpen size={20} className="mr-3" />
                    <span className="nepali-text">{category}</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show questions for selected category
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-xl font-bold nepali-text">{selectedCategory}</h2>
          <p className="text-sm text-muted-foreground">
            {questions.length} {language === "en" ? "questions" : "प्रश्नहरू"}
          </p>
        </div>
      </div>

      {questions.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground nepali-text">
              {language === "en" 
                ? "No questions available in this category" 
                : "यस श्रेणीमा कुनै प्रश्नहरू उपलब्ध छैनन्"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id} className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-base nepali-text">
                  {index + 1}. {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-success bg-success/10 text-success nepali-text">
                    <span className="font-medium">
                      {question.correct_option}. 
                    </span>
                    {' ' + question[`option_${question.correct_option.toLowerCase()}` as keyof Question]}
                  </div>
                </div>

                {question.explanation && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAnswer(question.id)}
                    >
                      {showAnswers[question.id] ? (
                        <>
                          <EyeOff size={16} className="mr-2" />
                          {language === "en" ? "Hide Explanation" : "व्याख्या लुकाउनुहोस्"}
                        </>
                      ) : (
                        <>
                          <Eye size={16} className="mr-2" />
                          {language === "en" ? "Show Explanation" : "व्याख्या देखाउनुहोस्"}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {showAnswers[question.id] && question.explanation && (
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm text-muted-foreground nepali-text">
                      <strong>{language === "en" ? "Explanation:" : "व्याख्या:"}</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};