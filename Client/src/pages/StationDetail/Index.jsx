import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StationDetails from '../../components/homePage/Pumps/StationDetails';
import { StationDetailSkeleton } from '../../components/shared/Skeleton';
import { stationService } from '../../helpers/stationService';
import { toast } from 'react-toastify';


const StationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    const fetchStation = async () => {
      setLoading(true);
      try {
        // Attempt live fetch first
        const data = await stationService.getStationDetails(id);
        if (data) {
          setStation(data);
        } else {
          setStation(null);
        }
      } catch (error) {
        console.error("Live fetch failed:", error);
        setStation(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStation();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl px-4 pt-28 pb-20 mx-auto">
        <StationDetailSkeleton />
      </div>
    );
  }

  // If station still not found, handle gracefully
  if (!station) {
    return (
      <div className="w-full max-w-5xl px-4 pt-28 pb-20 mx-auto text-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100">
         <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Station Intelligence Offline</h2>
         <p className="text-slate-400 font-bold mb-8 uppercase text-[10px] tracking-widest">The requested station ID is not in our network</p>
         <button onClick={() => navigate('/stations')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Return to Stations</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl px-4 pt-28 pb-20 mx-auto">
      <StationDetails 
        station={station} 
        onBack={() => navigate('/stations')} 
      />
    </div>
  );
};

export default StationDetailPage;
