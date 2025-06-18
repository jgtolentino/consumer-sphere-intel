
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import ConsumerInsights from './pages/ConsumerInsights';
import RetailBot from './pages/RetailBot';
import AiAssist from './pages/AiAssist';
import VibeCheck from './pages/VibeCheck';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <GlobalFilterBar />
      
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-32 p-4 md:p-6 overflow-x-auto">
          <div className="max-w-full">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/transaction-trends" element={<TransactionTrends />} />
              <Route path="/product-mix" element={<ProductMix />} />
              <Route path="/consumer-insights" element={<ConsumerInsights />} />
              <Route path="/retailbot" element={<RetailBot />} />
              <Route path="/ai-assist" element={<AiAssist />} />
              <Route path="/vibe-check" element={<VibeCheck />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  console.log('App component rendering - should mount correctly');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <AppContent />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
