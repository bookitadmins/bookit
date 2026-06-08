import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookit_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bookit_token')
      localStorage.removeItem('bookit_user')
      window.location.href = '/auth'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/v1/auth/register', data),
  login: (data) => api.post('/api/v1/auth/login', data),
  me: () => api.get('/api/v1/auth/me'),
}

// ─── Canteens ────────────────────────────────────────────────────────────────
export const canteensAPI = {
  list: (sort = 'desc') => api.get(`/api/v1/canteens?sort=${sort}`),
  get: (id) => api.get(`/api/v1/canteens/${id}`),
  create: (data) => api.post('/api/v1/canteens', data),
  update: (id, data) => api.patch(`/api/v1/canteens/${id}`, data),
  uploadImage: (id, file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post(`/api/v1/canteens/${id}/image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  listReviews: (id) => api.get(`/api/v1/canteens/${id}/reviews`),
  createReview: (id, data) => api.post(`/api/v1/canteens/${id}/reviews`, data),
}

// ─── Menu ────────────────────────────────────────────────────────────────────
export const menuAPI = {
  getMenu: (canteenId) => api.get(`/api/v1/canteens/${canteenId}/menu`),
  addItem: (canteenId, data) => api.post(`/api/v1/canteens/${canteenId}/menu`, data),
  updateItem: (id, data) => api.patch(`/api/v1/menu/${id}`, data),
  deleteItem: (id) => api.delete(`/api/v1/menu/${id}`),
  uploadImage: (id, file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post(`/api/v1/menu/${id}/image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  search: (q) => api.get(`/api/v1/search?q=${encodeURIComponent(q)}`),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (data) => api.post('/api/v1/orders', data),
  myOrders: () => api.get('/api/v1/orders/my'),
  canteenOrders: (canteenId) => api.get(`/api/v1/orders/canteen/${canteenId}`),
  updateStatus: (id, data) => api.put(`/api/v1/orders/${id}/status`, data),
}

export default api
