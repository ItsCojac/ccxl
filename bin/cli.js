#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { setupClaude } = require('../lib/setup');
const { analyzeProject } = require('../lib/analyzer');
const { detectExisting } = require('../lib/detector');

const program = new Command();

program
  .name('claude-setup')
  .description('Intelligent Claude Code setup for any project')
  .version('1.0.0')
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

  // Handle quiet mode
  if (!options.quiet) {
    console.log(chalk.blue.bold('🤖 Claude Setup - Intelligent Project Configuration\n'));
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
    console.error(chalk.red.bold('\n❌ Setup failed:'), error.message);
    if (options.dev || options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
