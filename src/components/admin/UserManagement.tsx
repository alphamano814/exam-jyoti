import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Search, Trash2, Edit, Eye, Trophy, RefreshCw, Users } from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  full_name: string | null
  total_quizzes: number | null
  highest_score: number | null
  created_at: string
  updated_at: string
}

interface UserStats {
  quizCount: number
  totalScore: number
  avgScore: number
  leaderboardRank: number | null
  totalPoints: number
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [editForm, setEditForm] = useState({ full_name: '' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async (userId: string) => {
    try {
      // Fetch quiz results for user
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select('score, total_questions')
        .eq('user_id', userId)

      if (quizError) throw quizError

      const quizCount = quizResults?.length || 0
      const totalScore = quizResults?.reduce((sum, q) => sum + q.score, 0) || 0
      const avgScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0

      // Fetch leaderboard data
      const { data: leaderboardData, error: lbError } = await supabase
        .from('leaderboard')
        .select('total_points')
        .order('total_points', { ascending: false })

      if (lbError) throw lbError

      // Find user's rank
      const userIndex = leaderboardData?.findIndex((lb) => {
        // We need to check by comparing with user's leaderboard entry
        return true // We'll get the actual rank below
      })

      const { data: userLb } = await supabase
        .from('leaderboard')
        .select('total_points')
        .eq('user_id', userId)
        .maybeSingle()

      let leaderboardRank: number | null = null
      if (userLb && leaderboardData) {
        leaderboardRank = leaderboardData.findIndex(lb => lb.total_points <= userLb.total_points) + 1
        if (leaderboardRank === 0) leaderboardRank = leaderboardData.length + 1
      }

      setUserStats({
        quizCount,
        totalScore,
        avgScore,
        leaderboardRank,
        totalPoints: userLb?.total_points || 0
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
      setUserStats(null)
    }
  }

  const handleViewUser = async (user: User) => {
    setSelectedUser(user)
    setUserStats(null)
    setViewDialogOpen(true)
    await fetchUserStats(user.id)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({ full_name: user.full_name || '' })
    setEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          full_name: editForm.full_name.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'User updated successfully'
      })

      setEditDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete their quiz results and leaderboard data.')) {
      return
    }

    try {
      // Delete related data first
      await supabase.from('quiz_results').delete().eq('user_id', userId)
      await supabase.from('leaderboard').delete().eq('user_id', userId)
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'User deleted successfully'
      })

      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} user(s)? This will also delete their quiz results and leaderboard data.`)) {
      return
    }

    try {
      const ids = Array.from(selectedIds)
      
      // Delete related data first
      await supabase.from('quiz_results').delete().in('user_id', ids)
      await supabase.from('leaderboard').delete().in('user_id', ids)
      
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', ids)

      if (error) throw error

      toast({
        title: 'Success',
        description: `${selectedIds.size} user(s) deleted successfully`
      })

      setSelectedIds(new Set())
      fetchUsers()
    } catch (error) {
      console.error('Error deleting users:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete users',
        variant: 'destructive'
      })
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              View, edit, and manage registered users ({users.length} total)
            </CardDescription>
          </div>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Bulk Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedIds.size > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedIds.size})
            </Button>
          )}
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No users match your search' : 'No users found'}
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-center">Quizzes</TableHead>
                  <TableHead className="text-center">Best Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => toggleSelect(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{user.total_quizzes || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{user.highest_score || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleViewUser(user)}
                          variant="ghost"
                          size="icon"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditUser(user)}
                          variant="ghost"
                          size="icon"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          title="Delete user"
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

        {/* View User Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about this user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Name</Label>
                    <p className="font-medium">{selectedUser.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Email</Label>
                    <p className="font-medium break-all">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Joined</Label>
                    <p className="font-medium">
                      {format(new Date(selectedUser.created_at), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Last Updated</Label>
                    <p className="font-medium">
                      {format(new Date(selectedUser.updated_at), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Performance Stats
                  </h4>
                  {userStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-2xl font-bold">{userStats.quizCount}</p>
                        <p className="text-xs text-muted-foreground">Quizzes Taken</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-2xl font-bold">{userStats.avgScore}</p>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                        <p className="text-xs text-muted-foreground">Total Points</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-2xl font-bold">
                          {userStats.leaderboardRank ? `#${userStats.leaderboardRank}` : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">Leaderboard Rank</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Loading stats...</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Email (read-only)</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
