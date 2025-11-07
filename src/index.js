import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { HarmonyAgent } from './harmony-agent.js';
import mcpRouter from '../api/mcp.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MCP endpoint (for local testing)
app.use('/mcp', mcpRouter);

const agent = new HarmonyAgent();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Harmony 2.0 Master Agent',
    version: process.env.MCP_SERVER_VERSION || '1.0.0'
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await agent.chat(message, context || {});
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze code endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const response = await agent.analyzeCode(code, language || 'javascript');
    res.json({ response });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate code endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { description, componentType } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const response = await agent.generateCode(description, componentType || 'component');
    res.json({ response });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get guidance endpoint
app.post('/api/guidance', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const response = await agent.getGuidance(topic);
    res.json({ response });
  } catch (error) {
    console.error('Guidance error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve chat UI (fallback if static file serving doesn't work)
app.get('/', (req, res) => {
  try {
    const htmlPath = join(__dirname, '../public/index.html');
    const html = readFileSync(htmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error serving chat UI:', error);
    res.status(404).send(`
      <html>
        <body>
          <h1>Chat UI not found</h1>
          <p>Please ensure public/index.html exists</p>
        </body>
      </html>
    `);
  }
});

// Export for Vercel (when imported)
export default app;

// Start server for local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Harmony 2.0 Master Agent API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  });
}

