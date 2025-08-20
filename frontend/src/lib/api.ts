import axios from 'axios'

// Create axios instance
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login or clear token
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    if (error.response?.status === 403) {
      // Forbidden
      console.error('Access denied')
    }
    
    if (error.response?.status === 500) {
      // Server error
      console.error('Server error occurred')
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const endpoints = {
  forms: {
    list: '/forms',
    create: '/forms',
    get: (id: string) => `/forms/${id}`,
    update: (id: string) => `/forms/${id}`,
    delete: (id: string) => `/forms/${id}`,
    duplicate: (id: string) => `/forms/${id}/duplicate`,
    publish: (id: string) => `/forms/${id}/publish`,
    unpublish: (id: string) => `/forms/${id}/unpublish`,
  },
  submissions: {
    create: '/submissions',
    get: (id: string) => `/submissions/${id}`,
    getByForm: (formId: string) => `/submissions/form/${formId}`,
    delete: (id: string) => `/submissions/${id}`,
  },
  upload: {
    single: '/upload/single',
    multiple: '/upload/multiple',
    delete: (filename: string) => `/upload/${filename}`,
    info: (filename: string) => `/upload/${filename}`,
  },
  analytics: {
    form: (formId: string) => `/analytics/form/${formId}`,
    export: (formId: string) => `/analytics/form/${formId}/export`,
    dashboard: '/analytics/dashboard',
  },
}

// Form types
export interface FormField {
  id: string
  type: 'text' | 'email' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file'
  label: string
  placeholder?: string
  required: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  options?: string[]
  fileTypes?: string[]
  maxFileSize?: number
  order: number
}

export interface FormSettings {
  thankYouMessage?: string
  submissionLimit?: number
  allowMultipleSubmissions: boolean
  redirectUrl?: string
  isMultiStep: boolean
  steps?: string[]
}

export interface Form {
  _id: string
  title: string
  description?: string
  fields: FormField[]
  settings: FormSettings
  status: 'draft' | 'published'
  submissions: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  createdBy?: string
}

export interface SubmissionField {
  fieldId: string
  value: any
  fieldType: string
}

export interface Submission {
  _id: string
  formId: string
  fields: SubmissionField[]
  metadata: {
    ipAddress?: string
    userAgent?: string
    referrer?: string
    submittedAt: string
  }
  status: 'pending' | 'processed' | 'failed'
  processedAt?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  details?: any[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
