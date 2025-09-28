import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react'

interface UserActivityData {
  date: string
  logins: number
  activeUsers: number
  totalActions: number
}

interface UserActivityStats {
  totalLogins: number
  uniqueUsers: number
  averageSessionTime: number
  activityGrowth: number
  data: UserActivityData[]
}

interface UserActivityChartProps {
  data?: UserActivityStats
}

// Mock data for demonstration
const defaultData: UserActivityStats = {
  totalLogins: 1247,
  uniqueUsers: 89,
  averageSessionTime: 24.5,
  activityGrowth: 12.3,
  data: [
    { date: '2024-01-01', logins: 45, activeUsers: 23, totalActions: 156 },
    { date: '2024-01-02', logins: 52, activeUsers: 28, totalActions: 189 },
    { date: '2024-01-03', logins: 38, activeUsers: 19, totalActions: 134 },
    { date: '2024-01-04', logins: 61, activeUsers: 32, totalActions: 221 },
    { date: '2024-01-05', logins: 47, activeUsers: 25, totalActions: 167 },
    { date: '2024-01-06', logins: 55, activeUsers: 29, totalActions: 198 },
    { date: '2024-01-07', logins: 42, activeUsers: 22, totalActions: 151 },
  ]
}

export function UserActivityChart({ data = defaultData }: UserActivityChartProps) {
  const maxLogins = Math.max(...data.data.map(d => d.logins))
  const maxActiveUsers = Math.max(...data.data.map(d => d.activeUsers))

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLogins.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.activityGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              {Math.abs(data.activityGrowth).toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageSessionTime.toFixed(1)}m</div>
            <p className="text-xs text-muted-foreground">
              Minutes per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Growth</CardTitle>
            {data.activityGrowth > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.activityGrowth > 0 ? '+' : ''}{data.activityGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            User Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Logins</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active Users</span>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {data.data.map((item, index) => {
                const loginHeight = (item.logins / maxLogins) * 100
                const activeUserHeight = (item.activeUsers / maxActiveUsers) * 100

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{formatDate(item.date)}</span>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-blue-600">
                          {item.logins} logins
                        </Badge>
                        <Badge variant="outline" className="text-green-600">
                          {item.activeUsers} users
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-end gap-2 h-12">
                      {/* Login Bar */}
                      <div className="flex-1 bg-gray-100 rounded">
                        <div
                          className="bg-blue-500 rounded transition-all duration-300"
                          style={{ height: `${Math.max(loginHeight, 4)}%` }}
                          title={`${item.logins} logins`}
                        />
                      </div>

                      {/* Active Users Bar */}
                      <div className="flex-1 bg-gray-100 rounded">
                        <div
                          className="bg-green-500 rounded transition-all duration-300"
                          style={{ height: `${Math.max(activeUserHeight, 4)}%` }}
                          title={`${item.activeUsers} active users`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Chart Summary */}
            <div className="pt-4 border-t text-sm text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">Peak Login Day: </span>
                  {formatDate(data.data.reduce((max, item) =>
                    item.logins > max.logins ? item : max
                  ).date)}
                </div>
                <div>
                  <span className="font-medium">Most Active Day: </span>
                  {formatDate(data.data.reduce((max, item) =>
                    item.activeUsers > max.activeUsers ? item : max
                  ).date)}
                </div>
                <div>
                  <span className="font-medium">Average Daily Logins: </span>
                  {(data.data.reduce((sum, item) => sum + item.logins, 0) / data.data.length).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">{formatDate(item.date)}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{item.logins}</div>
                    <div className="text-muted-foreground">Logins</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{item.activeUsers}</div>
                    <div className="text-muted-foreground">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{item.totalActions}</div>
                    <div className="text-muted-foreground">Actions</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}