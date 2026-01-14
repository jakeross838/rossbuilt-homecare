export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          organization_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          invoice_pdf_url: string | null
          paid_at: string | null
          period_end: string | null
          period_start: string | null
          property_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_invoice_id: string
          subscription_id: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          property_id: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id: string
          subscription_id?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          property_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string
          subscription_id?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "billing_invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "billing_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "client_subscription_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "client_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          google_event_id: string | null
          id: string
          inspection_id: string | null
          is_recurring: boolean | null
          last_synced_at: string | null
          location: string | null
          organization_id: string
          parent_event_id: string | null
          property_id: string | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          start_date: string
          start_time: string | null
          status: string | null
          title: string
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          google_event_id?: string | null
          id?: string
          inspection_id?: string | null
          is_recurring?: boolean | null
          last_synced_at?: string | null
          location?: string | null
          organization_id: string
          parent_event_id?: string | null
          property_id?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          start_date: string
          start_time?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          google_event_id?: string | null
          id?: string
          inspection_id?: string | null
          is_recurring?: boolean | null
          last_synced_at?: string | null
          location?: string | null
          organization_id?: string
          parent_event_id?: string | null
          property_id?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          start_date?: string
          start_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payment_methods: {
        Row: {
          billing_email: string | null
          billing_name: string | null
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_funding: string | null
          card_last4: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          is_valid: boolean | null
          property_id: string
          stripe_customer_id: string | null
          stripe_payment_method_id: string
          updated_at: string | null
        }
        Insert: {
          billing_email?: string | null
          billing_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_funding?: string | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_valid?: boolean | null
          property_id: string
          stripe_customer_id?: string | null
          stripe_payment_method_id: string
          updated_at?: string | null
        }
        Update: {
          billing_email?: string | null
          billing_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_funding?: string | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_valid?: boolean | null
          property_id?: string
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_payment_methods_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payment_methods_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payment_methods_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "client_payment_methods_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
        ]
      }
      client_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          property_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          property_id: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          property_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "client_subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_email: string | null
          billing_state: string | null
          billing_zip: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          notes: string | null
          organization_id: string
          phone: string | null
          referral_source: string | null
          secondary_email: string | null
          secondary_first_name: string | null
          secondary_last_name: string | null
          secondary_phone: string | null
          secondary_relationship: string | null
          source: string | null
          stripe_customer_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_email?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          referral_source?: string | null
          secondary_email?: string | null
          secondary_first_name?: string | null
          secondary_last_name?: string | null
          secondary_phone?: string | null
          secondary_relationship?: string | null
          source?: string | null
          stripe_customer_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_email?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          referral_source?: string | null
          secondary_email?: string | null
          secondary_first_name?: string | null
          secondary_last_name?: string | null
          secondary_phone?: string | null
          secondary_relationship?: string | null
          source?: string | null
          stripe_customer_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          document_type: string
          equipment_id: string | null
          file_size: number | null
          file_url: string
          id: string
          inspection_id: string | null
          is_client_visible: boolean | null
          mime_type: string | null
          name: string
          organization_id: string
          property_id: string | null
          tags: string[] | null
          uploaded_by: string | null
          work_order_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type: string
          equipment_id?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          inspection_id?: string | null
          is_client_visible?: boolean | null
          mime_type?: string | null
          name: string
          organization_id: string
          property_id?: string | null
          tags?: string[] | null
          uploaded_by?: string | null
          work_order_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: string
          equipment_id?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          inspection_id?: string | null
          is_client_visible?: boolean | null
          mime_type?: string | null
          name?: string
          organization_id?: string
          property_id?: string | null
          tags?: string[] | null
          uploaded_by?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          ai_generated_at: string | null
          capacity: string | null
          category: string
          condition: Database["public"]["Enums"]["condition_rating"] | null
          created_at: string | null
          custom_name: string | null
          equipment_type: string
          expected_lifespan_years: number | null
          filter_size: string | null
          fuel_type: string | null
          id: string
          inspection_checklist: Json | null
          install_date: string | null
          is_active: boolean | null
          last_service_date: string | null
          last_service_notes: string | null
          location: string | null
          maintenance_schedule: Json | null
          manual_url: string | null
          manufacturer: string | null
          model_number: string | null
          notes: string | null
          photo_url: string | null
          photos: string[] | null
          property_id: string
          serial_number: string | null
          serves: string | null
          service_count: number | null
          specs: Json | null
          troubleshooting_guide: Json | null
          updated_at: string | null
          warranty_expiration: string | null
        }
        Insert: {
          ai_generated_at?: string | null
          capacity?: string | null
          category: string
          condition?: Database["public"]["Enums"]["condition_rating"] | null
          created_at?: string | null
          custom_name?: string | null
          equipment_type: string
          expected_lifespan_years?: number | null
          filter_size?: string | null
          fuel_type?: string | null
          id?: string
          inspection_checklist?: Json | null
          install_date?: string | null
          is_active?: boolean | null
          last_service_date?: string | null
          last_service_notes?: string | null
          location?: string | null
          maintenance_schedule?: Json | null
          manual_url?: string | null
          manufacturer?: string | null
          model_number?: string | null
          notes?: string | null
          photo_url?: string | null
          photos?: string[] | null
          property_id: string
          serial_number?: string | null
          serves?: string | null
          service_count?: number | null
          specs?: Json | null
          troubleshooting_guide?: Json | null
          updated_at?: string | null
          warranty_expiration?: string | null
        }
        Update: {
          ai_generated_at?: string | null
          capacity?: string | null
          category?: string
          condition?: Database["public"]["Enums"]["condition_rating"] | null
          created_at?: string | null
          custom_name?: string | null
          equipment_type?: string
          expected_lifespan_years?: number | null
          filter_size?: string | null
          fuel_type?: string | null
          id?: string
          inspection_checklist?: Json | null
          install_date?: string | null
          is_active?: boolean | null
          last_service_date?: string | null
          last_service_notes?: string | null
          location?: string | null
          maintenance_schedule?: Json | null
          manual_url?: string | null
          manufacturer?: string | null
          model_number?: string | null
          notes?: string | null
          photo_url?: string | null
          photos?: string[] | null
          property_id?: string
          serial_number?: string | null
          serves?: string | null
          service_count?: number | null
          specs?: Json | null
          troubleshooting_guide?: Json | null
          updated_at?: string | null
          warranty_expiration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_service_log: {
        Row: {
          cost: number | null
          created_at: string | null
          description: string | null
          equipment_id: string
          id: string
          notes: string | null
          performed_by: string | null
          service_date: string
          service_type: string
          work_order_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          equipment_id: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          service_date: string
          service_type: string
          work_order_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          equipment_id?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          service_date?: string
          service_type?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_service_log_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      home_manuals: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          last_generated_at: string | null
          pdf_url: string | null
          property_id: string
          share_token: string | null
          updated_at: string | null
          version: number | null
          web_url: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          id?: string
          last_generated_at?: string | null
          pdf_url?: string | null
          property_id: string
          share_token?: string | null
          updated_at?: string | null
          version?: number | null
          web_url?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          last_generated_at?: string | null
          pdf_url?: string | null
          property_id?: string
          share_token?: string | null
          updated_at?: string | null
          version?: number | null
          web_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_manuals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          file_size: number | null
          height: number | null
          id: string
          inspection_id: string
          item_id: string | null
          section_id: string | null
          taken_at: string | null
          thumbnail_url: string | null
          url: string
          width: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          inspection_id: string
          item_id?: string | null
          section_id?: string | null
          taken_at?: string | null
          thumbnail_url?: string | null
          url: string
          width?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          inspection_id?: string
          item_id?: string | null
          section_id?: string | null
          taken_at?: string | null
          thumbnail_url?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          equipment_category: string | null
          estimated_minutes: number | null
          feature_type: string | null
          id: string
          is_active: boolean | null
          is_current: boolean | null
          name: string
          organization_id: string
          sections: Json
          tier: Database["public"]["Enums"]["inspection_tier"]
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          equipment_category?: string | null
          estimated_minutes?: number | null
          feature_type?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name: string
          organization_id: string
          sections?: Json
          tier: Database["public"]["Enums"]["inspection_tier"]
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          equipment_category?: string | null
          estimated_minutes?: number | null
          feature_type?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name?: string
          organization_id?: string
          sections?: Json
          tier?: Database["public"]["Enums"]["inspection_tier"]
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          actual_duration_minutes: number | null
          actual_end_at: string | null
          actual_start_at: string | null
          checklist: Json
          completed_at: string | null
          created_at: string | null
          estimated_duration_minutes: number | null
          findings: Json | null
          id: string
          inspection_type: string
          inspector_id: string | null
          internal_notes: string | null
          organization_id: string
          overall_condition:
            | Database["public"]["Enums"]["condition_rating"]
            | null
          program_id: string | null
          property_id: string
          report_generated_at: string | null
          report_sent_at: string | null
          report_url: string | null
          report_viewed_at: string | null
          scheduled_date: string
          scheduled_time_end: string | null
          scheduled_time_start: string | null
          status: Database["public"]["Enums"]["inspection_status"] | null
          summary: string | null
          updated_at: string | null
          weather_conditions: Json | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          actual_end_at?: string | null
          actual_start_at?: string | null
          checklist?: Json
          completed_at?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          findings?: Json | null
          id?: string
          inspection_type?: string
          inspector_id?: string | null
          internal_notes?: string | null
          organization_id: string
          overall_condition?:
            | Database["public"]["Enums"]["condition_rating"]
            | null
          program_id?: string | null
          property_id: string
          report_generated_at?: string | null
          report_sent_at?: string | null
          report_url?: string | null
          report_viewed_at?: string | null
          scheduled_date: string
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          status?: Database["public"]["Enums"]["inspection_status"] | null
          summary?: string | null
          updated_at?: string | null
          weather_conditions?: Json | null
        }
        Update: {
          actual_duration_minutes?: number | null
          actual_end_at?: string | null
          actual_start_at?: string | null
          checklist?: Json
          completed_at?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          findings?: Json | null
          id?: string
          inspection_type?: string
          inspector_id?: string | null
          internal_notes?: string | null
          organization_id?: string
          overall_condition?:
            | Database["public"]["Enums"]["condition_rating"]
            | null
          program_id?: string | null
          property_id?: string
          report_generated_at?: string | null
          report_sent_at?: string | null
          report_url?: string | null
          report_viewed_at?: string | null
          scheduled_date?: string
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          status?: Database["public"]["Enums"]["inspection_status"] | null
          summary?: string | null
          updated_at?: string | null
          weather_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          display_order: number | null
          id: string
          invoice_id: string
          line_type: string | null
          property_id: string | null
          quantity: number | null
          reference_id: string | null
          reference_type: string | null
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          display_order?: number | null
          id?: string
          invoice_id: string
          line_type?: string | null
          property_id?: string | null
          quantity?: number | null
          reference_id?: string | null
          reference_type?: string | null
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          display_order?: number | null
          id?: string
          invoice_id?: string
          line_type?: string | null
          property_id?: string | null
          quantity?: number | null
          reference_id?: string | null
          reference_type?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          balance_due: number
          client_id: string
          created_at: string | null
          discount_amount: number | null
          discount_description: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          invoice_type: string
          notes: string | null
          organization_id: string
          paid_at: string | null
          payment_method: string | null
          pdf_url: string | null
          period_end: string | null
          period_start: string | null
          sent_at: string | null
          sent_to_email: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          total: number
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          balance_due: number
          client_id: string
          created_at?: string | null
          discount_amount?: number | null
          discount_description?: string | null
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          invoice_type: string
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          sent_at?: string | null
          sent_to_email?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total: number
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          balance_due?: number
          client_id?: string
          created_at?: string | null
          discount_amount?: number | null
          discount_description?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          sent_at?: string | null
          sent_to_email?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total?: number
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_checklist_templates: {
        Row: {
          category: string
          created_at: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          item_description: string | null
          item_name: string
          location: string | null
          property_id: string | null
          sort_order: number | null
          special_instructions: string | null
          supply_item: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          item_description?: string | null
          item_name: string
          location?: string | null
          property_id?: string | null
          sort_order?: number | null
          special_instructions?: string | null
          supply_item?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          item_description?: string | null
          item_name?: string
          location?: string | null
          property_id?: string | null
          sort_order?: number | null
          special_instructions?: string | null
          supply_item?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_checklist_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_checklist_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_checklist_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "maintenance_checklist_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
        ]
      }
      maintenance_issues: {
        Row: {
          actual_cost: number | null
          billable_to_client: boolean | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_cost: number | null
          id: string
          location: string | null
          photo_urls: string[] | null
          priority: string | null
          property_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          title: string
          updated_at: string | null
          vendor_id: string | null
          vendor_name: string | null
          vendor_phone: string | null
          vendor_scheduled_date: string | null
          visit_id: string | null
          visit_result_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          billable_to_client?: boolean | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          photo_urls?: string[] | null
          priority?: string | null
          property_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
          vendor_scheduled_date?: string | null
          visit_id?: string | null
          visit_result_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          billable_to_client?: boolean | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          photo_urls?: string[] | null
          priority?: string | null
          property_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
          vendor_scheduled_date?: string | null
          visit_id?: string | null
          visit_result_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_issues_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_issues_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_issues_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "maintenance_issues_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "maintenance_issues_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "maintenance_issues_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "maintenance_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_issues_visit_result_id_fkey"
            columns: ["visit_result_id"]
            isOneToOne: false
            referencedRelation: "maintenance_visit_results"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_properties: {
        Row: {
          address: string
          city: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          has_elevator: boolean | null
          has_generator: boolean | null
          has_irrigation: boolean | null
          has_pool: boolean | null
          has_spa: boolean | null
          has_water_softener: boolean | null
          health_score: number | null
          health_score_updated_at: string | null
          id: string
          job_id: string | null
          monthly_rate: number | null
          notes: string | null
          num_bathrooms: number | null
          num_hvac_zones: number | null
          num_water_heaters: number | null
          preferred_day: string | null
          preferred_time: string | null
          property_name: string
          service_tier: string | null
          square_footage: number | null
          state: string | null
          status: string | null
          updated_at: string | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          address: string
          city?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          has_elevator?: boolean | null
          has_generator?: boolean | null
          has_irrigation?: boolean | null
          has_pool?: boolean | null
          has_spa?: boolean | null
          has_water_softener?: boolean | null
          health_score?: number | null
          health_score_updated_at?: string | null
          id?: string
          job_id?: string | null
          monthly_rate?: number | null
          notes?: string | null
          num_bathrooms?: number | null
          num_hvac_zones?: number | null
          num_water_heaters?: number | null
          preferred_day?: string | null
          preferred_time?: string | null
          property_name: string
          service_tier?: string | null
          square_footage?: number | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          has_elevator?: boolean | null
          has_generator?: boolean | null
          has_irrigation?: boolean | null
          has_pool?: boolean | null
          has_spa?: boolean | null
          has_water_softener?: boolean | null
          health_score?: number | null
          health_score_updated_at?: string | null
          id?: string
          job_id?: string | null
          monthly_rate?: number | null
          notes?: string | null
          num_bathrooms?: number | null
          num_hvac_zones?: number | null
          num_water_heaters?: number | null
          preferred_day?: string | null
          preferred_time?: string | null
          property_name?: string
          service_tier?: string | null
          square_footage?: number | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          id: string
          issue_id: string | null
          photo_urls: string[] | null
          property_id: string | null
          responded_at: string | null
          responded_by: string | null
          response_notes: string | null
          status: string | null
          subject: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          submitted_by_phone: string | null
          urgency: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          issue_id?: string | null
          photo_urls?: string[] | null
          property_id?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          status?: string | null
          subject: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          submitted_by_phone?: string | null
          urgency?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          issue_id?: string | null
          photo_urls?: string[] | null
          property_id?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          status?: string | null
          subject?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          submitted_by_phone?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "maintenance_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
        ]
      }
      maintenance_supply_categories: {
        Row: {
          common_items: string[] | null
          default_unit: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          common_items?: string[] | null
          default_unit?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          common_items?: string[] | null
          default_unit?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      maintenance_supply_requests: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          admin_notes: string | null
          approved_at: string | null
          approved_by_id: string | null
          approved_by_name: string | null
          category: string
          cost_per_unit: number | null
          created_at: string | null
          decline_reason: string | null
          declined_at: string | null
          declined_by: string | null
          delivered_at: string | null
          delivered_by: string | null
          delivery_location: string | null
          delivery_notes: string | null
          id: string
          item_name: string
          notes: string | null
          ordered_at: string | null
          priority: string | null
          property_id: string | null
          purchased_at: string | null
          purchased_by: string | null
          quantity: number | null
          quantity_needed: number | null
          quantity_requested: number | null
          requested_at: string | null
          requested_by_id: string | null
          requested_by_name: string | null
          requester_type: string | null
          status: string | null
          supply_requirement_id: string | null
          total_cost: number | null
          unit: string | null
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by_id?: string | null
          approved_by_name?: string | null
          category: string
          cost_per_unit?: number | null
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          declined_by?: string | null
          delivered_at?: string | null
          delivered_by?: string | null
          delivery_location?: string | null
          delivery_notes?: string | null
          id?: string
          item_name: string
          notes?: string | null
          ordered_at?: string | null
          priority?: string | null
          property_id?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: number | null
          quantity_needed?: number | null
          quantity_requested?: number | null
          requested_at?: string | null
          requested_by_id?: string | null
          requested_by_name?: string | null
          requester_type?: string | null
          status?: string | null
          supply_requirement_id?: string | null
          total_cost?: number | null
          unit?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by_id?: string | null
          approved_by_name?: string | null
          category?: string
          cost_per_unit?: number | null
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          declined_by?: string | null
          delivered_at?: string | null
          delivered_by?: string | null
          delivery_location?: string | null
          delivery_notes?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          ordered_at?: string | null
          priority?: string | null
          property_id?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: number | null
          quantity_needed?: number | null
          quantity_requested?: number | null
          requested_at?: string | null
          requested_by_id?: string | null
          requested_by_name?: string | null
          requester_type?: string | null
          status?: string | null
          supply_requirement_id?: string | null
          total_cost?: number | null
          unit?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_supply_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_supply_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_supply_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "maintenance_supply_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "maintenance_supply_requests_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "maintenance_supply_requests_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "maintenance_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_visit_results: {
        Row: {
          category: string
          checked_at: string | null
          created_at: string | null
          id: string
          item_description: string | null
          item_name: string
          location: string | null
          notes: string | null
          photo_urls: string[] | null
          replaced_with: string | null
          replacement_cost: number | null
          status: string
          template_id: string | null
          visit_id: string | null
        }
        Insert: {
          category: string
          checked_at?: string | null
          created_at?: string | null
          id?: string
          item_description?: string | null
          item_name: string
          location?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          replaced_with?: string | null
          replacement_cost?: number | null
          status: string
          template_id?: string | null
          visit_id?: string | null
        }
        Update: {
          category?: string
          checked_at?: string | null
          created_at?: string | null
          id?: string
          item_description?: string | null
          item_name?: string
          location?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          replaced_with?: string | null
          replacement_cost?: number | null
          status?: string
          template_id?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_visit_results_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "maintenance_checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_visit_results_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "maintenance_visit_results_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "maintenance_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_visits: {
        Row: {
          ai_generated_at: string | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          issues_found: number | null
          items_checked: number | null
          items_replaced: string[] | null
          property_id: string | null
          started_at: string | null
          status: string | null
          summary_highlights: string[] | null
          summary_text: string | null
          technician_id: string | null
          technician_name: string | null
          technician_notes: string | null
          updated_at: string | null
          visit_date: string
          visit_type: string | null
          voice_transcription: string | null
        }
        Insert: {
          ai_generated_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          issues_found?: number | null
          items_checked?: number | null
          items_replaced?: string[] | null
          property_id?: string | null
          started_at?: string | null
          status?: string | null
          summary_highlights?: string[] | null
          summary_text?: string | null
          technician_id?: string | null
          technician_name?: string | null
          technician_notes?: string | null
          updated_at?: string | null
          visit_date: string
          visit_type?: string | null
          voice_transcription?: string | null
        }
        Update: {
          ai_generated_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          issues_found?: number | null
          items_checked?: number | null
          items_replaced?: string[] | null
          property_id?: string | null
          started_at?: string | null
          status?: string | null
          summary_highlights?: string[] | null
          summary_text?: string | null
          technician_id?: string | null
          technician_name?: string | null
          technician_notes?: string | null
          updated_at?: string | null
          visit_date?: string
          visit_type?: string | null
          voice_transcription?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "maintenance_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          push_sent: boolean | null
          push_sent_at: string | null
          read_at: string | null
          sms_sent: boolean | null
          sms_sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          organization_id: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          sms_sent?: boolean | null
          sms_sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          organization_id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          sms_sent?: boolean | null
          sms_sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          slug: string
          state: string | null
          stripe_account_id: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          slug: string
          state?: string | null
          stripe_account_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          slug?: string
          state?: string | null
          stripe_account_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          card_brand: string | null
          check_number: string | null
          client_id: string
          created_at: string | null
          id: string
          invoice_id: string
          last_four: string | null
          notes: string | null
          organization_id: string
          payment_date: string | null
          payment_method: string
          recorded_by: string | null
          stripe_charge_id: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          card_brand?: string | null
          check_number?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          invoice_id: string
          last_four?: string | null
          notes?: string | null
          organization_id: string
          payment_date?: string | null
          payment_method: string
          recorded_by?: string | null
          stripe_charge_id?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          card_brand?: string | null
          check_number?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          invoice_id?: string
          last_four?: string | null
          notes?: string | null
          organization_id?: string
          payment_date?: string | null
          payment_method?: string
          recorded_by?: string | null
          stripe_charge_id?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_activities: {
        Row: {
          base_price: number
          category: string
          checklist_template_id: string | null
          code: string
          created_at: string | null
          creates_scheduled_job: boolean | null
          deliverable_type: string | null
          description: string | null
          display_order: number | null
          estimated_subscribers: number | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          is_recommended: boolean | null
          job_frequency: string | null
          name: string
          time_estimate_hours: number
          updated_at: string | null
        }
        Insert: {
          base_price: number
          category: string
          checklist_template_id?: string | null
          code: string
          created_at?: string | null
          creates_scheduled_job?: boolean | null
          deliverable_type?: string | null
          description?: string | null
          display_order?: number | null
          estimated_subscribers?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          is_recommended?: boolean | null
          job_frequency?: string | null
          name: string
          time_estimate_hours: number
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category?: string
          checklist_template_id?: string | null
          code?: string
          created_at?: string | null
          creates_scheduled_job?: boolean | null
          deliverable_type?: string | null
          description?: string | null
          display_order?: number | null
          estimated_subscribers?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          is_recommended?: boolean | null
          job_frequency?: string | null
          name?: string
          time_estimate_hours?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_activities_checklist_template_id_fkey"
            columns: ["checklist_template_id"]
            isOneToOne: false
            referencedRelation: "pm_checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_activity_bundles: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percent: number | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      pm_activity_changes: {
        Row: {
          activity_id: string | null
          change_type: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          price_impact: number | null
          property_id: string
          reason: string | null
        }
        Insert: {
          activity_id?: string | null
          change_type: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          price_impact?: number | null
          property_id: string
          reason?: string | null
        }
        Update: {
          activity_id?: string | null
          change_type?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          price_impact?: number | null
          property_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_activity_changes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "pm_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_activity_changes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_addon_services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          included_in_tiers: number[] | null
          is_active: boolean | null
          name: string
          price: number | null
          price_large: number | null
          price_type: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          included_in_tiers?: number[] | null
          is_active?: boolean | null
          name: string
          price?: number | null
          price_large?: number | null
          price_type?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          included_in_tiers?: number[] | null
          is_active?: boolean | null
          name?: string
          price?: number | null
          price_large?: number | null
          price_type?: string | null
        }
        Relationships: []
      }
      pm_bundle_activities: {
        Row: {
          activity_id: string
          bundle_id: string
          id: string
        }
        Insert: {
          activity_id: string
          bundle_id: string
          id?: string
        }
        Update: {
          activity_id?: string
          bundle_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_bundle_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "pm_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_bundle_activities_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "pm_activity_bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_checklist_completions: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          inspection_type_id: string | null
          items: Json | null
          notes: string | null
          property_id: string
          results: Json | null
          scheduled_date: string
          started_at: string | null
          status: string
          template_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          inspection_type_id?: string | null
          items?: Json | null
          notes?: string | null
          property_id: string
          results?: Json | null
          scheduled_date: string
          started_at?: string | null
          status?: string
          template_id: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          inspection_type_id?: string | null
          items?: Json | null
          notes?: string | null
          property_id?: string
          results?: Json | null
          scheduled_date?: string
          started_at?: string | null
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_checklist_completions_inspection_type_id_fkey"
            columns: ["inspection_type_id"]
            isOneToOne: false
            referencedRelation: "pm_inspection_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_checklist_completions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_checklist_completions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "pm_checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_checklist_templates: {
        Row: {
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          items: Json
          name: string
          property_id: string
        }
        Insert: {
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean
          items?: Json
          name: string
          property_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          items?: Json
          name?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_checklist_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_clients: {
        Row: {
          created_at: string
          email: string
          email_notifications: boolean | null
          id: string
          is_active: boolean
          name: string
          password_hash: string
          phone: string | null
          sms_notifications: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          email_notifications?: boolean | null
          id?: string
          is_active?: boolean
          name: string
          password_hash: string
          phone?: string | null
          sms_notifications?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          email_notifications?: boolean | null
          id?: string
          is_active?: boolean
          name?: string
          password_hash?: string
          phone?: string | null
          sms_notifications?: boolean | null
        }
        Relationships: []
      }
      pm_inspection_photos: {
        Row: {
          caption: string | null
          checklist_completion_id: string | null
          created_at: string | null
          id: string
          item_name: string | null
          photo_url: string
          room_area: string | null
          work_order_id: string | null
        }
        Insert: {
          caption?: string | null
          checklist_completion_id?: string | null
          created_at?: string | null
          id?: string
          item_name?: string | null
          photo_url: string
          room_area?: string | null
          work_order_id?: string | null
        }
        Update: {
          caption?: string | null
          checklist_completion_id?: string | null
          created_at?: string | null
          id?: string
          item_name?: string | null
          photo_url?: string
          room_area?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_inspection_photos_checklist_completion_id_fkey"
            columns: ["checklist_completion_id"]
            isOneToOne: false
            referencedRelation: "pm_checklist_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_inspection_photos_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "pm_work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_inspection_types: {
        Row: {
          checklist_template: Json | null
          code: string
          created_at: string | null
          deliverables: Json | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          purpose: string | null
        }
        Insert: {
          checklist_template?: Json | null
          code: string
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          purpose?: string | null
        }
        Update: {
          checklist_template?: Json | null
          code?: string
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          purpose?: string | null
        }
        Relationships: []
      }
      pm_inspections: {
        Row: {
          checklist: Json | null
          completed_at: string | null
          created_at: string
          id: string
          inspector: string | null
          notes: string | null
          property_id: string
          scheduled_date: string
          status: string
          type: string
          unit_id: string | null
        }
        Insert: {
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          inspector?: string | null
          notes?: string | null
          property_id: string
          scheduled_date: string
          status?: string
          type?: string
          unit_id?: string | null
        }
        Update: {
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          inspector?: string | null
          notes?: string | null
          property_id?: string
          scheduled_date?: string
          status?: string
          type?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_inspections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_inspections_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "pm_units"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          item_type: string | null
          quantity: number | null
          total: number
          unit_price: number
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          item_type?: string | null
          quantity?: number | null
          total: number
          unit_price: number
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          item_type?: string | null
          quantity?: number | null
          total?: number
          unit_price?: number
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "pm_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_invoice_items_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "pm_work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_invoices: {
        Row: {
          client_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          payment_reference: string | null
          period_end: string | null
          period_start: string | null
          property_id: string | null
          status: string
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string | null
          period_start?: string | null
          property_id?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string | null
          period_start?: string | null
          property_id?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "pm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_notifications: {
        Row: {
          body: string | null
          channel: string | null
          client_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          property_id: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          type: string
        }
        Insert: {
          body?: string | null
          channel?: string | null
          client_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          property_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          type: string
        }
        Update: {
          body?: string | null
          channel?: string | null
          client_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          property_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "pm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_notifications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_owner_visits: {
        Row: {
          arrival_date: string
          client_id: string | null
          created_at: string | null
          departure_date: string | null
          id: string
          post_departure_checklist_id: string | null
          post_departure_notes: string | null
          pre_arrival_checklist_id: string | null
          pre_arrival_notes: string | null
          property_id: string
          special_requests: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          arrival_date: string
          client_id?: string | null
          created_at?: string | null
          departure_date?: string | null
          id?: string
          post_departure_checklist_id?: string | null
          post_departure_notes?: string | null
          pre_arrival_checklist_id?: string | null
          pre_arrival_notes?: string | null
          property_id: string
          special_requests?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          arrival_date?: string
          client_id?: string | null
          created_at?: string | null
          departure_date?: string | null
          id?: string
          post_departure_checklist_id?: string | null
          post_departure_notes?: string | null
          pre_arrival_checklist_id?: string | null
          pre_arrival_notes?: string | null
          property_id?: string
          special_requests?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_owner_visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "pm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_owner_visits_post_departure_checklist_id_fkey"
            columns: ["post_departure_checklist_id"]
            isOneToOne: false
            referencedRelation: "pm_checklist_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_owner_visits_pre_arrival_checklist_id_fkey"
            columns: ["pre_arrival_checklist_id"]
            isOneToOne: false
            referencedRelation: "pm_checklist_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_owner_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_plan_inspection_types: {
        Row: {
          created_at: string | null
          frequency: string | null
          id: string
          included_count: number | null
          inspection_type_id: string | null
          plan_id: string | null
        }
        Insert: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          included_count?: number | null
          inspection_type_id?: string | null
          plan_id?: string | null
        }
        Update: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          included_count?: number | null
          inspection_type_id?: string | null
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_plan_inspection_types_inspection_type_id_fkey"
            columns: ["inspection_type_id"]
            isOneToOne: false
            referencedRelation: "pm_inspection_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_plan_inspection_types_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pm_service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_plan_services: {
        Row: {
          created_at: string | null
          frequency_override: string | null
          id: string
          included_quantity: number | null
          plan_id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          frequency_override?: string | null
          id?: string
          included_quantity?: number | null
          plan_id: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          frequency_override?: string | null
          id?: string
          included_quantity?: number | null
          plan_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_plan_services_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pm_service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_plan_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "pm_services"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_properties: {
        Row: {
          address: string
          city: string
          client_id: string | null
          created_at: string
          current_plan_id: string | null
          id: string
          last_inspection_date: string | null
          monthly_subscription_total: number | null
          name: string
          next_inspection_date: string | null
          sqft: number | null
          sqft_tier_id: string | null
          state: string
          subscription_updated_at: string | null
          type: string
          visit_frequency: string | null
          zip: string
        }
        Insert: {
          address: string
          city: string
          client_id?: string | null
          created_at?: string
          current_plan_id?: string | null
          id?: string
          last_inspection_date?: string | null
          monthly_subscription_total?: number | null
          name: string
          next_inspection_date?: string | null
          sqft?: number | null
          sqft_tier_id?: string | null
          state: string
          subscription_updated_at?: string | null
          type?: string
          visit_frequency?: string | null
          zip: string
        }
        Update: {
          address?: string
          city?: string
          client_id?: string | null
          created_at?: string
          current_plan_id?: string | null
          id?: string
          last_inspection_date?: string | null
          monthly_subscription_total?: number | null
          name?: string
          next_inspection_date?: string | null
          sqft?: number | null
          sqft_tier_id?: string | null
          state?: string
          subscription_updated_at?: string | null
          type?: string
          visit_frequency?: string | null
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_properties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "pm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_properties_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "pm_service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_properties_sqft_tier_id_fkey"
            columns: ["sqft_tier_id"]
            isOneToOne: false
            referencedRelation: "pm_sqft_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_property_activities: {
        Row: {
          activity_id: string
          created_at: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          locked_price: number | null
          property_id: string
          started_at: string | null
          updated_at: string | null
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          locked_price?: number | null
          property_id: string
          started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          locked_price?: number | null
          property_id?: string
          started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_property_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "pm_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_property_activities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_property_addons: {
        Row: {
          created_at: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          price: number | null
          property_id: string
          service_id: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          price?: number | null
          property_id: string
          service_id: string
          start_date?: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          price?: number | null
          property_id?: string
          service_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_property_addons_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_property_addons_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "pm_services"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_property_plans: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          monthly_rate: number | null
          notes: string | null
          plan_id: string
          property_id: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          monthly_rate?: number | null
          notes?: string | null
          plan_id: string
          property_id: string
          start_date?: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          monthly_rate?: number | null
          notes?: string | null
          plan_id?: string
          property_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_property_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pm_service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_property_plans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_service_plans: {
        Row: {
          coordination_fee_waived: boolean | null
          created_at: string | null
          description: string | null
          emergency_response_time: string | null
          features: Json | null
          hourly_rate: number | null
          id: string
          inspection_frequency: string | null
          is_active: boolean | null
          max_property_sqft: number | null
          min_property_sqft: number | null
          monthly_base_price: number | null
          name: string
          price_large: number | null
          price_medium: number | null
          price_small: number | null
          price_xlarge: number | null
          tier_level: number
          vendor_markup_percent: number | null
        }
        Insert: {
          coordination_fee_waived?: boolean | null
          created_at?: string | null
          description?: string | null
          emergency_response_time?: string | null
          features?: Json | null
          hourly_rate?: number | null
          id?: string
          inspection_frequency?: string | null
          is_active?: boolean | null
          max_property_sqft?: number | null
          min_property_sqft?: number | null
          monthly_base_price?: number | null
          name: string
          price_large?: number | null
          price_medium?: number | null
          price_small?: number | null
          price_xlarge?: number | null
          tier_level: number
          vendor_markup_percent?: number | null
        }
        Update: {
          coordination_fee_waived?: boolean | null
          created_at?: string | null
          description?: string | null
          emergency_response_time?: string | null
          features?: Json | null
          hourly_rate?: number | null
          id?: string
          inspection_frequency?: string | null
          is_active?: boolean | null
          max_property_sqft?: number | null
          min_property_sqft?: number | null
          monthly_base_price?: number | null
          name?: string
          price_large?: number | null
          price_medium?: number | null
          price_small?: number | null
          price_xlarge?: number | null
          tier_level?: number
          vendor_markup_percent?: number | null
        }
        Relationships: []
      }
      pm_services: {
        Row: {
          base_cost: number | null
          billing_type: string | null
          category: string
          cost_type: string | null
          created_at: string | null
          default_frequency: string | null
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean | null
          is_add_on: boolean | null
          materials_billable: boolean | null
          name: string
          requires_vendor: boolean | null
        }
        Insert: {
          base_cost?: number | null
          billing_type?: string | null
          category: string
          cost_type?: string | null
          created_at?: string | null
          default_frequency?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_add_on?: boolean | null
          materials_billable?: boolean | null
          name: string
          requires_vendor?: boolean | null
        }
        Update: {
          base_cost?: number | null
          billing_type?: string | null
          category?: string
          cost_type?: string | null
          created_at?: string | null
          default_frequency?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_add_on?: boolean | null
          materials_billable?: boolean | null
          name?: string
          requires_vendor?: boolean | null
        }
        Relationships: []
      }
      pm_special_request_activity: {
        Row: {
          action: string
          created_at: string
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          performed_by: string | null
          request_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          performed_by?: string | null
          request_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          performed_by?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_special_request_activity_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "pm_special_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_special_requests: {
        Row: {
          created_at: string
          description: string | null
          id: string
          property_id: string
          response: string | null
          source: string | null
          status: string
          tenant_id: string | null
          title: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          property_id: string
          response?: string | null
          source?: string | null
          status?: string
          tenant_id?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          property_id?: string
          response?: string | null
          source?: string | null
          status?: string
          tenant_id?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_special_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_special_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "pm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_special_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "pm_units"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_sqft_tiers: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          max_sqft: number | null
          min_sqft: number
          name: string
          price_multiplier: number | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          max_sqft?: number | null
          min_sqft: number
          name: string
          price_multiplier?: number | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          max_sqft?: number | null
          min_sqft?: number
          name?: string
          price_multiplier?: number | null
        }
        Relationships: []
      }
      pm_tenants: {
        Row: {
          access_code: string
          created_at: string
          email: string
          id: string
          lease_end: string | null
          lease_start: string | null
          name: string
          phone: string | null
          status: string
          unit_id: string | null
        }
        Insert: {
          access_code?: string
          created_at?: string
          email: string
          id?: string
          lease_end?: string | null
          lease_start?: string | null
          name: string
          phone?: string | null
          status?: string
          unit_id?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string
          email?: string
          id?: string
          lease_end?: string | null
          lease_start?: string | null
          name?: string
          phone?: string | null
          status?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_tenants_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "pm_units"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_units: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          id: string
          property_id: string
          sqft: number | null
          status: string
          unit_number: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          id?: string
          property_id: string
          sqft?: number | null
          status?: string
          unit_number: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          id?: string
          property_id?: string
          sqft?: number | null
          status?: string
          unit_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_vendor_rates: {
        Row: {
          created_at: string | null
          description: string | null
          effective_date: string | null
          id: string
          rate_amount: number | null
          rate_type: string | null
          service_id: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          rate_amount?: number | null
          rate_type?: string | null
          service_id?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          rate_amount?: number | null
          rate_type?: string | null
          service_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_vendor_rates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "pm_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_vendor_rates_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "pm_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_vendors: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_preferred: boolean | null
          name: string
          notes: string | null
          phone: string | null
          service_categories: string[] | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          service_categories?: string[] | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          service_categories?: string[] | null
        }
        Relationships: []
      }
      pm_work_order_activity: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          details: string | null
          id: string
          work_order_id: string
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          work_order_id: string
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_work_order_activity_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "pm_work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_work_orders: {
        Row: {
          assigned_to: string | null
          category: string
          client_price: number | null
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          management_type: string | null
          markup_percent: number | null
          notes: string | null
          priority: string
          property_id: string
          scheduled_date: string | null
          source: string
          status: string
          tenant_id: string | null
          title: string
          unit_id: string | null
          vendor_cost: number | null
          vendor_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          client_price?: number | null
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          management_type?: string | null
          markup_percent?: number | null
          notes?: string | null
          priority?: string
          property_id: string
          scheduled_date?: string | null
          source?: string
          status?: string
          tenant_id?: string | null
          title: string
          unit_id?: string | null
          vendor_cost?: number | null
          vendor_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          client_price?: number | null
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          management_type?: string | null
          markup_percent?: number | null
          notes?: string | null
          priority?: string
          property_id?: string
          scheduled_date?: string | null
          source?: string
          status?: string
          tenant_id?: string | null
          title?: string
          unit_id?: string | null
          vendor_cost?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_work_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "pm_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_work_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "pm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_work_orders_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "pm_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_work_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "pm_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_config: {
        Row: {
          addon_pricing: Json
          created_at: string | null
          effective_date: string
          frequency_pricing: Json
          id: string
          is_current: boolean | null
          organization_id: string
          service_rates: Json
          tier_pricing: Json
          time_estimates: Json
          updated_at: string | null
          version: number | null
        }
        Insert: {
          addon_pricing?: Json
          created_at?: string | null
          effective_date: string
          frequency_pricing?: Json
          id?: string
          is_current?: boolean | null
          organization_id: string
          service_rates?: Json
          tier_pricing?: Json
          time_estimates?: Json
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          addon_pricing?: Json
          created_at?: string | null
          effective_date?: string
          frequency_pricing?: Json
          id?: string
          is_current?: boolean | null
          organization_id?: string
          service_rates?: Json
          tier_pricing?: Json
          time_estimates?: Json
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      program_history: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_values: Json | null
          previous_values: Json | null
          program_id: string
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          program_id: string
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_history_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          activated_at: string | null
          addon_digital_manual: boolean | null
          addon_emergency_response: boolean | null
          addon_hurricane_monitoring: boolean | null
          addon_warranty_tracking: boolean | null
          addons_fee: number | null
          base_fee: number
          billing_day_of_month: number | null
          billing_start_date: string | null
          cancelled_at: string | null
          client_id: string
          created_at: string | null
          id: string
          inspection_frequency: Database["public"]["Enums"]["inspection_frequency"]
          inspection_tier: Database["public"]["Enums"]["inspection_tier"]
          monthly_total: number
          notes: string | null
          organization_id: string
          paused_at: string | null
          preferred_day_of_week: number | null
          preferred_inspector_id: string | null
          preferred_time_slot: string | null
          property_id: string
          status: Database["public"]["Enums"]["program_status"] | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tier_fee: number
          updated_at: string | null
          vendor_markup_percent: number | null
        }
        Insert: {
          activated_at?: string | null
          addon_digital_manual?: boolean | null
          addon_emergency_response?: boolean | null
          addon_hurricane_monitoring?: boolean | null
          addon_warranty_tracking?: boolean | null
          addons_fee?: number | null
          base_fee: number
          billing_day_of_month?: number | null
          billing_start_date?: string | null
          cancelled_at?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          inspection_frequency: Database["public"]["Enums"]["inspection_frequency"]
          inspection_tier: Database["public"]["Enums"]["inspection_tier"]
          monthly_total: number
          notes?: string | null
          organization_id: string
          paused_at?: string | null
          preferred_day_of_week?: number | null
          preferred_inspector_id?: string | null
          preferred_time_slot?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["program_status"] | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier_fee: number
          updated_at?: string | null
          vendor_markup_percent?: number | null
        }
        Update: {
          activated_at?: string | null
          addon_digital_manual?: boolean | null
          addon_emergency_response?: boolean | null
          addon_hurricane_monitoring?: boolean | null
          addon_warranty_tracking?: boolean | null
          addons_fee?: number | null
          base_fee?: number
          billing_day_of_month?: number | null
          billing_start_date?: string | null
          cancelled_at?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          inspection_frequency?: Database["public"]["Enums"]["inspection_frequency"]
          inspection_tier?: Database["public"]["Enums"]["inspection_tier"]
          monthly_total?: number
          notes?: string | null
          organization_id?: string
          paused_at?: string | null
          preferred_day_of_week?: number | null
          preferred_inspector_id?: string | null
          preferred_time_slot?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["program_status"] | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier_fee?: number
          updated_at?: string | null
          vendor_markup_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_preferred_inspector_id_fkey"
            columns: ["preferred_inspector_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          access_instructions: string | null
          address_line1: string
          address_line2: string | null
          alarm_code: string | null
          alarm_company: string | null
          alarm_company_phone: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          client_id: string
          construction_type: string | null
          county: string | null
          created_at: string | null
          features: Json | null
          flood_zone: string | null
          floor_plan_url: string | null
          foundation_type: string | null
          garage_code: string | null
          gate_code: string | null
          hoa_name: string | null
          id: string
          internal_notes: string | null
          is_active: boolean | null
          is_coastal: boolean | null
          is_gated_community: boolean | null
          latitude: number | null
          lockbox_code: string | null
          lockbox_location: string | null
          longitude: number | null
          lot_size_sqft: number | null
          name: string
          notes: string | null
          organization_id: string
          photos: string[] | null
          primary_photo_url: string | null
          roof_type: string | null
          site_plan_url: string | null
          square_footage: number | null
          state: string
          stories: number | null
          updated_at: string | null
          wifi_network: string | null
          wifi_password: string | null
          year_built: number | null
          zip: string
        }
        Insert: {
          access_instructions?: string | null
          address_line1: string
          address_line2?: string | null
          alarm_code?: string | null
          alarm_company?: string | null
          alarm_company_phone?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          client_id: string
          construction_type?: string | null
          county?: string | null
          created_at?: string | null
          features?: Json | null
          flood_zone?: string | null
          floor_plan_url?: string | null
          foundation_type?: string | null
          garage_code?: string | null
          gate_code?: string | null
          hoa_name?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean | null
          is_coastal?: boolean | null
          is_gated_community?: boolean | null
          latitude?: number | null
          lockbox_code?: string | null
          lockbox_location?: string | null
          longitude?: number | null
          lot_size_sqft?: number | null
          name: string
          notes?: string | null
          organization_id: string
          photos?: string[] | null
          primary_photo_url?: string | null
          roof_type?: string | null
          site_plan_url?: string | null
          square_footage?: number | null
          state: string
          stories?: number | null
          updated_at?: string | null
          wifi_network?: string | null
          wifi_password?: string | null
          year_built?: number | null
          zip: string
        }
        Update: {
          access_instructions?: string | null
          address_line1?: string
          address_line2?: string | null
          alarm_code?: string | null
          alarm_company?: string | null
          alarm_company_phone?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          client_id?: string
          construction_type?: string | null
          county?: string | null
          created_at?: string | null
          features?: Json | null
          flood_zone?: string | null
          floor_plan_url?: string | null
          foundation_type?: string | null
          garage_code?: string | null
          gate_code?: string | null
          hoa_name?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean | null
          is_coastal?: boolean | null
          is_gated_community?: boolean | null
          latitude?: number | null
          lockbox_code?: string | null
          lockbox_location?: string | null
          longitude?: number | null
          lot_size_sqft?: number | null
          name?: string
          notes?: string | null
          organization_id?: string
          photos?: string[] | null
          primary_photo_url?: string | null
          roof_type?: string | null
          site_plan_url?: string | null
          square_footage?: number | null
          state?: string
          stories?: number | null
          updated_at?: string | null
          wifi_network?: string | null
          wifi_password?: string | null
          year_built?: number | null
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_supply_requirements: {
        Row: {
          category: string
          created_at: string | null
          estimated_cost: number | null
          id: string
          is_active: boolean | null
          is_critical: boolean | null
          item_description: string | null
          item_name: string
          location: string | null
          notes: string | null
          preferred_supplier: string | null
          property_id: string
          reorder_threshold: number | null
          supplier_part_number: string | null
          target_quantity: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          item_description?: string | null
          item_name: string
          location?: string | null
          notes?: string | null
          preferred_supplier?: string | null
          property_id: string
          reorder_threshold?: number | null
          supplier_part_number?: string | null
          target_quantity?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          item_description?: string | null
          item_name?: string
          location?: string | null
          notes?: string | null
          preferred_supplier?: string | null
          property_id?: string
          reorder_threshold?: number | null
          supplier_part_number?: string | null
          target_quantity?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_supply_requirements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_supply_requirements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_supply_requirements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_supply_requirements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
        ]
      }
      recommendation_templates: {
        Row: {
          category: string | null
          created_at: string | null
          default_priority: Database["public"]["Enums"]["priority_level"] | null
          description: string
          estimated_cost_high: number | null
          estimated_cost_low: number | null
          id: string
          is_active: boolean | null
          organization_id: string
          template_key: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          default_priority?:
            | Database["public"]["Enums"]["priority_level"]
            | null
          description: string
          estimated_cost_high?: number | null
          estimated_cost_low?: number | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          template_key: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          default_priority?:
            | Database["public"]["Enums"]["priority_level"]
            | null
          description?: string
          estimated_cost_high?: number | null
          estimated_cost_low?: number | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          template_key?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          ai_enhanced_at: string | null
          ai_enhanced_description: string | null
          ai_why_it_matters: string | null
          category: string | null
          checklist_item_id: string | null
          client_responded_at: string | null
          client_response_notes: string | null
          created_at: string | null
          declined_reason: string | null
          description: string
          equipment_id: string | null
          estimated_cost_high: number | null
          estimated_cost_low: number | null
          id: string
          inspection_id: string | null
          organization_id: string
          photos: string[] | null
          priority: Database["public"]["Enums"]["priority_level"]
          property_id: string
          status: Database["public"]["Enums"]["recommendation_status"] | null
          template_id: string | null
          title: string
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          ai_enhanced_at?: string | null
          ai_enhanced_description?: string | null
          ai_why_it_matters?: string | null
          category?: string | null
          checklist_item_id?: string | null
          client_responded_at?: string | null
          client_response_notes?: string | null
          created_at?: string | null
          declined_reason?: string | null
          description: string
          equipment_id?: string | null
          estimated_cost_high?: number | null
          estimated_cost_low?: number | null
          id?: string
          inspection_id?: string | null
          organization_id: string
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["priority_level"]
          property_id: string
          status?: Database["public"]["Enums"]["recommendation_status"] | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          ai_enhanced_at?: string | null
          ai_enhanced_description?: string | null
          ai_why_it_matters?: string | null
          category?: string | null
          checklist_item_id?: string | null
          client_responded_at?: string | null
          client_response_notes?: string | null
          created_at?: string | null
          declined_reason?: string | null
          description?: string
          equipment_id?: string | null
          estimated_cost_high?: number | null
          estimated_cost_low?: number | null
          id?: string
          inspection_id?: string | null
          organization_id?: string
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["priority_level"]
          property_id?: string
          status?: Database["public"]["Enums"]["recommendation_status"] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "recommendation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string
          equipment_id: string | null
          id: string
          is_recurring: boolean | null
          next_occurrence: string | null
          notify_client: boolean | null
          notify_staff: boolean | null
          organization_id: string
          program_id: string | null
          property_id: string | null
          recurrence_rule: string | null
          reminder_date: string
          reminder_type: string
          sent_at: string | null
          snoozed_until: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          equipment_id?: string | null
          id?: string
          is_recurring?: boolean | null
          next_occurrence?: string | null
          notify_client?: boolean | null
          notify_staff?: boolean | null
          organization_id: string
          program_id?: string | null
          property_id?: string | null
          recurrence_rule?: string | null
          reminder_date: string
          reminder_type: string
          sent_at?: string | null
          snoozed_until?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          equipment_id?: string | null
          id?: string
          is_recurring?: boolean | null
          next_occurrence?: string | null
          notify_client?: boolean | null
          notify_staff?: boolean | null
          organization_id?: string
          program_id?: string | null
          property_id?: string | null
          recurrence_rule?: string | null
          reminder_date?: string
          reminder_type?: string
          sent_at?: string | null
          snoozed_until?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          service_request_id: string
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          service_request_id: string
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          service_request_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_request_comments_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_request_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          assigned_to: string | null
          client_id: string
          created_at: string | null
          description: string
          id: string
          organization_id: string
          photos: string[] | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          property_id: string
          request_number: string
          request_type: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["service_request_status"] | null
          title: string
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          assigned_to?: string | null
          client_id: string
          created_at?: string | null
          description: string
          id?: string
          organization_id: string
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          property_id: string
          request_number: string
          request_type: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["service_request_status"] | null
          title: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          assigned_to?: string | null
          client_id?: string
          created_at?: string | null
          description?: string
          id?: string
          organization_id?: string
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          property_id?: string
          request_number?: string
          request_type?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["service_request_status"] | null
          title?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_sensitive: boolean | null
          organization_id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          organization_id: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          organization_id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          dedicated_tech: boolean | null
          description: string | null
          features: Json | null
          id: string
          includes_emergency: boolean | null
          includes_supplies: boolean | null
          is_active: boolean | null
          name: string
          price_monthly: number
          slug: string
          sort_order: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
          visit_frequency: string | null
        }
        Insert: {
          created_at?: string | null
          dedicated_tech?: boolean | null
          description?: string | null
          features?: Json | null
          id?: string
          includes_emergency?: boolean | null
          includes_supplies?: boolean | null
          is_active?: boolean | null
          name: string
          price_monthly: number
          slug: string
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
          visit_frequency?: string | null
        }
        Update: {
          created_at?: string | null
          dedicated_tech?: boolean | null
          description?: string | null
          features?: Json | null
          id?: string
          includes_emergency?: boolean | null
          includes_supplies?: boolean | null
          is_active?: boolean | null
          name?: string
          price_monthly?: number
          slug?: string
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
          visit_frequency?: string | null
        }
        Relationships: []
      }
      supply_cost_logs: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          created_at: string | null
          delivered_at: string | null
          delivery_location: string | null
          id: string
          item_name: string
          property_id: string | null
          purchased_at: string | null
          purchased_by: string | null
          quantity: number | null
          receipt_number: string | null
          supply_request_id: string | null
          total_cost: number | null
          unit: string | null
          vendor: string | null
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_location?: string | null
          id?: string
          item_name: string
          property_id?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: number | null
          receipt_number?: string | null
          supply_request_id?: string | null
          total_cost?: number | null
          unit?: string | null
          vendor?: string | null
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_location?: string | null
          id?: string
          item_name?: string
          property_id?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity?: number | null
          receipt_number?: string | null
          supply_request_id?: string | null
          total_cost?: number | null
          unit?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_cost_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_cost_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_cost_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "supply_cost_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "supply_cost_logs_supply_request_id_fkey"
            columns: ["supply_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_supply_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_inventory_logs: {
        Row: {
          current_stock: number
          id: string
          is_critical_low: boolean | null
          logged_at: string | null
          logged_by_id: string | null
          logged_by_name: string | null
          needs_restock: boolean | null
          notes: string | null
          previous_stock: number | null
          property_id: string
          requirement_id: string
          visit_id: string
        }
        Insert: {
          current_stock: number
          id?: string
          is_critical_low?: boolean | null
          logged_at?: string | null
          logged_by_id?: string | null
          logged_by_name?: string | null
          needs_restock?: boolean | null
          notes?: string | null
          previous_stock?: number | null
          property_id: string
          requirement_id: string
          visit_id: string
        }
        Update: {
          current_stock?: number
          id?: string
          is_critical_low?: boolean | null
          logged_at?: string | null
          logged_by_id?: string | null
          logged_by_name?: string | null
          needs_restock?: boolean | null
          notes?: string | null
          previous_stock?: number | null
          property_id?: string
          requirement_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_inventory_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_inventory_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_inventory_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "supply_inventory_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "supply_inventory_logs_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "property_inventory_status"
            referencedColumns: ["requirement_id"]
          },
          {
            foreignKeyName: "supply_inventory_logs_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "property_supply_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_inventory_logs_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "supply_inventory_logs_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "maintenance_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_templates: {
        Row: {
          applies_to: Json | null
          category: string
          default_quantity: number | null
          default_threshold: number | null
          estimated_cost: number | null
          id: string
          item_name: string
          sort_order: number | null
          unit: string | null
        }
        Insert: {
          applies_to?: Json | null
          category: string
          default_quantity?: number | null
          default_threshold?: number | null
          estimated_cost?: number | null
          id?: string
          item_name: string
          sort_order?: number | null
          unit?: string | null
        }
        Update: {
          applies_to?: Json | null
          category?: string
          default_quantity?: number | null
          default_threshold?: number | null
          estimated_cost?: number | null
          id?: string
          item_name?: string
          sort_order?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          assigned_properties: string[] | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string | null
          id: string
          phone: string | null
          phone_verified: boolean | null
          role: string
          status: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          assigned_properties?: string[] | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: string
          status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          assigned_properties?: string[] | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: string
          status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          average_rating: number | null
          average_response_hours: number | null
          city: string | null
          company_name: string
          completed_jobs: number | null
          contact_first_name: string | null
          contact_last_name: string | null
          created_at: string | null
          email: string | null
          id: string
          insurance_company: string | null
          insurance_expiration: string | null
          insurance_policy_number: string | null
          is_active: boolean | null
          is_preferred: boolean | null
          license_expiration: string | null
          license_number: string | null
          notes: string | null
          organization_id: string
          phone: string | null
          service_area: string[] | null
          state: string | null
          total_jobs: number | null
          trade_categories: string[] | null
          updated_at: string | null
          w9_on_file: boolean | null
          w9_received_date: string | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          average_rating?: number | null
          average_response_hours?: number | null
          city?: string | null
          company_name: string
          completed_jobs?: number | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          insurance_company?: string | null
          insurance_expiration?: string | null
          insurance_policy_number?: string | null
          is_active?: boolean | null
          is_preferred?: boolean | null
          license_expiration?: string | null
          license_number?: string | null
          notes?: string | null
          organization_id: string
          phone?: string | null
          service_area?: string[] | null
          state?: string | null
          total_jobs?: number | null
          trade_categories?: string[] | null
          updated_at?: string | null
          w9_on_file?: boolean | null
          w9_received_date?: string | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          average_rating?: number | null
          average_response_hours?: number | null
          city?: string | null
          company_name?: string
          completed_jobs?: number | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          insurance_company?: string | null
          insurance_expiration?: string | null
          insurance_policy_number?: string | null
          is_active?: boolean | null
          is_preferred?: boolean | null
          license_expiration?: string | null
          license_number?: string | null
          notes?: string | null
          organization_id?: string
          phone?: string | null
          service_area?: string[] | null
          state?: string | null
          total_jobs?: number | null
          trade_categories?: string[] | null
          updated_at?: string | null
          w9_on_file?: boolean | null
          w9_received_date?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_cost: number | null
          after_photos: string[] | null
          assigned_to: string | null
          before_photos: string[] | null
          category: string | null
          client_id: string
          client_visible_notes: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          description: string
          estimated_cost: number | null
          id: string
          internal_notes: string | null
          invoice_id: string | null
          invoiced_at: string | null
          markup_amount: number | null
          markup_percent: number | null
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          property_id: string
          recommendation_id: string | null
          scheduled_date: string | null
          scheduled_time_end: string | null
          scheduled_time_start: string | null
          service_request_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["work_order_status"] | null
          title: string
          total_client_cost: number | null
          updated_at: string | null
          vendor_id: string | null
          vendor_invoice_url: string | null
          work_order_number: string
        }
        Insert: {
          actual_cost?: number | null
          after_photos?: string[] | null
          assigned_to?: string | null
          before_photos?: string[] | null
          category?: string | null
          client_id: string
          client_visible_notes?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description: string
          estimated_cost?: number | null
          id?: string
          internal_notes?: string | null
          invoice_id?: string | null
          invoiced_at?: string | null
          markup_amount?: number | null
          markup_percent?: number | null
          organization_id: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          property_id: string
          recommendation_id?: string | null
          scheduled_date?: string | null
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          service_request_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"] | null
          title: string
          total_client_cost?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_invoice_url?: string | null
          work_order_number: string
        }
        Update: {
          actual_cost?: number | null
          after_photos?: string[] | null
          assigned_to?: string | null
          before_photos?: string[] | null
          category?: string | null
          client_id?: string
          client_visible_notes?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description?: string
          estimated_cost?: number | null
          id?: string
          internal_notes?: string | null
          invoice_id?: string | null
          invoiced_at?: string | null
          markup_amount?: number | null
          markup_percent?: number | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          property_id?: string
          recommendation_id?: string | null
          scheduled_date?: string | null
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          service_request_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"] | null
          title?: string
          total_client_cost?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_invoice_url?: string | null
          work_order_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_subscription_summary: {
        Row: {
          client_email: string | null
          client_name: string | null
          current_period_end: string | null
          current_period_start: string | null
          features: Json | null
          id: string | null
          plan_name: string | null
          plan_slug: string | null
          price_monthly: number | null
          property_id: string | null
          property_name: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "client_subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
        ]
      }
      maintenance_property_summary: {
        Row: {
          address: string | null
          city: string | null
          client_email: string | null
          client_name: string | null
          has_irrigation: boolean | null
          has_pool: boolean | null
          health_score: number | null
          health_score_updated_at: string | null
          id: string | null
          last_visit_date: string | null
          next_visit_date: string | null
          num_hvac_zones: number | null
          open_issues: number | null
          pending_requests: number | null
          preferred_day: string | null
          property_name: string | null
          service_tier: string | null
          state: string | null
          status: string | null
          total_visits: number | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_email?: string | null
          client_name?: string | null
          has_irrigation?: boolean | null
          has_pool?: boolean | null
          health_score?: number | null
          health_score_updated_at?: string | null
          id?: string | null
          last_visit_date?: never
          next_visit_date?: never
          num_hvac_zones?: number | null
          open_issues?: never
          pending_requests?: never
          preferred_day?: string | null
          property_name?: string | null
          service_tier?: string | null
          state?: string | null
          status?: string | null
          total_visits?: never
        }
        Update: {
          address?: string | null
          city?: string | null
          client_email?: string | null
          client_name?: string | null
          has_irrigation?: boolean | null
          has_pool?: boolean | null
          health_score?: number | null
          health_score_updated_at?: string | null
          id?: string | null
          last_visit_date?: never
          next_visit_date?: never
          num_hvac_zones?: number | null
          open_issues?: never
          pending_requests?: never
          preferred_day?: string | null
          property_name?: string | null
          service_tier?: string | null
          state?: string | null
          status?: string | null
          total_visits?: never
        }
        Relationships: []
      }
      maintenance_schedule: {
        Row: {
          address: string | null
          city: string | null
          client_name: string | null
          completed_at: string | null
          preferred_time: string | null
          property_id: string | null
          property_name: string | null
          property_open_issues: number | null
          started_at: string | null
          status: string | null
          technician_id: string | null
          technician_name: string | null
          visit_date: string | null
          visit_id: string | null
          visit_type: string | null
        }
        Relationships: []
      }
      monthly_supply_costs: {
        Row: {
          categories: string[] | null
          client_name: string | null
          month: string | null
          property_id: string | null
          property_name: string | null
          purchase_count: number | null
          total_spent: number | null
        }
        Relationships: []
      }
      property_inventory_status: {
        Row: {
          category: string | null
          current_stock: number | null
          estimated_cost: number | null
          is_critical: boolean | null
          item_name: string | null
          last_checked: string | null
          last_notes: string | null
          location: string | null
          needs_restock: boolean | null
          property_id: string | null
          property_name: string | null
          reorder_threshold: number | null
          requirement_id: string | null
          stock_status: string | null
          target_quantity: number | null
          unit: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_supply_requirements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_supply_requirements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_property_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_supply_requirements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedule"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_supply_requirements_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monthly_supply_costs"
            referencedColumns: ["property_id"]
          },
        ]
      }
    }
    Functions: {
      calculate_inspection_duration: {
        Args: {
          p_property_id: string
          p_tier: Database["public"]["Enums"]["inspection_tier"]
        }
        Returns: number
      }
      calculate_program_pricing: {
        Args: {
          p_addon_digital_manual: boolean
          p_addon_emergency_response: boolean
          p_addon_hurricane_monitoring: boolean
          p_addon_warranty_tracking: boolean
          p_frequency: Database["public"]["Enums"]["inspection_frequency"]
          p_organization_id: string
          p_tier: Database["public"]["Enums"]["inspection_tier"]
        }
        Returns: {
          addons_fee: number
          base_fee: number
          monthly_total: number
          tier_fee: number
        }[]
      }
      calculate_property_health_score: {
        Args: { prop_id: string }
        Returns: number
      }
      calculate_property_monthly_total: {
        Args: { p_property_id: string }
        Returns: number
      }
      get_next_visit_date: {
        Args: { frequency: string; last_visit_date: string }
        Returns: string
      }
      get_user_client_id: { Args: never; Returns: string }
      get_user_organization_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: { Args: { required_role: string }; Returns: boolean }
      is_admin_or_manager: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_property_health_score: {
        Args: { prop_id: string }
        Returns: number
      }
    }
    Enums: {
      calendar_event_type:
        | "inspection"
        | "work_order"
        | "reminder"
        | "service"
        | "block"
        | "other"
      condition_rating:
        | "excellent"
        | "good"
        | "fair"
        | "needs_attention"
        | "poor"
      inspection_frequency:
        | "annual"
        | "semi_annual"
        | "quarterly"
        | "monthly"
        | "bi_weekly"
      inspection_item_status:
        | "pass"
        | "fail"
        | "na"
        | "needs_attention"
        | "urgent"
      inspection_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rescheduled"
      inspection_tier:
        | "visual"
        | "functional"
        | "comprehensive"
        | "preventative"
      invoice_status:
        | "draft"
        | "sent"
        | "viewed"
        | "paid"
        | "partial"
        | "overdue"
        | "void"
      notification_type:
        | "inspection"
        | "work_order"
        | "payment"
        | "reminder"
        | "alert"
        | "message"
      priority_level: "low" | "medium" | "high" | "urgent"
      program_status: "pending" | "active" | "paused" | "cancelled"
      recommendation_status:
        | "pending"
        | "approved"
        | "declined"
        | "scheduled"
        | "in_progress"
        | "completed"
      service_request_status:
        | "new"
        | "acknowledged"
        | "in_progress"
        | "scheduled"
        | "completed"
        | "cancelled"
      user_role: "admin" | "manager" | "inspector" | "client"
      work_order_status:
        | "pending"
        | "vendor_assigned"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "on_hold"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      calendar_event_type: [
        "inspection",
        "work_order",
        "reminder",
        "service",
        "block",
        "other",
      ],
      condition_rating: [
        "excellent",
        "good",
        "fair",
        "needs_attention",
        "poor",
      ],
      inspection_frequency: [
        "annual",
        "semi_annual",
        "quarterly",
        "monthly",
        "bi_weekly",
      ],
      inspection_item_status: [
        "pass",
        "fail",
        "na",
        "needs_attention",
        "urgent",
      ],
      inspection_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      inspection_tier: [
        "visual",
        "functional",
        "comprehensive",
        "preventative",
      ],
      invoice_status: [
        "draft",
        "sent",
        "viewed",
        "paid",
        "partial",
        "overdue",
        "void",
      ],
      notification_type: [
        "inspection",
        "work_order",
        "payment",
        "reminder",
        "alert",
        "message",
      ],
      priority_level: ["low", "medium", "high", "urgent"],
      program_status: ["pending", "active", "paused", "cancelled"],
      recommendation_status: [
        "pending",
        "approved",
        "declined",
        "scheduled",
        "in_progress",
        "completed",
      ],
      service_request_status: [
        "new",
        "acknowledged",
        "in_progress",
        "scheduled",
        "completed",
        "cancelled",
      ],
      user_role: ["admin", "manager", "inspector", "client"],
      work_order_status: [
        "pending",
        "vendor_assigned",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "on_hold",
      ],
    },
  },
} as const
