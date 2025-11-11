# Generate Tests

Generate comprehensive test coverage for the selected code or file.

## Instructions

1. Analyze the code structure and identify all testable functions/methods
2. Determine the testing framework used in the project (Jest, Vitest, Mocha, etc.)
3. Create test files following project conventions:
   - For `src/foo.js` → `tests/foo.test.js` or `src/foo.test.js`
   - Match the project's existing test file naming pattern
4. Write tests that cover:
   - Happy path scenarios
   - Edge cases and boundary conditions
   - Error handling
   - Mock external dependencies appropriately
5. Ensure tests are isolated, deterministic, and follow AAA pattern (Arrange, Act, Assert)
6. Run the tests to verify they pass
7. Report coverage statistics if available

## Test Quality Checklist

- [ ] All public functions/methods are tested
- [ ] Edge cases are covered
- [ ] Error conditions are tested
- [ ] Tests are isolated (no shared state)
- [ ] Mocks are used for external dependencies
- [ ] Tests have clear, descriptive names
- [ ] All tests pass

Focus on practical, maintainable tests that provide real value.
