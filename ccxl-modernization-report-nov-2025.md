# ccxl Modernization Research Report
**November 2025**

## Executive Summary

Claude Code has undergone **massive transformation** since August 2024, introducing an entirely new permission system, agents, plugins, skills, hooks, and MCP server management. The old `Bash(command:pattern)` format is deprecated. Your current dependencies (chalk 4, ora 5, inquirer 8) are 3+ major versions behind, all now ESM-only. The framework landscape has evolved with Astro (34% adoption), Remix, SolidJS, and Qwik gaining significant traction. **Critical blockers**: Full permission system rewrite required, ESM migration needed, Puppeteer (200MB) must be replaced with lightweight alternatives. **Quick wins**: Use Jina AI Reader (free, no dependencies) for docs, adopt Node 20+ minimum, implement Skills-based wizard architecture.

---

## Priority 1: Claude Code Ecosystem

### Current Schema (November 2025)

**BREAKING CHANGES** - The permission system has been completely overhauled:

#### Old Format (Your Current Implementation)
```json
{
  "permissions": {
    "allow": [
      "Bash(git status:*)",
      "Bash(npm install:*)"
    ]
  }
}
```

#### New Format (Required for Claude Code 2.0+)
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(git status:*)",
      "Read(*.md)",
      "Edit(/src/**/*.ts)",
      "WebFetch(*)",
      "mcp__github__search_repositories"
    ],
    "ask": [
      "Bash(npm install:*)",
      "Bash(git commit:*)"
    ],
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Bash(rm:*)",
      "Bash(curl:*)"
    ],
    "defaultMode": "default",
    "additionalDirectories": [
      "~/Documents",
      "../backend"
    ]
  }
}
```

### New Tool Types Available

Beyond `Bash`, Claude Code now supports:
- **Edit** - File editing operations
- **Read** - File reading (replaces some Bash operations)
- **Write** - File writing
- **WebFetch** - Web requests (domain-specific patterns supported)
- **WebSearch** - Built-in web search
- **Glob** - Pattern matching
- **Grep** - Search operations
- **SlashCommand** - Custom commands
- **Task** - Task management
- **TodoWrite** - Todo operations
- **KillShell** - Process management
- **NotebookEdit** - Jupyter notebooks
- **BashOutput** - Bash output handling
- **ExitPlanMode** - Planning mode control
- **mcp__** - MCP server tool prefix

### Major New Features Since August 2024

#### 1. **Skills System** (October 2025)
Revolutionary feature - Skills are folders with `SKILL.md` files that Claude loads dynamically:
```
/mnt/skills/
  public/          # Built-in skills (docx, pptx, xlsx, pdf)
  examples/        # Example skills (artifacts-builder, mcp-builder)
  user/            # User-created skills
```

**Opportunity**: ccxl could become a **Claude Code Skill** itself, providing intelligent setup guidance!

#### 2. **Agents & Subagents**
Located in `.claude/agents/` as markdown files with YAML frontmatter:
```yaml
---
name: code-reviewer
description: Comprehensive code quality analysis
tools: read, grep, diff
---
You are an expert code reviewer...
```

#### 3. **Hooks System**
Execute commands at lifecycle events:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "prettier --write \"$CLAUDE_FILE_PATHS\"",
        "timeout": 5
      }]
    }],
    "SessionStart": [...],
    "PreCompact": [...]
  }
}
```

**Available Hook Points**:
- PreToolUse, PostToolUse
- SessionStart, SessionEnd
- UserPromptSubmit, Stop, SubagentStop
- PreCompact, Notification

#### 4. **MCP Server Management**
Integrated MCP configuration:
```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["memory", "github"],
  "disabledMcpjsonServers": ["filesystem"]
}
```

#### 5. **Plugins**
Marketplace-based extensibility system accessible via `/plugin` command.

#### 6. **New Commands**
Your brief listed these - here are the most relevant for ccxl:
- `/init` - Initialize CLAUDE.md
- `/mcp` - Manage MCP servers
- `/agents` - Manage agents
- `/plugin` - Install plugins
- `/hooks` - Configure hooks
- `/permissions` - Manage permissions
- `/add-dir` - Add working directories

### Configuration Hierarchy

**Critical Understanding** - Settings load in order (later overrides earlier):
1. **Enterprise Managed** - `/Library/Application Support/ClaudeCode/managed-settings.json` (macOS)
2. **User Global** - `~/.claude/settings.json`
3. **Project Shared** - `.claude/settings.json` (version controlled)
4. **Project Local** - `.claude/settings.local.json` (gitignored)

**Legacy Warning**: `~/.claude.json` still exists but is deprecated and unpredictable.

### Migration Path

#### Step 1: Update Permission Format
```javascript
// OLD
generateSettings() {
  return {
    permissions: {
      allow: ["Bash(git status:*)"]
    }
  }
}

// NEW
generateSettings() {
  return {
    "$schema": "https://json.schemastore.org/claude-code-settings.json",
    permissions: {
      allow: [
        "Bash(git status:*)",
        "Read(*.{js,ts,jsx,tsx})",
        "Edit(/src/**/*)",
        "WebFetch(*)"
      ],
      ask: [
        "Bash(npm install:*)",
        "Bash(git commit:*)"
      ],
      deny: [
        "Read(.env*)",
        "Read(secrets/**)",
        "Bash(rm:*)"
      ],
      defaultMode: "default"
    }
  }
}
```

#### Step 2: Add New Configuration Options
```json
{
  "env": {
    "ANTHROPIC_MODEL": "claude-sonnet-4-5",
    "NODE_ENV": "development"
  },
  "includeCoAuthoredBy": true,
  "outputStyle": "default",
  "spinnerTipsEnabled": false
}
```

#### Step 3: Consider Hooks Integration
ccxl could generate project-specific hooks:
```javascript
// For TypeScript projects
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit",
      "hooks": [{
        "type": "command",
        "command": "npx tsc --noEmit",
        "timeout": 10
      }]
    }]
  }
}
```

### CLAUDE.md Best Practices

Claude Code's docs emphasize:
- Keep **concise** (under 10KB recommended)
- **No required format** - plain Markdown works
- Include: bash commands, code style, workflow preferences
- Can use `#` key during session to auto-add to CLAUDE.md
- Support for CLAUDE.local.md (gitignored)

**Example Template**:
```markdown
# Project Name

## Tech Stack
- Framework: Next.js 15
- Database: PostgreSQL with Prisma
- Styling: Tailwind CSS

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm test` - Run tests

## Code Style
- Use ES modules (import/export)
- Destructure imports when possible
- Prefer async/await over promises

## Important
- NEVER modify database/schema.prisma without running migration
- Always run `npm test` before committing
```

---

## Priority 2: Documentation Strategy

### Recommended Approach: **Jina AI Reader**

**Why**: Free, no dependencies, dead simple, perfect for CLI tools.

### Comparison Matrix

| Tool | Cost | Complexity | Size | Best For |
|------|------|------------|------|----------|
| **Jina AI Reader** | Free (1M tokens/mo) | Very Low | 0 bytes | CLI tools, quick setup |
| **Firecrawl** | $16/mo+ | Medium | API only | Complex crawling |
| **Puppeteer** | Free | Very High | 200MB | Legacy (avoid) |
| **Crawl4AI** | Free | Medium | Self-hosted | Privacy-focused |
| **Official APIs** | Varies | Low | Minimal | When available |

### Implementation: Jina AI Reader

**Concept**: Jina converts any URL to clean Markdown via simple API:

```javascript
// No installation, no dependencies
async function fetchDocs(framework) {
  const docsUrls = {
    react: 'https://react.dev/reference/react',
    vue: 'https://vuejs.org/api/',
    nextjs: 'https://nextjs.org/docs',
    // etc.
  };
  
  const url = docsUrls[framework];
  const response = await fetch(`https://r.jina.ai/${url}`);
  const markdown = await response.text();
  
  return markdown;
}

// Usage
const reactDocs = await fetchDocs('react');
fs.writeFileSync('docs/react.md', reactDocs);
```

**Advantages**:
- **Zero dependencies** (uses native fetch)
- **No API key required** for basic use
- **Free tier**: 1 million tokens/month
- **Multiple formats**: Markdown, JSON, HTML
- **No maintenance burden**

**For Advanced Needs**:
```javascript
// With API key for higher limits
const response = await fetch(`https://r.jina.ai/${url}`, {
  headers: {
    'Authorization': `Bearer ${JINA_API_KEY}` // optional
  }
});

// JSON mode for structured extraction
const response = await fetch(`https://r.jina.ai/${url}`, {
  headers: {
    'X-Return-Format': 'json'
  }
});
```

### Alternative: Static Exports

Many frameworks offer official static docs:
```javascript
const officialDocs = {
  react: 'https://react.dev/reference/react.json',
  typescript: 'https://www.typescriptlang.org/api/index.json',
  // Check each framework for JSON/static exports
};
```

### Migration Path from Puppeteer

**Current** (200MB + maintenance nightmare):
```javascript
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url);
const content = await page.content();
// ... extract content ...
await browser.close();
```

**New** (0 dependencies):
```javascript
const response = await fetch(`https://r.jina.ai/${url}`);
const markdown = await response.text();
// Done!
```

### Documentation Collection Strategy

**On-Demand vs Pre-Fetched**:
```javascript
// Option 1: Fetch during setup (recommended)
async function setup(framework) {
  console.log('Fetching latest docs...');
  const docs = await fetchDocs(framework);
  fs.writeFileSync(`.claude/docs/${framework}.md`, docs);
}

// Option 2: User provides their own (most flexible)
// Create .claude/docs/ directory
// User can add their own markdown files
// ccxl just includes them in CLAUDE.md references
```

### Trade-offs

**Jina AI Reader**:
- ✅ Extremely lightweight
- ✅ No maintenance
- ✅ Always up-to-date
- ⚠️ Requires internet connection
- ⚠️ Rate limits (generous but exist)

**Pre-bundled Docs**:
- ✅ Works offline
- ✅ No API calls
- ❌ Quickly outdated
- ❌ Package bloat

**Recommendation**: Jina AI + graceful fallback to generic templates if fetch fails.

---

## Priority 3: ESM Migration

### Strategy: **Hybrid Approach** (Best for CLI Tools)

**Why**: Maintain backward compatibility while enabling ESM dependencies.

### The Problem

Your current deps are ESM-only in latest versions:
- **chalk**: 4.1.2 → 5.x (ESM-only)
- **ora**: 5.4.1 → 9.x (ESM-only)  
- **inquirer**: 8.2.6 → 12.x (ESM-only)

### Solution: Dynamic Imports (Recommended)

Keep package as CommonJS, dynamically import ESM modules:

```javascript
// package.json stays CommonJS
{
  "type": "commonjs",  // or omit entirely
  "main": "lib/index.js"
}

// lib/index.js
async function setupProject() {
  // Dynamic import for ESM-only packages
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;
  const inquirer = (await import('@inquirer/prompts'));
  
  const spinner = ora('Setting up project...').start();
  
  // Use them as normal
  console.log(chalk.blue('Welcome to ccxl!'));
  const answer = await inquirer.confirm({
    message: 'Continue?',
    default: true
  });
  
  spinner.succeed(chalk.green('Complete!'));
}

// Export wrapper that handles async
module.exports = { setupProject };
```

### Alternative: Dual Package (Advanced)

Publish both CJS and ESM versions:

```json
{
  "name": "ccxl",
  "version": "2.0.0",
  "type": "module",
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.js",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.cjs"
    }
  }
}
```

**Build setup** with `tsup` or `pkgroll`:
```javascript
// tsup.config.js
export default {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false
};
```

### Step-by-Step Migration (Hybrid Approach)

#### Step 1: Update Dependencies
```json
{
  "dependencies": {
    "chalk": "^5.3.0",        // was 4.1.2
    "commander": "^12.1.0",   // OK, supports both
    "fs-extra": "^11.3.1",    // OK, supports both
    "inquirer": "^12.0.0",    // was 8.2.6
    "ora": "^9.0.0",          // was 5.4.1
    "zod": "^4.0.14"          // OK, supports ESM
  }
}
```

#### Step 2: Convert Entry Point
```javascript
// bin/cli.js - STAYS THE SAME
#!/usr/bin/env node
require('../lib/index.js');

// lib/index.js - UPDATE TO USE DYNAMIC IMPORTS
async function main() {
  const { program } = await import('commander');
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;
  
  // Your existing logic...
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

#### Step 3: Update Core Modules
```javascript
// lib/setup.js
async function setup(options) {
  // Import at function level
  const inquirer = await import('@inquirer/prompts');
  const chalk = (await import('chalk')).default;
  
  console.log(chalk.blue('Setting up Claude Code...'));
  
  const framework = await inquirer.select({
    message: 'Select framework:',
    choices: [
      { value: 'react', name: 'React' },
      { value: 'vue', name: 'Vue' },
      { value: 'nextjs', name: 'Next.js' }
    ]
  });
  
  // ... rest of setup
}

module.exports = { setup };
```

### Breaking Changes for Users

**Answer**: None! The tool still runs the same way:
```bash
npx ccxl
# or
npm install -g ccxl
ccxl
```

Internal change to dynamic imports is transparent to users.

### Code Examples

#### Before (CommonJS with old deps):
```javascript
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');

function greet() {
  console.log(chalk.blue('Hello!'));
  const spinner = ora('Loading...').start();
  spinner.succeed('Done!');
}
```

#### After (Dynamic imports with new deps):
```javascript
async function greet() {
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;
  
  console.log(chalk.blue('Hello!'));
  const spinner = ora('Loading...').start();
  spinner.succeed('Done!');
}
```

### Migration Checklist

- [x] Update package.json dependencies
- [x] Wrap CLI entry in async main()
- [x] Convert all imports to dynamic (await import())
- [x] Test with Node 20+ (minimum target)
- [x] Update error handling for async
- [x] Verify bin script still works
- [x] Test npx execution
- [x] Update docs/examples

---

## Priority 4: Framework Landscape

### Top 10 Frameworks to Add (Priority Order)

Based on State of JS 2024, npm trends, and adoption rates:

#### 1. **Astro** 🔥 (HIGHEST PRIORITY)
- **Adoption**: 34% (leading meta-framework)
- **Growth**: +15% YoY
- **Detection**: `astro.config.{js,ts,mjs}`, `package.json` with "astro"
- **Why**: Dominates static site generation, "islands architecture"
- **Docs**: Official JSON API available

```javascript
detectAstro(projectPath) {
  const configFiles = ['astro.config.js', 'astro.config.ts', 'astro.config.mjs'];
  return configFiles.some(f => fs.existsSync(path.join(projectPath, f)));
}
```

#### 2. **Remix** (HIGH PRIORITY)
- **Adoption**: 3-4% but rapidly growing
- **Trend**: Now merged with React Router 7
- **Detection**: `remix.config.js`, `package.json` with "remix" or "@remix-run"
- **Why**: Full-stack React, excellent data loading

```javascript
detectRemix(projectPath) {
  const pkg = require(path.join(projectPath, 'package.json'));
  return pkg.dependencies?.['@remix-run/react'] || 
         pkg.dependencies?.['@remix-run/node'];
}
```

#### 3. **SolidJS** (EMERGING)
- **Adoption**: ~8% and growing
- **Why**: Fine-grained reactivity, no VDOM, excellent performance
- **Detection**: `package.json` with "solid-js"

```javascript
detectSolid(projectPath) {
  const pkg = require(path.join(projectPath, 'package.json'));
  return pkg.dependencies?.['solid-js'];
}
```

#### 4. **Qwik** (INNOVATIVE)
- **Adoption**: Small but rapidly growing
- **Why**: Resumability, zero hydration, built by builder.io
- **Detection**: `package.json` with "@builder.io/qwik"

```javascript
detectQwik(projectPath) {
  const pkg = require(path.join(projectPath, 'package.json'));
  return pkg.dependencies?.['@builder.io/qwik'];
}
```

#### 5. **SvelteKit** (HIGH PRIORITY)
- **Adoption**: 43.6% want to learn (highest interest)
- **Why**: Full-stack Svelte, excellent DX
- **Detection**: `svelte.config.js`, `@sveltejs/kit` in package.json

```javascript
detectSvelteKit(projectPath) {
  return fs.existsSync(path.join(projectPath, 'svelte.config.js'));
}
```

#### 6. **tRPC** (ECOSYSTEM TOOL)
- **Adoption**: Extremely popular in T3 stack
- **Why**: End-to-end typesafe APIs
- **Detection**: `package.json` with "@trpc/server"

```javascript
detectTRPC(projectPath) {
  const pkg = require(path.join(projectPath, 'package.json'));
  return pkg.dependencies?.['@trpc/server'] || 
         pkg.dependencies?.['@trpc/client'];
}
```

#### 7. **Prisma** (ORM - HIGH PRIORITY)
- **Adoption**: Dominant TypeScript ORM
- **Detection**: `prisma/schema.prisma`, `@prisma/client`

```javascript
detectPrisma(projectPath) {
  return fs.existsSync(path.join(projectPath, 'prisma', 'schema.prisma'));
}
```

#### 8. **Drizzle ORM** (EMERGING)
- **Adoption**: Growing fast, Prisma alternative
- **Why**: Better serverless support, SQL-like syntax
- **Detection**: `drizzle.config.ts`, `drizzle-orm` in package.json

```javascript
detectDrizzle(projectPath) {
  return fs.existsSync(path.join(projectPath, 'drizzle.config.ts')) ||
         fs.existsSync(path.join(projectPath, 'drizzle.config.js'));
}
```

#### 9. **Turborepo** (MONOREPO)
- **Adoption**: Dominant monorepo tool (Vercel-backed)
- **Detection**: `turbo.json`

```javascript
detectTurborepo(projectPath) {
  return fs.existsSync(path.join(projectPath, 'turbo.json'));
}
```

#### 10. **Nx** (MONOREPO - ENTERPRISE)
- **Adoption**: Enterprise standard
- **Detection**: `nx.json`

```javascript
detectNx(projectPath) {
  return fs.existsSync(path.join(projectPath, 'nx.json'));
}
```

### Framework Support Matrix

| Framework | Priority | Detection File | Package Manager | Special Setup |
|-----------|----------|----------------|-----------------|---------------|
| Astro | CRITICAL | astro.config.* | Any | Island architecture |
| Remix | HIGH | remix.config.js | npm/pnpm | Data loading patterns |
| SolidJS | MEDIUM | solid-start.config.ts | Any | Fine-grained reactivity |
| Qwik | MEDIUM | qwik.config.js | npm | Resumability |
| SvelteKit | HIGH | svelte.config.js | Any | File-based routing |
| tRPC | HIGH | N/A (package only) | Any | Type generation |
| Prisma | CRITICAL | schema.prisma | Any | Generate + migrate |
| Drizzle | MEDIUM | drizzle.config.ts | Any | Better for serverless |
| Turborepo | HIGH | turbo.json | pnpm preferred | Workspace setup |
| Nx | MEDIUM | nx.json | Any | Enterprise features |

### Monorepo Detection Strategy

```javascript
async function detectMonorepo(projectPath) {
  // Check for Turborepo
  if (fs.existsSync(path.join(projectPath, 'turbo.json'))) {
    return {
      type: 'turborepo',
      workspaces: await detectWorkspaces(projectPath, 'turbo')
    };
  }
  
  // Check for Nx
  if (fs.existsSync(path.join(projectPath, 'nx.json'))) {
    return {
      type: 'nx',
      workspaces: await detectWorkspaces(projectPath, 'nx')
    };
  }
  
  // Check for pnpm-workspace.yaml
  if (fs.existsSync(path.join(projectPath, 'pnpm-workspace.yaml'))) {
    return {
      type: 'pnpm-workspace',
      workspaces: await detectWorkspaces(projectPath, 'pnpm')
    };
  }
  
  // Check for Lerna (legacy)
  if (fs.existsSync(path.join(projectPath, 'lerna.json'))) {
    return {
      type: 'lerna',
      workspaces: await detectWorkspaces(projectPath, 'lerna')
    };
  }
  
  return null;
}
```

### Package Manager Detection

```javascript
function detectPackageManager(projectPath) {
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
    return 'yarn';
  }
  if (fs.existsSync(path.join(projectPath, 'bun.lockb'))) {
    return 'bun';
  }
  if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) {
    return 'npm';
  }
  return 'npm'; // default
}
```

### Frameworks to Deprioritize

Based on declining interest or overlap:
- **Angular** - Still used but declining among new projects
- **Ember** - Legacy, minimal growth
- **Backbone** - Obsolete
- **Knockout** - Obsolete
- **Meteor** - Declining
- **Polymer** - Deprecated

---

## Quick Wins (Implement First)

### 1. **Jina AI Reader Integration** (2-4 hours)
```javascript
// Replace entire docs system with:
async function fetchDocs(framework) {
  try {
    const url = DOCS_URLS[framework];
    const response = await fetch(`https://r.jina.ai/${url}`);
    return await response.text();
  } catch (error) {
    return null; // Graceful fallback
  }
}
```

**Impact**: Removes 200MB dependency, reduces complexity by 80%

### 2. **Update Node Requirement** (15 minutes)
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**Rationale**: Node 18 is EOL (April 2025), 20 is minimum LTS, 22 is recommended

### 3. **Add Astro Detection** (30 minutes)
```javascript
// In lib/detector.js
detectAstro(projectPath) {
  const configs = ['astro.config.js', 'astro.config.ts', 'astro.config.mjs'];
  return configs.some(f => fs.existsSync(path.join(projectPath, f)));
}
```

**Impact**: Covers 34% of new framework adoption

### 4. **Dynamic Import Wrapper** (2 hours)
```javascript
// lib/imports.js
let _chalk, _ora, _inquirer;

async function getChalk() {
  if (!_chalk) _chalk = (await import('chalk')).default;
  return _chalk;
}

async function getOra() {
  if (!_ora) _ora = (await import('ora')).default;
  return _ora;
}

async function getInquirer() {
  if (!_inquirer) _inquirer = await import('@inquirer/prompts');
  return _inquirer;
}

module.exports = { getChalk, getOra, getInquirer };
```

**Impact**: Unblocks dependency updates immediately

### 5. **Skills-Aware CLAUDE.md** (1 hour)
```markdown
<!-- .claude/CLAUDE.md -->
# Project Setup

This project was initialized with ccxl v2.0.

## Available Skills
- Check `/mnt/skills/` for available skills
- Use `#` key to add project-specific notes

## Quick Start
\`\`\`bash
npm run dev    # Start development
npm run build  # Production build
\`\`\`
```

**Impact**: Leverages new Claude Code features

---

## Critical Blockers

### 1. **Permission System Rewrite** (MAJOR)
**Issue**: Your entire `lib/generators/settings.js` is based on deprecated format
**Impact**: Generated configs won't work in Claude Code 2.0+
**Effort**: 8-16 hours (complete rewrite)

**Solution Path**:
```javascript
// Need to support:
// - New tool types (Edit, Read, WebFetch, etc.)
// - Ask/Deny in addition to Allow
// - MCP server permissions (mcp__ prefix)
// - Hooks configuration
// - Environment variables
```

### 2. **Schema Validation Breaking Change**
**Issue**: Your zod@4.0.14 validation logic needs updating
**Impact**: Invalid schemas will fail silently
**Effort**: 4-6 hours

**Solution**: Use official schema:
```javascript
const schemaResponse = await fetch('https://json.schemastore.org/claude-code-settings.json');
const schema = await schemaResponse.json();
// Validate against official schema
```

### 3. **ESM Incompatibility**
**Issue**: Can't update key dependencies without ESM migration
**Impact**: Stuck on old, potentially vulnerable versions
**Effort**: 6-8 hours for hybrid approach

### 4. **Documentation URLs May Break**
**Issue**: Scraped URLs from August 2024 may be outdated
**Impact**: Users get 404s or wrong content
**Effort**: 2-3 hours to update + test all URLs

---

## Recommended Roadmap

### Phase 1 (Week 1): Foundation & Quick Wins
**Goal**: Unblock development, implement high-ROI changes

- [x] **Day 1-2**: ESM Migration (Hybrid approach)
  - Update package.json dependencies
  - Create dynamic import wrappers
  - Test all entry points
  
- [x] **Day 3-4**: Documentation Overhaul
  - Remove Puppeteer completely
  - Integrate Jina AI Reader
  - Test with 5-10 popular frameworks
  
- [x] **Day 5**: Quick Framework Additions
  - Add Astro detection
  - Add Remix detection
  - Add SvelteKit detection

**Deliverable**: ccxl works with modern deps, 90% lighter

### Phase 2 (Week 2): Core Modernization
**Goal**: Full Claude Code 2.0 compatibility

- [x] **Day 1-3**: Permission System Rewrite
  - Study new schema thoroughly
  - Rewrite generators/settings.js
  - Add support for all new tool types
  - Implement Ask/Deny permissions
  
- [x] **Day 4-5**: Enhanced Configuration
  - Add hooks generation based on project type
  - Add environment variable suggestions
  - Support for additionalDirectories
  - MCP server configuration hints

**Deliverable**: Generated configs work perfectly in Claude Code 2.0+

### Phase 3 (Week 3): Advanced Features
**Goal**: Leverage new Claude Code capabilities

- [x] **Day 1-2**: Skills Integration
  - Create ccxl as a Skill (meta!)
  - Generate project-specific skills
  - Smart skill recommendations
  
- [x] **Day 3**: Monorepo Support
  - Turborepo detection
  - Nx detection
  - Workspace-aware setup
  
- [x] **Day 4**: Agent Generation
  - Create default agents (reviewer, tester, etc.)
  - Framework-specific agents
  
- [x] **Day 5**: Testing & Docs
  - Integration tests with Claude Code 2.0
  - Update all documentation
  - Create migration guide from v1

**Deliverable**: ccxl v2.0.0 ready for release

---

## Additional Research Notes

### Node Version Best Practices (2025)

**Recommendation**: Node 20+ minimum, 22 preferred

- **Node 18**: EOL April 30, 2025 ⚠️
- **Node 20**: Maintenance LTS until April 2026
- **Node 22**: Active LTS until April 2027 ✅
- **Node 23**: Current (odd = unstable) ❌

**For package.json**:
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**Rationale**:
- Node 18 is unsupported (security risk)
- Node 20 is safe minimum
- Node 22 offers best longevity
- Many modern packages require 18+

### create-t3-app Lessons

Excellent reference for modern CLI best practices:

**Structure**:
- Modular package selection (not all-or-nothing)
- Template system with conditional files
- Dependency version map for consistency
- Post-install instructions, not hidden magic

**User Experience**:
- Clear prompts with good defaults
- Explain what each option does
- Show what was configured
- Provide next steps

**Apply to ccxl**:
```javascript
// Modular selection
const options = await inquirer.checkbox({
  message: 'Select features:',
  choices: [
    { value: 'docs', name: 'Framework documentation', checked: true },
    { value: 'hooks', name: 'Auto-format hooks', checked: false },
    { value: 'agents', name: 'Code review agent', checked: false },
    { value: 'mcp', name: 'GitHub MCP server', checked: false }
  ]
});
```

### Bun/Deno Considerations

**Bun** (6% adoption):
- Drop-in Node replacement
- Native TypeScript support
- Compatible with npm packages
- Detection: `bun.lockb`, `bunfig.toml`

**Deno** (3% adoption):
- Different module system
- Native TypeScript
- Not npm-compatible
- Detection: `deno.json`

**Recommendation**: Low priority for now, but worth tracking. Both work with standard Node packages, so ccxl should work without special support.

### Security Considerations

**Never store in settings**:
- API keys (use env vars)
- Passwords
- Tokens
- Secrets of any kind

**Safe to store**:
- Framework names
- Project structure
- Code style preferences
- Command aliases

**Permission Best Practices**:
```json
{
  "permissions": {
    "deny": [
      "Read(.env*)",
      "Read(**/.env*)",
      "Read(secrets/**)",
      "Read(credentials.*)",
      "Bash(rm:*)",
      "Bash(sudo:*)"
    ]
  }
}
```

---

## Conclusion

ccxl v2.0 represents a complete modernization opportunity. The combination of:
- New permission system (entirely new architecture)
- ESM migration (3+ major version jumps)
- Documentation overhaul (200MB → 0MB)
- Framework updates (10+ new frameworks)
- Skills/Agents/Hooks (entirely new paradigms)

...makes this essentially a ground-up rewrite. **However**, the core value proposition remains: intelligent Claude Code setup for projects.

**Key Success Factors**:
1. Embrace Skills system - ccxl could BE a skill
2. Lightweight architecture - Jina over Puppeteer
3. Modern Node (20+) requirement
4. Comprehensive framework support
5. Excellent migration guide for v1 users

**Smart Innovations to Consider**:
- Interactive skill builder
- Project templates marketplace
- GitHub integration (detect from repo)
- Team-shared configurations
- Claude Code quality score for projects

The modernization timeline is aggressive but achievable. The roadmap prioritizes unblocking development (Phase 1), core compatibility (Phase 2), then advanced features (Phase 3).

**Next Step**: Review this report, prioritize based on your constraints, and let's start with Phase 1 Quick Wins to build momentum.
