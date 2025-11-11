#!/usr/bin/env node

/**
 * Real-world testing script - test against actual project repositories
 */

const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class RealWorldTester {
  constructor() {
    this.testProjects = [
      {
        name: 'Create React App',
        repo: 'https://github.com/facebook/create-react-app.git',
        expectedType: 'javascript',
        expectedFrameworks: ['react']
      },
      {
        name: 'Express.js',
        repo: 'https://github.com/expressjs/express.git',
        expectedType: 'javascript',
        expectedFrameworks: ['express']
      },
      {
        name: 'Django',
        repo: 'https://github.com/django/django.git',
        expectedType: 'python',
        expectedFrameworks: ['django']
      }
    ];
    this.tempDirs = [];
    this.results = [];
  }

  async cloneRepo(repoUrl, name) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `claude-real-test-${name.replace(/\s+/g, '-').toLowerCase()}-`));
    this.tempDirs.push(tempDir);

    console.log(chalk.blue(`📥 Cloning ${name}...`));
    
    try {
      await this.runCommand('git', ['clone', '--depth', '1', repoUrl, tempDir]);
      return tempDir;
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Failed to clone ${name}, creating mock project`));
      return await this.createMockProject(name, tempDir);
    }
  }

  async createMockProject(name, dir) {
    // Create mock projects based on expected type
    if (name.includes('React')) {
      await fs.writeJson(path.join(dir, 'package.json'), {
        name: 'mock-react-app',
        dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
        devDependencies: { typescript: '^5.0.0' }
      });
    } else if (name.includes('Express')) {
      await fs.writeJson(path.join(dir, 'package.json'), {
        name: 'mock-express-app',
        dependencies: { express: '^4.18.0' }
      });
    } else if (name.includes('Django')) {
      await fs.writeFile(path.join(dir, 'requirements.txt'), 'Django>=4.0.0');
      await fs.writeFile(path.join(dir, 'manage.py'), '# Django management script');
    }
    
    return dir;
  }

  async testProject(project) {
    console.log(chalk.blue.bold(`\n🧪 Testing: ${project.name}`));
    
    const projectPath = await this.cloneRepo(project.repo, project.name);
    const startTime = Date.now();

    try {
      // Test dry-run analysis
      console.log(chalk.gray('   Running analysis...'));
      const analysisResult = await this.runClaude(['--dry-run', '--verbose'], projectPath);
      
      if (analysisResult.code !== 0) {
        throw new Error(`Analysis failed: ${analysisResult.stderr}`);
      }

      // Validate analysis results
      const analysisOutput = analysisResult.stdout;
      const detectedCorrectType = analysisOutput.includes(project.expectedType);
      const detectedFrameworks = project.expectedFrameworks.every(fw => 
        analysisOutput.includes(fw)
      );

      // Test actual setup
      console.log(chalk.gray('   Running setup...'));
      const setupResult = await this.runClaude(['--yes', '--quiet'], projectPath);
      
      if (setupResult.code !== 0) {
        throw new Error(`Setup failed: ${setupResult.stderr}`);
      }

      // Validate setup results
      const hasSettings = await fs.pathExists(path.join(projectPath, '.claude/settings.json'));
      const hasClaudeMd = await fs.pathExists(path.join(projectPath, 'CLAUDE.md'));
      const hasCommands = await fs.pathExists(path.join(projectPath, '.claude/commands'));

      const duration = Date.now() - startTime;
      const result = {
        name: project.name,
        success: true,
        duration,
        analysis: {
          detectedCorrectType,
          detectedFrameworks,
          output: analysisOutput
        },
        setup: {
          hasSettings,
          hasClaudeMd,
          hasCommands
        }
      };

      console.log(chalk.green(`   ✅ Success (${duration}ms)`));
      console.log(chalk.gray(`      Type: ${detectedCorrectType ? '✓' : '✗'} Frameworks: ${detectedFrameworks ? '✓' : '✗'}`));
      console.log(chalk.gray(`      Files: Settings:${hasSettings ? '✓' : '✗'} CLAUDE.md:${hasClaudeMd ? '✓' : '✗'} Commands:${hasCommands ? '✓' : '✗'}`));

      this.results.push(result);

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(chalk.red(`   ❌ Failed (${duration}ms): ${error.message}`));
      
      this.results.push({
        name: project.name,
        success: false,
        duration,
        error: error.message
      });
    }
  }

  async runClaude(args, cwd) {
    return this.runCommand('node', [path.join(__dirname, '../../bin/cli.js'), ...args], cwd);
  }

  runCommand(command, args, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
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
    console.log(chalk.blue.bold('🌍 Starting Real-World Tests\n'));
    console.log(chalk.gray('This will clone and test against actual repositories...\n'));

    for (const project of this.testProjects) {
      await this.testProject(project);
    }

    await this.generateReport();
    await this.cleanup();
  }

  async generateReport() {
    console.log(chalk.blue.bold('\n📊 Real-World Test Results\n'));

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
          console.log(chalk.red(`   • ${r.name}: ${r.error}`));
        });
    }

    // Detailed analysis
    const successfulResults = this.results.filter(r => r.success);
    if (successfulResults.length > 0) {
      console.log(chalk.blue.bold('\n📈 Analysis Accuracy:'));
      successfulResults.forEach(r => {
        const typeAccuracy = r.analysis.detectedCorrectType ? '✓' : '✗';
        const frameworkAccuracy = r.analysis.detectedFrameworks ? '✓' : '✗';
        console.log(chalk.gray(`   ${r.name}: Type ${typeAccuracy} Frameworks ${frameworkAccuracy}`));
      });
    }

    // Save report
    const reportPath = path.join(__dirname, '../results/real-world-test-report.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, {
      timestamp: new Date().toISOString(),
      summary: { total, passed, failed },
      results: this.results
    }, { spaces: 2 });

    console.log(chalk.gray(`\n📄 Report saved to: ${reportPath}`));
  }

  async cleanup() {
    console.log(chalk.gray('\n🧹 Cleaning up temporary directories...'));
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
  const tester = new RealWorldTester();
  tester.runAllTests().catch(console.error);
}

module.exports = { RealWorldTester };
