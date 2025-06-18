
import { useDataService } from '../providers/DataProvider';

// Mock Azure OpenAI client for development
const mockAzureOpenAI = async (messages: any[]) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  // Simple intent detection for demo
  if (userMessage.includes('sales') || userMessage.includes('revenue')) {
    return "Based on the mock data, I can see sales trends across different regions and brands. Would you like me to show you a specific breakdown?";
  }
  
  if (userMessage.includes('brand') || userMessage.includes('alaska') || userMessage.includes('oishi')) {
    return "I can provide brand performance analysis from our mock dataset. The data shows various brand performances across different categories and regions.";
  }
  
  if (userMessage.includes('region') || userMessage.includes('ncr') || userMessage.includes('manila')) {
    return "Regional analysis from mock data shows different performance patterns across the 17 Philippine regions. NCR typically shows the highest transaction volumes in our test dataset.";
  }
  
  return "I'm RetailBot, your retail analytics assistant. I can help you analyze sales data, brand performance, regional trends, and consumer insights. All data I reference comes from our mock test dataset. What would you like to explore?";
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
    const aiReply = await mockAzureOpenAI(messages);

    // Generate mock chart data if relevant
    let chartData = null;
    const needsChart = prompt.toLowerCase().includes('chart') || 
                     prompt.toLowerCase().includes('trend') || 
                     prompt.toLowerCase().includes('show');
    
    if (needsChart) {
      chartData = {
        type: 'bar',
        data: [
          { name: 'Alaska Milk', value: 45000 },
          { name: 'Oishi Snacks', value: 38000 },
          { name: 'Del Monte', value: 32000 },
          { name: 'Peerless', value: 28000 }
        ],
        title: 'Mock Brand Performance (Test Data)'
      };
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
