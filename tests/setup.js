/**
 * Jest setup file - runs before all tests
 */

// Increase timeout for integration tests
jest.setTimeout(60000);

// Mock documentation fetching to speed up tests
jest.mock('../lib/documentation', () => ({
  fetchDocumentation: jest.fn().mockResolvedValue({
    success: true,
    content: 'Mock documentation content for testing',
    size: '1KB'
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
