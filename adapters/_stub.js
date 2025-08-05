/**
 * Stub adapter for frameworks not yet implemented
 */
class StubAdapter {
  constructor(frameworkName) {
    this.frameworkName = frameworkName;
  }

  async fetch(options = {}) {
    return `# ${this.frameworkName} Documentation

Documentation adapter for ${this.frameworkName} is not yet implemented.

## What you can do:
1. Check the official ${this.frameworkName} documentation
2. Contribute an adapter for this framework
3. Use the generic documentation fetcher

Generated: ${new Date().toISOString()}`;
  }
}

// Create stub adapters for common frameworks
const frameworks = [
  'vue', 'angular', 'svelte', 'nextjs', 'nuxtjs', 
  'fastify', 'django', 'flask', 'fastapi'
];

const stubs = {};
frameworks.forEach(framework => {
  stubs[framework] = new StubAdapter(framework);
});

module.exports = stubs;
