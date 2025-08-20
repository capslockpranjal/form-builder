import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Calendar, Users, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { api, endpoints, Form } from '@/lib/api'
import { formatDate } from '@/lib/utils'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function FormAnalytics() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: () => api.get(endpoints.forms.get(id!)).then(res => res.data.data)
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['form-analytics', id, period],
    queryFn: () => api.get(endpoints.analytics.form(id!), {
      params: { period }
    }).then(res => res.data.data)
  })

  const handleExportCSV = () => {
    const url = `${endpoints.analytics.export(id!)}?format=csv`
    window.open(url, '_blank')
  }

  if (formLoading || analyticsLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!form || !analytics) {
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
      <div className="mb-8">
        <button
          onClick={() => navigate('/forms')}
          className="btn-outline mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Analytics</h1>
            <p className="mt-2 text-gray-600">
              {form.title} - Submission statistics and insights
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="card mb-6">
        <div className="card-content">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Time Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="input"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Period Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.periodSubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg per Day</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageSubmissionsPerDay}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fields</p>
                <p className="text-2xl font-bold text-gray-900">{form.fields.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Submissions Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Daily Submissions</h3>
            <p className="card-description">Submission trends over time</p>
          </div>
          <div className="card-content">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => formatDate(value)}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value) => [value, 'Submissions']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Field Response Rates */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Field Response Rates</h3>
            <p className="card-description">How often each field gets responses</p>
          </div>
          <div className="card-content">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.fieldStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="label" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Response Rate']}
                  />
                  <Bar dataKey="responseRate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Field Statistics Table */}
      <div className="card mt-8">
        <div className="card-header">
          <h3 className="card-title">Field Statistics</h3>
          <p className="card-description">Detailed breakdown of field responses</p>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Field</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Response Count</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Response Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Top Values</th>
                </tr>
              </thead>
              <tbody>
                {analytics.fieldStats.map((field) => (
                  <tr key={field.fieldId} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{field.label}</td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{field.type}</td>
                    <td className="py-3 px-4 text-gray-600">{field.responseCount}</td>
                    <td className="py-3 px-4 text-gray-600">{field.responseRate}%</td>
                    <td className="py-3 px-4 text-gray-600">
                      {field.topValues.length > 0 ? (
                        <div className="space-y-1">
                          {field.topValues.slice(0, 3).map((value, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{value.value}</span>
                              <span className="text-gray-400 ml-2">({value.count})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No responses</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
