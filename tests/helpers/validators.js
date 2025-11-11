const fs = require('fs-extra');
const path = require('path');

/**
 * Validation helpers for testing
 */

/**
 * Validate that a Claude setup is complete and correct
 */
async function validateClaudeSetup(projectPath) {
  const results = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check .claude directory exists
  const claudeDir = path.join(projectPath, '.claude');
  if (!await fs.pathExists(claudeDir)) {
    results.valid = false;
    results.errors.push('.claude directory missing');
    return results;
  }

  // Check settings.json
  const settingsPath = path.join(claudeDir, 'settings.json');
  if (!await fs.pathExists(settingsPath)) {
    results.valid = false;
    results.errors.push('settings.json missing');
  } else {
    try {
      const settings = await fs.readJson(settingsPath);
      if (!settings.permissions || !settings.permissions.allow) {
        results.errors.push('settings.json missing permissions structure');
        results.valid = false;
      }
      
      // Validate permissions are safe
      const unsafeCommands = validatePermissionsSafety(settings.permissions.allow);
      if (unsafeCommands.length > 0) {
        results.errors.push(`Unsafe commands found: ${unsafeCommands.join(', ')}`);
        results.valid = false;
      }
    } catch (error) {
      results.errors.push(`Invalid settings.json: ${error.message}`);
      results.valid = false;
    }
  }

  // Check CLAUDE.md
  const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
  if (!await fs.pathExists(claudeMdPath)) {
    results.warnings.push('CLAUDE.md missing');
  } else {
    const content = await fs.readFile(claudeMdPath, 'utf-8');
    if (content.includes('<!-- Brief description of project purpose')) {
      results.warnings.push('CLAUDE.md contains template placeholders');
    }
  }

  // Check commands directory
  const commandsDir = path.join(claudeDir, 'commands');
  if (!await fs.pathExists(commandsDir)) {
    results.warnings.push('commands directory missing');
  } else {
    const commands = await fs.readdir(commandsDir);
    if (commands.length === 0) {
      results.warnings.push('no command templates found');
    }
  }

  return results;
}

/**
 * Validate that permissions are safe (non-destructive)
 */
function validatePermissionsSafety(permissions) {
  const unsafeCommands = [];
  const dangerousPatterns = [
    /rm\s/,
    /rmdir\s/,
    /delete/i,
    /format/i,
    /dd\s/,
    /mkfs/,
    /fdisk/,
    /sudo/,
    /chmod.*\+x/,
    /chown/,
    /mv.*\/dev\//,
    />\s*\/dev/,
    /curl.*-X\s*(POST|PUT|DELETE)/i,
    /wget.*--post/i,
    /npm\s+install(?!\s+--dry-run)/,
    /pip\s+install(?!\s+--dry-run)/,
    /git\s+push/,
    /git\s+commit/,
    /docker\s+run/,
    /docker\s+exec/
  ];

  for (const permission of permissions) {
    for (const pattern of dangerousPatterns) {
      if (pattern.test(permission)) {
        unsafeCommands.push(permission);
        break;
      }
    }
  }

  return unsafeCommands;
}

/**
 * Validate project analysis results
 */
function validateAnalysis(analysis) {
  const required = ['type', 'frameworks', 'languages', 'dependencies', 'structure'];
  const missing = required.filter(field => !(field in analysis));
  
  return {
    valid: missing.length === 0,
    missing,
    hasFrameworks: analysis.frameworks && analysis.frameworks.length > 0,
    hasLanguages: analysis.languages && analysis.languages.length > 0
  };
}

/**
 * Validate CLI options parsing
 */
function validateCliOptions(options, expectedFlags) {
  const results = {
    valid: true,
    errors: []
  };

  for (const flag of expectedFlags) {
    if (!(flag in options)) {
      results.errors.push(`Missing flag: ${flag}`);
      results.valid = false;
    }
  }

  return results;
}

module.exports = {
  validateClaudeSetup,
  validatePermissionsSafety,
  validateAnalysis,
  validateCliOptions
};
