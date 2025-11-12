# ccxl - Claude Code XL

> Intelligent Claude Code setup for any project

## 🎉 **v2.0 - Rebuilt for Claude Code 2.0**

**What's New:**
- 🛡️ **Git Safety System** - Prevents data loss from destructive git operations (NEW!)
  - Auto-blocks `git reset --hard`, `git clean -fd` if changes exist
  - 4 safe git commands: `/safe-switch`, `/safe-commit`, `/safe-reset`, `/git-safety-status`
  - Automatic backup branches before dangerous operations
  - **Solves the #1 complaint: AI losing months of work**
- ✅ **90% lighter** - Removed Puppeteer (200MB → 0MB) using Jina AI Reader
- ✅ **Claude Code 2.0 compatible** - Updated permission format, hooks support
- ✅ **Modern frameworks** - Added Astro, Remix, SvelteKit, Prisma, Drizzle, tRPC
- ✅ **Node 20+** - Built for modern Node.js (ESM-ready)
- ✅ **Monorepo support** - Turborepo, Nx, pnpm/yarn workspaces

**Upgrading from v1?** Run `npx ccxl@latest` - it auto-detects and migrates old configs.

## 🎯 What This Does

Claude Setup automatically analyzes your project and configures Claude Code for optimal performance by:

- **🔍 Analyzing** your project structure, dependencies, and frameworks
- **📚 Fetching** relevant documentation for your tech stack
- **⚙️ Configuring** Claude permissions and settings
- **📝 Generating** project-specific context and guidelines
- **🔧 Handling** existing setups intelligently

## 🚀 Quick Start

### Option 1: NPX (Recommended)
```bash
# Run in any project directory
npx claude-setup
```

### Option 2: Global Install
```bash
# Install once
npm install -g claude-setup

# Use anywhere
claude-setup
```

### Option 3: Local Development
```bash
# Clone and install
git clone <this-repo>
cd claude-setup
npm install

# Run in any project
node bin/cli.js
```

## 🧠 What It Detects

### Languages
- **JavaScript/TypeScript** - package.json, tsconfig.json
- **Python** - requirements.txt, pyproject.toml
- **Go** - go.mod, go.sum
- **Rust** - Cargo.toml, Cargo.lock

### Frontend Frameworks
- **React** - React 19, Next.js, Remix
- **Vue** - Vue 3, Nuxt.js
- **Svelte** - SvelteKit
- **Modern**: Astro, SolidJS, Qwik, Angular

### Backend Frameworks
- **Node.js**: Express, Fastify
- **Python**: Django, Flask, FastAPI

### Data & ORM Tools
- **Prisma** - schema detection, migration tools
- **Drizzle ORM** - config and schemas
- **tRPC** - type-safe APIs

### Build Tools & Package Managers
- **Bundlers**: Vite, Webpack
- **Package Managers**: npm, yarn, pnpm, bun (auto-detected)

### Monorepo Support
- **Turborepo** - turbo.json detection
- **Nx** - nx.json detection
- **pnpm workspaces** - pnpm-workspace.yaml
- **Yarn workspaces** - package.json workspaces
- **Lerna** - lerna.json (legacy)

### Project Structure
- Source code organization
- Test files and structure
- Documentation presence
- Configuration files

## 📁 What It Creates

```
your-project/
├── .claude/
│   ├── settings.json          # Claude Code 2.0 configuration
│   ├── settings.local.json    # Local overrides
│   └── commands/              # Custom slash commands
│       ├── generate-tests.md  # /generate-tests
│       ├── plan-feature.md    # /plan-feature
│       ├── review-code.md     # /review-code
│       ├── fix-github-issue.md# /fix-github-issue
│       ├── debug-logs.md      # /debug-logs
│       └── refactor-code.md   # /refactor-code
├── CLAUDE.md                  # Project-specific context
└── docs/
    ├── fetched/               # Framework documentation
    └── combined-docs.md       # All docs in one file
```

## ⚡ Claude Code 2.0 Features

### Smart Permission System
ccxl generates Claude Code 2.0 settings with three permission tiers:

**Allow** (No prompts - productive development)
- File operations: `Read`, `Edit`, `Write`
- Code navigation: `Glob`, `Grep`
- Safe bash: `ls`, `cat`, `git status`, `git diff`, `npm list`
- Documentation: `WebFetch`

**Ask** (Confirmation required - potentially dangerous)
- Package management: `npm install`, `yarn add`, `pnpm install`
- Git commits: `git commit`, `git push`
- Build/test: `npm run build`, `npm test`

**Deny** (Blocked - dangerous operations)
- Sensitive files: `.env`, `credentials.*`, `secrets/**`
- Destructive: `rm`, `sudo`, `chmod`, `chown`
- Exfiltration: `curl` (can leak data)

### Automated Hooks
For TypeScript projects, ccxl automatically configures:
- **PostToolUse**: Type-checking after edits (`tsc --noEmit`)
- **Prettier**: Code formatting after writes (if detected)

Custom hooks can be added for:
- Linting on file changes
- Test runs on code edits
- Auto-formatting with project tools

### Custom Commands
Six pre-built slash commands for common workflows:
- **/generate-tests** - Comprehensive test generation
- **/plan-feature** - Feature planning before implementation
- **/review-code** - Security & quality review
- **/fix-github-issue** - Systematic bug fixing
- **/debug-logs** - Log analysis and diagnosis
- **/refactor-code** - Safe code improvements

## 🛡️ Git Safety System (NEW in v2.0!)

**The Problem:** AI assistants can run destructive git commands that lose months of work:
- `git reset --hard` discards all uncommitted changes
- `git clean -fd` deletes untracked files permanently
- Branch switches without stashing lose work-in-progress
- Partial commits leave important files uncommitted

**The Solution:** ccxl installs a comprehensive git safety system that **prevents data loss before it happens**.

### How It Works

**1. Safety Hook (`~/.claude/hooks/git-safety-check.sh`)**
- Runs automatically before EVERY git operation
- Blocks dangerous commands if uncommitted changes exist
- Auto-creates backup branches before risky operations
- Shows clear error messages with safe alternatives

**2. Safe Git Commands** (4 new slash commands)
```bash
/safe-switch <branch>       # Stash + switch branches safely
/safe-commit "message"      # See ALL files before committing
/safe-reset <commit>        # Auto-backup before reset
/git-safety-status          # Comprehensive pre-flight check
```

**3. Three-Tier Permission System**
- **Allow** (safe operations): `git status`, `git diff`, `git log`, `git stash`, `git add`
- **Ask** (confirmation required): `git reset`, `git clean`, `git push --force`
- **Deny** (blocked completely): `git reset --hard`, `git clean -fd`

### Example: What Gets Blocked

```bash
# ❌ This would be BLOCKED (uncommitted changes exist):
git reset --hard HEAD~1

# ✅ Instead, you see:
🚫 BLOCKED: Uncommitted changes detected

Modified files:
 M lib/important-feature.js
 M lib/other-work.js

Safe alternatives:
  • git stash push -m 'before operation'
  • /safe-reset HEAD~1  (creates backup first)
  • /git-safety-status  (check full status)
```

### Example: Safe Branch Switch

```bash
/safe-switch feature-branch

# Automatically:
# 1. Shows uncommitted changes
# 2. Stashes them with descriptive message
# 3. Switches to target branch
# 4. Shows how to recover stash
```

### What You Get

✅ **Automatic backups** - Safety branches created before dangerous operations
✅ **Full visibility** - See ALL files (staged/unstaged/untracked) before commits
✅ **Clear guidance** - Error messages show safe alternatives
✅ **Zero data loss** - Work is protected even if you make mistakes
✅ **Recovery tools** - Commands to find and restore lost work

The git safety system is **always active** once ccxl runs. No configuration needed.

## 🔧 Command Options

```bash
# Full setup (default)
claude-setup

# Just analyze, don't change anything
claude-setup --dry-run

# Only fetch documentation
claude-setup --docs-only

# Update existing setup
claude-setup --update

# Start fresh (removes existing)
claude-setup --reset

# Development mode (verbose)
claude-setup --dev
```

## 🎨 Smart Features

### Existing Project Handling
- Detects existing Claude setup
- Offers to update vs overwrite
- Preserves custom configurations
- Resolves conflicts automatically

### Framework-Specific Documentation
- Fetches official documentation
- Optimizes content for Claude
- Combines into searchable format
- Updates when stale

### Dynamic Configuration
- Permissions based on detected languages
- Framework-specific settings
- Project structure awareness

### Professional Polish
- Input validation with detailed error messages
- Automatic update detection and management
- Smart error handling with helpful suggestions
- Version tracking and backup system
- Testing integration

## 🧪 Testing

Comprehensive test suite ensures reliability:

```bash
npm test              # Fast test suite
npm run test:all      # Complete test suite
npm run test:manual   # Manual CLI testing
```

**Test Coverage:**
- ✅ **19/19 Integration Tests** - Full workflow validation
- ✅ **20/20 Manual Tests** - CLI flag combinations
- ✅ **3/3 Real-World Tests** - Actual repository testing
- ✅ **100% Safety Audit** - All permissions verified safe
- ✅ **Unit Tests** - Core component testing

See [TESTING.md](TESTING.md) for detailed testing information.

## 🤝 Contributing

### Adding New Framework Adapters

1. Create `adapters/your-framework.js`:
```javascript
class YourFrameworkAdapter {
  async fetch(options = {}) {
    // Fetch and return documentation
  }
}
module.exports = new YourFrameworkAdapter();
```

2. Register in `lib/documentation.js`:
```javascript
const adapters = {
  // ...
  'your-framework': require('../adapters/your-framework')
};
```

### Adding Project Templates

1. Create `templates/your-type.md`
2. Use placeholders like `[PROJECT_NAME]`, `[FRAMEWORKS]`
3. Template will be used automatically

## � Future Development Ideas

### Session Context Continuity
**Problem:** When Claude Code restarts, all conversation context is lost, making it difficult to resume work efficiently.

**Potential Solutions:**
- **Terminal Output Logging:** Continuous logging of all terminal activity using `script` or similar tools
- **Intelligent Context Parsing:** Rule-based parsing (no LLM/tokens) to extract meaningful context from logs:
  - Recent commands and outputs
  - Error messages and debugging attempts
  - Test results and build status
  - Git activity and file changes
- **Context Distillation:** Generate lightweight summaries for Claude Code to read on startup
- **Integration Options:** Shell hooks, VS Code extension, or standalone utility

**Implementation:** Two-stage approach - raw logging for completeness, intelligent parsing for context handoff.

### Enhanced Documentation Integration
- **Live Documentation Updates:** Automatically update project docs based on code changes
- **Framework-Specific Adapters:** Specialized documentation scrapers for popular frameworks
- **Local Documentation Cache:** Offline access to fetched documentation
- **Documentation Versioning:** Track documentation changes over time

### Advanced Project Analysis
- **Dependency Graph Analysis:** Understand project architecture and relationships
- **Code Quality Metrics:** Integrate with linting and testing tools for better context
- **Performance Monitoring:** Track build times and optimization opportunities
- **Security Scanning:** Basic security checks and recommendations

### Team Collaboration Features
- **Shared Context:** Team-wide context sharing and knowledge base
- **Onboarding Automation:** Automated setup for new team members
- **Best Practices Enforcement:** Project-specific coding standards and guidelines
- **Change Impact Analysis:** Understand how changes affect different parts of the project

### IDE and Editor Integration
- **VS Code Extension:** Direct integration with popular editors
- **Shell Integration:** Seamless terminal workflow integration
- **Git Hooks:** Automatic context updates on commits and merges
- **Workspace Management:** Multi-project context switching

---

*These ideas are documented for future consideration and community input. The current tool focuses on providing excellent core functionality without complexity.*

## �📄 License

MIT

---

*Built for developers who want Claude Code to understand their projects from day one.*