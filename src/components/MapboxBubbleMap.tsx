
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
        interactive: false,
        scrollZoom: false,
        boxZoom: false,
        dragRotate: false,
        dragPan: false,
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
    const existingMarkers = document.querySelectorAll('.overview-bubble-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Get max value for scaling
    const maxValue = Math.max(...regionData.map(region => region[selectedMetric]));
    const config = metricConfigs[selectedMetric];

    // Add bubble markers for each region
    regionData.forEach((region) => {
      const value = region[selectedMetric];
      const bubbleSize = Math.max(20, Math.min(60, (value / maxValue) * 60));
      
      // Create bubble element
      const bubbleEl = document.createElement('div');
      bubbleEl.className = 'overview-bubble-marker';
      bubbleEl.style.cssText = `
        width: ${bubbleSize}px;
        height: ${bubbleSize}px;
        background: rgba(54, 207, 201, 0.8);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        position: relative;
        cursor: default;
      `;

      // Create popup for hover information
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3">
          <h3 class="font-semibold text-gray-900 mb-2">${region.region}</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">${config.label}:</span>
              <span class="font-medium">${config.formatter(value)}</span>
            </div>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 xl:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base xl:text-lg font-semibold text-gray-900">Regional Performance Distribution</h3>
            <p className="text-xs xl:text-sm text-gray-600">Performance across major Philippine regions</p>
          </div>
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Metric Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Metric:</span>
          <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalSales">Total Sales</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="marketShare">Market Share</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative">
        <div ref={mapContainer} className="w-full h-64 xl:h-80" />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            {metricConfigs[selectedMetric].label}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-400 rounded-full border-2 border-white shadow"></div>
              <span>Regional Performance</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Bubble size = {metricConfigs[selectedMetric].label.toLowerCase()}
          </div>
        </div>
      </div>
    </div>
  );
};
