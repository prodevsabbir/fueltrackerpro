import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Fuel, MapPin, Search, Loader2, Info, Navigation2, Plus, CheckCircle2, Map as MapIcon, Users, BatteryCharging, Wrench, ShieldAlert, Camera, ChevronDown, Save, Trash2, Globe, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { stationService } from '../../helpers/stationService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

const fetchOverpass = async (query) => {
  const body = new URLSearchParams({ data: query }).toString();
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Accept: 'application/json',
        },
        body,
      });
      if (!response.ok) {
        throw new Error(`Overpass ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Overpass unavailable');
};

const FUEL_TYPES = ['Octane', 'Diesel', 'Petrol', 'CNG', 'LPG', 'EV Charging', 'Kerosene', 'Others'];

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

const createMarkerIcon = (status, isUnverified = false, type = 'fuel', isMobile = false) => {
  const size = isMobile ? { w: 30, h: 36, icon: 16 } : { w: 40, h: 48, icon: 22 };
  // 🟢 DATABASE INTELLIGENCE: Existing stations always show as green to distinguish from discovery mode
  let colorType = isUnverified ? 'orange' : 'green';
  
  if (!isUnverified) {
    const s = status?.toLowerCase();
    if (s === 'limited') colorType = 'amber';
    if (s === 'out' || s === 'out of stock' || s === 'closed') colorType = 'red';
  }

  const gradients = {
    orange: { start: '#f59e0b', end: '#ef4444' },
    green: { start: '#10b981', end: '#059669' },
    amber: { start: '#f59e0b', end: '#d97706' },
    red: { start: '#ef4444', end: '#b91c1c' }
  };
  const grad = gradients[colorType] || gradients.green;
  const stableId = isUnverified ? `grad_disc_${status}` : `grad_live_${status}`; // Group gradients by status to minimize DOM overhead

  return new L.DivIcon({
    className: '',
    html: `
      <div class="flex flex-col items-center group">
        <div class="relative flex items-center justify-center transition-all hover:scale-110 drop-shadow-xl" style="width: ${size.w}px; height: ${size.h}px;">
          <svg width="${size.w}" height="${size.h}" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 48C20 48 40 32.5 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 32.5 20 48 20 48Z" 
              fill="url(#${stableId})" 
              stroke="white" stroke-width="2"/>
            <defs>
              <linearGradient id="${stableId}" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="${grad.start}"/>
                <stop offset="100%" stop-color="${grad.end}"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="absolute left-0 w-full flex items-center justify-center text-white" style="top: ${isMobile ? 4 : 6}px; height: ${isMobile ? 24 : 32}px;">
            ${type === 'fuel' ? `<svg width="${size.icon}" height="${size.icon}" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c.011-.476.053-1.048.166-1.558C13.25 1.574 13.562 1 14.5 1s1.25.574 1.339 1.317c.113.51.155 1.082.166 1.558h1.495a.5.5 0 0 1 .5.5v2.625a.5.5 0 0 1-.5.5H17v.5a2.5 2.5 0 0 1-5 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5h.5V2zm2.5 2a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-3z"/></svg>` : 
              (type === 'charging' ? `<svg width="${size.icon}" height="${size.icon}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"/><line x1="23" y1="13" x2="23" y2="11"/><polyline points="11 6 7 12 13 12 9 18"/></svg>` : `<svg width="${size.icon}" height="${size.icon}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`)}
          </div>
          ${isUnverified ? `<div class="absolute -top-1 -right-1 flex items-center justify-center bg-white rounded-full text-orange-500 shadow-sm border border-orange-100" style="width: ${isMobile ? 12 : 16}px; height: ${isMobile ? 12 : 16}px;"><span style="font-size: ${isMobile ? 6 : 8}px; font-weight: 900;">?</span></div>` : ''}
        </div>
      </div>
    `,
    iconSize: [size.w, size.h],
    iconAnchor: [size.w / 2, size.h],
    popupAnchor: [0, -size.h],
  });
};

const createUserIcon = (isMobile = false, isPinned = false) => {
  const size = isMobile ? 30 : 40;
  const svgSize = isMobile ? 18 : 24;
  const color = isPinned ? '#f59e0b' : '#3b82f6';
  const pingColor = isPinned ? 'bg-amber-500' : 'bg-blue-500';
  const borderColor = isPinned ? 'border-amber-500' : 'border-blue-500';

  return new L.DivIcon({
    className: '',
    html: `
      <div class="relative">
        <div class="absolute inset-0 ${pingColor} rounded-full animate-ping opacity-25 scale-150"></div>
        <div class="relative w-${isMobile ? '8' : '10'} h-${isMobile ? '8' : '10'} bg-white rounded-full shadow-2xl flex items-center justify-center border-2 ${borderColor}">
          <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.9A2 2 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        ${isPinned ? '<div class="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce"><span class="text-[8px] font-black text-white">PIN</span></div>' : ''}
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${pingColor} rounded-full border border-white"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};


const MapController = ({ userPos, onMapMove }) => {
  const map = useMap();
  const hasArrived = useRef(false);

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onMapMove(center.lat, center.lng);
    }
  });

  useEffect(() => {
    if (!hasArrived.current && userPos && Number.isFinite(userPos[0])) {
      map.flyTo(userPos, 15, { duration: 2 });
      hasArrived.current = true;
    }
  }, [userPos, map]);

  useEffect(() => {
    setTimeout(() => { map.invalidateSize(); }, 250);
    const handleFlyTo = (e) => { if (e.detail && Number.isFinite(e.detail[0])) map.flyTo(e.detail, 15); };
    window.addEventListener('fly-to', handleFlyTo);
    return () => window.removeEventListener('fly-to', handleFlyTo);
  }, [map]);
  return null;
};

// MINI MAP PICKER COMPONENT
const MiniMapPicker = ({ position, onPick, onStartFetching, isMobile = false }) => {
  const map = useMap();
  useMapEvents({
    click: async (e) => {
       const lat = e.latlng.lat;
       const lng = e.latlng.lng;
       onStartFetching?.(lat, lng);
       try {
         const res = await fetch(`${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}`);
         const data = await res.json();
         const addr = data.address || {};
         const street = data.display_name.split(',')[0] || '';
         const subArea = addr.suburb || addr.neighbourhood || addr.village || '';
         const area = addr.county || addr.district || '';
         const city = addr.city || addr.town || addr.state || '';
         onPick(lat, lng, { street, subArea, area, city });
       } catch (err) {
         onPick(lat, lng, null);
       }
    }
  });
  useEffect(() => { if (position) map.setView(position, 16); }, [position, map]);
  return position ? <Marker position={position} icon={createMarkerIcon('available', false, 'fuel', isMobile)} /> : null;
};

const MapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [userPos, setUserPos] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stations, setStations] = useState([]);
  const [riders, setRiders] = useState({});
  const [unverified, setUnverified] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [showControls, setShowControls] = useState(window.innerWidth > 768); // Hidden by default on mobile
  
  const [consoleModal, setConsoleModal] = useState({ 
    open: false, 
    mode: 'create',
    station: null 
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selfPinExpiry, setSelfPinExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const lastFetchTime = useRef(0);
  const initialFetchDone = useRef(false);
  const userPosRef = useRef(null);
  const radiusRef = useRef(5);

  useEffect(() => { userPosRef.current = userPos; }, [userPos]);
  useEffect(() => { radiusRef.current = radius; }, [radius]);


  // 🔄 UNIFIED DATA ORCHESTRATION: Fetch everything in a coordinated flow
  const refreshMapData = useCallback(async (lat, lng, bypassThrottle = false) => {
    if (!Number.isFinite(lat)) return;
    const now = Date.now();
    if (!bypassThrottle && initialFetchDone.current && now - lastFetchTime.current < 5000) return;
    lastFetchTime.current = now;
    initialFetchDone.current = true;

    setLoading(true);
    try {
      // 1. Parallel Fetch: Get DB stations and External discoveries at the same time
      const [dbResult, overpassResponse] = await Promise.allSettled([
        stationService.getNearbyStations(lat, lng, 20),
        fetchOverpass(
          `[out:json][timeout:25];(node["amenity"~"fuel|charging_station|car_repair"](around:${(radius + 5) * 1000},${lat},${lng});way["amenity"~"fuel|charging_station|car_repair"](around:${(radius + 5) * 1000},${lat},${lng}););out center;`
        )
      ]);

      const freshStations = dbResult.status === 'fulfilled' ? dbResult.value : [];
      const overpassData = overpassResponse.status === 'fulfilled' ? overpassResponse.value : { elements: [] };

      // 2. Immediate Filtering: Process discoveries against the FRESH database stations
      const discovered = (overpassData.elements || [])
        .map(e => ({ 
          id: e.id, 
          lat: e.lat || e.center?.lat, 
          lng: e.lon || e.center?.lon, 
          name: e.tags?.name || (e.tags?.amenity === 'charging_station' ? 'Charging Point' : (e.tags?.amenity === 'car_repair' ? 'Service Center' : 'Unregistered Station')), 
          address: e.tags?.['addr:street'] || e.tags?.name || 'Tap map to pick details',
          type: e.tags?.amenity === 'charging_station' ? 'charging' : (e.tags?.amenity === 'car_repair' ? 'repair' : 'fuel'),
          subArea: e.tags?.['addr:suburb'] || e.tags?.['addr:neighbourhood'] || '',
          area: e.tags?.['addr:district'] || e.tags?.['addr:county'] || '',
          city: e.tags?.['addr:city'] || e.tags?.['addr:town'] || e.tags?.['addr:state'] || ''
        }))
        .filter(d => !freshStations.some(s => {
          const p = parseCoords(s.location);
          return p && L.latLng(d.lat, d.lng).distanceTo(L.latLng(p[0], p[1])) < 100;
        }));

      // 3. Atomic State Update: Push both sets to UI at the exact same moment
      setStations(prev => {
        const combined = [...freshStations];
        prev.forEach(p => { if (!combined.some(c => c._id === p._id)) combined.push(p); });
        return combined;
      });

      setUnverified(prev => {
        const combined = [...discovered];
        prev.forEach(p => { 
          if (!combined.some(c => c.id === p.id) && !freshStations.some(s => {
            const coords = parseCoords(s.location);
            return coords && L.latLng(p.lat, p.lng).distanceTo(L.latLng(coords[0], coords[1])) < 100;
          })) {
            combined.push(p); 
          }
        });
        return combined;
      });

    } catch (err) {
      console.error("Map sync failed", err);
    } finally {
      setLoading(false);
    }
  }, [radius]);

  const refreshMapDataRef = useRef(refreshMapData);
  useEffect(() => { refreshMapDataRef.current = refreshMapData; }, [refreshMapData]);


  // 🗺️ NAVIGATION INTELLIGENCE: Handle incoming location state
  useEffect(() => {
    if (location.state?.center) {
       const [lat, lng] = location.state.center;
       window.dispatchEvent(new CustomEvent('fly-to', { detail: [lat, lng] }));
       refreshMapData(lat, lng, true);
    }
  }, [location.state, refreshMapData]);

  // COORDINATE WATCHER EFFECT: BULLETPROOF AUTOMATION
  useEffect(() => {
    if (!consoleModal.open || !consoleModal.station?.lat || fetchingAddress) return;

    const performDeepExtraction = async () => {
      setFetchingAddress(true);
      try {
        const res = await fetch(`${NOMINATIM_URL}/reverse?format=json&lat=${consoleModal.station.lat}&lon=${consoleModal.station.lng}`);
        const data = await res.json();
        const addr = data.address || {};
        const street = data.display_name.split(',')[0] || '';
        const subArea = addr.suburb || addr.neighbourhood || addr.village || '';
        const area = addr.county || addr.district || '';
        const city = addr.city || addr.town || addr.state || '';
        
        setConsoleModal(prev => {
          if (!prev.open) return prev;
          return {
            ...prev,
            station: { 
              ...prev.station, 
              address: street, 
              subArea, 
              area, 
              city 
            }
          };
        });
      } catch (err) {} finally {
        setFetchingAddress(false);
      }
    };

    if (consoleModal.station.address === 'Tap map to pick details' || consoleModal.station.address === 'Extracting...') {
      performDeepExtraction();
    }
  }, [consoleModal.open, consoleModal.station?.lat, consoleModal.station?.lng]);



  // 🧹 SYNC INTELLIGENCE: Keep unverified list clean
  useEffect(() => {
    if (stations.length > 0) {
      setUnverified(prev => prev.filter(p => !stations.some(s => {
        const coords = parseCoords(s.location);
        return coords && L.latLng(p.lat, p.lng).distanceTo(L.latLng(coords[0], coords[1])) < 100;
      })));
    }
  }, [stations]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length < 3) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=bd`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {} finally { setSearching(false); }
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    window.dispatchEvent(new CustomEvent('fly-to', { detail: [lat, lng] }));
    refreshMapData(lat, lng, true);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (Number.isFinite(lat)) { 
             const coords = [lat, lng];
             setUserPos(coords); 
             if (!initialFetchDone.current) refreshMapData(lat, lng, true);
          }
        },
        () => {},
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [refreshMapData]);

  const socketRef = useRef(null);

  const emitLocation = useCallback((socket) => {
    const pos = userPosRef.current;
    if (!pos || !user?._id) return;
    if (user?.role === 'admin') return;
    socket.emit('update_location', {
      userId: user._id,
      name: user?.name || user?.email?.split('@')[0] || 'Rider',
      role: user.role || 'rider',
      lat: pos[0],
      lng: pos[1],
      isPinned: !!selfPinExpiry
    });
  }, [user?._id, user?.name, user?.email, user?.role, selfPinExpiry]);

  useEffect(() => {
    if (!user?._id) return;
    const socket = io(SOCKET_URL, { 
      query: { userId: user._id, role: user.role || 'rider' }, 
      reconnection: true, 
      reconnectionAttempts: 5 
    });
    socketRef.current = socket;

    // Broadcast our location as soon as the socket is confirmed connected
    socket.on('connect', () => { emitLocation(socket); });
    
    socket.on('station_updated', () => { 
      const pos = userPosRef.current;
      if (pos) refreshMapDataRef.current(pos[0], pos[1], true); 
    });

    socket.on('user_location_changed', (data) => {
      if (data.userId && data.userId !== user._id && Number.isFinite(data.lat)) {
        setRiders(prev => ({ ...prev, [data.userId]: { ...data } }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, emitLocation]);

  // 📡 REAL-TIME BROADCAST: Push updated GPS position whenever it changes
  useEffect(() => {
    const socket = socketRef.current;
    // Admin location is private — never broadcast
    if (user?.role === 'admin') return;
    if (socket?.connected && userPos && Number.isFinite(userPos[0])) {
      socket.emit('update_location', {
        userId: user?._id,
        name: user?.name || user?.email?.split('@')[0] || 'Rider',
        role: user?.role || 'rider',
        lat: userPos[0],
        lng: userPos[1],
        isPinned: !!selfPinExpiry
      });
    }
  }, [userPos, user?._id, user?.name, user?.email, user?.role]);




  const filterBuffer = (items, isUnverified = false) => {
    if (!userPos) return [];
    const bufferMeters = (radius + 2) * 1000;
    return items.map(item => {
      const p = isUnverified ? [item.lat, item.lng] : parseCoords(item.location);
      if (!p) return { ...item, dist: Infinity };
      return { ...item, dist: L.latLng(p[0], p[1]).distanceTo(L.latLng(userPos[0], userPos[1])), coords: p };
    }).filter(i => i.dist <= bufferMeters);
  };

  const finalVerified = filterBuffer(stations);
  const finalUnverified = filterBuffer(unverified, true);

  const openDiscoveryConsole = (d) => {
    setConsoleModal({
      open: true,
      mode: 'create',
      station: {
        name: d.name,
        status: 'available',
        primaryFuel: 'Octane',
        address: 'Extracting...', 
        subArea: d.subArea || '',
        area: d.area || '',
        city: d.city || '',
        lat: d.lat,
        lng: d.lng,
        fuels: [
          { type: 'Octane', price: '130', status: 'available' },
          { type: 'Diesel', price: '110', status: 'available' },
          { type: 'Petrol', price: '125', status: 'available' },
          { type: 'CNG', price: '43', status: 'available' }
        ]
      }
    });
  };

  const addNewItem = () => {
    // DUPLICATION SHIELD: Find an unused fuel type
    const usedTypes = consoleModal.station.fuels.map(f => f.type);
    const availableType = FUEL_TYPES.find(t => !usedTypes.includes(t)) || 'Others';
    
    if (usedTypes.includes(availableType) && availableType !== 'Others') {
       toast.warning("All standard fuel types are already added!");
       return;
    }

    setConsoleModal(prev => ({
      ...prev,
      station: { ...prev.station, fuels: [...prev.station.fuels, { type: availableType, price: '0', status: 'available' }] }
    }));
  };

  const handleConsoleSave = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', consoleModal.station.name);
      fd.append('status', consoleModal.station.status);
      fd.append('coordinates[lat]', consoleModal.station.lat.toString());
      fd.append('coordinates[lng]', consoleModal.station.lng.toString());
      fd.append('subArea', consoleModal.station.subArea);
      fd.append('area', consoleModal.station.area);
      fd.append('city', consoleModal.station.city);
      fd.append('location', JSON.stringify({ 
        address: consoleModal.station.address, 
        subArea: consoleModal.station.subArea,
        area: consoleModal.station.area,
        city: consoleModal.station.city,
        coordinates: {
          lat: consoleModal.station.lat,
          lng: consoleModal.station.lng
        },
        geo: { type: "Point", coordinates: [consoleModal.station.lng, consoleModal.station.lat] }
      }));
      fd.append('fuels', JSON.stringify(consoleModal.station.fuels));
      fd.append('primaryCategory', consoleModal.station.primaryFuel);
      if (consoleModal.mode === 'create') {
        await stationService.createStation(fd);
        toast.success('Station Created Successfully!');
      }
      setConsoleModal({ open: false, mode: 'create', station: null });
      if (userPos) refreshMapData(userPos[0], userPos[1], true);
    } catch (err) {
      toast.error('Failed to save station');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed top-14 md:top-16 left-0 right-0 bottom-0 bg-white overflow-hidden z-[50]">
      <div className="w-full h-full relative overflow-hidden">
        <MapContainer center={[23.8103, 90.4125]} zoom={13} className="h-full w-full absolute inset-0" zoomControl={false} style={{ height: '100%', width: '100%', position: 'absolute' }}>
          <TileLayer url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']} attribution='&copy; Google Maps' />
          <MapController userPos={userPos} onMapMove={(lat, lng) => refreshMapData(lat, lng)} />
          {userPos && <Circle center={userPos} radius={radius * 1000} pathOptions={{ fillColor: selfPinExpiry ? '#f59e0b' : '#3b82f6', fillOpacity: 0.1, color: selfPinExpiry ? '#f59e0b' : '#3b82f6', weight: 2, dashArray: '8, 8' }} />}
          {userPos && <Marker position={userPos} icon={createUserIcon(isMobile, !!selfPinExpiry)} />}
          
          {/* ALL RIDERS - SHOW ADMINS EVERYTHING, RIDERS ONLY PINNED */}
          {Object.values(riders).map((rider, idx) => {
             const canSee = user?.role === 'admin' || rider.isPinned;
             if (!canSee) return null;
             return (
               <Marker key={idx} position={[rider.lat, rider.lng]} icon={createUserIcon(isMobile, rider.isPinned)}>
                  <Popup className="premium-popup">
                     <div className="p-2 text-center">
                        <p className="text-[10px] font-black uppercase text-slate-900">{rider.name}</p>
                        <p className={`text-[8px] font-bold uppercase ${rider.isPinned ? 'text-amber-500' : 'text-blue-500'}`}>
                          {rider.isPinned ? 'Network Broadcast' : 'Live Rider'}
                        </p>
                     </div>
                  </Popup>
               </Marker>
             );
          })}
          
          {/* VERIFIED STATIONS WITH HOVER INTEL - NOW INTERACTIVE */}
          {finalVerified.map(station => (
            <Marker 
              key={station._id} 
              position={station.coords} 
              icon={createMarkerIcon(station.status, false, 'fuel', isMobile)}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
              }}
            >
              <Popup className="premium-popup" closeButton={false}>
                <div className="p-4 space-y-2 min-w-[180px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Verified Station</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      station.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>{station.status}</span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-tight">{station.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <MapPin size={10} /> {station.location?.subArea || station.location?.area || 'Dhaka'}
                  </p>
                  <button 
                    onClick={() => navigate(`/stations/${station._id}`)} 
                    className="w-full mt-2 bg-slate-900 py-2.5 rounded-xl font-black uppercase text-[10px] text-white hover:bg-amber-500 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                  >
                    Tactical View
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* UNVERIFIED STATIONS WITH HOVER INTEL - NOW INTERACTIVE */}
          {finalUnverified?.map(d => (
            <Marker 
              key={d.id} 
              position={[d.lat, d.lng]} 
              icon={createMarkerIcon('discovered', true, d.type, isMobile)} 
              eventHandlers={{ 
                click: () => openDiscoveryConsole(d),
                mouseover: (e) => e.target.openPopup()
              }} 
            >
              <Popup className="premium-popup" closeButton={false}>
                <div className="p-4 space-y-2 min-w-[180px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Unverified Discovery</span>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-600">Pending</span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-tight">{d.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 truncate mb-2">{d.address}</p>
                  <button 
                    onClick={() => openDiscoveryConsole(d)} 
                    className="w-full mt-1 bg-amber-500 py-2 rounded-xl font-black uppercase text-[9px] text-white hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    Add to Network
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          <button onClick={() => userPos && window.dispatchEvent(new CustomEvent('fly-to', { detail: userPos }))} className="absolute bottom-10 left-6 z-[1000] w-14 h-14 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-slate-900 transition-all hover:scale-110 active:scale-95 group">
             <Navigation2 size={24} className="text-amber-500 group-hover:rotate-45 transition-transform" />
          </button>

          {/* MOBILE CONTROL TOGGLE */}
          <button 
            onClick={() => setShowControls(!showControls)}
            className="md:hidden absolute top-4 right-4 z-[1000] w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-xl flex items-center justify-center text-slate-900 border border-slate-200"
          >
            {showControls ? <X size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-amber-500" />}
          </button>
        </MapContainer>

        {/* TOP LEFT: UNIFIED MASTER COMMAND COLUMN - ULTRA COMPACT MOBILE */}
        <div className="absolute top-4 md:top-8 left-3 right-3 md:left-8 md:right-auto z-[1000] space-y-2 md:space-y-4 w-auto md:w-[340px]">
           {/* SEARCH BAR - ALWAYS VISIBLE */}
           <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl md:rounded-[2rem] h-10 md:h-14 flex items-center px-2 md:px-3 gap-1 md:gap-3 shadow-2xl group focus-within:ring-4 focus-within:ring-amber-500/10 transition-all">
              <button 
                onClick={() => navigate('/')}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl md:rounded-2xl hover:bg-slate-100 text-slate-500 transition-all"
                title="Back to Home"
              >
                <ArrowLeft size={18} md:size={20} />
              </button>
              <div className="w-px h-6 bg-slate-100 mx-1 md:mx-0"></div>
              <Search className="text-slate-400 group-focus-within:text-amber-500 transition-colors shrink-0" size={14} />
              <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search area..." className="bg-transparent border-none outline-none text-slate-900 w-full font-bold text-[10px] md:text-sm" />
              {searching && <Loader2 size={12} className="text-amber-500 animate-spin" />}
           </div>
           
           <AnimatePresence>
             {showControls && (
               <motion.div 
                 initial={{ opacity: 0, y: -20, height: 0 }}
                 animate={{ opacity: 1, y: 0, height: 'auto' }}
                 exit={{ opacity: 0, y: -20, height: 0 }}
                 className="space-y-2 md:space-y-4 overflow-hidden"
               >
                 <AnimatePresence>
                   {searchResults.length > 0 && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-xl md:rounded-3xl p-2 md:p-3 shadow-2xl mt-1.5 max-h-48 md:max-h-80 overflow-y-auto border border-slate-100">
                       {searchResults.map((result, i) => (
                          <button key={i} onClick={() => selectSearchResult(result)} className="w-full p-2.5 md:p-4 hover:bg-slate-50 flex items-center gap-3 text-left border-b border-slate-50 last:border-none group">
                             <MapPin size={10} className="text-slate-400 group-hover:text-amber-500" />
                             <span className="font-bold text-[9px] md:text-xs text-slate-700 truncate">{result.display_name}</span>
                          </button>
                       ))}
                     </motion.div>
                   )}
                 </AnimatePresence>

                 {/* Network Health Stats - Compact Mobile Padding */}
                 <div className="flex gap-2 md:gap-3">
                    <div className="flex-1 bg-emerald-50/90 backdrop-blur-md border border-emerald-200 rounded-2xl md:rounded-3xl p-2 md:p-4 shadow-2xl flex flex-col">
                       <span className="text-[7px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0 md:mb-1">Verified</span>
                       <span className="text-xl md:text-3xl font-black text-emerald-800 leading-none">{finalVerified.length}</span>
                    </div>
                    <div className="flex-1 bg-amber-50/90 backdrop-blur-md border border-amber-200 rounded-2xl md:rounded-3xl p-2 md:p-4 shadow-2xl flex flex-col">
                       <span className="text-[7px] md:text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0 md:mb-1">Unverified</span>
                       <span className="text-xl md:text-3xl font-black text-amber-800 leading-none">{finalUnverified.length}</span>
                    </div>
                 </div>

                 {/* Discovery Mode Status - Slim on Mobile */}
                 <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-[2rem] p-2 md:p-5 shadow-2xl border-l-4 border-l-amber-500 flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-amber-500 rounded-lg md:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20"><BsFillFuelPumpFill size={14} md:size={22} /></div>
                    <div>
                       <p className="text-slate-900 font-black text-[10px] md:text-sm tracking-tight leading-tight">Discovery Mode</p>
                       <div className="flex items-center gap-1 md:gap-2">
                          <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          <p className="text-amber-500 text-[7px] md:text-[9px] font-black uppercase tracking-widest">Active Scan</p>
                       </div>
                    </div>
                 </div>

                 {/* Radius Control - Slim and Touch Optimized */}
                 <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-[2rem] p-3 md:p-6 shadow-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                       <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Radius Control</span>
                       <span className="text-[10px] md:text-xs font-black text-amber-500">{radius} KM</span>
                    </div>
                    <input type="range" min="1" max="50" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full h-1 md:h-1.5 accent-amber-500 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                 </div>
                  {/* Self-Pin Tactical Control */}
                  {user?.role !== 'admin' && (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (selfPinExpiry) {
                          setSelfPinExpiry(null);
                          toast.info("Network broadcast terminated.");
                        } else {
                          const expiry = Date.now() + 8 * 60 * 1000;
                          setSelfPinExpiry(expiry);
                          toast.success("Broadcasting your position for 8 minutes!");
                        }
                      }}
                      className={`w-full rounded-2xl md:rounded-[2rem] p-4 md:p-5 shadow-2xl border-2 flex items-center justify-between transition-all ${
                        selfPinExpiry 
                        ? 'bg-amber-500 border-amber-600 text-white animate-pulse' 
                        : 'bg-white border-slate-100 text-slate-900 hover:border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Users size={20} className={selfPinExpiry ? 'text-white' : 'text-amber-500'} />
                        <div>
                          <p className="font-black text-[10px] md:text-sm tracking-tight leading-tight">
                            {selfPinExpiry ? 'Self Pin Active' : 'Self Pin'}
                          </p>
                          <p className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest ${selfPinExpiry ? 'text-white/80' : 'text-slate-400'}`}>
                            {selfPinExpiry ? 'Visible to Network' : 'Go Live on Map'}
                          </p>
                        </div>
                      </div>
                      {selfPinExpiry && (
                        <div className="bg-white/20 px-3 py-1 rounded-full font-black text-xs">
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
        </div>

      </div>

      <AnimatePresence>
        {consoleModal.open && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 md:p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-[95vw] md:max-w-[90vw] h-[95vh] md:h-[90vh] rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col border border-white/20">
              {/* Header - Responsive Padding */}
              <div className="bg-[#5c4033] px-6 md:px-10 py-4 md:py-6 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-500 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-amber-500/40"><BsFillFuelPumpFill size={20} md:size={30} /></div>
                  <div><h3 className="text-lg md:text-2xl font-black tracking-tight">Add Station</h3><p className="text-amber-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 md:mt-1 hidden sm:block">Map-First Data Extraction</p></div>
                </div>
                <button onClick={() => setConsoleModal({ open: false, mode: 'create', station: null })} className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center transition-all"><X size={20} md:size={24} /></button>
              </div>

              {/* Split Body - MOBILE STACKED / DESKTOP SPLIT */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Map Picker - Half height on mobile */}
                <div className="h-1/3 md:h-full md:w-[60%] relative bg-slate-100 border-b md:border-b-0 md:border-r border-slate-100">
                  <MapContainer center={[consoleModal.station.lat, consoleModal.station.lng]} zoom={16} className="h-full w-full" zoomControl={false}>
                    <TileLayer url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']} />
                    <MiniMapPicker 
                      isMobile={isMobile}
                      position={[consoleModal.station.lat, consoleModal.station.lng]} 
                      onStartFetching={(lat, lng) => {
                        setFetchingAddress(true);
                        setConsoleModal(prev => ({ ...prev, station: { ...prev.station, lat, lng, address: 'Extracting...' } }));
                      }}
                      onPick={(lat, lng, geoData) => {
                       setFetchingAddress(false);
                       if (geoData) {
                         setConsoleModal(prev => ({ 
                           ...prev, 
                           station: { ...prev.station, lat, lng, address: geoData.street, subArea: geoData.subArea, area: geoData.area, city: geoData.city } 
                         }));
                       } else {
                         setConsoleModal(prev => ({ ...prev, station: { ...prev.station, lat, lng } }));
                       }
                    }} />
                  </MapContainer>
                </div>

                {/* Management Panel - Scrollable content */}
                <div className="flex-1 md:w-[40%] bg-white overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 scrollbar-hide">
                  <div className="space-y-4"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Station Image</h4><div className="flex items-center gap-4 md:gap-6"><div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300"><Camera size={24} md:size={32} /></div><button className="px-4 md:px-6 py-2 md:py-2.5 bg-white border border-slate-200 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm">+ Upload</button></div></div>
                  <div className="space-y-4"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Basic Info</h4><div className="space-y-4 md:space-y-6"><div className="space-y-2"><label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-1">Station Name</label><input type="text" value={consoleModal.station.name} onChange={(e) => setConsoleModal(prev => ({ ...prev, station: { ...prev.station, name: e.target.value } }))} className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20" /></div><div className="grid grid-cols-2 gap-3 md:gap-4"><div className="space-y-2"><label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-1">Status</label><select value={consoleModal.station.status} onChange={(e) => setConsoleModal(prev => ({ ...prev, station: { ...prev.station, status: e.target.value } }))} className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-900 outline-none"><option value="available">Available</option><option value="limited">Limited</option><option value="out of stock">Out of Stock</option></select></div><div className="space-y-2"><label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-1">Primary Fuel</label><select value={consoleModal.station.primaryFuel} onChange={(e) => setConsoleModal(prev => ({ ...prev, station: { ...prev.station, primaryFuel: e.target.value } }))} className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-900 outline-none"><option value="Octane">Octane</option><option value="Diesel">Diesel</option><option value="Petrol">Petrol</option><option value="CNG">CNG</option></select></div></div></div></div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location Details</h4></div>
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between">
                       <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white"><MapPin size={14} md:size={16} /></div>
                          <div><p className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase">{consoleModal.station.lat.toFixed(4)}, {consoleModal.station.lng.toFixed(4)}</p></div>
                       </div>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      <div className="space-y-2"><label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-1">Street Address</label><input type="text" value={fetchingAddress ? 'Extracting...' : consoleModal.station.address} onChange={(e) => setConsoleModal(prev => ({ ...prev, station: { ...prev.station, address: e.target.value } }))} className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-900" /></div>
                      <div className="grid grid-cols-3 gap-2"><input type="text" placeholder="SubArea" value={consoleModal.station.subArea} onChange={(e) => setConsoleModal(prev => ({ ...prev, station: { ...prev.station, subArea: e.target.value } }))} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-bold" /><input type="text" placeholder="Area" value={consoleModal.station.area} onChange={(e) => setConsoleModal(prev => ({ ...prev, station: { ...prev.station, area: e.target.value } }))} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-bold" /><input type="text" placeholder="City" value={consoleModal.station.city} onChange={(e) => setConsoleModal(prev => ({ ...prev, station: { ...prev.station, city: e.target.value } }))} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-bold" /></div>
                    </div>
                  </div>

                  <div className="space-y-4 pb-10">
                    <div className="flex items-center justify-between"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fuel Inventory</h4><button onClick={addNewItem} className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 rounded-lg text-[8px] font-black uppercase text-white"><Plus size={10} /> Add</button></div>
                    <div className="space-y-2 md:space-y-3">
                      {consoleModal.station.fuels.map((fuel, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 border border-transparent">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-500 rounded-lg flex items-center justify-center text-white font-black text-[10px] md:text-xs">{fuel.type[0]}</div>
                          <div className="flex-1 min-w-0">
                            <select value={fuel.type} onChange={(e) => { const n = [...consoleModal.station.fuels]; n[idx].type = e.target.value; setConsoleModal(prev => ({ ...prev, station: { ...prev.station, fuels: n } })); }} className="bg-transparent border-none outline-none text-[8px] md:text-[9px] font-black text-slate-400 uppercase w-full">
                              {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <input type="text" value={fuel.price} onChange={(e) => { const n = [...consoleModal.station.fuels]; n[idx].price = e.target.value; setConsoleModal(prev => ({ ...prev, station: { ...prev.station, fuels: n } })); }} className="w-full border-none outline-none text-xs font-black text-slate-700 bg-transparent mt-1" />
                          </div>
                          <button onClick={() => { const n = consoleModal.station.fuels.filter((_, i) => i !== idx); setConsoleModal(prev => ({ ...prev, station: { ...prev.station, fuels: n } })); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Responsive */}
              <div className="p-6 md:p-8 border-t border-slate-100 flex items-center justify-end gap-3 md:gap-6 bg-white">
                <button onClick={() => setConsoleModal({ open: false, mode: 'create', station: null })} className="px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Cancel</button>
                <button onClick={handleConsoleSave} disabled={submitting} className="px-8 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl bg-amber-500 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 md:gap-3">{submitting ? <Loader2 size={14} className="animate-spin" /> : <><Globe size={14} md:size={16} /> Save</>}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`.premium-popup .leaflet-popup-content-wrapper { border-radius: 32px; padding: 0; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); } .premium-popup .leaflet-popup-content { margin: 0 !important; width: 220px !important; } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default MapPage;
