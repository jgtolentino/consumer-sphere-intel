
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { useFilterStore } from '../state/useFilterStore';
import { useDrillDownStore } from '../state/useDrillDownStore';

interface RegionData {
  location: string;
  coordinates: [number, number];
  revenue: number;
  transactions: number;
  growth: number;
  level: string;
  parent?: string;
}

const mockRegionData: RegionData[] = [
  // Region level
  {
    location: 'Metro Manila',
    coordinates: [121.0244, 14.6042],
    revenue: 4200000,
    transactions: 53247,
    growth: 12.3,
    level: 'region'
  },
  {
    location: 'Cebu',
    coordinates: [123.8854, 10.3157],
    revenue: 2800000,
    transactions: 36089,
    growth: 8.7,
    level: 'region'
  },
  {
    location: 'Davao',
    coordinates: [125.6144, 7.0731],
    revenue: 1900000,
    transactions: 24561,
    growth: 18.2,
    level: 'region'
  },
  // City level - Metro Manila
  {
    location: 'Quezon City',
    coordinates: [121.0437, 14.6760],
    revenue: 1800000,
    transactions: 23000,
    growth: 15.5,
    level: 'city',
    parent: 'Metro Manila'
  },
  {
    location: 'Manila',
    coordinates: [120.9842, 14.5995],
    revenue: 1200000,
    transactions: 15500,
    growth: 10.2,
    level: 'city',
    parent: 'Metro Manila'
  },
  {
    location: 'Makati',
    coordinates: [121.0164, 14.5547],
    revenue: 1400000,
    transactions: 18200,
    growth: 8.9,
    level: 'city',
    parent: 'Metro Manila'
  },
  // City level - Cebu
  {
    location: 'Cebu City',
    coordinates: [123.8854, 10.3157],
    revenue: 1600000,
    transactions: 20500,
    growth: 9.5,
    level: 'city',
    parent: 'Cebu'
  },
  {
    location: 'Mandaue',
    coordinates: [123.9194, 10.3233],
    revenue: 800000,
    transactions: 10200,
    growth: 7.2,
    level: 'city',
    parent: 'Cebu'
  },
  // City level - Davao
  {
    location: 'Davao City',
    coordinates: [125.6144, 7.0731],
    revenue: 1500000,
    transactions: 19000,
    growth: 20.1,
    level: 'city',
    parent: 'Davao'
  },
  // Barangay level - Quezon City
  {
    location: 'Barangay Commonwealth',
    coordinates: [121.0500, 14.6900],
    revenue: 450000,
    transactions: 5800,
    growth: 18.5,
    level: 'barangay',
    parent: 'Quezon City'
  },
  {
    location: 'Barangay Diliman',
    coordinates: [121.0600, 14.6500],
    revenue: 520000,
    transactions: 6700,
    growth: 12.8,
    level: 'barangay',
    parent: 'Quezon City'
  },
  {
    location: 'Barangay Fairview',
    coordinates: [121.0300, 14.7100],
    revenue: 380000,
    transactions: 4900,
    growth: 14.2,
    level: 'barangay',
    parent: 'Quezon City'
  },
  // Barangay level - Manila
  {
    location: 'Barangay Ermita',
    coordinates: [120.9800, 14.5900],
    revenue: 350000,
    transactions: 4500,
    growth: 8.9,
    level: 'barangay',
    parent: 'Manila'
  },
  {
    location: 'Barangay Malate',
    coordinates: [120.9900, 14.5700],
    revenue: 420000,
    transactions: 5400,
    growth: 11.5,
    level: 'barangay',
    parent: 'Manila'
  },
  // Barangay level - Cebu City
  {
    location: 'Barangay Lahug',
    coordinates: [123.9000, 10.3400],
    revenue: 480000,
    transactions: 6200,
    growth: 10.8,
    level: 'barangay',
    parent: 'Cebu City'
  },
  {
    location: 'Barangay Capitol Site',
    coordinates: [123.8900, 10.3200],
    revenue: 390000,
    transactions: 5000,
    growth: 8.5,
    level: 'barangay',
    parent: 'Cebu City'
  }
];

export const GeoMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { barangays, setFilter } = useFilterStore();
  const { drillPath, drillDown, getCurrentContext } = useDrillDownStore();

  // Use your provided Mapbox token
  const MAPBOX_TOKEN = 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

  const getVisibleRegions = () => {
    if (drillPath.length === 0) {
      return mockRegionData.filter(region => region.level === 'region');
    }
    
    const lastDrillLevel = drillPath[drillPath.length - 1];
    const childRegions = mockRegionData.filter(region => region.parent === lastDrillLevel.label);
    
    // If no children found, return the current level data
    if (childRegions.length === 0) {
      return mockRegionData.filter(region => region.location === lastDrillLevel.label);
    }
    
    return childRegions;
  };

  const handleRegionClick = (regionName: string, regionLevel: string) => {
    console.log('Region clicked:', regionName, 'Level:', regionLevel);
    
    // Drill down if possible (regions can drill to cities, cities to barangays)
    if (regionLevel === 'region' || regionLevel === 'city') {
      drillDown({
        type: regionLevel as any,
        value: regionName.toLowerCase().replace(/\s+/g, '-'),
        label: regionName
      });
    }
    
    // Also apply as filter for cross-filtering
    const currentRegions = barangays.includes(regionName) 
      ? barangays.filter(r => r !== regionName)
      : [...barangays, regionName];
    setFilter('barangays', currentRegions);
  };

  const getMarkerSize = (level: string) => {
    switch (level) {
      case 'region': return '35px';
      case 'city': return '28px';
      case 'barangay': return '20px';
      default: return '25px';
    }
  };

  const getMarkerOpacity = (level: string) => {
    switch (level) {
      case 'region': return '1';
      case 'city': return '0.9';
      case 'barangay': return '0.8';
      default: return '0.8';
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [122.0, 12.0], // Philippines center
        zoom: 5.5,
        pitch: 0,
        bearing: 0
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;
        setMapLoaded(true);
        updateMapMarkers();
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  const updateMapMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.custom-marker');
    existingMarkers.forEach(marker => marker.remove());

    const visibleRegions = getVisibleRegions();

    // Add markers for visible regions
    visibleRegions.forEach((region) => {
      const isSelected = barangays.includes(region.location);
      const markerSize = getMarkerSize(region.level);
      const markerOpacity = getMarkerOpacity(region.level);
      
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.cssText = `
        width: ${markerSize};
        height: ${markerSize};
        background: ${isSelected ? '#2AB5B0' : '#36CFC9'};
        border: 3px solid ${isSelected ? '#0A2540' : 'white'};
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        position: relative;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        transition: all 0.2s ease;
        opacity: ${markerOpacity};
      `;

      // Add click handler for cross-filtering and drill-down
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        handleRegionClick(region.location, region.level);
      });

      // Create popup with drill-down hint
      const canDrillDown = region.level === 'region' || region.level === 'city';
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3">
          <h3 class="font-semibold text-gray-900 mb-2">${region.location}</h3>
          <div class="text-xs text-blue-600 mb-2 capitalize">${region.level}</div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Revenue:</span>
              <span class="font-medium">₱${(region.revenue / 1000000).toFixed(1)}M</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Transactions:</span>
              <span class="font-medium">${region.transactions.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Growth:</span>
              <span class="font-medium text-green-600">+${region.growth}%</span>
            </div>
            ${canDrillDown ? 
              '<div class="mt-2 text-xs text-blue-600 font-medium">Click to drill down</div>' : ''
            }
          </div>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(markerEl)
        .setLngLat(region.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Adjust zoom based on drill level and visible regions
    if (visibleRegions.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      visibleRegions.forEach(region => bounds.extend(region.coordinates));
      
      // Different zoom levels based on drill depth
      let maxZoom = 6;
      if (drillPath.length === 1) maxZoom = 10; // City level
      if (drillPath.length === 2) maxZoom = 13; // Barangay level
      
      map.current.fitBounds(bounds, { 
        padding: 50, 
        maxZoom: maxZoom,
        duration: 1000 
      });
    }
  };

  // Update markers when drill path or filters change
  useEffect(() => {
    if (map.current && mapLoaded) {
      updateMapMarkers();
    }
  }, [drillPath, barangays, mapLoaded]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Regional Performance Map</h3>
        <p className="text-sm text-gray-600">
          Current view: {getCurrentContext()} - Click markers to drill down or filter
        </p>
        {drillPath.length > 0 && (
          <div className="mt-2 text-xs text-blue-600">
            Drill level: {drillPath[drillPath.length - 1].type} • Showing {getVisibleRegions().length} locations
          </div>
        )}
      </div>
      <div ref={mapContainer} className="w-full h-96" />
    </div>
  );
};
