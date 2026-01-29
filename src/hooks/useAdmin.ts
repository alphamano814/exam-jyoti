import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const ADMIN_EMAIL = 'prabinpokhrel234@gmail.com'

// NOTE:
// Admin access must NOT depend on client-side storage or hardcoded passwords.
// This hook only derives admin status from the authenticated Supabase user.
// Actual data access is enforced by Supabase RLS policies (server-side).
export const useAdmin = () => {
  const { user } = useAuth()

  const isAdmin = useMemo(() => {
    return !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  }, [user])

  return {
    isAdmin,
    // Backwards-compatible fields for existing UI
    isAdminLoggedIn: isAdmin,
    verifyAdminPassword: (_password?: string) => isAdmin,
    logoutAdmin: () => {}
  }
}