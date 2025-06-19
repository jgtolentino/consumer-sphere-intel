import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_ROOT = '/Users/tbwa/Documents/GitHub';
const OUTPUT_FILE = 'agents-inventory-report.md';

class AgentInventoryScanner {
  constructor() {
    this.agents = [];
    this.projects = new Set();
    this.duplicates = [];
    this.orphaned = [];
    this.errors = [];
  }

  // Recursively scan for agent YAML files
  async scanDirectory(dirPath, projectName = '') {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules, .git, and other common ignore patterns
          if (['node_modules', '.git', '.next', 'dist', '.venv'].includes(entry.name)) {
            continue;
          }
          
          // If this looks like a project root, update project name
          const currentProject = projectName || (this.isProjectRoot(fullPath) ? entry.name : '');
          await this.scanDirectory(fullPath, currentProject);
        } else if (entry.isFile() && entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
          // Check if this is in an agents directory or looks like an agent file
          if (fullPath.includes('/agents/') || this.isAgentFile(entry.name)) {
            await this.processAgentFile(fullPath, projectName);
          }
        }
      }
    } catch (error) {
      this.errors.push({ path: dirPath, error: error.message });
    }
  }

  // Check if directory is a project root
  isProjectRoot(dirPath) {
    const indicators = ['package.json', 'requirements.txt', 'Cargo.toml', '.git'];
    return indicators.some(indicator => fs.existsSync(path.join(dirPath, indicator)));
  }

  // Check if file looks like an agent definition
  isAgentFile(filename) {
    const agentPatterns = [
      'agent.yaml', 'agent.yml',
      /.*agent.*\.ya?ml$/,
      /.*bot.*\.ya?ml$/,
      /(retailbot|dash|caca|genie|pulser).*\.ya?ml$/
    ];
    return agentPatterns.some(pattern => 
      typeof pattern === 'string' ? filename === pattern : pattern.test(filename)
    );
  }

  // Process individual agent YAML file
  async processAgentFile(filePath, projectName) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const agentData = yaml.load(content);
      
      if (!agentData || typeof agentData !== 'object') {
        this.errors.push({ path: filePath, error: 'Invalid YAML structure' });
        return;
      }

      // Extract agent information
      const agent = {
        name: agentData.name || agentData.agent_name || path.basename(filePath, path.extname(filePath)),
        codename: agentData.codename || agentData.id || '',
        version: agentData.version || agentData.agent_version || 'unknown',
        type: agentData.type || agentData.agent_type || this.inferType(agentData),
        description: agentData.description || agentData.summary || '',
        path: filePath,
        relativePath: path.relative(GITHUB_ROOT, filePath),
        project: projectName || this.extractProjectFromPath(filePath),
        capabilities: agentData.capabilities || agentData.skills || [],
        dependencies: agentData.dependencies || agentData.requires || [],
        lastModified: this.getFileStats(filePath).mtime,
        hasImplementation: this.checkForImplementation(filePath),
        permissions: agentData.permissions || agentData.access || {},
        config: agentData.config || agentData.configuration || {}
      };

      this.agents.push(agent);
      this.projects.add(agent.project);
      
    } catch (error) {
      this.errors.push({ path: filePath, error: error.message });
    }
  }

  // Infer agent type from content
  inferType(agentData) {
    const content = JSON.stringify(agentData).toLowerCase();
    
    if (content.includes('dashboard') || content.includes('analytics')) return 'analytics';
    if (content.includes('chat') || content.includes('bot')) return 'chatbot';
    if (content.includes('qa') || content.includes('test')) return 'qa';
    if (content.includes('orchestrat') || content.includes('workflow')) return 'orchestrator';
    if (content.includes('data') || content.includes('pipeline')) return 'data';
    
    return 'unknown';
  }

  // Extract project name from file path
  extractProjectFromPath(filePath) {
    const relativePath = path.relative(GITHUB_ROOT, filePath);
    return relativePath.split(path.sep)[0] || 'unknown';
  }

  // Get file statistics
  getFileStats(filePath) {
    try {
      return fs.statSync(filePath);
    } catch {
      return { mtime: new Date(0) };
    }
  }

  // Check for TypeScript/JavaScript implementation
  checkForImplementation(yamlPath) {
    const dir = path.dirname(yamlPath);
    const basename = path.basename(yamlPath, path.extname(yamlPath));
    
    const possibleImpls = [
      path.join(dir, `${basename}.ts`),
      path.join(dir, `${basename}.js`),
      path.join(dir, 'index.ts'),
      path.join(dir, 'index.js'),
      path.join(dir, `${basename}`, 'index.ts'),
      path.join(dir, `${basename}`, 'index.js')
    ];
    
    return possibleImpls.some(implPath => fs.existsSync(implPath));
  }

  // Find duplicate agents
  findDuplicates() {
    const agentMap = new Map();
    
    for (const agent of this.agents) {
      const key = `${agent.name}:${agent.codename}`;
      if (!agentMap.has(key)) {
        agentMap.set(key, []);
      }
      agentMap.get(key).push(agent);
    }
    
    this.duplicates = Array.from(agentMap.entries())
      .filter(([_, agents]) => agents.length > 1)
      .map(([key, agents]) => ({ key, agents }));
  }

  // Generate comprehensive Markdown report
  generateReport() {
    const reportDate = new Date().toISOString().split('T')[0];
    const totalAgents = this.agents.length;
    const totalProjects = this.projects.size;
    
    let report = `# Agent Inventory Report

**Generated:** ${new Date().toISOString()}  
**Scanned Path:** ${GITHUB_ROOT}  
**Total Agents Found:** ${totalAgents}  
**Projects Scanned:** ${totalProjects}

## Executive Summary

This comprehensive scan identified all agent definitions across the GitHub directory structure. Each agent has been cataloged with version information, capabilities, and implementation status.

## Agent Inventory Table

| Agent Name | Codename | Version | Type | Project | Has Implementation | Last Modified |
|------------|----------|---------|------|---------|-------------------|---------------|
${this.agents.map(agent => 
  `| ${agent.name} | ${agent.codename} | ${agent.version} | ${agent.type} | ${agent.project} | ${agent.hasImplementation ? '✅' : '❌'} | ${agent.lastModified.toLocaleDateString()} |`
).join('\n')}

## Detailed Agent Profiles

${this.agents.map(agent => `
### ${agent.name} (${agent.codename})

- **Version:** ${agent.version}
- **Type:** ${agent.type}
- **Project:** ${agent.project}
- **Path:** \`${agent.relativePath}\`
- **Description:** ${agent.description || 'No description available'}
- **Has Implementation:** ${agent.hasImplementation ? '✅ Yes' : '❌ No'}
- **Capabilities:** ${agent.capabilities.length > 0 ? agent.capabilities.join(', ') : 'None specified'}
- **Dependencies:** ${agent.dependencies.length > 0 ? agent.dependencies.join(', ') : 'None specified'}
- **Last Modified:** ${agent.lastModified.toLocaleDateString()}
`).join('\n')}

## Projects Overview

${Array.from(this.projects).map(project => {
  const projectAgents = this.agents.filter(a => a.project === project);
  return `
### ${project}
- **Agent Count:** ${projectAgents.length}
- **Agents:** ${projectAgents.map(a => a.name).join(', ')}
- **Types:** ${[...new Set(projectAgents.map(a => a.type))].join(', ')}
`;
}).join('\n')}

${this.duplicates.length > 0 ? `
## ⚠️ Duplicate Agents Detected

${this.duplicates.map(({ key, agents }) => `
### ${key}
Found in multiple locations:
${agents.map(agent => `- ${agent.project}: \`${agent.relativePath}\` (v${agent.version})`).join('\n')}
`).join('\n')}
` : '## ✅ No Duplicate Agents Found'}

## Agent Types Distribution

${(() => {
  const typeCount = {};
  this.agents.forEach(agent => {
    typeCount[agent.type] = (typeCount[agent.type] || 0) + 1;
  });
  
  return Object.entries(typeCount)
    .sort(([,a], [,b]) => b - a)
    .map(([type, count]) => `- **${type}:** ${count} agents`)
    .join('\n');
})()}

## Implementation Status

- **With Implementation:** ${this.agents.filter(a => a.hasImplementation).length} agents
- **Without Implementation:** ${this.agents.filter(a => !a.hasImplementation).length} agents

${this.errors.length > 0 ? `
## ⚠️ Scan Errors

${this.errors.map(error => `- \`${error.path}\`: ${error.error}`).join('\n')}
` : '## ✅ No Scan Errors'}

## Recommendations

### 1. Version Standardization
${this.duplicates.length > 0 ? '- **Critical:** Resolve duplicate agents with different versions' : '- **Good:** No version conflicts detected'}

### 2. Implementation Gaps
${this.agents.filter(a => !a.hasImplementation).length > 0 ? 
  `- **Action Required:** ${this.agents.filter(a => !a.hasImplementation).length} agents lack implementation files` : 
  '- **Excellent:** All agents have implementation files'}

### 3. Project Consolidation
- Consider consolidating agents from ${totalProjects} projects into a centralized agents registry
- Standardize agent YAML schema across all projects

## Next Steps

1. **Review Duplicates:** Address any duplicate agents with conflicting versions
2. **Implement Missing Agents:** Create implementation files for agents without code
3. **Standardize Schema:** Ensure all agent YAML files follow the same structure
4. **Central Registry:** Consider creating a master agents registry for the organization

---
*Generated by Agent Inventory Scanner - Consumer Sphere Intel*
`;

    return report;
  }

  // Main scan function
  async scan() {
    console.log(`🔍 Starting agent inventory scan of ${GITHUB_ROOT}...`);
    
    await this.scanDirectory(GITHUB_ROOT);
    this.findDuplicates();
    
    const report = this.generateReport();
    
    // Write report to file
    fs.writeFileSync(OUTPUT_FILE, report);
    
    console.log(`\n📊 Scan Complete!`);
    console.log(`- Found ${this.agents.length} agents across ${this.projects.size} projects`);
    console.log(`- Duplicates detected: ${this.duplicates.length}`);
    console.log(`- Scan errors: ${this.errors.length}`);
    console.log(`- Report saved to: ${OUTPUT_FILE}`);
    
    return {
      agents: this.agents,
      projects: Array.from(this.projects),
      duplicates: this.duplicates,
      errors: this.errors,
      report
    };
  }
}

// Execute scan
const scanner = new AgentInventoryScanner();
scanner.scan().catch(console.error);