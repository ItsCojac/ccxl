const { validateSettings, formatValidationErrors } = require('../validation');

/**
 * Generates Claude Code 2.0 settings based on project analysis
 * New format: allow/ask/deny permissions, modern tool types, hooks support
 */
function generateSettings(analysis, options = {}) {
  // Core safe permissions - always allow these
  const allowedTools = [
    // File operations - allow for productive development
    "Read(**/*)",
    "Edit(**/*)",
    "Write(**/*)",

    // Search and navigation
    "Glob(**/*)",
    "Grep(*)",

    // Safe bash operations
    "Bash(ls:*)",
    "Bash(cat:*)",
    "Bash(head:*)",
    "Bash(tail:*)",
    "Bash(pwd:*)",
    "Bash(which:*)",

    // Git read operations
    "Bash(git status:*)",
    "Bash(git diff:*)",
    "Bash(git log:*)",
    "Bash(git show:*)",
    "Bash(git branch:*)",

    // System info
    "Bash(node --version:*)",
    "Bash(npm --version:*)",
    "Bash(uname:*)",
    "Bash(whoami:*)",

    // Web fetching (for documentation)
    "WebFetch(*)"
  ];

  // Operations that require confirmation (potentially dangerous)
  const askPermissions = [
    // Package management (can modify dependencies)
    "Bash(npm install:*)",
    "Bash(npm ci:*)",
    "Bash(yarn install:*)",
    "Bash(pnpm install:*)",
    "Bash(bun install:*)",

    // Git write operations (permanent changes)
    "Bash(git commit:*)",
    "Bash(git push:*)",

    // Potentially long-running or resource-intensive
    "Bash(npm run build:*)",
    "Bash(npm run test:*)"
  ];

  // Explicitly denied operations
  const deniedTools = [
    // Sensitive files
    "Read(.env*)",
    "Read(**/.env*)",
    "Read(secrets/**)",
    "Read(credentials.*)",
    "Edit(.env*)",
    "Write(.env*)",

    // Destructive operations
    "Bash(rm:*)",
    "Bash(rmdir:*)",
    "Bash(sudo:*)",
    "Bash(curl:*)", // Can exfiltrate data

    // System modifications
    "Bash(chmod:*)",
    "Bash(chown:*)"
  ];

  // Add language-specific permissions
  if (analysis.languages.includes('javascript') || analysis.languages.includes('typescript')) {
    allowedTools.push(
      "Bash(npm list:*)",
      "Bash(npm outdated:*)",
      "Bash(npm view:*)",
      "Read(package.json)",
      "Read(package-lock.json)",
      "Read(tsconfig.json)"
    );

    if (analysis.packageManager === 'yarn') {
      allowedTools.push("Bash(yarn list:*)");
      askPermissions.push("Bash(yarn add:*)");
    }

    if (analysis.packageManager === 'pnpm') {
      allowedTools.push("Bash(pnpm list:*)");
      askPermissions.push("Bash(pnpm add:*)");
    }

    // Bun support
    if (analysis.packageManager === 'bun') {
      allowedTools.push("Bash(bun --version:*)");
      askPermissions.push("Bash(bun install:*)");
    }
  }

  if (analysis.languages.includes('python')) {
    allowedTools.push(
      "Bash(python --version:*)",
      "Bash(pip list:*)",
      "Bash(pip show:*)",
      "Read(requirements.txt)",
      "Read(pyproject.toml)"
    );
    askPermissions.push("Bash(pip install:*)");
  }

  if (analysis.languages.includes('go')) {
    allowedTools.push(
      "Bash(go version:*)",
      "Bash(go list:*)",
      "Read(go.mod)",
      "Read(go.sum)"
    );
    askPermissions.push("Bash(go get:*)");
  }

  if (analysis.languages.includes('rust')) {
    allowedTools.push(
      "Bash(cargo --version:*)",
      "Bash(rustc --version:*)",
      "Read(Cargo.toml)",
      "Read(Cargo.lock)"
    );
    askPermissions.push("Bash(cargo build:*)");
  }

  // Framework-specific permissions
  if (analysis.frameworks.includes('react') || analysis.frameworks.includes('nextjs')) {
    allowedTools.push(
      "Read(pages/**/*)",
      "Read(app/**/*)",
      "Read(public/**/*)"
    );
  }

  if (analysis.frameworks.includes('astro')) {
    allowedTools.push(
      "Read(astro.config.*)",
      "Read(src/pages/**/*)",
      "Read(src/components/**/*)"
    );
  }

  // Prisma/Drizzle support
  if (analysis.frameworks.includes('prisma')) {
    allowedTools.push(
      "Read(prisma/schema.prisma)",
      "Bash(npx prisma:*)"
    );
    deniedTools.push("Bash(npx prisma migrate:*)"); // Require explicit approval
  }

  if (analysis.frameworks.includes('drizzle')) {
    allowedTools.push(
      "Read(drizzle.config.*)",
      "Read(drizzle/**/*)"
    );
  }

  // Generate hooks based on project type
  const hooks = generateHooks(analysis, options);

  // Create settings object
  const settings = {
    "$schema": "https://json.schemastore.org/claude-code-settings.json",
    permissions: {
      allow: allowedTools,
      ask: askPermissions,
      deny: deniedTools,
      defaultMode: "default"
    }
  };

  // Add hooks if any were generated
  if (hooks && Object.keys(hooks).length > 0) {
    settings.hooks = hooks;
  }

  // Add environment variables if needed
  if (analysis.frameworks.length > 0) {
    settings.env = {
      NODE_ENV: "development"
    };
  }

  // Validate settings before returning
  const validation = validateSettings(settings);
  if (!validation.success) {
    throw new Error(`Settings validation failed:\n${formatValidationErrors(validation.errors)}`);
  }

  return validation.data || settings;
}

/**
 * Generate hooks based on project type
 */
function generateHooks(analysis, options = {}) {
  const hooks = {};

  // TypeScript projects: type-check after edits
  if (analysis.languages.includes('typescript')) {
    hooks.PostToolUse = hooks.PostToolUse || [];
    hooks.PostToolUse.push({
      matcher: "Edit|Write",
      hooks: [{
        type: "command",
        command: "npx tsc --noEmit",
        timeout: 10,
        continueOnError: true
      }]
    });
  }

  // Prettier formatting (if detected)
  if (analysis.dependencies?.prettier) {
    hooks.PostToolUse = hooks.PostToolUse || [];
    hooks.PostToolUse.push({
      matcher: "Edit|Write",
      hooks: [{
        type: "command",
        command: "npx prettier --write \"$CLAUDE_FILE_PATHS\"",
        timeout: 5,
        continueOnError: true
      }]
    });
  }

  return hooks;
}

/**
 * Generates local settings template with common permissions
 */
function generateLocalSettings() {
  return {
    "$schema": "https://json.schemastore.org/claude-code-settings.json",
    permissions: {
      allow: [
        "WebFetch(*)",

        // File operations
        "Read(**/*)",
        "Edit(**/*)",
        "Write(**/*)",

        // Search and navigation
        "Glob(**/*)",
        "Grep(*)",

        // Bash operations (customize as needed)
        "Bash(ls:*)",
        "Bash(cat:*)",
        "Bash(pwd:*)",
        "Bash(git:*)",

        // Development tools
        "Bash(npm:*)",
        "Bash(node:*)",
        "Bash(npx:*)"
      ],
      deny: [
        // Protect sensitive files
        "Read(.env*)",
        "Edit(.env*)",
        "Write(.env*)",

        // Prevent destructive operations
        "Bash(rm:*)",
        "Bash(sudo:*)"
      ]
    }
  };
}

module.exports = {
  generateSettings,
  generateLocalSettings
};
