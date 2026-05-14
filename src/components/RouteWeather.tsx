import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  isDay: boolean;
}

const getWeatherIcon = (code: number, isDay: boolean) => {
  if (code === 0) return <Sun className="text-yellow-400" size={16} />;
  if (code <= 3) return <Cloud className="text-gray-400" size={16} />;
  if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400" size={16} />;
  if (code >= 71 && code <= 77) return <CloudSnow className="text-white" size={16} />;
  if (code >= 95) return <AlertTriangle className="text-red-500" size={16} />;
  return <Cloud className="text-gray-400" size={16} />;
};

const getWeatherDesc = (code: number) => {
  if (code === 0) return "Céu Limpo";
  if (code <= 3) return "Parcialmente Nublado";
  if (code >= 51 && code <= 67) return "Chuva / Garoa";
  if (code >= 71 && code <= 77) return "Neve";
  if (code >= 80 && code <= 82) return "Pancadas de Chuva";
  if (code >= 95) return "Tempestade";
  return "Condições Estáveis";
};

export default function RouteWeather({ lat, lng }: { lat: number; lng: number }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m`
        );
        const data = await res.json();
        
        if (data.current) {
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            windSpeed: Math.round(data.current.wind_speed_10m),
            humidity: data.current.relative_humidity_2m,
            weatherCode: data.current.weather_code,
            isDay: data.current.is_day === 1,
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="py-4 border-t border-white/5 mt-4">
        <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em] mb-2">Sincronizando_Meteorologia...</div>
        <div className="flex gap-4 animate-pulse">
          <div className="h-3 w-16 bg-white/5 rounded"></div>
          <div className="h-3 w-16 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) return (
    <div className="py-4 border-t border-white/5 mt-4">
      <div className="text-[8px] font-mono text-red-500/40 uppercase tracking-[0.3em]">Erro_Sinal_Meteorológico</div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="py-4 border-t border-white/5 mt-4"
    >
      <div className="text-[8px] font-mono text-[#ff641d] uppercase tracking-[0.3em] mb-3 font-bold flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-[#ff641d] animate-pulse" />
        Condições_Atuais
      </div>
      
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.weatherCode, weather.isDay)}
          <span className="text-[12px] font-mono font-black text-white uppercase tracking-tight">
            {weather.temperature}°C
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Wind size={12} className="text-[#ff641d]/40" />
          <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
            {weather.windSpeed} <span className="text-[8px] opacity-40">km/h</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Droplets size={12} className="text-[#ff641d]/40" />
          <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
            {weather.humidity}<span className="text-[8px] opacity-40">% UR</span>
          </span>
        </div>

        <div className="text-[9px] font-mono text-[#ff641d] uppercase tracking-[0.1em] ml-auto font-bold px-2 py-0.5 bg-[#ff641d]/10 border border-[#ff641d]/20 rounded">
          {getWeatherDesc(weather.weatherCode)}
        </div>
      </div>
    </motion.div>
  );
}
