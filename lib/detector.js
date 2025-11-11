const fs = require('fs-extra');
const path = require('path');

/**
 * Detects existing Claude setup in a project
 */
async function detectExisting(projectPath) {
  const detection = {
    hasSetup: false,
    hasClaude: false,
    hasClaudeSettings: false,
    hasClaudeMd: false,
    hasDocs: false,
    version: null,
    needsUpdate: false,
    conflicts: []
  };

  try {
    // Check for .claude directory
    const claudeDir = path.join(projectPath, '.claude');
    if (await fs.pathExists(claudeDir)) {
      detection.hasClaude = true;
      detection.hasSetup = true;

      // Check for settings
      const settingsPath = path.join(claudeDir, 'settings.json');
      if (await fs.pathExists(settingsPath)) {
        detection.hasClaudeSettings = true;
        
        try {
          const settings = await fs.readJson(settingsPath);
          detection.version = settings.version || 'unknown';
        } catch (error) {
          detection.conflicts.push('Invalid settings.json format');
        }
      }

      // Check for commands
      const commandsDir = path.join(claudeDir, 'commands');
      if (await fs.pathExists(commandsDir)) {
        const commands = await fs.readdir(commandsDir);
        detection.hasCommands = commands.length > 0;
      }
    }

    // Check for CLAUDE.md
    const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
    if (await fs.pathExists(claudeMdPath)) {
      detection.hasClaudeMd = true;
      detection.hasSetup = true;

      // Check if it's empty or template
      const content = await fs.readFile(claudeMdPath, 'utf-8');
      if (content.trim().length < 100 || content.includes('[Your Project Name]')) {
        detection.needsUpdate = true;
      }
    }

    // Check for documentation
    const docsDir = path.join(projectPath, 'docs');
    if (await fs.pathExists(docsDir)) {
      detection.hasDocs = true;
      
      // Check for parsed docs
      const parsedDocsPath = path.join(docsDir, 'parsed-docs.md');
      if (await fs.pathExists(parsedDocsPath)) {
        const stats = await fs.stat(parsedDocsPath);
        const daysSinceUpdate = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceUpdate > 7) {
          detection.needsUpdate = true;
        }
      }
    }

    // Check for conflicting setups
    await checkForConflicts(projectPath, detection);

  } catch (error) {
    console.warn('Detection error:', error.message);
  }

  return detection;
}

async function checkForConflicts(projectPath, detection) {
  // Check for old script files that might conflict
  const oldScripts = [
    'scripts/fetch-docs.js',
    'scripts/extract-content.js',
    'scripts/fetch-docs.sh',
    'scripts/update-docs.sh'
  ];

  for (const script of oldScripts) {
    const scriptPath = path.join(projectPath, script);
    if (await fs.pathExists(scriptPath)) {
      detection.conflicts.push(`Old script found: ${script}`);
    }
  }

  // Check for incomplete setups
  if (detection.hasClaude && !detection.hasClaudeSettings) {
    detection.conflicts.push('Incomplete .claude setup (missing settings.json)');
  }

  if (detection.hasClaudeMd) {
    const content = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
    if (content.includes('<!-- Brief description of project purpose')) {
      detection.conflicts.push('CLAUDE.md contains template placeholders');
    }
  }
}

/**
 * Determines what actions need to be taken based on existing setup
 */
function planActions(existing, analysis, options = {}) {
  const actions = [];

  // Handle specific-only flags
  if (options.docsOnly) {
    if (analysis.frameworks.length > 0) {
      actions.push({ 
        type: 'fetch', 
        target: 'documentation', 
        frameworks: analysis.frameworks 
      });
    }
    return actions;
  }

  if (options.commandsOnly) {
    actions.push({ type: 'update', target: 'commands' });
    return actions;
  }

  if (options.settingsOnly) {
    actions.push({ type: 'create', target: 'settings' });
    return actions;
  }

  // Normal setup logic
  if (!existing.hasSetup || options.reset) {
    actions.push({ type: 'create', target: 'full-setup' });
  } else {
    if (existing.needsUpdate || options.update) {
      actions.push({ type: 'update', target: 'configuration' });
    }
    
    if (!existing.hasClaudeSettings) {
      actions.push({ type: 'create', target: 'settings' });
    }
    
    if (!existing.hasClaudeMd || existing.conflicts.includes('CLAUDE.md contains template placeholders')) {
      actions.push({ type: 'generate', target: 'claude-md' });
    }
    
    if (existing.conflicts.length > 0) {
      actions.push({ type: 'resolve', target: 'conflicts', conflicts: existing.conflicts });
    }
  }

  // Documentation actions based on analysis (unless --no-docs)
  if (!options.noDocs && analysis.frameworks.length > 0) {
    actions.push({ 
      type: 'fetch', 
      target: 'documentation', 
      frameworks: analysis.frameworks 
    });
  }

  return actions;
}

module.exports = {
  detectExisting,
  checkForConflicts,
  planActions
};
