import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { FormSettings } from '@/lib/api'

interface FormSettingsPanelProps {
  settings: FormSettings
  onUpdate: (settings: FormSettings) => void
  onClose: () => void
}

export default function FormSettingsPanel({ settings, onUpdate, onClose }: FormSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<FormSettings>(settings)

  const handleUpdate = (updates: Partial<FormSettings>) => {
    const updatedSettings = { ...localSettings, ...updates }
    setLocalSettings(updatedSettings)
    onUpdate(updatedSettings)
  }

  const addStep = () => {
    const newSteps = [...(localSettings.steps || []), `Step ${(localSettings.steps?.length || 0) + 1}`]
    handleUpdate({ steps: newSteps })
  }

  const updateStep = (index: number, value: string) => {
    const newSteps = [...(localSettings.steps || [])]
    newSteps[index] = value
    handleUpdate({ steps: newSteps })
  }

  const removeStep = (index: number) => {
    const newSteps = localSettings.steps?.filter((_, i) => i !== index) || []
    handleUpdate({ steps: newSteps })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Form Settings</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Thank You Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thank You Message
              </label>
              <textarea
                value={localSettings.thankYouMessage || ''}
                onChange={(e) => handleUpdate({ thankYouMessage: e.target.value })}
                className="input w-full"
                rows={3}
                placeholder="Thank you for your submission!"
              />
              <p className="text-sm text-gray-500 mt-1">
                This message will be displayed after a successful form submission.
              </p>
            </div>

            {/* Submission Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Limit
              </label>
              <input
                type="number"
                value={localSettings.submissionLimit || ''}
                onChange={(e) => handleUpdate({ 
                  submissionLimit: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="input w-full"
                placeholder="Leave empty for unlimited"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum number of submissions allowed for this form. Leave empty for unlimited.
              </p>
            </div>

            {/* Multiple Submissions */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowMultiple"
                checked={localSettings.allowMultipleSubmissions}
                onChange={(e) => handleUpdate({ allowMultipleSubmissions: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowMultiple" className="ml-2 text-sm text-gray-700">
                Allow multiple submissions from the same user
              </label>
            </div>

            {/* Redirect URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URL (Optional)
              </label>
              <input
                type="url"
                value={localSettings.redirectUrl || ''}
                onChange={(e) => handleUpdate({ redirectUrl: e.target.value })}
                className="input w-full"
                placeholder="https://example.com/thank-you"
              />
              <p className="text-sm text-gray-500 mt-1">
                Users will be redirected to this URL after form submission. Leave empty to show the thank you message.
              </p>
            </div>

            {/* Multi-step Form */}
            <div>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="isMultiStep"
                  checked={localSettings.isMultiStep}
                  onChange={(e) => handleUpdate({ isMultiStep: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isMultiStep" className="ml-2 text-sm font-medium text-gray-700">
                  Enable multi-step form
                </label>
              </div>
              
              {localSettings.isMultiStep && (
                <div className="ml-6 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Step Names
                  </label>
                  <div className="space-y-2">
                    {localSettings.steps?.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => updateStep(index, e.target.value)}
                          className="input flex-1"
                          placeholder={`Step ${index + 1}`}
                        />
                        <button
                          onClick={() => removeStep(index)}
                          className="p-1 text-red-400 hover:text-red-600"
                          disabled={localSettings.steps?.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addStep}
                      className="btn-outline w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Define the names for each step in your multi-step form. Fields will be distributed across these steps.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
