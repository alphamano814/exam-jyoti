import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'

interface UpcomingExam {
  id: string
  title: string
  description: string | null
  exam_date: string
  exam_time: string | null
  venue: string | null
  created_at: string
}

interface ExamForm {
  title: string
  description: string
  exam_date: string
  exam_time: string
  venue: string
}

export const ExamManagement = () => {
  const [exams, setExams] = useState<UpcomingExam[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExam, setEditingExam] = useState<string | null>(null)
  const [formData, setFormData] = useState<ExamForm>({
    title: '',
    description: '',
    exam_date: '',
    exam_time: '',
    venue: ''
  })

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_exams')
        .select('*')
        .order('exam_date', { ascending: true })

      if (error) throw error
      setExams(data || [])
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const examData = {
        title: formData.title,
        description: formData.description || null,
        exam_date: formData.exam_date,
        exam_time: formData.exam_time || null,
        venue: formData.venue || null,
        created_by: user.id
      }

      if (editingExam) {
        const { error } = await supabase
          .from('upcoming_exams')
          .update(examData)
          .eq('id', editingExam)

        if (error) throw error
        toast.success('Exam updated successfully!')
      } else {
        const { error } = await supabase
          .from('upcoming_exams')
          .insert([examData])

        if (error) throw error
        toast.success('Exam created successfully!')
      }

      resetForm()
      fetchExams()
    } catch (error) {
      console.error('Error saving exam:', error)
      toast.error('Failed to save exam')
    }
  }

  const handleEdit = (exam: UpcomingExam) => {
    setEditingExam(exam.id)
    setFormData({
      title: exam.title,
      description: exam.description || '',
      exam_date: exam.exam_date,
      exam_time: exam.exam_time || '',
      venue: exam.venue || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return

    try {
      const { error } = await supabase
        .from('upcoming_exams')
        .delete()
        .eq('id', examId)

      if (error) throw error
      toast.success('Exam deleted successfully!')
      fetchExams()
    } catch (error) {
      console.error('Error deleting exam:', error)
      toast.error('Failed to delete exam')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      exam_date: '',
      exam_time: '',
      venue: ''
    })
    setShowForm(false)
    setEditingExam(null)
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Exam Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {editingExam ? 'Edit Exam' : 'Add New Exam'}
              </CardTitle>
              <CardDescription>
                {editingExam ? 'Update exam details' : 'Create a new upcoming exam announcement'}
              </CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Exam
              </Button>
            )}
          </div>
        </CardHeader>
        
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Nepal Public Service Commission Exam"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exam_date">Exam Date *</Label>
                  <Input
                    id="exam_date"
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, exam_date: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exam_time">Exam Time</Label>
                  <Input
                    id="exam_time"
                    type="time"
                    value={formData.exam_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, exam_time: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    placeholder="e.g., Kathmandu, Nepal"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about the exam..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Existing Exams */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Exams</CardTitle>
          <CardDescription>View, edit, and delete upcoming exam announcements</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : exams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No exams created yet</p>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div key={exam.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{exam.title}</h3>
                      {exam.description && (
                        <p className="text-sm text-muted-foreground mt-1">{exam.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(exam)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(exam.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(parseISO(exam.exam_date), 'MMM d, yyyy')}</span>
                    </div>
                    {exam.exam_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{exam.exam_time}</span>
                      </div>
                    )}
                    {exam.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{exam.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
