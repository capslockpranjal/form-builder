import { useState } from 'react'
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Form } from '@/lib/api'

interface FormPreviewProps {
  form: Form
  onClose: () => void
}

export default function FormPreview({ form, onClose }: FormPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps = form.settings?.isMultiStep ? form.settings.steps || [] : []
  const isMultiStep = form.settings?.isMultiStep && steps.length > 0

  // Group fields by steps if multi-step
  const getFieldsForStep = (stepIndex: number) => {
    if (!isMultiStep) return form.fields

    const fieldsPerStep = Math.ceil(form.fields.length / steps.length)
    const startIndex = stepIndex * fieldsPerStep
    const endIndex = startIndex + fieldsPerStep
    return form.fields.slice(startIndex, endIndex)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateStep()) {
      // In preview mode, just show success message
      alert('Form validation passed! This is a preview - no data will be submitted.')
    }
  }

  const renderField = (field: any) => {
    const value = formData[field.id]
    const error = errors[field.id]

    return (
      <div key={field.id} className="mb-4">
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
            rows={3}
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
          <div className="space-y-2">
            {field.options?.map((option: string, i: number) => (
              <label key={i} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'checkbox' && (
          <div className="space-y-2">
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
                  className="mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'file' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <span className="text-gray-500">File upload preview (not functional in preview mode)</span>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900">Form Preview</h3>
            {isMultiStep && (
              <div className="flex items-center gap-2">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                    )}
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h2>
            {form.description && (
              <p className="text-gray-600 mb-6">{form.description}</p>
            )}

            {isMultiStep && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {steps[currentStep]}
                </h3>
                <p className="text-sm text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            )}

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
                      className="btn-primary"
                    >
                      Submit Form
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-sm text-gray-500">
            <p>This is a preview of your form. No data will be submitted.</p>
            <p className="mt-1">
              {form.fields.length} field{form.fields.length !== 1 ? 's' : ''} • 
              {form.settings?.isMultiStep ? ` ${steps.length} step${steps.length !== 1 ? 's' : ''}` : ' Single step'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
