import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, CheckCircle2, Search, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet icon missing in bundled environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom amber pin icon for the selected station marker
const stationIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 14px rgba(245,158,11,0.5);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="transform: rotate(45deg); color: white; font-size: 14px;">⛽</div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// ---------- Sub-components ----------

/** Invisible component that listens for map clicks */
const ClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
};

/** Flies the map to a given position when it changes */
const FlyTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && Number.isFinite(position[0]) && Number.isFinite(position[1])) {
       map.flyTo(position, 16, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
};

// ---------- Reverse Geocode via Nominatim ----------
const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Geocode failed');
  return res.json();
};

// ---------- Search via Nominatim ----------
const searchPlace = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
};

// ---------- Main Modal ----------
const MapPickerModal = ({ isOpen, onClose, onConfirm, initialCoords }) => {
  const defaultPos = [23.8103, 90.4125];
  const [markerPos, setMarkerPos] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Initialize marker position safely
  useEffect(() => {
    if (isOpen) {
      const pos = (initialCoords && Number.isFinite(initialCoords.lat)) 
        ? [initialCoords.lat, initialCoords.lng] 
        : null;
      setMarkerPos(pos);
      setLocationInfo(null);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, initialCoords]);

  const handleMapClick = useCallback(async ({ lat, lng }) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setMarkerPos([lat, lng]);
    setLocationInfo(null);
    setGeocoding(true);
    try {
      const data = await reverseGeocode(lat, lng);
      const addr = data.address || {};
      setLocationInfo({
        lat,
        lng,
        address: data.display_name?.split(',').slice(0, 2).join(',').trim() || '',
        subArea: addr.suburb || addr.neighbourhood || addr.quarter || addr.village || addr.town || '',
        area: addr.city_district || addr.district || addr.county || addr.state_district || '',
        city: addr.city || addr.town || addr.municipality || addr.state || 'Dhaka',
        displayName: data.display_name || '',
      });
    } catch {
      setLocationInfo({ lat, lng, address: '', subArea: '', area: '', city: 'Dhaka', displayName: '' });
    } finally {
      setGeocoding(false);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowSearchResults(false); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlace(searchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSelectSearchResult = async (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    
    setMarkerPos([lat, lng]);
    setShowSearchResults(false);
    setSearchQuery(result.display_name?.split(',')[0] || '');
    setGeocoding(true);
    try {
      const data = await reverseGeocode(lat, lng);
      const addr = data.address || {};
      setLocationInfo({
        lat, lng,
        address: data.display_name?.split(',').slice(0, 2).join(',').trim() || '',
        subArea: addr.suburb || addr.neighbourhood || addr.quarter || addr.village || addr.town || '',
        area: addr.city_district || addr.district || addr.county || addr.state_district || '',
        city: addr.city || addr.town || addr.municipality || addr.state || 'Dhaka',
        displayName: data.display_name || '',
      });
    } finally { setGeocoding(false); }
  };

  const handleConfirm = () => {
    if (locationInfo) onConfirm(locationInfo);
  };

  if (!isOpen) return null;

  const mapCenter = (markerPos && Number.isFinite(markerPos[0])) ? markerPos : defaultPos;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 24 }} className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col" style={{ height: '85vh', maxHeight: '720px' }}>
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#3E291D] to-[#5a3d2b] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-black text-base tracking-tight">Pick Station Location</h2>
                  <p className="text-amber-400/70 text-[10px] font-bold uppercase tracking-widest">Click anywhere on the map to place the station</p>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"><X size={18} /></button>
            </div>

            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0 relative" ref={searchRef}>
              <div className="relative max-w-lg">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                {searching && <Loader2 size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" />}
                <input type="text" placeholder="Search for a place, road, or area..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => searchResults.length > 0 && setShowSearchResults(true)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-normal" />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-[500]">
                    {searchResults.map((r, i) => (
                      <button key={i} onClick={() => handleSelectSearchResult(r)} className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-slate-50 last:border-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{r.display_name?.split(',')[0]}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{r.display_name?.split(',').slice(1, 4).join(',')}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ClickHandler onMapClick={handleMapClick} />
                {markerPos && Number.isFinite(markerPos[0]) && (
                  <>
                    <Marker position={markerPos} icon={stationIcon} />
                    <FlyTo position={markerPos} />
                  </>
                )}
              </MapContainer>
              {!markerPos && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-2">
                    <Navigation size={16} className="text-amber-500" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Click the map to place a pin</span>
                  </div>
                </div>
              )}
              {geocoding && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2 shadow-lg flex items-center gap-2 z-10">
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Detecting address...</span>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white">
              {locationInfo ? (
                <div className="px-8 py-4 flex items-center justify-between gap-6">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={18} className="text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Selected Location</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{locationInfo.displayName?.split(',').slice(0,3).join(',')}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">📍 {locationInfo.lat.toFixed(6)}, {locationInfo.lng.toFixed(6)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                    <button type="button" onClick={handleConfirm} className="bg-amber-500 hover:bg-amber-600 text-white px-7 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2">
                      <MapPin size={13} />Confirm Location
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-8 py-4 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No location selected yet</p>
                  <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MapPickerModal;
