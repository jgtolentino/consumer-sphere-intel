
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { philippineRegionsGeoJSON } from '../data/philippineRegions';

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
  colorStops: [number, string][];
}

const metricConfigs: Record<MetricType, MetricConfig> = {
  totalSales: {
    label: 'Total Sales',
    unit: '₱',
    formatter: (value) => `₱${(value / 1000000).toFixed(1)}M`,
    colorStops: [
      [0, '#fff5f0'],
      [1000000, '#fdcc8a'],
      [2000000, '#fc8d59'],
      [3000000, '#e34a33'],
      [4500000, '#b30000']
    ]
  },
  transactions: {
    label: 'Transactions',
    unit: '',
    formatter: (value) => `${(value / 1000).toFixed(1)}K`,
    colorStops: [
      [0, '#f7fbff'],
      [15000, '#c6dbef'],
      [25000, '#6baed6'],
      [35000, '#3182bd'],
      [55000, '#08519c']
    ]
  },
  marketShare: {
    label: 'Market Share',
    unit: '%',
    formatter: (value) => `${value}%`,
    colorStops: [
      [0, '#f7fcf5'],
      [10, '#c7e9c0'],
      [20, '#74c476'],
      [30, '#31a354'],
      [40, '#006d2c']
    ]
  }
};

export const ChoroplethMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalSales');

  const MAPBOX_TOKEN = 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

  const getColorForValue = (value: number, metric: MetricType): string => {
    const config = metricConfigs[metric];
    const stops = config.colorStops;
    
    // Find the appropriate color based on value
    for (let i = stops.length - 1; i >= 0; i--) {
      if (value >= stops[i][0]) {
        return stops[i][1];
      }
    }
    return stops[0][1]; // fallback to first color
  };

  const getRegionValue = (regionName: string): number => {
    const region = regionData.find(r => r.region === regionName);
    return region ? region[selectedMetric] : 0;
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
        addChoroplethLayer();
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      updateChoroplethLayer();
    }
  }, [selectedMetric, mapLoaded]);

  const addChoroplethLayer = () => {
    if (!map.current) return;

    // Add GeoJSON source with enriched data
    const enrichedGeoJSON = {
      ...philippineRegionsGeoJSON,
      features: philippineRegionsGeoJSON.features.map(feature => {
        const regionName = feature.properties.name;
        const regionStats = regionData.find(r => r.region === regionName);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            totalSales: regionStats?.totalSales || 0,
            transactions: regionStats?.transactions || 0,
            marketShare: regionStats?.marketShare || 0
          }
        };
      })
    };

    map.current.addSource('ph-regions', {
      type: 'geojson',
      data: enrichedGeoJSON as any
    });

    // Add fill layer with expression-based coloring
    map.current.addLayer({
      id: 'ph-regions-fill',
      type: 'fill',
      source: 'ph-regions',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', selectedMetric],
          ...metricConfigs[selectedMetric].colorStops.flat()
        ],
        'fill-opacity': 0.8
      }
    });

    // Add border layer
    map.current.addLayer({
      id: 'ph-regions-border',
      type: 'line',
      source: 'ph-regions',
      paint: {
        'line-color': '#ffffff',
        'line-width': 2,
        'line-opacity': 0.8
      }
    });

    // Add hover effects and popups
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.current.on('mouseenter', 'ph-regions-fill', (e) => {
      if (!map.current || !e.features || e.features.length === 0) return;

      map.current.getCanvas().style.cursor = 'pointer';
      
      const feature = e.features[0];
      const props = feature.properties;
      const config = metricConfigs[selectedMetric];
      const value = props?.[selectedMetric] || 0;
      
      if (props) {
        popup.setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-3 min-w-48">
              <h3 class="font-semibold text-gray-900 mb-2">${props.name}</h3>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">${config.label}:</span>
                  <span class="font-medium">${config.formatter(value)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Transactions:</span>
                  <span class="font-medium">${(props.transactions || 0).toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Market Share:</span>
                  <span class="font-medium">${props.marketShare || 0}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Rank:</span>
                  <span class="font-medium">#${regionData
                    .sort((a, b) => b[selectedMetric] - a[selectedMetric])
                    .findIndex(r => r.region === props.name) + 1}</span>
                </div>
              </div>
            </div>
          `)
          .addTo(map.current);
      }
    });

    map.current.on('mouseleave', 'ph-regions-fill', () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = '';
      popup.remove();
    });
  };

  const updateChoroplethLayer = () => {
    if (!map.current || !map.current.getSource('ph-regions')) return;

    // Update fill colors based on selected metric using interpolation
    map.current.setPaintProperty('ph-regions-fill', 'fill-color', [
      'interpolate',
      ['linear'],
      ['get', selectedMetric],
      ...metricConfigs[selectedMetric].colorStops.flat()
    ]);
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
            <p className="text-xs xl:text-sm text-gray-600">True choropleth mapping with actual region boundaries</p>
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
        
        {/* Gradient Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            {metricConfigs[selectedMetric].label}
          </div>
          <div className="flex items-center gap-1 text-xs mb-2">
            <span>Low</span>
            <div className="w-32 h-4 rounded" style={{
              background: `linear-gradient(to right, ${metricConfigs[selectedMetric].colorStops.map(stop => stop[1]).join(', ')})`
            }}></div>
            <span>High</span>
          </div>
          <div className="text-xs text-gray-500">
            Regions filled by actual polygon boundaries
          </div>
        </div>
      </div>
    </div>
  );
};
