import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Shield, Wind, Thermometer, Users, Target, Search, 
  MapPin, Bike, Triangle, Compass, Info, AlertTriangle, CheckCircle2,
  Mountain, Car
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

// --- Types & Data ---

type VehicleType = 'bike' | 'moto' | 'overland' | 'motorhome';
type RegionID = 'patagonia' | 'atacama' | 'amazonia' | 'andes' | 'sertao' | 'mantiqueira' | 'uyuni' | 'lencois' | 'austral';

interface RegionData {
  id: RegionID;
  name: string;
  country: string;
  difficultyBase: {
    resistencia: number;
    isolamento: number;
    vento: number;
    frio: number;
    suporte: number;
    estrada: number;
  };
  alerts: string[];
}

const regions: RegionData[] = [
  {
    id: 'patagonia',
    name: 'PATAGÔNIA_EXTREMA',
    country: 'ARGENTINA/CHILE',
    difficultyBase: { resistencia: 8, isolamento: 9, vento: 10, frio: 9, suporte: 3, estrada: 6 },
    alerts: ['⚠️ VIOLENTOS VENTOS LATERAIS', '🥶 RISCO DE HIPOTERMIA', '🆘 ISOLAMENTO CRÍTICO']
  },
  {
    id: 'atacama',
    name: 'DESERTO_DO_ATACAMA',
    country: 'CHILE',
    difficultyBase: { resistencia: 9, isolamento: 10, vento: 4, frio: 6, suporte: 2, estrada: 7 },
    alerts: ['🔥 DESIDRATAÇÃO EXTREMA', '🆘 ZERO SUPORTE EM 400KM', '🏜️ TERRENO ARENOSO']
  },
  {
    id: 'amazonia',
    name: 'TRANSAMAZÔNICA_BR230',
    country: 'BRASIL',
    difficultyBase: { resistencia: 10, isolamento: 8, vento: 2, frio: 2, suporte: 4, estrada: 2 },
    alerts: ['🌧️ LAMA INSTÁVEL', '🦟 MALÁRIA GEAZONE', '🔧 SEM MECÂNICOS']
  },
  {
    id: 'andes',
    name: 'ANDES_CENTRAIS_HUAYHUASH',
    country: 'PERU',
    difficultyBase: { resistencia: 9, isolamento: 7, vento: 5, frio: 8, suporte: 5, estrada: 4 },
    alerts: ['🏔️ AR RAREFEITO (4000M+)', '⚠️ CURVAS PERIGOSAS', '🥶 NOITES CONGELANTES']
  },
  {
    id: 'uyuni',
    name: 'SALAR_DE_UYUNI',
    country: 'BOLIVIA',
    difficultyBase: { resistencia: 8, isolamento: 9, vento: 6, frio: 7, suporte: 2, estrada: 8 },
    alerts: ['🧂 CORROSÃO SALINA EXTREMA', '🧭 PERDA DE ORIENTAÇÃO VISUAL', '🆘 ZERO INFRAESTRUTURA']
  },
  {
    id: 'lencois',
    name: 'LENÇÓIS_MARANHENSES',
    country: 'BRASIL',
    difficultyBase: { resistencia: 7, isolamento: 6, vento: 8, frio: 1, suporte: 5, estrada: 1 },
    alerts: ['🏜️ AREIA FINA (SOFT SAND)', '⚠️ TRAÇÃO 4X4 REQUERIDA', '🔥 CALOR TROPICAL']
  },
  {
    id: 'austral',
    name: 'CARRETERA_AUSTRAL',
    country: 'CHILE',
    difficultyBase: { resistencia: 7, isolamento: 6, vento: 7, frio: 7, suporte: 6, estrada: 5 },
    alerts: ['⛴️ LOGÍSTICA DE BALSAS', '🌧️ CHUVA PERSISTENTE', '🚲 RIPADO TIPO "CALAMINA"']
  },
  {
    id: 'sertao',
    name: 'SERTÃO_DO_BRASIL',
    country: 'BRASIL',
    difficultyBase: { resistencia: 7, isolamento: 5, vento: 3, frio: 1, suporte: 6, estrada: 5 },
    alerts: ['🔥 CALOR SECO', '🌵 VEGETAÇÃO ESPINHOSA', '🚲 ROTA DE CASCALHO']
  },
  {
    id: 'mantiqueira',
    name: 'SERRA_DA_MANTIQUEIRA',
    country: 'BRASIL',
    difficultyBase: { resistencia: 6, isolamento: 4, vento: 3, frio: 5, suporte: 7, estrada: 6 },
    alerts: ['🟢 BOA INFRAESTRUTURA', '📈 GANHO DE ELEVAÇÃO AGUDO', '🌲 CLIMA DE MONTANHA']
  }
];

const vehicleModifiers: Record<VehicleType, Record<string, number>> = {
  bike: { resistencia: 2, suporte: -2, estrada: -2, vento: 3 },
  moto: { resistencia: 0, suporte: 0, estrada: 0, vento: 1 },
  overland: { resistencia: -2, suporte: 2, estrada: 2, vento: -1 },
  motorhome: { resistencia: -4, suporte: 4, estrada: 3, vento: -2 }
};

const vehicles = [
  { id: 'bike', name: 'BICICLETA', icon: Bike },
  { id: 'moto', name: 'MOTOCICLETA', icon: Triangle },
  { id: 'overland', name: '4X4_OVERLAND', icon: Car },
  { id: 'motorhome', name: 'MOTORHOME', icon: Compass },
];

// --- Sub-components ---

interface HUDIndicatorProps {
  label: string;
  value: number;
  icon: React.ElementType;
  delay?: number;
}

const HUDIndicator = ({ label, value, icon: Icon, delay = 0 }: HUDIndicatorProps) => {
  const displayValue = Math.min(Math.max(value, 1), 10);
  
  return (
    <div className="group space-y-2">
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-sm bg-[#ff641d]/10 border border-[#ff641d]/20 group-hover:bg-[#ff641d]/20 transition-all">
            <Icon size={12} className="text-[#ff641d]" />
          </div>
          <span className="text-[10px] font-mono font-black text-white/50 uppercase tracking-[0.15em] group-hover:text-white transition-colors">
            {label}
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#ff641d] tabular-nums font-black glow-orange">
          {displayValue}/10
        </div>
      </div>
      
      <div className="flex gap-1 h-3 items-center">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-full rounded-[1px] relative overflow-hidden bg-white/5"
          >
            <motion.div
              initial={false}
              animate={{ 
                height: i < displayValue ? '100%' : '0%',
                opacity: i < displayValue ? 1 : 0
              }}
              className={cn(
                "w-full bg-[#ff641d] shadow-[0_0_8px_rgba(255,100,29,0.4)]",
                i < displayValue && "after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/30 after:to-transparent"
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function TacticalHUD() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('bike');
  const [selectedRegion, setSelectedRegion] = useState<RegionData>(regions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Filter regions based on search
  const filteredRegions = useMemo(() => {
    if (!searchTerm) return regions;
    return regions.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const base = selectedRegion.difficultyBase;
    const mod = vehicleModifiers[selectedVehicle];
    
    return [
      { label: 'Resistência', value: base.resistencia + (mod.resistencia || 0), icon: Shield },
      { label: 'Isolamento', value: base.isolamento + (mod.isolamento || 0), icon: Target },
      { label: 'Vento', value: base.vento + (mod.vento || 0), icon: Wind },
      { label: 'Frio', value: base.frio + (mod.frio || 0), icon: Thermometer },
      { label: 'Suporte Humano', value: base.suporte + (mod.suporte || 0), icon: Users },
      { label: 'Estrada', value: base.estrada + (mod.estrada || 0), icon: Mountain },
    ];
  }, [selectedVehicle, selectedRegion]);

  // Handle Search UI
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowResults(false);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="bg-[#0b0c0d] border border-white/5 relative overflow-hidden group shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] rounded-sm">
      {/* HUD Frame Micro-details */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ff641d]"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ff641d]"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ff641d]"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ff641d]"></div>
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ff641d 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      
      {/* Decorative scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 z-50"></div>

      <div className="relative z-10 p-6 sm:p-10">
        {/* Header HUD */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff641d] animate-ping" />
              <span className="text-[10px] font-mono text-[#ff641d] font-black uppercase tracking-[0.4em]">
                RADAR_DE_DIFICULDADE // v2.0.4
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
              ANÁLISE<span className="text-[#ff641d]">.</span>TÁTICA<br />
              <span className="text-white/20">DA EXPEDIÇÃO</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow max-w-2xl">
            {/* Search Region */}
            <div className="relative">
              <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-2 flex items-center gap-2">
                <MapPin size={10} className="text-[#ff641d]" /> FILTRO_POR_REGIÃO
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text"
                  placeholder="BUSCAR_CONTINENTE_OU_CIRCUITO..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-sm pl-10 pr-4 text-[10px] font-mono text-white uppercase focus:outline-none focus:border-[#ff641d]/50 transition-all placeholder:text-white/10"
                />
                
                <AnimatePresence>
                  {showResults && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 z-[100] mt-2 bg-[#121417] border border-white/10 p-2 shadow-2xl max-h-64 overflow-y-auto scrollbar-hide"
                    >
                      {filteredRegions.length > 0 ? filteredRegions.map(r => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setSelectedRegion(r);
                            setShowResults(false);
                            setSearchTerm('');
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all mb-1 last:mb-0 flex justify-between items-center group/item",
                            selectedRegion.id === r.id ? "bg-[#ff641d] text-white" : "hover:bg-white/5 text-white/40"
                          )}
                        >
                          <span>{r.name}</span>
                          <span className="text-[8px] opacity-40 group-hover/item:opacity-100">{r.country}</span>
                        </button>
                      )) : (
                        <div className="p-4 text-[10px] font-mono text-white/20 uppercase text-center">Nenhum setor localizado.</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap size={10} className="text-[#ff641d]" /> MODO_DE_DESLOCAMENTO
              </div>
              <div className="flex gap-1.5 h-12">
                {vehicles.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.id as VehicleType)}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center border rounded-sm transition-all relative overflow-hidden group/btn",
                      selectedVehicle === v.id 
                        ? "bg-[#ff641d] border-[#ff641d] text-white" 
                        : "bg-white/[0.03] border-white/5 text-white/20 hover:border-white/20"
                    )}
                    title={v.name}
                  >
                    <v.icon size={16} />
                    {selectedVehicle === v.id && (
                      <motion.div 
                        layoutId="active-vehicle" 
                        className="absolute inset-0 bg-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Interface Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Stats Radar Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 bg-white/[0.01] p-6 sm:p-8 border border-white/5 rounded-sm relative">
            <div className="absolute top-2 right-4 text-[7px] font-mono text-white/10 uppercase tracking-[0.5em] hidden sm:block">DATA_STREAM_01</div>
            {stats.map((ind, i) => (
              <HUDIndicator
                key={ind.label}
                label={ind.label}
                value={ind.value}
                icon={ind.icon}
                delay={i * 0.05}
              />
            ))}
          </div>

          {/* Intel & Messaging */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="dashboard-card border-none p-0 flex-grow bg-none overflow-hidden flex flex-col">
              <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em] mb-4 font-black flex items-center gap-2">
                <Info size={12} className="text-[#ff641d]" /> RELATÓRIO_OPS_DINÂMICO
              </div>
              
              <div className="bg-[#121417] border border-white/5 p-6 space-y-4 flex-grow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
                   <Compass size={64} className="rotate-12" />
                </div>
                
                <h4 className="text-[12px] font-mono font-black text-[#ff641d] uppercase tracking-widest flex items-center gap-2">
                  SETOR: {selectedRegion.name}
                </h4>
                
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest font-medium border-l border-white/10 pl-4 py-2 italic font-mono">
                  {selectedVehicle === 'bike' && "⚠️ ALTÍSSIMO ESFORÇO HUMANO. PLANEJAMENTO DE CALORIAS E HIDRATAÇÃO É MANDATÓRIO."}
                  {selectedVehicle === 'motorhome' && "🟢 TERRENO ESTÁVEL NO SETOR PRINCIPAL. POSSIBILIDADE DE SELF-CONTAINED TOTAL."}
                  {selectedVehicle === 'moto' && "🟠 TRAÇÃO E AGILIDADE EXTREMAS REQUERIDAS. VENTO LATERAL PODE SER FATAL."}
                  {selectedVehicle === 'overland' && "🔵 AUTONOMIA DE COMBUSTÍVEL É O GARGALO TÁTICO DESTE QUADRANTE."}
                </p>

                <div className="pt-4 space-y-2">
                   <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">ALERTAS_DE_SEGURANÇA:</div>
                   <div className="space-y-1.5">
                     {selectedRegion.alerts.map((alert, i) => (
                       <div key={i} className="flex items-center gap-2 text-[9px] font-mono text-white tracking-widest bg-white/[0.02] p-2 border border-white/5">
                         <span className="text-[#ff641d] shrink-0">::</span> {alert}
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-4">
                   <div className="flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-green-500" />
                      <span className="text-[7px] font-mono text-white/40 uppercase">BIO_LINK: ON</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <AlertTriangle size={10} className="text-yellow-500 animate-pulse" />
                      <span className="text-[7px] font-mono text-white/40 uppercase">ENERV_HIGH</span>
                   </div>
                </div>
                <span className="text-[8px] font-mono text-[#ff641d] uppercase font-black tracking-widest animate-pulse cursor-pointer hover:text-white transition-colors">
                  SOLICITAR_LOGÍSTICA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Mesh */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ff641d]/[0.05] rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
}

