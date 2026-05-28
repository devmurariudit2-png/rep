#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// 1. Load .env.local if present
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    // Match line syntax (e.g., KEY=VALUE)
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || "";
      // Trim quotes
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      val = val.trim();

      // Load values into process environment
      if (key && val) {
        process.env[key] = val;
      }
    }
  });
}

// 2. Ensure Supabase URL mapping exists
if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
}

// 3. Ensure Service Role Key mapping exists
if (!process.env.SUPABASE_SERVICE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// 4. Validate credentials
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error("Error: Supabase credentials not found!");
  console.error("Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env.local file.");
  process.exit(1);
}

// 5. Spawn the Supabase MCP Server process using stdio
const command = "npx";
const args = ["-y", "@supabase/mcp-server-supabase@latest"];

// Prepend the directory containing the node executable to PATH
const nodeBinDir = path.dirname(process.execPath);
if (!process.env.PATH.includes(nodeBinDir)) {
  process.env.PATH = `${nodeBinDir}:${process.env.PATH}`;
}

const mcpServer = spawn(command, args, {
  stdio: "inherit",
  shell: true,
  env: process.env
});

mcpServer.on("close", (code) => {
  process.exit(code || 0);
});
