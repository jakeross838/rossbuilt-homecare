const http = require('http');

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function patchPlan(id, updates) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(updates);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/plans/${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const plans = await fetchJson('http://localhost:3000/api/plans');
  
  // Find Luxury plan (tier 3) and update frequency
  const luxuryPlan = plans.find(p => p.tier_level === 3);
  if (luxuryPlan) {
    const result = await patchPlan(luxuryPlan.id, {
      inspection_frequency: "biweekly",
      features: [
        "Bi-weekly 60+ minute visits",
        "Everything in Premium, plus:",
        "Test ALL appliances and systems",
        "Outlet and electrical testing",
        "Quarterly attic/crawlspace inspection",
        "Pre-arrival preparation services",
        "Post-departure securing",
        "Custom checklist for your property"
      ]
    });
    console.log(`Updated ${result.name}: frequency = ${result.inspection_frequency}`);
  }
}

main().catch(console.error);
