# Refactor Code

Improve code structure, readability, and maintainability without changing functionality.

## Instructions

### 1. Understand Current State
- Read and comprehend the existing code thoroughly
- Identify what it does and why it exists
- Note any tests that cover this code
- **CRITICAL**: Ensure you understand the functionality before changing anything

### 2. Identify Issues
Common refactoring opportunities:
- Code duplication (DRY violations)
- Long functions/methods (>50 lines)
- Deep nesting (>3 levels)
- Unclear naming
- Mixed concerns/responsibilities
- Complex conditionals
- Magic numbers/strings
- Tight coupling

### 3. Plan Refactoring
- Define specific improvements
- Ensure tests exist (write them if not)
- Plan incremental changes
- Consider backwards compatibility
- Identify risks

### 4. Refactor Incrementally
- Make one change at a time
- Run tests after each change
- Commit working states
- Don't change functionality
- Keep changes focused and reviewable

### 5. Verify
- All tests still pass
- Functionality unchanged
- Code is more readable
- Performance not degraded
- No new bugs introduced

## Refactoring Patterns

### Extract Function
```javascript
// Before
function processOrder(order) {
  // 50 lines of complex logic
}

// After
function processOrder(order) {
  validateOrder(order);
  calculateTotal(order);
  applyDiscounts(order);
  processPayment(order);
}
```

### Extract Variable
```javascript
// Before
if (user.age > 18 && user.hasLicense && !user.isSuspended) { }

// After
const canDrive = user.age > 18 && user.hasLicense && !user.isSuspended;
if (canDrive) { }
```

### Replace Magic Numbers
```javascript
// Before
if (status === 1) { }

// After
const STATUS_ACTIVE = 1;
if (status === STATUS_ACTIVE) { }
```

### Simplify Conditionals
```javascript
// Before
if (condition) {
  return true;
} else {
  return false;
}

// After
return condition;
```

## Output Format

```markdown
## 🎯 Refactoring Goal
[What we're improving and why]

## 📋 Issues Identified
- [Issue 1]: [Description]
- [Issue 2]: [Description]

## 🛠️ Changes Made
### [Change 1: Extract function "validateInput"]
**Before**: [Code snippet or description]
**After**: [Improved code]
**Benefit**: [Why this is better]

## ✅ Verification
- [ ] All tests pass
- [ ] Functionality unchanged
- [ ] Code is more readable
- [ ] No performance regression

## 📊 Metrics
**Before**: [Lines of code, complexity, etc.]
**After**: [Improved metrics]
```

**Remember**: Refactoring means improving structure WITHOUT changing behavior. If you're adding features, that's not refactoring.
