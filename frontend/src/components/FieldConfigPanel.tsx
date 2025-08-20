import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { FormField } from '@/lib/api'

interface FieldConfigPanelProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
  onClose: () => void
}

export default function FieldConfigPanel({ field, onUpdate, onClose }: FieldConfigPanelProps) {
  const [localField, setLocalField] = useState<FormField>(field)

  const handleUpdate = (updates: Partial<FormField>) => {
    const updatedField = { ...localField, ...updates }
    setLocalField(updatedField)
    onUpdate(updates)
  }

  const addOption = () => {
    const newOptions = [...(localField.options || []), `Option ${(localField.options?.length || 0) + 1}`]
    handleUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(localField.options || [])]
    newOptions[index] = value
    handleUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = localField.options?.filter((_, i) => i !== index) || []
    handleUpdate({ options: newOptions })
  }

  const addFileType = () => {
    const newFileTypes = [...(localField.fileTypes || []), 'image/jpeg']
    handleUpdate({ fileTypes: newFileTypes })
  }

  const updateFileType = (index: number, value: string) => {
    const newFileTypes = [...(localField.fileTypes || [])]
    newFileTypes[index] = value
    handleUpdate({ fileTypes: newFileTypes })
  }

  const removeFileType = (index: number) => {
    const newFileTypes = localField.fileTypes?.filter((_, i) => i !== index) || []
    handleUpdate({ fileTypes: newFileTypes })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Field Configuration</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Basic Settings */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Basic Settings</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Label
              </label>
              <input
                type="text"
                value={localField.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                className="input w-full"
                placeholder="Enter field label"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder Text
              </label>
              <input
                type="text"
                value={localField.placeholder || ''}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                className="input w-full"
                placeholder="Enter placeholder text"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={localField.required}
                onChange={(e) => handleUpdate({ required: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                Required field
              </label>
            </div>
          </div>
        </div>

        {/* Validation Rules */}
        {(localField.type === 'text' || localField.type === 'textarea' || localField.type === 'email') && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Validation Rules</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Length
                  </label>
                  <input
                    type="number"
                    value={localField.validation?.minLength || ''}
                    onChange={(e) => handleUpdate({
                      validation: {
                        ...localField.validation,
                        minLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="input w-full"
                    placeholder="Min"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Length
                  </label>
                  <input
                    type="number"
                    value={localField.validation?.maxLength || ''}
                    onChange={(e) => handleUpdate({
                      validation: {
                        ...localField.validation,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    className="input w-full"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>

              {localField.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pattern (Regex)
                  </label>
                  <input
                    type="text"
                    value={localField.validation?.pattern || ''}
                    onChange={(e) => handleUpdate({
                      validation: {
                        ...localField.validation,
                        pattern: e.target.value || undefined
                      }
                    })}
                    className="input w-full"
                    placeholder="Enter regex pattern"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Options for Select, Radio, Checkbox */}
        {(localField.type === 'select' || localField.type === 'radio' || localField.type === 'checkbox') && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Options</h4>
            <div className="space-y-2">
              {localField.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-1 text-red-400 hover:text-red-600"
                    disabled={localField.options?.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="btn-outline w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </button>
            </div>
          </div>
        )}

        {/* File Upload Settings */}
        {localField.type === 'file' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">File Upload Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed File Types
                </label>
                <div className="space-y-2">
                  {localField.fileTypes?.map((fileType, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={fileType}
                        onChange={(e) => updateFileType(index, e.target.value)}
                        className="input flex-1"
                      >
                        <option value="image/jpeg">JPEG Image</option>
                        <option value="image/png">PNG Image</option>
                        <option value="image/gif">GIF Image</option>
                        <option value="application/pdf">PDF Document</option>
                        <option value="application/msword">Word Document</option>
                        <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (.docx)</option>
                      </select>
                      <button
                        onClick={() => removeFileType(index)}
                        className="p-1 text-red-400 hover:text-red-600"
                        disabled={localField.fileTypes?.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFileType}
                    className="btn-outline w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add File Type
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={localField.maxFileSize ? Math.round(localField.maxFileSize / 1024 / 1024) : ''}
                  onChange={(e) => handleUpdate({
                    maxFileSize: e.target.value ? parseInt(e.target.value) * 1024 * 1024 : undefined
                  })}
                  className="input w-full"
                  placeholder="10"
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Number Validation */}
        {(localField.type === 'text' && localField.validation?.pattern === '^\\d+$') && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Number Validation</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  value={localField.validation?.min || ''}
                  onChange={(e) => handleUpdate({
                    validation: {
                      ...localField.validation,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  className="input w-full"
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  value={localField.validation?.max || ''}
                  onChange={(e) => handleUpdate({
                    validation: {
                      ...localField.validation,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  className="input w-full"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
