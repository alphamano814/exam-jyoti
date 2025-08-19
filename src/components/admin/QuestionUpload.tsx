import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Upload } from 'lucide-react'

interface QuestionData {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  category: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  language: 'en' | 'ne'
}

export const QuestionUpload = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [questionData, setQuestionData] = useState<QuestionData>({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    category: '',
    subject: '',
    difficulty: 'medium',
    language: 'en'
  })

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionData.options]
    newOptions[index] = value
    setQuestionData({ ...questionData, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Transform data to match database schema
      const dbData = {
        question: questionData.question,
        option_a: questionData.options[0],
        option_b: questionData.options[1],
        option_c: questionData.options[2],
        option_d: questionData.options[3],
        correct_option: String.fromCharCode(65 + questionData.correct_answer), // Convert 0,1,2,3 to A,B,C,D
        explanation: questionData.explanation,
        category: questionData.category,
        subject: questionData.subject,
        difficulty: questionData.difficulty,
        language: questionData.language,
      };

      const { error } = await supabase
        .from('questions')
        .insert([dbData])

      if (error) throw error

      toast({
        title: 'Success!',
        description: 'Question uploaded successfully',
      })

      // Reset form
      setQuestionData({
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        category: '',
        subject: '',
        difficulty: 'medium',
        language: 'en'
      })
    } catch (error) {
      console.error('Error uploading question:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload question',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const csvData = event.target?.result as string
      const lines = csvData.split('\n')
      const headers = lines[0].split(',')
      
      const questions = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',')
        const correctAnswerIndex = parseInt(values[5]) || 0;
        return {
          question: values[0],
          option_a: values[1],
          option_b: values[2],
          option_c: values[3],
          option_d: values[4],
          correct_option: String.fromCharCode(65 + correctAnswerIndex), // Convert 0,1,2,3 to A,B,C,D
          explanation: values[6] || '',
          category: values[7] || '',
          subject: values[8] || '',
          difficulty: (values[9] as 'easy' | 'medium' | 'hard') || 'medium',
          language: values[10] || 'en',
        }
      })

      try {
        const { error } = await supabase
          .from('questions')
          .insert(questions)

        if (error) throw error

        toast({
          title: 'Success!',
          description: `${questions.length} questions uploaded successfully`,
        })
      } catch (error) {
        console.error('Error uploading CSV:', error)
        toast({
          title: 'Error',
          description: 'Failed to upload CSV file',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Question Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Single Question
            </CardTitle>
            <CardDescription>
              Upload individual MCQ questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={questionData.category} onValueChange={(value) => setQuestionData({ ...questionData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lok-sewa">Lok Sewa</SelectItem>
                      <SelectItem value="general-knowledge">General Knowledge</SelectItem>
                      <SelectItem value="current-affairs">Current Affairs</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="nepali">Nepali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={questionData.subject}
                    onChange={(e) => setQuestionData({ ...questionData, subject: e.target.value })}
                    placeholder="e.g., History, Biology"
                    required
                  />
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select value={questionData.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setQuestionData({ ...questionData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select value={questionData.language} onValueChange={(value: 'en' | 'ne') => setQuestionData({ ...questionData, language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ne">Nepali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={questionData.question}
                  onChange={(e) => setQuestionData({ ...questionData, question: e.target.value })}
                  placeholder="Enter your question here..."
                  required
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-3">
                <Label>Options</Label>
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label>Correct Answer</Label>
                <RadioGroup
                  value={questionData.correct_answer.toString()}
                  onValueChange={(value) => setQuestionData({ ...questionData, correct_answer: parseInt(value) })}
                  className="flex flex-row gap-4"
                >
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={questionData.explanation}
                  onChange={(e) => setQuestionData({ ...questionData, explanation: e.target.value })}
                  placeholder="Provide explanation for the correct answer..."
                  className="min-h-[60px]"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Uploading...' : 'Upload Question'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* CSV Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Bulk Upload (CSV)
            </CardTitle>
            <CardDescription>
              Upload multiple questions using CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  CSV Format: Question, Option1, Option2, Option3, Option4, CorrectAnswerIndex (0-3), Explanation, Category, Subject, Difficulty, Language
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="csvFile">Select CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="mt-2"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p><strong>Sample CSV format:</strong></p>
                <code className="block mt-2 p-2 bg-muted rounded text-xs">
                  "What is 2+2?","2","3","4","5",2,"Addition of two numbers","mathematics","Basic Math","easy","en"
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
