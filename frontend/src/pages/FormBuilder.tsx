import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  Save, 
  Eye, 
  Settings, 
  Plus, 
  Trash2, 
  Copy,
  ArrowLeft,
  Globe
} from 'lucide-react'
import { api, endpoints, Form, FormField, FormSettings } from '@/lib/api'
import { generateId } from '@/lib/utils'
import FieldConfigPanel from '@/components/FieldConfigPanel'
import FormSettingsPanel from '@/components/FormSettingsPanel'
import FormPreview from '@/components/FormPreview'

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: 'T' },
  { type: 'email', label: 'Email Input', icon: '@' },
  { type: 'textarea', label: 'Text Area', icon: '¶' },
  { type: 'select', label: 'Dropdown', icon: '▼' },
  { type: 'radio', label: 'Radio Buttons', icon: '○' },
  { type: 'checkbox', label: 'Checkboxes', icon: '☐' },
  { type: 'file', label: 'File Upload', icon: '📎' },
]

export default function FormBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id

  const [form, setForm] = useState<Partial<Form>>({
    title: '',
    description: '',
    fields: [],
    settings: {
      thankYouMessage: 'Thank you for your submission!',
      submissionLimit: undefined,
      allowMultipleSubmissions: true,
      redirectUrl: '',
      isMultiStep: false,
      steps: []
    },
    status: 'draft'
  })

  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Fetch existing form if editing
  const { data: existingForm, isLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: () => api.get(endpoints.forms.get(id!)).then(res => res.data.data),
    enabled: isEditing
  })

  useEffect(() => {
    if (existingForm) {
      setForm(existingForm)
    }
  }, [existingForm])

  const saveFormMutation = useMutation({
    mutationFn: (formData: Partial<Form>) => {
      if (isEditing) {
        return api.put(endpoints.forms.update(id!), formData)
      } else {
        return api.post(endpoints.forms.create, formData)
      }
    },
    onSuccess: (response) => {
      const savedForm = response.data.data
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] })
      
      if (!isEditing) {
        navigate(`/forms/${savedForm._id}/edit`)
      }
    }
  })

  const publishFormMutation = useMutation({
    mutationFn: () => api.patch(endpoints.forms.publish(id!)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] })
      setForm(prev => ({ ...prev, status: 'published' }))
    }
  })

  const handleAddField = (fieldType: string) => {
    const newField: FormField = {
      id: generateId(),
      type: fieldType as any,
      label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: '',
      required: false,
      order: form.fields?.length || 0,
      options: fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox' ? ['Option 1'] : undefined,
      fileTypes: fieldType === 'file' ? ['image/jpeg', 'image/png'] : undefined,
      maxFileSize: fieldType === 'file' ? 5242880 : undefined
    }

    setForm(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }))
    setSelectedField(newField)
  }

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields?.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const handleDeleteField = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields?.filter(field => field.id !== fieldId) || []
    }))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
    }
  }

  const handleDuplicateField = (field: FormField) => {
    const duplicatedField: FormField = {
      ...field,
      id: generateId(),
      label: `${field.label} (Copy)`,
      order: (form.fields?.length || 0)
    }

    setForm(prev => ({
      ...prev,
      fields: [...(prev.fields || []), duplicatedField]
    }))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const fields = Array.from(form.fields || [])
    const [reorderedField] = fields.splice(result.source.index, 1)
    fields.splice(result.destination.index, 0, reorderedField)

    // Update order property
    const updatedFields = fields.map((field, index) => ({
      ...field,
      order: index
    }))

    setForm(prev => ({
      ...prev,
      fields: updatedFields
    }))
  }

  const handleSave = async () => {
    if (!form.title?.trim()) {
      alert('Please enter a form title')
      return
    }

    if (!form.fields || form.fields.length === 0) {
      alert('Please add at least one field to your form')
      return
    }

    try {
      await saveFormMutation.mutateAsync(form)
    } catch (error) {
      console.error('Failed to save form:', error)
    }
  }

  const handlePublish = async () => {
    if (form.status === 'draft') {
      try {
        await publishFormMutation.mutateAsync()
      } catch (error) {
        console.error('Failed to publish form:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Left Sidebar - Field Types */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Field Types</h3>
        <div className="space-y-2">
          {fieldTypes.map((fieldType) => (
            <button
              key={fieldType.type}
              onClick={() => handleAddField(fieldType.type)}
              className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-sm font-medium mr-3">
                {fieldType.icon}
              </div>
              <span className="text-sm text-gray-700">{fieldType.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Form Builder */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/forms')}
                className="btn-outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forms
              </button>
              <div>
                <input
                  type="text"
                  placeholder="Enter form title..."
                  value={form.title || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Enter form description..."
                  value={form.description || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="text-gray-600 bg-transparent border-none outline-none placeholder-gray-400 w-full mt-1"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className="btn-outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="btn-outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              {form.status === 'published' && (
                <button
                  onClick={() => window.open(`/form/${id}`, '_blank')}
                  className="btn-outline"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  View Public
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saveFormMutation.isPending}
                className="btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveFormMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              {form.status === 'draft' && isEditing && (
                <button
                  onClick={handlePublish}
                  disabled={publishFormMutation.isPending}
                  className="btn-primary bg-green-600 hover:bg-green-700"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {publishFormMutation.isPending ? 'Publishing...' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Builder Area */}
        <div className="flex-1 flex">
          {/* Form Canvas */}
          <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="form-fields">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-full"
                  >
                    {form.fields && form.fields.length > 0 ? (
                      form.fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`mb-4 ${
                                snapshot.isDragging ? 'opacity-50' : ''
                              }`}
                            >
                              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="flex items-center gap-2 cursor-move"
                                  >
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleDuplicateField(field)}
                                      className="p-1 text-gray-400 hover:text-gray-600"
                                      title="Duplicate field"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteField(field.id)}
                                      className="p-1 text-red-400 hover:text-red-600"
                                      title="Delete field"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div
                                  onClick={() => setSelectedField(field)}
                                  className="cursor-pointer"
                                >
                                  <div className="mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {field.label}
                                      {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </span>
                                  </div>
                                  
                                  {/* Field Preview */}
                                  <div className="text-gray-500 text-sm">
                                    {field.type === 'text' && (
                                      <input
                                        type="text"
                                        placeholder={field.placeholder || 'Text input'}
                                        className="input bg-gray-50"
                                        disabled
                                      />
                                    )}
                                    {field.type === 'email' && (
                                      <input
                                        type="email"
                                        placeholder={field.placeholder || 'Email input'}
                                        className="input bg-gray-50"
                                        disabled
                                      />
                                    )}
                                    {field.type === 'textarea' && (
                                      <textarea
                                        placeholder={field.placeholder || 'Text area'}
                                        className="input bg-gray-50"
                                        rows={3}
                                        disabled
                                      />
                                    )}
                                    {field.type === 'select' && (
                                      <select className="input bg-gray-50" disabled>
                                        <option>{field.placeholder || 'Select an option'}</option>
                                        {field.options?.map((option, i) => (
                                          <option key={i} value={option}>{option}</option>
                                        ))}
                                      </select>
                                    )}
                                    {field.type === 'radio' && (
                                      <div className="space-y-2">
                                        {field.options?.map((option, i) => (
                                          <label key={i} className="flex items-center">
                                            <input type="radio" className="mr-2" disabled />
                                            <span>{option}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                    {field.type === 'checkbox' && (
                                      <div className="space-y-2">
                                        {field.options?.map((option, i) => (
                                          <label key={i} className="flex items-center">
                                            <input type="checkbox" className="mr-2" disabled />
                                            <span>{option}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                    {field.type === 'file' && (
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <span className="text-gray-500">File upload area</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No fields yet</h3>
                        <p className="text-gray-500">Drag field types from the left sidebar to start building your form</p>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Right Sidebar - Field Configuration */}
          {selectedField && (
            <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
              <FieldConfigPanel
                field={selectedField}
                onUpdate={(updates) => handleUpdateField(selectedField.id, updates)}
                onClose={() => setSelectedField(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <FormSettingsPanel
          settings={form.settings || {}}
          onUpdate={(settings) => setForm(prev => ({ ...prev, settings }))}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPreview && (
        <FormPreview
          form={form as Form}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
