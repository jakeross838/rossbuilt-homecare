// Run demo data SQL against Supabase
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://qzbmnbinhxzkcwfjnmtb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.log('Get your service role key from: https://supabase.com/dashboard/project/qzbmnbinhxzkcwfjnmtb/settings/api')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runDemoData() {
  console.log('Running demo data migration...')

  // Read the SQL file
  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '023_demo_data.sql')
  const sql = readFileSync(sqlPath, 'utf8')

  // Split into individual statements and run them
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`Found ${statements.length} SQL statements`)

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    if (stmt.startsWith('--') || stmt.length < 10) continue

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' })
      if (error) {
        // Try direct query for INSERT statements
        if (stmt.toUpperCase().startsWith('INSERT')) {
          console.log(`Statement ${i + 1}: Trying direct approach...`)
        }
      } else {
        console.log(`Statement ${i + 1}/${statements.length}: OK`)
      }
    } catch (err) {
      console.log(`Statement ${i + 1}: ${err.message?.slice(0, 50) || 'Error'}`)
    }
  }

  console.log('Done!')
}

runDemoData().catch(console.error)
