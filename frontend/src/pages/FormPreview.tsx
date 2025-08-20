import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { api, endpoints, Form } from '@/lib/api'
import FormPreviewComponent from '@/components/FormPreview'

export default function FormPreview() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: () => api.get(endpoints.forms.get(id!)).then(res => res.data.data)
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Form not found</h2>
        <p className="text-gray-600 mb-6">The form you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate('/forms')}
          className="btn-primary"
        >
          Back to Forms
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/forms')}
          className="btn-outline mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Preview Form</h1>
        <p className="mt-2 text-gray-600">
          Preview how your form will look to users
        </p>
      </div>

      <FormPreviewComponent form={form} onClose={() => navigate('/forms')} />
    </div>
  )
}
