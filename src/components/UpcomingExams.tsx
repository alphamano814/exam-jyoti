import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns'

interface UpcomingExam {
  id: string
  title: string
  description: string | null
  exam_date: string
  exam_time: string | null
  venue: string | null
  created_at: string
}

export const UpcomingExams = () => {
  const [exams, setExams] = useState<UpcomingExam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingExams()
  }, [])

  const fetchUpcomingExams = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_exams')
        .select('*')
        .order('exam_date', { ascending: true })

      if (error) throw error
      setExams(data || [])
    } catch (error) {
      console.error('Error fetching upcoming exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExamStatusBadge = (examDate: string) => {
    const date = parseISO(examDate)
    
    if (isPast(date)) {
      return <Badge variant="secondary">Past</Badge>
    } else if (isToday(date)) {
      return <Badge className="bg-destructive text-destructive-foreground">Today</Badge>
    } else if (isTomorrow(date)) {
      return <Badge className="bg-warning text-warning-foreground">Tomorrow</Badge>
    } else {
      return <Badge className="bg-success text-success-foreground">Upcoming</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Upcoming Exams</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Upcoming Exams</h2>
      </div>
      
      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No upcoming exams scheduled</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="transition-smooth hover:shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{exam.title}</CardTitle>
                    {exam.description && (
                      <CardDescription>{exam.description}</CardDescription>
                    )}
                  </div>
                  {getExamStatusBadge(exam.exam_date)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(parseISO(exam.exam_date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  {exam.exam_time && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{exam.exam_time}</span>
                    </div>
                  )}
                  
                  {exam.venue && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{exam.venue}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}