import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/hooks/useAdmin'
import { QuestionUpload } from './QuestionUpload'
import { LogOut, BookOpen, Users, TrendingUp, Plus } from 'lucide-react'

interface AdminStats {
  totalQuestions: number
  totalUsers: number
  totalQuizzes: number
  questionsByCategory: Record<string, number>
}

export const AdminDashboard = () => {
  const { logoutAdmin } = useAdmin()
  const [stats, setStats] = useState<AdminStats>({
    totalQuestions: 0,
    totalUsers: 0,
    totalQuizzes: 0,
    questionsByCategory: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total questions
      const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch total quiz results
      const { count: quizzesCount } = await supabase
        .from('quiz_results')
        .select('*', { count: 'exact', head: true })

      // Fetch questions by category
      const { data: categoryData } = await supabase
        .from('questions')
        .select('category')

      const questionsByCategory: Record<string, number> = {}
      categoryData?.forEach((item) => {
        questionsByCategory[item.category] = (questionsByCategory[item.category] || 0) + 1
      })

      setStats({
        totalQuestions: questionsCount || 0,
        totalUsers: usersCount || 0,
        totalQuizzes: quizzesCount || 0,
        questionsByCategory
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Nepal MCQ Exam Preparation Admin Panel</p>
            </div>
            <Button onClick={logoutAdmin} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalQuestions}</div>
                  <p className="text-xs text-muted-foreground">Questions in database</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats.totalQuizzes}</div>
                  <p className="text-xs text-muted-foreground">Total quiz attempts</p>
                </CardContent>
              </Card>
            </div>

            {/* Questions by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Questions by Category</CardTitle>
                <CardDescription>Distribution of questions across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.questionsByCategory).map(([category, count]) => (
                    <Badge key={category} variant="secondary" className="text-sm">
                      {category}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <QuestionUpload />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage registered users and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}