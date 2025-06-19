
// Simplified GeoJSON data for Philippine regions
// This is a simplified version for demonstration - in production, you'd use official PSA boundaries
export const philippineRegionsGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Metro Manila",
        "region_code": "NCR"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [120.9, 14.5], [121.1, 14.5], [121.1, 14.7], [120.9, 14.7], [120.9, 14.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "CALABARZON",
        "region_code": "CAL"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [120.8, 13.8], [122.0, 13.8], [122.0, 14.5], [120.8, 14.5], [120.8, 13.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Central Luzon",
        "region_code": "CL"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [120.2, 14.8], [121.5, 14.8], [121.5, 16.0], [120.2, 16.0], [120.2, 14.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Cebu",
        "region_code": "VII"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [123.5, 9.8], [124.2, 9.8], [124.2, 10.8], [123.5, 10.8], [123.5, 9.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Davao",
        "region_code": "XI"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [124.8, 6.5], [126.0, 6.5], [126.0, 7.8], [124.8, 7.8], [124.8, 6.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Iloilo",
        "region_code": "VI"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [120.2, 10.2], [121.5, 10.2], [121.5, 11.2], [120.2, 11.2], [120.2, 10.2]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Baguio",
        "region_code": "CAR"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [120.2, 16.0], [121.2, 16.0], [121.2, 17.0], [120.2, 17.0], [120.2, 16.0]
        ]]
      }
    }
  ]
};
