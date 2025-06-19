/**
 * Stockbot SQL Agent (Azure OpenAI + Direct SQL)
 * Replaces Groq architecture with Azure OpenAI + canonical schema SQL
 * Maintains contract compliance with enhanced SQL capabilities
 */

import { AzureOpenAISQLAgent, AzureOpenAIConfig, SQLConnectorConfig, SQLQueryRequest } from './AzureOpenAISQLAgent';
import { AgentTask, AgentResult, AgentCapability } from './AgentService';
import { SQLConnector } from '../services/SQLConnector';
import { 
  TransactionWithDetails, 
  ProductSubstitution, 
  CategoryMix,
  BrandPerformance 
} from '../schema';

export class StockbotSQLAgent extends AzureOpenAISQLAgent {
  readonly id = 'stockbot-sql';
  readonly version = '3.0.0';
  readonly capabilities: AgentCapability = {
    taskTypes: ['stock-analysis', 'insight-generation', 'data-fetch', 'sql-query'],
    inputSchema: {
      analysis_type: 'string',
      question: 'string',
      sql_query: 'string',
      product_filter: 'object',
      time_period: 'object'
    },
    outputSchema: {
      stock_insights: 'array',
      inventory_recommendations: 'array',
      substitution_patterns: 'array',
      sql_results: 'object'
    },
    dependencies: ['azure-openai', 'sql-database', 'canonical-schema']
  };

  private sqlConnector: SQLConnector;

  constructor(
    azureConfig?: AzureOpenAIConfig,
    sqlConfig?: SQLConnectorConfig,
    useMockData: boolean = true
  ) {
    // Default configurations for development/mock mode
    const defaultAzureConfig: AzureOpenAIConfig = {
      apiKey: process.env.AZURE_OPENAI_API_KEY || 'mock-key',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://mock.openai.azure.com',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
      apiVersion: '2024-02-01'
    };

    const defaultSQLConfig: SQLConnectorConfig = {
      host: process.env.SQL_HOST || 'localhost',
      port: parseInt(process.env.SQL_PORT || '5432'),
      database: process.env.SQL_DATABASE || 'retail_analytics',
      username: process.env.SQL_USERNAME || 'postgres',
      password: process.env.SQL_PASSWORD || 'password',
      schema: 'public',
      connectionString: process.env.SQL_CONNECTION_STRING || ''
    };

    const resolvedSQLConfig = sqlConfig || defaultSQLConfig;
    
    // Initialize SQL connector before calling super to avoid undefined issues
    const sqlConnector = new SQLConnector(resolvedSQLConfig);
    
    super(
      azureConfig || defaultAzureConfig,
      resolvedSQLConfig
    );

    this.sqlConnector = sqlConnector;
    
    if (!useMockData) {
      this.initializeConnections();
    }
  }

  private async initializeConnections(): Promise<void> {
    try {
      await this.sqlConnector.initialize();
      console.log('✅ Stockbot SQL connections initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Stockbot SQL connections:', error);
      throw error;
    }
  }

  async runTask(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    const taskId = this.generateTaskId();

    try {
      switch (task.type) {
        case 'sql-query':
          return await this.handleSQLQuery(task, taskId, startTime);
        case 'stock-analysis':
          return await this.handleStockAnalysis(task, taskId, startTime);
        case 'insight-generation':
          return await this.handleInsightGeneration(task, taskId, startTime);
        case 'data-fetch':
          return await this.handleDataFetch(task, taskId, startTime);
        case 'health-check':
          return await this.handleHealthCheck(taskId, startTime);
        default:
          return this.createErrorResult(`Unsupported task type: ${task.type}`, taskId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(errorMessage, taskId);
    }
  }

  private async handleSQLQuery(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { question, sql_query } = task.payload;

    let result;
    if (sql_query) {
      // Direct SQL execution
      const queryResult = await this.sqlConnector.executeQuery(sql_query);
      result = {
        question: question || 'Direct SQL query',
        sql_query,
        results: queryResult.rows,
        metadata: {
          execution_time_ms: queryResult.executionTimeMs,
          row_count: queryResult.rowCount
        }
      };
    } else if (question) {
      // AI-generated SQL from natural language
      result = await this.executeQueryWithAI(question);
    } else {
      throw new Error('Either question or sql_query must be provided');
    }

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult(result, taskId, executionTime);
  }

  private async handleStockAnalysis(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { analysis_type, product_filter, time_period } = task.payload;

    const sqlQueries = this.getStockAnalysisQueries(analysis_type, product_filter, time_period);
    const analysisResults = [];

    for (const { query, description } of sqlQueries) {
      try {
        const result = await this.sqlConnector.executeQuery(query);
        analysisResults.push({
          analysis: description,
          sql_query: query,
          results: result.rows,
          execution_time_ms: result.executionTimeMs
        });
      } catch (error) {
        console.warn(`Failed to execute ${description}:`, error);
      }
    }

    // Generate AI insights from SQL results
    const insights = await this.generateStockInsights(analysis_type, analysisResults);

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      analysis_type,
      sql_analysis: analysisResults,
      insights,
      recommendations: this.generateStockRecommendations(insights)
    }, taskId, executionTime);
  }

  private async handleInsightGeneration(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { focus_area, question } = task.payload;

    const insightQuery = question || this.getInsightQuestionForFocus(focus_area);
    const result = await this.executeQueryWithAI(insightQuery);

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      focus_area,
      insights: result.insights,
      sql_analysis: {
        question: result.question,
        sql_query: result.sql_query,
        results: result.results
      },
      metadata: result.metadata
    }, taskId, executionTime);
  }

  private async handleDataFetch(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { data_type, filters } = task.payload;

    const query = this.getDataFetchQuery(data_type, filters);
    const result = await this.sqlConnector.executeQuery(query);

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      data_type,
      data: result.rows,
      sql_query: query,
      metadata: {
        row_count: result.rowCount,
        execution_time_ms: result.executionTimeMs
      }
    }, taskId, executionTime);
  }

  private async handleHealthCheck(taskId: string, startTime: number): Promise<AgentResult> {
    const sqlHealth = await this.healthCheckSQL();
    const aiHealth = await this.healthCheckAzureOpenAI();

    const executionTime = Date.now() - startTime;
    const isHealthy = sqlHealth && aiHealth;

    return this.createSuccessResult({
      status: isHealthy ? 'healthy' : 'degraded',
      sql_connection: sqlHealth,
      azure_openai_connection: aiHealth,
      capabilities: ['sql-analysis', 'ai-insights', 'natural-language-queries']
    }, taskId, executionTime);
  }

  protected buildSchemaDefinition(): string {
    // Return schema definition directly since sqlConnector may not be initialized yet
    return `
-- Canonical Retail Analytics Schema

-- Brands table
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  is_tbwa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table  
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  brand_id INTEGER REFERENCES brands(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  age_bracket VARCHAR(20),
  gender VARCHAR(10),
  inferred_income VARCHAR(50),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores table
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  region VARCHAR(100),
  city VARCHAR(100),
  barangay VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  store_id INTEGER REFERENCES stores(id),
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction items table
CREATE TABLE transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Substitutions table
CREATE TABLE substitutions (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id),
  from_product_id INTEGER REFERENCES products(id),
  to_product_id INTEGER REFERENCES products(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer requests table
CREATE TABLE customer_requests (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id),
  request_type VARCHAR(50),
  request_mode VARCHAR(50),
  accepted_suggestion BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Common query patterns:
-- 1. Brand performance: JOIN transactions, transaction_items, products, brands
-- 2. Regional analysis: JOIN transactions, stores
-- 3. Customer behavior: JOIN transactions, customers
-- 4. Substitution patterns: JOIN substitutions, products (twice)
-- 5. Product performance: JOIN transaction_items, products, brands
`;
  }

  protected async executeSQL(query: string): Promise<any[]> {
    const result = await this.sqlConnector.executeQuery(query);
    return result.rows;
  }

  protected validateSQLQuery(query: string): boolean {
    try {
      this.sqlConnector.validateQuery(query);
      return true;
    } catch {
      return false;
    }
  }

  private getStockAnalysisQueries(analysisType: string, productFilter: any, timePeriod: any): Array<{query: string, description: string}> {
    const timeFilter = this.buildTimeFilter(timePeriod);
    const productFilterClause = this.buildProductFilter(productFilter);

    switch (analysisType) {
      case 'demand_forecast':
        return [
          {
            query: `
              SELECT p.category, 
                     COUNT(ti.id) as transaction_count,
                     SUM(ti.quantity) as total_quantity,
                     AVG(ti.quantity) as avg_quantity_per_transaction
              FROM transaction_items ti
              JOIN products p ON ti.product_id = p.id
              JOIN transactions t ON ti.transaction_id = t.id
              WHERE ${timeFilter} ${productFilterClause}
              GROUP BY p.category
              ORDER BY total_quantity DESC
            `,
            description: 'Category demand analysis'
          },
          {
            query: `
              SELECT p.name as product_name, b.name as brand_name,
                     COUNT(ti.id) as transaction_frequency,
                     SUM(ti.quantity * ti.unit_price) as total_revenue
              FROM transaction_items ti
              JOIN products p ON ti.product_id = p.id
              JOIN brands b ON p.brand_id = b.id
              JOIN transactions t ON ti.transaction_id = t.id
              WHERE ${timeFilter} ${productFilterClause}
              GROUP BY p.name, b.name
              ORDER BY transaction_frequency DESC
              LIMIT 20
            `,
            description: 'Top product performance'
          }
        ];

      case 'substitution_patterns':
        return [
          {
            query: `
              SELECT fp.name as from_product, tp.name as to_product,
                     fb.name as from_brand, tb.name as to_brand,
                     COUNT(s.id) as substitution_count
              FROM substitutions s
              JOIN products fp ON s.from_product_id = fp.id
              JOIN products tp ON s.to_product_id = tp.id
              JOIN brands fb ON fp.brand_id = fb.id
              JOIN brands tb ON tp.brand_id = tb.id
              JOIN transactions t ON s.transaction_id = t.id
              WHERE ${timeFilter}
              GROUP BY fp.name, tp.name, fb.name, tb.name
              ORDER BY substitution_count DESC
              LIMIT 15
            `,
            description: 'Product substitution analysis'
          }
        ];

      case 'inventory_optimization':
        return [
          {
            query: `
              SELECT p.category,
                     COUNT(DISTINCT ti.transaction_id) as transaction_frequency,
                     SUM(ti.quantity) as total_demand,
                     AVG(ti.quantity) as avg_demand_per_transaction,
                     SUM(ti.quantity * ti.unit_price) as category_revenue
              FROM transaction_items ti
              JOIN products p ON ti.product_id = p.id
              JOIN transactions t ON ti.transaction_id = t.id
              WHERE ${timeFilter} ${productFilterClause}
              GROUP BY p.category
              ORDER BY category_revenue DESC
            `,
            description: 'Category inventory optimization'
          }
        ];

      default:
        return [
          {
            query: `
              SELECT 'general_analysis' as analysis_type,
                     COUNT(*) as total_transactions,
                     SUM(total_amount) as total_revenue
              FROM transactions t
              WHERE ${timeFilter}
            `,
            description: 'General stock analysis'
          }
        ];
    }
  }

  private buildTimeFilter(timePeriod: any): string {
    if (!timePeriod) {
      return "t.created_at >= CURRENT_DATE - INTERVAL '30 days'";
    }

    if (timePeriod.from && timePeriod.to) {
      return `t.created_at >= '${timePeriod.from}' AND t.created_at <= '${timePeriod.to}'`;
    }

    if (timePeriod.days) {
      return `t.created_at >= CURRENT_DATE - INTERVAL '${timePeriod.days} days'`;
    }

    return "t.created_at >= CURRENT_DATE - INTERVAL '30 days'";
  }

  private buildProductFilter(productFilter: any): string {
    if (!productFilter) return '';

    const conditions = [];

    if (productFilter.category) {
      conditions.push(`AND p.category = '${productFilter.category}'`);
    }

    if (productFilter.brand) {
      conditions.push(`AND b.name = '${productFilter.brand}'`);
    }

    if (productFilter.product_ids?.length) {
      conditions.push(`AND p.id IN (${productFilter.product_ids.join(',')})`);
    }

    return conditions.join(' ');
  }

  private async generateStockInsights(analysisType: string, analysisResults: any[]): Promise<any[]> {
    // Generate AI insights from SQL analysis results
    const insights = [];

    for (const result of analysisResults) {
      if (result.results.length > 0) {
        const insight = await this.generateInsights(
          `Stock analysis: ${result.analysis}`,
          result.sql_query,
          result.results
        );

        insights.push({
          analysis_type: result.analysis,
          ...insight,
          data_points: result.results.length
        });
      }
    }

    return insights;
  }

  private generateStockRecommendations(insights: any[]): any[] {
    return insights.map(insight => ({
      based_on: insight.analysis_type,
      recommendations: insight.recommendations || [],
      priority: insight.key_findings?.length > 3 ? 'high' : 'medium',
      estimated_impact: 'medium'
    }));
  }

  private getInsightQuestionForFocus(focusArea: string): string {
    const questions = {
      'inventory': 'What are the top performing product categories by sales volume?',
      'demand': 'Which products have the highest demand patterns?',
      'substitution': 'What are the most common product substitution patterns?',
      'performance': 'Which brands and products are performing best?',
      'optimization': 'What categories need inventory optimization?'
    };

    return questions[focusArea as keyof typeof questions] || 'What are the key stock performance insights?';
  }

  private getDataFetchQuery(dataType: string, filters: any): string {
    const timeFilter = this.buildTimeFilter(filters?.time_period);

    switch (dataType) {
      case 'product_velocity':
        return `
          SELECT p.name as product_name, p.category, b.name as brand_name,
                 COUNT(ti.id) as transaction_count,
                 SUM(ti.quantity) as total_quantity,
                 AVG(ti.quantity) as avg_velocity
          FROM transaction_items ti
          JOIN products p ON ti.product_id = p.id
          JOIN brands b ON p.brand_id = b.id
          JOIN transactions t ON ti.transaction_id = t.id
          WHERE ${timeFilter}
          GROUP BY p.name, p.category, b.name
          ORDER BY total_quantity DESC
          LIMIT 50
        `;

      case 'substitution_matrix':
        return `
          SELECT fp.name as from_product, tp.name as to_product,
                 COUNT(s.id) as substitution_count
          FROM substitutions s
          JOIN products fp ON s.from_product_id = fp.id
          JOIN products tp ON s.to_product_id = tp.id
          JOIN transactions t ON s.transaction_id = t.id
          WHERE ${timeFilter}
          GROUP BY fp.name, tp.name
          ORDER BY substitution_count DESC
        `;

      case 'category_performance':
        return `
          SELECT p.category,
                 COUNT(ti.id) as transaction_count,
                 SUM(ti.quantity * ti.unit_price) as total_revenue,
                 AVG(ti.quantity * ti.unit_price) as avg_revenue_per_transaction
          FROM transaction_items ti
          JOIN products p ON ti.product_id = p.id
          JOIN transactions t ON ti.transaction_id = t.id
          WHERE ${timeFilter}
          GROUP BY p.category
          ORDER BY total_revenue DESC
        `;

      default:
        return `
          SELECT 'general' as data_type, COUNT(*) as count
          FROM transactions t
          WHERE ${timeFilter}
        `;
    }
  }

  private generateTaskId(): string {
    return `stockbot_sql_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  async shutdown(): Promise<void> {
    await this.sqlConnector.close();
  }
}