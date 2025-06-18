
import { MockDataService } from '../services/MockDataService';

const mockDataService = new MockDataService();

// Mock Azure OpenAI client for development
const mockAzureOpenAI = async (messages: any[], userPrompt: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const prompt = userPrompt.toLowerCase();
  
  // Simple intent detection for demo
  if (prompt.includes('sales') || prompt.includes('revenue')) {
    return "I can analyze sales trends from our mock dataset. Let me show you the data breakdown.";
  }
  
  if (prompt.includes('brand') || prompt.includes('alaska') || prompt.includes('oishi')) {
    return "Here's the brand performance analysis from our mock dataset showing various brand metrics across categories and regions.";
  }
  
  if (prompt.includes('region') || prompt.includes('ncr') || prompt.includes('manila')) {
    return "I can provide regional analysis from our mock data showing performance patterns across all 17 Philippine regions.";
  }
  
  if (prompt.includes('top') || prompt.includes('best') || prompt.includes('highest')) {
    return "Here are the top performing items from our mock dataset analysis.";
  }
  
  if (prompt.includes('compare') || prompt.includes('comparison')) {
    return "I'll compare the performance metrics from our mock dataset for you.";
  }
  
  return "I'm RetailBot, your retail analytics assistant. I can help you analyze mock sales data, brand performance, regional trends, and consumer insights. What would you like to explore?";
};

const generateChartFromData = async (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();
  
  try {
    if (lowerPrompt.includes('brand') || lowerPrompt.includes('alaska') || lowerPrompt.includes('oishi')) {
      const brandData = await mockDataService.getBrandData();
      return {
        type: 'bar',
        data: brandData.map(brand => ({
          name: brand.name,
          value: brand.sales || brand.revenue || 0
        })),
        title: 'Brand Performance (Mock Data)'
      };
    }
    
    if (lowerPrompt.includes('region') || lowerPrompt.includes('ncr') || lowerPrompt.includes('manila')) {
      const regionalData = await mockDataService.getRegionalData();
      return {
        type: 'bar',
        data: regionalData.map(region => ({
          name: region.name,
          value: region.sales || region.transactions || 0
        })),
        title: 'Regional Performance (Mock Data)'
      };
    }
    
    if (lowerPrompt.includes('top') || lowerPrompt.includes('best')) {
      const productData = await mockDataService.getProductData();
      return {
        type: 'bar',
        data: productData.topSkus?.slice(0, 5).map(sku => ({
          name: sku.name,
          value: sku.revenue || sku.sales || 0
        })) || [],
        title: 'Top Products (Mock Data)'
      };
    }
    
    // Default chart with transactions data
    const transactions = await mockDataService.getTransactions();
    const categoryStats = transactions.reduce((acc: any, transaction: any) => {
      transaction.basket.forEach((item: any) => {
        acc[item.category] = (acc[item.category] || 0) + item.price;
      });
      return acc;
    }, {});
    
    return {
      type: 'bar',
      data: Object.entries(categoryStats).slice(0, 6).map(([category, value]) => ({
        name: category,
        value: value as number
      })),
      title: 'Category Performance (Mock Data)'
    };
  } catch (error) {
    console.error('Error generating chart data:', error);
    return null;
  }
};

export const handleRetailBotQuery = async (prompt: string, chatHistory: any[] = []) => {
  try {
    // System prompt for mock mode
    const systemPrompt = {
      role: "system",
      content: "You are RetailBot, a retail analytics AI assistant. All data and analytics you reference are from mock test data for QA purposes, not real sales data. Always mention this is test/mock data when discussing analytics."
    };

    // Call mock Azure OpenAI
    const messages = [systemPrompt, ...chatHistory, { role: "user", content: prompt }];
    const aiReply = await mockAzureOpenAI(messages, prompt);

    // Generate chart data from actual mock service
    let chartData = null;
    const needsChart = prompt.toLowerCase().includes('chart') || 
                     prompt.toLowerCase().includes('trend') || 
                     prompt.toLowerCase().includes('show') ||
                     prompt.toLowerCase().includes('brand') ||
                     prompt.toLowerCase().includes('region') ||
                     prompt.toLowerCase().includes('top');
    
    if (needsChart) {
      chartData = await generateChartFromData(prompt);
    }

    return {
      reply: aiReply,
      chart: chartData,
      data_source: "mock",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('RetailBot error:', error);
    return {
      reply: "I apologize, but I'm having trouble processing your request. Please try again.",
      chart: null,
      data_source: "mock",
      error: true
    };
  }
};
