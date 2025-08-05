const { spawn } = require('child_process');
const { MockFS } = require('../helpers/mock-fs');
const { validateClaudeSetup } = require('../helpers/validators');
const fs = require('fs-extra');
const path = require('path');

describe('CLI Flags Integration', () => {
  let mockFS;

  beforeEach(() => {
    mockFS = new MockFS();
  });

  afterEach(async () => {
    await mockFS.cleanup();
  });

  function runCLI(args, cwd, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [path.join(__dirname, '../../bin/cli.js'), ...args], {
        cwd,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';
      let finished = false;

      // Add timeout to prevent hanging
      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          child.kill('SIGTERM');
          reject(new Error(`CLI command timed out after ${timeout}ms`));
        }
      }, timeout);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          resolve({ code, stdout, stderr });
        }
      });

      child.on('error', (err) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          reject(err);
        }
      });
    });
  }

  test('should show help with --help flag', async () => {
    const result = await runCLI(['--help'], process.cwd());
    
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Intelligent Claude Code setup');
    expect(result.stdout).toContain('--dry-run');
    expect(result.stdout).toContain('--framework');
  });

  test('should perform dry-run analysis', async () => {
    const projectPath = await mockFS.createTempProject('react');
    const result = await runCLI(['--dry-run'], projectPath);
    
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Project Analysis:');
    expect(result.stdout).toContain('Existing Setup:');
    expect(result.stdout).toContain('javascript');
    
    // Should not create any files
    expect(await fs.pathExists(path.join(projectPath, '.claude'))).toBe(false);
  });

  test('should handle framework override', async () => {
    const projectPath = await mockFS.createTempProject('empty');
    const result = await runCLI(['--dry-run', '--framework', 'react,typescript'], projectPath);
    
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('react');
    expect(result.stdout).toContain('typescript');
    expect(result.stdout).toContain('CLI Overrides Applied');
  });

  test('should handle language override', async () => {
    const projectPath = await mockFS.createTempProject('empty');
    const result = await runCLI(['--dry-run', '--language', 'python,go'], projectPath);
    
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('python');
    expect(result.stdout).toContain('go');
  });

  test('should run quietly with --quiet flag', async () => {
    const projectPath = await mockFS.createTempProject('react');
    const result = await runCLI(['--quiet', '--yes'], projectPath);
    
    expect(result.code).toBe(0);
    expect(result.stdout).not.toContain('Claude Setup - Intelligent');
    
    // Should still create files
    const validation = await validateClaudeSetup(projectPath);
    expect(validation.valid).toBe(true);
  });

  test('should show verbose output with --verbose flag', async () => {
    const projectPath = await mockFS.createTempProject('react');
    const result = await runCLI(['--dry-run', '--verbose', '--framework', 'react'], projectPath);
    
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Forced frameworks: react');
  });

  test('should handle docs-only flag', async () => {
    const projectPath = await mockFS.createTempProject('react');
    const result = await runCLI(['--docs-only', '--yes'], projectPath);
    
    expect(result.code).toBe(0);
    
    // Should create docs but not full setup
    expect(await fs.pathExists(path.join(projectPath, 'docs'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, '.claude/settings.json'))).toBe(false);
  });

  test('should handle settings-only flag', async () => {
    const projectPath = await mockFS.createTempProject('react');
    const result = await runCLI(['--settings-only', '--yes'], projectPath);
    
    expect(result.code).toBe(0);
    
    // Should create settings but not CLAUDE.md
    expect(await fs.pathExists(path.join(projectPath, '.claude/settings.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'CLAUDE.md'))).toBe(false);
  });

  test('should handle output-dir flag', async () => {
    const projectPath = await mockFS.createTempProject('react');
    const outputDir = await mockFS.createTempProject('empty');
    
    const result = await runCLI(['--output-dir', outputDir, '--yes'], projectPath);
    
    expect(result.code).toBe(0);
    
    // Should create setup in output directory
    const validation = await validateClaudeSetup(outputDir);
    expect(validation.valid).toBe(true);
  });

  test('should handle config file', async () => {
    const projectPath = await mockFS.createTempProject('empty');
    const configPath = path.join(projectPath, 'claude-config.json');
    
    await fs.writeJson(configPath, {
      yes: true,
      framework: ['react'],
      verbose: true
    });
    
    const result = await runCLI(['--config', configPath, '--dry-run'], projectPath);
    
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Loaded config from');
    expect(result.stdout).toContain('react');
  });

  test('should handle permission flags', async () => {
    const projectPath = await mockFS.createTempProject('react');
    
    // Test safe-only
    const safeResult = await runCLI(['--safe-only', '--yes'], projectPath);
    expect(safeResult.code).toBe(0);
    
    const safeSettings = await fs.readJson(path.join(projectPath, '.claude/settings.json'));
    expect(safeSettings.permissions.allow.length).toBeLessThan(20);
    
    // Clean up and test include-destructive
    await fs.remove(path.join(projectPath, '.claude'));
    
    const destructiveResult = await runCLI(['--include-destructive', '--yes'], projectPath);
    expect(destructiveResult.code).toBe(0);
    
    const destructiveSettings = await fs.readJson(path.join(projectPath, '.claude/settings.json'));
    expect(destructiveSettings.permissions.allow.length).toBeGreaterThan(safeSettings.permissions.allow.length);
  });

  test('should handle error cases gracefully', async () => {
    // Test with non-existent config file + dry-run to avoid hanging
    const projectPath = await mockFS.createTempProject('empty');
    const result = await runCLI(['--config', '/non/existent/config.json', '--dry-run'], projectPath, 10000);
    
    // Should show warning but continue
    expect(result.stderr || result.stdout).toContain('Config file not found');
    expect(result.code).toBe(0); // Should still succeed with dry-run
  });
});
