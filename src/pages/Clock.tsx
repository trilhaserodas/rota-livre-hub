import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { motion } from 'motion/react';
import { Sun, Moon, MapPin, Info } from 'lucide-react';
import SEO from '@/src/components/SEO';
import { cn } from '@/src/lib/utils';

const cities = [
  { name: 'São Paulo', country: 'Brasil', tz: 'America/Sao_Paulo', flag: '🇧🇷' },
  { name: 'Buenos Aires', country: 'Argentina', tz: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
  { name: 'Santiago', country: 'Chile', tz: 'America/Santiago', flag: '🇨🇱' },
  { name: 'Lima', country: 'Peru', tz: 'America/Lima', flag: '🇵🇪' },
  { name: 'Bogotá', country: 'Colômbia', tz: 'America/Bogota', flag: '🇨🇴' },
  { name: 'Cidade do México', country: 'México', tz: 'America/Mexico_City', flag: '🇲🇽' },
  { name: 'Quito', country: 'Equador', tz: 'America/Guayaquil', flag: '🇪🇨' },
  { name: 'La Paz', country: 'Bolívia', tz: 'America/La_Paz', flag: '🇧🇴' },
  { name: 'Montevidéu', country: 'Uruguai', tz: 'America/Montevideo', flag: '🇺🇾' },
  { name: 'Assunção', country: 'Paraguai', tz: 'America/Asuncion', flag: '🇵🇾' },
];

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 relative z-10">
      <SEO 
        title="Fusos Horários Hub - Horário Oficial América Latina" 
        description="Consulte o horário oficial em tempo real de todos os países da América Latina para planejar suas ligações e viagens."
      />

      <section className="pt-12 mb-12">
        <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">CORE_MODULE // CHRONO_LINK</div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-4 text-[#F8FAFC]">
          TIME_ZONES<span className="text-[#ff641d]">.</span>HUB
        </h1>
        <p className="text-[#F8FAFC]/40 text-sm font-medium max-w-xl">
          Sincronização continental. Monitore o tempo real através dos meridianos da América do Sul e Central.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cities.map((city, index) => {
          const timeString = formatInTimeZone(now, city.tz, 'HH:mm:ss');
          const dateString = formatInTimeZone(now, city.tz, 'EEE, dd MMM');
          const offset = formatInTimeZone(now, city.tz, 'xxx');
          const hour = parseInt(timeString.split(':')[0]);
          const isNight = hour < 6 || hour > 18;

          return (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="dashboard-card p-10 border-white/[0.03] group hover:glow-orange"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-[#ff641d]">{city.country}</span>
                  <h3 className="text-2xl font-display font-black tracking-tight text-[#F8FAFC] uppercase">{city.name}</h3>
                </div>
                <div className="text-[10px] font-mono text-white/10 uppercase tracking-widest bg-white/[0.02] px-3 py-1 border border-white/5">
                  GMT {offset}
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-5xl font-display font-black tracking-tighter text-[#F8FAFC] group-hover:text-[#ff641d] transition-colors leading-none mb-4">
                    {timeString}
                  </div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/20">
                    {dateString}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                   {isNight ? <Moon size={20} className="text-white/10" /> : <Sun size={20} className="text-[#ff641d]" />}
                   <div className="flex gap-1">
                      {[1,2,3,4].map(i => <div key={i} className={cn("w-1 h-3 bg-[#ff641d]/10", i <= 3 && "bg-[#ff641d]/40")}></div>)}
                   </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="dashboard-card p-10 mt-12 border-white/[0.03]">
        <div className="flex items-center gap-4 mb-8">
          <Info size={20} className="text-[#ff641d]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d]">OPS_INTEL: PROTOCOLO_HORÁRIO</h3>
        </div>
        <p className="text-xs text-[#F8FAFC]/30 leading-relaxed font-medium">
          Note que alguns países adotam horários de verão variáveis. Nossos dados são sincronizados com o protocolo NTP 
          internacional para garantir precisão de milissegundos para sua logística de fronteira.
        </p>
      </div>
    </div>
  );
}
