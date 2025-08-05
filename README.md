# Claude Setup

> Intelligent Claude Code setup for any project

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
- JavaScript/TypeScript (package.json)
- Python (requirements.txt, pyproject.toml)
- Go (go.mod)
- Rust (Cargo.toml)

### Frameworks
- **Frontend**: React, Vue, Angular, Svelte, Next.js, Nuxt.js
- **Backend**: Express, Fastify, Django, Flask, FastAPI
- **And more...**

### Project Structure
- Source code organization
- Test files and structure
- Documentation presence
- Configuration files

## 📁 What It Creates

```
your-project/
├── .claude/
│   ├── settings.json          # Claude configuration
│   ├── settings.local.json    # Local permissions
│   └── commands/              # Custom commands
├── CLAUDE.md                  # Project-specific context
└── docs/
    ├── fetched/               # Framework documentation
    └── combined-docs.md       # All docs in one file
```

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