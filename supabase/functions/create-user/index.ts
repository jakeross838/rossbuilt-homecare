import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'admin' | 'manager' | 'inspector' | 'client'
  phone?: string
  client_id?: string // For client role, link to existing client record
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create admin client for user management
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get the calling user's JWT from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the calling user is admin or manager
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get calling user's profile to check role and org
    const { data: callingProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role, organization_id')
      .eq('id', callingUser.id)
      .single()

    if (profileError || !callingProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Only admin and manager can create users
    if (!['admin', 'manager'].includes(callingProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only admin/manager can create users.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload: CreateUserRequest = await req.json()

    // Validate required fields
    if (!payload.email || !payload.password || !payload.first_name || !payload.last_name || !payload.role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, first_name, last_name, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'inspector', 'client']
    if (!validRoles.includes(payload.role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For client role, client_id is recommended but optional
    if (payload.role === 'client' && payload.client_id) {
      // Verify the client record exists and belongs to same org
      const { data: clientRecord, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('id, organization_id')
        .eq('id', payload.client_id)
        .single()

      if (clientError || !clientRecord) {
        return new Response(
          JSON.stringify({ error: 'Client record not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (clientRecord.organization_id !== callingProfile.organization_id) {
        return new Response(
          JSON.stringify({ error: 'Client belongs to a different organization' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create the auth user using Admin API
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        first_name: payload.first_name,
        last_name: payload.last_name,
      },
    })

    if (createAuthError) {
      console.error('Auth user creation error:', createAuthError)
      return new Response(
        JSON.stringify({ error: createAuthError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newUserId = authData.user.id

    // Create the users table entry
    const { error: insertUserError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUserId,
        organization_id: callingProfile.organization_id,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone || null,
        role: payload.role,
        is_active: true,
        settings: {
          notifications: { email: true, sms: false, push: true },
          preferences: { theme: 'light', calendar_view: 'week' },
        },
      })

    if (insertUserError) {
      console.error('Users table insert error:', insertUserError)
      // Attempt to clean up the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile: ' + insertUserError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If client role with client_id, link the user to the client record
    if (payload.role === 'client' && payload.client_id) {
      const { error: linkError } = await supabaseAdmin
        .from('clients')
        .update({ user_id: newUserId })
        .eq('id', payload.client_id)

      if (linkError) {
        console.error('Client link error:', linkError)
        // Don't fail the whole operation, just log it
      }
    }

    // Log the activity
    await supabaseAdmin.from('activity_log').insert({
      organization_id: callingProfile.organization_id,
      user_id: callingUser.id,
      action: 'created',
      entity_type: 'user',
      entity_id: newUserId,
      entity_name: `${payload.first_name} ${payload.last_name}`,
      metadata: {
        email: payload.email,
        role: payload.role,
        created_by: callingUser.email,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUserId,
        email: payload.email,
        message: `User ${payload.email} created successfully`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Create user error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
