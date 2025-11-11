const fs = require('fs-extra');
const path = require('path');
const { getChalk, getOra, getInquirer, spinner } = require('./imports');

const { planActions } = require('./detector');
const { generateClaudeMd } = require('./generators/claude-md');
const { generateSettings } = require('./generators/settings');
const { fetchDocumentation } = require('./documentation');
const { performUpdate, checkForUpdates } = require('./updater');

/**
 * Main setup function that orchestrates the entire Claude setup process
 */
async function setupClaude(projectPath, analysis, existing, options = {}) {
  // Load ESM modules
  const chalk = await getChalk();
  const inquirer = await getInquirer();

  // Handle update mode
  if (options.update) {
    return await performUpdate(projectPath, analysis, options);
  }

  // Check if update is recommended
  if (existing.hasSetup && !options.reset) {
    const updateInfo = await checkForUpdates(projectPath);
    if (updateInfo.needsUpdate && !options.yes) {
      console.log(chalk.yellow(`⚠️  ${updateInfo.reason}`));
      const shouldUpdate = await inquirer.confirm({
        message: 'Would you like to update your setup?',
        default: true
      });
      
      if (shouldUpdate) {
        return await performUpdate(projectPath, analysis, options);
      }
    }
  }

  console.log(chalk.blue('\n📋 Planning setup actions...'));
  
  const actions = planActions(existing, analysis, options);
  
  if (actions.length === 0) {
    console.log(chalk.green('✅ Project is already optimally configured!'));
    return;
  }

  // Show what will be done
  console.log(chalk.yellow('\n🔧 Planned actions:'));
  actions.forEach(action => {
    console.log(chalk.gray(`  • ${formatAction(action)}`));
  });

  // Confirm with user unless in non-interactive mode
  if (!options.yes && !options.docsOnly) {
    const proceed = await inquirer.confirm({
      message: 'Proceed with setup?',
      default: true
    });

    if (!proceed) {
      console.log(chalk.yellow('Setup cancelled.'));
      return;
    }
  }

  // Handle reset flag - remove existing .claude directory
  if (options.reset) {
    const claudeDir = path.join(projectPath, '.claude');
    if (await fs.pathExists(claudeDir)) {
      console.log(chalk.yellow('🗑️  Removing existing .claude directory...'));
      await fs.remove(claudeDir);
    }
  }

  // Execute actions
  for (const action of actions) {
    await executeAction(projectPath, action, analysis, options);
  }

  console.log(chalk.green('\n🎉 Setup complete!'));
  await showNextSteps(analysis);
}

function formatAction(action) {
  switch (action.type) {
    case 'create':
      return `Create ${action.target}`;
    case 'update':
      return `Update ${action.target}`;
    case 'generate':
      return `Generate ${action.target}`;
    case 'fetch':
      return `Fetch ${action.target} for ${action.frameworks?.join(', ') || 'project'}`;
    case 'resolve':
      return `Resolve conflicts: ${action.conflicts?.join(', ')}`;
    default:
      return `${action.type} ${action.target}`;
  }
}

async function executeAction(projectPath, action, analysis, options) {
  const spin = await spinner(`${formatAction(action)}...`);
  spin.start();

  try {
    switch (action.type) {
      case 'create':
        if (action.target === 'full-setup') {
          await createFullSetup(projectPath, analysis, options);
        } else if (action.target === 'settings') {
          await createSettings(projectPath, analysis, options);
        }
        break;

      case 'generate':
        if (action.target === 'claude-md') {
          await generateProjectClaudeMd(projectPath, analysis);
        }
        break;

      case 'fetch':
        if (action.target === 'documentation') {
          await fetchProjectDocumentation(projectPath, action.frameworks, options);
        }
        break;

      case 'resolve':
        await resolveConflicts(projectPath, action.conflicts);
        break;

      case 'update':
        await updateConfiguration(projectPath, analysis, options);
        break;
    }

    spin.succeed(`${formatAction(action)} completed`);
  } catch (error) {
    spin.fail(`${formatAction(action)} failed: ${error.message}`);
    throw error;
  }
}

async function createFullSetup(projectPath, analysis, options = {}) {
  // Create .claude directory structure
  const claudeDir = path.join(projectPath, '.claude');
  await fs.ensureDir(claudeDir);
  await fs.ensureDir(path.join(claudeDir, 'commands'));

  // Create settings
  await createSettings(projectPath, analysis, options);

  // Copy command templates
  await copyCommandTemplates(projectPath);

  // Generate CLAUDE.md
  await generateProjectClaudeMd(projectPath, analysis);

  // Create docs directory
  await fs.ensureDir(path.join(projectPath, 'docs'));
}

async function createSettings(projectPath, analysis, options = {}) {
  const chalk = await getChalk();
  const settings = generateSettings(analysis, options);
  const claudeDir = path.join(projectPath, '.claude');
  await fs.ensureDir(claudeDir);
  const settingsPath = path.join(claudeDir, 'settings.json');
  await fs.writeJson(settingsPath, settings, { spaces: 2 });

  // Only create local settings template if it doesn't exist (preserve existing user settings)
  const localSettingsPath = path.join(projectPath, '.claude', 'settings.local.json');
  if (!await fs.pathExists(localSettingsPath)) {
    const templatePath = path.join(__dirname, '../templates/settings.local.json');
    if (await fs.pathExists(templatePath)) {
      await fs.copy(templatePath, localSettingsPath);
      console.log(chalk.gray('  📝 Created settings.local.json template (customize for your dangerous permissions)'));
    }
  } else {
    console.log(chalk.gray('  ✅ Preserving existing settings.local.json'));
  }
}

async function generateProjectClaudeMd(projectPath, analysis) {
  const claudeMd = await generateClaudeMd(analysis, projectPath);
  const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
  await fs.writeFile(claudeMdPath, claudeMd, 'utf-8');
}

async function fetchProjectDocumentation(projectPath, frameworks, options) {
  if (options.docsOnly || frameworks.length > 0) {
    await fetchDocumentation(projectPath, frameworks, options);
  }
}

async function resolveConflicts(projectPath, conflicts) {
  for (const conflict of conflicts) {
    if (conflict.startsWith('Old script found:')) {
      const scriptPath = conflict.replace('Old script found: ', '');
      const fullPath = path.join(projectPath, scriptPath);
      
      // Move old scripts to backup
      const backupPath = path.join(projectPath, 'scripts', 'backup', path.basename(scriptPath));
      await fs.ensureDir(path.dirname(backupPath));
      await fs.move(fullPath, backupPath);
    }
  }
}

async function updateConfiguration(projectPath, analysis, options = {}) {
  // Update settings if needed
  const settingsPath = path.join(projectPath, '.claude', 'settings.json');
  if (await fs.pathExists(settingsPath)) {
    const currentSettings = await fs.readJson(settingsPath);
    const newSettings = generateSettings(analysis, options);
    
    // Merge settings, preserving user customizations
    const mergedSettings = {
      ...newSettings,
      ...currentSettings,
      version: newSettings.version // Always update version
    };
    
    await fs.writeJson(settingsPath, mergedSettings, { spaces: 2 });
  }
}

async function showNextSteps(analysis) {
  const chalk = await getChalk();
  console.log(chalk.blue('\n📚 Next steps:'));
  console.log(chalk.gray('  • Review the generated CLAUDE.md file'));
  console.log(chalk.gray('  • Customize .claude/settings.local.json if needed'));

  if (analysis.frameworks.length > 0) {
    console.log(chalk.gray('  • Check docs/ directory for fetched documentation'));
  }

  console.log(chalk.gray('  • Start coding with Claude!'));
}

async function copyCommandTemplates(projectPath) {
  const commandsDir = path.join(projectPath, '.claude', 'commands');
  const templateDir = path.join(__dirname, '../.claude/commands');
  
  // Copy command templates from our template directory
  const templates = [
    'generate-tests.md', 
    'plan-feature.md', 
    'review-code.md',
    'fix-github-issue.md',
    'debug-logs.md',
    'refactor-code.md'
  ];
  
  for (const template of templates) {
    const sourcePath = path.join(templateDir, template);
    const targetPath = path.join(commandsDir, template);
    
    // Only copy if target doesn't exist (preserve user customizations)
    if (!await fs.pathExists(targetPath) && await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, targetPath);
    }
  }
}

module.exports = {
  setupClaude,
  executeAction,
  createFullSetup,
  createSettings,
  generateProjectClaudeMd,
  fetchProjectDocumentation,
  copyCommandTemplates
};
