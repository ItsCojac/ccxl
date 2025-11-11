const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * Mock file system helper for testing
 */
class MockFS {
  constructor() {
    this.tempDirs = [];
  }

  /**
   * Create a temporary directory with test files
   */
  async createTempProject(projectType = 'empty', files = {}) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-test-'));
    this.tempDirs.push(tempDir);

    // Copy fixture if specified
    if (projectType !== 'empty') {
      const fixturePath = path.join(__dirname, '../fixtures', `${projectType}-project`);
      if (await fs.pathExists(fixturePath)) {
        await fs.copy(fixturePath, tempDir);
      }
    }

    // Add custom files
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(tempDir, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content);
    }

    return tempDir;
  }

  /**
   * Create a project with existing Claude setup
   */
  async createProjectWithClaudeSetup(projectType = 'react') {
    const tempDir = await this.createTempProject(projectType);
    
    // Add existing Claude setup
    const claudeDir = path.join(tempDir, '.claude');
    await fs.ensureDir(claudeDir);
    await fs.ensureDir(path.join(claudeDir, 'commands'));
    
    await fs.writeJson(path.join(claudeDir, 'settings.json'), {
      permissions: { allow: ["Bash(ls:*)"] }
    });
    
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md'), '# Test Project\nExisting setup');
    
    return tempDir;
  }

  /**
   * Clean up all temporary directories
   */
  async cleanup() {
    for (const dir of this.tempDirs) {
      try {
        await fs.remove(dir);
      } catch (error) {
        console.warn(`Failed to cleanup ${dir}:`, error.message);
      }
    }
    this.tempDirs = [];
  }
}

module.exports = { MockFS };
