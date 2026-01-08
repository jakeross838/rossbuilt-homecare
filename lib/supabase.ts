import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Types for the property maintenance tables
export interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  type: 'residential' | 'commercial'
  created_at: string
}

export interface Unit {
  id: string
  property_id: string
  unit_number: string
  bedrooms: number
  bathrooms: number
  sqft: number
  status: 'occupied' | 'vacant' | 'maintenance'
  created_at: string
  property?: Property
}

export interface Tenant {
  id: string
  unit_id: string
  name: string
  email: string
  phone: string
  access_code: string
  lease_start: string
  lease_end: string
  status: 'active' | 'past'
  created_at: string
  unit?: Unit
}

export interface WorkOrder {
  id: string
  property_id: string
  unit_id: string | null
  tenant_id: string | null
  title: string
  description: string
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'general'
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  source: 'tenant_request' | 'inspection' | 'admin'
  assigned_to: string | null
  scheduled_date: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
  property?: Property
  unit?: Unit
  tenant?: Tenant
}

export interface Inspection {
  id: string
  property_id: string
  unit_id: string | null
  type: 'move_in' | 'move_out' | 'routine' | 'annual'
  scheduled_date: string
  completed_at: string | null
  inspector: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  checklist: Record<string, { passed: boolean; notes?: string }> | null
  created_at: string
  property?: Property
  unit?: Unit
}
