import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'

interface AdminLoginProps {
  onSuccess: () => void
}

export const AdminLogin = ({ onSuccess }: AdminLoginProps) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { verifyAdminPassword } = useAdmin()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (verifyAdminPassword(password)) {
      onSuccess()
    } else {
      setError('गलत पासवर्ड / Incorrect password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nepal-primary to-nepal-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-nepal-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-nepal-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>
            प्रशासक पहुँच / Administrator Login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" variant="nepal">
              Login / लगइन
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}