import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fuel, MapPin, CheckCircle2, AlertCircle, Save, Plus, Trash2, Map } from 'lucide-react';
import { adminService } from '../../helpers/adminService';
import { toast } from 'react-toastify';
import MapPickerModal from './components/MapPickerModal';

const StationModal = ({ isOpen, onClose, station, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: {
      address: '',
      subArea: '',
      area: '',
      city: 'Dhaka',
      coordinates: { lat: 23.8103, lng: 90.4125 }
    },
    fuels: [
      { type: 'Octane', price: 0, status: 'available' },
      { type: 'Petrol', price: 0, status: 'available' },
      { type: 'Diesel', price: 0, status: 'available' },
      { type: 'CNG', price: 0, status: 'available' }
    ],
    status: 'available',
    primaryCategory: 'octane',
    verified: true
  });

  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name,
        location: station.location,
        fuels: station.fuels,
        status: station.status,
        primaryCategory: station.primaryCategory,
        verified: station.verified
      });
      setImagePreview(station.image?.secure_url || null);
    } else {
      setFormData({
        name: '',
        location: {
          address: '',
          subArea: '',
          area: '',
          city: 'Dhaka',
          coordinates: { lat: 23.8103, lng: 90.4125 }
        },
        fuels: [
          { type: 'Octane', price: 130, status: 'available' },
          { type: 'Petrol', price: 125, status: 'available' },
          { type: 'Diesel', price: 110, status: 'available' },
          { type: 'CNG', price: 43, status: 'available' }
        ],
        status: 'available',
        primaryCategory: 'octane',
        verified: true
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [station, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Need to format for multipart/form-data
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('status', formData.status);
      submitData.append('primaryCategory', formData.primaryCategory);
      submitData.append('verified', formData.verified);
      submitData.append('location', JSON.stringify(formData.location));
      submitData.append('fuels', JSON.stringify(formData.fuels));

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // Important: Use adminService correctly. Note `stationData` is now a FormData.
      // We must tell axios it's multipart by setting headers in the service if needed.
      // But typically axios detects FormData and sets headers automatically.
      if (station) {
        await adminService.updateStation(station._id, submitData);
        toast.success('Station updated successfully');
      } else {
        await adminService.createStation(submitData);
        toast.success('Station created successfully');
      }
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFuelChange = (index, field, value) => {
    const updatedFuels = [...formData.fuels];
    updatedFuels[index][field] = field === 'price' ? Number(value) : value;
    setFormData({ ...formData, fuels: updatedFuels });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                <Fuel size={24} />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {station ? 'Edit Fuel Station' : 'Add New Station'}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Station Management Console
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
          
          {/* Image Upload */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Station Image</h3>
             <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                   {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                      <Fuel size={24} className="text-slate-300" />
                   )}
                </div>
                <div>
                   <label className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-all cursor-pointer shadow-sm">
                      Upload Image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                   </label>
                   <p className="text-[10px] font-bold text-slate-400 mt-2">Recommended: 800x600px. Max 2MB.</p>
                </div>
             </div>
          </section>

          {/* Basic Info */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Basic Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Station Name</label>
                   <input 
                     type="text" 
                     required
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:bg-white focus:border-amber-500 transition-all outline-none"
                     placeholder="e.g. Trust Filling Station"
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Overall Status</label>
                   <select 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:bg-white focus:border-amber-500 transition-all outline-none"
                     value={formData.status}
                     onChange={(e) => setFormData({...formData, status: e.target.value})}
                   >
                      <option value="available">Available</option>
                      <option value="limited">Limited Stock</option>
                      <option value="out">Out of Stock</option>
                   </select>
                </div>
             </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
             <div className="flex items-center justify-between border-b border-slate-100 pb-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location Details</h3>
               <button
                 type="button"
                 onClick={() => setShowMapPicker(true)}
                 className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-amber-500/20"
               >
                 <Map size={12} />
                 Pick on Map
               </button>
             </div>

             {/* Coordinate badge — shows when a pin has been placed */}
             {formData.location.coordinates.lat !== 23.8103 || formData.location.coordinates.lng !== 90.4125 ? (
               <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2.5">
                 <MapPin size={14} className="text-amber-500 shrink-0" />
                 <span className="text-[11px] font-black text-amber-700">
                   📍 {formData.location.coordinates.lat.toFixed(6)}, {formData.location.coordinates.lng.toFixed(6)}
                 </span>
                 <span className="ml-auto text-[9px] font-black text-amber-400 uppercase tracking-widest">GPS Set</span>
               </div>
             ) : null}

             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Street Address</label>
                   <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-amber-500 transition-all outline-none"
                        placeholder="123 Airport Road"
                        value={formData.location.address}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                      />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sub Area</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:bg-white focus:border-amber-500 transition-all outline-none"
                        placeholder="Uttara Sector 4"
                        value={formData.location.subArea}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, subArea: e.target.value}})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Area</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:bg-white focus:border-amber-500 transition-all outline-none"
                        placeholder="Uttara"
                        value={formData.location.area || ''}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, area: e.target.value}})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">City</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:bg-white focus:border-amber-500 transition-all outline-none"
                        value={formData.location.city}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                      />
                   </div>
                </div>
             </div>
          </section>

          {/* Fuels & Pricing */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Fuel Inventory & Pricing</h3>
             <div className="space-y-3">
                {formData.fuels.map((fuel, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-amber-500/30 transition-all">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg ${
                        fuel.type === 'Octane' ? 'bg-amber-500 shadow-amber-500/20' :
                        fuel.type === 'Diesel' ? 'bg-blue-500 shadow-blue-500/20' :
                        fuel.type === 'Petrol' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-purple-500 shadow-purple-500/20'
                     }`}>
                        {fuel.type[0]}
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{fuel.type}</p>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                              <span className="text-xs font-black text-slate-400">৳</span>
                              <input 
                                type="number" 
                                className="w-16 bg-transparent border-none outline-none text-xs font-black text-slate-700"
                                value={fuel.price}
                                onChange={(e) => handleFuelChange(idx, 'price', e.target.value)}
                              />
                           </div>
                           <select 
                             className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black uppercase text-slate-500 cursor-pointer shadow-sm outline-none hover:border-amber-500 transition-all"
                             value={fuel.status}
                             onChange={(e) => handleFuelChange(idx, 'status', e.target.value)}
                           >
                              <option value="available">Available</option>
                              <option value="limited">Limited</option>
                              <option value="out">Out of Stock</option>
                           </select>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        </form>

        {/* Map Picker Modal — rendered at document.body level */}
        <MapPickerModal
          isOpen={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          initialCoords={formData.location.coordinates}
          onConfirm={(locationInfo) => {
            setFormData(prev => ({
              ...prev,
              location: {
                address: locationInfo.address,
                subArea: locationInfo.subArea,
                area: locationInfo.area,
                city: locationInfo.city,
                coordinates: { lat: locationInfo.lat, lng: locationInfo.lng }
              }
            }));
            setShowMapPicker(false);
            toast.success('Location pinned from map ✅');
          }}
        />

        {/* Modal Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="text-amber-500" />}
            {station ? 'Update Station' : 'Save Station'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Loader2 = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default StationModal;
