import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VendorCard } from '@/components/vendors'
import { useVendors, useVendorComplianceCounts } from '@/hooks/use-vendors'
import { TRADE_CATEGORIES } from '@/lib/constants/vendor'
import type { VendorFilters } from '@/lib/types/vendor'
import { Plus, Search, Filter, Loader2 } from 'lucide-react'

export default function VendorsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<VendorFilters>({ is_active: true })
  const [activeTab, setActiveTab] = useState<string>('active')

  const { data: vendors = [], isLoading } = useVendors({
    ...filters,
    is_active: activeTab === 'active' ? true : activeTab === 'inactive' ? false : undefined,
    is_preferred: activeTab === 'preferred' ? true : undefined,
  })
  const { data: complianceCounts } = useVendorComplianceCounts()

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }))
  }

  const handleTradeFilter = (trade: string) => {
    setFilters((prev) => ({
      ...prev,
      trade_category: trade && trade !== 'all' ? trade : undefined,
    }))
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">
            Manage service providers and contractors
          </p>
        </div>
        <Button onClick={() => navigate('/vendors/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* Compliance Summary */}
      {complianceCounts && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-2xl font-bold">{complianceCounts.total}</p>
            <p className="text-sm text-muted-foreground">Total Vendors</p>
          </div>
          <div className="p-4 border rounded-lg bg-green-50">
            <p className="text-2xl font-bold text-green-700">
              {complianceCounts.compliant}
            </p>
            <p className="text-sm text-green-600">Fully Compliant</p>
          </div>
          <div className="p-4 border rounded-lg bg-yellow-50">
            <p className="text-2xl font-bold text-yellow-700">
              {complianceCounts.expiringSoon}
            </p>
            <p className="text-sm text-yellow-600">Expiring Soon</p>
          </div>
          <div className="p-4 border rounded-lg bg-red-50">
            <p className="text-2xl font-bold text-red-700">
              {complianceCounts.issues}
            </p>
            <p className="text-sm text-red-600">Compliance Issues</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="preferred">Preferred</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select onValueChange={handleTradeFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Trades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trades</SelectItem>
            {TRADE_CATEGORIES.map((trade) => (
              <SelectItem key={trade.value} value={trade.value}>
                {trade.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vendor List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No vendors found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/vendors/new')}
          >
            Add your first vendor
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onClick={() => navigate(`/vendors/${vendor.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
