# Claude Setup CLI Usage

## Basic Usage
```bash
npx claude-setup
```

## Available Flags

### **Analysis & Output**
- `-d, --dry-run` - Analyze project without making changes
- `-y, --yes` - Skip confirmation prompts (auto-approve)
- `-q, --quiet` - Minimal output (only errors and warnings)
- `-v, --verbose` - Detailed output with debug information
- `--dev` - Development mode with verbose logging

### **Selective Operations**
- `--docs-only` - Only fetch documentation
- `--no-docs` - Skip documentation fetching
- `--commands-only` - Only update command templates
- `--settings-only` - Only update settings files

### **Setup Modes**
- `--update` - Update existing setup
- `--reset` - Start fresh (removes existing setup)

### **Permission Control**
- `--safe-only` - Only include ultra-safe permissions (read-only)
- `--include-destructive` - Include some safe destructive operations in team settings

### **Project Overrides**
- `--framework <frameworks>` - Force specific frameworks (comma-separated)
  - Example: `--framework react,typescript`
- `--language <languages>` - Force specific languages (comma-separated)
  - Example: `--language javascript,python`

### **Advanced Options**
- `--output-dir <dir>` - Specify output directory (default: current directory)
- `--config <file>` - Use custom configuration file

## Examples

### Quick Setup
```bash
# Basic setup with confirmation
npx claude-setup

# Auto-approve setup
npx claude-setup --yes

# Quiet setup
npx claude-setup --quiet --yes
```

### Analysis Only
```bash
# See what would be done
npx claude-setup --dry-run

# Verbose analysis
npx claude-setup --dry-run --verbose
```

### Selective Updates
```bash
# Only update documentation
npx claude-setup --docs-only

# Only update command templates
npx claude-setup --commands-only

# Update without fetching docs
npx claude-setup --no-docs
```

### Permission Modes
```bash
# Ultra-safe permissions only
npx claude-setup --safe-only

# Include some safe destructive operations
npx claude-setup --include-destructive
```

### Force Project Type
```bash
# Force React + TypeScript setup
npx claude-setup --framework react,typescript --language typescript,javascript

# Force Python setup
npx claude-setup --language python --framework django
```

### Advanced Usage
```bash
# Setup in different directory
npx claude-setup --output-dir /path/to/project

# Use custom config
npx claude-setup --config ./my-claude-config.json

# Complete reset with verbose output
npx claude-setup --reset --verbose
```

## Configuration File Format

You can use `--config` to specify a JSON file with default options:

```json
{
  "yes": true,
  "verbose": true,
  "framework": ["react", "typescript"],
  "includeDestructive": false,
  "noDocs": false
}
```

## Permission Levels

### Default (Recommended)
- Comprehensive read-only operations
- Safe analysis and inspection tools
- No destructive operations

### `--safe-only`
- Only basic file reading (`ls`, `cat`, `pwd`)
- Basic git status (`git status`, `git diff`)
- Ultra-conservative for maximum safety

### `--include-destructive`
- Adds carefully selected safe destructive operations:
  - Temp file creation (`touch *.tmp`)
  - Backup operations (`cp * *.bak`)
  - Safe git operations (`git add *.md`, `git stash`)
  - Clean installs (`npm ci`, `yarn install --frozen-lockfile`)
  - Safe formatting (`prettier --write *.md`)
