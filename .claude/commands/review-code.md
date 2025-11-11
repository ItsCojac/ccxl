# Review Code

Perform a thorough code review focusing on quality, security, and best practices.

## Review Checklist

### 🔍 Code Quality
- [ ] **Readability**: Is the code easy to understand?
- [ ] **Naming**: Are variables, functions, and classes well-named?
- [ ] **Complexity**: Is the code appropriately simple? Any unnecessary complexity?
- [ ] **DRY Principle**: Is there code duplication that should be refactored?
- [ ] **Error Handling**: Are errors handled gracefully?
- [ ] **Edge Cases**: Are boundary conditions and edge cases considered?

### 🔒 Security
- [ ] **Input Validation**: Is user input properly validated and sanitized?
- [ ] **SQL Injection**: Are database queries parameterized?
- [ ] **XSS Prevention**: Is output properly escaped?
- [ ] **Authentication**: Are auth checks in place where needed?
- [ ] **Sensitive Data**: Are secrets/credentials properly protected?
- [ ] **Dependencies**: Are there any known vulnerabilities?

### 🚀 Performance
- [ ] **Efficiency**: Are there obvious performance bottlenecks?
- [ ] **Memory Usage**: Any potential memory leaks?
- [ ] **Database Queries**: Are queries efficient (N+1 problem)?
- [ ] **Caching**: Should anything be cached?

### 🧪 Testing
- [ ] **Test Coverage**: Are there adequate tests?
- [ ] **Test Quality**: Are tests meaningful and maintainable?
- [ ] **Edge Cases**: Are edge cases tested?

### 📚 Documentation
- [ ] **Comments**: Are complex sections well-commented?
- [ ] **API Docs**: Are public APIs documented?
- [ ] **README**: Does documentation need updating?

### 🏗️ Architecture
- [ ] **Separation of Concerns**: Are responsibilities clearly separated?
- [ ] **Consistency**: Does it follow project conventions?
- [ ] **Dependencies**: Are dependencies appropriate and minimal?
- [ ] **Backwards Compatibility**: Any breaking changes?

## Instructions

1. Review the code systematically using the checklist above
2. Categorize findings by severity:
   - 🔴 **Critical**: Security issues, bugs, or breaking changes
   - 🟡 **Important**: Code quality, performance, or maintainability issues
   - 🔵 **Suggestions**: Nice-to-have improvements
3. Provide specific, actionable feedback with code examples
4. Acknowledge what's done well
5. Suggest concrete improvements

## Output Format

```markdown
## Summary
[Brief overview of the review]

## 🔴 Critical Issues
- **Issue**: [Description]
  **Location**: [File:Line]
  **Fix**: [Specific recommendation]

## 🟡 Important Issues
[Same format as critical]

## 🔵 Suggestions
[Same format as critical]

## ✅ Strengths
- [What's done well]

## Overall Assessment
[Approve / Request Changes / Comment]
```
