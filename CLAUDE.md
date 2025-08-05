# CLAUDE.md - Project Guidelines for AI-Assisted Development

> This document provides context and guidelines for Claude Code and other AI assistants working on this project. It serves as persistent memory across sessions and ensures consistent, high-quality contributions.

## 🎯 Project Overview

### What This Is
<!-- Brief description of project purpose and value proposition -->
**Project Name:** [Your Project Name]
**Purpose:** [What problem does this solve?]
**Users:** [Who will use this?]
**Stage:** [POC / MVP / Production]

### Core Philosophy
<!-- Your project's guiding principles -->
1. **Understand Before Acting**: Read and comprehend the existing system before making changes
2. **Preserve Functionality**: The code works today - don't break it
3. **Minimize Complexity**: Choose the simplest solution that solves the actual problem
4. **User-First Thinking**: Every change should improve the user experience

> **Context Hygiene:**
> Keep each `CLAUDE.md` focused—only include what’s essential for that scope. Avoid dumping every detail into a single file to preserve performance.

## 🏗️ Architecture & Structure

### Project Layout
```
project-root/
├── src/           # [Main source code]
├── tests/         # [Test files]
├── docs/          # [Documentation]
├── config/        # [Configuration files]
└── ...            # [Other key directories]
```

### Key Components
<!-- Document your main modules/services and their responsibilities -->
- **Component A**: Handles [responsibility]
- **Component B**: Manages [responsibility]
- **Component C**: Provides [responsibility]

### Data Flow
```
[Input] → [Processing] → [Storage] → [Output]
```
<!-- Describe how data moves through your system -->

### External Dependencies
<!-- List critical external services, APIs, or libraries -->
- **Service/Library**: Purpose and any special considerations
- **API Endpoint**: Authentication method and rate limits

## 📋 Development Standards

### Code Style
<!-- Language-agnostic principles that apply to your project -->
- **Naming Conventions**: [camelCase/snake_case/PascalCase preferences]
- **File Organization**: [How files should be structured]
- **Comment Style**: [When and how to comment]
- **Error Handling**: [How errors should be managed]
- **Testing Approach**: [TDD/BDD/other methodology]

### Quality Gates
<!-- Checks that MUST pass before accepting changes -->
- [ ] All existing tests pass
- [ ] New code has appropriate test coverage
- [ ] Code follows project style guidelines
- [ ] No linting errors or warnings
- [ ] Documentation updated if needed
- [ ] No console errors in runtime

### Git Conventions
- **Branch Naming**: `feature/`, `fix/`, `chore/` prefixes
- **Commit Messages**: [Conventional Commits / other standard]
- **PR Process**: [Required reviews, checks, etc.]

## 🧭 Feature Planning Template

Use this checklist before starting any new feature:

- **📌 Goal:**
- **🔗 Modules Affected:**
- **📝 Steps:**
  - [ ] Write failing tests (TDD)
  - [ ] Implement minimal solution
  - [ ] Refactor & document
- **⚠️ Risks & Rollback Plan:**
- **✅ Done Criteria:**

## 🛠️ Common Tasks

### Essential Commands
```bash
# Development
[command]         # Start development environment
[command]         # Run tests
[command]         # Check code quality
[command]         # Build for production

# Debugging
[command]         # View logs
[command]         # Run in debug mode
```

### Typical Workflows

#### Adding a New Feature
1. Understand the current implementation
2. Design the solution (document if complex)
3. Write tests first (if using TDD)
4. Implement the minimal working solution
5. Refactor for clarity and performance
6. Update documentation
7. Submit for review

#### Fixing a Bug
1. Reproduce the issue
2. Identify root cause (not just symptoms)
3. Write a failing test that exposes the bug
4. Implement the fix
5. Verify all tests pass
6. Check for similar issues elsewhere

## ⚠️ Critical Warnings

### DO NOT
<!-- Things that should never be done -->
- ❌ Modify [protected file/component] without explicit approval
- ❌ Change core interfaces without understanding all dependencies
- ❌ Deploy directly to production
- ❌ Store sensitive data in [specify locations]
- ❌ Ignore existing tests that start failing

### Known Issues
<!-- Document any quirks or gotchas -->
- **Issue**: [Description and workaround]
- **Limitation**: [What doesn't work and why]

## 🧭 Decision Framework

When making technical decisions, consider:

1. **User Impact**: How does this affect the end user?
2. **Complexity Cost**: Is added complexity justified?
3. **Maintenance Burden**: How hard will this be to maintain?
4. **Performance**: Will this scale appropriately?
5. **Security**: Are we introducing vulnerabilities?
6. **Reversibility**: Can we easily undo this if needed?

## 🔍 Before You Code

### Analysis Checklist
- [ ] What problem am I actually solving?
- [ ] What components will be affected?
- [ ] What could break if I change this?
- [ ] Is there existing code that already does this?
- [ ] What's the simplest approach that could work?
- [ ] How will I test this?

### Implementation Checklist
- [ ] Have I understood the full context?
- [ ] Am I following project conventions?
- [ ] Have I considered edge cases?
- [ ] Is my solution maintainable?
- [ ] Have I updated relevant documentation?

## 📊 Testing Strategy

### Test Categories
- **Unit Tests**: Test individual functions/methods
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows

### Coverage Requirements
- Minimum coverage: [X]%
- Critical paths must have 100% coverage
- New features require comprehensive tests

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Migration scripts ready (if needed)
- [ ] Rollback plan documented

### Environments
- **Development**: [URL/location]
- **Staging**: [URL/location]
- **Production**: [URL/location]

## 📚 Resources

### Documentation
- [API Documentation](link)
- [Architecture Diagrams](link)
- [User Guide](link)

### Team Conventions
- [Style Guide](link)
- [Code Review Guidelines](link)
- [Security Best Practices](link)

## 🤝 Collaboration Guidelines

### Working with This Codebase
1. **Start Small**: Make incremental changes, not massive refactors
2. **Communicate Intent**: Document what you're doing and why
3. **Ask When Uncertain**: Better to clarify than assume
4. **Test Thoroughly**: Your code will affect real users
5. **Leave It Better**: Each change should improve the codebase

### AI Assistant Specific Instructions
<!-- Instructions specifically for Claude or other AI tools -->
- Always preserve existing functionality unless explicitly asked to change it
- Prefer enhancing existing patterns over introducing new ones
- When suggesting changes, explain the trade-offs
- Flag any security concerns immediately
- If unsure about project conventions, ask for clarification
- Update this CLAUDE.md file when establishing new patterns

## 📝 Session Memory

### Recent Decisions
<!-- Updated during development sessions -->
- [Date]: [Decision made and rationale]

### Current Focus
<!-- What we're working on right now -->
- Active Feature: [Description]
- Known Context: [Relevant information]
- Next Steps: [Planned work]

---

*Last Updated: [Date]*
*Version: [X.X.X]*

<!-- 
To update this file during a session:
- Use # prefix for quick additions
- Run /memory to edit comprehensively
- Keep it concise - this loads with every request
-->

## 🔍 Sub-module Context Review

> **Claude**, whenever you notice a **subdirectory** that:
> 1. Has its **own commands**, workflows, or configs not covered above  
> 2. Introduces **new dependencies** or patterns  
> 3. Contains **more than 5 source files**  
>
> Then prompt me:  
> “It looks like `<subdirectory>/` has its own conventions—consider adding `<subdirectory>/CLAUDE.md` to capture them.”

## 📚 Documentation Access and Usage

Claude: Always consult `docs/parsed-docs.md` before making code or architecture suggestions.

If this file appears outdated:
```bash
bash scripts/update-docs.sh
```
run this script to update the documentation before:

- Making design, architectural, or code-related recommendations  
- Implementing new features  
- Refactoring or reviewing existing code  

Never assume framework behavior or project conventions.  
Always defer to parsed documentation when available.  
If the documentation is missing or incomplete, follow the instructions below.

---

## 📥 When Documentation Is Missing or Outdated

If the relevant documentation is missing, outdated, or unclear:

1. Re-parse the source files by running:

       bash scripts/update-docs.sh

2. Re-evaluate your suggestions using the updated file(s).

If the documentation still lacks detail, ask for clarification or notify the user to update upstream sources.

---

## ⚙️ CLI Permissions

Ensure Claude Code is permitted to run required commands by including the following in your `.claude/settings.local.json`:

       {
         "$schema": "https://json.schemastore.org/claude-code-settings.json",
         "permissions": {
           "allow": [
             "Bash(ls:*)",
             "Bash(cat:*)",
             "Bash(echo:*)",
             "Bash(llama-parse:*)",
             "Bash(bash:*)"
           ],
           "deny": []
         }
       }

---

## 🚀 Usage Flow

1. Add new documentation sources under `docs/raw/`
2. Run `bash scripts/update-docs.sh` (yourself or via Claude Code)
3. Claude will reference `docs/parsed-docs.md` when reviewing or generating code
4. If content is missing, Claude should ask you to refresh or update the source