const fs = require('fs-extra');
const path = require('path');

/**
 * Analyzes a project to determine its type, frameworks, and dependencies
 */
async function analyzeProject(projectPath) {
  const analysis = {
    type: 'unknown',
    frameworks: [],
    languages: [],
    dependencies: {},
    packageManager: null,
    hasTests: false,
    structure: {},
    recommendations: []
  };

  try {
    // Check for package.json (Node.js/JavaScript)
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      analysis.type = 'javascript';
      analysis.packageManager = 'npm';
      analysis.dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // Detect frameworks
      if (analysis.dependencies.react) analysis.frameworks.push('react');
      if (analysis.dependencies.vue) analysis.frameworks.push('vue');
      if (analysis.dependencies.angular) analysis.frameworks.push('angular');
      if (analysis.dependencies.svelte) analysis.frameworks.push('svelte');
      if (analysis.dependencies.next) analysis.frameworks.push('nextjs');
      if (analysis.dependencies.nuxt) analysis.frameworks.push('nuxtjs');
      if (analysis.dependencies.astro) analysis.frameworks.push('astro');
      if (analysis.dependencies['@remix-run/react'] || analysis.dependencies['@remix-run/node']) {
        analysis.frameworks.push('remix');
      }
      if (analysis.dependencies['@sveltejs/kit']) analysis.frameworks.push('sveltekit');
      if (analysis.dependencies['solid-js']) analysis.frameworks.push('solidjs');
      if (analysis.dependencies['@builder.io/qwik']) analysis.frameworks.push('qwik');
      if (analysis.dependencies.express) analysis.frameworks.push('express');
      if (analysis.dependencies.fastify) analysis.frameworks.push('fastify');

      // ORMs and data tools
      if (analysis.dependencies['@prisma/client'] || await fs.pathExists(path.join(projectPath, 'prisma/schema.prisma'))) {
        analysis.frameworks.push('prisma');
      }
      if (analysis.dependencies['drizzle-orm'] || await fs.pathExists(path.join(projectPath, 'drizzle.config.ts'))) {
        analysis.frameworks.push('drizzle');
      }
      if (analysis.dependencies['@trpc/server'] || analysis.dependencies['@trpc/client']) {
        analysis.frameworks.push('trpc');
      }

      // Build tools
      if (analysis.dependencies.vite) analysis.frameworks.push('vite');
      if (analysis.dependencies.webpack) analysis.frameworks.push('webpack');
      
      // Detect languages
      if (analysis.dependencies.typescript || analysis.dependencies['@types/node']) {
        analysis.languages.push('typescript');
      }
      analysis.languages.push('javascript');

      // Check for other package managers
      if (await fs.pathExists(path.join(projectPath, 'bun.lockb'))) {
        analysis.packageManager = 'bun';
      } else if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
        analysis.packageManager = 'pnpm';
      } else if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
        analysis.packageManager = 'yarn';
      }

      // Detect monorepo setup
      analysis.monorepo = await detectMonorepo(projectPath);
    }

    // Check for Python
    const requirementsPath = path.join(projectPath, 'requirements.txt');
    const pyprojectPath = path.join(projectPath, 'pyproject.toml');
    if (await fs.pathExists(requirementsPath) || await fs.pathExists(pyprojectPath)) {
      analysis.type = analysis.type === 'unknown' ? 'python' : 'mixed';
      analysis.languages.push('python');
      
      if (await fs.pathExists(requirementsPath)) {
        const requirements = await fs.readFile(requirementsPath, 'utf-8');
        // Parse basic requirements
        analysis.dependencies = {
          ...analysis.dependencies,
          ...parseRequirements(requirements)
        };
      }

      // Detect Python frameworks
      if (analysis.dependencies.django) analysis.frameworks.push('django');
      if (analysis.dependencies.flask) analysis.frameworks.push('flask');
      if (analysis.dependencies.fastapi) analysis.frameworks.push('fastapi');
    }

    // Check for Go
    const goModPath = path.join(projectPath, 'go.mod');
    if (await fs.pathExists(goModPath)) {
      analysis.type = analysis.type === 'unknown' ? 'go' : 'mixed';
      analysis.languages.push('go');
    }

    // Check for Rust
    const cargoPath = path.join(projectPath, 'Cargo.toml');
    if (await fs.pathExists(cargoPath)) {
      analysis.type = analysis.type === 'unknown' ? 'rust' : 'mixed';
      analysis.languages.push('rust');
    }

    // Analyze project structure
    analysis.structure = await analyzeStructure(projectPath);
    
    // Check for tests
    analysis.hasTests = await hasTestFiles(projectPath);

    // Generate recommendations
    analysis.recommendations = generateRecommendations(analysis);

  } catch (error) {
    console.warn('Analysis error:', error.message);
  }

  return analysis;
}

function parseRequirements(requirements) {
  const deps = {};
  requirements.split('\n').forEach(line => {
    const match = line.trim().match(/^([a-zA-Z0-9_-]+)/);
    if (match) {
      deps[match[1]] = true;
    }
  });
  return deps;
}

async function analyzeStructure(projectPath) {
  const structure = {};
  
  try {
    const items = await fs.readdir(projectPath);
    
    structure.hasSource = items.some(item => 
      ['src', 'lib', 'app', 'components'].includes(item)
    );
    
    structure.hasTests = items.some(item => 
      ['test', 'tests', '__tests__', 'spec'].includes(item)
    );
    
    structure.hasDocs = items.some(item => 
      ['docs', 'documentation', 'README.md'].includes(item)
    );
    
    structure.hasConfig = items.some(item => 
      item.includes('config') || item.startsWith('.') || item.endsWith('.json')
    );

  } catch (error) {
    // Ignore errors
  }

  return structure;
}

async function hasTestFiles(projectPath) {
  try {
    const files = await fs.readdir(projectPath, { recursive: true });
    return files.some(file => 
      file.includes('test') || 
      file.includes('spec') || 
      file.includes('__tests__')
    );
  } catch {
    return false;
  }
}

function generateRecommendations(analysis) {
  const recommendations = [];

  // Documentation recommendations
  if (analysis.frameworks.length > 0) {
    recommendations.push({
      type: 'documentation',
      message: `Fetch documentation for: ${analysis.frameworks.join(', ')}`,
      frameworks: analysis.frameworks
    });
  }

  // Configuration recommendations
  if (analysis.languages.includes('typescript')) {
    recommendations.push({
      type: 'config',
      message: 'Enable TypeScript-specific Claude features',
      action: 'typescript-config'
    });
  }

  // Testing recommendations
  if (!analysis.hasTests) {
    recommendations.push({
      type: 'testing',
      message: 'Consider adding test setup to Claude configuration',
      action: 'add-testing'
    });
  }

  return recommendations;
}

/**
 * Detect monorepo setup
 */
async function detectMonorepo(projectPath) {
  // Check for Turborepo
  if (await fs.pathExists(path.join(projectPath, 'turbo.json'))) {
    return {
      type: 'turborepo',
      tool: 'Turborepo'
    };
  }

  // Check for Nx
  if (await fs.pathExists(path.join(projectPath, 'nx.json'))) {
    return {
      type: 'nx',
      tool: 'Nx'
    };
  }

  // Check for pnpm workspace
  if (await fs.pathExists(path.join(projectPath, 'pnpm-workspace.yaml'))) {
    return {
      type: 'pnpm-workspace',
      tool: 'pnpm workspaces'
    };
  }

  // Check for Lerna (legacy)
  if (await fs.pathExists(path.join(projectPath, 'lerna.json'))) {
    return {
      type: 'lerna',
      tool: 'Lerna'
    };
  }

  // Check for Yarn workspaces
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    try {
      const packageJson = await fs.readJson(packageJsonPath);
      if (packageJson.workspaces) {
        return {
          type: 'yarn-workspaces',
          tool: 'Yarn Workspaces'
        };
      }
    } catch (error) {
      // Ignore
    }
  }

  return null;
}

module.exports = {
  analyzeProject,
  parseRequirements,
  analyzeStructure,
  hasTestFiles,
  generateRecommendations,
  detectMonorepo
};
