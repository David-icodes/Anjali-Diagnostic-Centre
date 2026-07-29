import axios from 'axios'
import { API_URL } from './utils'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
