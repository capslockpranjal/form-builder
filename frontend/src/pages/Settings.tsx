import { useState } from 'react'
import { Settings as SettingsIcon, Save, Database, Shield, Palette, Bell } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
    maxFileSize: 10,
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    rateLimit: 100,
    sessionTimeout: 30
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    // TODO: Implement settings save to backend
    console.log('Saving settings:', settings)
  }

  const settingSections = [
    {
      title: 'General',
      icon: SettingsIcon,
      settings: [
        {
          key: 'autoSave',
          label: 'Auto-save forms',
          type: 'checkbox',
          description: 'Automatically save form changes as you work'
        },
        {
          key: 'sessionTimeout',
          label: 'Session timeout (minutes)',
          type: 'number',
          description: 'How long to keep you logged in'
        }
      ]
    },
    {
      title: 'File Upload',
      icon: Database,
      settings: [
        {
          key: 'maxFileSize',
          label: 'Maximum file size (MB)',
          type: 'number',
          description: 'Largest file size allowed for uploads'
        },
        {
          key: 'allowedFileTypes',
          label: 'Allowed file types',
          type: 'text',
          description: 'Comma-separated list of allowed MIME types'
        }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      settings: [
        {
          key: 'rateLimit',
          label: 'Rate limit (requests per minute)',
          type: 'number',
          description: 'Maximum API requests per minute per IP'
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          key: 'darkMode',
          label: 'Dark mode',
          type: 'checkbox',
          description: 'Use dark theme for the application'
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          key: 'notifications',
          label: 'Enable notifications',
          type: 'checkbox',
          description: 'Show browser notifications for form submissions'
        }
      ]
    }
  ]

  const renderSettingInput = (setting: any) => {
    const value = settings[setting.key as keyof typeof settings]
    
    switch (setting.type) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value))}
            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        )
      case 'text':
        return (
          <input
            type="text"
            value={Array.isArray(value) ? (value as string[]).join(', ') : value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value.split(',').map(s => s.trim()))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application preferences and configuration</p>
      </div>

      {/* Settings Form */}
      <div className="space-y-8">
        {settingSections.map((section) => (
          <div key={section.title} className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <section.icon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {section.title}
                </h3>
              </div>
              
              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div key={setting.key} className="flex items-start justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">
                        {setting.label}
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        {setting.description}
                      </p>
                    </div>
                    <div className="ml-6">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  )
}
