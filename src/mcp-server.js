import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { HarmonyAgent } from './harmony-agent.js';

/**
 * MCP Server for Harmony 2.0 Master Agent
 * Exposes Harmony 2.0 capabilities through Model Context Protocol
 */
class HarmonyMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: process.env.MCP_SERVER_NAME || 'harmony2-master',
        version: process.env.MCP_SERVER_VERSION || '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.agent = new HarmonyAgent();
    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
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
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'harmony_chat': {
            const response = await this.agent.chat(
              args.message,
              args.context || {}
            );
            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            };
          }

          case 'harmony_analyze_code': {
            const response = await this.agent.analyzeCode(
              args.code,
              args.language || 'javascript'
            );
            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            };
          }

          case 'harmony_generate_code': {
            const response = await this.agent.generateCode(
              args.description,
              args.componentType || 'component'
            );
            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            };
          }

          case 'harmony_get_guidance': {
            const response = await this.agent.getGuidance(args.topic);
            return {
              content: [
                {
                  type: 'text',
                  text: response,
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Harmony 2.0 MCP Server running on stdio');
  }
}

// Start the server
const server = new HarmonyMCPServer();
server.run().catch(console.error);

