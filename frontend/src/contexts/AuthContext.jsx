import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bookit_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('bookit_token') || null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { access_token, user: u } = res.data
    localStorage.setItem('bookit_token', access_token)
    localStorage.setItem('bookit_user', JSON.stringify(u))
    setToken(access_token)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data)
    const { access_token, user: u } = res.data
    localStorage.setItem('bookit_token', access_token)
    localStorage.setItem('bookit_user', JSON.stringify(u))
    setToken(access_token)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('bookit_token')
    localStorage.removeItem('bookit_user')
    setToken(null)
    setUser(null)
  }, [])

  const isOwner = user?.role === 'CANTEEN_OWNER'
  const isStudent = user?.role === 'STUDENT'
  const isInstituteAdmin = user?.role === 'INSTITUTE_ADMIN'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, isOwner, isStudent, isInstituteAdmin, isSuperAdmin,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
