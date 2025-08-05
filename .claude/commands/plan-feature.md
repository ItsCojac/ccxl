# Plan Feature

Plan and design a new feature before implementation.

## Usage

Use this command when you need to:
- Design a new feature from requirements
- Break down complex functionality into steps
- Plan API endpoints and data structures
- Consider architecture and integration points

## Instructions for Claude

1. **Understand the Requirements**:
   - Clarify the feature's purpose and goals
   - Identify target users and use cases
   - Understand constraints and dependencies
   - Ask clarifying questions if needed

2. **Analyze Current System**:
   - Review existing codebase structure
   - Identify relevant components and patterns
   - Consider integration points
   - Assess impact on existing functionality

3. **Design the Solution**:
   - Break down into logical components
   - Define data models and structures
   - Plan API endpoints (if applicable)
   - Consider error handling and edge cases
   - Think about testing strategy

4. **Create Implementation Plan**:
   - List tasks in logical order
   - Identify dependencies between tasks
   - Estimate complexity and effort
   - Consider rollback and migration strategies

## Planning Template

### 📋 Feature Overview
- **Goal**: [What problem does this solve?]
- **Users**: [Who will use this feature?]
- **Success Criteria**: [How do we know it's working?]

### 🏗️ Technical Design
- **Components**: [What parts need to be built/modified?]
- **Data Models**: [What data structures are needed?]
- **APIs**: [What endpoints or interfaces?]
- **Integration**: [How does it connect to existing code?]

### 📝 Implementation Steps
1. [ ] [Step 1 with brief description]
2. [ ] [Step 2 with brief description]
3. [ ] [Continue...]

### ⚠️ Risks & Considerations
- **Technical Risks**: [What could go wrong?]
- **Dependencies**: [What do we need from others?]
- **Performance**: [Any performance implications?]
- **Security**: [Security considerations?]

### 🧪 Testing Strategy
- **Unit Tests**: [What needs unit testing?]
- **Integration Tests**: [What integration points to test?]
- **Manual Testing**: [What needs manual verification?]

## Example Request

"Plan a user authentication feature with JWT tokens, including login, logout, password reset, and role-based permissions."

## Quality Checklist

- [ ] Requirements are clearly understood
- [ ] Solution fits with existing architecture
- [ ] Implementation steps are logical and ordered
- [ ] Risks and dependencies are identified
- [ ] Testing approach is comprehensive
- [ ] Plan is detailed enough to start coding