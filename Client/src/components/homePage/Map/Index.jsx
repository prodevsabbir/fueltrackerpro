import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Fuel, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../../../context/LanguageContext';
import { stationService } from '../../../helpers/stationService';
import { MapSkeleton } from '../../shared/Skeleton';
import 'leaflet/dist/leaflet.css';

// Leaflet Icon Fixes
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const parseCoords = (location) => {
  if (!location?.coordinates) return null;
  const c = location.coordinates;
  if (Array.isArray(c)) {
    if (Number.isFinite(c[1]) && Number.isFinite(c[0])) return [c[1], c[0]];
  }
  if (typeof c === 'object' && Number.isFinite(c.lat) && Number.isFinite(c.lng)) {
    return [c.lat, c.lng];
  }
  return null;
};

const miniIcon = (status) => {
  const type = status === 'available' ? 'green' : (status === 'limited' ? 'amber' : 'red');
  const gradients = {
    green: { start: '#10b981', end: '#059669' },
    amber: { start: '#f59e0b', end: '#d97706' },
    red: { start: '#ef4444', end: '#b91c1c' }
  };
  const grad = gradients[type] || gradients.red;

  return new L.DivIcon({
    className: '',
    html: `
      <div class="flex flex-col items-center group">
        <div class="relative w-7 h-8 flex items-center justify-center drop-shadow-lg">
          <svg width="28" height="34" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 48C20 48 40 32.5 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 32.5 20 48 20 48Z" 
              fill="url(#grad_mini_v3_${type})" 
              stroke="white" stroke-width="2.5"/>
            <defs>
              <linearGradient id="grad_mini_v3_${type}" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="${grad.start}"/>
                <stop offset="100%" stop-color="${grad.end}"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="absolute top-[4px] left-0 w-full h-[20px] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c.011-.476.053-1.048.166-1.558C13.25 1.574 13.562 1 14.5 1s1.25.574 1.339 1.317c.113.51.155 1.082.166 1.558h1.495a.5.5 0 0 1 .5.5v2.625a.5.5 0 0 1-.5.5H17v.5a2.5 2.5 0 0 1-5 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5h.5V2zm2.5 2a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-3z"/>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [28, 34],
    iconAnchor: [14, 34],
  });
};

const userIcon = new L.DivIcon({
  className: '',
  html: `<div class="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"><div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const RecenterMap = ({ pos, stations }) => {
  const map = useMap();
  const initialFit = useRef(false);

  useEffect(() => { 
    if (!initialFit.current && pos && Number.isFinite(pos[0])) {
      try {
        const validStationCoords = (stations || [])
          .map(s => parseCoords(s.location))
          .filter(c => c !== null);

        if (validStationCoords.length > 0) {
          const bounds = L.latLngBounds([pos, ...validStationCoords]);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        } else {
          map.setView(pos, 13);
        }
        initialFit.current = true;
      } catch (e) {
        map.setView(pos, 13);
        initialFit.current = true;
      }
    }
  }, [pos, stations, map]);
  return null;
};

const MapView = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [stations, setStations] = useState([]);
  const defaultPos = [23.8103, 90.4125];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (Number.isFinite(lat)) {
            const coords = [lat, lng];
            setUserPos(coords);
            
            // 🗺️ REVERSE GEOCODING: Fetch current place name
            try {
              const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const geoData = await geoRes.json();
              const name = geoData.address.suburb || geoData.address.neighbourhood || geoData.address.city || geoData.address.state || "Nearby";
              setLocationName(name.toUpperCase());
            } catch (e) {
              setLocationName("NEARBY");
            }

            try {
              const data = await stationService.getNearbyStations(lat, lng, 10);
              setStations(data || []);
            } catch (e) {}
          } else {
            setUserPos(defaultPos);
          }
          setLoading(false);
        },
        () => {
          setUserPos(defaultPos);
          setLoading(false);
        }
      );
    } else {
      setUserPos(defaultPos);
      setLoading(false);
    }
  }, []);

  if (loading) return <MapSkeleton />;

  const mapCenter = (userPos && Number.isFinite(userPos[0])) ? userPos : defaultPos;

  return (
    <div className="relative w-full h-[600px] md:h-[450px] rounded-[32px] overflow-hidden bg-slate-100 border border-slate-200 shadow-xl group cursor-pointer animate-in fade-in duration-500">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        className="w-full h-full"
        zoomControl={false}
        dragging={true}
        scrollWheelZoom={false}
        doubleClickZoom={true}
      >
        <TileLayer 
          url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          attribution='&copy; Google Maps'
        />
        
        <Circle 
          center={mapCenter} 
          radius={5000} 
          pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.1, color: '#3b82f6', weight: 1, dashArray: '5, 5' }} 
        />

        <RecenterMap pos={userPos} stations={stations} />
        
        {userPos && Number.isFinite(userPos[0]) && <Marker position={userPos} icon={userIcon} />}
        
        {stations.map(s => {
          const pos = parseCoords(s.location);
          if (!pos) return null;
          return (
            <Marker key={s._id} position={pos} icon={miniIcon(s.status)} />
          );
        })}
      </MapContainer>
      
      <div 
        onClick={() => navigate('/map')}
        className="absolute bottom-6 left-6 right-6 md:right-auto px-5 py-3 bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98] z-[400] flex items-center justify-between md:justify-start md:gap-4 cursor-pointer"
      >
        <div className="flex flex-col">
           <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{locationName || t.map?.location || "DHAKA NORTH"}</span>
           </div>
           <p className="text-[11px] text-slate-900 font-black leading-tight uppercase tracking-widest">
             {stations.length > 0 ? `${stations.length} verified pumps` : t.map?.pumpsCount || "Searching stations..."}
           </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block h-8 w-px bg-slate-100"></div>
          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg transition-transform group-hover:scale-110">
             <Maximize2 size={14} />
          </div>
        </div>
      </div>

      <div className="absolute top-6 left-6 z-[400]">
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2.5">
           <div className="relative w-1.5 h-1.5 bg-amber-500 rounded-full">
              <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-60"></div>
           </div>
           {t.hero?.live || "LIVE UPDATES"}
        </div>
      </div>
    </div>
  );
};

export default MapView;
