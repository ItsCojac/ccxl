/**
 * Express.js documentation adapter
 */
class ExpressAdapter {
  constructor() {
    this.name = 'Express.js';
  }

  async fetch(options = {}) {
    return `# Express.js Documentation

## Getting Started

### Basic Application
\`\`\`javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
\`\`\`

## Core Concepts

### Routing
- \`app.get()\`, \`app.post()\`, \`app.put()\`, \`app.delete()\`
- Route parameters: \`/users/:id\`
- Query parameters: \`req.query\`
- Route handlers and middleware

### Middleware
- Application-level middleware: \`app.use()\`
- Router-level middleware
- Built-in middleware: \`express.static()\`, \`express.json()\`
- Third-party middleware: cors, helmet, morgan

### Request and Response
- \`req.body\`, \`req.params\`, \`req.query\`, \`req.headers\`
- \`res.send()\`, \`res.json()\`, \`res.status()\`, \`res.redirect()\`
- \`res.render()\` for template engines

### Error Handling
\`\`\`javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
\`\`\`

### Static Files
\`\`\`javascript
app.use(express.static('public'));
\`\`\`

## Common Patterns

### RESTful APIs
- GET /api/users - List users
- GET /api/users/:id - Get user
- POST /api/users - Create user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Authentication Middleware
\`\`\`javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  // Verify token logic
  next();
};
\`\`\`

Source: Express.js essentials for Claude Code
Generated: ${new Date().toISOString()}`;
  }
}

module.exports = new ExpressAdapter();
