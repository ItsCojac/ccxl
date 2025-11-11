const fs = require('fs-extra');
const path = require('path');
const { getChalk } = require('./imports');
const { validateSettings } = require('./validation');

/**
 * Update mechanism for Claude Code setup
 */

const CURRENT_VERSION = '2.0.0';

/**
 * Check if setup needs updating
 */
async function checkForUpdates(projectPath) {
  const settingsPath = path.join(projectPath, '.claude', 'settings.json');
  
  if (!await fs.pathExists(settingsPath)) {
    return {
      needsUpdate: false,
      reason: 'No existing setup found'
    };
  }

  try {
    const settings = await fs.readJson(settingsPath);
    
    // Check version
    if (!settings.version || settings.version !== CURRENT_VERSION) {
      return {
        needsUpdate: true,
        reason: `Version mismatch: ${settings.version || 'unknown'} → ${CURRENT_VERSION}`,
        currentVersion: settings.version || 'unknown',
        targetVersion: CURRENT_VERSION
      };
    }

    // Check if settings are valid
    const validation = validateSettings(settings);
    if (!validation.success) {
      return {
        needsUpdate: true,
        reason: 'Settings validation failed',
        validationErrors: validation.errors
      };
    }

    // Check if required fields are missing
    const requiredFields = ['name', 'permissions', 'rules'];
    const missingFields = requiredFields.filter(field => !settings[field]);
    
    if (missingFields.length > 0) {
      return {
        needsUpdate: true,
        reason: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    return {
      needsUpdate: false,
      reason: 'Setup is up to date'
    };

  } catch (error) {
    return {
      needsUpdate: true,
      reason: `Settings file is corrupted: ${error.message}`
    };
  }
}

/**
 * Perform update of existing setup
 */
async function performUpdate(projectPath, analysis, options = {}) {
  const chalk = await getChalk();
  const updateInfo = await checkForUpdates(projectPath);

  if (!updateInfo.needsUpdate) {
    console.log(chalk.green('✅ Setup is already up to date!'));
    return;
  }

  console.log(chalk.yellow(`🔄 Update needed: ${updateInfo.reason}`));

  // Backup existing settings
  const settingsPath = path.join(projectPath, '.claude', 'settings.json');
  const backupPath = path.join(projectPath, '.claude', `settings.backup.${Date.now()}.json`);
  
  if (await fs.pathExists(settingsPath)) {
    await fs.copy(settingsPath, backupPath);
    console.log(chalk.gray(`📦 Backup created: ${path.basename(backupPath)}`));
  }

  // Preserve user customizations
  let existingSettings = {};
  try {
    if (await fs.pathExists(settingsPath)) {
      existingSettings = await fs.readJson(settingsPath);
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not read existing settings, starting fresh'));
  }

  // Generate new settings
  const { generateSettings } = require('./generators/settings');
  const newSettings = generateSettings(analysis, options);

  // Merge with preserved customizations
  const updatedSettings = {
    ...newSettings,
    // Preserve custom instructions if they exist
    customInstructions: existingSettings.customInstructions || newSettings.customInstructions,
    // Update version and timestamp
    version: CURRENT_VERSION,
    lastUpdated: new Date().toISOString(),
    // Preserve creation date if it exists
    created: existingSettings.created || newSettings.created
  };

  // Write updated settings
  await fs.writeJson(settingsPath, updatedSettings, { spaces: 2 });
  
  console.log(chalk.green('✅ Settings updated successfully!'));
  
  if (updateInfo.currentVersion && updateInfo.targetVersion) {
    console.log(chalk.gray(`   ${updateInfo.currentVersion} → ${updateInfo.targetVersion}`));
  }

  return {
    updated: true,
    backupPath,
    changes: updateInfo.reason
  };
}

/**
 * Get update status for display
 */
async function getUpdateStatus(projectPath) {
  const updateInfo = await checkForUpdates(projectPath);
  
  return {
    isUpToDate: !updateInfo.needsUpdate,
    version: CURRENT_VERSION,
    reason: updateInfo.reason,
    needsUpdate: updateInfo.needsUpdate
  };
}

module.exports = {
  checkForUpdates,
  performUpdate,
  getUpdateStatus,
  CURRENT_VERSION
};
