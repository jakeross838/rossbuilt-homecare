import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FindingsSummary {
  total_items: number
  passed: number
  failed: number
  needs_attention: number
  urgent: number
  not_applicable: number
}

interface SectionFinding {
  section_name: string
  items: Array<{
    label: string
    status: string
    notes?: string
  }>
}

interface Recommendation {
  title: string
  description: string
  priority: string
  category?: string
}

interface ReportSummaryRequest {
  property_name: string
  property_address: string
  client_name: string
  inspection_date: string
  inspection_type: string
  overall_condition: string | null
  inspector_summary: string | null
  findings_summary: FindingsSummary
  sections: SectionFinding[]
  recommendations: Recommendation[]
  weather?: {
    temperature?: number
    humidity?: number
    conditions?: string
  }
}

interface ReportSummaryResponse {
  executive_summary: string
  key_findings: string[]
  priority_actions: string[]
  closing_statement: string
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestData: ReportSummaryRequest = await req.json()

    // Build the prompt
    const prompt = buildPrompt(requestData)

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
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
    const textContent = aiResult.content?.[0]?.text

    if (!textContent) {
      return new Response(
        JSON.stringify({ error: 'No text response from Claude' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the response
    const summaryResponse = parseResponse(textContent)

    return new Response(JSON.stringify(summaryResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating report summary:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function buildPrompt(data: ReportSummaryRequest): string {
  // Build issues list from sections
  const issues: string[] = []
  for (const section of data.sections) {
    for (const item of section.items) {
      if (['fail', 'needs_attention', 'urgent'].includes(item.status)) {
        const statusLabel =
          item.status === 'fail'
            ? 'Failed'
            : item.status === 'urgent'
            ? 'URGENT'
            : 'Needs Attention'
        issues.push(
          `- [${statusLabel}] ${section.section_name}: ${item.label}${
            item.notes ? ` - ${item.notes}` : ''
          }`
        )
      }
    }
  }

  // Build recommendations list
  const recommendations = data.recommendations
    .map(
      (rec) =>
        `- [${rec.priority.toUpperCase()}] ${rec.title}: ${rec.description}`
    )
    .join('\n')

  return `You are a professional home inspector writing a summary for a luxury home care report. Write in a professional, reassuring tone appropriate for high-net-worth homeowners.

PROPERTY INFORMATION:
- Property: ${data.property_name}
- Address: ${data.property_address}
- Client: ${data.client_name}
- Inspection Date: ${data.inspection_date}
- Inspection Type: ${data.inspection_type}
- Overall Condition: ${data.overall_condition || 'Not rated'}
${data.weather ? `- Weather: ${data.weather.temperature}°F, ${data.weather.humidity}% humidity, ${data.weather.conditions}` : ''}

INSPECTION RESULTS:
- Total Items Checked: ${data.findings_summary.total_items}
- Passed: ${data.findings_summary.passed}
- Failed: ${data.findings_summary.failed}
- Needs Attention: ${data.findings_summary.needs_attention}
- Urgent Issues: ${data.findings_summary.urgent}
- Not Applicable: ${data.findings_summary.not_applicable}

${data.inspector_summary ? `INSPECTOR'S NOTES:\n${data.inspector_summary}\n` : ''}

${issues.length > 0 ? `ISSUES FOUND:\n${issues.join('\n')}\n` : 'No significant issues found.'}

${recommendations ? `RECOMMENDATIONS:\n${recommendations}\n` : 'No specific recommendations at this time.'}

Please generate a professional report summary with the following sections. Format your response as JSON:

{
  "executive_summary": "A 2-3 paragraph professional summary of the inspection findings, written for the homeowner. Be reassuring where appropriate, but honest about any concerns.",
  "key_findings": ["Array of 3-5 bullet points highlighting the most important observations"],
  "priority_actions": ["Array of recommended actions in priority order, if any issues were found. Empty array if no issues."],
  "closing_statement": "A brief, professional closing statement thanking them for their trust and commitment to home care."
}

Important guidelines:
- Write for an affluent audience who expects premium service
- Be professional but warm, not overly technical
- Emphasize proactive care and prevention
- For "excellent" or "good" conditions, be reassuring
- For issues, be clear but not alarmist
- Always end on a positive, forward-looking note`
}

function parseResponse(text: string): ReportSummaryResponse {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    // Return a fallback response
    return {
      executive_summary:
        'This property has been inspected according to our comprehensive standards. Please review the detailed findings in the sections below.',
      key_findings: ['Inspection completed successfully'],
      priority_actions: [],
      closing_statement:
        'Thank you for trusting Ross Built Home Care with your property. We are committed to maintaining your home to the highest standards.',
    }
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return {
      executive_summary:
        parsed.executive_summary || 'Inspection summary not available.',
      key_findings: Array.isArray(parsed.key_findings)
        ? parsed.key_findings
        : [],
      priority_actions: Array.isArray(parsed.priority_actions)
        ? parsed.priority_actions
        : [],
      closing_statement:
        parsed.closing_statement ||
        'Thank you for choosing Ross Built Home Care.',
    }
  } catch (e) {
    console.error('Failed to parse response:', e)
    return {
      executive_summary: text.slice(0, 500),
      key_findings: [],
      priority_actions: [],
      closing_statement:
        'Thank you for choosing Ross Built Home Care.',
    }
  }
}
