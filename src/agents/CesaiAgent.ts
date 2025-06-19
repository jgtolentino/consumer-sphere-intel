/**
 * CESAI Agent Service
 * Handles campaign optimization, creative analysis, and strategic insights
 * Uses canonical schema types - maintains contract consistency
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

export class CesaiAgent extends AgentService {
  readonly id = 'cesai';
  readonly version = '2.0.0';
  readonly capabilities: AgentCapability = {
    taskTypes: ['campaign-optimization', 'insight-generation', 'data-fetch'],
    inputSchema: {
      campaign_brief: 'object',
      target_metrics: 'array',
      optimization_goals: 'array'
    },
    outputSchema: {
      campaign_recommendations: 'array',
      creative_insights: 'array',
      performance_predictions: 'object'
    },
    dependencies: ['creative-database', 'campaign-analytics', 'market-intelligence']
  };

  private dataService: MockDataServiceV2 | RealDataServiceV2;
  private campaignKnowledge: Map<string, any> = new Map();

  constructor(useRealData: boolean = false) {
    super();
    this.dataService = useRealData ? new RealDataServiceV2() : new MockDataServiceV2();
    this.initializeCampaignKnowledge();
  }

  async runTask(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    const taskId = this.generateTaskId();

    try {
      switch (task.type) {
        case 'campaign-optimization':
          return await this.optimizeCampaign(task, taskId, startTime);
        case 'insight-generation':
          return await this.generateCampaignInsights(task, taskId, startTime);
        case 'data-fetch':
          return await this.fetchCampaignData(task, taskId, startTime);
        case 'health-check':
          return this.createSuccessResult({ 
            status: 'healthy', 
            creative_engine_ready: true,
            campaign_models_loaded: this.campaignKnowledge.size > 0
          }, taskId, Date.now() - startTime);
        default:
          return this.createErrorResult(`Unsupported task type: ${task.type}`, taskId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(errorMessage, taskId);
    }
  }

  private async optimizeCampaign(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { campaign_brief, target_metrics, optimization_goals } = task.payload;

    // Analyze current market conditions
    const marketAnalysis = await this.analyzeMarketConditions();
    
    // Generate optimization strategies
    const optimizations = this.generateOptimizationStrategies(
      campaign_brief, 
      target_metrics, 
      optimization_goals, 
      marketAnalysis
    );

    // Predict campaign performance
    const performancePredictions = this.predictCampaignPerformance(optimizations, marketAnalysis);

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      campaign_brief,
      optimizations,
      performance_predictions: performancePredictions,
      market_context: marketAnalysis,
      implementation_roadmap: this.createImplementationRoadmap(optimizations),
      confidence_score: 0.89
    }, taskId, executionTime);
  }

  private async generateCampaignInsights(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { focus_area, brand_context } = task.payload;

    // Get comprehensive market data
    const transactions = await this.dataService.getTransactions();
    const brands = await this.dataService.getBrandData();
    const regions = await this.dataService.getRegionalData();
    const consumers = await this.dataService.getConsumerData();
    const categories = await this.dataService.getCategoryMix();

    // Generate campaign-focused insights
    const insights = this.createCampaignInsights(focus_area, {
      transactions,
      brands,
      regions,
      consumers,
      categories
    }, brand_context);

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      insights,
      strategic_recommendations: this.generateStrategicRecommendations(insights),
      creative_opportunities: this.identifyCreativeOpportunities(insights),
      campaign_frameworks: this.suggestCampaignFrameworks(insights),
      success_metrics: this.defineSuccessMetrics(insights)
    }, taskId, executionTime);
  }

  private async fetchCampaignData(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { data_type, analysis_scope } = task.payload;

    let data;
    switch (data_type) {
      case 'market_intelligence':
        data = await this.gatherMarketIntelligence(analysis_scope);
        break;
      case 'competitive_landscape':
        data = await this.analyzeCompetitiveLandscape(analysis_scope);
        break;
      case 'consumer_journey':
        data = await this.mapConsumerJourney(analysis_scope);
        break;
      case 'campaign_performance':
        data = await this.analyzeCampaignPerformance(analysis_scope);
        break;
      default:
        return this.createErrorResult(`Unknown data type: ${data_type}`, taskId);
    }

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      data_type,
      data,
      analysis_scope,
      insights_summary: this.summarizeDataInsights(data),
      schema_version: '2.0.0'
    }, taskId, executionTime);
  }

  private initializeCampaignKnowledge(): void {
    // Campaign strategy frameworks
    this.campaignKnowledge.set('awareness_campaigns', {
      objectives: ['Brand awareness', 'Reach maximization', 'Message recall'],
      kpis: ['Reach', 'Frequency', 'Brand recall', 'Aided awareness'],
      channels: ['TV', 'Digital video', 'Social media', 'OOH'],
      creative_strategies: ['Emotional storytelling', 'Brand demonstration', 'Celebrity endorsement']
    });

    this.campaignKnowledge.set('conversion_campaigns', {
      objectives: ['Drive sales', 'Lead generation', 'Store visits'],
      kpis: ['Conversion rate', 'CPA', 'ROAS', 'Store visits'],
      channels: ['Search', 'Social ads', 'Retargeting', 'Email'],
      creative_strategies: ['Product demonstration', 'Promotional offers', 'Urgency messaging']
    });

    this.campaignKnowledge.set('brand_building', {
      objectives: ['Brand equity', 'Differentiation', 'Premium positioning'],
      kpis: ['Brand favorability', 'Purchase intent', 'Price premium'],
      channels: ['Premium content', 'Influencer partnerships', 'Experiential'],
      creative_strategies: ['Brand values', 'Quality demonstration', 'Heritage storytelling']
    });

    this.campaignKnowledge.set('product_launch', {
      objectives: ['Product awareness', 'Trial generation', 'Market education'],
      kpis: ['Product awareness', 'Trial rate', 'Feature understanding'],
      channels: ['Multi-channel integration', 'PR', 'Sampling', 'Digital activation'],
      creative_strategies: ['Product benefits', 'Problem-solution', 'Innovation showcase']
    });
  }

  private async analyzeMarketConditions(): Promise<any> {
    const brands = await this.dataService.getBrandData();
    const regions = await this.dataService.getRegionalData();
    const consumers = await this.dataService.getConsumerData();
    const categories = await this.dataService.getCategoryMix();

    return {
      market_size: this.calculateMarketSize(brands, categories),
      competitive_intensity: this.assessCompetitiveIntensity(brands),
      growth_opportunities: this.identifyGrowthOpportunities(regions, categories),
      consumer_trends: this.analyzeConsumerTrends(consumers),
      market_maturity: this.assessMarketMaturity(categories),
      seasonal_patterns: this.identifySeasonalPatterns(),
      digital_adoption: this.assessDigitalAdoption(consumers)
    };
  }

  private generateOptimizationStrategies(
    brief: any, 
    metrics: string[], 
    goals: string[], 
    market: any
  ): any[] {
    const strategies = [];

    // Channel optimization
    strategies.push({
      type: 'channel_optimization',
      title: 'Channel Mix Optimization',
      description: 'Optimize channel allocation based on market conditions',
      recommendations: this.optimizeChannelMix(brief, market),
      expected_impact: 'high',
      implementation_effort: 'medium'
    });

    // Targeting optimization
    strategies.push({
      type: 'targeting_optimization',
      title: 'Audience Targeting Refinement',
      description: 'Enhance targeting based on consumer insights',
      recommendations: this.optimizeTargeting(brief, market.consumer_trends),
      expected_impact: 'high',
      implementation_effort: 'low'
    });

    // Creative optimization
    strategies.push({
      type: 'creative_optimization',
      title: 'Creative Strategy Enhancement',
      description: 'Optimize creative approach for maximum impact',
      recommendations: this.optimizeCreativeStrategy(brief, market),
      expected_impact: 'medium',
      implementation_effort: 'high'
    });

    // Budget optimization
    strategies.push({
      type: 'budget_optimization',
      title: 'Budget Allocation Optimization',
      description: 'Optimize budget distribution across touchpoints',
      recommendations: this.optimizeBudgetAllocation(brief, metrics, market),
      expected_impact: 'high',
      implementation_effort: 'low'
    });

    return strategies;
  }

  private predictCampaignPerformance(optimizations: any[], market: any): any {
    const basePerformance = {
      reach: 2500000,
      frequency: 3.2,
      brand_awareness_lift: 0.12,
      conversion_rate: 0.024,
      roas: 3.2
    };

    // Apply optimization effects
    let optimizedPerformance = { ...basePerformance };
    
    optimizations.forEach(opt => {
      switch (opt.type) {
        case 'channel_optimization':
          optimizedPerformance.reach *= 1.15;
          optimizedPerformance.frequency *= 1.08;
          break;
        case 'targeting_optimization':
          optimizedPerformance.conversion_rate *= 1.25;
          optimizedPerformance.roas *= 1.18;
          break;
        case 'creative_optimization':
          optimizedPerformance.brand_awareness_lift *= 1.22;
          optimizedPerformance.conversion_rate *= 1.12;
          break;
        case 'budget_optimization':
          optimizedPerformance.roas *= 1.15;
          break;
      }
    });

    return {
      baseline: basePerformance,
      optimized: optimizedPerformance,
      improvement: {
        reach: ((optimizedPerformance.reach - basePerformance.reach) / basePerformance.reach * 100).toFixed(1) + '%',
        conversion_rate: ((optimizedPerformance.conversion_rate - basePerformance.conversion_rate) / basePerformance.conversion_rate * 100).toFixed(1) + '%',
        roas: ((optimizedPerformance.roas - basePerformance.roas) / basePerformance.roas * 100).toFixed(1) + '%'
      },
      confidence_intervals: {
        reach: [optimizedPerformance.reach * 0.9, optimizedPerformance.reach * 1.1],
        roas: [optimizedPerformance.roas * 0.85, optimizedPerformance.roas * 1.15]
      }
    };
  }

  private createCampaignInsights(focusArea: string, data: any, brandContext: any): any[] {
    const insights = [];

    // Market opportunity insights
    insights.push({
      type: 'market_opportunity',
      title: 'Market Opportunity Analysis',
      description: 'Key opportunities in current market landscape',
      findings: this.analyzeMarketOpportunities(data),
      recommendations: ['Focus on underserved segments', 'Leverage digital channels', 'Capitalize on seasonal trends'],
      priority: 'high'
    });

    // Competitive positioning insights
    const tbwaBrands = data.brands.filter((b: BrandPerformance) => b.is_tbwa);
    const competitorBrands = data.brands.filter((b: BrandPerformance) => !b.is_tbwa);
    
    insights.push({
      type: 'competitive_positioning',
      title: 'Competitive Landscape Analysis',
      description: 'TBWA client positioning vs competitors',
      findings: {
        tbwa_market_share: tbwaBrands.reduce((sum: number, b: BrandPerformance) => sum + b.market_share, 0),
        competitor_threats: competitorBrands.slice(0, 3).map((b: BrandPerformance) => ({
          brand: b.brand_name,
          market_share: b.market_share,
          category: b.category
        })),
        differentiation_opportunities: this.identifyDifferentiationOpportunities(tbwaBrands, competitorBrands)
      },
      priority: 'high'
    });

    // Consumer behavior insights
    insights.push({
      type: 'consumer_behavior',
      title: 'Consumer Behavior Patterns',
      description: 'Key behavioral insights for campaign development',
      findings: this.analyzeConsumerBehaviorPatterns(data.consumers),
      recommendations: this.generateConsumerTargetingRecommendations(data.consumers),
      priority: 'medium'
    });

    // Regional performance insights
    const topRegions = data.regions.sort((a: RegionalData, b: RegionalData) => b.total_revenue - a.total_revenue).slice(0, 3);
    insights.push({
      type: 'regional_performance',
      title: 'Regional Market Dynamics',
      description: 'Geographic opportunities and challenges',
      findings: {
        top_performing_regions: topRegions,
        growth_opportunities: this.identifyRegionalGrowthOpportunities(data.regions),
        localization_needs: this.assessLocalizationNeeds(data.regions)
      },
      priority: 'medium'
    });

    return insights;
  }

  private generateStrategicRecommendations(insights: any[]): any[] {
    return insights.map(insight => ({
      based_on: insight.type,
      strategic_action: this.deriveStrategicAction(insight),
      timeline: this.estimateImplementationTimeline(insight),
      expected_outcome: this.predictOutcome(insight),
      success_metrics: this.defineMetrics(insight)
    }));
  }

  private identifyCreativeOpportunities(insights: any[]): any[] {
    return [
      {
        opportunity: 'Digital-first storytelling',
        description: 'Leverage digital behavior patterns for immersive brand experiences',
        creative_formats: ['Interactive video', 'AR experiences', 'Social-first content'],
        target_segments: ['Digital natives', 'Mobile-first consumers']
      },
      {
        opportunity: 'Local cultural connection',
        description: 'Regional customization opportunities based on local preferences',
        creative_formats: ['Localized messaging', 'Regional influencers', 'Cultural moments'],
        target_segments: ['Regional audiences', 'Cultural communities']
      },
      {
        opportunity: 'Cross-category integration',
        description: 'Leverage category performance data for cross-selling opportunities',
        creative_formats: ['Bundle campaigns', 'Lifestyle positioning', 'Ecosystem messaging'],
        target_segments: ['Multi-category users', 'Brand loyalists']
      }
    ];
  }

  private suggestCampaignFrameworks(insights: any[]): any[] {
    return [
      {
        framework: 'Always-On + Moment Marketing',
        description: 'Continuous brand presence with opportunistic activations',
        application: 'Suitable for established brands with strong market position',
        budget_split: { always_on: 60, moment_marketing: 40 }
      },
      {
        framework: 'Integrated Launch Campaign',
        description: 'Coordinated multi-channel approach for maximum impact',
        application: 'Ideal for new product launches or brand repositioning',
        budget_split: { awareness: 50, consideration: 30, conversion: 20 }
      },
      {
        framework: 'Performance-Driven Brand Building',
        description: 'Balance brand metrics with performance indicators',
        application: 'Perfect for growth-focused brands with clear ROI requirements',
        budget_split: { brand_building: 70, performance: 30 }
      }
    ];
  }

  private defineSuccessMetrics(insights: any[]): any {
    return {
      brand_metrics: [
        'Brand awareness lift',
        'Brand favorability increase',
        'Purchase intent improvement',
        'Message recall'
      ],
      performance_metrics: [
        'Return on ad spend (ROAS)',
        'Cost per acquisition (CPA)',
        'Conversion rate',
        'Customer lifetime value'
      ],
      engagement_metrics: [
        'Social engagement rate',
        'Video completion rate',
        'Website time on site',
        'Content interaction rate'
      ],
      business_metrics: [
        'Market share growth',
        'Sales volume increase',
        'Revenue attribution',
        'New customer acquisition'
      ]
    };
  }

  // Helper methods for campaign optimization
  private calculateMarketSize(brands: BrandPerformance[], categories: CategoryMix[]): number {
    return brands.reduce((sum, brand) => sum + brand.total_revenue, 0);
  }

  private assessCompetitiveIntensity(brands: BrandPerformance[]): string {
    const herfindahlIndex = brands.reduce((sum, brand) => sum + Math.pow(brand.market_share / 100, 2), 0);
    if (herfindahlIndex < 0.15) return 'highly_competitive';
    if (herfindahlIndex < 0.25) return 'moderately_competitive';
    return 'concentrated';
  }

  private identifyGrowthOpportunities(regions: RegionalData[], categories: CategoryMix[]): string[] {
    const opportunities = [];
    
    // Find underperforming regions
    const avgRevenue = regions.reduce((sum, r) => sum + r.total_revenue, 0) / regions.length;
    const underperformingRegions = regions.filter(r => r.total_revenue < avgRevenue * 0.7);
    
    if (underperformingRegions.length > 0) {
      opportunities.push(`Geographic expansion in ${underperformingRegions.length} underperforming regions`);
    }

    // Find growing categories
    const topCategories = categories.sort((a, b) => b.percentage_of_total - a.percentage_of_total).slice(0, 3);
    opportunities.push(`Category expansion in ${topCategories.map(c => c.category).join(', ')}`);

    return opportunities;
  }

  private analyzeConsumerTrends(consumers: ConsumerInsight[]): any {
    const digitalPaymentUsers = consumers.filter(c => c.payment_method === 'Digital');
    const totalUsers = consumers.reduce((sum, c) => sum + c.transaction_count, 0);
    const digitalAdoption = digitalPaymentUsers.reduce((sum, c) => sum + c.transaction_count, 0) / totalUsers;

    return {
      digital_adoption_rate: digitalAdoption,
      primary_demographics: this.identifyPrimaryDemographics(consumers),
      spending_patterns: this.analyzeSpendingPatterns(consumers),
      behavioral_segments: this.identifyBehavioralSegments(consumers)
    };
  }

  private assessMarketMaturity(categories: CategoryMix[]): string {
    const categoryConcentration = Math.max(...categories.map(c => c.percentage_of_total));
    if (categoryConcentration > 40) return 'mature';
    if (categoryConcentration > 25) return 'developing';
    return 'emerging';
  }

  private identifySeasonalPatterns(): any {
    return {
      peak_seasons: ['Q4 Holiday Season', 'Summer months'],
      low_seasons: ['January-February', 'Post-holiday period'],
      promotional_opportunities: ['Back-to-school', 'Year-end sales']
    };
  }

  private assessDigitalAdoption(consumers: ConsumerInsight[]): number {
    const digitalUsers = consumers.filter(c => c.payment_method === 'Digital');
    const totalTransactions = consumers.reduce((sum, c) => sum + c.transaction_count, 0);
    const digitalTransactions = digitalUsers.reduce((sum, c) => sum + c.transaction_count, 0);
    
    return digitalTransactions / totalTransactions;
  }

  private createImplementationRoadmap(optimizations: any[]): any {
    return {
      phase_1: {
        duration: '0-2 weeks',
        actions: ['Quick wins implementation', 'Targeting optimization'],
        optimizations: optimizations.filter(o => o.implementation_effort === 'low')
      },
      phase_2: {
        duration: '2-6 weeks',
        actions: ['Channel mix adjustment', 'Budget reallocation'],
        optimizations: optimizations.filter(o => o.implementation_effort === 'medium')
      },
      phase_3: {
        duration: '6-12 weeks',
        actions: ['Creative development', 'Major strategy shifts'],
        optimizations: optimizations.filter(o => o.implementation_effort === 'high')
      }
    };
  }

  // Additional helper methods would continue here...
  private optimizeChannelMix(brief: any, market: any): any[] {
    return [
      'Increase digital video allocation by 20%',
      'Reduce traditional media spend by 15%',
      'Add social commerce channels',
      'Implement programmatic buying'
    ];
  }

  private optimizeTargeting(brief: any, consumerTrends: any): any[] {
    return [
      'Focus on digital-native segments',
      'Target high-value demographics',
      'Implement lookalike modeling',
      'Add behavioral targeting layers'
    ];
  }

  private optimizeCreativeStrategy(brief: any, market: any): any[] {
    return [
      'Develop mobile-first creative',
      'Create personalized content variants',
      'Implement dynamic creative optimization',
      'Add interactive elements'
    ];
  }

  private optimizeBudgetAllocation(brief: any, metrics: string[], market: any): any[] {
    return [
      'Shift 25% budget to high-performing channels',
      'Implement performance-based allocation',
      'Reserve 10% for testing new opportunities',
      'Optimize frequency caps'
    ];
  }

  private analyzeMarketOpportunities(data: any): any {
    return {
      underserved_segments: 'Premium young professionals',
      channel_gaps: 'Limited social commerce presence',
      competitor_vulnerabilities: 'Weak digital engagement',
      seasonal_opportunities: 'Holiday season expansion'
    };
  }

  private identifyDifferentiationOpportunities(tbwa: BrandPerformance[], competitors: BrandPerformance[]): string[] {
    return [
      'Premium positioning opportunity',
      'Digital innovation leadership',
      'Sustainability messaging',
      'Local market expertise'
    ];
  }

  private analyzeConsumerBehaviorPatterns(consumers: ConsumerInsight[]): any {
    return {
      primary_age_groups: consumers.map(c => c.age_bracket),
      payment_preferences: consumers.map(c => c.payment_method),
      spending_levels: consumers.map(c => c.avg_transaction_value)
    };
  }

  private generateConsumerTargetingRecommendations(consumers: ConsumerInsight[]): string[] {
    return [
      'Target high-value segments first',
      'Customize messaging by age group',
      'Leverage payment method preferences',
      'Focus on repeat purchase drivers'
    ];
  }

  private identifyRegionalGrowthOpportunities(regions: RegionalData[]): string[] {
    return regions
      .filter(r => r.total_revenue < 100000)
      .map(r => r.region)
      .slice(0, 3);
  }

  private assessLocalizationNeeds(regions: RegionalData[]): any {
    return {
      high_priority: regions.slice(0, 3).map(r => r.region),
      medium_priority: regions.slice(3, 6).map(r => r.region),
      localization_factors: ['Language preferences', 'Cultural celebrations', 'Local partnerships']
    };
  }

  private identifyPrimaryDemographics(consumers: ConsumerInsight[]): any {
    return {
      dominant_age_group: '25-34',
      gender_split: { male: 0.45, female: 0.55 },
      income_distribution: { low: 0.3, middle: 0.5, high: 0.2 }
    };
  }

  private analyzeSpendingPatterns(consumers: ConsumerInsight[]): any {
    const avgSpend = consumers.reduce((sum, c) => sum + c.avg_transaction_value, 0) / consumers.length;
    return {
      average_transaction_value: avgSpend,
      frequency_patterns: 'Monthly regular purchases',
      seasonal_variations: '20% increase during holidays'
    };
  }

  private identifyBehavioralSegments(consumers: ConsumerInsight[]): string[] {
    return [
      'Price-conscious shoppers',
      'Brand loyalists',
      'Convenience seekers',
      'Quality-focused buyers'
    ];
  }

  private deriveStrategicAction(insight: any): string {
    return `Implement ${insight.type.replace('_', ' ')} strategy based on market analysis`;
  }

  private estimateImplementationTimeline(insight: any): string {
    return insight.priority === 'high' ? '2-4 weeks' : '4-8 weeks';
  }

  private predictOutcome(insight: any): string {
    return `Expected ${insight.priority} impact on campaign performance`;
  }

  private defineMetrics(insight: any): string[] {
    return ['KPI improvement', 'Market share growth', 'Brand awareness lift'];
  }

  private async gatherMarketIntelligence(scope: any): Promise<any> {
    return {
      market_size: 50000000,
      growth_rate: 0.12,
      key_trends: ['Digital transformation', 'Sustainability focus', 'Personalization demand']
    };
  }

  private async analyzeCompetitiveLandscape(scope: any): Promise<any> {
    const brands = await this.dataService.getBrandData();
    return {
      competitive_brands: brands.filter(b => !b.is_tbwa).slice(0, 5),
      market_dynamics: 'Highly competitive with digital disruption',
      competitive_advantages: ['Brand heritage', 'Local market knowledge', 'Digital capabilities']
    };
  }

  private async mapConsumerJourney(scope: any): Promise<any> {
    return {
      awareness_stage: 'Social media discovery',
      consideration_stage: 'Online research and reviews',
      purchase_stage: 'In-store or online conversion',
      loyalty_stage: 'Repeat purchase and advocacy',
      key_touchpoints: ['Social media', 'Website', 'Physical stores', 'Customer service']
    };
  }

  private async analyzeCampaignPerformance(scope: any): Promise<any> {
    return {
      historical_performance: {
        avg_roas: 3.2,
        avg_cpa: 45,
        brand_lift: 0.15
      },
      benchmark_comparison: 'Above industry average',
      optimization_opportunities: ['Creative refresh', 'Targeting refinement', 'Channel rebalancing']
    };
  }

  private summarizeDataInsights(data: any): string {
    return 'Key insights derived from campaign analysis and market intelligence data';
  }

  private generateTaskId(): string {
    return `cesai_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}