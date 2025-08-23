"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { AdminNavigation } from "@/components/admin-navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Gift, 
  Activity, 
  Target,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from "recharts"

interface AnalyticsData {
  totalCustomers: number
  totalRevenue: number
  totalPointsIssued: number
  totalTransactions: number
  avgTransactionValue: number
  customerGrowth: number
  revenueGrowth: number
  topCustomers: Array<{
    id: string
    name: string
    email: string
    totalSpent: number
    points: number
    visitCount: number
  }>
  monthlyRevenue: Array<{ month: string; revenue: number }>
  customerSegments: Array<{ segment: string; count: number; percentage: number }>
  aiInsights: Array<{
    type: "opportunity" | "warning" | "success"
    title: string
    description: string
    impact: string
  }>
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch(`/api/admin/analytics?tenantId=${user?.tenantId || ""}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      const data = await res.json()
      if (data.ok) {
        setAnalytics(data.analytics)
      } else {
        setError(data.error || "Failed to load analytics")
      }
    } catch (err) {
      setError("Failed to load analytics")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [user?.tenantId])

  const handleRefresh = () => {
    setRefreshing(true)
    loadAnalytics()
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>No analytics data available</AlertDescription>
        </Alert>
      </div>
    )
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div>
      <AdminNavigation />
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">AI-powered insights and performance metrics</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCustomers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.customerGrowth > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              {Math.abs(analytics.customerGrowth)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.revenueGrowth > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              {Math.abs(analytics.revenueGrowth)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPointsIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(analytics.totalPointsIssued / analytics.totalCustomers)} avg per customer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.avgTransactionValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalTransactions} total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Distribution by spending behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <RechartsPie
                  data={analytics.customerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Intelligent recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === 'opportunity' 
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    : insight.type === 'warning'
                    ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                    : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{insight.title}</h4>
                  <Badge variant={
                    insight.type === 'opportunity' ? 'default' :
                    insight.type === 'warning' ? 'destructive' : 'secondary'
                  }>
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                <p className="text-xs font-medium">{insight.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Highest value customers by spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${customer.totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.points.toLocaleString()} points • {customer.visitCount} visits
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}