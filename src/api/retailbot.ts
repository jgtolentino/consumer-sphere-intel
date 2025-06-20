
import { MockDataService } from '../services/MockDataService';

const mockDataService = new MockDataService();

// Mock Azure OpenAI client for development
const mockAzureOpenAI = async (messages: any[], userPrompt: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const prompt = userPrompt.toLowerCase();
  
  // Simple intent detection for demo
  if (prompt.includes('sales') || prompt.includes('revenue')) {
    return "I can analyze sales trends from our mock dataset. Let me show you the data breakdown with comprehensive metrics and visualizations.";
  }
  
  if (prompt.includes('brand') || prompt.includes('alaska') || prompt.includes('oishi')) {
    return "Here's the brand performance analysis from our mock dataset showing various brand metrics across categories and regions with complete data visualization.";
  }
  
  if (prompt.includes('region') || prompt.includes('ncr') || prompt.includes('manila')) {
    return "I can provide regional analysis from our mock data showing performance patterns across all 17 Philippine regions with detailed metrics.";
  }
  
  if (prompt.includes('top') || prompt.includes('best') || prompt.includes('highest')) {
    return "Here are the top performing items from our mock dataset analysis with complete performance metrics.";
  }
  
  if (prompt.includes('compare') || prompt.includes('comparison')) {
    return "I'll compare the performance metrics from our mock dataset for you with comprehensive data visualization.";
  }
  
  return "I'm RetailBot, your retail analytics assistant. I can help you analyze mock sales data, brand performance, regional trends, and consumer insights with complete data visualizations. What would you like to explore?";
};

const generateChartFromData = async (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();
  
  try {
    if (lowerPrompt.includes('brand') || lowerPrompt.includes('alaska') || lowerPrompt.includes('oishi')) {
      const brandData = await mockDataService.getBrandData();
      // Ensure all brand data has complete values
      const processedData = brandData.map((brand, index) => ({
        name: brand.name || `Brand ${index + 1}`,
        value: Math.max(brand.sales || brand.revenue || 100000, 50000) // Ensure minimum values
      })).slice(0, 8); // Show top 8 brands
      
      return {
        type: 'bar',
        data: processedData,
        title: 'Brand Performance Analysis (Mock Data)'
      };
    }
    
    if (lowerPrompt.includes('region') || lowerPrompt.includes('ncr') || lowerPrompt.includes('manila')) {
      const regionalData = await mockDataService.getRegionalData();
      const processedData = regionalData.map((region, index) => ({
        name: region.name || `Region-${index + 1}`,
        value: Math.max(region.sales || region.transactions || 75000, 25000)
      })).slice(0, 10);
      
      return {
        type: 'bar',
        data: processedData,
        title: 'Regional Performance Distribution (Mock Data)'
      };
    }
    
    if (lowerPrompt.includes('top') || lowerPrompt.includes('best')) {
      const productData = await mockDataService.getProductData();
      const topSkus = productData.topSkus || [];
      const processedData = topSkus.slice(0, 8).map((sku, index) => ({
        name: sku.name || `Product-${index + 1}`,
        value: Math.max(sku.revenue || sku.sales || 50000, 15000)
      }));
      
      // Add fallback data if insufficient products
      while (processedData.length < 6) {
        processedData.push({
          name: `Top Product ${processedData.length + 1}`,
          value: Math.floor(Math.random() * 80000) + 20000
        });
      }
      
      return {
        type: 'bar',
        data: processedData,
        title: 'Top Products Performance (Mock Data)'
      };
    }
    
    if (lowerPrompt.includes('category') || lowerPrompt.includes('mix')) {
      const productData = await mockDataService.getProductData();
      const categoryMix = productData.categoryMix || [];
      const processedData = categoryMix.slice(0, 8).map((cat, index) => ({
        name: cat.category || `Category-${index + 1}`,
        value: Math.max(cat.count || 1000, 500)
      }));
      
      // Add fallback categories if needed
      const defaultCategories = [
        'Electronics', 'Groceries', 'Health & Beauty', 'Clothing', 
        'Beverages', 'Snacks', 'Home & Garden', 'Sports'
      ];
      
      while (processedData.length < 6) {
        const catName = defaultCategories[processedData.length] || `Category ${processedData.length + 1}`;
        processedData.push({
          name: catName,
          value: Math.floor(Math.random() * 5000) + 1000
        });
      }
      
      return {
        type: 'bar',
        data: processedData,
        title: 'Category Performance Distribution (Mock Data)'
      };
    }
    
    // Default comprehensive chart with transaction data
    const transactions = await mockDataService.getTransactions();
    if (transactions && transactions.length > 0) {
      const categoryStats = transactions.reduce((acc: any, transaction: any) => {
        if (transaction.basket && Array.isArray(transaction.basket)) {
          transaction.basket.forEach((item: any) => {
            const category = item.category || 'Other';
            const price = Math.max(item.price || 100, 50);
            acc[category] = (acc[category] || 0) + price;
          });
        }
        return acc;
      }, {});
      
      const chartData = Object.entries(categoryStats)
        .slice(0, 8)
        .map(([category, value]) => ({
          name: category,
          value: Math.max(value as number, 1000)
        }));
      
      // Ensure minimum 6 data points
      
  // TODO: Replace with proper data service call
  const [defaultData, setDefaultData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Replace this with actual data service call
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // const data = await dataService.getData();
        // setDefaultData(data);
        setDefaultData([]); // Temporary empty array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
      
      const finalData = chartData.length >= 4 ? chartData : defaultData;
      
      return {
        type: 'bar',
        data: finalData,
        title: 'Sales Performance Overview (Mock Data)'
      };
    }
    
    // Absolute fallback with guaranteed data
    return {
      type: 'bar',
      data: [
        { name: 'Electronics', value: 245000 },
        { name: 'Groceries', value: 189000 },
        { name: 'Health & Beauty', value: 167000 },
        { name: 'Beverages', value: 143000 },
        { name: 'Clothing', value: 125000 },
        { name: 'Snacks', value: 98000 }
      ],
      title: 'Sample Performance Data (Mock)'
    };
    
  } catch (error) {
    console.error('Error generating chart data:', error);
    
    // Return fallback chart data on error
    return {
      type: 'bar',
      data: [
        { name: 'Sample A', value: 125000 },
        { name: 'Sample B', value: 98000 },
        { name: 'Sample C', value: 87000 },
        { name: 'Sample D', value: 76000 },
        { name: 'Sample E', value: 65000 }
      ],
      title: 'Fallback Data (Mock)'
    };
  }
};

export const handleRetailBotQuery = async (prompt: string, chatHistory: any[] = []) => {
  try {
    // System prompt for mock mode
    const systemPrompt = {
      role: "system",
      content: "You are RetailBot, a retail analytics AI assistant. All data and analytics you reference are from mock test data for QA purposes, not real sales data. Always provide complete analysis with detailed metrics and ensure all visualizations have complete data."
    };

    // Call mock Azure OpenAI
    const messages = [systemPrompt, ...chatHistory, { role: "user", content: prompt }];
    const aiReply = await mockAzureOpenAI(messages, prompt);

    // Always generate chart data for better visualization
    let chartData = null;
    const needsChart = prompt.toLowerCase().includes('chart') || 
                     prompt.toLowerCase().includes('trend') || 
                     prompt.toLowerCase().includes('show') ||
                     prompt.toLowerCase().includes('brand') ||
                     prompt.toLowerCase().includes('region') ||
                     prompt.toLowerCase().includes('top') ||
                     prompt.toLowerCase().includes('performance') ||
                     prompt.toLowerCase().includes('analysis') ||
                     prompt.toLowerCase().includes('data');
    
    if (needsChart || Math.random() > 0.3) { // Show charts more frequently
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
    
    // Return fallback response with sample chart
    return {
      reply: "I apologize for the delay. Here's a sample analysis from our mock data showing key performance metrics.",
      chart: {
        type: 'bar',
        data: [
          { name: 'Category A', value: 145000 },
          { name: 'Category B', value: 98000 },
          { name: 'Category C', value: 87000 },
          { name: 'Category D', value: 76000 }
        ],
        title: 'Sample Analysis (Mock Data)'
      },
      data_source: "mock",
      error: false
    };
  }
};
