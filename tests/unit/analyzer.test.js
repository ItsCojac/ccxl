const { analyzeProject } = require('../../lib/analyzer');
const { MockFS } = require('../helpers/mock-fs');
const { validateAnalysis } = require('../helpers/validators');

describe('Project Analyzer', () => {
  let mockFS;

  beforeEach(() => {
    mockFS = new MockFS();
  });

  afterEach(async () => {
    await mockFS.cleanup();
  });

  test('should detect React project correctly', async () => {
    const projectPath = await mockFS.createTempProject('react');
    const analysis = await analyzeProject(projectPath);

    expect(analysis.type).toBe('javascript');
    expect(analysis.frameworks).toContain('react');
    expect(analysis.languages).toContain('javascript');
    expect(analysis.languages).toContain('typescript');
    expect(analysis.dependencies.react).toBeDefined();
    
    const validation = validateAnalysis(analysis);
    expect(validation.valid).toBe(true);
  });

  test('should detect Python project correctly', async () => {
    const projectPath = await mockFS.createTempProject('python');
    const analysis = await analyzeProject(projectPath);

    expect(analysis.type).toBe('python');
    expect(analysis.frameworks).toContain('django');
    expect(analysis.frameworks).toContain('flask');
    expect(analysis.languages).toContain('python');
    
    const validation = validateAnalysis(analysis);
    expect(validation.valid).toBe(true);
  });

  test('should detect Go project correctly', async () => {
    const projectPath = await mockFS.createTempProject('go');
    const analysis = await analyzeProject(projectPath);

    expect(analysis.type).toBe('go');
    expect(analysis.languages).toContain('go');
    
    const validation = validateAnalysis(analysis);
    expect(validation.valid).toBe(true);
  });

  test('should handle empty project', async () => {
    const projectPath = await mockFS.createTempProject('empty');
    const analysis = await analyzeProject(projectPath);

    expect(analysis.type).toBe('unknown');
    expect(analysis.frameworks).toEqual([]);
    expect(analysis.languages).toEqual([]);
    
    const validation = validateAnalysis(analysis);
    expect(validation.valid).toBe(true);
  });

  test('should detect mixed project types', async () => {
    const projectPath = await mockFS.createTempProject('empty', {
      'package.json': JSON.stringify({
        dependencies: { react: '^18.0.0' }
      }),
      'requirements.txt': 'django==4.2.0'
    });

    const analysis = await analyzeProject(projectPath);

    expect(analysis.type).toBe('mixed');
    expect(analysis.frameworks).toContain('react');
    expect(analysis.languages).toContain('javascript');
    expect(analysis.languages).toContain('python');
  });

  test('should detect test files', async () => {
    const projectPath = await mockFS.createTempProject('empty', {
      'test/example.test.js': 'test content',
      'package.json': JSON.stringify({ devDependencies: { jest: '^29.0.0' } })
    });

    const analysis = await analyzeProject(projectPath);
    expect(analysis.hasTests).toBe(true);
  });

  test('should generate appropriate recommendations', async () => {
    const projectPath = await mockFS.createTempProject('react');
    const analysis = await analyzeProject(projectPath);

    expect(Array.isArray(analysis.recommendations)).toBe(true);
    // Recommendations should be generated based on project type
  });
});
