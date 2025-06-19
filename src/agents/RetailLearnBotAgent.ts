/**
 * RetailLearnBot Agent Service
 * Handles educational content, training, and knowledge management
 * Uses canonical schema types - maintains contract consistency
 */

import { AgentService, AgentTask, AgentResult, AgentCapability } from './AgentService';
import { 
  TransactionWithDetails, 
  BrandPerformance, 
  CategoryMix 
} from '../schema';
import { MockDataServiceV2 } from '../services/MockDataService.v2';
import { RealDataServiceV2 } from '../services/RealDataService.v2';

export class RetailLearnBotAgent extends AgentService {
  readonly id = 'retail-learn-bot';
  readonly version = '2.0.0';
  readonly capabilities: AgentCapability = {
    taskTypes: ['learning-tutorial', 'chat-response', 'insight-generation'],
    inputSchema: {
      query: 'string',
      learning_context: 'string',
      user_level: 'string'
    },
    outputSchema: {
      tutorial_content: 'object',
      chat_response: 'string',
      learning_recommendations: 'array'
    },
    dependencies: ['knowledge-base', 'nlp-engine']
  };

  private dataService: MockDataServiceV2 | RealDataServiceV2;
  private knowledgeBase: Map<string, any> = new Map();

  constructor(useRealData: boolean = false) {
    super();
    this.dataService = useRealData ? new RealDataServiceV2() : new MockDataServiceV2();
    this.initializeKnowledgeBase();
  }

  async runTask(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    const taskId = this.generateTaskId();

    try {
      switch (task.type) {
        case 'learning-tutorial':
          return await this.generateTutorial(task, taskId, startTime);
        case 'chat-response':
          return await this.generateChatResponse(task, taskId, startTime);
        case 'insight-generation':
          return await this.generateLearningInsights(task, taskId, startTime);
        case 'health-check':
          return this.createSuccessResult({ 
            status: 'healthy', 
            knowledge_base_loaded: this.knowledgeBase.size > 0 
          }, taskId, Date.now() - startTime);
        default:
          return this.createErrorResult(`Unsupported task type: ${task.type}`, taskId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(errorMessage, taskId);
    }
  }

  private async generateTutorial(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { query, learning_context, user_level } = task.payload;

    // Analyze query to determine tutorial type
    const tutorialType = this.determineTutorialType(query);
    
    // Get relevant data for context
    const contextData = await this.getContextualData(tutorialType);
    
    // Generate tutorial content
    const tutorial = this.createTutorialContent(tutorialType, user_level, contextData);

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      tutorial_type: tutorialType,
      content: tutorial,
      difficulty_level: user_level,
      estimated_duration: tutorial.duration_minutes,
      prerequisites: tutorial.prerequisites,
      learning_objectives: tutorial.objectives
    }, taskId, executionTime);
  }

  private async generateChatResponse(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { query, learning_context } = task.payload;

    // Analyze user intent
    const intent = this.analyzeUserIntent(query);
    
    // Generate contextual response
    const response = await this.generateContextualResponse(query, intent, learning_context);

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      response,
      intent,
      confidence: 0.87,
      follow_up_suggestions: this.generateFollowUpSuggestions(intent),
      related_topics: this.getRelatedTopics(intent)
    }, taskId, executionTime);
  }

  private async generateLearningInsights(task: AgentTask, taskId: string, startTime: number): Promise<AgentResult> {
    const { focus_area } = task.payload;

    // Get current data for learning insights
    const transactions = await this.dataService.getTransactions();
    const brands = await this.dataService.getBrandData();
    const categories = await this.dataService.getCategoryMix();

    // Generate learning-focused insights
    const insights = this.createLearningInsights(focus_area, {
      transactions,
      brands,
      categories
    });

    const executionTime = Date.now() - startTime;
    return this.createSuccessResult({
      learning_insights: insights,
      recommended_tutorials: this.recommendTutorials(insights),
      knowledge_gaps: this.identifyKnowledgeGaps(insights),
      practice_exercises: this.generatePracticeExercises(insights)
    }, taskId, executionTime);
  }

  private initializeKnowledgeBase(): void {
    // Retail Analytics Knowledge Base
    this.knowledgeBase.set('market_share', {
      definition: 'The percentage of total market sales captured by a specific brand or product',
      calculation: 'Brand Sales / Total Market Sales × 100',
      importance: 'Key metric for competitive positioning and performance tracking',
      examples: ['TBWA client brands vs competitors', 'Category-specific market share analysis']
    });

    this.knowledgeBase.set('consumer_segmentation', {
      definition: 'Dividing customers into groups based on shared characteristics',
      types: ['Demographic', 'Behavioral', 'Geographic', 'Psychographic'],
      applications: ['Targeted marketing', 'Product development', 'Pricing strategies'],
      best_practices: ['Use multiple data sources', 'Validate segments regularly', 'Ensure actionability']
    });

    this.knowledgeBase.set('substitution_analysis', {
      definition: 'Analysis of how customers switch between products or brands',
      metrics: ['Substitution rate', 'Brand loyalty index', 'Category switching patterns'],
      insights: ['Competitive threats', 'Brand strength', 'Market opportunities'],
      applications: ['Inventory planning', 'Promotional strategies', 'Product positioning']
    });

    this.knowledgeBase.set('demand_forecasting', {
      definition: 'Predicting future customer demand for products or services',
      methods: ['Time series analysis', 'Regression models', 'Machine learning'],
      factors: ['Seasonality', 'Trends', 'External events', 'Promotional activities'],
      accuracy_tips: ['Use multiple models', 'Include external data', 'Regular model updates']
    });

    this.knowledgeBase.set('kpi_dashboard', {
      definition: 'Visual display of key performance indicators for decision making',
      essential_kpis: ['Revenue', 'Market share', 'Customer acquisition', 'Product velocity'],
      design_principles: ['Clarity', 'Relevance', 'Timeliness', 'Actionability'],
      best_practices: ['Mobile-friendly', 'Real-time updates', 'Drill-down capability']
    });
  }

  private determineTutorialType(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('market share')) return 'market_share';
    if (queryLower.includes('consumer') || queryLower.includes('segment')) return 'consumer_segmentation';
    if (queryLower.includes('substitution') || queryLower.includes('switching')) return 'substitution_analysis';
    if (queryLower.includes('forecast') || queryLower.includes('predict')) return 'demand_forecasting';
    if (queryLower.includes('dashboard') || queryLower.includes('kpi')) return 'kpi_dashboard';
    
    return 'general_analytics';
  }

  private async getContextualData(tutorialType: string): Promise<any> {
    switch (tutorialType) {
      case 'market_share':
        return {
          brands: await this.dataService.getBrandData(),
          total_market_size: 1000000 // Simulated
        };
      case 'consumer_segmentation':
        return {
          consumers: await this.dataService.getConsumerData()
        };
      case 'substitution_analysis':
        return {
          substitutions: await this.dataService.getProductSubstitution()
        };
      case 'demand_forecasting':
        return {
          transactions: await this.dataService.getTransactions(),
          categories: await this.dataService.getCategoryMix()
        };
      default:
        return {};
    }
  }

  private createTutorialContent(tutorialType: string, userLevel: string, contextData: any): any {
    const baseContent = this.knowledgeBase.get(tutorialType) || {};
    
    const difficulty = {
      beginner: 1,
      intermediate: 2,
      advanced: 3
    }[userLevel] || 1;

    return {
      title: this.getTutorialTitle(tutorialType),
      duration_minutes: 15 + (difficulty * 10),
      prerequisites: this.getPrerequisites(tutorialType, difficulty),
      objectives: this.getLearningObjectives(tutorialType, difficulty),
      content: {
        overview: baseContent.definition || 'Key retail analytics concept',
        key_concepts: this.getKeyConcepts(tutorialType, difficulty),
        practical_examples: this.getPracticalExamples(tutorialType, contextData),
        exercises: this.generateExercises(tutorialType, difficulty, contextData),
        further_reading: this.getAdditionalResources(tutorialType)
      },
      assessment: this.createAssessment(tutorialType, difficulty)
    };
  }

  private analyzeUserIntent(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('how to') || queryLower.includes('how do')) return 'how_to_question';
    if (queryLower.includes('what is') || queryLower.includes('define')) return 'definition_request';
    if (queryLower.includes('why') || queryLower.includes('reason')) return 'explanation_request';
    if (queryLower.includes('example') || queryLower.includes('show me')) return 'example_request';
    if (queryLower.includes('compare') || queryLower.includes('difference')) return 'comparison_request';
    if (queryLower.includes('best practice') || queryLower.includes('recommend')) return 'best_practice_request';
    
    return 'general_inquiry';
  }

  private async generateContextualResponse(query: string, intent: string, context: string): Promise<string> {
    // Get relevant data for context
    const brands = await this.dataService.getBrandData();
    const categories = await this.dataService.getCategoryMix();

    const contextualData = {
      topBrand: brands.reduce((max, brand) => brand.total_revenue > max.total_revenue ? brand : max),
      topCategory: categories.reduce((max, cat) => cat.total_revenue > max.total_revenue ? cat : max),
      totalBrands: brands.length,
      totalCategories: categories.length
    };

    // Generate response based on intent and context
    switch (intent) {
      case 'definition_request':
        return this.generateDefinitionResponse(query, contextualData);
      case 'how_to_question':
        return this.generateHowToResponse(query, contextualData);
      case 'example_request':
        return this.generateExampleResponse(query, contextualData);
      case 'best_practice_request':
        return this.generateBestPracticeResponse(query, contextualData);
      default:
        return this.generateGeneralResponse(query, contextualData);
    }
  }

  private generateDefinitionResponse(query: string, data: any): string {
    if (query.toLowerCase().includes('market share')) {
      return `Market share represents the percentage of total market sales captured by a specific brand. For example, ${data.topBrand.brand_name} currently holds ${data.topBrand.market_share.toFixed(1)}% market share in our data, making it a leading performer.`;
    }
    
    if (query.toLowerCase().includes('category mix')) {
      return `Category mix refers to the distribution of sales across different product categories. In our current data, ${data.topCategory.category} leads with ${data.topCategory.percentage_of_total.toFixed(1)}% of total transactions across ${data.totalCategories} categories.`;
    }

    return 'I can help you understand retail analytics concepts. Could you specify which term you would like me to define?';
  }

  private generateHowToResponse(query: string, data: any): string {
    if (query.toLowerCase().includes('calculate market share')) {
      return `To calculate market share: 1) Get total sales for your brand (${data.topBrand.total_revenue.toLocaleString()}), 2) Get total market sales, 3) Divide brand sales by market sales and multiply by 100. Our top brand ${data.topBrand.brand_name} demonstrates this with ${data.topBrand.market_share.toFixed(1)}% share.`;
    }

    if (query.toLowerCase().includes('analyze category performance')) {
      return `To analyze category performance: 1) Compare transaction counts across categories, 2) Calculate revenue contribution percentages, 3) Identify growth trends. For example, ${data.topCategory.category} shows strong performance with ${data.topCategory.transaction_count} transactions.`;
    }

    return 'I can guide you through various retail analytics processes. Could you be more specific about what you\'d like to learn?';
  }

  private generateExampleResponse(query: string, data: any): string {
    return `Here's a practical example from our current data: ${data.topBrand.brand_name} (${data.topBrand.category}) leads with ${data.topBrand.total_revenue.toLocaleString()} in revenue across ${data.topBrand.transaction_count} transactions. This represents ${data.topBrand.market_share.toFixed(1)}% market share, demonstrating strong brand performance in the ${data.topBrand.category} category.`;
  }

  private generateBestPracticeResponse(query: string, data: any): string {
    return `Best practices for retail analytics: 1) Focus on actionable metrics like those shown in our top performer ${data.topBrand.brand_name}, 2) Monitor category trends regularly (we track ${data.totalCategories} categories), 3) Combine transaction data with market share analysis, 4) Use real-time dashboards for decision making. Always validate insights with multiple data points.`;
  }

  private generateGeneralResponse(query: string, data: any): string {
    return `Based on our current retail data spanning ${data.totalBrands} brands across ${data.totalCategories} categories, I can help you understand market dynamics. ${data.topBrand.brand_name} currently leads with ${data.topBrand.market_share.toFixed(1)}% market share. What specific aspect of retail analytics would you like to explore?`;
  }

  private createLearningInsights(focusArea: string, data: any): any[] {
    const insights = [];

    // Performance insights for learning
    insights.push({
      type: 'performance_learning',
      title: 'Market Leader Analysis',
      description: `Study how ${data.brands[0]?.brand_name} achieved market leadership`,
      learning_points: [
        'Consistent market presence',
        'Strong category positioning',
        'Effective brand strategy'
      ],
      data_evidence: data.brands[0]
    });

    // Category insights for education
    insights.push({
      type: 'category_learning',
      title: 'Category Performance Patterns',
      description: 'Understanding what drives category success',
      learning_points: [
        'Transaction volume indicators',
        'Revenue concentration patterns',
        'Market share distribution'
      ],
      data_evidence: data.categories.slice(0, 3)
    });

    return insights;
  }

  private recommendTutorials(insights: any[]): string[] {
    return [
      'Market Share Fundamentals',
      'Category Analysis Techniques',
      'Brand Performance Metrics',
      'Consumer Behavior Patterns',
      'Competitive Intelligence'
    ];
  }

  private identifyKnowledgeGaps(insights: any[]): string[] {
    return [
      'Advanced forecasting methods',
      'Statistical significance testing',
      'Competitive benchmarking',
      'Customer lifetime value analysis'
    ];
  }

  private generatePracticeExercises(insights: any[]): any[] {
    return [
      {
        title: 'Calculate Market Share',
        description: 'Using provided data, calculate and compare market shares',
        difficulty: 'beginner',
        estimated_time: '10 minutes'
      },
      {
        title: 'Identify Market Trends',
        description: 'Analyze transaction patterns to identify emerging trends',
        difficulty: 'intermediate',
        estimated_time: '20 minutes'
      }
    ];
  }

  private generateFollowUpSuggestions(intent: string): string[] {
    const suggestions = {
      how_to_question: [
        'Would you like to see a practical example?',
        'Should I explain the key metrics involved?',
        'Would you like to try a hands-on exercise?'
      ],
      definition_request: [
        'Would you like to see how this applies to our data?',
        'Should I show you related concepts?',
        'Would you like a tutorial on this topic?'
      ],
      general_inquiry: [
        'What specific area interests you most?',
        'Would you like to explore with real data?',
        'Should I recommend a learning path?'
      ]
    };

    return suggestions[intent as keyof typeof suggestions] || suggestions.general_inquiry;
  }

  private getRelatedTopics(intent: string): string[] {
    return [
      'Market Share Analysis',
      'Category Performance',
      'Brand Positioning',
      'Consumer Segmentation',
      'Competitive Intelligence'
    ];
  }

  private getTutorialTitle(tutorialType: string): string {
    const titles = {
      market_share: 'Understanding Market Share Analysis',
      consumer_segmentation: 'Consumer Segmentation Fundamentals',
      substitution_analysis: 'Product Substitution Patterns',
      demand_forecasting: 'Demand Forecasting Techniques',
      kpi_dashboard: 'Building Effective KPI Dashboards'
    };
    return titles[tutorialType as keyof typeof titles] || 'Retail Analytics Fundamentals';
  }

  private getPrerequisites(tutorialType: string, difficulty: number): string[] {
    const base = ['Basic understanding of retail operations'];
    if (difficulty > 1) base.push('Familiarity with data analysis concepts');
    if (difficulty > 2) base.push('Experience with analytics tools');
    return base;
  }

  private getLearningObjectives(tutorialType: string, difficulty: number): string[] {
    return [
      `Understand key concepts of ${tutorialType.replace('_', ' ')}`,
      'Apply concepts to real retail data',
      'Identify actionable insights',
      'Make data-driven decisions'
    ];
  }

  private getKeyConcepts(tutorialType: string, difficulty: number): string[] {
    const concepts = this.knowledgeBase.get(tutorialType);
    return concepts ? Object.values(concepts).slice(0, difficulty + 2) : ['Core principles', 'Application methods'];
  }

  private getPracticalExamples(tutorialType: string, contextData: any): any[] {
    return [
      {
        scenario: 'Real-world application',
        data: contextData,
        explanation: 'How this concept applies to current market data'
      }
    ];
  }

  private generateExercises(tutorialType: string, difficulty: number, contextData: any): any[] {
    return [
      {
        title: 'Hands-on Analysis',
        description: `Practice ${tutorialType.replace('_', ' ')} with real data`,
        difficulty_level: difficulty,
        data_provided: contextData
      }
    ];
  }

  private getAdditionalResources(tutorialType: string): string[] {
    return [
      'Industry best practices guide',
      'Advanced analytics techniques',
      'Case study examples',
      'Expert interviews'
    ];
  }

  private createAssessment(tutorialType: string, difficulty: number): any {
    return {
      questions: difficulty + 3,
      passing_score: 80,
      time_limit_minutes: difficulty * 5,
      format: 'multiple_choice_and_practical'
    };
  }

  private generateTaskId(): string {
    return `learnbot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}