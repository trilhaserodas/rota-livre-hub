import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TriangleAlert, 
  ShieldCheck, 
  Wind, 
  CloudRain, 
  Mountain, 
  Construction, 
  EyeOff,
  Zap,
  AlertOctagon
} from 'lucide-react';
import { cn } from '../lib/utils';

type RiskStatus = 'stable' | 'attention' | 'moderate' | 'critical';

interface Alert {
  id: string;
  type: string;
  level: RiskStatus;
  message: string;
  icon: any;
}

interface RiskRadarProps {
  lat?: number;
  lng?: number;
  selectedPointName?: string | null;
  hasActiveRoute?: boolean;
  className?: string;
}

const RiskRadar: React.FC<RiskRadarProps> = ({ 
  lat, 
  lng, 
  selectedPointName,
  hasActiveRoute,
  className 
}) => {
  // Mock logic to simulate different risks based on context
  // In a real app, this would fetch from a Risk/Weather API
  const alerts = useMemo(() => {
    const mockAlerts: Alert[] = [];
    
    // Seeded "randomness" based on coordinates to make it feel "live" 
    // but consistent for the same spot
    const seed = (lat || 0) + (lng || 0);
    const mod = (val: number) => Math.floor(Math.abs(val * 100)) % 100;
    
    if (!lat || !lng) return [];

    // Stability logic
    if (mod(seed) < 40) {
      mockAlerts.push({
        id: '1',
        type: 'ESTADO_GERAL',
        level: 'stable',
        message: 'OPERAÇÃO SEGURA NA REGIÃO',
        icon: ShieldCheck
      });
    } else if (mod(seed) < 70) {
      mockAlerts.push({
        id: '2',
        type: 'VISIBILIDADE',
        level: 'attention',
        message: 'NEBLINA EM TRECHOS DE SERRA',
        icon: EyeOff
      });
      mockAlerts.push({
        id: '3',
        type: 'CLIMA',
        level: 'attention',
        message: 'CHUVA MODERADA PREVISTA',
        icon: CloudRain
      });
    } else if (mod(seed) < 90) {
      mockAlerts.push({
        id: '4',
        type: 'ESTRADA',
        level: 'moderate',
        message: 'PISTA ESCORREGADIA / VENTOS',
        icon: Wind
      });
    } else {
      mockAlerts.push({
        id: '5',
        type: 'CRÍTICO',
        level: 'critical',
        message: 'RISCO DE DESLIZAMENTO ATIVO',
        icon: Mountain
      });
      mockAlerts.push({
        id: '6',
        type: 'BLOQUEIO',
        level: 'critical',
        message: 'ESTRADA PARCIALMENTE INTERDITADA',
        icon: AlertOctagon
      });
    }

    // Add route specific context if needed
    if (hasActiveRoute && mockAlerts.length < 3) {
      mockAlerts.push({
        id: 'route-1',
        type: 'LOGÍSTICA',
        level: 'attention',
        message: 'RECURSOS ESCASSOS NOS PRÓXIMOS 50KM',
        icon: Construction
      });
    }

    return mockAlerts;
  }, [lat, lng, hasActiveRoute]);

  const getStatusConfig = (level: RiskStatus) => {
    switch (level) {
      case 'stable':
        return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', glow: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]', label: 'ESTÁVEL' };
      case 'attention':
        return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]', label: 'ATENÇÃO' };
      case 'moderate':
        return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]', label: 'MODERADO' };
      case 'critical':
        return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]', label: 'CRÍTICO' };
      default:
        return { color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10', glow: '', label: 'N/A' };
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
         <div className="flex items-center gap-2">
            <TriangleAlert size={14} className="text-[#ff641d] animate-pulse" />
            <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em]">RADAR_DE_RISCO</span>
         </div>
         <div className="text-[7px] font-mono text-white/20 uppercase tracking-widest">
            {selectedPointName ? `SCAN: ${selectedPointName}` : 'SCAN: REGIONAL_HUD'}
         </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => {
            const config = getStatusConfig(alert.level);
            const Icon = alert.icon;
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-3 rounded-xs border flex items-center gap-3 transition-all",
                  config.bg, config.border, config.glow
                )}
              >
                <div className={cn("shrink-0", config.color)}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-white/60">
                      {alert.type}
                    </span>
                    <span className={cn("text-[7px] font-mono font-black uppercase tracking-widest", config.color)}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-white/80 leading-snug uppercase truncate">
                    {alert.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {alerts.length === 0 && (
          <div className="py-4 text-center border border-dashed border-white/10 opacity-20 bg-white/[0.01]">
            <span className="text-[8px] font-mono uppercase tracking-[0.3em]">ESTABELECENDO_CONEXÃO_SATELITAL...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <Zap size={10} className="text-[#ff641d]/40" />
        <span className="text-[7px] font-mono text-white/10 uppercase tracking-widest leading-none">
          MONITOR_RISCO_V1 // ATUALIZADO EM TEMPO REAL
        </span>
      </div>
    </div>
  );
};

export default RiskRadar;
