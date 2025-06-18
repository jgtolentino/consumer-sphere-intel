
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
    return mockRegionData.filter(region => region.parent === lastDrillLevel.label);
  };

  const handleRegionClick = (regionName: string, regionLevel: string) => {
    console.log('Region clicked:', regionName, 'Level:', regionLevel);
    
    // Drill down if possible
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
      
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.cssText = `
        width: ${region.level === 'city' ? '25px' : '30px'};
        height: ${region.level === 'city' ? '25px' : '30px'};
        background: ${isSelected ? '#2AB5B0' : '#36CFC9'};
        border: 3px solid ${isSelected ? '#0A2540' : 'white'};
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        position: relative;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        transition: all 0.2s ease;
        ${region.level === 'city' ? 'opacity: 0.8;' : ''}
      `;

      // Add click handler for cross-filtering and drill-down
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        handleRegionClick(region.location, region.level);
      });

      // Create popup with drill-down hint
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3">
          <h3 class="font-semibold text-gray-900 mb-2">${region.location}</h3>
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
            ${region.level === 'region' || region.level === 'city' ? 
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

    // Adjust zoom based on drill level
    if (drillPath.length > 0 && visibleRegions.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      visibleRegions.forEach(region => bounds.extend(region.coordinates));
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 10 });
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
      </div>
      <div ref={mapContainer} className="w-full h-96" />
    </div>
  );
};
