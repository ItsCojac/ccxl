/**
 * Main entry point for the Claude Setup library
 */

const { analyzeProject } = require('./analyzer');
const { detectExisting } = require('./detector');
const { setupClaude } = require('./setup');
const { fetchDocumentation } = require('./documentation');

module.exports = {
  analyzeProject,
  detectExisting,
  setupClaude,
  fetchDocumentation
};
