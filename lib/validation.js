const { z } = require('zod');

/**
 * Validation schemas for Claude Code settings and configurations
 */

// Permission schema
const PermissionSchema = z.object({
  allow: z.array(z.string()).default([]),
  deny: z.array(z.string()).default([])
});

// Settings schema
const SettingsSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  version: z.string().default("1.0.0"),
  permissions: PermissionSchema,
  customInstructions: z.string().optional(),
  rules: z.array(z.string()).default([]),
  created: z.string().optional(),
  lastUpdated: z.string().optional()
});

// CLI options schema
const CLIOptionsSchema = z.object({
  dryRun: z.boolean().default(false),
  yes: z.boolean().default(false),
  quiet: z.boolean().default(false),
  verbose: z.boolean().default(false),
  docsOnly: z.boolean().default(false),
  noDocs: z.boolean().default(false),
  commandsOnly: z.boolean().default(false),
  settingsOnly: z.boolean().default(false),
  update: z.boolean().default(false),
  reset: z.boolean().default(false),
  safeOnly: z.boolean().default(false),
  includeDestructive: z.boolean().default(false),
  framework: z.array(z.string()).optional(),
  language: z.array(z.string()).optional(),
  outputDir: z.string().optional(),
  config: z.string().optional(),
  dev: z.boolean().default(false)
});

// Project analysis schema
const ProjectAnalysisSchema = z.object({
  type: z.string(),
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  packageManager: z.enum(['npm', 'yarn', 'pnpm']).default('npm'),
  hasTests: z.boolean().default(false),
  hasDocker: z.boolean().default(false),
  hasDatabase: z.boolean().default(false),
  confidence: z.number().min(0).max(1).default(0.8)
});

/**
 * Validate settings object
 */
function validateSettings(settings) {
  try {
    return {
      success: true,
      data: SettingsSchema.parse(settings),
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    };
  }
}

/**
 * Validate CLI options
 */
function validateCLIOptions(options) {
  try {
    return {
      success: true,
      data: CLIOptionsSchema.parse(options),
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    };
  }
}

/**
 * Validate project analysis
 */
function validateProjectAnalysis(analysis) {
  try {
    return {
      success: true,
      data: ProjectAnalysisSchema.parse(analysis),
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    };
  }
}

/**
 * Format validation errors for user display
 */
function formatValidationErrors(errors) {
  return errors.map(err => {
    const field = err.path || 'unknown';
    return `${field}: ${err.message}`;
  }).join('\n');
}

module.exports = {
  SettingsSchema,
  CLIOptionsSchema,
  ProjectAnalysisSchema,
  validateSettings,
  validateCLIOptions,
  validateProjectAnalysis,
  formatValidationErrors
};
