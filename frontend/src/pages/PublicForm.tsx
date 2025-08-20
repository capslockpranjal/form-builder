import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Upload } from 'lucide-react'
import { api, endpoints, Form, SubmissionField } from '@/lib/api'

export default function PublicForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { data: form, isLoading, error } = useQuery({
    queryKey: ['public-form', id],
    queryFn: () => api.get(endpoints.forms.get(id!)).then(res => res.data.data)
  })

  const submitFormMutation = useMutation({
    mutationFn: (data: { formId: string; fields: SubmissionField[] }) => 
      api.post(endpoints.submissions.create, data),
    onSuccess: () => {
      setIsSubmitted(true)
    },
    onError: (error) => {
      console.error('Form submission failed:', error)
      alert('Failed to submit form. Please try again.')
    }
  })

  const steps = form?.settings?.isMultiStep ? form.settings.steps || [] : []
  const isMultiStep = form?.settings?.isMultiStep && steps.length > 0

  // Group fields by steps if multi-step
  const getFieldsForStep = (stepIndex: number) => {
    if (!isMultiStep) return form?.fields || []

    const fieldsPerStep = Math.ceil((form?.fields?.length || 0) / steps.length)
    const startIndex = stepIndex * fieldsPerStep
    const endIndex = startIndex + fieldsPerStep
    return form?.fields?.slice(startIndex, endIndex) || []
  }

  const currentFields = getFieldsForStep(currentStep)

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const validateField = (field: any, value: any): string => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`
    }

    if (value && value !== '') {
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            return `${field.label} must be a valid email`
          }
          break
        
        case 'text':
        case 'textarea':
          if (field.validation?.minLength && value.length < field.validation.minLength) {
            return `${field.label} must be at least ${field.validation.minLength} characters`
          }
          if (field.validation?.maxLength && value.length > field.validation.maxLength) {
            return `${field.label} must be less than ${field.validation.maxLength} characters`
          }
          break
        
        case 'select':
        case 'radio':
          if (field.options && !field.options.includes(value)) {
            return `${field.label} has an invalid option selected`
          }
          break
        
        case 'checkbox':
          if (Array.isArray(value)) {
            for (const val of value) {
              if (field.options && !field.options.includes(val)) {
                return `${field.label} has an invalid option selected`
              }
            }
          }
          break
      }
    }

    return ''
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    currentFields.forEach(field => {
      const error = validateField(field, formData[field.id])
      if (error) {
        newErrors[field.id] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep()) return

    setIsSubmitting(true)

    try {
      const submissionFields: SubmissionField[] = Object.entries(formData).map(([fieldId, value]) => ({
        fieldId,
        value,
        fieldType: form?.fields?.find(f => f.id === fieldId)?.type || 'text'
      }))

      await submitFormMutation.mutateAsync({
        formId: id!,
        fields: submissionFields
      })
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: any) => {
    const value = formData[field.id]
    const error = errors[field.id]

    return (
      <div key={field.id} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`input ${error ? 'border-red-500' : ''}`}
          />
        )}

        {field.type === 'email' && (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`input ${error ? 'border-red-500' : ''}`}
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`input ${error ? 'border-red-500' : ''}`}
          />
        )}

        {field.type === 'select' && (
          <select
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`input ${error ? 'border-red-500' : ''}`}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option: string, i: number) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        )}

        {field.type === 'radio' && (
          <div className="space-y-3">
            {field.options?.map((option: string, i: number) => (
              <label key={i} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'checkbox' && (
          <div className="space-y-3">
            {field.options?.map((option: string, i: number) => (
              <label key={i} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : []
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option)
                    handleInputChange(field.id, newValues)
                  }}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'file' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">
              {field.fileTypes?.join(', ')} • Max size: {field.maxFileSize ? Math.round(field.maxFileSize / 1024 / 1024) : 10}MB
            </p>
            <input
              type="file"
              onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
              accept={field.fileTypes?.join(',')}
              className="hidden"
              id={`file-${field.id}`}
            />
            <label
              htmlFor={`file-${field.id}`}
              className="btn-outline mt-3 cursor-pointer"
            >
              Choose File
            </label>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-6">The form you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (form.status !== 'published') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h2>
          <p className="text-gray-600 mb-6">This form is not currently published and cannot be accessed.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            {form.settings?.thankYouMessage || 'Your form has been submitted successfully.'}
          </p>
          {form.settings?.redirectUrl ? (
            <a
              href={form.settings.redirectUrl}
              className="btn-primary"
            >
              Continue
            </a>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="btn-outline"
            >
              Submit Another Response
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Form Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600">{form.description}</p>
          )}
        </div>

        {/* Progress Bar for Multi-step */}
        {isMultiStep && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    index <= currentStep 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : 'border-gray-300'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">{step}</span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit}>
            {currentFields.map(renderField)}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div>
                {isMultiStep && currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="btn-outline"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {isMultiStep && currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Form'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Form Builder</p>
        </div>
      </div>
    </div>
  )
}
