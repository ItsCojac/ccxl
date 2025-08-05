const puppeteer = require('puppeteer');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

/**
 * React documentation adapter
 */
class ReactAdapter {
  constructor() {
    this.baseUrl = 'https://react.dev';
    this.importantPages = [
      '/learn',
      '/learn/thinking-in-react',
      '/learn/describing-the-ui',
      '/learn/adding-interactivity',
      '/learn/managing-state',
      '/learn/escape-hatches',
      '/reference/react',
      '/reference/react-dom'
    ];
  }

  async fetch(options = {}) {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      let content = '# React Documentation\n\n';
      
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
      
      // Clean up the content for Claude
      let content = article.textContent;
      
      // Remove excessive whitespace
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      // Remove navigation and footer content
      content = content.replace(/^.*?(Table of Contents|Quick Start)/i, '');
      content = content.replace(/Edit this page.*$/i, '');
      
      // Limit length to avoid overwhelming Claude
      if (content.length > 10000) {
        content = content.substring(0, 10000) + '\n\n[Content truncated for brevity]';
      }
      
      return content;
    } catch (error) {
      console.warn('Content extraction failed:', error.message);
      return null;
    }
  }

  getPageTitle(pagePath) {
    const titles = {
      '/learn': 'Learn React',
      '/learn/thinking-in-react': 'Thinking in React',
      '/learn/describing-the-ui': 'Describing the UI',
      '/learn/adding-interactivity': 'Adding Interactivity',
      '/learn/managing-state': 'Managing State',
      '/learn/escape-hatches': 'Escape Hatches',
      '/reference/react': 'React API Reference',
      '/reference/react-dom': 'React DOM API Reference'
    };
    
    return titles[pagePath] || pagePath.replace(/^\//, '').replace(/-/g, ' ');
  }
}

module.exports = new ReactAdapter();
