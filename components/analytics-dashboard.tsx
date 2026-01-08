'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Building2, Users, Wrench, ClipboardCheck, DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react'

interface Property {
  id: string
  name: string
}

interface DashboardStats {
  overview: {
    totalProperties: number
    totalClients: number
    activeWorkOrders: number
    completedWorkOrders: number
    completedInspections: number
    scheduledInspections: number
    inProgressInspections: number
    totalIssuesFound: number
  }
  workOrders: {
    byStatus: { new: number; assigned: number; in_progress: number; completed: number; cancelled: number }
    byPriority: { emergency: number; high: number; medium: number; low: number }
    byCategory: { plumbing: number; electrical: number; hvac: number; appliance: number; general: number }
    recentCount: number
  }
  financial: {
    totalVendorCost: number
    totalClientBilled: number
    grossMargin: number
    marginPercent: number | string
    totalRevenue: number
    pendingRevenue: number
    overdueAmount: number
    paidInvoiceCount: number
    pendingInvoiceCount: number
    overdueInvoiceCount: number
  }
  trends: {
    monthly: { month: string; workOrders: number; inspections: number; revenue: number }[]
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
const STATUS_COLORS = {
  new: '#3b82f6',
  assigned: '#8b5cf6',
  in_progress: '#f59e0b',
  completed: '#10b981',
  cancelled: '#6b7280'
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [period, setPeriod] = useState<string>('30')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    fetchStats()
  }, [selectedProperty, period])

  async function fetchProperties() {
    const res = await fetch('/api/properties')
    if (res.ok) {
      const data = await res.json()
      setProperties(data)
    }
  }

  async function fetchStats() {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedProperty !== 'all') params.append('property_id', selectedProperty)
    params.append('period', period)

    const res = await fetch(`/api/dashboard/stats?${params}`)
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statusData = Object.entries(stats.workOrders.byStatus).map(([name, value]) => ({ name, value }))
  const priorityData = Object.entries(stats.workOrders.byPriority).map(([name, value]) => ({ name, value }))
  const categoryData = Object.entries(stats.workOrders.byCategory).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalProperties}</div>
            <p className="text-xs text-muted-foreground">Active properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalClients}</div>
            <p className="text-xs text-muted-foreground">Total clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.activeWorkOrders}</div>
            <p className="text-xs text-muted-foreground">{stats.overview.completedWorkOrders} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inspections</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.completedInspections}</div>
            <p className="text-xs text-muted-foreground">{stats.overview.scheduledInspections} scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.financial.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{stats.financial.paidInvoiceCount} paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.financial.grossMargin)}</div>
            <p className="text-xs text-muted-foreground">{stats.financial.marginPercent}% margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.financial.pendingRevenue)}</div>
            <p className="text-xs text-muted-foreground">{stats.financial.pendingInvoiceCount} pending invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.financial.overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">{stats.financial.overdueInvoiceCount} overdue invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Work orders, inspections, and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trends.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="workOrders" stroke="#8884d8" name="Work Orders" />
                <Line yAxisId="left" type="monotone" dataKey="inspections" stroke="#82ca9d" name="Inspections" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ffc658" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Work Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders by Status</CardTitle>
            <CardDescription>Current distribution of work order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Work Orders by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders by Category</CardTitle>
            <CardDescription>Distribution across maintenance categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Work Orders by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders by Priority</CardTitle>
            <CardDescription>Current priority distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d">
                  {priorityData.map((entry, index) => {
                    const priorityColors = { emergency: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' }
                    return <Cell key={`cell-${index}`} fill={priorityColors[entry.name as keyof typeof priorityColors] || '#8884d8'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Issues Found */}
      {stats.overview.totalIssuesFound > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issues Summary</CardTitle>
            <CardDescription>Issues found during inspections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.overview.totalIssuesFound}</p>
                <p className="text-sm text-muted-foreground">Total issues found during inspections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
