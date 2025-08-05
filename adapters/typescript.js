const puppeteer = require('puppeteer');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

/**
 * TypeScript documentation adapter
 */
class TypeScriptAdapter {
  constructor() {
    this.baseUrl = 'https://www.typescriptlang.org';
    this.importantPages = [
      '/docs/handbook/basic-types.html',
      '/docs/handbook/interfaces.html',
      '/docs/handbook/functions.html',
      '/docs/handbook/classes.html',
      '/docs/handbook/generics.html',
      '/docs/handbook/modules.html',
      '/docs/handbook/utility-types.html',
      '/docs/handbook/react.html'
    ];
  }

  async fetch(options = {}) {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      let content = '# TypeScript Documentation\n\n';
      
      for (const pagePath of this.importantPages) {
        try {
          const url = `${this.baseUrl}${pagePath}`;
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          
          const html = await page.content();
          const cleanContent = this.extractContent(html, url);
          
          if (cleanContent) {
            content += `## ${this.getPageTitle(pagePath)}\n\n`;
            content += `Source: ${url}\n\n`;
            content += cleanContent;
            content += '\n\n---\n\n';
          }
        } catch (error) {
          console.warn(`Failed to fetch ${pagePath}:`, error.message);
        }
      }
      
      return content;
    } finally {
      await browser.close();
    }
  }

  extractContent(html, url) {
    try {
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      
      if (!article || !article.textContent) {
        return null;
      }
      
      let content = article.textContent;
      
      // Clean up TypeScript-specific content
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      content = content.replace(/^.*?(TypeScript|Handbook)/i, '');
      content = content.replace(/Edit this page.*$/i, '');
      
      // Preserve code examples but limit overall length
      if (content.length > 12000) {
        content = content.substring(0, 12000) + '\n\n[Content truncated for brevity]';
      }
      
      return content;
    } catch (error) {
      console.warn('Content extraction failed:', error.message);
      return null;
    }
  }

  getPageTitle(pagePath) {
    const titles = {
      '/docs/handbook/basic-types.html': 'Basic Types',
      '/docs/handbook/interfaces.html': 'Interfaces',
      '/docs/handbook/functions.html': 'Functions',
      '/docs/handbook/classes.html': 'Classes',
      '/docs/handbook/generics.html': 'Generics',
      '/docs/handbook/modules.html': 'Modules',
      '/docs/handbook/utility-types.html': 'Utility Types',
      '/docs/handbook/react.html': 'React & TypeScript'
    };
    
    return titles[pagePath] || pagePath.replace(/.*\//, '').replace('.html', '').replace(/-/g, ' ');
  }
}

module.exports = new TypeScriptAdapter();
