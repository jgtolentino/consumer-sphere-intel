/**
 * Azure OpenAI SQL Agent Interface
 * Converts natural language to SQL queries using canonical schema
 * Replaces Groq-based architecture with Azure OpenAI + direct SQL
 */

import { AgentService, AgentTask, AgentResult, AgentCapability } from './AgentService';

export interface SQLQueryRequest {
  question: string;
  context?: string;
  tableScope?: string[];
  maxRows?: number;
}

export interface SQLQueryResponse {
  sql_query: string;
  explanation: string;
  confidence_score: number;
  estimated_execution_time?: number;
  result_preview?: any[];
}

export interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion?: string;
}

export interface SQLConnectorConfig {
  connectionString: string;
  database: string;
  schema: string;
  maxQueryTimeout?: number;
}

export abstract class AzureOpenAISQLAgent extends AgentService {
  protected azureConfig: AzureOpenAIConfig;
  protected sqlConfig: SQLConnectorConfig;
  protected schemaDefinition: string;

  constructor(azureConfig: AzureOpenAIConfig, sqlConfig: SQLConnectorConfig) {
    super();
    this.azureConfig = azureConfig;
    this.sqlConfig = sqlConfig;
    this.schemaDefinition = this.buildSchemaDefinition();
  }

  // Abstract methods for schema-specific implementations
  protected abstract buildSchemaDefinition(): string;
  protected abstract executeSQL(query: string): Promise<any[]>;
  protected abstract validateSQLQuery(query: string): boolean;

  async generateSQLQuery(request: SQLQueryRequest): Promise<SQLQueryResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request);

      const response = await this.callAzureOpenAI(systemPrompt, userPrompt);
      
      return this.parseSQLResponse(response, request);
    } catch (error) {
      throw new Error(`SQL generation failed: ${error}`);
    }
  }

  async executeQueryWithAI(question: string): Promise<any> {
    try {
      // Generate SQL query
      const sqlResponse = await this.generateSQLQuery({ question });
      
      // Validate query
      if (!this.validateSQLQuery(sqlResponse.sql_query)) {
        throw new Error('Generated SQL query failed validation');
      }

      // Execute query
      const results = await this.executeSQL(sqlResponse.sql_query);
      
      // Generate insights using AI
      const insights = await this.generateInsights(question, sqlResponse.sql_query, results);

      return {
        question,
        sql_query: sqlResponse.sql_query,
        results,
        insights,
        metadata: {
          confidence: sqlResponse.confidence_score,
          execution_time: sqlResponse.estimated_execution_time,
          row_count: results.length
        }
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error}`);
    }
  }

  private async callAzureOpenAI(systemPrompt: string, userPrompt: string): Promise<any> {
    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'generate_sql_query',
            description: 'Generate SQL query based on natural language question',
            parameters: {
              type: 'object',
              properties: {
                sql_query: {
                  type: 'string',
                  description: 'The SQL query to execute'
                },
                explanation: {
                  type: 'string',
                  description: 'Explanation of what the query does'
                },
                confidence_score: {
                  type: 'number',
                  description: 'Confidence in query correctness (0-1)'
                }
              },
              required: ['sql_query', 'explanation', 'confidence_score']
            }
          }
        }
      ],
      tool_choice: { type: 'function', function: { name: 'generate_sql_query' } },
      temperature: 0.1,
      max_tokens: 1000
    };

    const response = await fetch(`${this.azureConfig.endpoint}/openai/deployments/${this.azureConfig.deploymentName}/chat/completions?api-version=${this.azureConfig.apiVersion || '2024-02-01'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.azureConfig.apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.statusText}`);
    }

    return response.json();
  }

  private buildSystemPrompt(): string {
    return `You are a retail analytics SQL expert. Generate secure, efficient SQL queries based on the following schema:

${this.schemaDefinition}

IMPORTANT RULES:
1. Always use proper JOINs with foreign key relationships
2. Never allow SQL injection - use parameterized queries concepts
3. Include appropriate WHERE clauses for data filtering
4. Use aggregate functions appropriately (SUM, COUNT, AVG, etc.)
5. Limit results to reasonable amounts (typically TOP 100 or LIMIT 100)
6. Always include table aliases for clarity
7. Use appropriate date filtering when time periods are mentioned
8. Validate that all referenced columns exist in the schema

OUTPUT FORMAT:
- Generate syntactically correct SQL for the target database
- Provide clear explanation of what the query accomplishes
- Include confidence score based on query complexity and schema fit
- Consider performance implications of the query

EXAMPLES:
- "Top 5 brands by sales" → JOIN transactions, transaction_items, products, brands
- "Average basket size" → COUNT transaction_items per transaction
- "Substitution patterns" → Use substitutions table with product lookups`;
  }

  private buildUserPrompt(request: SQLQueryRequest): string {
    let prompt = `Question: ${request.question}`;
    
    if (request.context) {
      prompt += `\nContext: ${request.context}`;
    }
    
    if (request.tableScope?.length) {
      prompt += `\nFocus on tables: ${request.tableScope.join(', ')}`;
    }
    
    if (request.maxRows) {
      prompt += `\nLimit results to ${request.maxRows} rows`;
    }

    prompt += '\n\nGenerate the SQL query and explanation.';
    
    return prompt;
  }

  private parseSQLResponse(response: any, request: SQLQueryRequest): SQLQueryResponse {
    try {
      const toolCall = response.choices[0]?.message?.tool_calls?.[0];
      
      if (!toolCall || toolCall.function?.name !== 'generate_sql_query') {
        throw new Error('Invalid response format from Azure OpenAI');
      }

      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      return {
        sql_query: functionArgs.sql_query,
        explanation: functionArgs.explanation,
        confidence_score: functionArgs.confidence_score,
        estimated_execution_time: this.estimateExecutionTime(functionArgs.sql_query)
      };
    } catch (error) {
      throw new Error(`Failed to parse SQL response: ${error}`);
    }
  }

  private async generateInsights(question: string, sqlQuery: string, results: any[]): Promise<any> {
    if (results.length === 0) {
      return {
        summary: 'No data found matching the criteria',
        recommendations: [],
        key_findings: []
      };
    }

    // Use Azure OpenAI to generate insights from the results
    const insightPrompt = `Based on this retail analytics question: "${question}"
    
SQL Query: ${sqlQuery}
    
Results (first 10 rows): ${JSON.stringify(results.slice(0, 10), null, 2)}

Generate business insights including:
1. Key findings summary
2. Business recommendations
3. Notable patterns or anomalies
4. Next steps for analysis`;

    try {
      const insightResponse = await this.callAzureOpenAI(
        'You are a retail business analyst. Provide actionable insights from SQL query results.',
        insightPrompt
      );

      const content = insightResponse.choices[0]?.message?.content || 'Unable to generate insights';
      
      return this.parseInsightContent(content);
    } catch (error) {
      console.warn('Failed to generate AI insights:', error);
      return {
        summary: 'Query executed successfully',
        recommendations: [],
        key_findings: [`Found ${results.length} matching records`]
      };
    }
  }

  private parseInsightContent(content: string): any {
    // Basic parsing of insight content
    // In a real implementation, this could be more sophisticated
    return {
      summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      recommendations: this.extractRecommendations(content),
      key_findings: this.extractKeyFindings(content)
    };
  }

  private extractRecommendations(content: string): string[] {
    const recommendations = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations.slice(0, 3); // Limit to top 3
  }

  private extractKeyFindings(content: string): string[] {
    const findings = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('•') || line.includes('-') || line.includes('*')) {
        findings.push(line.replace(/^[-•*]\s*/, '').trim());
      }
    }
    
    return findings.slice(0, 5); // Limit to top 5
  }

  private estimateExecutionTime(sqlQuery: string): number {
    // Basic estimation based on query complexity
    const complexity = this.calculateQueryComplexity(sqlQuery);
    return Math.min(complexity * 100, 5000); // Max 5 seconds
  }

  private calculateQueryComplexity(sqlQuery: string): number {
    let complexity = 1;
    
    // Count JOINs
    complexity += (sqlQuery.match(/JOIN/gi) || []).length * 2;
    
    // Count subqueries
    complexity += (sqlQuery.match(/\(/g) || []).length;
    
    // Count aggregate functions
    complexity += (sqlQuery.match(/(SUM|COUNT|AVG|MAX|MIN)\s*\(/gi) || []).length;
    
    // Count ORDER BY clauses
    complexity += (sqlQuery.match(/ORDER BY/gi) || []).length;
    
    return complexity;
  }

  protected async healthCheckSQL(): Promise<boolean> {
    try {
      // Test basic connectivity with a simple query
      const testQuery = 'SELECT 1 as test_connection';
      const results = await this.executeSQL(testQuery);
      return results.length > 0 && results[0].test_connection === 1;
    } catch {
      return false;
    }
  }

  protected async healthCheckAzureOpenAI(): Promise<boolean> {
    try {
      const response = await this.callAzureOpenAI(
        'You are a test assistant.',
        'Respond with "OK" if you can process this message.'
      );
      
      return response.choices?.[0]?.message?.content?.includes('OK') || false;
    } catch {
      return false;
    }
  }
}