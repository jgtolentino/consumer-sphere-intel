
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { useFilterStore } from '../state/useFilterStore';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    coordinates: [14.6042, 121.0244],
    revenue: 4200000,
    transactions: 53247,
    growth: 12.3
  },
  {
    location: 'Cebu',
    coordinates: [10.3157, 123.8854],
    revenue: 2800000,
    transactions: 36089,
    growth: 8.7
  },
  {
    location: 'Davao',
    coordinates: [7.0731, 125.6144],
    revenue: 1900000,
    transactions: 24561,
    growth: 18.2
  },
  {
    location: 'Iloilo',
    coordinates: [10.7202, 122.5621],
    revenue: 1200000,
    transactions: 15432,
    growth: 6.5
  },
  {
    location: 'Baguio',
    coordinates: [16.4023, 120.5962],
    revenue: 950000,
    transactions: 12876,
    growth: 14.8
  }
];

// Custom marker component that updates when filters change
const CustomMarker: React.FC<{
  region: RegionData;
  isSelected: boolean;
  onRegionClick: (regionName: string) => void;
}> = ({ region, isSelected, onRegionClick }) => {
  // Create custom icon based on selection state
  const customIcon = L.divIcon({
    html: `<div style="
      width: 30px;
      height: 30px;
      background: ${isSelected ? '#2AB5B0' : '#36CFC9'};
      border: 3px solid ${isSelected ? '#0A2540' : 'white'};
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      transition: all 0.2s ease;
    "></div>`,
    className: 'custom-leaflet-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const handleClick = () => {
    onRegionClick(region.location);
  };

  return (
    <Marker
      position={region.coordinates}
      icon={customIcon}
      eventHandlers={{
        click: handleClick
      }}
    >
      <Popup>
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 mb-2">{region.location}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium">₱{(region.revenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transactions:</span>
              <span className="font-medium">{region.transactions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth:</span>
              <span className="font-medium text-green-600">+{region.growth}%</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export const GeoMap: React.FC = () => {
  const { barangays, setFilter } = useFilterStore();

  const handleRegionClick = (regionName: string) => {
    console.log('Region clicked:', regionName);
    // Cross-filter: clicking a region applies it as a filter
    const currentRegions = barangays.includes(regionName) 
      ? barangays.filter(r => r !== regionName)
      : [...barangays, regionName];
    setFilter('barangays', currentRegions);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Regional Performance Map</h3>
        <p className="text-sm text-gray-600">Click markers to filter data by region</p>
      </div>
      <div className="w-full h-96">
        <MapContainer
          center={[12.0, 122.0]} // Philippines center
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mockRegionData.map((region) => (
            <CustomMarker
              key={region.location}
              region={region}
              isSelected={barangays.includes(region.location)}
              onRegionClick={handleRegionClick}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
