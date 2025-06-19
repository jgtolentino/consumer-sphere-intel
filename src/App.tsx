
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
  const [zoomLevel, setZoomLevel] = useState(100);
  
  console.log('AppContent rendering - route should work');
  
  const zoomLevels = [50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200];
  
  const zoomIn = () => {
    const currentIndex = zoomLevels.findIndex(level => level === zoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1]);
    }
  };
  
  const zoomOut = () => {
    const currentIndex = zoomLevels.findIndex(level => level === zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1]);
    }
  };
  
  const resetZoom = () => {
    setZoomLevel(100);
  };
  
  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#0A2540] flex flex-col">
      <Navbar />
      
      {/* Page Zoom Controls */}
      <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <button
          onClick={zoomOut}
          disabled={zoomLevel <= 50}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4 text-scout-navy dark:text-scout-teal" />
        </button>
        
        <div className="px-3 py-1 text-sm font-medium text-scout-navy dark:text-scout-teal min-w-[50px] text-center">
          {zoomLevel}%
        </div>
        
        <button
          onClick={zoomIn}
          disabled={zoomLevel >= 200}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4 text-scout-navy dark:text-scout-teal" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        
        <button
          onClick={resetZoom}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Reset Zoom (100%)"
        >
          <RotateCcw className="h-4 w-4 text-scout-navy dark:text-scout-teal" />
        </button>
      </div>
      
      {/* Main layout container */}
      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        {/* Sidebar - fixed width on desktop, hidden on mobile */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Filter bar */}
          <div className="flex-shrink-0">
            <GlobalFilterBar />
          </div>
          
          {/* Scrollable content with zoom transformation */}
          <main 
            className="flex-1 overflow-auto"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left',
              width: zoomLevel !== 100 ? `${10000 / zoomLevel}%` : '100%',
              height: zoomLevel < 100 ? `${10000 / zoomLevel}%` : 'auto'
            }}
          >
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
