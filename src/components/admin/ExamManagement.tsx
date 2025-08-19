import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'

interface Exam {
  id: string
  name: string
  date: string
  type: string
  language: string
  created_at: string
}

export const ExamManagement = () => {
  const { toast } = useToast()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [examData, setExamData] = useState({
    name: '',
    date: '',
    type: '',
    language: 'en'
  })

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_exams')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setExams(data || [])
    } catch (error) {
      console.error('Error fetching exams:', error)
      toast({
        title: "Error",
        description: "Failed to fetch exams",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingExam) {
        const { error } = await supabase
          .from('upcoming_exams')
          .update(examData)
          .eq('id', editingExam.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Exam updated successfully"
        })
      } else {
        const { error } = await supabase
          .from('upcoming_exams')
          .insert([examData])

        if (error) throw error

        toast({
          title: "Success",
          description: "Exam created successfully"
        })
      }

      setIsDialogOpen(false)
      setEditingExam(null)
      setExamData({ name: '', date: '', type: '', language: 'en' })
      fetchExams()
    } catch (error) {
      console.error('Error saving exam:', error)
      toast({
        title: "Error",
        description: "Failed to save exam",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setExamData({
      name: exam.name,
      date: exam.date,
      type: exam.type,
      language: exam.language
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return

    try {
      const { error } = await supabase
        .from('upcoming_exams')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Exam deleted successfully"
      })

      fetchExams()
    } catch (error) {
      console.error('Error deleting exam:', error)
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setEditingExam(null)
    setExamData({ name: '', date: '', type: '', language: 'en' })
  }

  if (loading && exams.length === 0) {
    return <div className="flex justify-center p-8">Loading exams...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exam Management</CardTitle>
              <CardDescription>Create and manage upcoming exam dates</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exam
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingExam ? 'Edit Exam' : 'Add New Exam'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Exam Name</Label>
                    <Input
                      id="name"
                      value={examData.name}
                      onChange={(e) => setExamData({ ...examData, name: e.target.value })}
                      placeholder="e.g., Lok Sewa - Officer Level"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Exam Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={examData.date}
                      onChange={(e) => setExamData({ ...examData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Exam Type</Label>
                    <Select
                      value={examData.type}
                      onValueChange={(value) => setExamData({ ...examData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={examData.language}
                      onValueChange={(value) => setExamData({ ...examData, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="np">Nepali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : editingExam ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming exams scheduled</p>
              <p className="text-sm">Click "Add Exam" to create your first exam</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>
                        {new Date(exam.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{exam.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {exam.language === 'en' ? 'English' : 'Nepali'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(exam)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(exam.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}