const { setupClaude } = require('../../lib/setup');
const { analyzeProject } = require('../../lib/analyzer');
const { detectExisting } = require('../../lib/detector');
const { MockFS } = require('../helpers/mock-fs');
const { validateClaudeSetup } = require('../helpers/validators');
const fs = require('fs-extra');
const path = require('path');

describe('Full Setup Integration', () => {
  let mockFS;

  beforeEach(() => {
    mockFS = new MockFS();
  });

  afterEach(async () => {
    await mockFS.cleanup();
  });

  test('should perform complete setup on React project', async () => {
    const projectPath = await mockFS.createTempProject('react');
    
    const analysis = await analyzeProject(projectPath);
    const existing = await detectExisting(projectPath);
    
    await setupClaude(projectPath, analysis, existing, { yes: true });

    // Validate the setup
    const validation = await validateClaudeSetup(projectPath);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);

    // Check specific files exist
    expect(await fs.pathExists(path.join(projectPath, '.claude/settings.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'CLAUDE.md'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, '.claude/commands'))).toBe(true);
  });

  test('should update existing setup correctly', async () => {
    const projectPath = await mockFS.createProjectWithClaudeSetup('react');
    
    const analysis = await analyzeProject(projectPath);
    const existing = await detectExisting(projectPath);
    
    await setupClaude(projectPath, analysis, existing, { yes: true, update: true });

    const validation = await validateClaudeSetup(projectPath);
    expect(validation.valid).toBe(true);
  });

  test('should handle docs-only flag', async () => {
    const projectPath = await mockFS.createTempProject('react');
    
    const analysis = await analyzeProject(projectPath);
    const existing = await detectExisting(projectPath);
    
    await setupClaude(projectPath, analysis, existing, { yes: true, docsOnly: true });

    // Should have docs but not full setup
    expect(await fs.pathExists(path.join(projectPath, 'docs'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, '.claude/settings.json'))).toBe(false);
  });

  test('should handle settings-only flag', async () => {
    const projectPath = await mockFS.createTempProject('react');
    
    const analysis = await analyzeProject(projectPath);
    const existing = await detectExisting(projectPath);
    
    await setupClaude(projectPath, analysis, existing, { yes: true, settingsOnly: true });

    // Should have settings but not other files
    expect(await fs.pathExists(path.join(projectPath, '.claude/settings.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'CLAUDE.md'))).toBe(false);
  });

  test('should handle reset flag', async () => {
    const projectPath = await mockFS.createProjectWithClaudeSetup('react');
    
    // Add some custom content
    await fs.writeFile(path.join(projectPath, '.claude/custom.txt'), 'custom content');
    
    const analysis = await analyzeProject(projectPath);
    const existing = await detectExisting(projectPath);
    
    await setupClaude(projectPath, analysis, existing, { yes: true, reset: true });

    // Should have fresh setup
    const validation = await validateClaudeSetup(projectPath);
    expect(validation.valid).toBe(true);
    
    // Custom file should be backed up
    expect(await fs.pathExists(path.join(projectPath, '.claude/custom.txt'))).toBe(false);
  });

  test('should preserve local settings during update', async () => {
    const projectPath = await mockFS.createProjectWithClaudeSetup('react');
    
    // Add local settings
    const localSettings = { permissions: { allow: ["Bash(custom:*)"] } };
    await fs.writeJson(path.join(projectPath, '.claude/settings.local.json'), localSettings);
    
    const analysis = await analyzeProject(projectPath);
    const existing = await detectExisting(projectPath);
    
    await setupClaude(projectPath, analysis, existing, { yes: true, update: true });

    // Local settings should be preserved
    const preservedLocal = await fs.readJson(path.join(projectPath, '.claude/settings.local.json'));
    expect(preservedLocal.permissions.allow).toContain("Bash(custom:*)");
  });

  test('should handle permission flags correctly', async () => {
    const projectPath = await mockFS.createTempProject('react');
    
    const analysis = await analyzeProject(projectPath);
    const existing = await detectExisting(projectPath);
    
    // Test safe-only
    await setupClaude(projectPath, analysis, existing, { yes: true, safeOnly: true });
    
    const safeSettings = await fs.readJson(path.join(projectPath, '.claude/settings.json'));
    expect(safeSettings.permissions.allow.length).toBeLessThan(20); // Should be minimal
    
    // Clean up and test include-destructive
    await fs.remove(path.join(projectPath, '.claude'));
    
    await setupClaude(projectPath, analysis, existing, { yes: true, includeDestructive: true });
    
    const destructiveSettings = await fs.readJson(path.join(projectPath, '.claude/settings.json'));
    expect(destructiveSettings.permissions.allow.length).toBeGreaterThan(safeSettings.permissions.allow.length);
  });
});
