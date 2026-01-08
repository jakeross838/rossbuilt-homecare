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

async function patchPlan(id, features) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ features });
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
  
  for (const plan of plans) {
    let features;
    if (plan.tier_level === 1) {
      features = [
        "Monthly property inspection",
        "Photo documentation",
        "Issue identification & reporting",
        "Maintenance coordination",
        "Minor tasks during inspections"
      ];
    } else if (plan.tier_level === 2) {
      features = [
        "Bi-weekly property inspections",
        "Photo documentation",
        "Issue identification & reporting",
        "Maintenance coordination",
        "Minor tasks during inspections",
        "Storm preparation & response",
        "Priority scheduling"
      ];
    } else if (plan.tier_level === 3) {
      features = [
        "Weekly property inspections",
        "Photo documentation",
        "Issue identification & reporting",
        "Maintenance coordination",
        "Minor tasks during inspections",
        "Storm preparation & response",
        "Priority scheduling",
        "Dedicated property manager",
        "Direct line communication"
      ];
    }
    
    if (features) {
      const result = await patchPlan(plan.id, features);
      console.log(`Updated ${plan.name}:`, result.features);
    }
  }
}

main().catch(console.error);
