#!/usr/bin/env node

/**
 * Manual test matrix - systematically test all flag combinations
 */

const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class TestMatrix {
  constructor() {
    this.results = [];
    this.tempDirs = [];
  }

  async createTestProject(type = 'react') {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-test-'));
    this.tempDirs.push(tempDir);

    // Create basic project structure
    switch (type) {
      case 'react':
        await fs.writeJson(path.join(tempDir, 'package.json'), {
          dependencies: { react: '^18.0.0' },
          devDependencies: { typescript: '^5.0.0' }
        });
        break;
      case 'python':
        await fs.writeFile(path.join(tempDir, 'requirements.txt'), 'django==4.2.0');
        break;
      case 'go':
        await fs.writeFile(path.join(tempDir, 'go.mod'), 'module test\ngo 1.21');
        break;
      case 'empty':
        // No files
        break;
    }

    return tempDir;
  }

  async runTest(name, args, projectType = 'react') {
    console.log(chalk.blue(`\n🧪 Testing: ${name}`));
    console.log(chalk.gray(`   Args: ${args.join(' ')}`));

    const projectPath = await this.createTestProject(projectType);
    const startTime = Date.now();

    try {
      const result = await this.runCLI(args, projectPath);
      const duration = Date.now() - startTime;

      const testResult = {
        name,
        args,
        projectType,
        success: result.code === 0,
        duration,
        stdout: result.stdout,
        stderr: result.stderr,
        error: null
      };

      if (result.code === 0) {
        console.log(chalk.green(`   ✅ Passed (${duration}ms)`));
      } else {
        console.log(chalk.red(`   ❌ Failed (${duration}ms)`));
        console.log(chalk.red(`   Error: ${result.stderr}`));
      }

      this.results.push(testResult);
      return testResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(chalk.red(`   💥 Exception (${duration}ms): ${error.message}`));
      
      this.results.push({
        name,
        args,
        projectType,
        success: false,
        duration,
        error: error.message
      });
    }
  }

  runCLI(args, cwd) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [path.join(__dirname, '../../bin/cli.js'), ...args], {
        cwd,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      child.on('error', reject);
    });
  }

  async runAllTests() {
    console.log(chalk.blue.bold('🚀 Starting Manual Test Matrix\n'));

    // Basic functionality tests
    await this.runTest('Help', ['--help']);
    await this.runTest('Version', ['--version']);
    await this.runTest('Dry Run React', ['--dry-run'], 'react');
    await this.runTest('Dry Run Python', ['--dry-run'], 'python');
    await this.runTest('Dry Run Go', ['--dry-run'], 'go');
    await this.runTest('Dry Run Empty', ['--dry-run'], 'empty');

    // Flag combination tests
    await this.runTest('Quiet + Yes', ['--quiet', '--yes'], 'react');
    await this.runTest('Verbose + Dry Run', ['--verbose', '--dry-run'], 'react');
    await this.runTest('Framework Override', ['--dry-run', '--framework', 'react,typescript'], 'empty');
    await this.runTest('Language Override', ['--dry-run', '--language', 'python,javascript'], 'empty');

    // Selective operation tests
    await this.runTest('Docs Only', ['--docs-only', '--yes'], 'react');
    await this.runTest('Settings Only', ['--settings-only', '--yes'], 'react');
    await this.runTest('Commands Only', ['--commands-only', '--yes'], 'react');
    await this.runTest('No Docs', ['--no-docs', '--yes'], 'react');

    // Permission tests
    await this.runTest('Safe Only', ['--safe-only', '--yes'], 'react');
    await this.runTest('Include Destructive', ['--include-destructive', '--yes'], 'react');

    // Advanced tests
    await this.runTest('Update Mode', ['--update', '--yes'], 'react');
    await this.runTest('Reset Mode', ['--reset', '--yes'], 'react');

    // Complex combinations
    await this.runTest('Complex 1', ['--verbose', '--framework', 'react', '--safe-only', '--yes'], 'empty');
    await this.runTest('Complex 2', ['--quiet', '--include-destructive', '--no-docs', '--yes'], 'python');

    await this.generateReport();
    await this.cleanup();
  }

  async generateReport() {
    console.log(chalk.blue.bold('\n📊 Test Results Summary\n'));

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;

    console.log(chalk.green(`✅ Passed: ${passed}/${total}`));
    console.log(chalk.red(`❌ Failed: ${failed}/${total}`));

    if (failed > 0) {
      console.log(chalk.red.bold('\n🚨 Failed Tests:'));
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(chalk.red(`   • ${r.name}: ${r.error || 'Command failed'}`));
        });
    }

    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;
    console.log(chalk.gray(`\n⏱️  Average duration: ${Math.round(avgDuration)}ms`));

    // Save detailed report
    const reportPath = path.join(__dirname, '../results/manual-test-report.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, {
      timestamp: new Date().toISOString(),
      summary: { total, passed, failed, avgDuration },
      results: this.results
    }, { spaces: 2 });

    console.log(chalk.gray(`📄 Detailed report saved to: ${reportPath}`));
  }

  async cleanup() {
    for (const dir of this.tempDirs) {
      try {
        await fs.remove(dir);
      } catch (error) {
        console.warn(`Failed to cleanup ${dir}:`, error.message);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const testMatrix = new TestMatrix();
  testMatrix.runAllTests().catch(console.error);
}

module.exports = { TestMatrix };
