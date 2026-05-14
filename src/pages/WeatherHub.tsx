import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  ArrowLeft, 
  Zap, 
  Activity, 
  ShieldAlert,
  Loader2,
  Navigation,
  Thermometer,
  CloudLightning,
  Bike
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const REGIONS = [
  { id: 'sp', name: 'São Paulo', country: 'Brasil', lat: -23.55, lng: -46.63, sub: 'Metrópole_Sudeste' },
  { id: 'floripa', name: 'Florianópolis', country: 'Brasil', lat: -27.59, lng: -48.54, sub: 'Litoral_Sul' },
  { id: 'serra-sc', name: 'Serra Catarinense', country: 'Brasil', lat: -28.01, lng: -49.59, sub: 'Urubici_Altos' },
  { id: 'chapada', name: 'Chapada Diamantina', country: 'Brasil', lat: -12.56, lng: -41.38, sub: 'Lençóis_Sertão' },
  { id: 'patagonia', name: 'Patagonia', country: 'Argentina', lat: -49.33, lng: -72.88, sub: 'El_Chaltén_Andes' },
  { id: 'atacama', name: 'Atacama', country: 'Chile', lat: -22.91, lng: -68.20, sub: 'San_Pedro_Deserto' },
  { id: 'cusco', name: 'Cusco', country: 'Peru', lat: -13.53, lng: -71.97, sub: 'Valle_Sagrado' },
  { id: 'mendoza', name: 'Mendoza', country: 'Argentina', lat: -32.89, lng: -68.85, sub: 'Cordillera_Vino' },
  { id: 'ushuaia', name: 'Ushuaia', country: 'Argentina', lat: -54.80, lng: -68.30, sub: 'Fin_del_Mundo' },
  { id: 'austral', name: 'Carretera Austral', country: 'Chile', lat: -45.57, lng: -72.07, sub: 'Coyhaique_Patagonia' },
];

interface WeatherData {
  id: string;
  temp: number;
  wind: number;
  humidity: number;
  code: number;
  precip: number;
  description: string;
  status: 'SAFE' | 'ATTENTION' | 'ALERT';
  bikeCondition: string;
}

export default function WeatherHub() {
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllWeather() {
      const results: Record<string, WeatherData> = {};
      
      try {
        await Promise.all(REGIONS.map(async (region) => {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}&longitude=${region.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&hourly=precipitation_probability&forecast_days=1`
          );
          const data = await res.json();
          
          if (data.current) {
            const code = data.current.weather_code;
            const wind = Math.round(data.current.wind_speed_10m);
            const precip = data.current.precipitation;
            const temp = Math.round(data.current.temperature_2m);
            const prob = data.hourly?.precipitation_probability?.[0] || 0;

            let status: 'SAFE' | 'ATTENTION' | 'ALERT' = 'SAFE';
            if (wind > 40 || code >= 95 || (code >= 71 && code <= 77)) status = 'ALERT';
            else if (wind > 20 || code >= 51 || precip > 2) status = 'ATTENTION';

            let bikeCondition = 'BOA PARA PEDAL';
            if (wind > 25) bikeCondition = 'VENTO LATERAL FORTE';
            else if (prob > 50 || precip > 5) bikeCondition = 'CHUVA INTENSA PREVISTA';
            else if (temp < 0) bikeCondition = 'FRIO EXTREMO - RISCO GELO';

            results[region.id] = {
              id: region.id,
              temp,
              wind,
              humidity: data.current.relative_humidity_2m,
              code,
              precip: prob,
              description: getWeatherDesc(code),
              status,
              bikeCondition
            };
          }
        }));
        setWeatherData(results);
      } catch (err) {
        console.error("Failed to fetch fleet weather:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllWeather();
    const interval = setInterval(fetchAllWeather, 1000 * 60 * 15); // 15 min
    return () => clearInterval(interval);
  }, []);

  const getWeatherDesc = (code: number) => {
    if (code === 0) return "Céu Limpo";
    if (code <= 3) return "Nublado";
    if (code >= 51 && code <= 67) return "Chuva / Garoa";
    if (code >= 71 && code <= 77) return "Neve";
    if (code >= 80 && code <= 82) return "Pancadas";
    if (code >= 95) return "Tempestade";
    return "Instável";
  };

  const getStatusColor = (status: string) => {
    if (status === 'SAFE') return 'text-green-500';
    if (status === 'ATTENTION') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBg = (status: string) => {
    if (status === 'SAFE') return 'bg-green-500/10 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
    if (status === 'ATTENTION') return 'bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]';
    return 'bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
  };

  return (
    <div className="min-h-screen bg-[#0b0c0d] pt-24 pb-32 px-6 md:px-12 relative overflow-hidden">
      {/* Background Map elements */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-white rounded-full animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-[500px] h-[500px] border border-white rotate-45" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#ff641d]/10 border border-[#ff641d]/20 rounded-full">
                  <Activity className="text-[#ff641d] animate-pulse" size={14} />
                  <span className="text-[10px] font-mono text-[#ff641d] uppercase tracking-[0.4em] font-black">Live_Ops_Signal</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-black text-white uppercase tracking-tighter leading-none">
                HUB<span className="text-[#ff641d]">.</span>CLIMA
                <span className="block text-2xl md:text-3xl text-white/20 mt-2">OPERACIONAL // LATAM_GRID</span>
              </h1>
            </div>

            <Link 
              to="/alert-hub" 
              className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-mono font-bold text-white/40 hover:text-white uppercase tracking-widest transition-all"
            >
              <ArrowLeft size={16} /> Voltar ao Centro de Alerta
            </Link>
          </header>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6">
              <Loader2 className="text-[#ff641d] animate-spin" size={48} />
              <div className="text-[10px] font-mono text-[#ff641d] uppercase tracking-[0.5em] animate-pulse">Sincronizando_Terminal_Meteorológico</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {REGIONS.map((region, idx) => {
                  const weather = weatherData[region.id];
                  if (!weather) return null;

                  return (
                    <motion.div
                      key={region.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative"
                    >
                      {/* Tactical HUD Frame */}
                      <div className={`dashboard-card h-full p-6 border transition-all duration-500 overflow-hidden relative group/inner ${getStatusBg(weather.status)} hover:border-[#ff641d]/40`}>
                        {/* Glow corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ff641d]/40 opacity-0 group-hover/inner:opacity-100 transition-opacity" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#ff641d]/40 opacity-0 group-hover/inner:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#ff641d]/40 opacity-0 group-hover/inner:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ff641d]/40 opacity-0 group-hover/inner:opacity-100 transition-opacity" />
                        {/* Status Light */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full animate-pulse ${
                             weather.status === 'SAFE' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
                             weather.status === 'ATTENTION' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 
                             'bg-red-500 shadow-[0_0_10px_#ef4444]'
                           }`} />
                           <span className={`text-[8px] font-mono font-black uppercase tracking-widest ${getStatusColor(weather.status)}`}>
                             {weather.status}
                           </span>
                        </div>

                        <div className="mb-8">
                          <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em] mb-1">{region.sub}</div>
                          <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight group-hover:text-[#ff641d] transition-colors">
                            {region.name}
                          </h3>
                          <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">{region.country}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/20 uppercase text-[8px] font-mono font-bold tracking-widest">
                               <Thermometer size={10} /> Temp
                            </div>
                            <div className="text-3xl font-display font-black text-white leading-none">
                              {weather.temp}°
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/20 uppercase text-[8px] font-mono font-bold tracking-widest">
                               <Navigation size={10} /> Vento
                            </div>
                            <div className="text-2xl font-display font-black text-white/80 leading-none">
                              {weather.wind}<span className="text-[10px] opacity-40 ml-1">K/H</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-white/5 pt-6 mb-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-white/60">
                              <Droplets size={12} className="text-[#ff641d]" /> {weather.humidity}% <span className="opacity-30">UR</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-white/60">
                              <CloudRain size={12} className="text-[#ff641d]" /> {weather.precip}% <span className="opacity-30">CHANC_CHUVA</span>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1">CONDIÇÃO_LOCAL</div>
                             <div className="text-[10px] font-mono font-black text-[#ff641d] uppercase tracking-widest">{weather.description}</div>
                          </div>
                        </div>

                        {/* Bike Touring Condition Badge */}
                        <div className="mt-auto">
                          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-mono font-bold text-[9px] uppercase tracking-widest transition-all ${
                            weather.bikeCondition === 'BOA PARA PEDAL' 
                              ? 'bg-green-500/5 text-green-500/80 border-green-500/10' 
                              : 'bg-[#ff641d]/5 text-[#ff641d]/80 border-[#ff641d]/10'
                          }`}>
                            <Bike size={16} className={weather.bikeCondition === 'BOA PARA PEDAL' ? 'animate-bounce' : ''} />
                            {weather.bikeCondition}
                          </div>
                        </div>

                        {/* Tactical HUD lines */}
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff641d]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          <footer className="mt-20 pt-10 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ff641d]">
                  <ShieldAlert size={20} />
                </div>
                <div>
                   <h4 className="text-[10px] font-sans font-bold text-white uppercase tracking-widest">Protocolo de Segurança Estrada</h4>
                   <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-1">Sempre verifique o sinal local. Tripulação offline deve manter cautela extrema.</p>
                </div>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">Central_Monitoramento_v.4.0.1</span>
             </div>
          </footer>
        </div>
      </div>
  );
}
