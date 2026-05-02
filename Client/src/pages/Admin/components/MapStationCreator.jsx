import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, MapPin, Search, Loader2, Camera, ChevronDown, Save, Plus, Trash2, Globe, Navigation2, Target } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import { stationService } from '../../../helpers/stationService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { BsFillFuelPumpFill } from 'react-icons/bs';
import 'leaflet/dist/leaflet.css';

// Leaflet Icon Fixes
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const FUEL_TYPES = ['Octane', 'Diesel', 'Petrol', 'CNG', 'LPG', 'EV Charging', 'Kerosene', 'Others'];
const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const fetchOverpass = async (query) => {
  const body = new URLSearchParams({ data: query }).toString();
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Accept: '*/*',
        },
        body,
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Overpass ${response.status}${errText ? `: ${errText.slice(0, 180)}` : ''}`);
      }
      const text = await response.text();
      return JSON.parse(text);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Overpass unavailable');
};

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

const createMarkerIcon = (status, isUnverified = false, type = 'fuel') => {
  let colorType = isUnverified ? 'orange' : (status === 'available' ? 'green' : (status === 'limited' ? 'amber' : 'red'));
  
  if (status === 'admin_picker') {
    return new L.DivIcon({
      className: '',
      html: `
        <div class="flex flex-col items-center group">
          <div class="relative w-12 h-14 flex items-center justify-center transition-all hover:scale-110 drop-shadow-2xl">
            <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 56C24 56 48 37.5 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.5 24 56 24 56Z" 
                fill="url(#grad_admin_elite_v39)" 
                stroke="white" stroke-width="3"/>
              <defs>
                <linearGradient id="grad_admin_elite_v39" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#3b82f6"/>
                  <stop offset="100%" stop-color="#1d4ed8"/>
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute top-[8px] left-0 w-full h-[36px] flex items-center justify-center text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
          </div>
        </div>
      `,
      iconSize: [48, 56],
      iconAnchor: [24, 56],
    });
  }

  const gradients = {
    orange: { start: '#f97316', end: '#ea580c' },
    green: { start: '#10b981', end: '#059669' },
    amber: { start: '#f59e0b', end: '#d97706' },
    red: { start: '#ef4444', end: '#b91c1c' }
  };
  const grad = gradients[colorType] || gradients.green;

  return new L.DivIcon({
    className: '',
    html: `
      <div class="flex flex-col items-center">
        <div class="relative w-10 h-12 flex items-center justify-center transition-all hover:scale-110 drop-shadow-xl">
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 48C20 48 40 32.5 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 32.5 20 48 20 48Z" 
              fill="url(#grad_admin_v39_${colorType})" 
              stroke="white" stroke-width="2"/>
            <defs>
              <linearGradient id="grad_admin_v39_${colorType}" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="${grad.start}"/>
                <stop offset="100%" stop-color="${grad.end}"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="absolute top-[6px] left-0 w-full h-[32px] flex items-center justify-center text-white">
            ${type === 'fuel' ? '<svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c.011-.476.053-1.048.166-1.558C13.25 1.574 13.562 1 14.5 1s1.25.574 1.339 1.317c.113.51.155 1.082.166 1.558h1.495a.5.5 0 0 1 .5.5v2.625a.5.5 0 0 1-.5.5H17v.5a2.5 2.5 0 0 1-5 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5h.5V2zm2.5 2a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-3z"/></svg>' : 
              (type === 'charging' ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"/><line x1="23" y1="13" x2="23" y2="11"/><polyline points="11 6 7 12 13 12 9 18"/></svg>' : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>')}
          </div>
          ${isUnverified ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-sm border border-orange-100"><span class="text-[8px] font-black">?</span></div>' : ''}
        </div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
  });
};

const MiniMapPicker = ({ position, onPick, onStartFetching, verified, unverified, radius, hasPicked }) => {
  const map = useMap();
  useMapEvents({
    click: async (e) => {
       const lat = e.latlng.lat;
       const lng = e.latlng.lng;
       onStartFetching?.(lat, lng);
       try {
         const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
         const data = await res.json();
         const addr = data.address || {};
         const street = data.display_name.split(',')[0] || '';
         const subArea = addr.suburb || addr.neighbourhood || addr.village || addr.subdistrict || '';
         const area = addr.county || addr.district || addr.state_district || '';
         const city = addr.city || addr.town || addr.state || '';
         onPick(lat, lng, { street, subArea, area, city });
       } catch (err) {
         onPick(lat, lng, null);
       }
    }
  });
  
  useEffect(() => { 
    if (position && Number.isFinite(position[0])) {
      map.setView(position, 16);
    }
  }, [position, map]);

  return (
    <>
      {hasPicked && position && Number.isFinite(position[0]) && <Circle center={position} radius={radius * 1000} pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.1, color: '#3b82f6', weight: 1.5, dashArray: '6, 6' }} />}
      {hasPicked && position && Number.isFinite(position[0]) && <Marker position={position} icon={createMarkerIcon('admin_picker')} zIndexOffset={3000} />}
      
      {verified?.map(s => (
        <Marker key={s._id} position={s.coords} icon={createMarkerIcon(s.status, false, 'fuel')}>
           <Popup className="premium-popup-admin">
             <div className="p-3">
               <h3 className="font-black text-sm text-slate-900">{s.name}</h3>
               <p className="text-[10px] font-bold text-green-500 uppercase mt-1">DATABASE RECORD</p>
             </div>
           </Popup>
        </Marker>
      ))}

      {unverified?.map(d => (
        <Marker key={d.id} position={[d.lat, d.lng]} icon={createMarkerIcon('discovered', true, d.type)} eventHandlers={{ click: () => onPick(d.lat, d.lng, { street: d.address, subArea: d.subArea, area: d.area, city: d.city, name: d.name }) }}>
           <Popup className="premium-popup-admin">
             <div className="p-3">
               <h3 className="font-black text-sm text-slate-900">{d.name}</h3>
               <p className="text-[10px] font-bold text-orange-500 uppercase mt-1">DISCOVERED (OVERPASS)</p>
               <div className="mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-500 leading-tight">📍 {d.address}</p>
               </div>
               <p className="text-[8px] font-black text-slate-400 uppercase mt-2 text-center tracking-widest">Auto-Filling Metadata...</p>
             </div>
           </Popup>
        </Marker>
      ))}
    </>
  );
};

const MapStationCreator = ({ isOpen, onClose, onCreated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [radius, setRadius] = useState(5);
  const [stations, setStations] = useState([]);
  const [unverified, setUnverified] = useState([]);
  const [hasPickedLocation, setHasPickedLocation] = useState(false);
  
  const [station, setStation] = useState({
    name: '',
    status: 'available',
    primaryFuel: 'Octane',
    address: '',
    subArea: '',
    area: '',
    city: '',
    lat: 23.8103,
    lng: 90.4125,
    fuels: [
      { type: 'Octane', price: '130', status: 'available' },
      { type: 'Diesel', price: '110', status: 'available' },
      { type: 'Petrol', price: '125', status: 'available' },
      { type: 'CNG', price: '43', status: 'available' }
    ]
  });

  const lastFetchTime = useRef(0);
  const lastExtractedCoords = useRef({ lat: 0, lng: 0 });

  const handleForceClose = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onClose) onClose();
  }, [onClose]);

  const fetchNearby = useCallback(async (lat, lng) => {
    if (!Number.isFinite(lat)) return;
    try {
      const data = await stationService.getNearbyStations(lat, lng, 10); 
      setStations(data.map(s => ({ ...s, coords: parseCoords(s.location) })));
    } catch (err) {}
  }, []);

  const fetchUnverified = useCallback(async (centerLat, centerLng) => {
    if (!Number.isFinite(centerLat)) return;
    const now = Date.now();
    if (now - lastFetchTime.current < 5000) return;
    lastFetchTime.current = now;
    
    fetchNearby(centerLat, centerLng);
    const radiusMeters = (radius + 5) * 1000;
    const query = `[out:json][timeout:25];(node["amenity"~"fuel|charging_station|car_repair"](around:${radiusMeters},${centerLat},${centerLng});way["amenity"~"fuel|charging_station|car_repair"](around:${radiusMeters},${centerLat},${centerLng}););out center;`;
    try {
      const data = await fetchOverpass(query);
      const disc = (data.elements || [])
        .map(e => ({ 
          id: e.id, 
          lat: e.lat || e.center?.lat, 
          lng: e.lon || e.center?.lon, 
          name: e.tags?.name || 'Unregistered Station', 
          address: e.tags?.['addr:street'] || e.tags?.name || 'Tap map to pick details',
          type: e.tags?.amenity === 'charging_station' ? 'charging' : (e.tags?.amenity === 'car_repair' ? 'repair' : 'fuel'),
          subArea: e.tags?.['addr:suburb'] || e.tags?.['addr:neighbourhood'] || '',
          area: e.tags?.['addr:district'] || e.tags?.['addr:county'] || '',
          city: e.tags?.['addr:city'] || e.tags?.['addr:town'] || e.tags?.['addr:state'] || ''
        }));
      setUnverified(disc);
    } catch (err) {}
  }, [radius, fetchNearby]);

  useEffect(() => {
    if (isOpen) {
      fetchUnverified(station.lat, station.lng);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hasPickedLocation || !isOpen) return;
    
    if (Math.abs(station.lat - lastExtractedCoords.current.lat) < 0.00001 && 
        Math.abs(station.lng - lastExtractedCoords.current.lng) < 0.00001) {
      return;
    }

    const triggerDeepExtraction = async () => {
      setFetchingAddress(true);
      lastExtractedCoords.current = { lat: station.lat, lng: station.lng };
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${station.lat}&lon=${station.lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        const addr = data.address || {};
        const street = data.display_name.split(',')[0] || '';
        const subArea = addr.suburb || addr.neighbourhood || addr.village || addr.subdistrict || '';
        const area = addr.county || addr.district || addr.state_district || '';
        const city = addr.city || addr.town || addr.state || '';
        
        setStation(prev => ({ 
          ...prev, 
          address: street, 
          subArea, 
          area, 
          city 
        }));
        fetchUnverified(station.lat, station.lng);
      } catch (err) {} finally { setFetchingAddress(false); }
    };

    triggerDeepExtraction();
  }, [station.lat, station.lng, hasPickedLocation, isOpen]);

  const addNewItem = () => {
    const usedTypes = station.fuels.map(f => f.type);
    const availableType = FUEL_TYPES.find(t => !usedTypes.includes(t)) || 'Others';
    if (usedTypes.includes(availableType) && availableType !== 'Others') {
       toast.warning("All standard fuel types are already added!");
       return;
    }
    setStation(prev => ({ ...prev, fuels: [...prev.fuels, { type: availableType, price: '0', status: 'available' }] }));
  };

  const handleSave = async () => {
    if (!hasPickedLocation) {
       toast.error("Please select a location on the map first!");
       return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', station.name);
      fd.append('status', station.status);
      fd.append('coordinates[lat]', station.lat.toString());
      fd.append('coordinates[lng]', station.lng.toString());
      fd.append('subArea', station.subArea);
      fd.append('area', station.area);
      fd.append('city', station.city);
      fd.append('location', JSON.stringify({ 
        address: station.address, 
        subArea: station.subArea,
        area: station.area,
        city: station.city,
        coordinates: {
          lat: station.lat,
          lng: station.lng
        },
        geo: { type: "Point", coordinates: [station.lng, station.lat] }
      }));
      fd.append('fuels', JSON.stringify(station.fuels));
      fd.append('primaryCategory', station.primaryFuel);
      await stationService.createStation(fd);
      toast.success('Station Created Successfully!');
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error('Failed to create station');
    } finally { setSubmitting(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="bg-white w-full max-w-[90vw] h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col border border-white/20"
          >
            {/* Header */}
            <div className="relative z-[50] bg-[#5c4033] px-10 py-6 flex items-center justify-between text-white border-b border-white/10 shadow-lg">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-amber-500/40"><BsFillFuelPumpFill size={30} /></div>
                <div><h3 className="text-2xl font-black tracking-tight">Elite Admin Creator</h3><p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Smart Interaction Active</p></div>
              </div>
              <button 
                type="button"
                onClick={handleForceClose} 
                className="w-12 h-12 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl flex items-center justify-center transition-all cursor-pointer group pointer-events-auto shadow-inner"
              >
                <X size={24} className="group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>

            {/* Split Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Map Picker */}
              <div className="w-[60%] relative bg-slate-100">
                <MapContainer center={[station.lat, station.lng]} zoom={13} className="h-full w-full" zoomControl={false}>
                  <TileLayer url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']} />
                  <MiniMapPicker 
                    position={[station.lat, station.lng]} 
                    radius={radius}
                    hasPicked={hasPickedLocation}
                    verified={stations}
                    unverified={unverified}
                    onStartFetching={(lat, lng) => {
                      setHasPickedLocation(true);
                      setFetchingAddress(true);
                      setStation(prev => ({ ...prev, lat, lng, address: 'Extracting...' }));
                    }}
                    onPick={(lat, lng, geoData) => {
                      setHasPickedLocation(true);
                      setStation(prev => ({ ...prev, name: geoData.name || prev.name, lat, lng }));
                  }} />
                </MapContainer>
                
                {/* Radius Control */}
                <div className="absolute top-6 left-6 z-[1000] bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-slate-100 min-w-[200px]">
                   <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligence Radius</span><span className="text-sm font-black text-amber-500">{radius}KM</span></div>
                   <input type="range" min="1" max="25" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-amber-500 h-2 cursor-pointer" />
                </div>
                
                {!hasPickedLocation && (
                  <div className="absolute inset-0 z-[2000] bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <div className="bg-white/95 px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-bounce border border-slate-200">
                       <Target className="text-blue-500" size={24} />
                       <span className="text-sm font-black text-slate-900 uppercase tracking-widest">CLICK MAP TO START</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Data Panel */}
              <div className="w-[40%] bg-white overflow-y-auto p-10 space-y-10 scrollbar-hide">
                <div className="space-y-4"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Station Image</h4><div className="flex items-center gap-6"><div className="w-24 h-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300"><Camera size={32} /></div><button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm">+ Upload Photo</button></div></div>
                <div className="space-y-4"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Basic Information</h4><div className="space-y-6"><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Station Name</label><input type="text" value={station.name} onChange={(e) => setStation(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Enter station name..." /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Status</label><select value={station.status} onChange={(e) => setStation(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none"><option value="available">Available</option><option value="limited">Limited</option><option value="closed">Closed</option></select></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Primary Fuel</label><select value={station.primaryFuel} onChange={(e) => setStation(prev => ({ ...prev, primaryFuel: e.target.value }))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none"><option value="Octane">Octane</option><option value="Diesel">Diesel</option><option value="Petrol">Petrol</option><option value="CNG">CNG</option></select></div></div></div></div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location Details</h4><span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Live Data Sync Active</span></div>
                  
                  {/* GPS COORDINATE INDICATOR */}
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                     {hasPickedLocation ? (
                       <>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white"><MapPin size={16} /></div>
                            <div><p className="text-[10px] font-black text-slate-900 uppercase">{station.lat.toFixed(6)}, {station.lng.toFixed(6)}</p><p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">GPS POSITION SET</p></div>
                         </div>
                         {fetchingAddress && <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-amber-200"><Loader2 size={10} className="text-amber-500 animate-spin" /><span className="text-[8px] font-black text-amber-500 uppercase">Updating...</span></div>}
                       </>
                     ) : (
                       <div className="flex items-center gap-3 text-slate-400">
                          <Target size={16} />
                          <span className="text-[10px] font-black uppercase italic tracking-widest">Pick a spot on the map...</span>
                       </div>
                     )}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Street Address</label><input type="text" value={fetchingAddress ? 'Deep Fetching Address...' : station.address} onChange={(e) => setStation(prev => ({ ...prev, address: e.target.value }))} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all ${fetchingAddress ? 'bg-slate-50 border-amber-100 text-amber-500 italic' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-2 focus:ring-amber-500/20'}`} placeholder="Click map to pick address..." /></div>
                    <div className="grid grid-cols-3 gap-3">
                       <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase">Sub Area</label><input type="text" value={station.subArea} onChange={(e) => setStation(prev => ({ ...prev, subArea: e.target.value }))} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none" placeholder="Sub-Area" /></div>
                       <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase">Area</label><input type="text" value={station.area} onChange={(e) => setStation(prev => ({ ...prev, area: e.target.value }))} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none" placeholder="Area" /></div>
                       <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase">City</label><input type="text" value={station.city} onChange={(e) => setStation(prev => ({ ...prev, city: e.target.value }))} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none" placeholder="City" /></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fuel Inventory</h4><button onClick={addNewItem} className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl text-[9px] font-black uppercase text-white shadow-lg"><Plus size={12} /> Add Item</button></div>
                  <div className="space-y-3">
                    {station.fuels.map((fuel, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 relative">
                        <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center text-white font-black text-xs">{fuel.type[0]}</div>
                        <div className="flex-1 min-w-0">
                          <select value={fuel.type} onChange={(e) => { const n = [...station.fuels]; n[idx].type = e.target.value; setStation(prev => ({ ...prev, fuels: n })); }} className="bg-transparent border-none outline-none text-[9px] font-black text-slate-400 uppercase w-full cursor-pointer appearance-none">
                            {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex-1 bg-white rounded-lg px-3 py-1.5 border border-slate-100 flex items-center gap-2">
                              <span className="text-slate-300 font-bold text-xs">৳</span>
                              <input type="text" value={fuel.price} onChange={(e) => { const n = [...station.fuels]; n[idx].price = e.target.value; setStation(prev => ({ ...prev, fuels: n })); }} className="w-full border-none outline-none text-xs font-black text-slate-700 bg-transparent" />
                            </div>
                          </div>
                        </div>
                        <button onClick={() => { const n = station.fuels.filter((_, i) => i !== idx); setStation(prev => ({ ...prev, fuels: n })); }} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-[50] p-8 border-t border-slate-100 flex items-center justify-end gap-6 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <button 
                type="button"
                onClick={handleForceClose} 
                className="px-10 py-4 rounded-2xl border border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest hover:bg-slate-50 active:scale-95 transition-all cursor-pointer pointer-events-auto shadow-sm"
              >
                Cancel
              </button>
              <button onClick={handleSave} disabled={submitting} className="px-12 py-4 rounded-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-amber-500/40 hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 pointer-events-auto">{submitting ? <Loader2 size={16} className="animate-spin" /> : <><Globe size={16} /> Create Station</>}</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MapStationCreator;
