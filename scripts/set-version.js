#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFilePath = path.join(__dirname, '../apps/admin/public/version.json');
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Error: Please provide a version number (e.g., 1.0.0)');
  process.exit(1);
}

// Validate version format (basic semver)
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Error: Version must be in format X.Y.Z (e.g., 1.0.0)');
  process.exit(1);
}

// Read current version
const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));

// Update version
const oldVersion = versionData.version;
versionData.version = newVersion;
versionData.lastUpdated = new Date().toISOString();

// Add changelog entry
if (!versionData.changelog) {
  versionData.changelog = [];
}
versionData.changelog.unshift({
  version: newVersion,
  build: versionData.build,
  message: `Version updated from ${oldVersion} to ${newVersion}`,
  timestamp: versionData.lastUpdated
});

// Keep only last 20 changelog entries
versionData.changelog = versionData.changelog.slice(0, 20);

// Write updated version
fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2) + '\n');

console.log(`✓ Version updated: ${oldVersion} → ${newVersion} (Build ${versionData.build})`);
