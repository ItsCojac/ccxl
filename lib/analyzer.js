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
      if (analysis.dependencies.express) analysis.frameworks.push('express');
      if (analysis.dependencies.fastify) analysis.frameworks.push('fastify');
      
      // Detect languages
      if (analysis.dependencies.typescript || analysis.dependencies['@types/node']) {
        analysis.languages.push('typescript');
      }
      analysis.languages.push('javascript');

      // Check for yarn
      if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
        analysis.packageManager = 'yarn';
      }
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

module.exports = {
  analyzeProject,
  parseRequirements,
  analyzeStructure,
  hasTestFiles,
  generateRecommendations
};
