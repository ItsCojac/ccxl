#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const { getChalk, getOra } = require('../lib/imports');
const { setupClaude } = require('../lib/setup');
const { analyzeProject } = require('../lib/analyzer');
const { detectExisting } = require('../lib/detector');

const program = new Command();

program
  .name('ccxl')
  .description('ccxl (Claude Code XL) - Intelligent Claude Code setup for any project')
  .version('2.0.0-alpha.0')
  .option('-d, --dry-run', 'analyze without making changes')
  .option('-y, --yes', 'skip confirmation prompts')
  .option('-q, --quiet', 'minimal output (only errors and warnings)')
  .option('-v, --verbose', 'detailed output with debug information')
  .option('--docs-only', 'only fetch documentation')
  .option('--no-docs', 'skip documentation fetching')
  .option('--commands-only', 'only update command templates')
  .option('--settings-only', 'only update settings files')
  .option('--update', 'update existing setup')
  .option('--reset', 'start fresh (removes existing setup)')
  .option('--safe-only', 'only include ultra-safe permissions (read-only)')
  .option('--include-destructive', 'include some safe destructive operations in team settings')
  .option('--framework <frameworks>', 'force specific frameworks (comma-separated)', (value) => value.split(','))
  .option('--language <languages>', 'force specific languages (comma-separated)', (value) => value.split(','))
  .option('--output-dir <dir>', 'specify output directory (default: current directory)')
  .option('--config <file>', 'use custom configuration file')
  .option('--dev', 'development mode with verbose logging')
  .parse();

async function main() {
  const options = program.opts();
  const cwd = options.outputDir ? path.resolve(options.outputDir) : process.cwd();

  // Load ESM modules
  const chalk = await getChalk();
  const ora = await getOra();

  // Handle quiet mode
  if (!options.quiet) {
    console.log(chalk.blue.bold('🤖 ccxl v2 - Intelligent Claude Code Setup\n'));
  }

  try {
    // Load custom config if specified
    if (options.config) {
      const configPath = path.resolve(options.config);
      if (await fs.pathExists(configPath)) {
        const customConfig = await fs.readJson(configPath);
        Object.assign(options, customConfig);
        if (options.verbose) console.log(chalk.gray(`📄 Loaded config from ${configPath}`));
      } else {
        console.warn(chalk.yellow(`⚠️  Config file not found: ${configPath}`));
      }
    }

    // Analyze current project
    const spinner = options.quiet ? null : ora('Analyzing project...').start();
    const analysis = await analyzeProject(cwd);
    const existing = await detectExisting(cwd);

    // Override analysis with CLI flags
    if (options.framework) {
      analysis.frameworks = options.framework;
      if (options.verbose) console.log(chalk.gray(`🔧 Forced frameworks: ${options.framework.join(', ')}`));
    }
    if (options.language) {
      analysis.languages = options.language;
      if (options.verbose) console.log(chalk.gray(`🔧 Forced languages: ${options.language.join(', ')}`));
    }

    if (spinner) spinner.succeed(`Detected: ${analysis.type} project`);
    else if (!options.quiet) console.log(chalk.green(`✅ Detected: ${analysis.type} project`));

    if (options.dryRun) {
      console.log('\n📊 Project Analysis:');
      console.log(JSON.stringify(analysis, null, 2));
      console.log('\n🔍 Existing Setup:');
      console.log(JSON.stringify(existing, null, 2));
      if (options.framework || options.language) {
        console.log('\n🔧 CLI Overrides Applied');
      }
      return;
    }

    // Setup Claude configuration
    await setupClaude(cwd, analysis, existing, options);
    
    if (!options.quiet) {
      console.log(chalk.green.bold('\n✅ Claude setup complete!'));
      console.log(chalk.gray('Your project is now optimized for Claude Code.'));
    }

  } catch (error) {
    // Better error messages based on error type
    if (error.message.includes('Settings validation failed')) {
      console.error(chalk.red.bold('\n❌ Configuration Error:'));
      console.error(chalk.yellow('Invalid settings detected:'));
      console.error(error.message.replace('Settings validation failed:\n', ''));
      console.error(chalk.gray('\nPlease check your configuration and try again.'));
    } else if (error.code === 'ENOENT') {
      console.error(chalk.red.bold('\n❌ File Not Found:'));
      console.error(chalk.yellow(`Could not access: ${error.path || 'unknown file'}`));
      console.error(chalk.gray('Please check the file path and permissions.'));
    } else if (error.code === 'EACCES') {
      console.error(chalk.red.bold('\n❌ Permission Denied:'));
      console.error(chalk.yellow(`Access denied: ${error.path || 'unknown file'}`));
      console.error(chalk.gray('Please check file permissions or run with appropriate privileges.'));
    } else if (error.message.includes('Config file not found')) {
      console.error(chalk.red.bold('\n❌ Configuration File Error:'));
      console.error(chalk.yellow(error.message));
      console.error(chalk.gray('Continuing with default configuration...'));
      return; // Don't exit for missing config files
    } else {
      console.error(chalk.red.bold('\n❌ Setup failed:'), error.message);
    }
    
    if (options.dev || options.verbose) {
      console.error(chalk.gray('\n🔍 Debug information:'));
      console.error(error.stack);
    } else {
      console.error(chalk.gray('\nRun with --verbose for more details.'));
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
