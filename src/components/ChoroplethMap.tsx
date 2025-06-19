
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
    region: 'CALABARZON',
    coordinates: [121.2, 14.2],
    totalSales: 3100000,
    transactions: 39500,
    marketShare: 25
  },
  {
    region: 'Central Luzon',
    coordinates: [120.8, 15.3],
    totalSales: 2600000,
    transactions: 33000,
    marketShare: 21
  }
];

type MetricType = 'totalSales' | 'transactions' | 'marketShare';

interface MetricConfig {
  label: string;
  unit: string;
  formatter: (value: number) => string;
  colorScale: string[];
}

const metricConfigs: Record<MetricType, MetricConfig> = {
  totalSales: {
    label: 'Total Sales',
    unit: '₱',
    formatter: (value) => `₱${(value / 1000000).toFixed(1)}M`,
    colorScale: ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000']
  },
  transactions: {
    label: 'Transactions',
    unit: '',
    formatter: (value) => `${(value / 1000).toFixed(1)}K`,
    colorScale: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c']
  },
  marketShare: {
    label: 'Market Share',
    unit: '%',
    formatter: (value) => `${value}%`,
    colorScale: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c']
  }
};

export const ChoroplethMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalSales');

  const MAPBOX_TOKEN = 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

  const getColorForValue = (value: number, metric: MetricType) => {
    const config = metricConfigs[metric];
    const values = regionData.map(r => r[metric]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const normalized = (value - min) / (max - min);
    const colorIndex = Math.floor(normalized * (config.colorScale.length - 1));
    return config.colorScale[Math.min(colorIndex, config.colorScale.length - 1)];
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
        addChoroplethRegions();
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      addChoroplethRegions();
    }
  }, [selectedMetric, mapLoaded]);

  const addChoroplethRegions = () => {
    if (!map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.choropleth-region');
    existingMarkers.forEach(marker => marker.remove());

    const config = metricConfigs[selectedMetric];

    // Add colored region markers
    regionData.forEach((region) => {
      const value = region[selectedMetric];
      const color = getColorForValue(value, selectedMetric);
      
      // Create region element with choropleth styling
      const regionEl = document.createElement('div');
      regionEl.className = 'choropleth-region';
      regionEl.style.cssText = `
        width: 90px;
        height: 70px;
        background: ${color};
        border: 2px solid white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        position: relative;
        cursor: default;
        opacity: 0.9;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${selectedMetric === 'totalSales' && value > 3000000 ? 'white' : 'black'};
        font-size: 11px;
        font-weight: bold;
        text-align: center;
        line-height: 1.1;
      `;

      // Add region name abbreviation
      const regionAbbr = region.region.split(' ').map(word => word.charAt(0)).join('').substring(0, 3);
      regionEl.textContent = regionAbbr;

      // Create popup for detailed information
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
            <div class="flex justify-between">
              <span class="text-gray-600">Rank:</span>
              <span class="font-medium">#${regionData
                .sort((a, b) => b[selectedMetric] - a[selectedMetric])
                .findIndex(r => r.region === region.region) + 1}</span>
            </div>
          </div>
        </div>
      `);

      // Add marker to map
      const marker = new mapboxgl.Marker(regionEl)
        .setLngLat(region.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      // Show popup on hover
      regionEl.addEventListener('mouseenter', () => {
        popup.addTo(map.current!);
      });

      regionEl.addEventListener('mouseleave', () => {
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
            <p className="text-xs xl:text-sm text-gray-600">Color-coded performance across major Philippine regions</p>
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
        <div ref={mapContainer} className="w-full h-96" />
        
        {/* Color Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            {metricConfigs[selectedMetric].label}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span>Low</span>
            {metricConfigs[selectedMetric].colorScale.map((color, index) => (
              <div 
                key={index}
                className="w-4 h-4 border border-gray-300"
                style={{ backgroundColor: color }}
              />
            ))}
            <span>High</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Regions colored by {metricConfigs[selectedMetric].label.toLowerCase()}
          </div>
        </div>
      </div>
    </div>
  );
};
