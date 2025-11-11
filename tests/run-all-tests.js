#!/usr/bin/env node

/**
 * Comprehensive test runner for claude-setup
 */

const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      manual: null,
      realWorld: null
    };
  }

  async runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      console.log(chalk.gray(`   Running: ${command} ${args.join(' ')}`));
      
      const child = spawn(command, args, {
        stdio: options.silent ? 'pipe' : 'inherit',
        cwd: options.cwd || process.cwd(),
        ...options
      });

      let stdout = '';
      let stderr = '';

      if (options.silent) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      child.on('error', reject);
    });
  }

  async runUnitTests() {
    console.log(chalk.blue.bold('\n🧪 Running Unit Tests'));
    console.log(chalk.gray('Testing individual components and functions...\n'));

    try {
      const result = await this.runCommand('npx', ['jest', 'tests/unit', '--verbose'], {
        cwd: path.join(__dirname, '..')
      });

      this.results.unit = {
        success: result.code === 0,
        output: result.stdout || 'See output above'
      };

      if (result.code === 0) {
        console.log(chalk.green('\n✅ Unit tests passed!'));
      } else {
        console.log(chalk.red('\n❌ Unit tests failed!'));
      }

    } catch (error) {
      console.log(chalk.red(`\n💥 Unit tests crashed: ${error.message}`));
      this.results.unit = { success: false, error: error.message };
    }
  }

  async runIntegrationTests() {
    console.log(chalk.blue.bold('\n🔗 Running Integration Tests'));
    console.log(chalk.gray('Testing full workflows and CLI integration...\n'));

    try {
      const result = await this.runCommand('npx', ['jest', 'tests/integration', '--verbose', '--testTimeout=30000'], {
        cwd: path.join(__dirname, '..')
      });

      this.results.integration = {
        success: result.code === 0,
        output: result.stdout || 'See output above'
      };

      if (result.code === 0) {
        console.log(chalk.green('\n✅ Integration tests passed!'));
      } else {
        console.log(chalk.red('\n❌ Integration tests failed!'));
      }

    } catch (error) {
      console.log(chalk.red(`\n💥 Integration tests crashed: ${error.message}`));
      this.results.integration = { success: false, error: error.message };
    }
  }

  async runManualTests() {
    console.log(chalk.blue.bold('\n🎯 Running Manual Test Matrix'));
    console.log(chalk.gray('Testing all CLI flag combinations systematically...\n'));

    try {
      const result = await this.runCommand('node', ['tests/manual/test-matrix.js'], {
        cwd: path.join(__dirname, '..'),
        silent: false
      });

      this.results.manual = {
        success: result.code === 0,
        output: 'See detailed output above'
      };

      if (result.code === 0) {
        console.log(chalk.green('\n✅ Manual tests completed!'));
      } else {
        console.log(chalk.red('\n❌ Some manual tests failed!'));
      }

    } catch (error) {
      console.log(chalk.red(`\n💥 Manual tests crashed: ${error.message}`));
      this.results.manual = { success: false, error: error.message };
    }
  }

  async runRealWorldTests() {
    console.log(chalk.blue.bold('\n🌍 Running Real-World Tests'));
    console.log(chalk.gray('Testing against actual project repositories...\n'));
    console.log(chalk.yellow('⚠️  This may take several minutes and requires internet access'));

    try {
      const result = await this.runCommand('node', ['tests/manual/real-world-test.js'], {
        cwd: path.join(__dirname, '..'),
        silent: false
      });

      this.results.realWorld = {
        success: result.code === 0,
        output: 'See detailed output above'
      };

      if (result.code === 0) {
        console.log(chalk.green('\n✅ Real-world tests completed!'));
      } else {
        console.log(chalk.red('\n❌ Some real-world tests failed!'));
      }

    } catch (error) {
      console.log(chalk.red(`\n💥 Real-world tests crashed: ${error.message}`));
      this.results.realWorld = { success: false, error: error.message };
    }
  }

  async runSafetyAudit() {
    console.log(chalk.blue.bold('\n🔒 Running Safety Audit'));
    console.log(chalk.gray('Verifying all generated permissions are safe...\n'));

    try {
      // Test permission generation for different project types
      const { generateSettings } = require('../lib/generators/settings');
      const { validatePermissionsSafety } = require('./helpers/validators');

      const testCases = [
        { type: 'javascript', frameworks: ['react'], languages: ['javascript'] },
        { type: 'python', frameworks: ['django'], languages: ['python'] },
        { type: 'go', frameworks: [], languages: ['go'] },
        { type: 'mixed', frameworks: ['react', 'express'], languages: ['javascript', 'python'] }
      ];

      let allSafe = true;
      const unsafeResults = [];

      for (const testCase of testCases) {
        const analysis = {
          ...testCase,
          dependencies: {},
          structure: {},
          packageManager: 'npm'
        };

        // Test normal settings
        const normalSettings = generateSettings(analysis);
        const normalUnsafe = validatePermissionsSafety(normalSettings.permissions.allow);
        
        // Test with include-destructive
        const destructiveSettings = generateSettings(analysis, { includeDestructive: true });
        const destructiveUnsafe = validatePermissionsSafety(destructiveSettings.permissions.allow);

        if (normalUnsafe.length > 0) {
          allSafe = false;
          unsafeResults.push({
            type: testCase.type,
            mode: 'normal',
            unsafe: normalUnsafe
          });
        }

        if (destructiveUnsafe.length > 0) {
          allSafe = false;
          unsafeResults.push({
            type: testCase.type,
            mode: 'destructive',
            unsafe: destructiveUnsafe
          });
        }

        console.log(chalk.gray(`   ${testCase.type}: Normal(${normalSettings.permissions.allow.length}) Destructive(${destructiveSettings.permissions.allow.length})`));
      }

      if (allSafe) {
        console.log(chalk.green('\n✅ All generated permissions are safe!'));
      } else {
        console.log(chalk.red('\n❌ Unsafe permissions detected:'));
        unsafeResults.forEach(result => {
          console.log(chalk.red(`   ${result.type} (${result.mode}): ${result.unsafe.join(', ')}`));
        });
      }

      this.results.safety = { success: allSafe, unsafeResults };

    } catch (error) {
      console.log(chalk.red(`\n💥 Safety audit crashed: ${error.message}`));
      this.results.safety = { success: false, error: error.message };
    }
  }

  async generateFinalReport() {
    console.log(chalk.blue.bold('\n📊 Final Test Report'));
    console.log('='.repeat(50));

    const categories = [
      { name: 'Unit Tests', key: 'unit', icon: '🧪' },
      { name: 'Integration Tests', key: 'integration', icon: '🔗' },
      { name: 'Manual Tests', key: 'manual', icon: '🎯' },
      { name: 'Real-World Tests', key: 'realWorld', icon: '🌍' },
      { name: 'Safety Audit', key: 'safety', icon: '🔒' }
    ];

    let overallSuccess = true;

    for (const category of categories) {
      const result = this.results[category.key];
      if (!result) {
        console.log(chalk.yellow(`${category.icon} ${category.name}: SKIPPED`));
        continue;
      }

      if (result.success) {
        console.log(chalk.green(`${category.icon} ${category.name}: PASSED`));
      } else {
        console.log(chalk.red(`${category.icon} ${category.name}: FAILED`));
        overallSuccess = false;
        if (result.error) {
          console.log(chalk.red(`   Error: ${result.error}`));
        }
      }
    }

    console.log('='.repeat(50));

    if (overallSuccess) {
      console.log(chalk.green.bold('\n🎉 ALL TESTS PASSED!'));
      console.log(chalk.green('Claude Setup is ready for production use.'));
    } else {
      console.log(chalk.red.bold('\n⚠️  SOME TESTS FAILED'));
      console.log(chalk.red('Please review the failures before deploying.'));
    }

    // Save comprehensive report
    const reportPath = path.join(__dirname, 'results/comprehensive-test-report.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, {
      timestamp: new Date().toISOString(),
      overallSuccess,
      results: this.results
    }, { spaces: 2 });

    console.log(chalk.gray(`\n📄 Comprehensive report saved to: ${reportPath}`));

    return overallSuccess;
  }

  async runAll(options = {}) {
    console.log(chalk.blue.bold('🚀 Claude Setup - Comprehensive Test Suite'));
    console.log(chalk.gray('Testing all components, integrations, and real-world scenarios\n'));

    const startTime = Date.now();

    // Run test suites
    if (!options.skipUnit) await this.runUnitTests();
    if (!options.skipIntegration) await this.runIntegrationTests();
    if (!options.skipManual) await this.runManualTests();
    if (!options.skipRealWorld && !options.fast) await this.runRealWorldTests();
    if (!options.skipSafety) await this.runSafetyAudit();

    const duration = Date.now() - startTime;
    console.log(chalk.gray(`\n⏱️  Total test duration: ${Math.round(duration / 1000)}s`));

    return await this.generateFinalReport();
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    fast: args.includes('--fast'),
    skipUnit: args.includes('--skip-unit'),
    skipIntegration: args.includes('--skip-integration'),
    skipManual: args.includes('--skip-manual'),
    skipRealWorld: args.includes('--skip-real-world'),
    skipSafety: args.includes('--skip-safety')
  };

  if (args.includes('--help')) {
    console.log(`
Usage: node run-all-tests.js [options]

Options:
  --fast              Skip time-consuming tests (real-world)
  --skip-unit         Skip unit tests
  --skip-integration  Skip integration tests
  --skip-manual       Skip manual test matrix
  --skip-real-world   Skip real-world repository tests
  --skip-safety       Skip safety audit
  --help              Show this help
    `);
    process.exit(0);
  }

  const runner = new TestRunner();
  runner.runAll(options)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(chalk.red.bold('\n💥 Test runner crashed:'), error);
      process.exit(1);
    });
}

module.exports = { TestRunner };
