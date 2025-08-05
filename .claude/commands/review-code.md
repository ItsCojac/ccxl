# Review Code

Perform comprehensive code review and provide improvement suggestions.

## Usage

Use this command when you need to:
- Review pull requests or code changes
- Audit existing code for quality issues
- Get suggestions for refactoring
- Ensure code follows best practices

## Instructions for Claude

1. **Code Quality Analysis**:
   - Check for code clarity and readability
   - Identify potential bugs or logic errors
   - Review error handling and edge cases
   - Assess performance implications
   - Verify security considerations

2. **Architecture & Design**:
   - Evaluate code organization and structure
   - Check adherence to design patterns
   - Assess separation of concerns
   - Review API design and interfaces
   - Consider maintainability and extensibility

3. **Best Practices**:
   - Verify naming conventions
   - Check for code duplication
   - Review comment quality and documentation
   - Assess test coverage and quality
   - Ensure consistent coding style

4. **Language-Specific Checks**:
   - **JavaScript/TypeScript**: ESLint rules, type safety, async/await usage
   - **Python**: PEP 8 compliance, type hints, exception handling
   - **Go**: Go conventions, error handling, goroutine safety
   - **Rust**: Ownership patterns, error handling, performance

## Review Template

### 🔍 Overall Assessment
- **Code Quality**: [Excellent/Good/Needs Improvement]
- **Readability**: [How easy is it to understand?]
- **Maintainability**: [How easy would it be to modify?]

### ✅ Strengths
- [What's done well?]
- [Good patterns or practices used]
- [Clear and well-structured code]

### 🚨 Issues Found

#### Critical Issues
- [ ] [Security vulnerabilities]
- [ ] [Potential bugs or crashes]
- [ ] [Performance problems]

#### Improvements
- [ ] [Code clarity issues]
- [ ] [Better error handling needed]
- [ ] [Refactoring opportunities]

#### Style & Convention
- [ ] [Naming convention issues]
- [ ] [Code formatting problems]
- [ ] [Missing documentation]

### 💡 Suggestions

#### Refactoring Opportunities
- [Specific refactoring suggestions]
- [Ways to reduce complexity]
- [Opportunities to eliminate duplication]

#### Performance Optimizations
- [Specific performance improvements]
- [Memory usage optimizations]
- [Algorithm improvements]

#### Testing Recommendations
- [Missing test cases]
- [Test quality improvements]
- [Integration test suggestions]

### 📝 Action Items

#### Must Fix (Before Merge)
- [ ] [Critical issues that block deployment]
- [ ] [Security vulnerabilities]
- [ ] [Breaking changes]

#### Should Fix (Soon)
- [ ] [Important improvements]
- [ ] [Performance issues]
- [ ] [Maintainability concerns]

#### Nice to Have (Future)
- [ ] [Minor improvements]
- [ ] [Style consistency]
- [ ] [Documentation enhancements]

## Example Request

"Review this authentication middleware for security issues, error handling, and code quality. Focus on JWT validation and rate limiting implementation."

## Quality Checklist

- [ ] All code paths have been examined
- [ ] Security implications have been considered
- [ ] Performance impact has been assessed
- [ ] Error handling is comprehensive
- [ ] Code follows project conventions
- [ ] Suggestions are specific and actionable
- [ ] Priority levels are clearly indicated