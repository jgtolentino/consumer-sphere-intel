
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { useFilterStore } from '../state/useFilterStore';

interface RegionData {
  location: string;
  coordinates: [number, number];
  revenue: number;
  transactions: number;
  growth: number;
}

const mockRegionData: RegionData[] = [
  {
    location: 'Metro Manila',
    coordinates: [121.0244, 14.6042],
    revenue: 4200000,
    transactions: 53247,
    growth: 12.3
  },
  {
    location: 'Cebu',
    coordinates: [123.8854, 10.3157],
    revenue: 2800000,
    transactions: 36089,
    growth: 8.7
  },
  {
    location: 'Davao',
    coordinates: [125.6144, 7.0731],
    revenue: 1900000,
    transactions: 24561,
    growth: 18.2
  },
  {
    location: 'Iloilo',
    coordinates: [122.5621, 10.7202],
    revenue: 1200000,
    transactions: 15432,
    growth: 6.5
  },
  {
    location: 'Baguio',
    coordinates: [120.5962, 16.4023],
    revenue: 950000,
    transactions: 12876,
    growth: 14.8
  }
];

export const GeoMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { barangays, setFilter } = useFilterStore();

  // Use your provided Mapbox token
  const MAPBOX_TOKEN = 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

  const handleRegionClick = (regionName: string) => {
    console.log('Region clicked:', regionName);
    // Cross-filter: clicking a region applies it as a filter
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

        // Add markers for each region
        mockRegionData.forEach((region) => {
          const isSelected = barangays.includes(region.location);
          
          // Create marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'custom-marker';
          markerEl.style.cssText = `
            width: 30px;
            height: 30px;
            background: ${isSelected ? '#2AB5B0' : '#36CFC9'};
            border: 3px solid ${isSelected ? '#0A2540' : 'white'};
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            position: relative;
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
            transition: all 0.2s ease;
          `;

          // Add click handler for cross-filtering
          markerEl.addEventListener('click', (e) => {
            e.stopPropagation();
            handleRegionClick(region.location);
          });

          // Create popup
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
              </div>
            </div>
          `);

          // Add marker to map
          new mapboxgl.Marker(markerEl)
            .setLngLat(region.coordinates)
            .setPopup(popup)
            .addTo(map.current!);
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Re-initialize map when filters change to update marker styles
  useEffect(() => {
    if (map.current && mapLoaded) {
      // Re-render markers with updated selection state
      const markers = document.querySelectorAll('.custom-marker');
      markers.forEach((marker, index) => {
        const region = mockRegionData[index];
        const isSelected = barangays.includes(region.location);
        const markerEl = marker as HTMLElement;
        markerEl.style.background = isSelected ? '#2AB5B0' : '#36CFC9';
        markerEl.style.border = `3px solid ${isSelected ? '#0A2540' : 'white'}`;
        markerEl.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
      });
    }
  }, [barangays, mapLoaded]);

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
        <p className="text-sm text-gray-600">Click markers to filter data by region</p>
      </div>
      <div ref={mapContainer} className="w-full h-96" />
    </div>
  );
};
