#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFilePath = path.join(__dirname, '../apps/admin/public/version.json');

// Read current version
const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));

// Increment build number
versionData.build += 1;

// Update timestamp
versionData.lastUpdated = new Date().toISOString();

// Add changelog entry if message is provided
const message = process.argv[2];
if (message) {
  if (!versionData.changelog) {
    versionData.changelog = [];
  }
  versionData.changelog.unshift({
    version: versionData.version,
    build: versionData.build,
    message: message,
    timestamp: versionData.lastUpdated
  });

  // Keep only last 20 changelog entries
  versionData.changelog = versionData.changelog.slice(0, 20);
}

// Write updated version
fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2) + '\n');

console.log(`✓ Version updated: v${versionData.version} (Build ${versionData.build})`);
if (message) {
  console.log(`  Message: ${message}`);
}
