import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  MapContainer, TileLayer, Marker, Popup, useMap, 
  ZoomControl as LeafletZoomControl, Polyline, useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { 
  Search, Filter, Tent, MapPin, Hammer, Coffee, Droplets, 
  Camera, AlertTriangle, ShieldCheck, Layers, ArrowUpRight, 
  Bike, Triangle, Plus, Minus, Crosshair, Fuel, Shield, 
  LocateFixed, Zap, Navigation, Globe, Navigation2, Compass as CompassIcon,
  Share2, Ruler, Trash2, Radio, UserPlus, Link as LinkIcon, Wind, Thermometer,
  Mountain, Clock, Info, ShieldAlert, Wifi, Battery, Eye
} from 'lucide-react';
import SEO from '@/src/components/SEO';
import { cn } from '@/src/lib/utils';
import { LocationPoint } from '@/src/types';
import { db, auth } from '@/src/lib/firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// --- Tactical Utility Components ---

const ElevationChart = ({ data }: { data: any[] }) => (
  <div className="h-24 w-full bg-black/40 border-t border-white/5 p-2">
    <div className="text-[7px] font-mono text-white/20 uppercase tracking-widest mb-1">ELEVATION_PROFILE (m)</div>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff641d" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ff641d" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="alt" stroke="#ff641d" fillOpacity={1} fill="url(#colorElev)" strokeWidth={1} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0b0c0d', border: '1px solid rgba(255,100,29,0.2)', fontSize: '8px', color: '#fff' }}
          itemStyle={{ color: '#ff641d' }}
          labelStyle={{ display: 'none' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const OperationalMetric = ({ label, value, icon: Icon, color = "text-[#ff641d]" }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5">
       <Icon size={10} className={color} />
       <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-[11px] font-mono font-black text-white">{value}</div>
  </div>
);

// --- Definitions & Constants ---

const initialPoints: LocationPoint[] = [
  { 
    id: '1', 
    name: 'Camping El Chorro - Villa O\'Higgins', 
    lat: -48.465, 
    lng: -72.560, 
    category: 'camping', 
    description: 'Camping rústico próximo ao início da travessia para El Chaltén. Água quente solar.',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: '2', 
    name: 'Mecânico Don Luis - Coyhaique', 
    lat: -45.568, 
    lng: -72.067, 
    category: 'repair', 
    description: 'Mecânica 4x4 e motos. Conhecido por salvar motorhomes na Carretera Austral.',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: '3', 
    name: 'Posto Remoto Bajo Caracoles', 
    lat: -47.441, 
    lng: -70.925, 
    category: 'fuel', 
    description: 'Único ponto de abastecimento em centenas de km na Ruta 40. INDISPENSÁVEL.',
    image: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: '4', 
    name: 'Vertente de Água Degelo - Fitz Roy', 
    lat: -49.271, 
    lng: -72.943, 
    category: 'water', 
    description: 'Água pura diretamente do glaciar. Ponto seguro para reabastecimento de garrafas.' 
  },
  { 
    id: '5', 
    name: 'PONTO SEGURO - Aduana Paso Roballos', 
    lat: -47.165, 
    lng: -71.868, 
    category: 'safe_point', 
    description: 'Posto de fronteira remoto. Documentação obrigatória e zona de fiscalização.',
  },
  { 
    id: '6', 
    name: 'ZONA_CRÍTICA: Ventos de 120km/h', 
    lat: -50.230, 
    lng: -70.920, 
    category: 'danger', 
    description: 'Zona de perigo extremo para motos e bicicletas. Rípio solto e rajadas laterais constantes.' 
  },
  {
    id: '7',
    name: 'Refúgio de Montanha - Cochamo',
    lat: -41.405,
    lng: -72.245,
    category: 'safe_point',
    description: 'Shelter comunitário para situações de clima extremo. Gratuito.',
  },
  {
    id: '9',
    name: 'Mirante Glaciar Perito Moreno',
    lat: -50.48,
    lng: -73.05,
    category: 'viewpoint',
    description: 'Ponto de observação privilegiado do glaciar mais famoso do mundo.',
    image: 'https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'gas-1',
    name: 'Posto YPF - Tres Lagos',
    lat: -49.601,
    lng: -71.442,
    category: 'fuel',
    description: 'Parada vital na Ruta 40 entre Calafate e Chaltén. Sempre verifique o estoque.',
  },
  {
    id: 'water-2',
    name: 'Água Potável - Rio Baker',
    lat: -47.821,
    lng: -73.045,
    category: 'water',
    description: 'Ponto de coleta de água de degelo. Filtragem recomendável para máxima segurança.',
  },
  {
    id: 'repair-jalapao',
    name: 'Oficina do Ciclista - Jalapão',
    lat: -10.518,
    lng: -46.417,
    category: 'repair',
    description: 'Ponto de apoio vital para ciclistas no deserto do Jalapão.',
  },
  {
    id: 'water-huaraz',
    name: 'Ponto de Água Mineral - Huaraz',
    lat: -9.530,
    lng: -77.527,
    category: 'water',
    description: 'Fonte natural de água potável monitorada pela comunidade local.',
  },
  {
    id: 'arg-1',
    name: 'Hostel de Montanha - El Chaltén',
    lat: -49.331,
    lng: -72.886,
    category: 'hostel',
    description: 'Base ideal para trekkers. Ambiente rústico e acolhedor.',
  },
  {
    id: 'fuel-remote-1',
    name: 'Posto Remoto - Villa O\'Higgins',
    lat: -48.468,
    lng: -72.558,
    category: 'fuel',
    description: 'Último posto de combustível antes da balsa para o Glaciar O\'Higgins.',
  },
  {
    id: 'water-mineral-chalten',
    name: 'Fonte Água Cristalina - Lago del Desierto',
    lat: -48.966,
    lng: -72.933,
    category: 'water',
    description: 'Ponto de água potável no final da Carretera Austral.',
  },
  {
    id: 'repair-motos-puerto-natales',
    name: 'Mecânica Patagônia - Puerto Natales',
    lat: -51.727,
    lng: -72.502,
    category: 'repair',
    description: 'Especialista em motos e veículos de expedição.',
  },
  {
    id: 'offroad-1',
    name: 'Trecho Terrestre Crítico - Paso Mayer',
    lat: -48.243,
    lng: -72.247,
    category: 'terrestre',
    description: 'Travessia de rio e trilha de terra técnica. Apenas 4x4 ou bicicletas de expedição.',
  },
  {
    id: 'gas-remote-2',
    name: 'Auto Posto Gasolina - Jalapão/Mateiros',
    lat: -10.548,
    lng: -46.421,
    category: 'fuel',
    description: 'Ponto crucial de abastecimento no coração do Jalapão.',
  }
];

const categories = [
  { id: 'all', name: 'Todos', icon: Globe, color: '#ff641d' },
  { id: 'water', name: 'Água', icon: Droplets, color: '#00d4ff' },
  { id: 'terrestre', name: 'Terrestre', icon: Mountain, color: '#f59e0b' },
  { id: 'fuel', name: 'Posto Gasolina', icon: Fuel, color: '#fff200' },
  { id: 'repair', name: 'Oficina', icon: Hammer, color: '#f59e0b' },
  { id: 'danger', name: 'Perigo', icon: AlertTriangle, color: '#ff0000' },
  { id: 'safe_point', name: 'SEGURO', icon: ShieldCheck, color: '#10b981' },
  { id: 'camping', name: 'Camping', icon: Tent, color: '#ff641d' },
  { id: 'hostel', name: 'Hostels', icon: Coffee, color: '#ff9d00' },
];

function createCustomIcon(color: string, glow: boolean = true) {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative flex items-center justify-center">
        ${glow ? `<div style="border-color: ${color}; box-shadow: inset 0 0 8px ${color}" class="absolute w-7 h-7 rounded-full border opacity-30 animate-pulse"></div>` : ''}
        <div style="background-color: ${color}; box-shadow: 0 0 15px ${color}" class="w-2.5 h-2.5 rounded-full border-1 border-[#0b0c0d] relative z-10 transition-transform hover:scale-125"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function userLocationIcon() {
  return L.divIcon({
    className: 'user-location-icon',
    html: `
      <div class="relative">
        <div class="w-5 h-5 bg-[#ff641d] rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,100,29,0.8)] relative z-10"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#ff641d] opacity-20 rounded-full animate-pulse"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// --- Map Controllers ---

function MapController({ center, zoom }: { center?: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

function MapEventsHandler({ onMapClick, active }: { onMapClick: (latlng: L.LatLng) => void, active: boolean }) {
  useMapEvents({
    click: (e) => {
      if (active) onMapClick(e.latlng);
    }
  });
  return null;
}

// --- Main Component ---

export default function AdventureMap() {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.603, -58.381]);
  const [mapZoom, setMapZoom] = useState(4);
  const [isSearching, setIsSearching] = useState(false);
  const [isExpeditionMode, setIsExpeditionMode] = useState(false);
  
  // Routing State
  const [isTracing, setIsTracing] = useState(false);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [transportMode, setTransportMode] = useState<'bike' | 'walk' | 'car'>('bike');

  // GPS Sharing State
  const [isSharing, setIsSharing] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  
  // Stats
  const totalDistance = useMemo(() => {
    if (routePoints.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
        const p1 = L.latLng(routePoints[i]);
        const p2 = L.latLng(routePoints[i+1]);
        dist += p1.distanceTo(p2);
    }
    return dist / 1000; // km
  }, [routePoints]);

  const estimatedTime = useMemo(() => {
    const speeds = { bike: 15, walk: 5, car: 60 }; // km/h
    const hours = totalDistance / speeds[transportMode];
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }, [totalDistance, transportMode]);

  const elevationData = useMemo(() => {
    if (routePoints.length === 0) return [];
    return routePoints.map((_, i) => ({
      name: i,
      alt: 400 + Math.sin(i * 0.5) * 200 + Math.random() * 50
    }));
  }, [routePoints]);

  // Geolocation Logic
  const handleLocateUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(14);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (isExpeditionMode) handleLocateUser();
  }, [isExpeditionMode, handleLocateUser]);

  // Real-time sharing
  useEffect(() => {
    let watchId: number | null = null;
    if (isSharing && auth.currentUser) {
      const id = auth.currentUser.uid;
      setTrackingId(id);
      watchId = navigator.geolocation.watchPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setDoc(doc(db, 'trackingSessions', id), {
          userName: auth.currentUser?.displayName || 'Explorer',
          lat: latitude,
          lng: longitude,
          updatedAt: serverTimestamp(),
          active: true
        }, { merge: true });
      }, null, { enableHighAccuracy: true });
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [isSharing]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    
    // First, check internal points
    const internalMatch = initialPoints.find(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase() === searchQuery.toLowerCase()
    );

    if (internalMatch) {
      setMapCenter([internalMatch.lat, internalMatch.lng]);
      setMapZoom(18);
      setIsSearching(false);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data?.[0]) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setMapZoom(16); // Smart Zoom Tactical
      }
    } finally {
      setIsSearching(false);
    }
  };

  const filteredPoints = useMemo(() => {
    return initialPoints.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className={cn(
      "fixed inset-0 z-[100] bg-[#0b0c0d] transition-colors duration-1000",
      isExpeditionMode ? "p-0" : "p-0"
    )}>
      <SEO title="Tactical GPS Explorer — Atlas do Aventureiro" description="Sistema de navegação tática para expedições independentes." />

      {/* --- HUD OVERLAYS --- */}

      {/* Left Sidebar HUD (Categories - PC ONLY) */}
      <div className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-[2000] flex-col gap-2 pointer-events-auto">
         <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-sm mb-2">
            <Filter size={14} className="text-[#ff641d] mx-auto" />
         </div>
         {categories.map(cat => (
           <button
             key={cat.id}
             onClick={() => setSelectedCategory(cat.id)}
             className={cn(
               "w-12 h-12 rounded-sm border backdrop-blur-md transition-all flex items-center justify-center group relative",
               selectedCategory === cat.id 
                 ? "bg-[#ff641d] border-[#ff641d] text-white shadow-[0_0_15px_rgba(255,100,29,0.4)]" 
                 : "bg-black/60 border-white/10 text-white/20 hover:border-[#ff641d]/40"
             )}
             title={cat.name}
           >
             <cat.icon size={18} />
             <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#0b0c0d] text-white text-[8px] font-mono uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-3 group-hover:translate-x-0 border border-white/5 whitespace-nowrap z-[3000]">
               {cat.name.toUpperCase()}
             </div>
           </button>
         ))}
      </div>

      {/* Top Header Control Panel */}
      <div className="absolute top-0 left-0 right-0 z-[2000] p-4 md:p-6 pointer-events-none flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Branding Left */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3 pointer-events-auto"
          >
             <div className="p-2 bg-[#ff641d] text-white rounded-sm shadow-[0_0_20px_rgba(255,100,29,0.4)]">
               <Navigation2 size={24} className={isExpeditionMode ? "animate-pulse" : ""} />
             </div>
             <div>
                <div className="text-[8px] font-mono text-[#ff641d] uppercase tracking-[0.4em] font-black">SYSTEM_OS // v2.5</div>
                <h1 className="text-xl font-display font-black text-white uppercase tracking-tighter leading-none">GPS_TACTICAL<span className="text-[#ff641d]">.</span>SYSTEM</h1>
             </div>
          </motion.div>

          {/* Mode Controls Right */}
          <div className="flex gap-2 pointer-events-auto self-end md:self-auto">
             <button 
               onClick={() => setIsExpeditionMode(!isExpeditionMode)}
               className={cn(
                 "h-14 px-5 rounded-sm font-mono font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border shadow-2xl overflow-hidden relative group",
                 isExpeditionMode 
                   ? "bg-[#ff641d] border-[#ff641d] text-white" 
                   : "bg-black/80 border-white/10 text-white/40 hover:border-[#ff641d]/40"
               )}
             >
               <Zap size={14} className={isExpeditionMode ? "animate-pulse" : ""} /> 
               <span>{isExpeditionMode ? "EXP_ON" : "EXPEDIÇÃO"}</span>
             </button>
             
             <div className="flex gap-1 h-14 bg-black/80 backdrop-blur-md border border-white/10 rounded-sm p-1">
                <button 
                  onClick={() => window.history.back()}
                  className="w-10 flex items-center justify-center rounded-xs transition-all text-white/40 hover:bg-white/5 border-r border-white/5 mr-1"
                  title="VOLTAR"
                >
                  <ArrowUpRight size={16} className="rotate-[225deg]" />
                </button>
                {['bike', 'walk', 'car'].map((mode: any) => (
                  <button 
                    key={mode}
                    onClick={() => setTransportMode(mode)}
                    className={cn(
                      "w-12 flex items-center justify-center rounded-xs transition-all",
                      transportMode === mode ? "bg-[#ff641d] text-white shadow-[0_0_15px_rgba(255,100,29,0.3)]" : "text-white/20 hover:bg-white/5"
                    )}
                  >
                    {mode === 'bike' && <Bike size={18} />}
                    {mode === 'walk' && <MapPin size={18} />}
                    {mode === 'car' && <Navigation size={18} />}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Central HUD Row: Search & Metrics */}
        <div className="flex flex-col items-center gap-4 w-full pointer-events-none">
           {/* Central Prominent Search Bar */}
           <div className="w-full max-w-2xl pointer-events-auto">
              <form onSubmit={handleSearch} className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#ff641d] transition-colors" size={18} />
                 <input 
                   type="text" 
                   placeholder="DIGITE_DESTINO_OU_PONTO_DE_INTERESSE..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-black/90 backdrop-blur-2xl border border-white/10 rounded-sm h-14 pl-12 pr-4 text-[11px] font-mono tracking-[0.2em] focus:outline-none focus:border-[#ff641d] transition-all text-white placeholder:text-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] uppercase"
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3 items-center">
                   {isSearching && <div className="w-4 h-4 border-2 border-[#ff641d]/20 border-t-[#ff641d] rounded-full animate-spin" />}
                   <div className="hidden md:block h-4 w-[1px] bg-white/10" />
                   <kbd className="hidden md:block text-[8px] font-mono text-white/20 border border-white/10 px-1.5 py-0.5 rounded-xs">ENTER</kbd>
                 </div>
              </form>
           </div>

           {/* Expedition Metrics (Adaptive) */}
           {isExpeditionMode && (
             <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-wrap justify-center gap-4 md:gap-6 bg-black/80 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-sm shadow-2xl pointer-events-auto max-w-full overflow-x-auto no-scrollbar"
             >
                <OperationalMetric label="WIND" value="24.2 KM/H" icon={Wind} />
                <div className="hidden md:block w-[1px] bg-white/10" />
                <OperationalMetric label="TEMP" value="12.5°C" icon={Thermometer} />
                <div className="hidden md:block w-[1px] bg-white/10" />
                <OperationalMetric label="ALT" value="2.450M" icon={Mountain} />
                <div className="hidden md:block w-[1px] bg-white/10" />
                <div className="flex gap-4">
                  <OperationalMetric label="LAT" value={userLocation ? userLocation[0].toFixed(4) : "---"} icon={MapPin} />
                  <OperationalMetric label="LNG" value={userLocation ? userLocation[1].toFixed(4) : "---"} icon={MapPin} />
                </div>
             </motion.div>
           )}
        </div>
      </div>

      {/* Responsive Categories Bar (Mobile-only bottom bar) */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-[2000] pointer-events-none"
        >
          <div className="w-full pointer-events-auto bg-black/90 backdrop-blur-xl border border-white/10 rounded-sm p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
             <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-2">
                <Filter size={10} className="text-[#ff641d]" />
                <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.3em]">CATEGORIAS_DE_SUPORTE</span>
             </div>
             <div className="w-full overflow-x-auto no-scrollbar">
               <div className="flex gap-2 min-w-max pb-1">
                 {categories.map(cat => (
                   <button
                     key={cat.id}
                     onClick={() => setSelectedCategory(cat.id)}
                     className={cn(
                       "h-10 px-4 rounded-sm border backdrop-blur-md transition-all flex items-center gap-2 group whitespace-nowrap",
                       selectedCategory === cat.id 
                         ? "bg-[#ff641d] border-[#ff641d] text-white shadow-[0_0_15px_rgba(255,100,29,0.3)]" 
                         : "bg-white/[0.03] border-white/5 text-white/40 hover:border-[#ff641d]/40"
                     )}
                   >
                     <cat.icon size={14} className={cn(selectedCategory === cat.id ? "text-white" : "text-[#ff641d]")} />
                     <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{cat.name}</span>
                   </button>
                 ))}
               </div>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Right Action Stack (Vertical controls) */}
      <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-[2000] flex flex-col gap-2 pointer-events-auto">
         <button 
           onClick={handleLocateUser} 
           title="MINHA LOCALIZAÇÃO"
           className="w-12 h-12 bg-black/80 border border-white/10 rounded-sm text-[#ff641d] hover:bg-[#ff641d] hover:text-white transition-all shadow-xl flex items-center justify-center group relative"
         >
            <LocateFixed size={20} />
            <div className="absolute right-full mr-3 px-2 py-1 bg-black text-[8px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 border border-white/10 pointer-events-none uppercase">Minha_Posição</div>
         </button>
         
         <button 
           onClick={() => setIsTracing(!isTracing)}
           className={cn(
             "w-12 h-12 rounded-sm border backdrop-blur-md transition-all flex items-center justify-center group relative",
             isTracing ? "bg-[#ff641d] border-[#ff641d] text-white" : "bg-black/60 border-white/10 text-white/20 hover:border-[#ff641d]/40"
           )}
           title="TRAÇAR ROTA"
         >
           <Ruler size={18} />
           <div className="absolute right-full mr-3 px-2 py-1 bg-black text-[8px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 border border-white/10 pointer-events-none uppercase">Traçar_Rota</div>
         </button>

         <button 
           onClick={() => setIsSharing(!isSharing)} 
           title="TRACKING GPS LIVE"
           className={cn(
             "w-12 h-12 border rounded-sm transition-all shadow-xl flex items-center justify-center group relative", 
             isSharing ? "bg-blue-500 border-blue-500 animate-pulse text-white" : "bg-black/80 border-white/10 text-white/20 hover:border-blue-500/40"
           )}
         >
            <Radio size={20} />
            <div className="absolute right-full mr-3 px-2 py-1 bg-black text-[8px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 border border-white/10 pointer-events-none uppercase">Live_Tracking</div>
         </button>

         <div className="h-[1px] bg-white/5 my-2" />

         <div className="flex flex-col bg-black/40 border border-white/10 rounded-sm overflow-hidden text-[8px] font-mono text-white/20">
            <div className="p-2 border-b border-white/5 text-center">ZOOM</div>
            <button onClick={() => setMapZoom(z => Math.min(z + 1, 18))} className="p-3 hover:bg-white/5 hover:text-white transition-colors"><Plus size={14} /></button>
            <button onClick={() => setMapZoom(z => Math.max(z - 1, 3))} className="p-3 hover:bg-white/5 hover:text-white transition-colors"><Minus size={14} /></button>
         </div>
      </div>

      {/* Bottom Route / Elevation HUD */}
      <AnimatePresence>
        {(routePoints.length > 0) && (
          <motion.div 
            initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
            className="absolute bottom-0 left-0 right-0 z-[2100] pointer-events-auto"
          >
             <div className="max-w-4xl mx-auto bg-black/90 backdrop-blur-2xl border-t border-x border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                   <div className="flex gap-10">
                      <div className="flex flex-col gap-1">
                         <div className="text-[7px] font-mono text-white/20 uppercase tracking-[0.3em]">TOTAL_KM</div>
                         <div className="text-xl font-display font-black text-white">{totalDistance.toFixed(2)} KM</div>
                      </div>
                      <div className="flex flex-col gap-1">
                         <div className="text-[7px] font-mono text-white/20 uppercase tracking-[0.3em]">ESTIMATED_TIME</div>
                         <div className="text-xl font-display font-black text-[#ff641d]">{estimatedTime}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                         <div className="text-[7px] font-mono text-white/20 uppercase tracking-[0.3em]">WAYPOINTS</div>
                         <div className="text-xl font-display font-black text-white/40">{routePoints.length}</div>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => setRoutePoints([])} className="h-10 px-4 border border-white/10 text-white/40 hover:text-red-500 hover:border-red-500/30 text-[8px] font-mono uppercase font-black tracking-widest transition-all">LIMPAR</button>
                      <button className="h-10 px-6 bg-[#ff641d] text-white text-[8px] font-mono uppercase font-black tracking-widest hover:bg-white hover:text-[#ff641d] transition-all">INICIAR_EXP</button>
                   </div>
                </div>
                <ElevationChart data={elevationData} />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAP CORE --- */}
      <div className="w-full h-full">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ width: '100%', height: '100%', background: '#0b0c0d' }}
          zoomControl={false}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <MapEventsHandler onMapClick={(latlng) => setRoutePoints(p => [...p, [latlng.lat, latlng.lng]])} active={isTracing} />
          
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {routePoints.length > 1 && (
            <Polyline positions={routePoints} color="#ff641d" weight={3} dashArray="5, 8" opacity={0.8} />
          )}

          {routePoints.map((p, i) => (
            <Marker 
              key={`route-${i}`} 
              position={p} 
              icon={L.divIcon({
                className: 'route-marker',
                html: `<div class="w-3 h-3 bg-[#ff641d] border-2 border-white rounded-full ${i === 0 ? 'ring-4 ring-[#ff641d]/20' : ''}"></div>`,
                iconSize: [12, 12], iconAnchor: [6, 6],
              })}
            />
          ))}

          {userLocation && (
            <Marker position={userLocation} icon={userLocationIcon()}>
              <Popup className="custom-popup">
                <div className="p-3 bg-[#0b0c0d] text-center border border-white/5 min-w-[150px]">
                  <div className="text-[9px] font-mono text-[#ff641d] font-black uppercase tracking-widest mb-1">LOCALIZAÇÃO_GPS</div>
                  <div className="text-[7px] font-mono text-white/40 uppercase">SINAL_RECUPERADO // ESTÁVEL</div>
                </div>
              </Popup>
            </Marker>
          )}

          {filteredPoints.map(p => {
            const cat = categories.find(c => c.id === p.category) || categories[0];
            return (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={createCustomIcon(cat.color)}>
                <Popup className="custom-popup">
                  <div className="p-0 min-w-[240px] bg-[#0b0c0d] overflow-hidden rounded-sm">
                    {p.image && <img src={p.image} className="w-full h-32 object-cover grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                         <div className="p-1 px-2 border border-white/10 rounded-sm text-[#ff641d] text-[8px] font-bold uppercase tracking-widest"><cat.icon size={10} className="inline mr-1" /> {p.category}</div>
                      </div>
                      <h4 className="text-sm font-display font-black text-white uppercase tracking-tighter mb-1">{p.name}</h4>
                      <p className="text-[9px] text-white/40 uppercase font-mono leading-relaxed mb-4">{p.description}</p>
                      <button className="w-full h-8 bg-white/5 border border-white/10 text-white/60 text-[8px] font-mono font-bold uppercase tracking-widest hover:bg-[#ff641d] hover:text-white transition-all flex items-center justify-center gap-2">
                        <ArrowUpRight size={12} /> TRAÇAR_DESTINO
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { background: #0b0c0d !important; }
        .leaflet-popup-content-wrapper { background: #0b0c0d !important; padding: 0 !important; border: 1px solid rgba(255,255,255,0.05); }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip { background: #0b0c0d !important; border: 1px solid rgba(255,255,255,0.05); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
