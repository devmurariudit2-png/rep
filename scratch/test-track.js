/* eslint-disable */
const http = require('http');

const makeRequest = (path, method, payload = null) => {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const options = {
      hostname: 'localhost',
      port: 3002,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (data) {
      options.headers['Content-Length'] = data.length;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body.trim()
        });
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

async function main() {
  const leadId = '8d3cfb57-6fcb-4c4b-b0b9-3b91811e5ad1'; // Rajesh Mehta seed ID
  
  console.log(`\n--- Test 1: Fetching proposal details for Lead: ${leadId} ---`);
  try {
    const getRes = await makeRequest(`/api/proposals/${leadId}`, 'GET');
    console.log(`Status: ${getRes.statusCode}`);
    const parsedGet = JSON.parse(getRes.body);
    console.log('Lead info extracted:', parsedGet.lead);
    console.log('Property info matched:', parsedGet.property ? parsedGet.property.title : 'None');

    console.log(`\n--- Test 2: Simulating Client Open Tracking for Lead: ${leadId} ---`);
    const trackRes = await makeRequest(`/api/proposals/${leadId}/track`, 'POST');
    console.log(`Status: ${trackRes.statusCode}`);
    console.log('Response:', trackRes.body);

  } catch (err) {
    console.error('Testing encountered error:', err.message);
  }
}

main();
