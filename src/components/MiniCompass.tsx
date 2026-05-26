import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minimize2, Maximize2, Move, Compass as CompassIcon, RefreshCw, Navigation, Navigation2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MiniCompassProps {
  lat: number;
  lng: number;
  zoom: number;
  isOpen: boolean;
  onClose: () => void;
  destinationCoords?: [number, number] | null;
  destinationName?: string;
  mapRotation?: number;
  onMapRotationChange?: (angle: number) => void;
  isDark?: boolean;
}

export default function MiniCompass({
  lat,
  lng,
  zoom,
  isOpen,
  onClose,
  destinationCoords,
  destinationName,
  mapRotation = 0,
  onMapRotationChange,
  isDark = true
}: MiniCompassProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Custom course angle / offset set by user rotating the bezel
  const [bezelRotation, setBezelRotation] = useState(mapRotation);
  
  // Needle wobble simulation state when position changes or rotation occurs
  const [needleWobble, setNeedleWobble] = useState(0);

  const [prevMapRotation, setPrevMapRotation] = useState(mapRotation);

  // Sync bezelRotation with incoming mapRotation prop
  useEffect(() => {
    setBezelRotation(mapRotation);
  }, [mapRotation]);

  // Physical inertia deflection effect when the map rotates
  useEffect(() => {
    if (mapRotation !== prevMapRotation) {
      const diff = mapRotation - prevMapRotation;
      
      // Simulate real-world physical inertia sliding slip:
      // A physical needle resists turning immediately when the map rotates,
      // creating an opposite-direction deflection before oscillating back.
      const startWobble = -diff * 0.65; // inertial slip angle
      setNeedleWobble(startWobble);

      const timeouts = [
        setTimeout(() => setNeedleWobble(-startWobble * 0.6), 140),
        setTimeout(() => setNeedleWobble(startWobble * 0.35), 280),
        setTimeout(() => setNeedleWobble(-startWobble * 0.15), 420),
        setTimeout(() => setNeedleWobble(0), 550)
      ];

      setPrevMapRotation(mapRotation);
      return () => timeouts.forEach(clearTimeout);
    }
  }, [mapRotation, prevMapRotation]);

  // Auto-minimize after 30 seconds under expanded state
  useEffect(() => {
    if (!isMinimized && isOpen) {
      setTimeLeft(30);
    }
  }, [isMinimized, isOpen]);

  useEffect(() => {
    if (isMinimized || !isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsMinimized(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMinimized, isOpen]);

  // Trigger wobble effect on coordinate change to simulate fluid/magnetic dampening
  useEffect(() => {
    // Generate a quick random initial oscillation when panned
    const startWobble = (Math.random() - 0.5) * 12;
    setNeedleWobble(startWobble);

    // Damped oscillation timeline
    const timeouts = [
      setTimeout(() => setNeedleWobble(-startWobble * 0.6), 120),
      setTimeout(() => setNeedleWobble(startWobble * 0.35), 240),
      setTimeout(() => setNeedleWobble(-startWobble * 0.15), 360),
      setTimeout(() => setNeedleWobble(0), 485)
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [lat, lng]);

  // Calculate coordinates in friendly GPS style
  const formattedCoords = useMemo(() => {
    const latCardinal = lat >= 0 ? 'N' : 'S';
    const lngCardinal = lng >= 0 ? 'L' : 'O'; // Portuguese representation (Leste, Oeste)
    
    const absLat = Math.abs(lat).toFixed(5);
    const absLng = Math.abs(lng).toFixed(5);

    return {
      latStr: `${latCardinal} ${absLat}°`,
      lngStr: `${lngCardinal} ${absLng}°`
    };
  }, [lat, lng]);

  // Calculate target bearing
  const bearingData = useMemo(() => {
    if (!destinationCoords) return null;

    const [lat2, lon2] = destinationCoords;
    const lat1Rad = (lat * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const dLon = ((lon2 - lng) * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    brng = (brng + 360) % 360; // Normalize [0, 360]
    
    // Convert to cardinal abbreviation for display
    const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const idx = Math.round((brng % 360) / 45) % 8;
    
    return {
      angle: brng,
      cardinal: directions[idx]
    };
  }, [lat, lng, destinationCoords]);

  // Local Magnetic Declination Approximation for South America & generic regions
  const magneticDeclination = useMemo(() => {
    let dec = 0;
    if (lng < -30 && lng > -90) {
      // Linear model matching South American real-world magnetic declination
      dec = -22.5 + (lat + 20) * -0.7 - (lng + 15) * 0.45;
    } else {
      dec = -11.5; // fallback
    }
    // Clamp to realistic limits [-25, 25] degrees
    return Math.min(25, Math.max(-25, Math.round(dec * 10) / 10));
  }, [lat, lng]);

  // Reset calibration
  const resetCompass = () => {
    setBezelRotation(0);
    setNeedleWobble(0);
    if (onMapRotationChange) {
      onMapRotationChange(0);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      id="tactical-mini-compass-wrapper"
      drag
      dragMomentum={false}
      dragElastic={0.05}
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 0.75, scale: 1, y: 0 }}
      whileHover={{ opacity: 0.92 }}
      exit={{ opacity: 0, scale: 0.95, y: 30 }}
      className={cn(
        "fixed z-[4500] select-none transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]",
        isDark 
          ? "border-white/5" 
          : "bg-[#0c0d0f]/65 backdrop-blur-xl border-[#ff641d]/20",
        isMinimized 
          ? "w-44 border-white/10 rounded-lg p-2.5 shadow-lg shadow-black/80" 
          : "w-72 rounded-xl p-4.5"
      )}
      style={{
        left: 'calc(50% - 144px)', // Initial desktop center positioning
        top: '180px',
        ...(isDark && {
          background: 'rgba(0, 0, 0, 0.18)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        })
      }}
    >
      {/* Title / Drag Bar Header */}
      <div 
        id="compass-header"
        className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 cursor-grab active:cursor-grabbing text-white"
        title="Arraste para reposicionar a bússola"
      >
        <div className="flex items-center gap-2">
          <Move id="compass-drag-icon" className="w-3.5 h-3.5 text-white/40" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-[8px] font-mono font-black uppercase tracking-widest leading-none",
                isDark ? "text-[#6CFF8F]" : "text-[#ff641d]"
              )}>
                GPS BÚSSOLA
              </span>
              {!isMinimized && (
                <div className={cn(
                  "flex items-center gap-1 px-1 py-[1.5px] rounded-xs border text-[7px] font-mono font-black leading-none tracking-wider",
                  isDark 
                    ? "bg-[#6CFF8F]/10 border-[#6CFF8F]/25 text-[#6CFF8F]" 
                    : "bg-[#ff641d]/10 border-[#ff641d]/25 text-[#ff641d]"
                )} title="Minimiza em 30s">
                  <span className={cn("animate-ping w-1 h-1 rounded-full inline-block mr-0.5", isDark ? "bg-[#6CFF8F]" : "bg-[#ff641d]")} />
                  {timeLeft}S
                </div>
              )}
            </div>
            {!isMinimized && (
              <span className="text-[6.5px] font-mono text-white/30 uppercase tracking-tighter mt-0.5">
                Instrumentação de Navegação
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 z-10">
          <button
            id="rotate-bezel-reset-btn"
            onClick={resetCompass}
            title="Recalibrar Bússola"
            className="p-1 hover:bg-white/5 rounded-xs text-white/40 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button
            id="minimize-compass-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Maximizar Bússola" : "Minimizar Bússola"}
            className="p-1 hover:bg-white/5 rounded-xs text-white/40 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            id="close-compass-btn"
            onClick={onClose}
            title="Fechar Bússola"
            className={cn(
              "p-1 hover:bg-white/5 rounded-xs transition-colors",
              isDark ? "text-[#6CFF8F]/80 hover:text-[#6CFF8F]" : "text-[#ff641d]/80 hover:text-[#ff641d]"
            )}
          >
            <X className="w-3.5 h-3.5 font-bold" />
          </button>
        </div>
      </div>

      {/* COMPACT MINIMIZED VIEW */}
      {isMinimized ? (
        <div id="compass-minimized-content" className="flex items-center justify-between gap-3 px-1">
          {/* Mini Rotating Dial with tactical highlights */}
          <div className={cn(
            "relative w-10 h-10 rounded-full border shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300",
            isDark 
              ? "border-[#6CFF8F]/20 bg-[#070809]/80 shadow-[inset_0_0_8px_rgba(108,255,143,0.15)]" 
              : "border-white/10 bg-black/40"
          )}>
            <svg className="absolute inset-0 w-full h-full p-1 opacity-25" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className={isDark ? "text-[#6CFF8F]" : "text-white"} />
            </svg>
            <motion.div 
              style={{ rotate: bezelRotation + needleWobble }}
              className="relative w-full h-full flex items-center justify-center p-1.5"
            >
              {/* Central Needle pointer with contrast */}
              <div className={cn(
                "w-0.5 h-6 relative flex justify-center rounded-sm",
                isDark 
                  ? "bg-gradient-to-t from-[#6CFF8F]/30 via-[#ff4500] to-white" 
                  : "bg-gradient-to-t from-white/30 via-red-500 to-red-500"
              )}>
                <div className={cn(
                  "absolute top-0 w-1.5 h-1.5 rotate-45 transform origin-center -translate-y-0.5 rounded-xs",
                  isDark ? "bg-white border-t border-l border-[#ff4500]" : "bg-red-500"
                )} />
              </div>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0">
            <span className={cn(
              "text-[10px] font-mono font-black leading-none",
              isDark ? "text-[#6CFF8F]" : "text-white"
            )}>
              N_RUMO : {Math.round((bezelRotation) % 360 + 360) % 360}°
            </span>
            <span className="text-[7.5px] font-mono text-white/40 leading-normal uppercase truncate mt-0.5">
              LAT: {lat.toFixed(3)}
            </span>
          </div>
        </div>
      ) : (
        /* DETAILED MASTER COMPASS DIAL VIEW */
        <div id="compass-main-expanded-content" className="space-y-4">
          <div className="flex flex-col items-center justify-center relative">
            {/* Main Outer Compass Face */}
            <div className={cn(
              "relative w-44 h-44 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300",
              isDark 
                ? "border border-white/10 bg-[#070809]/85 shadow-[inset_0_0_20px_rgba(0,0,0,0.95)]" 
                : "border border-white/10 bg-[#070809]/90 shadow-[inset_0_0_15px_rgba(0,0,0,0.9)]"
            )}>
              
              {/* Dynamic Inner Glow Layer (Only in Dark Mode as inner glow) */}
              {isDark && (
                <motion.div 
                  className="absolute inset-0 rounded-full pointer-events-none z-0"
                  animate={{
                    boxShadow: [
                      "inset 0 0 10px rgba(108, 255, 143, 0.04)",
                      "inset 0 0 25px rgba(108, 255, 143, 0.18)",
                      "inset 0 0 10px rgba(108, 255, 143, 0.04)"
                    ]
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Coordinate Reticle Grid Overlay */}
              <div className={cn("absolute inset-0 border rounded-full pointer-events-none transition-all", isDark ? "border-[#6CFF8F]/5 m-6" : "border-white/[0.02] m-6")} />
              <motion.div 
                className={cn("absolute inset-0 border rounded-full pointer-events-none transition-all", isDark ? "border-[#6CFF8F]/8 m-14" : "border-white/[0.02] m-14")}
                animate={isDark ? {
                  opacity: [0.3, 0.7, 0.3],
                  borderColor: ["rgba(108, 255, 143, 0.04)", "rgba(108, 255, 143, 0.16)", "rgba(108, 255, 143, 0.04)"]
                } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className={cn("absolute top-0 bottom-0 left-1/2 w-[0.5px] pointer-events-none", isDark ? "bg-[#6CFF8F]/5" : "bg-white/[0.02]")} />
              <div className={cn("absolute left-0 right-0 top-1/2 h-[0.5px] pointer-events-none", isDark ? "bg-[#6CFF8F]/5" : "bg-white/[0.02]")} />

              {/* ROTATING OUTER BEZEL (Includes N L S O marker text & ticks) */}
              <motion.div 
                id="compass-outer-bezel-ring"
                animate={{ rotate: bezelRotation }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="absolute inset-0 w-full h-full flex items-center justify-center text-[10px] font-mono text-white/60 p-2 font-bold"
              >
                {/* Dial Ticks (Every 15 degrees) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = i * 15;
                    const isMajor = angle % 90 === 0;
                    const isMedium = angle % 45 === 0 && !isMajor;
                    const length = isMajor ? 6 : isMedium ? 4 : 2;
                    const width = isMajor ? 1.5 : 1;
                    const color = isMajor ? (isDark ? '#6CFF8F' : '#ff641d') : (isDark ? '#3d6c46' : '#888');
                    return (
                      <line
                        key={`tick-${angle}`}
                        x1="50"
                        y1={5}
                        x2="50"
                        y2={5 + length}
                        transform={`rotate(${angle} 50 50)`}
                        stroke={color}
                        strokeWidth={width}
                      />
                    );
                  })}
                </svg>

                {/* Cardinal Points Texts (N, L, S, O) precisely placed on rotation ring */}
                {isDark ? (
                  <motion.span 
                    animate={{
                      opacity: [0.65, 1, 0.65],
                      textShadow: [
                        "0 0 1px rgba(108,255,143,0.2)",
                        "0 0 6px rgba(108,255,143,0.7)",
                        "0 0 1px rgba(108,255,143,0.2)"
                      ]
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-3.5 left-1/2 -translate-x-1/2 font-black text-[#6CFF8F] text-xs tracking-wider"
                  >
                    N
                  </motion.span>
                ) : (
                  <span className="absolute top-3.5 left-1/2 -translate-x-1/2 font-black text-[#ff641d] text-xs">N</span>
                )}
                <span className={cn("absolute right-3.5 top-1/2 -translate-y-1/2 font-black", isDark ? "text-[#6CFF8F]/60" : "text-white/80")}>L</span>
                <span className={cn("absolute bottom-3.5 left-1/2 -translate-x-1/2 font-black", isDark ? "text-[#6CFF8F]/30" : "text-white/50")}>S</span>
                <span className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 font-black", isDark ? "text-[#6CFF8F]/60" : "text-white/80")}>O</span>

                {/* Ordinal directions */}
                <span className="absolute top-9 right-9 text-[6.5px] font-medium text-white/30 rotate-45">NE</span>
                <span className="absolute bottom-9 right-9 text-[6.5px] font-medium text-white/30 rotate-[135deg]">SE</span>
                <span className="absolute bottom-9 left-9 text-[6.5px] font-medium text-white/30 rotate-[225deg]">SO</span>
                <span className="absolute top-9 left-9 text-[6.5px] font-medium text-white/30 rotate-[315deg]">NO</span>
              </motion.div>

              {/* CORE NEEDLE / POINTER GRID (Points exactly north but oscillates based on needleWobble simulation) */}
              <motion.div 
                id="compass-core-needle"
                animate={{ rotate: bezelRotation + needleWobble }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                className="absolute w-20 h-20 flex items-center justify-center pointer-events-none z-10"
              >
                {/* Gorgeous high contrast tactical arrow */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Top Arrow (Red pointed needle towards North) */}
                  <div className={cn(
                    "absolute top-0 bottom-1/2 w-1.5 flex justify-center origin-bottom rounded-t-sm transition-all duration-300",
                    isDark 
                      ? "bg-gradient-to-t from-[#ff5500] via-[#ff7300] to-white shadow-[0_0_12px_rgba(255,100,29,0.75)] border-l border-r border-white/30" 
                      : "bg-gradient-to-t from-[#ff641d] to-[#ff2c1d] shadow-[0_0_8px_rgba(255,100,29,0.5)]"
                  )}>
                    {/* Glowing arrowhead */}
                    <div className={cn(
                      "absolute top-0 w-3.5 h-3.5 rotate-45 transform origin-center -translate-y-1 rounded-xs flex items-center justify-center",
                      isDark 
                        ? "bg-[#ff4500] border-t border-l border-white/50" 
                        : "bg-[#ff641d]"
                    )}>
                      {/* Active tiny highlighting center dot inside the arrow */}
                      {isDark && (
                        <div className="w-1.5 h-1.5 bg-[#6CFF8F] rounded-full shrink-0 shadow-[0_0_4px_#6CFF8F]" style={{ transform: 'rotate(-45deg)' }} />
                      )}
                    </div>
                  </div>

                  {/* Bottom Arrow (Dark metal needle pointing South) */}
                  <div className={cn(
                    "absolute bottom-0 top-1/2 w-1.5 flex justify-center origin-top rounded-b-sm transition-all duration-300",
                    isDark 
                      ? "bg-gradient-to-b from-white/20 via-white/50 to-white/90 border-l border-r border-white/10"
                      : "bg-gradient-to-b from-white/10 via-white/30 to-white/60"
                  )}>
                    {/* Metal pointer head */}
                    <div className={cn(
                      "absolute bottom-0 w-3 h-3 rotate-45 transform origin-center translate-y-1 rounded-xs border transition-all",
                      isDark 
                        ? "bg-white/60 border-white/20 shadow-[0_0_3px_rgba(255,255,255,0.2)]"
                        : "bg-white/40 border-white/5"
                    )} />
                  </div>

                  {/* Center Brass Hub Pivot cap */}
                  <div className={cn(
                    "w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xl z-20 transition-all duration-300",
                    isDark 
                      ? "bg-[#121315] border-2 border-[#6CFF8F]" 
                      : "bg-[#1c1d21] border-2 border-[#ff641d]"
                  )}>
                    <div className={cn(
                      "w-1 h-1 rounded-full",
                      isDark ? "bg-[#6CFF8F] animate-pulse" : "bg-[#ff641d] scale-90"
                    )} />
                  </div>
                </div>
              </motion.div>

              {/* DESTINATION BEARING INDICATOR GADGET (Rendered as glowing cyan triangle overlay on the rim) */}
              {bearingData && (
                <motion.div
                  id="compass-bearing-target-indicator"
                  animate={{ rotate: bezelRotation + bearingData.angle }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                  className="absolute inset-0 w-full h-full p-1"
                >
                  {/* Neon Target indicator marker on perimeter aiming at destination */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-0.5 h-2 bg-[#00d4ff] shadow-[0_0_6px_#00d4ff]" />
                    <Navigation className="w-2.5 h-2.5 text-[#00d4ff] transform rotate-180 -mt-0.5 fill-[#00d4ff]/25" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Micro rotators buttons under compass for quick heading bezel tracking customization */}
            <div id="bezel-controls" className="flex flex-col gap-1.5 mt-3 pt-1 border-t border-white/5 w-full">
              {/* Top tier: fine tracking adjustments */}
              <div className="flex items-center justify-between w-full gap-1">
                <button
                  id="bezel-left-btn"
                  onClick={() => {
                    const nextRot = bezelRotation - 5;
                    setBezelRotation(nextRot);
                    if (onMapRotationChange) onMapRotationChange(nextRot);
                  }}
                  className="flex-1 py-1 bg-black/40 border border-white/10 rounded-xs text-[8.5px] font-mono font-bold text-white/50 hover:text-[#ff641d] hover:border-[#ff641d]/30 transition-all uppercase"
                  title="Girar Bezel para Esquerda (Ajuste fino -5°)"
                >
                  GIRAR -5°
                </button>
                
                <div className="px-2 py-0.5 bg-[#ff641d]/10 border border-[#ff641d]/30 rounded-xs text-[9px] font-mono font-black text-[#ff641d] uppercase tracking-wide text-center min-w-[70px]">
                  HDG: {Math.round((bezelRotation) % 360 + 360) % 360}°
                </div>

                <button
                  id="bezel-right-btn"
                  onClick={() => {
                    const nextRot = bezelRotation + 5;
                    setBezelRotation(nextRot);
                    if (onMapRotationChange) onMapRotationChange(nextRot);
                  }}
                  className="flex-1 py-1 bg-black/40 border border-white/10 rounded-xs text-[8.5px] font-mono font-bold text-white/50 hover:text-[#ff641d] hover:border-[#ff641d]/30 transition-all uppercase"
                  title="Girar Bezel para Direita (Ajuste fino +5°)"
                >
                  GIRAR +5°
                </button>
              </div>

              {/* Bottom tier: Quick access Reset & Local Magnetic Alignment */}
              <div className="flex items-center gap-1.5 w-full">
                <button
                  id="bezel-reset-action-btn"
                  onClick={resetCompass}
                  className="flex-1 py-1 bg-black/60 border border-white/10 hover:border-white/20 rounded-xs text-[8px] font-mono font-bold text-white/40 hover:text-[#ff641d] transition-all uppercase flex items-center justify-center gap-1"
                  title="Restaurar orientação (Norte Verdadeiro / Bezel 0°)"
                >
                  <span>RESET (0°)</span>
                </button>

                <button
                  id="bezel-align-magnetic-btn"
                  onClick={() => {
                    setBezelRotation(magneticDeclination);
                    if (onMapRotationChange) onMapRotationChange(magneticDeclination);
                    // Trigger a realistic physical needle settling oscillation feedback
                    const wobble = (Math.random() - 0.5) * 12;
                    setNeedleWobble(wobble);
                    setTimeout(() => setNeedleWobble(-wobble * 0.5), 140);
                    setTimeout(() => setNeedleWobble(0), 300);
                  }}
                  className="flex-1 py-1 bg-[#ff641d]/5 border border-[#ff641d]/20 hover:bg-[#ff641d]/10 hover:border-[#ff641d]/40 rounded-xs text-[8px] font-mono font-black text-[#ff641d]/85 hover:text-[#ff641d] transition-all uppercase flex items-center justify-center gap-1"
                  title={`Alinhar instantaneamente com o Norte Magnético local (${magneticDeclination >= 0 ? '+' : ''}${magneticDeclination}°)`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff641d] animate-pulse shrink-0" />
                  <span>MAG ({magneticDeclination >= 0 ? '+' : ''}${magneticDeclination}°D)</span>
                </button>
              </div>
            </div>
          </div>

          {/* TELEMETRY DATA PANEL */}
          <div id="compass-telemetry-panel" className="bg-black/30 border border-white/5 rounded-lg p-2.5 space-y-1.5 text-[8.5px] font-mono">
            {/* GPS center location */}
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <span className="text-white/30 uppercase">CENTRO_MAPA:</span>
              <span className="text-white/85 flex items-center gap-1.5">
                <span className="text-[#ff641d]">{formattedCoords.latStr}</span>
                <span className="text-white/30">|</span>
                <span className="text-cyan-400">{formattedCoords.lngStr}</span>
              </span>
            </div>

            {/* Active destination target bearing info (only if a point/route is targeted) */}
            {bearingData ? (
              <div id="compass-destination-data" className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 uppercase font-black tracking-tighter">ALVO_SELECIONADO:</span>
                  <span className="text-white/40 uppercase text-[7.5px] truncate max-w-[120px]" title={destinationName}>
                    {destinationName}
                  </span>
                </div>
                <div className="flex items-center justify-between p-1 bg-cyan-400/5 border border-cyan-400/10 rounded-sm">
                  <span className="text-white/30 uppercase text-[7.5px]">Navegação:</span>
                  <span className="text-[#00d4ff] font-black uppercase tracking-wider">
                    {Math.round(bearingData.angle)}° {bearingData.cardinal} (AZIMUTE)
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-[7px] text-white/20 text-center uppercase tracking-tighter py-0.5">
                Nenhum alvo de rota ativo para recalcular azimute.
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
