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
  
  const updates = {
    1: {
      name: "Essential Care",
      description: "Eyes on your property - monthly visual inspections to catch major issues.",
      monthly_base_price: 349,
      inspection_frequency: "monthly",
      features: [
        "Monthly 15-20 minute visit",
        "Visual inspection of all rooms",
        "Exterior walkthrough",
        "Check for water damage, pests, security",
        "HVAC and water heater status check",
        "Photo report after each visit",
        "Issues flagged immediately"
      ]
    },
    2: {
      name: "Premium Care",
      description: "Active property caretaker - bi-weekly visits with preventive maintenance.",
      monthly_base_price: 649,
      inspection_frequency: "biweekly",
      features: [
        "Bi-weekly 45 minute visits",
        "Everything in Essential, plus:",
        "Run all water fixtures (prevents stagnation)",
        "Flush toilets, run dishwasher/washing machine",
        "HVAC filter replacement included",
        "Smoke/CO detector battery maintenance",
        "Detailed under-sink inspections",
        "Seasonal prep (hurricane, irrigation)"
      ]
    },
    3: {
      name: "Luxury Care", 
      description: "Complete estate management - weekly comprehensive care, always ready.",
      monthly_base_price: 1199,
      inspection_frequency: "weekly",
      features: [
        "Weekly 60+ minute visits",
        "Everything in Premium, plus:",
        "Test ALL appliances and systems",
        "Outlet and electrical testing",
        "Quarterly attic/crawlspace inspection",
        "Pre-arrival preparation services",
        "Post-departure securing",
        "Custom checklist for your property"
      ]
    }
  };
  
  for (const plan of plans) {
    if (updates[plan.tier_level]) {
      const result = await patchPlan(plan.id, updates[plan.tier_level]);
      console.log(`Updated ${result.name}: $${result.monthly_base_price}/mo`);
    }
  }
}

main().catch(console.error);
