import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/integrations/supabase/client'
import { Edit, Trash2, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Question {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation?: string
  category?: string
  difficulty?: string
  subject?: string
  language?: string
}

export const QuestionManagement = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuestions(data || [])
      setSelectedIds(new Set()) // Clear selection after refresh
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || question.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const uniqueCategories = [...new Set(questions.map(q => q.category).filter(Boolean))]

  const handleEdit = (question: Question) => {
    setEditingQuestion({ ...question })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingQuestion) return

    try {
      const { error } = await supabase
        .from('questions')
        .update({
          question: editingQuestion.question,
          option_a: editingQuestion.option_a,
          option_b: editingQuestion.option_b,
          option_c: editingQuestion.option_c,
          option_d: editingQuestion.option_d,
          correct_option: editingQuestion.correct_option,
          explanation: editingQuestion.explanation,
          category: editingQuestion.category,
          difficulty: editingQuestion.difficulty,
          subject: editingQuestion.subject
        })
        .eq('id', editingQuestion.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Question updated successfully"
      })

      setIsEditDialogOpen(false)
      setEditingQuestion(null)
      fetchQuestions()
    } catch (error) {
      console.error('Error updating question:', error)
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Question deleted successfully"
      })

      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      })
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    const confirmed = confirm(`Are you sure you want to delete ${selectedIds.size} question(s)?`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .in('id', Array.from(selectedIds))

      if (error) throw error

      toast({
        title: "Success",
        description: `${selectedIds.size} question(s) deleted successfully`
      })

      fetchQuestions()
    } catch (error) {
      console.error('Error deleting questions:', error)
      toast({
        title: "Error",
        description: "Failed to delete questions",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const isAllSelected = filteredQuestions.length > 0 && filteredQuestions.every(q => selectedIds.has(q.id))
  const isSomeSelected = filteredQuestions.some(q => selectedIds.has(q.id))

  if (loading) {
    return <div className="flex justify-center p-8">Loading questions...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Question Management</CardTitle>
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedIds.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category!}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Questions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className={isSomeSelected && !isAllSelected ? "opacity-50" : ""}
                    />
                  </TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id} className={selectedIds.has(question.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(question.id)}
                        onCheckedChange={(checked) => handleSelectOne(question.id, checked as boolean)}
                        aria-label={`Select question ${question.id}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={question.question}>
                        {question.question}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{question.category || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        question.difficulty === 'hard' ? 'destructive' :
                        question.difficulty === 'medium' ? 'default' : 'secondary'
                      }>
                        {question.difficulty || 'medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.correct_option}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(question.id)}
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

          {filteredQuestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No questions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Question</label>
                <Textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Option A</label>
                  <Input
                    value={editingQuestion.option_a}
                    onChange={(e) => setEditingQuestion({...editingQuestion, option_a: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Option B</label>
                  <Input
                    value={editingQuestion.option_b}
                    onChange={(e) => setEditingQuestion({...editingQuestion, option_b: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Option C</label>
                  <Input
                    value={editingQuestion.option_c}
                    onChange={(e) => setEditingQuestion({...editingQuestion, option_c: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Option D</label>
                  <Input
                    value={editingQuestion.option_d}
                    onChange={(e) => setEditingQuestion({...editingQuestion, option_d: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Correct Answer</label>
                  <Select
                    value={editingQuestion.correct_option}
                    onValueChange={(value) => setEditingQuestion({...editingQuestion, correct_option: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={editingQuestion.category || ''}
                    onChange={(e) => setEditingQuestion({...editingQuestion, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={editingQuestion.difficulty || 'medium'}
                    onValueChange={(value) => setEditingQuestion({...editingQuestion, difficulty: value})}
                  >
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
              </div>

              <div>
                <label className="text-sm font-medium">Explanation (Optional)</label>
                <Textarea
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}