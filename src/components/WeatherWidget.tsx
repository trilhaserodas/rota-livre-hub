import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Loader2 } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
}

interface WeatherWidgetProps {
  lat: number;
  lng: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lat, lng }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Using Open-Meteo API (Free, no key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
        );
        const data = await response.json();

        if (data.current_weather) {
          const cw = data.current_weather;
          
          // Map WMO Weather codes to descriptions (simplified)
          const getCondition = (code: number) => {
            if (code <= 3) return 'sunny';
            if (code <= 67) return 'cloudy';
            return 'rainy';
          };

          const getDescription = (code: number) => {
            const codes: Record<number, string> = {
              0: 'Céu Limpo',
              1: 'Predom. Limpo',
              2: 'Parcial. Nublado',
              3: 'Nublado',
              45: 'Nevoeiro',
              51: 'Drizzle Leve',
              61: 'Chuva Leve',
              71: 'Neve Leve',
              95: 'Trovoada',
            };
            return codes[code] || 'Condições Variáveis';
          };

          setWeather({
            temp: Math.round(cw.temperature),
            windSpeed: cw.windspeed,
            description: getDescription(cw.weathercode),
            condition: getCondition(cw.weathercode)
          });
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 border-t border-white/5 animate-pulse">
        <Loader2 className="w-3 h-3 text-[#ff641d] animate-spin" />
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Consultando Satélite...</span>
      </div>
    );
  }

  if (error || !weather) return null;

  return (
    <div className="py-3 border-t border-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-white/50">
          <Cloud className="w-3 h-3" />
          <span className="text-[9px] font-display font-bold uppercase tracking-widest text-[#ff641d]">Clima Local</span>
        </div>
        <div className="flex items-center gap-1 text-white/40 text-[9px] font-mono">
          <Wind className="w-2.5 h-2.5" />
          {weather.windSpeed} km/h
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-sm p-2 border border-white/5 hover:bg-white/10 transition-colors duration-300">
        <div className="flex gap-2 items-center">
          <div className="p-1.5 bg-black/40 rounded-sm">
            {weather.condition === 'sunny' && <Sun className="w-3 h-3 text-yellow-500" />}
            {weather.condition === 'cloudy' && <Cloud className="w-3 h-3 text-blue-300" />}
            {weather.condition === 'rainy' && <CloudRain className="w-3 h-3 text-blue-500" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white tracking-tight leading-none mb-1">
              {weather.description}
            </span>
            <span className="text-[8px] text-white/30 uppercase font-mono tracking-tighter">Condição</span>
          </div>
        </div>
        
        <div className="flex gap-2 items-center border-l border-white/5 pl-2">
          <div className="p-1.5 bg-black/40 rounded-sm">
            <Thermometer className="w-3 h-3 text-orange-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white tracking-tight leading-none mb-1">
              {weather.temp}°C
            </span>
            <span className="text-[8px] text-white/30 uppercase font-mono tracking-tighter">Temperatura</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
