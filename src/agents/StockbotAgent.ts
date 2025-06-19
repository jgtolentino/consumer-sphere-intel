/**
 * Stockbot Agent Service  
 * Handles stock analysis, inventory insights, and supply chain optimization
 * Uses canonical schema types - mirrors BI Genie pattern
 */

import { AgentService, AgentTask, AgentResult, AgentCapability } from './AgentService';
import { 
  TransactionWithDetails, 
  ProductSubstitution, 
  CategoryMix,
  BrandPerformance 
} from '../schema';
import { MockDataServiceV2 } from '../services/MockDataService.v2';
import { RealDataServiceV2 } from '../services/RealDataService.v2';

export class StockbotAgent extends AgentService {
  readonly id = 'stockbot';
  readonly version = '2.0.0';
  readonly capabilities: AgentCapability = {
    taskTypes: ['stock-analysis', 'insight-generation', 'data-fetch'],
    inputSchema: {
      analysis_type: 'string',
      product_filter: 'object',
      time_period: 'object'
    },
    outputSchema: {
      stock_insights: 'array',
      inventory_recommendations: 'array',
      substitution_patterns: 'array'
    },
    dependencies: ['product-catalog', 'inventory-system']
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
        case 'stock-analysis':
          return await this.analyzeStock(task, taskId, startTime);
        case 'insight-generation':
          return await this.generateStockInsights(task, taskId, startTime);
        case 'data-fetch':
          return await this.fetchStockData(task, taskId, startTime);
        case 'health-check':
          return this.createSuccessResult({ status: 'healthy', inventory_connected: true }, taskId, Date.now() - startTime);
        default:
          return this.createErrorResult(`Unsupported task type: ${task.type}`, taskId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(errorMessage, taskId);
    }
  }

  private async analyzeStock(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { analysis_type, product_filter, time_period } = task.payload;

    // Fetch relevant data using canonical schema
    const transactions = await this.dataService.getTransactions(time_period);
    const substitutions = await this.dataService.getProductSubstitution();
    const categoryMix = await this.dataService.getCategoryMix();

    let analysis;
    switch (analysis_type) {
      case 'demand_forecast':
        analysis = this.analyzeDemandForecast(transactions, categoryMix);
        break;
      case 'substitution_patterns':
        analysis = this.analyzeSubstitutionPatterns(substitutions);
        break;
      case 'inventory_optimization':
        analysis = this.analyzeInventoryOptimization(transactions, categoryMix);
        break;
      case 'stockout_prediction':
        analysis = this.predictStockouts(transactions, categoryMix);
        break;
      default:
        return this.createErrorResult(`Unknown analysis type: ${analysis_type}`, taskId);
    }

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      analysis_type,
      results: analysis,
      metadata: {
        data_points: transactions.length,
        analysis_period: time_period,
        confidence_score: 0.82
      }
    }, taskId, executionTime);
  }

  private async generateStockInsights(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { focus_area } = task.payload;

    const transactions = await this.dataService.getTransactions();
    const substitutions = await this.dataService.getProductSubstitution();
    const categoryMix = await this.dataService.getCategoryMix();

    const insights = [];

    // Critical Stock Insights
    const criticalInsights = this.identifyCriticalStockIssues(transactions, categoryMix);
    insights.push(...criticalInsights);

    // Substitution Insights
    const substitutionInsights = this.analyzeSubstitutionTrends(substitutions);
    insights.push(...substitutionInsights);

    // Demand Pattern Insights
    const demandInsights = this.analyzeDemandPatterns(transactions, categoryMix);
    insights.push(...demandInsights);

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      insights,
      recommendations: this.generateStockRecommendations(insights),
      priority_actions: insights.filter(i => i.priority === 'critical')
    }, taskId, executionTime);
  }

  private async fetchStockData(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { data_type, filters } = task.payload;

    let data;
    switch (data_type) {
      case 'product_velocity':
        data = await this.calculateProductVelocity(filters);
        break;
      case 'substitution_matrix':
        data = await this.dataService.getProductSubstitution();
        break;
      case 'category_performance':
        data = await this.dataService.getCategoryMix();
        break;
      case 'demand_patterns':
        data = await this.calculateDemandPatterns(filters);
        break;
      default:
        return this.createErrorResult(`Unknown data type: ${data_type}`, taskId);
    }

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      data_type,
      data,
      schema_version: '2.0.0',
      timestamp: new Date().toISOString()
    }, taskId, executionTime);
  }

  private analyzeDemandForecast(transactions: TransactionWithDetails[], categoryMix: CategoryMix[]): any {
    // Calculate demand trends by category
    const demandByCategory = categoryMix.map(category => {
      const categoryTransactions = transactions.filter(t => 
        t.transaction_items.some(item => item.products.category === category.category)
      );

      const weeklyDemand = this.calculateWeeklyDemand(categoryTransactions);
      const forecast = this.simpleForecastModel(weeklyDemand);

      return {
        category: category.category,
        current_demand: category.transaction_count,
        forecast_7_days: forecast.next_week,
        forecast_30_days: forecast.next_month,
        trend: forecast.trend,
        confidence: forecast.confidence
      };
    });

    return {
      demand_forecast: demandByCategory,
      summary: {
        total_categories: demandByCategory.length,
        growing_demand: demandByCategory.filter(d => d.trend === 'increasing').length,
        declining_demand: demandByCategory.filter(d => d.trend === 'decreasing').length
      }
    };
  }

  private analyzeSubstitutionPatterns(substitutions: ProductSubstitution[]): any {
    const patterns = substitutions.map(sub => ({
      from_product: sub.from_product,
      to_product: sub.to_product,
      substitution_rate: sub.substitution_count,
      category: sub.category,
      brand_switch: sub.from_brand !== sub.to_brand,
      impact_score: this.calculateSubstitutionImpact(sub)
    }));

    const highImpactSubstitutions = patterns.filter(p => p.impact_score > 0.7);

    return {
      substitution_patterns: patterns,
      high_impact_substitutions: highImpactSubstitutions,
      brand_loyalty_risk: this.calculateBrandLoyaltyRisk(patterns)
    };
  }

  private analyzeInventoryOptimization(transactions: TransactionWithDetails[], categoryMix: CategoryMix[]): any {
    const optimization = categoryMix.map(category => {
      const categoryRevenue = category.total_revenue;
      const categoryCount = category.transaction_count;
      const velocity = categoryCount / 30; // Daily velocity

      return {
        category: category.category,
        current_velocity: velocity,
        revenue_contribution: category.percentage_of_total,
        optimization_score: this.calculateOptimizationScore(velocity, categoryRevenue),
        recommended_action: this.getOptimizationAction(velocity, categoryRevenue),
        stock_level_recommendation: this.calculateOptimalStockLevel(velocity)
      };
    });

    return {
      category_optimization: optimization,
      priority_categories: optimization
        .filter(o => o.optimization_score < 0.5)
        .sort((a, b) => a.optimization_score - b.optimization_score)
    };
  }

  private predictStockouts(transactions: TransactionWithDetails[], categoryMix: CategoryMix[]): any {
    const predictions = categoryMix.map(category => {
      const dailyDemand = category.transaction_count / 30;
      const currentStock = Math.floor(Math.random() * 1000) + 100; // Simulated stock level
      const daysUntilStockout = currentStock / dailyDemand;
      
      return {
        category: category.category,
        current_stock: currentStock,
        daily_demand: dailyDemand,
        days_until_stockout: Math.ceil(daysUntilStockout),
        risk_level: this.getStockoutRiskLevel(daysUntilStockout),
        reorder_point: Math.ceil(dailyDemand * 7), // 7-day safety stock
        suggested_order_quantity: Math.ceil(dailyDemand * 30) // 30-day supply
      };
    });

    const criticalStockouts = predictions.filter(p => p.days_until_stockout <= 7);

    return {
      stockout_predictions: predictions,
      critical_alerts: criticalStockouts,
      summary: {
        categories_at_risk: criticalStockouts.length,
        avg_days_until_stockout: predictions.reduce((avg, p) => avg + p.days_until_stockout, 0) / predictions.length
      }
    };
  }

  private identifyCriticalStockIssues(transactions: TransactionWithDetails[], categoryMix: CategoryMix[]): any[] {
    const issues = [];

    // Low velocity products
    const lowVelocityCategories = categoryMix.filter(c => c.transaction_count < 50);
    if (lowVelocityCategories.length > 0) {
      issues.push({
        type: 'low_velocity',
        title: 'Low Velocity Categories Detected',
        description: `${lowVelocityCategories.length} categories have low transaction velocity`,
        priority: 'high',
        affected_categories: lowVelocityCategories.map(c => c.category),
        recommendation: 'Consider promotional campaigns or inventory reduction'
      });
    }

    // High concentration risk
    const topCategory = categoryMix.reduce((max, cat) => 
      cat.percentage_of_total > max.percentage_of_total ? cat : max
    );
    if (topCategory.percentage_of_total > 40) {
      issues.push({
        type: 'concentration_risk',
        title: 'High Category Concentration',
        description: `${topCategory.category} represents ${topCategory.percentage_of_total.toFixed(1)}% of transactions`,
        priority: 'medium',
        recommendation: 'Diversify product portfolio to reduce dependency'
      });
    }

    return issues;
  }

  private analyzeSubstitutionTrends(substitutions: ProductSubstitution[]): any[] {
    const insights = [];

    // Brand switching analysis
    const brandSwitches = substitutions.filter(s => s.from_brand !== s.to_brand);
    if (brandSwitches.length > 0) {
      const totalSwitches = brandSwitches.reduce((sum, s) => sum + s.substitution_count, 0);
      insights.push({
        type: 'brand_switching',
        title: 'Brand Switching Patterns',
        description: `${totalSwitches} brand switches detected across ${brandSwitches.length} product pairs`,
        priority: 'medium',
        data: {
          total_switches: totalSwitches,
          affected_brands: [...new Set(brandSwitches.map(s => s.from_brand))]
        }
      });
    }

    return insights;
  }

  private analyzeDemandPatterns(transactions: TransactionWithDetails[], categoryMix: CategoryMix[]): any[] {
    // Simplified demand pattern analysis
    return [{
      type: 'demand_pattern',
      title: 'Peak Demand Categories',
      description: 'Categories with highest transaction volumes',
      priority: 'low',
      data: categoryMix
        .sort((a, b) => b.transaction_count - a.transaction_count)
        .slice(0, 5)
        .map(c => ({ category: c.category, count: c.transaction_count }))
    }];
  }

  private generateStockRecommendations(insights: any[]): any[] {
    return insights.map(insight => ({
      based_on: insight.type,
      action: insight.recommendation || 'Monitor closely',
      priority: insight.priority,
      estimated_impact: this.estimateImpact(insight)
    }));
  }

  private calculateWeeklyDemand(transactions: TransactionWithDetails[]): number[] {
    // Simplified weekly demand calculation
    return [100, 120, 95, 110, 105, 115, 98]; // Mock weekly data
  }

  private simpleForecastModel(weeklyDemand: number[]): any {
    const avg = weeklyDemand.reduce((sum, d) => sum + d, 0) / weeklyDemand.length;
    const trend = weeklyDemand[weeklyDemand.length - 1] > weeklyDemand[0] ? 'increasing' : 'decreasing';
    
    return {
      next_week: Math.round(avg * 1.05),
      next_month: Math.round(avg * 4.2),
      trend,
      confidence: 0.75
    };
  }

  private calculateSubstitutionImpact(substitution: ProductSubstitution): number {
    // Impact score based on substitution frequency and brand switching
    const baseScore = Math.min(substitution.substitution_count / 100, 1);
    const brandSwitchPenalty = substitution.from_brand !== substitution.to_brand ? 0.2 : 0;
    return Math.max(0, baseScore - brandSwitchPenalty);
  }

  private calculateBrandLoyaltyRisk(patterns: any[]): number {
    const brandSwitches = patterns.filter(p => p.brand_switch).length;
    const totalPatterns = patterns.length;
    return totalPatterns > 0 ? brandSwitches / totalPatterns : 0;
  }

  private calculateOptimizationScore(velocity: number, revenue: number): number {
    // Simplified optimization scoring
    return Math.min((velocity * revenue) / 10000, 1);
  }

  private getOptimizationAction(velocity: number, revenue: number): string {
    if (velocity < 5 && revenue < 1000) return 'reduce_inventory';
    if (velocity > 20 && revenue > 5000) return 'increase_inventory';
    return 'maintain_current_levels';
  }

  private calculateOptimalStockLevel(dailyVelocity: number): number {
    return Math.ceil(dailyVelocity * 14); // 2-week supply
  }

  private getStockoutRiskLevel(daysUntilStockout: number): string {
    if (daysUntilStockout <= 3) return 'critical';
    if (daysUntilStockout <= 7) return 'high';
    if (daysUntilStockout <= 14) return 'medium';
    return 'low';
  }

  private async calculateProductVelocity(filters: any): Promise<any[]> {
    const transactions = await this.dataService.getTransactions(filters);
    const categoryMix = await this.dataService.getCategoryMix();
    
    return categoryMix.map(category => ({
      category: category.category,
      daily_velocity: category.transaction_count / 30,
      weekly_velocity: category.transaction_count / 4.3,
      monthly_velocity: category.transaction_count
    }));
  }

  private async calculateDemandPatterns(filters: any): Promise<any> {
    const transactions = await this.dataService.getTransactions(filters);
    
    return {
      total_transactions: transactions.length,
      avg_daily_demand: transactions.length / 30,
      peak_hours: ['10:00-12:00', '14:00-16:00', '18:00-20:00'],
      seasonal_trends: 'steady' // Simplified
    };
  }

  private estimateImpact(insight: any): string {
    switch (insight.priority) {
      case 'critical': return 'high';
      case 'high': return 'medium';
      default: return 'low';
    }
  }

  private generateTaskId(): string {
    return `stockbot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}