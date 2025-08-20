import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  Edit,
  BarChart3
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { api } from '@/lib/api'

interface DashboardStats {
  totalForms: number
  publishedForms: number
  totalSubmissions: number
  periodSubmissions: number
  averageSubmissionsPerForm: string
}

interface TopForm {
  _id: string
  title: string
  submissions: number
  createdAt: string
}

interface RecentActivity {
  _id: string
  formId: {
    _id: string
    title: string
  }
  metadata: {
    submittedAt: string
  }
  status: string
}

export default function Dashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => api.get('/analytics/dashboard').then(res => res.data.data)
  })

  const { data: formsData, isLoading: formsLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: () => api.get('/forms?limit=5').then(res => res.data.data)
  })

  if (dashboardLoading || formsLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const stats = dashboardData?.overview || {
    totalForms: 0,
    publishedForms: 0,
    totalSubmissions: 0,
    periodSubmissions: 0,
    averageSubmissionsPerForm: '0'
  }

  const topForms = dashboardData?.topForms || []
  const recentActivity = dashboardData?.recentActivity || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your form builder dashboard. Here's an overview of your forms and submissions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalForms}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published Forms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedForms}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Period</p>
                <p className="text-2xl font-bold text-gray-900">{stats.periodSubmissions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Forms */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Performing Forms</h3>
            <p className="card-description">Forms with the most submissions</p>
          </div>
          <div className="card-content">
            {topForms.length > 0 ? (
              <div className="space-y-4">
                {topForms.map((form: TopForm) => (
                  <div key={form._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{form.title}</h4>
                      <p className="text-sm text-gray-500">{formatDate(form.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{form.submissions} submissions</span>
                      <Link
                        to={`/forms/${form._id}/analytics`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No forms created yet</p>
                <Link to="/forms/new" className="btn-primary mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Form
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <p className="card-description">Latest form submissions</p>
          </div>
          <div className="card-content">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity: RecentActivity) => (
                  <div key={activity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.formId.title}</h4>
                      <p className="text-sm text-gray-500">{formatDate(activity.metadata.submittedAt)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.status === 'processed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status}
                      </span>
                      <Link
                        to={`/forms/${activity.formId._id}`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No submissions yet</p>
                <p className="text-sm text-gray-400">Submissions will appear here once forms are published</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/forms/new" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create New Form
              </Link>
              <Link to="/forms" className="btn-outline">
                <FileText className="h-4 w-4 mr-2" />
                View All Forms
              </Link>
              <Link to="/analytics" className="btn-outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
