import { useQuery } from '@tanstack/react-query'
import { BarChart3, FileText, Users, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function Analytics() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get('/analytics').then(res => res.data)
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load analytics data</p>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Forms',
      value: analytics?.totalForms || 0,
      icon: FileText,
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Total Submissions',
      value: analytics?.totalSubmissions || 0,
      icon: Users,
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Active Forms',
      value: analytics?.publishedForms || 0,
      icon: TrendingUp,
      change: '+5%',
      changeType: 'positive'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <p className="text-gray-600 mt-1">Monitor your forms performance and submission trends</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className="absolute rounded-md bg-primary/10 p-3">
                <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Recent Activity
          </h3>
          {analytics?.recentSubmissions && analytics.recentSubmissions.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {analytics.recentSubmissions.map((submission: any, idx: number) => (
                  <li key={submission._id}>
                    <div className="relative pb-8">
                      {idx !== analytics.recentSubmissions.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-white">
                            <Users className="h-4 w-4 text-primary" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              New submission to{' '}
                              <span className="font-medium text-gray-900">
                                {submission.formTitle}
                              </span>
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {formatDate(submission.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent submissions</p>
          )}
        </div>
      </div>

      {/* Top Performing Forms */}
      {analytics?.topForms && analytics.topForms.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Top Performing Forms
            </h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {analytics.topForms.map((form: any) => (
                  <li key={form._id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {form.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {form.submissionCount} submissions
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {formatDate(form.createdAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
