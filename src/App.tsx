
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from './components/Navbar';
import { GlobalFilterBar } from './components/GlobalFilterBar';
import { Sidebar } from './components/Sidebar';
import { useSyncFilters } from './hooks/useSyncFilters';
import Overview from './pages/Overview';
import TransactionTrends from './pages/TransactionTrends';
import ProductMix from './pages/ProductMix';
import Regional from './pages/Regional';
import BrandAnalytics from './pages/BrandAnalytics';
import RetailBot from './pages/RetailBot';
import { DataProvider } from './providers/DataProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  useSyncFilters();
  
  console.log('AppContent rendering - route should work');
  
  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#0A2540] w-full">
      <Navbar />
      
      {/* Push-aside layout: sidebar and main content in flex container */}
      <div className="flex w-full h-[calc(100vh-4rem)]">
        {/* Fixed sidebar - always visible on desktop, drawer on mobile */}
        <Sidebar />
        
        {/* Main content area - pushed to the right by sidebar width */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[18vw] lg:min-[1024px]:ml-[12rem] lg:max-[1440px]:ml-[20rem]">
          {/* Filter bar positioned after sidebar */}
          <GlobalFilterBar />
          
          {/* Main content with proper padding and overflow handling */}
          <main className="flex-1 pt-[1rem] p-[1rem] md:p-[1.5rem] overflow-auto">
            <div className="max-w-full min-w-0">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/trends" element={<TransactionTrends />} />
                <Route path="/products" element={<ProductMix />} />
                <Route path="/regional" element={<Regional />} />
                <Route path="/brands" element={<BrandAnalytics />} />
                <Route path="/chat" element={<RetailBot />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  console.log('App component rendering - should mount correctly');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <DataProvider>
            <Toaster />
            <Sonner />
            <Router>
              <AppContent />
            </Router>
          </DataProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
