/**
 * BI Genie Agent Service
 * Handles business intelligence queries and insight generation
 * Uses canonical schema types - no drift allowed
 */

import { AgentService, AgentTask, AgentResult, AgentCapability } from './AgentService';
import { 
  TransactionWithDetails, 
  BrandPerformance, 
  CategoryMix, 
  RegionalData,
  ConsumerInsight 
} from '../schema';
import { MockDataServiceV2 } from '../services/MockDataService.v2';
import { RealDataServiceV2 } from '../services/RealDataService.v2';

export class BiGenieAgent extends AgentService {
  readonly id = 'bi-genie';
  readonly version = '2.0.0';
  readonly capabilities: AgentCapability = {
    taskTypes: ['insight-generation', 'data-fetch', 'visualization'],
    inputSchema: {
      query: 'string',
      filters: 'object',
      visualization_type: 'string'
    },
    outputSchema: {
      insights: 'array',
      data: 'object',
      recommendations: 'array'
    },
    dependencies: ['supabase', 'analytics-engine']
  };

  private dataService: MockDataServiceV2 | RealDataServiceV2;

  constructor(useRealData: boolean = false) {
    super();
    this.dataService = useRealData ? new RealDataServiceV2() : new MockDataServiceV2();
  }

  async runTask(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    const taskId = this.generateTaskId();

    try {
      switch (task.type) {
        case 'insight-generation':
          return await this.generateInsights(task, taskId, startTime);
        case 'data-fetch':
          return await this.fetchData(task, taskId, startTime);
        case 'visualization':
          return await this.createVisualization(task, taskId, startTime);
        case 'health-check':
          return this.createSuccessResult({ status: 'healthy' }, taskId, Date.now() - startTime);
        default:
          return this.createErrorResult(`Unsupported task type: ${task.type}`, taskId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(errorMessage, taskId);
    }
  }

  private async generateInsights(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { query, filters } = task.payload;

    // Fetch data using canonical schema
    const transactions = await this.dataService.getTransactions(filters);
    const brandData = await this.dataService.getBrandData();
    const regionalData = await this.dataService.getRegionalData();
    const consumerData = await this.dataService.getConsumerData();

    // Generate insights based on query
    const insights = await this.analyzeData(query, {
      transactions,
      brands: brandData,
      regions: regionalData,
      consumers: consumerData
    });

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      insights,
      metadata: {
        query,
        dataPoints: transactions.length,
        analysisType: 'comprehensive',
        confidence: 0.85
      },
      recommendations: this.generateRecommendations(insights)
    }, taskId, executionTime);
  }

  private async fetchData(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { dataType, filters } = task.payload;

    let data;
    switch (dataType) {
      case 'transactions':
        data = await this.dataService.getTransactions(filters);
        break;
      case 'brands':
        data = await this.dataService.getBrandData();
        break;
      case 'regions':
        data = await this.dataService.getRegionalData();
        break;
      case 'categories':
        data = await this.dataService.getCategoryMix();
        break;
      case 'consumers':
        data = await this.dataService.getConsumerData();
        break;
      default:
        return this.createErrorResult(`Unknown data type: ${dataType}`, taskId);
    }

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      dataType,
      data,
      count: Array.isArray(data) ? data.length : 1,
      schema_version: '2.0.0'
    }, taskId, executionTime);
  }

  private async createVisualization(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { visualizationType, data, options } = task.payload;

    const visualizationConfig = this.generateVisualizationConfig(visualizationType, data, options);

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      type: visualizationType,
      config: visualizationConfig,
      data: data,
      renderInstructions: this.getVisualizationInstructions(visualizationType)
    }, taskId, executionTime);
  }

  private async analyzeData(query: string, data: any): Promise<any[]> {
    // AI-powered analysis simulation
    const insights = [];

    // Market Share Analysis
    if (query.toLowerCase().includes('market share') || query.toLowerCase().includes('competition')) {
      const tbwaShare = data.brands
        .filter((b: BrandPerformance) => b.is_tbwa)
        .reduce((sum: number, b: BrandPerformance) => sum + b.market_share, 0);
      
      insights.push({
        type: 'market_share',
        title: 'TBWA Client Market Share',
        value: `${tbwaShare.toFixed(1)}%`,
        trend: tbwaShare > 35 ? 'positive' : 'negative',
        description: `TBWA clients hold ${tbwaShare.toFixed(1)}% of the market`,
        actionable: tbwaShare < 40
      });
    }

    // Regional Performance
    if (query.toLowerCase().includes('region') || query.toLowerCase().includes('location')) {
      const topRegion = data.regions.reduce((max: RegionalData, region: RegionalData) => 
        region.total_revenue > max.total_revenue ? region : max
      );
      
      insights.push({
        type: 'regional_performance',
        title: 'Top Performing Region',
        value: topRegion.region,
        trend: 'positive',
        description: `${topRegion.region} leads with ₱${topRegion.total_revenue.toLocaleString()} revenue`,
        actionable: true
      });
    }

    // Consumer Behavior
    if (query.toLowerCase().includes('consumer') || query.toLowerCase().includes('customer')) {
      const digitalPayments = data.consumers
        .filter((c: ConsumerInsight) => c.payment_method === 'Digital')
        .reduce((sum: number, c: ConsumerInsight) => sum + c.transaction_count, 0);
      
      const totalTransactions = data.consumers
        .reduce((sum: number, c: ConsumerInsight) => sum + c.transaction_count, 0);
      
      const digitalPercentage = (digitalPayments / totalTransactions) * 100;
      
      insights.push({
        type: 'payment_behavior',
        title: 'Digital Payment Adoption',
        value: `${digitalPercentage.toFixed(1)}%`,
        trend: digitalPercentage > 25 ? 'positive' : 'negative',
        description: `${digitalPercentage.toFixed(1)}% of transactions use digital payments`,
        actionable: digitalPercentage < 30
      });
    }

    return insights;
  }

  private generateRecommendations(insights: any[]): any[] {
    return insights
      .filter(insight => insight.actionable)
      .map(insight => ({
        type: 'improvement',
        title: `Optimize ${insight.type.replace('_', ' ')}`,
        description: `Based on ${insight.title}, consider strategic improvements`,
        priority: insight.trend === 'negative' ? 'high' : 'medium',
        category: insight.type
      }));
  }

  private generateVisualizationConfig(type: string, data: any, options: any): any {
    switch (type) {
      case 'bar_chart':
        return {
          chart: { type: 'bar' },
          xAxis: { categories: data.map((d: any) => d.name || d.category) },
          yAxis: { title: { text: options.yAxisLabel || 'Value' } },
          series: [{
            name: options.seriesName || 'Data',
            data: data.map((d: any) => d.value || d.total_revenue)
          }]
        };
      case 'pie_chart':
        return {
          chart: { type: 'pie' },
          series: [{
            name: options.seriesName || 'Share',
            data: data.map((d: any) => ({
              name: d.name || d.category,
              y: d.value || d.percentage_of_total
            }))
          }]
        };
      case 'line_chart':
        return {
          chart: { type: 'line' },
          xAxis: { categories: options.timePoints || [] },
          yAxis: { title: { text: options.yAxisLabel || 'Value' } },
          series: [{
            name: options.seriesName || 'Trend',
            data: data
          }]
        };
      default:
        return { error: `Unsupported visualization type: ${type}` };
    }
  }

  private getVisualizationInstructions(type: string): string {
    const instructions = {
      bar_chart: 'Render as a vertical bar chart with proper spacing and labels',
      pie_chart: 'Render as a pie chart with percentage labels and legend',
      line_chart: 'Render as a line chart with smooth curves and data points',
      table: 'Render as a sortable table with pagination'
    };
    
    return instructions[type as keyof typeof instructions] || 'Render as appropriate visualization';
  }

  private generateTaskId(): string {
    return `bigenie_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}