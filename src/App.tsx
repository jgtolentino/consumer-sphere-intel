
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
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
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
      
      {/* Fixed layout: sidebar and main content side by side */}
      <div className="flex w-full h-[calc(100vh-4rem)]">
        {/* Sidebar - fixed width, always visible on desktop */}
        <Sidebar />
        
        {/* Main content container - takes remaining space, never overlapped */}
        <div className="flex-1 flex flex-col min-w-0 w-full lg:w-[calc(100vw-16rem)]">
          {/* Filter bar */}
          <GlobalFilterBar />
          
          {/* Main content with proper spacing */}
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-[#F5F6FA] dark:bg-[#0A2540]">
            <div className="max-w-full min-w-0 w-full">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/trends" element={<TransactionTrends />} />
                <Route path="/products" element={<ProductMix />} />
                <Route path="/regional" element={<Regional />} />
                <Route path="/brands" element={<BrandAnalytics />} />
                <Route path="/chat" element={<RetailBot />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
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
