/**
 * Dynamic ESM imports for CommonJS compatibility
 * Lazy-loads ESM-only packages (chalk, ora, inquirer) on demand
 */

let _chalk, _ora, _inquirer;

/**
 * Get chalk (ESM module) with caching
 * @returns {Promise<import('chalk').ChalkInstance>}
 */
async function getChalk() {
  if (!_chalk) {
    _chalk = (await import('chalk')).default;
  }
  return _chalk;
}

/**
 * Get ora (ESM module) with caching
 * @returns {Promise<import('ora').Ora>}
 */
async function getOra() {
  if (!_ora) {
    _ora = (await import('ora')).default;
  }
  return _ora;
}

/**
 * Get inquirer prompts (ESM module) with caching
 * @returns {Promise<typeof import('@inquirer/prompts')>}
 */
async function getInquirer() {
  if (!_inquirer) {
    _inquirer = await import('@inquirer/prompts');
  }
  return _inquirer;
}

/**
 * Convenience wrapper for creating a spinner
 * @param {string} text - Spinner text
 * @returns {Promise<import('ora').Ora>}
 */
async function spinner(text) {
  const ora = await getOra();
  return ora(text);
}

module.exports = {
  getChalk,
  getOra,
  getInquirer,
  spinner
};
