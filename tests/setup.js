/**
 * Jest setup file - runs before all tests
 */

// Increase timeout for integration tests
jest.setTimeout(60000);

// Mock documentation fetching to speed up tests
jest.mock('../lib/documentation', () => ({
  fetchDocumentation: jest.fn().mockImplementation(async (projectPath, frameworks, options = {}) => {
    const fs = require('fs-extra');
    const path = require('path');
    
    // Create docs directory structure like the real function
    const docsDir = path.join(projectPath, 'docs');
    await fs.ensureDir(docsDir);
    await fs.ensureDir(path.join(docsDir, 'fetched'));
    
    // Create mock documentation files
    for (const framework of frameworks) {
      const outputPath = path.join(docsDir, 'fetched', `${framework}.md`);
      await fs.writeFile(outputPath, `Mock ${framework} documentation content`, 'utf-8');
    }
    
    return {
      success: true,
      results: frameworks.map(f => ({ framework: f, success: true, size: '1KB' }))
    };
  })
}));

// Mock console.log in tests to reduce noise
const originalLog = console.log;
const originalWarn = console.warn;

beforeAll(() => {
  // Only show errors and important messages during tests
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore console functions
  console.log = originalLog;
  console.warn = originalWarn;
});

// Global test utilities
global.testUtils = {
  // Helper to restore console for specific tests
  restoreConsole: () => {
    console.log = originalLog;
    console.warn = originalWarn;
  },
  
  // Helper to mock console for specific tests
  mockConsole: () => {
    console.log = jest.fn();
    console.warn = jest.fn();
  }
};
