import axios from 'axios'

const SERVER_IP = import.meta.env.VITE_SERVER_IP || 'localhost'
const API_URL = import.meta.env.VITE_API_URL || `http://${SERVER_IP}:8000`

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookit_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bookit_admin_token')
      localStorage.removeItem('bookit_admin_user')
      window.location.href = '/auth'
    }
    return Promise.reject(err)
  }
)

export const adminAuthAPI = {
  login: (data) => api.post('/api/v1/auth/login', data),
}

export const adminAPI = {
  globalStats: () => api.get('/api/v1/admin/global-stats'),
  instituteStats: () => api.get('/api/v1/admin/institute-stats'),
  listOwners: () => api.get('/api/v1/admin/owners'),
  approveOwner: (id) => api.put(`/api/v1/admin/owners/${id}/approve`),
  rejectOwner: (id) => api.put(`/api/v1/admin/owners/${id}/reject`),
  listUsers: () => api.get('/api/v1/admin/users'),
  listCanteens: () => api.get('/api/v1/admin/canteens'),
  toggleUserDisabled: (userId) => api.patch(`/api/v1/admin/users/${userId}/toggle-disabled`),
}

export const institutionsAPI = {
  list: () => api.get('/api/v1/institutions'),
  create: (data) => api.post('/api/v1/institutions', data),
  update: (id, data) => api.patch(`/api/v1/institutions/${id}`, data),
  delete: (id) => api.delete(`/api/v1/institutions/${id}`),
}

export default api
