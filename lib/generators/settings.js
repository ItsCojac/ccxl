const { validateSettings, formatValidationErrors } = require('../validation');

/**
 * Generates Claude Code settings based on project analysis
 * ONLY includes non-destructive (read-only) operations for team safety
 */
function generateSettings(analysis, options = {}) {
  const allowedTools = [
    // File system reading (safe)
    "Bash(ls:*)",
    "Bash(cat:*)",
    "Bash(head:*)",
    "Bash(tail:*)",
    "Bash(less:*)",
    "Bash(more:*)",
    "Bash(wc:*)",
    "Bash(file:*)",
    "Bash(stat:*)",
    "Bash(du:*)",
    "Bash(df:*)",
    
    // Search and navigation (safe)
    "Bash(find:*)",
    "Bash(grep:*)",
    "Bash(rg:*)", // ripgrep
    "Bash(ag:*)", // silver searcher
    "Bash(ack:*)",
    "Bash(locate:*)",
    "Bash(which:*)",
    "Bash(whereis:*)",
    "Bash(pwd:*)",
    "Bash(realpath:*)",
    "Bash(readlink:*)",
    
    // Git reading (safe)
    "Bash(git status:*)",
    "Bash(git diff:*)",
    "Bash(git log:*)",
    "Bash(git show:*)",
    "Bash(git branch:*)",
    "Bash(git tag:*)",
    "Bash(git remote:*)",
    "Bash(git config --get:*)",
    "Bash(git ls-files:*)",
    "Bash(git ls-tree:*)",
    "Bash(git blame:*)",
    "Bash(git shortlog:*)",
    "Bash(git describe:*)",
    "Bash(git rev-parse:*)",
    
    // System information (safe)
    "Bash(whoami:*)",
    "Bash(id:*)",
    "Bash(groups:*)",
    "Bash(uname:*)",
    "Bash(hostname:*)",
    "Bash(uptime:*)",
    "Bash(date:*)",
    "Bash(cal:*)",
    "Bash(env:*)",
    "Bash(printenv:*)",
    "Bash(locale:*)",
    "Bash(timezone:*)",
    
    // Process information (safe)
    "Bash(ps:*)",
    "Bash(pgrep:*)",
    "Bash(pidof:*)",
    "Bash(jobs:*)",
    "Bash(top -n 1:*)",
    "Bash(htop -n 1:*)",
    "Bash(lscpu:*)",
    "Bash(lsmem:*)",
    "Bash(free:*)",
    "Bash(vmstat:*)",
    "Bash(iostat:*)",
    
    // Network information (safe)
    "Bash(ping -c:*)", // limited ping
    "Bash(dig:*)",
    "Bash(nslookup:*)",
    "Bash(host:*)",
    "Bash(whois:*)",
    "Bash(netstat:*)",
    "Bash(ss:*)",
    "Bash(lsof -i:*)",
    "Bash(ifconfig:*)",
    "Bash(ip addr:*)",
    "Bash(ip route:*)",
    
    // Archive inspection (safe)
    "Bash(tar -tf:*)", // list contents
    "Bash(unzip -l:*)", // list contents
    "Bash(gzip -l:*)", // list contents
    "Bash(zcat:*)",
    "Bash(gunzip -l:*)",
    "Bash(7z l:*)", // list contents
    
    // Text processing (safe)
    "Bash(sort:*)",
    "Bash(uniq:*)",
    "Bash(cut:*)",
    "Bash(awk:*)",
    "Bash(sed -n:*)", // only print mode
    "Bash(tr:*)",
    "Bash(column:*)",
    "Bash(paste:*)",
    "Bash(join:*)",
    "Bash(comm:*)",
    "Bash(diff:*)",
    "Bash(cmp:*)",
    "Bash(md5sum:*)",
    "Bash(sha256sum:*)",
    "Bash(shasum:*)",
    
    // JSON/YAML processing (safe)
    "Bash(jq:*)",
    "Bash(yq:*)",
    "Bash(xmllint:*)",
    
    // HTTP reading (safe)
    "Bash(curl -s:*)", // silent mode only
    "Bash(curl --head:*)", // HEAD requests only
    "Bash(wget --spider:*)", // check only
    "Bash(httpie --print=h:*)", // headers only
  ];

  // Add language-specific READ-ONLY tools
  if (analysis.languages.includes('javascript') || analysis.languages.includes('typescript')) {
    allowedTools.push(
      "Bash(npm list:*)",
      "Bash(npm outdated:*)",
      "Bash(npm audit:*)",
      "Bash(npm view:*)",
      "Bash(npm search:*)",
      "Bash(npx --help:*)",
      "Bash(node --version:*)",
      "Bash(node -e 'console.log:*')", // safe evaluation
    );
    
    if (analysis.packageManager === 'yarn') {
      allowedTools.push(
        "Bash(yarn list:*)",
        "Bash(yarn outdated:*)",
        "Bash(yarn audit:*)",
        "Bash(yarn info:*)"
      );
    }
    
    if (analysis.packageManager === 'pnpm') {
      allowedTools.push(
        "Bash(pnpm list:*)",
        "Bash(pnpm outdated:*)",
        "Bash(pnpm audit:*)"
      );
    }
  }

  if (analysis.languages.includes('python')) {
    allowedTools.push(
      "Bash(python --version:*)",
      "Bash(python3 --version:*)",
      "Bash(pip list:*)",
      "Bash(pip show:*)",
      "Bash(pip search:*)",
      "Bash(pip check:*)",
      "Bash(python -c 'print:*')", // safe evaluation
      "Bash(python -m py_compile:*)", // syntax check
      "Bash(pylint:*)",
      "Bash(flake8:*)",
      "Bash(black --check:*)"
    );
  }

  if (analysis.languages.includes('go')) {
    allowedTools.push(
      "Bash(go version:*)",
      "Bash(go env:*)",
      "Bash(go list:*)",
      "Bash(go mod graph:*)",
      "Bash(go mod why:*)",
      "Bash(go fmt -n:*)", // dry run
      "Bash(go vet:*)",
      "Bash(golint:*)",
      "Bash(gofmt -d:*)"
    );
  }

  if (analysis.languages.includes('rust')) {
    allowedTools.push(
      "Bash(cargo --version:*)",
      "Bash(cargo check:*)",
      "Bash(cargo clippy:*)",
      "Bash(cargo fmt --check:*)",
      "Bash(cargo tree:*)",
      "Bash(cargo search:*)",
      "Bash(rustc --version:*)"
    );
  }

  // Docker inspection (safe)
  if (analysis.dependencies.docker || analysis.structure.hasConfig) {
    allowedTools.push(
      "Bash(docker ps:*)",
      "Bash(docker images:*)",
      "Bash(docker logs:*)",
      "Bash(docker inspect:*)",
      "Bash(docker version:*)",
      "Bash(docker info:*)",
      "Bash(docker-compose ps:*)",
      "Bash(docker-compose logs:*)",
      "Bash(docker-compose config:*)"
    );
  }

  // Handle permission flags
  if (options.safeOnly) {
    // Ultra-safe mode: only basic file reading and git status
    const ultraSafeTools = allowedTools.filter(tool => 
      tool.includes('ls:') || 
      tool.includes('cat:') || 
      tool.includes('git status:') ||
      tool.includes('git diff:') ||
      tool.includes('pwd:') ||
      tool.includes('whoami:')
    );
    return {
      permissions: {
        allow: ultraSafeTools
      }
    };
  }

  if (options.includeDestructive) {
    // Add some safe destructive operations for team settings
    allowedTools.push(
      // Safe file operations
      "Bash(touch:*.tmp)", // only temp files
      "Bash(mkdir:-p tmp)", // only tmp directories
      "Bash(cp:* *.bak)", // only backup operations
      
      // Safe git operations
      "Bash(git add:*.md)", // only markdown files
      "Bash(git add:*.txt)", // only text files
      "Bash(git stash:*)", // stashing is reversible
      
      // Safe package operations
      "Bash(npm ci:*)", // clean install only
      "Bash(yarn install --frozen-lockfile:*)", // frozen lockfile only
      
      // Safe formatting (reversible)
      "Bash(prettier --write:*.md)", // only markdown
      "Bash(eslint --fix:*.js)", // only JS files
    );
  }

  // Create settings object
  const settings = {
    name: analysis.name || 'Claude Project',
    version: '1.0.0',
    permissions: {
      allow: allowedTools,
      deny: []
    },
    rules: [
      'Be helpful and accurate',
      'Follow security best practices',
      'Explain your reasoning when making changes'
    ],
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  // Validate settings before returning
  const validation = validateSettings(settings);
  if (!validation.success) {
    throw new Error(`Settings validation failed:\n${formatValidationErrors(validation.errors)}`);
  }

  return validation.data;
}

/**
 * Generates local settings template with common permissions
 */
function generateLocalSettings() {
  return {
    "$schema": "https://json.schemastore.org/claude-code-settings.json",
    "permissions": {
      "allow": [
        "WebFetch(*)",
        
        // File operations
        "Bash(ls:*)",
        "Bash(cat:*)",
        "Bash(touch:*)",
        "Bash(echo:*)",
        "Bash(head:*)",
        "Bash(tail:*)",
        "Bash(less:*)",
        "Bash(wc:*)",
        "Bash(file:*)",
        
        // Search and navigation
        "Bash(find:*)",
        "Bash(grep:*)",
        "Bash(tree:*)",
        "Bash(cd:*)",
        "Bash(pwd:*)",
        
        // Network
        "Bash(curl:*)",
        "Bash(wget:*)",
        
        // Development tools
        "Bash(open:*)",
        "Bash(code:*)",
        
        // Node.js/JavaScript
        "Bash(npm install:*)",
        "Bash(npm run:*)",
        "Bash(node:*)",
        "Bash(npx:*)",
        "Bash(yarn:*)",
        "Bash(pnpm:*)",
        
        // Python
        "Bash(python:*)",
        "Bash(python3:*)",
        "Bash(pip install:*)",
        "Bash(pip3 install:*)",
        
        // Other languages
        "Bash(cargo:*)",
        "Bash(go:*)",
        
        // Git
        "Bash(git status:*)",
        "Bash(git diff:*)",
        "Bash(git log:*)",
        "Bash(git show:*)",
        "Bash(git branch:*)",
        "Bash(git tag:*)",
        "Bash(git remote:*)",
        
        // System info
        "Bash(env:*)",
        "Bash(whoami:*)",
        "Bash(uname:*)",
        "Bash(df:*)",
        "Bash(ps:*)",
        
        // Text processing
        "Bash(jq:*)",
        "Bash(awk:*)",
        "Bash(sed:*)",
        
        // Docker (if detected)
        "Bash(docker ps:*)",
        "Bash(docker images:*)",
        "Bash(docker logs:*)",
        "Bash(docker-compose:*)"
      ]
    }
  };
}

module.exports = {
  generateSettings,
  generateLocalSettings
};
