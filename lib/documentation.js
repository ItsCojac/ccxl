const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

/**
 * Intelligent documentation fetching based on detected frameworks
 */
async function fetchDocumentation(projectPath, frameworks, options = {}) {
  const docsDir = path.join(projectPath, 'docs');
  await fs.ensureDir(docsDir);
  await fs.ensureDir(path.join(docsDir, 'fetched'));

  const results = [];

  for (const framework of frameworks) {
    const spinner = ora(`Fetching ${framework} documentation...`).start();
    
    try {
      const adapter = getAdapter(framework);
      if (adapter) {
        const content = await adapter.fetch(options);
        const outputPath = path.join(docsDir, 'fetched', `${framework}.md`);
        await fs.writeFile(outputPath, content, 'utf-8');
        
        results.push({
          framework,
          success: true,
          path: outputPath,
          size: content.length
        });
        
        spinner.succeed(`${framework} documentation fetched (${Math.round(content.length / 1024)}KB)`);
      } else {
        spinner.warn(`No adapter available for ${framework}`);
        results.push({
          framework,
          success: false,
          error: 'No adapter available'
        });
      }
    } catch (error) {
      spinner.fail(`Failed to fetch ${framework} documentation: ${error.message}`);
      results.push({
        framework,
        success: false,
        error: error.message
      });
    }
  }

  // Combine all documentation into a single file
  if (results.some(r => r.success)) {
    await combineDocumentation(docsDir, results.filter(r => r.success));
  }

  return results;
}

/**
 * Gets the appropriate adapter for a framework
 */
function getAdapter(framework) {
  const adapters = {
    react: require('../adapters/react'),
    typescript: require('../adapters/typescript'),
    javascript: require('../adapters/javascript'),
    express: require('../adapters/express')
  };

  // Use implemented adapters or fall back to stubs
  if (adapters[framework]) {
    return adapters[framework];
  }

  // Try stub adapters
  const stubs = require('../adapters/_stub');
  return stubs[framework] || null;
}

/**
 * Combines individual documentation files into a single Claude-optimized file
 */
async function combineDocumentation(docsDir, successfulResults) {
  const combinedPath = path.join(docsDir, 'combined-docs.md');
  let combinedContent = '# Project Documentation\n\n';
  combinedContent += `> Generated on ${new Date().toISOString()}\n\n`;
  combinedContent += '## Table of Contents\n\n';

  // Add table of contents
  successfulResults.forEach(result => {
    combinedContent += `- [${result.framework}](#${result.framework.toLowerCase()})\n`;
  });

  combinedContent += '\n---\n\n';

  // Add each framework's documentation
  for (const result of successfulResults) {
    const content = await fs.readFile(result.path, 'utf-8');
    combinedContent += `## ${result.framework}\n\n`;
    combinedContent += content;
    combinedContent += '\n\n---\n\n';
  }

  await fs.writeFile(combinedPath, combinedContent, 'utf-8');
  
  console.log(chalk.green(`📚 Combined documentation saved to ${path.relative(process.cwd(), combinedPath)}`));
}

/**
 * Updates existing documentation if it's older than specified days
 */
async function updateDocumentationIfStale(projectPath, maxAgeDays = 7) {
  const docsDir = path.join(projectPath, 'docs');
  const combinedPath = path.join(docsDir, 'combined-docs.md');

  if (!await fs.pathExists(combinedPath)) {
    return false; // No docs to update
  }

  const stats = await fs.stat(combinedPath);
  const daysSinceUpdate = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceUpdate > maxAgeDays;
}

module.exports = {
  fetchDocumentation,
  getAdapter,
  combineDocumentation,
  updateDocumentationIfStale
};
