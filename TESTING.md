# Testing Guide for Claude Setup

This document explains how to test the claude-setup project comprehensively to ensure everything works as intended.

## 🧪 Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── analyzer.test.js     # Project analyzer tests
│   └── generators/          # Settings and content generators
├── integration/             # Full workflow tests
│   ├── full-setup.test.js   # Complete setup process
│   └── cli-flags.test.js    # CLI flag combinations
├── manual/                  # Manual testing scripts
│   ├── test-matrix.js       # Systematic flag testing
│   └── real-world-test.js   # Test against real repositories
├── helpers/                 # Test utilities
│   ├── mock-fs.js          # File system mocking
│   └── validators.js       # Output validation
├── fixtures/               # Test project templates
│   ├── react-project/      # Mock React project
│   ├── python-project/     # Mock Python project
│   └── go-project/         # Mock Go project
└── results/                # Test reports and coverage
```

## 🚀 Quick Start

### Run All Tests (Fast)
```bash
npm test
```

### Run All Tests (Comprehensive)
```bash
npm run test:all
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Manual test matrix
npm run test:manual

# Real-world repository tests
npm run test:real-world

# Safety audit only
npm run test:safety
```

## 📋 Test Categories

### 1. **Unit Tests** (`npm run test:unit`)
Tests individual functions and modules in isolation:

- **Project Analyzer**: Detects project types, frameworks, languages
- **Settings Generator**: Creates safe permission configurations
- **Detector**: Identifies existing Claude setups
- **CLI Parser**: Validates command-line argument handling

**What it tests:**
- ✅ Correct project type detection
- ✅ Framework and language identification
- ✅ Permission safety validation
- ✅ Edge cases and error handling

### 2. **Integration Tests** (`npm run test:integration`)
Tests complete workflows and CLI integration:

- **Full Setup Process**: End-to-end setup validation
- **CLI Flag Combinations**: All flag permutations
- **File Operations**: Actual file creation and modification
- **Update Scenarios**: Existing setup handling

**What it tests:**
- ✅ Complete setup workflows
- ✅ CLI flag interactions
- ✅ File system operations
- ✅ Error recovery

### 3. **Manual Test Matrix** (`npm run test:manual`)
Systematically tests all CLI flag combinations:

- Tests 20+ different flag combinations
- Validates output for each scenario
- Measures performance and reliability
- Generates detailed reports

**What it tests:**
- ✅ All CLI flags work correctly
- ✅ Flag combinations don't conflict
- ✅ Performance is acceptable
- ✅ Error messages are helpful

### 4. **Real-World Tests** (`npm run test:real-world`)
Tests against actual project repositories:

- Clones popular open-source projects
- Runs analysis and setup
- Validates detection accuracy
- Tests with real project structures

**What it tests:**
- ✅ Works with real projects
- ✅ Accurate framework detection
- ✅ Handles complex project structures
- ✅ Performance with large codebases

### 5. **Safety Audit** (`npm run test:safety`)
Validates that all generated permissions are safe:

- Checks every generated permission
- Identifies potentially dangerous commands
- Validates permission categories
- Ensures team safety

**What it tests:**
- ✅ No destructive commands in default settings
- ✅ Safe-only mode is truly safe
- ✅ Include-destructive mode is still reasonable
- ✅ All permissions follow security guidelines

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: Node.js
- **Timeout**: 10s (30s for integration)
- **Coverage**: Enabled for `lib/` and `bin/`
- **Reporters**: Text, LCOV, HTML

### Test Helpers
- **MockFS**: Creates temporary test projects
- **Validators**: Checks setup completeness and safety
- **Test Utilities**: Common testing functions

## 📊 Test Reports

All tests generate detailed reports in `tests/results/`:

- **Unit/Integration**: Jest coverage reports
- **Manual Matrix**: JSON report with all flag combinations
- **Real-World**: Analysis accuracy and performance metrics
- **Comprehensive**: Combined report from all test suites

## 🐛 Debugging Tests

### Verbose Output
```bash
# Show detailed test output
npm run test:unit -- --verbose

# Show console logs during tests
npm run test:integration -- --verbose
```

### Individual Test Files
```bash
# Run specific test file
npx jest tests/unit/analyzer.test.js

# Run with debugging
npx jest tests/unit/analyzer.test.js --verbose --no-coverage
```

### Manual Debugging
```bash
# Test specific CLI command
node bin/cli.js --dry-run --verbose

# Test with custom project
cd /path/to/test/project
node /path/to/claude-setup/bin/cli.js --dry-run
```

## ✅ Test Checklist

Before releasing or deploying, ensure all tests pass:

- [ ] **Unit Tests**: All components work individually
- [ ] **Integration Tests**: Full workflows complete successfully
- [ ] **Manual Matrix**: All CLI flags work correctly
- [ ] **Real-World Tests**: Works with actual projects
- [ ] **Safety Audit**: All permissions are safe
- [ ] **Performance**: Setup completes in reasonable time
- [ ] **Error Handling**: Graceful failure and helpful messages

## 🚨 Common Issues

### Test Failures
1. **Permission Errors**: Ensure test has write access to temp directories
2. **Network Issues**: Real-world tests require internet access
3. **Timeout Issues**: Increase Jest timeout for slow operations
4. **File System**: Clean up temp directories if tests crash

### Performance Issues
1. **Slow Tests**: Use `--fast` flag to skip time-consuming tests
2. **Memory Usage**: Large projects may require more memory
3. **Parallel Execution**: Jest runs tests in parallel by default

### Environment Issues
1. **Node Version**: Ensure Node.js 16+ is installed
2. **Dependencies**: Run `npm install` before testing
3. **Git**: Some tests require git to be available
4. **Network**: Real-world tests need internet connectivity

## 📈 Continuous Integration

For CI/CD pipelines:

```bash
# Fast test suite for PR checks
npm test

# Comprehensive test suite for releases
npm run test:all

# Safety-only for security validation
npm run test:safety
```

## 🎯 Test Coverage Goals

- **Unit Tests**: >90% code coverage
- **Integration Tests**: All major workflows covered
- **CLI Flags**: 100% flag combination coverage
- **Project Types**: All supported project types tested
- **Safety**: 100% permission validation coverage

## 📝 Adding New Tests

### For New Features
1. Add unit tests in `tests/unit/`
2. Add integration tests in `tests/integration/`
3. Update manual test matrix if new CLI flags
4. Add real-world test cases if new project types

### Test File Template
```javascript
const { MockFS } = require('../helpers/mock-fs');
const { validateClaudeSetup } = require('../helpers/validators');

describe('New Feature', () => {
  let mockFS;

  beforeEach(() => {
    mockFS = new MockFS();
  });

  afterEach(async () => {
    await mockFS.cleanup();
  });

  test('should work correctly', async () => {
    // Test implementation
  });
});
```

This comprehensive testing framework ensures claude-setup works reliably across all supported scenarios and environments.
