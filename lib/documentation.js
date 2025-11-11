const fs = require('fs-extra');
const path = require('path');
const { getChalk, spinner } = require('./imports');

/**
 * Intelligent documentation fetching using Jina AI Reader
 * Zero dependencies, lightweight, always up-to-date
 */

/**
 * Documentation URLs for popular frameworks
 */
const DOCS_URLS = {
  react: 'https://react.dev/reference/react',
  vue: 'https://vuejs.org/api/',
  angular: 'https://angular.dev/api',
  svelte: 'https://svelte.dev/docs/svelte/overview',
  nextjs: 'https://nextjs.org/docs',
  nuxtjs: 'https://nuxt.com/docs/getting-started/introduction',
  astro: 'https://docs.astro.build/en/getting-started/',
  remix: 'https://remix.run/docs/en/main',
  solidjs: 'https://docs.solidjs.com/quick-start',
  qwik: 'https://qwik.dev/docs/',
  sveltekit: 'https://svelte.dev/docs/kit/introduction',

  // Backend frameworks
  express: 'https://expressjs.com/en/4x/api.html',
  fastify: 'https://fastify.dev/docs/latest/',
  django: 'https://docs.djangoproject.com/en/stable/',
  flask: 'https://flask.palletsprojects.com/en/latest/',
  fastapi: 'https://fastapi.tiangolo.com/',

  // Languages & Tools
  typescript: 'https://www.typescriptlang.org/docs/',
  javascript: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference',

  // ORMs & Data
  prisma: 'https://www.prisma.io/docs/orm',
  drizzle: 'https://orm.drizzle.team/docs/overview',
  trpc: 'https://trpc.io/docs',

  // Build tools
  vite: 'https://vite.dev/guide/',
  webpack: 'https://webpack.js.org/concepts/'
};

/**
 * Fetch documentation using Jina AI Reader
 * @param {string} framework - Framework name
 * @param {object} options - Fetch options
 * @returns {Promise<string>} Markdown content
 */
async function fetchFrameworkDocs(framework, options = {}) {
  const url = DOCS_URLS[framework.toLowerCase()];

  if (!url) {
    throw new Error(`No documentation URL configured for: ${framework}`);
  }

  try {
    // Use Jina AI Reader to convert URL to clean markdown
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: options.jinaApiKey ? {
        'Authorization': `Bearer ${options.jinaApiKey}`
      } : {}
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch docs: ${response.statusText}`);
    }

    let markdown = await response.text();

    // Add metadata header
    const header = `# ${framework} Documentation\n\nSource: ${url}\nFetched: ${new Date().toISOString()}\n\n---\n\n`;

    return header + markdown;

  } catch (error) {
    console.warn(`Failed to fetch ${framework} docs: ${error.message}`);
    return createFallbackDocs(framework, url);
  }
}

/**
 * Create fallback documentation when fetch fails
 * @param {string} framework - Framework name
 * @param {string} url - Documentation URL
 * @returns {string} Fallback markdown
 */
function createFallbackDocs(framework, url) {
  return `# ${framework} Documentation

**Note:** Unable to fetch live documentation. Please visit the official docs:

${url}

## Resources
- Official Documentation: ${url}
- Community: Search for "${framework} documentation" for the latest guides

---

*This is a fallback template. Run \`npx ccxl --docs-only\` to retry fetching.*
`;
}

/**
 * Fetch documentation for multiple frameworks
 * @param {string} projectPath - Project directory path
 * @param {string[]} frameworks - List of frameworks to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Array>} Results array
 */
async function fetchDocumentation(projectPath, frameworks, options = {}) {
  const docsDir = path.join(projectPath, 'docs');
  await fs.ensureDir(docsDir);
  await fs.ensureDir(path.join(docsDir, 'fetched'));

  const chalk = await getChalk();
  const results = [];

  for (const framework of frameworks) {
    const spin = await spinner(`Fetching ${framework} documentation...`);
    spin.start();

    try {
      const content = await fetchFrameworkDocs(framework, options);
      const outputPath = path.join(docsDir, 'fetched', `${framework}.md`);
      await fs.writeFile(outputPath, content, 'utf-8');

      results.push({
        framework,
        success: true,
        path: outputPath,
        size: content.length
      });

      spin.succeed(`${framework} documentation fetched (${Math.round(content.length / 1024)}KB)`);
    } catch (error) {
      spin.fail(`Failed to fetch ${framework} documentation: ${error.message}`);
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
 * Combines individual documentation files into a single Claude-optimized file
 * @param {string} docsDir - Documentation directory
 * @param {Array} successfulResults - Successfully fetched docs
 */
async function combineDocumentation(docsDir, successfulResults) {
  const chalk = await getChalk();
  const combinedPath = path.join(docsDir, 'combined-docs.md');

  let combinedContent = '# Project Documentation\n\n';
  combinedContent += `> Generated on ${new Date().toISOString()}\n`;
  combinedContent += `> By ccxl v2.0\n\n`;
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
 * Check if documentation needs updating
 * @param {string} projectPath - Project path
 * @param {number} maxAgeDays - Maximum age in days
 * @returns {Promise<boolean>} True if update needed
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
  fetchFrameworkDocs,
  combineDocumentation,
  updateDocumentationIfStale,
  DOCS_URLS
};
