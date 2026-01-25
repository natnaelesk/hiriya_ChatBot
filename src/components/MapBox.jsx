import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React from "react";

// Fix Leaflet default icon path issues
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Ambo University coordinates (Main Campus)
const AMBO_COORDS = {
  main: { lat: 8.9833, lng: 38.7361 },
  techno: { lat: 8.9867, lng: 38.7319 },
  guder: { lat: 9.0817, lng: 37.7683 },
  woliso: { lat: 8.5333, lng: 37.9667 }
};

// Extract coordinates from Google Maps URL
const extractCoordinatesFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  const patterns = [
    /@([-0-9.]+),([-0-9.]+)/,
    /\/place\/[^/]+\/@([-0-9.]+),([-0-9.]+)/,
    /\/@([-0-9.]+),([-0-9.]+),/,
    /[?&]q=([-0-9.]+)%2C([-0-9.]+)/,
    /([-0-9.]+)[, ]+([-0-9.]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng };
      }
    }
  }
  
  return null;
};

// Determine which campus from the location name
const getCampusFromName = (locationName) => {
  if (!locationName || typeof locationName !== 'string') return 'main';
  
  const name = locationName.toLowerCase();
  if (name.includes('main') || name.includes('health') || name.includes('social')) return 'main';
  if (name.includes('techno') || name.includes('hachalu') || name.includes('hundesa')) return 'techno';
  if (name.includes('guder') || name.includes('mamo') || name.includes('mezemir')) return 'guder';
  if (name.includes('woliso') || name.includes('auwc')) return 'woliso';
  return 'main';
};

function MapBox({ mapUrl, locationName = "Ambo University Location" }) {
  if (!mapUrl || typeof mapUrl !== 'string') return null;

  // Try to extract coordinates
  let coords = extractCoordinatesFromUrl(mapUrl);
  
  // If no coordinates found, use campus approximation
  if (!coords) {
    const campus = getCampusFromName(locationName);
    coords = AMBO_COORDS[campus] || AMBO_COORDS.main;
  }

  const { lat, lng } = coords;

  return (
    <div className="w-full h-[350px] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 mt-3 shadow-lg">
      <MapContainer
        center={[lat, lng]}
        zoom={17}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ borderRadius: '8px' }}
      >
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          minZoom={10}
        />
        
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          opacity={0.5}
          maxZoom={19}
        />

        <Marker position={[lat, lng]}>
          <Popup>
            <div className="font-medium text-sm">
              📍 {locationName}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
            </div>
            <div className="mt-2 space-y-1">
              <a 
                href={mapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Open in Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        <span>🛰</span> Satellite View
      </div>
    </div>
  );
}

export default MapBox;