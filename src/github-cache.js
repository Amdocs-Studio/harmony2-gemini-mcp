import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're in a serverless environment (Vercel, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production' && !fs.existsSync(path.join(__dirname, '../.cache'));

// Cache directory - use /tmp in serverless, .cache locally
const CACHE_DIR = isServerless ? path.join(os.tmpdir(), 'harmony-cache') : path.join(__dirname, '../.cache');
const FILE_TREE_CACHE = path.join(CACHE_DIR, 'file-tree.json');
const FILE_CONTENT_CACHE_DIR = path.join(CACHE_DIR, 'files');

// Ensure cache directories exist (only if we can write)
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_CONTENT_CACHE_DIR)) {
    fs.mkdirSync(FILE_CONTENT_CACHE_DIR, { recursive: true });
  }
} catch (error) {
  // If we can't create cache dir (serverless), use in-memory only
  console.warn('[GitHub Cache] Cannot create cache directory, using in-memory cache only');
}

/**
 * GitHub API Cache Manager
 * Handles caching of file tree and file contents
 */
export class GitHubCache {
  constructor() {
    this.fileTree = null;
    this.fileTreeCacheTime = null;
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours for file tree
    this.inMemoryCache = new Map(); // Fallback for serverless
    this.canWriteToDisk = true; // Will be set based on filesystem access
  }

  /**
   * Get file tree from cache or fetch from GitHub
   */
  async getFileTree(githubToken, repoOwner, repoName, branch = 'master') {
    // Check in-memory cache first
    if (this.fileTree && this.fileTreeCacheTime) {
      const age = Date.now() - this.fileTreeCacheTime;
      if (age < this.cacheTTL) {
        console.log('[GitHub Cache] Using in-memory file tree');
        return this.fileTree;
      }
    }

    // Check disk cache
    try {
      if (fs.existsSync(FILE_TREE_CACHE)) {
        const cacheData = JSON.parse(fs.readFileSync(FILE_TREE_CACHE, 'utf8'));
        const age = Date.now() - cacheData.timestamp;
        
        if (age < this.cacheTTL) {
          console.log('[GitHub Cache] Using cached file tree from disk');
          this.fileTree = cacheData.tree;
          this.fileTreeCacheTime = cacheData.timestamp;
          return this.fileTree;
        }
      }
    } catch (error) {
      // Disk cache not available, will use in-memory or fetch
      console.warn('[GitHub Cache] Disk cache not available, using in-memory');
      this.canWriteToDisk = false;
    }

    // Fetch from GitHub API
    console.log('[GitHub Cache] Fetching file tree from GitHub API...');
    try {
      const url = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${branch}?recursive=1`;
      const headers = {
        'User-Agent': 'Harmony-2.0-Master-Agent/1.0',
        'Accept': 'application/vnd.github.v3+json'
      };

      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const tree = data.tree.filter(item => item.type === 'blob'); // Only files, not directories

      // Cache to disk (if possible) or in-memory
      const cacheData = {
        tree,
        timestamp: Date.now(),
        branch,
        sha: data.sha
      };
      
      try {
        fs.writeFileSync(FILE_TREE_CACHE, JSON.stringify(cacheData, null, 2));
      } catch (error) {
        // Can't write to disk (serverless), use in-memory
        console.warn('[GitHub Cache] Cannot write to disk, using in-memory cache');
        this.canWriteToDisk = false;
        this.inMemoryCache.set('file-tree', cacheData);
      }

      // Cache in memory
      this.fileTree = tree;
      this.fileTreeCacheTime = Date.now();

      console.log(`[GitHub Cache] Fetched and cached ${tree.length} files`);
      return tree;
    } catch (error) {
      console.error('[GitHub Cache] Error fetching file tree:', error.message);
      throw error;
    }
  }

  /**
   * Get file content from cache or fetch from GitHub
   */
  async getFileContent(githubToken, repoOwner, repoName, filePath, branch = 'master') {
    // Generate cache key from file path
    const cacheKey = filePath.replace(/[^a-zA-Z0-9]/g, '_');
    const cacheFile = path.join(FILE_CONTENT_CACHE_DIR, `${cacheKey}.json`);

    // Check in-memory cache first
    const memKey = `file:${filePath}`;
    if (this.inMemoryCache.has(memKey)) {
      console.log(`[GitHub Cache] Using in-memory cached content for ${filePath}`);
      return this.inMemoryCache.get(memKey);
    }

    // Check disk cache
    try {
      if (fs.existsSync(cacheFile)) {
        const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        // Cache never expires for file content (unless file changes in repo)
        console.log(`[GitHub Cache] Using cached content for ${filePath}`);
        // Also cache in memory
        this.inMemoryCache.set(memKey, cacheData.content);
        return cacheData.content;
      }
    } catch (error) {
      // Disk cache not available
      this.canWriteToDisk = false;
    }

    // Fetch from GitHub
    console.log(`[GitHub Cache] Fetching ${filePath} from GitHub...`);
    try {
      const url = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${filePath}`;
      const headers = {
        'User-Agent': 'Harmony-2.0-Master-Agent/1.0'
      };

      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // File doesn't exist
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();

      // Cache to disk (if possible) or in-memory
      const cacheData = {
        content,
        filePath,
        timestamp: Date.now(),
        branch
      };
      
      // Always cache in memory
      this.inMemoryCache.set(memKey, content);
      
      // Try to cache to disk
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
        console.log(`[GitHub Cache] Cached ${filePath} to disk (${content.length} chars)`);
      } catch (error) {
        // Can't write to disk (serverless), in-memory cache is enough
        console.log(`[GitHub Cache] Cached ${filePath} in memory (${content.length} chars)`);
        this.canWriteToDisk = false;
      }

      return content;
    } catch (error) {
      console.error(`[GitHub Cache] Error fetching ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Find relevant files based on keywords
   */
  findRelevantFiles(fileTree, keywords, maxFiles = 15) {
    if (!fileTree || fileTree.length === 0) {
      return [];
    }

    const scores = [];
    const keywordLower = keywords.map(k => k.toLowerCase());

    for (const file of fileTree) {
      const pathLower = file.path.toLowerCase();
      let score = 0;

      // Exact matches get highest score
      for (const keyword of keywordLower) {
        if (pathLower.includes(keyword)) {
          score += 10;
        }
        // Partial matches
        if (pathLower.includes(keyword.substring(0, 3))) {
          score += 2;
        }
      }

      // Boost score for important file types
      if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
        score += 3;
      }
      if (file.path.endsWith('.js') || file.path.endsWith('.jsx')) {
        score += 2;
      }
      if (file.path.includes('index.')) {
        score += 1;
      }

      // Penalize very large files
      if (file.size > 50000) {
        score -= 5;
      }

      if (score > 0) {
        scores.push({ file, score });
      }
    }

    // Sort by score and return top files
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, maxFiles).map(item => item.file);
  }

  /**
   * Clear all caches
   */
  clearCache() {
    try {
      if (fs.existsSync(FILE_TREE_CACHE)) {
        fs.unlinkSync(FILE_TREE_CACHE);
      }
      if (fs.existsSync(FILE_CONTENT_CACHE_DIR)) {
        const files = fs.readdirSync(FILE_CONTENT_CACHE_DIR);
        files.forEach(file => {
          fs.unlinkSync(path.join(FILE_CONTENT_CACHE_DIR, file));
        });
      }
      this.fileTree = null;
      this.fileTreeCacheTime = null;
      console.log('[GitHub Cache] Cache cleared');
    } catch (error) {
      console.error('[GitHub Cache] Error clearing cache:', error.message);
    }
  }
}

