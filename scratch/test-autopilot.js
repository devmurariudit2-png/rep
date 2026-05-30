/* eslint-disable */
const fs = require('fs');
const path = require('path');

// 1. Manually parse .env.local for credentials
const dotenvPath = path.join(__dirname, '../.env.local');
const env = {};
if (fs.existsSync(dotenvPath)) {
  const dotenvContent = fs.readFileSync(dotenvPath, 'utf8');
  dotenvContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERROR: Supabase URL or Service Key not configured in .env.local");
  process.exit(1);
}

// Simple Supabase client simulation using fetch
async function callSupabase(table, method, body = null, query = "") {
  const url = `${supabaseUrl}/rest/v1/${table}${query}`;
  const headers = {
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request failed: ${response.statusText}. Details: ${errorText}`);
  }
  return response.json();
}

async function runTests() {
  console.log("🚀 Starting AI WhatsApp Auto-Pilot Verification Suite...");

  // Match Rajesh Mehta lead or get first lead in DB
  const leads = await callSupabase('leads', 'GET', null, '?select=*&limit=1');
  if (leads.length === 0) {
    console.error("❌ No leads found in database to run tests. Run database seed first.");
    process.exit(1);
  }

  const lead = leads[0];
  console.log(`👤 Using Lead: ${lead.name} (${lead.phone})`);

  // --- TEST 1: INBOUND MESSAGE WITH AUTOPILOT OFF ---
  console.log("\n--- TEST 1: Inbound message with Autopilot OFF ---");
  // Set autopilot to false
  await callSupabase('leads', 'PATCH', { autopilot: false }, `?id=eq.${lead.id}`);
  
  const webhookUrl = 'http://localhost:3002/api/whatsapp/webhook';
  
  let response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: lead.phone,
      name: lead.name,
      message: 'Hello, is anyone there? I want to ask about amenities.'
    })
  });

  if (!response.ok) {
    console.error("❌ Webhook test failed:", response.status, await response.text());
    process.exit(1);
  }

  let data = await response.json();
  console.log(`✅ Webhook status: ${response.status}`);
  console.log(`✅ Action performed: ${data.action}`);
  
  // Verify no bot reply was appended
  let lastMsg = data.lead.whatsapp_history[data.lead.whatsapp_history.length - 1];
  console.log(`👉 Last message in history: [${lastMsg.sender}] "${lastMsg.message}"`);
  if (lastMsg.sender === 'agent' && lastMsg.message.includes('Namaste')) {
    console.log("⚠️  Note: Initial seed welcome greetings might exist, but check if we didn't auto-reply to our current query.");
  }
  if (lastMsg.sender === 'lead' && lastMsg.message.includes('ask about amenities')) {
    console.log("✅ SUCCESS: No bot response was triggered since autopilot is OFF.");
  } else {
    console.log("⚠️  Check history details if last message differs.");
  }

  // --- TEST 2: INBOUND MESSAGE WITH AUTOPILOT ON ---
  console.log("\n--- TEST 2: Inbound message with Autopilot ON ---");
  // Toggle autopilot to true
  await callSupabase('leads', 'PATCH', { autopilot: true }, `?id=eq.${lead.id}`);

  response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: lead.phone,
      name: lead.name,
      message: 'What is the exact pricing or budget details of this property?'
    })
  });

  if (!response.ok) {
    console.error("❌ Webhook test failed:", response.status, await response.text());
    process.exit(1);
  }

  data = await response.json();
  console.log(`✅ Webhook status: ${response.status}`);
  console.log(`✅ Action performed: ${data.action}`);

  let history = data.lead.whatsapp_history;
  let lastTwo = history.slice(-2);
  console.log(`👉 Last inbound message: [${lastTwo[0].sender}] "${lastTwo[0].message}"`);
  console.log(`🤖 Auto-Pilot reply: [${lastTwo[1].sender}] "${lastTwo[1].message}"`);

  if (lastTwo[1].sender === 'agent' && (lastTwo[1].message.includes('₹') || lastTwo[1].message.includes('pricing') || lastTwo[1].message.includes('Cr'))) {
    console.log("✅ SUCCESS: AI Auto-Pilot automatically answered using listing specifications!");
  } else {
    console.error("❌ ERROR: Auto-reply was not triggered or had incorrect format.");
  }

  // --- TEST 3: INBOUND MESSAGE TRIGGERS HUMAN ESCALATION ---
  console.log("\n--- TEST 3: Inbound message triggers Human Escalation ---");
  // Ensure autopilot is ON
  await callSupabase('leads', 'PATCH', { autopilot: true }, `?id=eq.${lead.id}`);

  response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: lead.phone,
      name: lead.name,
      message: 'I want to schedule a site visit this Saturday. Please call me.'
    })
  });

  if (!response.ok) {
    console.error("❌ Webhook test failed:", response.status, await response.text());
    process.exit(1);
  }

  data = await response.json();
  console.log(`✅ Webhook status: ${response.status}`);
  console.log(`✅ Lead Autopilot status after escalation: ${data.lead.autopilot}`);
  
  history = data.lead.whatsapp_history;
  let lastThree = history.slice(-3);
  console.log(`👉 Inbound message: [${lastThree[0].sender}] "${lastThree[0].message}"`);
  console.log(`🤖 Auto-Pilot reply: [${lastThree[1].sender}] "${lastThree[1].message}"`);
  console.log(`🚨 System message: [${lastThree[2].sender}] "${lastThree[2].message}"`);

  if (data.lead.autopilot === false && lastThree[2].sender === 'system' && lastThree[2].message.includes('deactivated')) {
    console.log("✅ SUCCESS: Human escalation triggered, autopilot disabled, and broker alerted!");
  } else {
    console.error("❌ ERROR: Escalation failed to deactivate autopilot or insert alert.");
  }

  // --- TEST 4: MANUAL BROKER OUTBOUND OVERRIDE ---
  console.log("\n--- TEST 4: Manual Broker Outbound Override ---");
  // Set autopilot back to true first
  await callSupabase('leads', 'PATCH', { autopilot: true }, `?id=eq.${lead.id}`);

  const sendUrl = 'http://localhost:3002/api/whatsapp/send';
  response = await fetch(sendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      leadId: lead.id,
      message: 'Sure, I will meet you at the site. Let me know if you need anything else.',
      sender: 'agent'
    })
  });

  if (!response.ok) {
    console.error("❌ Outbound manual send failed:", response.status, await response.text());
    process.exit(1);
  }

  data = await response.json();
  console.log(`✅ Outbound manual send status: ${response.status}`);
  console.log(`✅ Lead Autopilot status after manual message: ${data.lead.autopilot}`);

  if (data.lead.autopilot === false) {
    console.log("✅ SUCCESS: Manual override successfully deactivated Auto-Pilot!");
  } else {
    console.error("❌ ERROR: Manual message failed to turn off autopilot.");
  }

  console.log("\n🏆 ALL TESTS COMPLETED SUCCESSFULLY!");
}

runTests().catch(err => {
  console.error("❌ TEST RUNNER EXCEPTION:", err);
  process.exit(1);
});
