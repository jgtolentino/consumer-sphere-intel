
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface RegionData {
  region: string;
  coordinates: [number, number];
  totalSales: number;
  transactions: number;
  marketShare: number;
}

const regionData: RegionData[] = [
  {
    region: 'Metro Manila',
    coordinates: [121.0244, 14.6042],
    totalSales: 4200000,
    transactions: 53400,
    marketShare: 34
  },
  {
    region: 'Cebu',
    coordinates: [123.8854, 10.3157],
    totalSales: 2800000,
    transactions: 35600,
    marketShare: 23
  },
  {
    region: 'Davao',
    coordinates: [125.6144, 7.0731],
    totalSales: 1900000,
    transactions: 24200,
    marketShare: 15
  },
  {
    region: 'Iloilo',
    coordinates: [120.7935, 10.7202],
    totalSales: 1200000,
    transactions: 15300,
    marketShare: 10
  },
  {
    region: 'Baguio',
    coordinates: [120.5960, 16.4023],
    totalSales: 950000,
    transactions: 12100,
    marketShare: 8
  },
  {
    region: 'Cagayan de Oro',
    coordinates: [124.6319, 8.4542],
    totalSales: 780000,
    transactions: 9900,
    marketShare: 6
  },
  {
    region: 'Zamboanga',
    coordinates: [122.0790, 6.9214],
    totalSales: 650000,
    transactions: 8300,
    marketShare: 5
  }
];

type MetricType = 'totalSales' | 'transactions' | 'marketShare';

interface MetricConfig {
  label: string;
  unit: string;
  formatter: (value: number) => string;
}

const metricConfigs: Record<MetricType, MetricConfig> = {
  totalSales: {
    label: 'Total Sales',
    unit: '₱',
    formatter: (value) => `₱${(value / 1000000).toFixed(1)}M`
  },
  transactions: {
    label: 'Transactions',
    unit: '',
    formatter: (value) => `${(value / 1000).toFixed(1)}K`
  },
  marketShare: {
    label: 'Market Share',
    unit: '%',
    formatter: (value) => `${value}%`
  }
};

export const MapboxBubbleMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalSales');

  const MAPBOX_TOKEN = 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

  const getColorForValue = (value: number, metric: MetricType): string => {
    const values = regionData.map(r => r[metric]);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const normalized = (value - minValue) / (maxValue - minValue);
    
    // TBWA-compliant color gradient from light gray to black with yellow highlights
    if (normalized >= 0.8) return '#000000'; // Black for highest values
    if (normalized >= 0.6) return '#333333'; // Charcoal for high values
    if (normalized >= 0.4) return '#666666'; // Mid gray for medium values
    if (normalized >= 0.2) return '#999999'; // Light gray for low values
    return '#CCCCCC'; // Lightest gray for lowest values
  };

  const getBubbleSize = (value: number, metric: MetricType): number => {
    const values = regionData.map(r => r[metric]);
    const maxValue = Math.max(...values);
    const normalized = value / maxValue;
    return Math.max(15, Math.min(50, normalized * 50));
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [122.0, 12.0],
        zoom: 5.5,
        pitch: 0,
        bearing: 0,
        interactive: true,
        scrollZoom: true,
        boxZoom: false,
        dragRotate: false,
        dragPan: true,
        keyboard: false,
        doubleClickZoom: false,
        touchZoomRotate: false
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        addBubbles();
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      addBubbles();
    }
  }, [selectedMetric, mapLoaded]);

  const addBubbles = () => {
    if (!map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.bubble-marker');
    existingMarkers.forEach(marker => marker.remove());

    const config = metricConfigs[selectedMetric];

    // Add bubble markers for each region
    regionData.forEach((region) => {
      const value = region[selectedMetric];
      const bubbleSize = getBubbleSize(value, selectedMetric);
      const bubbleColor = getColorForValue(value, selectedMetric);
      
      // Create bubble element with choropleth coloring
      const bubbleEl = document.createElement('div');
      bubbleEl.className = 'bubble-marker';
      bubbleEl.style.cssText = `
        width: ${bubbleSize}px;
        height: ${bubbleSize}px;
        background: ${bubbleColor};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;
      `;

      // Add hover effect
      bubbleEl.addEventListener('mouseenter', () => {
        bubbleEl.style.transform = 'scale(1.1)';
        bubbleEl.style.borderColor = '#FFD600'; // TBWA yellow on hover
        bubbleEl.style.borderWidth = '4px';
      });

      bubbleEl.addEventListener('mouseleave', () => {
        bubbleEl.style.transform = 'scale(1)';
        bubbleEl.style.borderColor = 'white';
        bubbleEl.style.borderWidth = '3px';
      });

      // Create popup for detailed information
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <h3 class="font-semibold text-black mb-3 text-base">${region.region}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span class="text-gray-600">Total Sales:</span>
              <span class="font-medium text-black">${metricConfigs.totalSales.formatter(region.totalSales)}</span>
            </div>
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span class="text-gray-600">Transactions:</span>
              <span class="font-medium text-black">${metricConfigs.transactions.formatter(region.transactions)}</span>
            </div>
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span class="text-gray-600">Market Share:</span>
              <span class="font-medium text-black">${metricConfigs.marketShare.formatter(region.marketShare)}</span>
            </div>
          </div>
          <div class="mt-3 text-xs text-gray-500 border-t pt-2">
            Color intensity represents ${config.label.toLowerCase()}
          </div>
        </div>
      `);

      // Add marker to map
      const marker = new mapboxgl.Marker(bubbleEl)
        .setLngLat(region.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      // Show popup on hover
      bubbleEl.addEventListener('mouseenter', () => {
        popup.addTo(map.current!);
      });

      bubbleEl.addEventListener('mouseleave', () => {
        popup.remove();
      });
    });
  };

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 xl:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base xl:text-lg font-semibold text-black">Regional Performance Bubble Map</h3>
            <p className="text-xs xl:text-sm text-gray-600">Color-coded performance across Philippine regions</p>
          </div>
          <MapPin className="h-5 w-5 text-gray-600" />
        </div>
        
        {/* Metric Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-black">Metric:</span>
          <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
            <SelectTrigger className="w-48 border-gray-300 focus:border-tbwa-yellow">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalSales">💰 Total Sales</SelectItem>
              <SelectItem value="transactions">📊 Transactions</SelectItem>
              <SelectItem value="marketShare">📈 Market Share</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative">
        <div ref={mapContainer} className="w-full h-80 xl:h-96" />
        
        {/* Enhanced Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="text-sm font-semibold text-black mb-3">
            {metricConfigs[selectedMetric].label}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs">
              <div className="w-6 h-6 bg-black rounded-full border-2 border-white shadow"></div>
              <span className="text-gray-600">Highest</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-5 h-5 bg-gray-600 rounded-full border-2 border-white shadow"></div>
              <span className="text-gray-600">High</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white shadow"></div>
              <span className="text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow"></div>
              <span className="text-gray-600">Low</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-3 pt-2 border-t">
            Bubble size = Performance level<br/>
            Color intensity = Relative ranking
          </div>
        </div>

        {/* Interaction Hint */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-2 border border-gray-200">
          <div className="text-xs text-gray-600 font-medium">Interactive Map</div>
          <div className="text-xs text-gray-500">Hover bubbles for details</div>
        </div>
      </div>
    </div>
  );
};
