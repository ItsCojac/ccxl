# Generate Tests

Generate comprehensive test files for the current codebase.

## Usage

Use this command when you need to:
- Create unit tests for new functions/classes
- Add integration tests for API endpoints
- Generate test fixtures and mock data
- Set up testing infrastructure

## Instructions for Claude

1. **Analyze the target code** to understand:
   - Function signatures and expected behavior
   - Dependencies and external services
   - Edge cases and error conditions
   - Current testing patterns in the project

2. **Choose appropriate testing framework**:
   - Jest for JavaScript/TypeScript
   - pytest for Python
   - Go's built-in testing for Go
   - Cargo test for Rust

3. **Generate tests that include**:
   - Happy path scenarios
   - Edge cases and boundary conditions
   - Error handling and validation
   - Mock external dependencies
   - Proper setup and teardown

4. **Follow project conventions**:
   - Use existing test file naming patterns
   - Match current assertion styles
   - Include appropriate test descriptions
   - Add necessary imports and setup

## Example Request

"Generate unit tests for the `UserService.createUser()` method, including validation, database mocking, and error scenarios."

## Quality Checklist

- [ ] Tests cover main functionality
- [ ] Edge cases are tested
- [ ] Error conditions are handled
- [ ] Mocks are properly configured
- [ ] Tests are readable and maintainable
- [ ] Test names clearly describe what's being tested