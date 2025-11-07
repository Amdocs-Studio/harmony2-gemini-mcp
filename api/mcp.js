import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HarmonyAgent } from '../src/harmony-agent.js';

dotenv.config();

const router = express.Router();
router.use(cors());
router.use(express.json());

const agent = new HarmonyAgent();

// Unified MCP endpoint - handles all MCP protocol messages
router.post('/', async (req, res) => {
  const { method, params } = req.body;

  try {
    switch (method) {
      case 'initialize':
        return res.json({
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: process.env.MCP_SERVER_NAME || 'harmony2-master',
            version: process.env.MCP_SERVER_VERSION || '1.0.0',
          },
        });

      case 'tools/list':
        return res.json({
          tools: [
            {
              name: 'harmony_chat',
              description: 'Chat with the Harmony 2.0 Master Agent. Ask questions about Harmony 2.0, get guidance, or request help with development tasks.',
              inputSchema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    description: 'Your question or message to the Harmony 2.0 Master Agent',
                  },
                  context: {
                    type: 'object',
                    description: 'Optional context information (e.g., current file, project structure)',
                    additionalProperties: true,
                  },
                },
                required: ['message'],
              },
            },
            {
              name: 'harmony_analyze_code',
              description: 'Analyze code for Harmony 2.0 compliance and best practices. Get suggestions for improvement.',
              inputSchema: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    description: 'The code to analyze',
                  },
                  language: {
                    type: 'string',
                    description: 'Programming language (e.g., javascript, typescript, python)',
                    default: 'javascript',
                  },
                },
                required: ['code'],
              },
            },
            {
              name: 'harmony_generate_code',
              description: 'Generate code following Harmony 2.0 patterns and best practices.',
              inputSchema: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description: 'Description of what code to generate',
                  },
                  componentType: {
                    type: 'string',
                    description: 'Type of component (e.g., component, service, utility)',
                    default: 'component',
                  },
                },
                required: ['description'],
              },
            },
            {
              name: 'harmony_get_guidance',
              description: 'Get comprehensive guidance on a specific Harmony 2.0 topic or feature.',
              inputSchema: {
                type: 'object',
                properties: {
                  topic: {
                    type: 'string',
                    description: 'The topic or feature you want guidance on',
                  },
                },
                required: ['topic'],
              },
            },
          ],
        });

      case 'tools/call': {
        const { name, arguments: args } = params || {};

        if (!name) {
          return res.status(400).json({ error: 'Tool name is required' });
        }

        let result;

        switch (name) {
          case 'harmony_chat': {
            if (!args || !args.message) {
              return res.status(400).json({ error: 'Message is required' });
            }
            result = await agent.chat(args.message, args.context || {});
            break;
          }

          case 'harmony_analyze_code': {
            if (!args || !args.code) {
              return res.status(400).json({ error: 'Code is required' });
            }
            result = await agent.analyzeCode(
              args.code,
              args.language || 'javascript'
            );
            break;
          }

          case 'harmony_generate_code': {
            if (!args || !args.description) {
              return res.status(400).json({ error: 'Description is required' });
            }
            result = await agent.generateCode(
              args.description,
              args.componentType || 'component'
            );
            break;
          }

          case 'harmony_get_guidance': {
            if (!args || !args.topic) {
              return res.status(400).json({ error: 'Topic is required' });
            }
            result = await agent.getGuidance(args.topic);
            break;
          }

          default:
            return res.status(400).json({ error: `Unknown tool: ${name}` });
        }

        return res.json({
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        });
      }

      default:
        return res.status(400).json({ error: `Unknown method: ${method}` });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    });
  }
});

// Legacy endpoints for compatibility
/**
 * Initialize MCP connection
 */
router.post('/initialize', async (req, res) => {
  try {
    res.json({
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: process.env.MCP_SERVER_NAME || 'harmony2-master',
        version: process.env.MCP_SERVER_VERSION || '1.0.0',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * List available tools
 */
router.post('/tools/list', async (req, res) => {
  try {
    res.json({
      tools: [
        {
          name: 'harmony_chat',
          description: 'Chat with the Harmony 2.0 Master Agent. Ask questions about Harmony 2.0, get guidance, or request help with development tasks.',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Your question or message to the Harmony 2.0 Master Agent',
              },
              context: {
                type: 'object',
                description: 'Optional context information (e.g., current file, project structure)',
                additionalProperties: true,
              },
            },
            required: ['message'],
          },
        },
        {
          name: 'harmony_analyze_code',
          description: 'Analyze code for Harmony 2.0 compliance and best practices. Get suggestions for improvement.',
          inputSchema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'The code to analyze',
              },
              language: {
                type: 'string',
                description: 'Programming language (e.g., javascript, typescript, python)',
                default: 'javascript',
              },
            },
            required: ['code'],
          },
        },
        {
          name: 'harmony_generate_code',
          description: 'Generate code following Harmony 2.0 patterns and best practices.',
          inputSchema: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Description of what code to generate',
              },
              componentType: {
                type: 'string',
                description: 'Type of component (e.g., component, service, utility)',
                default: 'component',
              },
            },
            required: ['description'],
          },
        },
        {
          name: 'harmony_get_guidance',
          description: 'Get comprehensive guidance on a specific Harmony 2.0 topic or feature.',
          inputSchema: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                description: 'The topic or feature you want guidance on',
              },
            },
            required: ['topic'],
          },
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Call a tool
 */
router.post('/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    let response;

    switch (name) {
      case 'harmony_chat': {
        if (!args || !args.message) {
          return res.status(400).json({ error: 'Message is required' });
        }
        const result = await agent.chat(args.message, args.context || {});
        response = {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
        break;
      }

      case 'harmony_analyze_code': {
        if (!args || !args.code) {
          return res.status(400).json({ error: 'Code is required' });
        }
        const result = await agent.analyzeCode(
          args.code,
          args.language || 'javascript'
        );
        response = {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
        break;
      }

      case 'harmony_generate_code': {
        if (!args || !args.description) {
          return res.status(400).json({ error: 'Description is required' });
        }
        const result = await agent.generateCode(
          args.description,
          args.componentType || 'component'
        );
        response = {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
        break;
      }

      case 'harmony_get_guidance': {
        if (!args || !args.topic) {
          return res.status(400).json({ error: 'Topic is required' });
        }
        const result = await agent.getGuidance(args.topic);
        response = {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown tool: ${name}` });
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    });
  }
});

/**
 * Health check for MCP endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Harmony 2.0 MCP Server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
  });
});

/**
 * GET handler for MCP endpoint (Cursor might check this)
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Harmony 2.0 MCP Server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
    protocol: 'MCP HTTP',
    endpoints: {
      initialize: 'POST /mcp with {"method": "initialize"}',
      toolsList: 'POST /mcp with {"method": "tools/list"}',
      toolsCall: 'POST /mcp with {"method": "tools/call", "params": {...}}',
    },
  });
});

export default router;

