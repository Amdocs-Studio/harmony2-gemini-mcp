import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { GitHubCache } from './github-cache.js';

dotenv.config();

// Cache for documentation to avoid repeated fetches
const docCache = new Map();

/**
 * Harmony 2.0 Master Agent powered by Gemini
 * This agent understands Harmony 2.0 architecture and can guide development
 */
export class HarmonyAgent {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Available models: gemini-1.5-flash (FREE), gemini-1.5-pro, gemini-2.0-flash-exp
    // Default: gemini-1.5-flash (free tier, fast)
    // Set GEMINI_MODEL in .env to override (e.g., GEMINI_MODEL=gemini-1.5-pro for better quality)
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    // Harmony 2.0 knowledge base
    this.harmonyKnowledge = this.getHarmonyKnowledge();
    this.docsBaseUrl = 'https://amdocs-studio.github.io/harmony-2.0';
    this.repoBaseUrl = 'https://raw.githubusercontent.com/Amdocs-Studio/harmony-2.0/master';
    this.repoApiUrl = 'https://api.github.com/repos/Amdocs-Studio/harmony-2.0';
    
    // GitHub repository info
    this.repoOwner = 'Amdocs-Studio';
    this.repoName = 'harmony-2.0';
    this.repoBranch = 'master';
    this.githubToken = process.env.GITHUB_TOKEN || null;
    
    // Initialize GitHub cache
    this.githubCache = new GitHubCache();
    this.fileTree = null;
  }

  getHarmonyKnowledge() {
    return `
# Harmony 2.0 Master Knowledge Base

## Overview
Harmony 2.0 is a modern development boilerplate and framework designed to streamline application development.

## Key Features
- Modern architecture and best practices
- Component-based development
- Integration capabilities
- Scalable structure

## Documentation
- Official Docs: https://amdocs-studio.github.io/harmony-2.0
- Repository: https://github.com/Amdocs-Studio/harmony-2.0

## Common Tasks
1. Project setup and initialization
2. Component development
3. Integration with external services
4. Best practices and patterns
5. Troubleshooting and debugging

## Architecture Principles
- Modular design
- Separation of concerns
- Reusable components
- Clean code practices
`;
  }

  /**
   * Fetch documentation content from Harmony 2.0 docs
   */
  async fetchDocumentation(url) {
    // Check cache first
    const cacheKey = `doc:${url}`;
    if (docCache.has(cacheKey)) {
      return docCache.get(cacheKey);
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Harmony-2.0-Master-Agent/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch docs: ${response.status}`);
      }

      const html = await response.text();
      
      // Extract text content from HTML (simple extraction)
      // Remove script and style tags
      let text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Limit to reasonable size but keep more content (first 12000 chars to avoid token limits)
      text = text.substring(0, 12000);

      // Cache it
      docCache.set(cacheKey, text);
      
      return text;
    } catch (error) {
      console.error(`Error fetching docs from ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch file content from GitHub repository (using cache)
   */
  async fetchRepoFile(filePath) {
    // Try in-memory cache first (for backward compatibility)
    const cacheKey = `repo:${filePath}`;
    if (docCache.has(cacheKey)) {
      return docCache.get(cacheKey);
    }

    // Use GitHub cache system
    const content = await this.githubCache.getFileContent(
      this.githubToken,
      this.repoOwner,
      this.repoName,
      filePath,
      this.repoBranch
    );

    if (content) {
      // Limit size and cache in memory too
      const limitedContent = content.substring(0, 10000);
      docCache.set(cacheKey, limitedContent);
      return limitedContent;
    }

    return null;
  }

  /**
   * Initialize file tree (fetch once, use many times)
   */
  async initializeFileTree() {
    if (this.fileTree) {
      return this.fileTree;
    }

    try {
      console.log('[Harmony Agent] Initializing repository file tree...');
      this.fileTree = await this.githubCache.getFileTree(
        this.githubToken,
        this.repoOwner,
        this.repoName,
        this.repoBranch
      );
      console.log(`[Harmony Agent] File tree initialized with ${this.fileTree.length} files`);
      return this.fileTree;
    } catch (error) {
      console.warn('[Harmony Agent] Could not initialize file tree:', error.message);
      console.warn('[Harmony Agent] Falling back to direct file fetching');
      return null;
    }
  }

  /**
   * Get repository structure and key files - ALWAYS fetches core files + smart file discovery
   */
  async getRepoInfo(question) {
    const lowerQuestion = question.toLowerCase();
    const repoInfo = [];

    // ALWAYS fetch these core files to understand the repository
    console.log('[Harmony Agent] Fetching repository information...');
    
    // 1. README - Always fetch (most important)
    const readme = await this.fetchRepoFile('README.md');
    if (readme) {
      repoInfo.push(`## Repository README:\n${readme}\n`);
      console.log('[Harmony Agent] ✓ Fetched README.md');
    }

    // 2. package.json - Always fetch (dependencies, scripts, project structure)
    const packageJson = await this.fetchRepoFile('package.json');
    if (packageJson) {
      repoInfo.push(`## Package Configuration (package.json):\n${packageJson}\n`);
      console.log('[Harmony Agent] ✓ Fetched package.json');
    }

    // 3. Initialize file tree for smart file discovery
    const fileTree = await this.initializeFileTree();

    // 4. Build keywords from question
    const keywords = [];
    if (lowerQuestion.includes('component') || lowerQuestion.includes('ui')) {
      keywords.push('component', 'components', 'ui', 'view');
    }
    if (lowerQuestion.includes('module') || lowerQuestion.includes('generate')) {
      keywords.push('module', 'generator', 'generate', 'template');
    }
    if (lowerQuestion.includes('config') || lowerQuestion.includes('setup')) {
      keywords.push('config', 'setup', 'configuration');
    }
    if (lowerQuestion.includes('service') || lowerQuestion.includes('api')) {
      keywords.push('service', 'api', 'endpoint');
    }
    if (lowerQuestion.includes('store') || lowerQuestion.includes('redux') || lowerQuestion.includes('state')) {
      keywords.push('store', 'redux', 'state', 'slice');
    }
    if (lowerQuestion.includes('route') || lowerQuestion.includes('navigation')) {
      keywords.push('route', 'router', 'navigation', 'page');
    }
    if (lowerQuestion.includes('test') || lowerQuestion.includes('spec')) {
      keywords.push('test', 'spec', 'jest');
    }
    if (lowerQuestion.includes('hook') || lowerQuestion.includes('custom')) {
      keywords.push('hook', 'hooks', 'custom');
    }

    // 5. Always try to get entry point and config files
    const alwaysFetchFiles = [
      'src/index.js', 'src/index.ts', 'src/main.js', 'src/main.ts', 'index.js', 'index.ts',
      'tsconfig.json', 'vite.config.js', 'vite.config.ts', 'webpack.config.js', 'vite.config.mjs'
    ];

    for (const file of alwaysFetchFiles) {
      const content = await this.fetchRepoFile(file);
      if (content) {
        if (file.includes('index') || file.includes('main')) {
          repoInfo.push(`## Project Entry Point (${file}):\n${content.substring(0, 3000)}\n`);
        } else {
          repoInfo.push(`## Configuration File (${file}):\n${content.substring(0, 2000)}\n`);
        }
        console.log(`[Harmony Agent] ✓ Fetched ${file}`);
        break; // Found one, that's enough for entry/config
      }
    }

    // 6. Smart file discovery using file tree
    if (fileTree && keywords.length > 0) {
      console.log(`[Harmony Agent] Searching for files matching keywords: ${keywords.join(', ')}`);
      const relevantFiles = this.githubCache.findRelevantFiles(fileTree, keywords, 10);
      
      console.log(`[Harmony Agent] Found ${relevantFiles.length} relevant files`);
      
      for (const file of relevantFiles) {
        // Skip if already fetched
        if (alwaysFetchFiles.some(f => file.path.includes(f.split('/').pop()))) {
          continue;
        }

        const content = await this.fetchRepoFile(file.path);
        if (content) {
          // Limit content size based on file size
          const maxSize = file.size > 50000 ? 2000 : 5000;
          repoInfo.push(`## ${file.path}:\n${content.substring(0, maxSize)}\n`);
          console.log(`[Harmony Agent] ✓ Fetched ${file.path} (${file.size} bytes)`);
        }
      }
    } else if (!fileTree) {
      // Fallback: try common files if file tree not available
      console.log('[Harmony Agent] File tree not available, using fallback file list');
      
      if (lowerQuestion.includes('component')) {
        const componentFiles = ['src/components/index.ts', 'src/components/index.tsx', 'src/components/index.js'];
        for (const file of componentFiles) {
          const content = await this.fetchRepoFile(file);
          if (content) {
            repoInfo.push(`## Component Structure (${file}):\n${content.substring(0, 3000)}\n`);
            console.log(`[Harmony Agent] ✓ Fetched component file: ${file}`);
            break;
          }
        }
      }
    }

    const result = repoInfo.join('\n');
    if (result) {
      console.log(`[Harmony Agent] Repository info compiled (${result.length} chars)`);
    } else {
      console.warn('[Harmony Agent] No repository information could be fetched');
    }

    return result;
  }

  /**
   * Extract links from HTML content (including sidebar, navigation, and all anchor tags)
   */
  extractDocLinks(html, baseUrl) {
    const links = new Set(); // Use Set to avoid duplicates
    
    // Multiple patterns to catch links in different contexts:
    // 1. Standard href in anchor tags
    // 2. Links in navigation/sidebar (often in <nav>, <aside>, or with specific classes)
    // 3. Links in lists or menus
    const patterns = [
      /href=["']([^"']+)["']/gi,  // Standard href
      /<a[^>]+href=["']([^"']+)["'][^>]*>/gi,  // Full anchor tag
      /data-href=["']([^"']+)["']/gi,  // Data attributes
      /url\(["']?([^"']+)["']?\)/gi,  // CSS url() references (less common but possible)
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let link = match[1];
        
        // Skip empty, hash-only, or external links
        if (!link || link === '#' || link.startsWith('http://') || link.startsWith('https://')) {
          // Check if it's an external link to a different domain
          if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
            if (!link.includes(baseUrl.replace('https://', '').replace('http://', ''))) {
              continue; // Skip external links
            }
          } else {
            continue; // Skip empty or hash-only links
          }
        }
        
        // Convert relative URLs to absolute
        if (link.startsWith('/')) {
          link = baseUrl + link;
        } else if (link.startsWith('./')) {
          link = baseUrl + '/' + link.replace(/^\.\//, '');
        } else if (!link.startsWith('http')) {
          // Relative path - make it absolute
          link = baseUrl + '/' + link.replace(/^\//, '');
        }
        
        // Normalize URL (remove trailing slash variations, fragments)
        link = link.split('#')[0]; // Remove hash fragments
        link = link.replace(/\/+$/, ''); // Remove trailing slashes (we'll add one if needed)
        if (!link.endsWith('/') && !link.match(/\.[a-z]+$/i)) {
          link = link + '/'; // Add trailing slash for consistency
        }
        
        // Only include internal documentation links
        if (link.includes(baseUrl) && !link.includes('mailto:') && !link.includes('tel:')) {
          links.add(link);
        }
      }
    }
    
    return Array.from(links);
  }

  /**
   * Get relevant documentation based on the question
   */
  async getRelevantDocs(question) {
    const lowerQuestion = question.toLowerCase();
    const allDocs = [];
    
    // Always fetch the main docs page first (root page)
    const mainDocUrl = `${this.docsBaseUrl}/`;
    const mainDocs = await this.fetchDocumentation(mainDocUrl);
    
    if (mainDocs) {
      allDocs.push(mainDocs);
      
      // Fetch the HTML to extract links
      try {
        const response = await fetch(mainDocUrl, {
          headers: { 'User-Agent': 'Harmony-2.0-Master-Agent/1.0' }
        });
        if (response.ok) {
          const html = await response.text();
          const links = this.extractDocLinks(html, this.docsBaseUrl);
          
          // Map question keywords to relevant sub-pages
          const relevantKeywords = [];
          if (lowerQuestion.includes('setup') || lowerQuestion.includes('install') || 
              lowerQuestion.includes('new project') || lowerQuestion.includes('initialize') ||
              lowerQuestion.includes('create project') || lowerQuestion.includes('build project') ||
              lowerQuestion.includes('getting started') || lowerQuestion.includes('start')) {
            relevantKeywords.push('getting-started', 'getting_started', 'start', 'setup', 'install', 'initialize');
          }
          if (lowerQuestion.includes('module') || lowerQuestion.includes('generate')) {
            relevantKeywords.push('module', 'generate', 'generator');
          }
          if (lowerQuestion.includes('component')) {
            relevantKeywords.push('component', 'components');
          }
          if (lowerQuestion.includes('architecture') || lowerQuestion.includes('structure')) {
            relevantKeywords.push('architecture', 'structure', 'overview');
          }
          
          // Log all found links for debugging
          console.log(`[Harmony Agent] Found ${links.length} documentation links`);
          
          // Fetch relevant sub-pages
          let fetchedCount = 0;
          const maxFetches = 5; // Limit to avoid too many requests
          
          for (const link of links) {
            if (fetchedCount >= maxFetches) break;
            
            const linkLower = link.toLowerCase();
            // Check if link matches any relevant keyword
            const isRelevant = relevantKeywords.some(keyword => linkLower.includes(keyword));
            
            if (isRelevant) {
              console.log(`[Harmony Agent] Fetching sub-page (${fetchedCount + 1}/${maxFetches}): ${link}`);
              const subDocs = await this.fetchDocumentation(link);
              if (subDocs && subDocs.trim().length > 0) {
                allDocs.push(`\n## From ${link}:\n${subDocs}\n`);
                fetchedCount++;
              }
            }
          }
          
          // If we found links but none matched keywords, log them for debugging
          if (links.length > 0 && fetchedCount === 0 && relevantKeywords.length > 0) {
            console.log(`[Harmony Agent] Found links but none matched keywords. Available links: ${links.slice(0, 10).join(', ')}`);
          }
          
          // If no specific matches but question is about project creation, try common pages
          if (relevantKeywords.length > 0 && allDocs.length === 1) {
            // Try fetching common getting started pages
            const commonPages = [
              `${this.docsBaseUrl}/getting-started`,
              `${this.docsBaseUrl}/getting_started`,
              `${this.docsBaseUrl}/getting-started/`,
              `${this.docsBaseUrl}/getting_started/`,
            ];
            
            for (const pageUrl of commonPages) {
              const pageDocs = await this.fetchDocumentation(pageUrl);
              if (pageDocs && pageDocs.trim().length > 0) {
                allDocs.push(`\n## From ${pageUrl}:\n${pageDocs}\n`);
                break; // Found one, stop
              }
            }
          }
        }
      } catch (error) {
        console.warn('[Harmony Agent] Could not extract links from main page:', error.message);
      }
    }
    
    return allDocs.join('\n\n');
  }

  /**
   * Get comprehensive context from both docs and repo
   */
  async getComprehensiveContext(question) {
    const contexts = [];

    // Get documentation FIRST (most important)
    const docs = await this.getRelevantDocs(question);
    if (docs && docs.trim().length > 0) {
      contexts.push(`## Harmony 2.0 Official Documentation:\n${docs}\n`);
      console.log(`[Harmony Agent] Fetched docs (${docs.length} chars)`);
    } else {
      console.warn('[Harmony Agent] No documentation fetched');
    }

    // Get repository information
    const repoInfo = await this.getRepoInfo(question);
    if (repoInfo && repoInfo.trim().length > 0) {
      contexts.push(repoInfo);
      console.log(`[Harmony Agent] Fetched repo info (${repoInfo.length} chars)`);
    } else {
      console.warn('[Harmony Agent] No repository info fetched');
    }

    const combined = contexts.join('\n');
    if (!combined || combined.trim().length === 0) {
      console.error('[Harmony Agent] No context available at all!');
      return null;
    }

    return combined;
  }

  /**
   * Get a response from the Harmony agent
   */
  async chat(message, context = {}) {
    try {
      // Fetch comprehensive context from both docs and repository
      const comprehensiveContext = await this.getComprehensiveContext(message);
      
      // Log for debugging
      if (comprehensiveContext) {
        console.log(`[Harmony Agent] Fetched context (${comprehensiveContext.length} chars)`);
      } else {
        console.warn('[Harmony Agent] No context fetched - docs/repo may be unavailable');
      }

      let contextInfo = '';
      if (comprehensiveContext && comprehensiveContext.trim().length > 0) {
        contextInfo = `\n\n## ⚠️ CRITICAL: USE ONLY THE INFORMATION BELOW ⚠️\n\nBelow is the ACTUAL Harmony 2.0 documentation and repository code. You MUST base your answer ONLY on this information:\n\n${comprehensiveContext}\n\n## END OF DOCUMENTATION\n\n`;
      } else {
        contextInfo = '\n\n⚠️ WARNING: Could not fetch documentation or repository. You should inform the user that documentation is currently unavailable.';
      }

      const systemPrompt = `You are the Harmony 2.0 Master Agent. You have access to the official Harmony 2.0 documentation and repository code.

${this.harmonyKnowledge}${contextInfo}

## CRITICAL INSTRUCTIONS:

1. **YOU MUST USE ONLY THE DOCUMENTATION PROVIDED ABOVE** - Do NOT use general knowledge about Harmony 2.0 or make assumptions
2. **If the answer is in the documentation above, extract it directly** - Quote or paraphrase the exact information
3. **If the answer is NOT in the documentation above, say so explicitly** - Do NOT make up answers
4. **DO NOT redirect users to check docs** - Use the documentation content provided above to answer directly
5. **Reference specific sections** - When using information from the docs, mention what section it came from

Your response format:
- Start by confirming if the information is in the provided documentation
- Extract and present the relevant information from the documentation
- If creating examples, base them on the actual code patterns shown in the repository
- If the documentation doesn't have the answer, explicitly state: "The documentation provided doesn't contain information about [topic]. Please check the official docs at [url]"

Current context: ${JSON.stringify(context, null, 2)}`;

      const prompt = `${systemPrompt}\n\nUser Question: ${message}\n\nAssistant (answer based ONLY on the documentation provided above):`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in Harmony agent chat:', error);
      throw new Error(`Failed to get response from Harmony agent: ${error.message}`);
    }
  }

  /**
   * Analyze code or project structure
   */
  async analyzeCode(code, language = 'javascript') {
    const prompt = `Analyze this ${language} code in the context of Harmony 2.0 best practices:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Code quality assessment
2. Harmony 2.0 compliance check
3. Suggestions for improvement
4. Best practices recommendations`;

    return await this.chat(prompt);
  }

  /**
   * Generate code following Harmony 2.0 patterns
   */
  async generateCode(description, componentType = 'component') {
    const prompt = `Generate ${componentType} code following Harmony 2.0 best practices and patterns.

Requirements:
${description}

Please provide:
1. Complete, working code
2. Comments explaining key parts
3. Harmony 2.0 best practices applied
4. Any necessary imports or dependencies`;

    return await this.chat(prompt);
  }

  /**
   * Get guidance on a specific Harmony 2.0 topic
   */
  async getGuidance(topic) {
    const prompt = `Provide comprehensive guidance on "${topic}" in the context of Harmony 2.0 development.

Include:
1. Overview and importance
2. Implementation steps
3. Code examples
4. Common pitfalls to avoid
5. Best practices`;

    return await this.chat(prompt);
  }
}


