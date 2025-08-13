import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const ADMIN_EMAIL = 'prabinpokhrel234@gmail.com'
const ADMIN_PASSWORD = 'Prabin@234'

export const useAdmin = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      setIsAdmin(true)
      // Check if admin password is stored in session
      const adminSession = sessionStorage.getItem('admin_session')
      if (adminSession === 'authenticated') {
        setIsAdminLoggedIn(true)
      }
    } else {
      setIsAdmin(false)
      setIsAdminLoggedIn(false)
    }
  }, [user])

  const verifyAdminPassword = (password: string): boolean => {
    if (password === ADMIN_PASSWORD && user?.email === ADMIN_EMAIL) {
      sessionStorage.setItem('admin_session', 'authenticated')
      setIsAdminLoggedIn(true)
      return true
    }
    return false
  }

  const logoutAdmin = () => {
    sessionStorage.removeItem('admin_session')
    setIsAdminLoggedIn(false)
  }

  return {
    isAdmin,
    isAdminLoggedIn,
    verifyAdminPassword,
    logoutAdmin
  }
}