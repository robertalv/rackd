#!/usr/bin/env node

/**
 * Script to automatically increment build number and update version
 * This runs before EAS builds to ensure each build has a unique version
 */

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '../app.json');
const packageJsonPath = path.join(__dirname, '../package.json');

function updateVersion() {
  // Read app.json
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Get current version from app.json
  const currentVersion = appJson.expo.version || '1.0.0';
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  // Get build number (iOS) or versionCode (Android)
  const currentIosBuildNumber = parseInt(appJson.expo.ios?.buildNumber || '1', 10);
  const currentAndroidVersionCode = parseInt(appJson.expo.android?.versionCode || '1', 10);

  // Increment build numbers
  const newIosBuildNumber = currentIosBuildNumber + 1;
  const newAndroidVersionCode = currentAndroidVersionCode + 1;

  // Update app.json
  appJson.expo.ios = {
    ...appJson.expo.ios,
    buildNumber: String(newIosBuildNumber),
  };

  appJson.expo.android = {
    ...appJson.expo.android,
    versionCode: newAndroidVersionCode,
  };

  // Update package.json version to match app.json
  packageJson.version = currentVersion;

  // Write updated files
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(`✅ Updated build numbers:`);
  console.log(`   iOS buildNumber: ${currentIosBuildNumber} → ${newIosBuildNumber}`);
  console.log(`   Android versionCode: ${currentAndroidVersionCode} → ${newAndroidVersionCode}`);
  console.log(`   Version: ${currentVersion}`);
}

try {
  updateVersion();
} catch (error) {
  console.error('❌ Error updating version:', error);
  process.exit(1);
}

