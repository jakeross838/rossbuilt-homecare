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

async function patchPlan(id, description) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ description });
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/plans/${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
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
  
  const descriptions = {
    1: "Basic property oversight - monthly inspections and maintenance coordination.",
    2: "Enhanced care for vacation homes - bi-weekly inspections with priority service.",
    3: "Complete property management - weekly inspections with dedicated manager."
  };
  
  for (const plan of plans) {
    if (descriptions[plan.tier_level]) {
      const result = await patchPlan(plan.id, descriptions[plan.tier_level]);
      console.log(`Updated ${plan.name}: ${result.description}`);
    }
  }
}

main().catch(console.error);
