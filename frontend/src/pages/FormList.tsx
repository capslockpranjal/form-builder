import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  BarChart3,
  Globe,
  FileText,
  Users
} from 'lucide-react'
import { formatDate, truncateText } from '@/lib/utils'
import { api, endpoints, Form } from '@/lib/api'

export default function FormList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: formsData, isLoading } = useQuery({
    queryKey: ['forms', { search: searchTerm, status: statusFilter, page: currentPage }],
    queryFn: () => api.get(endpoints.forms.list, {
      params: {
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        limit: 10
      }
    }).then(res => res.data)
  })

  const deleteFormMutation = useMutation({
    mutationFn: (formId: string) => api.delete(endpoints.forms.delete(formId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] })
    }
  })

  const duplicateFormMutation = useMutation({
    mutationFn: (formId: string) => api.post(endpoints.forms.duplicate(formId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
    }
  })

  const publishFormMutation = useMutation({
    mutationFn: (formId: string) => api.patch(endpoints.forms.publish(formId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] })
    }
  })

  const unpublishFormMutation = useMutation({
    mutationFn: (formId: string) => api.patch(endpoints.forms.unpublish(formId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] })
    }
  })

  const handleDeleteForm = async (formId: string, formTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${formTitle}"? This action cannot be undone.`)) {
      try {
        await deleteFormMutation.mutateAsync(formId)
      } catch (error) {
        console.error('Failed to delete form:', error)
      }
    }
  }

  const handleDuplicateForm = async (formId: string) => {
    try {
      await duplicateFormMutation.mutateAsync(formId)
    } catch (error) {
      console.error('Failed to duplicate form:', error)
    }
  }

  const handlePublishForm = async (formId: string) => {
    try {
      await publishFormMutation.mutateAsync(formId)
    } catch (error) {
      console.error('Failed to publish form:', error)
    }
  }

  const handleUnpublishForm = async (formId: string) => {
    try {
      await unpublishFormMutation.mutateAsync(formId)
    } catch (error) {
      console.error('Failed to unpublish form:', error)
    }
  }

  const forms = formsData?.data || []
  const pagination = formsData?.pagination || { page: 1, limit: 10, total: 0, pages: 1 }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
            <p className="mt-2 text-gray-600">
              Manage your forms and track their performance
            </p>
          </div>
          <Link to="/forms/new" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Forms List */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card">
              <div className="card-content">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : forms.length > 0 ? (
        <div className="space-y-4">
          {forms.map((form: Form) => (
            <div key={form._id} className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{form.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        form.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {form.status}
                      </span>
                    </div>
                    {form.description && (
                      <p className="text-gray-600 mb-3">
                        {truncateText(form.description, 150)}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {form.fields.length} fields
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {form.submissions} submissions
                      </span>
                      <span>Created {formatDate(form.createdAt)}</span>
                      {form.publishedAt && (
                        <span>Published {formatDate(form.publishedAt)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Public Form Link */}
                    {form.status === 'published' && (
                      <Link
                        to={`/form/${form._id}`}
                        target="_blank"
                        className="btn-outline"
                        title="View Public Form"
                      >
                        <Globe className="h-4 w-4" />
                      </Link>
                    )}
                    
                    {/* Preview */}
                    <Link
                      to={`/forms/${form._id}/preview`}
                      className="btn-outline"
                      title="Preview Form"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    
                    {/* Edit */}
                    <Link
                      to={`/forms/${form._id}/edit`}
                      className="btn-outline"
                      title="Edit Form"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    
                    {/* Analytics */}
                    <Link
                      to={`/forms/${form._id}/analytics`}
                      className="btn-outline"
                      title="View Analytics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                    
                    {/* Actions Menu */}
                    <div className="relative">
                      <button className="btn-outline p-2">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => handleDuplicateForm(form._id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </button>
                        {form.status === 'draft' ? (
                          <button
                            onClick={() => handlePublishForm(form._id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Publish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublishForm(form._id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Unpublish
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteForm(form._id, form.title)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-content text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first form'
              }
            </p>
            <Link to="/forms/new" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
