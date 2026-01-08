const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) {
    console.error('SUPABASE_DB_PASSWORD required');
    process.exit(1);
  }

  const ref = 'qzbmnbinhxzkcwfjnmtb';

  // Try various username formats and endpoints
  const configs = [
    // Different pooler username formats
    { host: `${ref}.pooler.supabase.com`, port: 6543, user: 'postgres', name: 'Pooler postgres' },
    { host: `${ref}.pooler.supabase.com`, port: 5432, user: 'postgres', name: 'Pooler postgres:5432' },
    { host: `${ref}.supabase.com`, port: 6543, user: 'postgres', name: 'Main:6543 postgres' },
    { host: `${ref}.supabase.com`, port: 5432, user: 'postgres', name: 'Main:5432 postgres' },
    // Supavisor format
    { host: `${ref}.supabase.co`, port: 6543, user: 'postgres', name: 'Supavisor' },
  ];

  // Add regional poolers with different user formats
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
  for (const r of regions) {
    configs.push({ host: `aws-0-${r}.pooler.supabase.com`, port: 6543, user: 'postgres', name: `AWS ${r} plain` });
    configs.push({ host: `aws-0-${r}.pooler.supabase.com`, port: 6543, user: `postgres:${ref}`, name: `AWS ${r} colon` });
  }

  let client, connected = false;

  for (const c of configs) {
    client = new Client({
      host: c.host, port: c.port, database: 'postgres',
      user: c.user, password: password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      process.stdout.write(`${c.name}... `);
      await client.connect();
      console.log('Connected!');
      connected = true;
      break;
    } catch (e) {
      const msg = e.message.includes('ENOTFOUND') ? 'no DNS' :
                  e.message.includes('Tenant') ? 'no tenant' :
                  e.message.includes('timeout') ? 'timeout' :
                  e.message.includes('password') ? 'auth fail' :
                  e.message.includes('UNREACHABLE') ? 'unreachable' :
                  e.message.substring(0, 30);
      console.log(msg);
      try { await client.end(); } catch {}
    }
  }

  if (!connected) {
    console.error('\nCould not connect. The pooler may need to be enabled in Supabase settings.');
    process.exit(1);
  }

  try {
    const schema = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
    console.log('\nRunning migrations...');
    await client.query(schema);
    console.log('Tables created!\n');

    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'pm_%' ORDER BY 1`);
    console.log('Created:');
    res.rows.forEach(r => console.log(`  - ${r.table_name}`));
  } catch (e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nDone!');
  }
}

runMigrations();
