import { createContext, useContext, useState, useCallback } from 'react'
import { adminAuthAPI } from '../services/api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bookit_admin_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('bookit_admin_token') || null)

  const login = useCallback(async (email, password) => {
    const res = await adminAuthAPI.login({ email, password })
    const { access_token, user: u } = res.data
    if (u.role !== 'admin') throw new Error('Not an admin account')
    localStorage.setItem('bookit_admin_token', access_token)
    localStorage.setItem('bookit_admin_user', JSON.stringify(u))
    setToken(access_token)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('bookit_admin_token')
    localStorage.removeItem('bookit_admin_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{
      user, token,
      isAuthenticated: !!token && !!user,
      login, logout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
