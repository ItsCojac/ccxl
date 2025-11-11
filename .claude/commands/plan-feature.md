# Plan Feature

Create a comprehensive implementation plan for a new feature before writing code.

## Instructions

1. **Understand the Request**: Clarify the feature requirements and expected behavior
2. **Analyze Impact**:
   - Identify affected components/modules
   - Review existing code that might be related
   - Consider integration points
3. **Design the Solution**:
   - Propose the architecture/approach
   - Identify data models or schema changes
   - Plan API contracts or interfaces
   - Consider error handling strategy
4. **Break Down Tasks**:
   - Create step-by-step implementation plan
   - Identify dependencies between tasks
   - Estimate complexity for each step
5. **Identify Risks**:
   - What could break?
   - What are the unknowns?
   - What's the rollback strategy?
6. **Define Success Criteria**:
   - How will we know it's working?
   - What tests are needed?
   - What documentation should be updated?

## Output Format

Present the plan using:
```markdown
## 🎯 Feature Goal
[Clear description of what we're building and why]

## 📋 Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## 🏗️ Architecture Changes
[Describe the approach and components affected]

## 📝 Implementation Steps
1. [Step 1 with details]
2. [Step 2 with details]
...

## ⚠️ Risks & Mitigation
- **Risk**: [Description] → **Mitigation**: [Strategy]

## ✅ Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## 🧪 Testing Strategy
[How will this be tested?]
```

**Wait for user approval before implementing the plan.**
