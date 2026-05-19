import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation2, MapPin, Target, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface GPSStatus {
  lat: number | null;
  lng: number | null;
  error: string | null;
  isActive: boolean;
}

interface GPSTrackerProps {
  onCenterMe?: (lat: number, lng: number) => void;
  className?: string;
}

const GPSTracker: React.FC<GPSTrackerProps> = ({ onCenterMe, className }) => {
  const [status, setStatus] = useState<GPSStatus>({
    lat: null,
    lng: null,
    error: null,
    isActive: false,
  });

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setStatus({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      error: null,
      isActive: true,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = "LOCALIZAÇÃO NÃO AUTORIZADA";
    if (error.code === error.TIMEOUT) errorMessage = "TEMPO EXCEDIDO";
    if (error.code === error.POSITION_UNAVAILABLE) errorMessage = "SINAL INDISPONÍVEL";
    
    setStatus(prev => ({
      ...prev,
      error: errorMessage,
      isActive: false,
    }));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus(prev => ({ ...prev, error: "GPS NÃO SUPORTADO" }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [updatePosition, handleError]);

  const handleCenter = () => {
    if (status.lat && status.lng && onCenterMe) {
      onCenterMe(status.lat, status.lng);
    }
  };

  return (
    <div className={cn("pointer-events-auto", className)}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-xs p-2 min-w-[120px] shadow-xl"
      >
        <div className="flex items-center justify-between mb-1.5 px-0.5">
           <div className="flex items-center gap-1">
              <div className={cn(
                "w-1 h-1 rounded-full",
                status.isActive ? "bg-[#ff641d] animate-pulse" : "bg-red-500"
              )} />
              <span className="text-[7px] font-mono font-black text-white/30 uppercase tracking-[0.1em]">
                {status.isActive ? "📍 GPS ACTIVE" : "⚠️ SIGNAL LOST"}
              </span>
           </div>
           
           {status.isActive && (
             <button 
               onClick={handleCenter}
               className="text-[#ff641d]/60 hover:text-[#ff641d] transition-all p-0.5"
               title="Centralizar em mim"
             >
                <Target size={10} />
             </button>
           )}
        </div>

        {status.error ? (
          <div className="text-[7px] font-mono text-red-500/80 uppercase tracking-tight font-black px-0.5">
            {status.error}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-0.5">
             <div className="flex items-center gap-1.5">
                <span className="text-[6px] font-mono text-white/10 uppercase">LA</span>
                <span className="text-[9px] font-mono font-black text-[#ff641d] tracking-tighter">
                  {status.lat?.toFixed(5) || "0.00000"}
                </span>
             </div>
             <div className="flex items-center gap-1.5">
                <span className="text-[6px] font-mono text-white/10 uppercase">LO</span>
                <span className="text-[9px] font-mono font-black text-[#ff641d] tracking-tighter">
                  {status.lng?.toFixed(5) || "0.00000"}
                </span>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GPSTracker;
