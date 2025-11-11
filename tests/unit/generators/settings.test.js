const { generateSettings } = require('../../../lib/generators/settings');
const { validatePermissionsSafety } = require('../../helpers/validators');

describe('Settings Generator', () => {
  test('should generate basic settings for unknown project', () => {
    const analysis = {
      type: 'unknown',
      frameworks: [],
      languages: [],
      dependencies: {},
      structure: {}
    };

    const settings = generateSettings(analysis);

    expect(settings).toHaveProperty('permissions');
    expect(settings.permissions).toHaveProperty('allow');
    expect(Array.isArray(settings.permissions.allow)).toBe(true);
    expect(settings.permissions.allow.length).toBeGreaterThan(0);

    // Validate all permissions are safe
    const unsafeCommands = validatePermissionsSafety(settings.permissions.allow);
    expect(unsafeCommands).toEqual([]);
  });

  test('should include JavaScript-specific permissions', () => {
    const analysis = {
      type: 'javascript',
      frameworks: ['react'],
      languages: ['javascript', 'typescript'],
      dependencies: { react: '^18.0.0' },
      packageManager: 'npm',
      structure: {}
    };

    const settings = generateSettings(analysis);
    const permissions = settings.permissions.allow;

    expect(permissions).toContain('Bash(npm list:*)');
    expect(permissions).toContain('Bash(npm outdated:*)');
    expect(permissions).toContain('Bash(node --version:*)');
  });

  test('should include Python-specific permissions', () => {
    const analysis = {
      type: 'python',
      frameworks: ['django'],
      languages: ['python'],
      dependencies: { django: '4.2.0' },
      structure: {}
    };

    const settings = generateSettings(analysis);
    const permissions = settings.permissions.allow;

    expect(permissions).toContain('Bash(python --version:*)');
    expect(permissions).toContain('Bash(pip list:*)');
    expect(permissions).toContain('Bash(pip show:*)');
  });

  test('should handle safe-only option', () => {
    const analysis = {
      type: 'javascript',
      frameworks: ['react'],
      languages: ['javascript'],
      dependencies: {},
      structure: {}
    };

    const settings = generateSettings(analysis, { safeOnly: true });
    const permissions = settings.permissions.allow;

    // Should only include ultra-safe commands
    expect(permissions.length).toBeLessThan(10);
    expect(permissions.some(p => p.includes('ls:'))).toBe(true);
    expect(permissions.some(p => p.includes('cat:'))).toBe(true);
    expect(permissions.some(p => p.includes('git status:'))).toBe(true);
  });

  test('should handle include-destructive option', () => {
    const analysis = {
      type: 'javascript',
      frameworks: [],
      languages: ['javascript'],
      dependencies: {},
      structure: {}
    };

    const normalSettings = generateSettings(analysis);
    const destructiveSettings = generateSettings(analysis, { includeDestructive: true });

    expect(destructiveSettings.permissions.allow.length).toBeGreaterThan(
      normalSettings.permissions.allow.length
    );

    // Should include some safe destructive operations
    const destructivePermissions = destructiveSettings.permissions.allow;
    expect(destructivePermissions.some(p => p.includes('touch:*.tmp'))).toBe(true);
    expect(destructivePermissions.some(p => p.includes('git stash:'))).toBe(true);
  });

  test('should include Docker permissions when Docker is detected', () => {
    const analysis = {
      type: 'javascript',
      frameworks: [],
      languages: ['javascript'],
      dependencies: { docker: '1.0.0' },
      structure: { hasConfig: true }
    };

    const settings = generateSettings(analysis);
    const permissions = settings.permissions.allow;

    expect(permissions).toContain('Bash(docker ps:*)');
    expect(permissions).toContain('Bash(docker images:*)');
    expect(permissions).toContain('Bash(docker logs:*)');
  });

  test('should validate all generated permissions are safe', () => {
    const testCases = [
      { type: 'javascript', frameworks: ['react'], languages: ['javascript'] },
      { type: 'python', frameworks: ['django'], languages: ['python'] },
      { type: 'go', frameworks: [], languages: ['go'] },
      { type: 'mixed', frameworks: ['react'], languages: ['javascript', 'python'] }
    ];

    for (const analysis of testCases) {
      const settings = generateSettings({
        ...analysis,
        dependencies: {},
        structure: {}
      });

      const unsafeCommands = validatePermissionsSafety(settings.permissions.allow);
      expect(unsafeCommands).toEqual([]);
    }
  });
});
