/**
 * Properties Overview Page
 *
 * Shows all properties with their current plan features and live updates.
 * Used by admins to monitor plan configurations across all clients.
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { useGlobalRealtimeSync } from '@/hooks/use-realtime-sync'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/helpers/billing'

interface PropertyWithProgram {
  id: string
  name: string
  address_line1: string
  city: string
  state: string
  client: {
    id: string
    first_name: string
    last_name: string
  }
  program: {
    id: string
    status: string
    inspection_frequency: string
    inspection_tier: string
    monthly_total: number
    addon_digital_manual: boolean
    addon_warranty_tracking: boolean
    addon_emergency_response: boolean
    addon_hurricane_monitoring: boolean
    updated_at: string
  } | null
}

const frequencyLabels: Record<string, string> = {
  annual: 'Annual',
  semi_annual: 'Semi-Annual',
  quarterly: 'Quarterly',
  monthly: 'Monthly',
  bi_weekly: 'Bi-Weekly',
}

const tierLabels: Record<string, string> = {
  visual: 'Visual',
  functional: 'Functional',
  comprehensive: 'Comprehensive',
  preventative: 'Preventative',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  paused: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

function usePropertiesOverview() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: ['admin', 'properties-overview'],
    queryFn: async (): Promise<PropertyWithProgram[]> => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address_line1,
          city,
          state,
          client:clients!inner (
            id,
            first_name,
            last_name
          ),
          programs (
            id,
            status,
            inspection_frequency,
            inspection_tier,
            monthly_total,
            addon_digital_manual,
            addon_warranty_tracking,
            addon_emergency_response,
            addon_hurricane_monitoring,
            updated_at
          )
        `)
        .order('name')

      if (error) throw error

      return (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        address_line1: p.address_line1,
        city: p.city,
        state: p.state,
        client: Array.isArray(p.client) ? p.client[0] : p.client,
        program: Array.isArray(p.programs) ? p.programs[0] : p.programs,
      }))
    },
    enabled: !!profile,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  })
}

function AddonIndicator({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1 text-xs ${enabled ? 'text-green-600' : 'text-gray-400'}`}
      title={label}
    >
      {enabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span className="hidden xl:inline">{label}</span>
    </div>
  )
}

export default function PropertiesOverviewPage() {
  const { data: properties, isLoading, refetch, dataUpdatedAt } = usePropertiesOverview()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all')

  // Enable real-time sync
  useGlobalRealtimeSync()

  // Filter properties
  const filteredProperties = useMemo(() => {
    if (!properties) return []

    return properties.filter((p) => {
      // Search filter
      const searchLower = search.toLowerCase()
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(searchLower) ||
        p.client.first_name.toLowerCase().includes(searchLower) ||
        p.client.last_name.toLowerCase().includes(searchLower) ||
        false

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'no_plan' && !p.program) ||
        p.program?.status === statusFilter

      // Frequency filter
      const matchesFrequency =
        frequencyFilter === 'all' || p.program?.inspection_frequency === frequencyFilter

      return matchesSearch && matchesStatus && matchesFrequency
    })
  }, [properties, search, statusFilter, frequencyFilter])

  // Summary stats
  const stats = useMemo(() => {
    if (!properties) return { total: 0, active: 0, noPlan: 0, monthlyRevenue: 0 }

    const active = properties.filter((p) => p.program?.status === 'active').length
    const noPlan = properties.filter((p) => !p.program).length
    const monthlyRevenue = properties.reduce(
      (sum, p) => sum + (p.program?.status === 'active' ? p.program.monthly_total || 0 : 0),
      0
    )

    return {
      total: properties.length,
      active,
      noPlan,
      monthlyRevenue,
    }
  }, [properties])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties Overview"
        description="Monitor all properties and their service plans"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Check className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.noPlan}</p>
                <p className="text-sm text-muted-foreground">No Plan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                $
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties or clients..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="no_plan">No Plan</SelectItem>
          </SelectContent>
        </Select>
        <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frequencies</SelectItem>
            {Object.entries(frequencyLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Last updated indicator */}
      <p className="text-xs text-muted-foreground">
        Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
      </p>

      {/* Properties Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No properties found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Add-ons</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {property.city}, {property.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {property.client.first_name} {property.client.last_name}
                      </p>
                    </TableCell>
                    <TableCell>
                      {property.program ? (
                        <Badge className={statusColors[property.program.status] || ''}>
                          {property.program.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No Plan</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {property.program ? (
                        <span className="text-sm">
                          {frequencyLabels[property.program.inspection_frequency] ||
                            property.program.inspection_frequency}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {property.program ? (
                        <span className="text-sm">
                          {tierLabels[property.program.inspection_tier] ||
                            property.program.inspection_tier}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {property.program ? (
                        <div className="flex gap-2">
                          <AddonIndicator
                            enabled={property.program.addon_digital_manual}
                            label="Manual"
                          />
                          <AddonIndicator
                            enabled={property.program.addon_warranty_tracking}
                            label="Warranty"
                          />
                          <AddonIndicator
                            enabled={property.program.addon_emergency_response}
                            label="Emergency"
                          />
                          <AddonIndicator
                            enabled={property.program.addon_hurricane_monitoring}
                            label="Hurricane"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {property.program ? (
                        <span className="font-medium">
                          {formatCurrency(property.program.monthly_total)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/properties/${property.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
