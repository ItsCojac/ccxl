# Fix GitHub Issue

Systematically investigate and fix a GitHub issue with full context and testing.

## Instructions

### 1. Gather Context
- Read the issue description carefully
- Check related issues and pull requests
- Review any linked code or error messages
- Understand the expected vs actual behavior

### 2. Reproduce the Issue
- Set up a minimal reproduction if not provided
- Verify you can reproduce the problem
- Document the exact steps to reproduce
- Note any error messages or stack traces

### 3. Investigate Root Cause
- Use debugging tools to trace the problem
- Check relevant code sections
- Review recent changes that might have introduced the bug
- Identify the actual vs expected behavior
- **Don't just fix symptoms - find the root cause**

### 4. Design the Fix
- Plan the minimal change needed to fix the issue
- Consider edge cases and side effects
- Ensure the fix doesn't break existing functionality
- Think about backwards compatibility

### 5. Implement
- Write the fix following project conventions
- Add or update tests to cover the bug
- Ensure all existing tests still pass
- Update documentation if needed

### 6. Verify
- Test the fix against the original reproduction
- Run the full test suite
- Check for regressions
- Test edge cases

### 7. Document
- Add clear comments explaining the fix
- Update the issue with your findings
- Prepare a detailed PR description

## Output Format

```markdown
## 🐛 Issue Analysis
**Issue**: [Link and summary]
**Root Cause**: [What's actually causing the problem]
**Impact**: [What's affected]

## 🔍 Reproduction
Steps to reproduce:
1. [Step 1]
2. [Step 2]
...

Expected: [What should happen]
Actual: [What happens instead]

## 🛠️ Solution
**Approach**: [How we're fixing it]
**Changes**: [What files/functions are modified]
**Tests**: [What tests are added/updated]

## ✅ Verification
- [ ] Bug is fixed in reproduction case
- [ ] All tests pass
- [ ] No regressions found
- [ ] Edge cases tested
- [ ] Documentation updated

## 📝 Commit Message
```
fix: [clear description of the fix]

- [What was wrong]
- [How it's fixed]
- [Any caveats or notes]

Fixes #[issue-number]
```
```

**Always test thoroughly before marking as complete.**
