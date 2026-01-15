import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { equipment_id } = await req.json()

    if (!equipment_id) {
      return new Response(
        JSON.stringify({ error: 'equipment_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch equipment record
    const { data: equipment, error: fetchError } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', equipment_id)
      .single()

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: `Equipment not found: ${fetchError.message}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Claude API
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `You are a home maintenance expert for luxury coastal homes in Tampa Bay, Florida.

Generate maintenance information for:
- Category: ${equipment.category}
- Type: ${equipment.equipment_type}
- Manufacturer: ${equipment.manufacturer || 'Unknown'}
- Model: ${equipment.model_number || 'Unknown'}
- Location: ${equipment.location || 'Not specified'}

Return ONLY valid JSON (no markdown, no explanation):
{
  "maintenance_schedule": [
    {
      "task": "string",
      "frequency": "monthly|quarterly|semi_annually|annually",
      "performer": "owner|ross_built|vendor",
      "estimated_cost_low": number,
      "estimated_cost_high": number,
      "notes": "string",
      "priority": "low|medium|high"
    }
  ],
  "inspection_checklist": {
    "visual": ["string"],
    "functional": ["string"],
    "comprehensive": ["string"],
    "preventative": ["string"]
  },
  "troubleshooting": [
    {
      "symptom": "string",
      "likely_cause": "string",
      "action": "string",
      "urgency": "low|medium|high"
    }
  ],
  "expected_lifespan_years": number,
  "replacement_cost_estimate": { "low": number, "high": number }
}

Use Tampa Bay market pricing. Consider coastal humidity and salt air impact on equipment longevity and maintenance needs.`
        }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ error: `Claude API error: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiResult = await response.json()
    const content = aiResult.content[0].text

    // Extract JSON from response (handles potential markdown wrapping)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Update equipment record with AI-generated content
    const { error: updateError } = await supabase
      .from('equipment')
      .update({
        maintenance_schedule: parsed.maintenance_schedule,
        inspection_checklist: parsed.inspection_checklist,
        troubleshooting_guide: parsed.troubleshooting,
        expected_lifespan_years: parsed.expected_lifespan_years,
        ai_generated_at: new Date().toISOString(),
      })
      .eq('id', equipment_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update equipment: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
