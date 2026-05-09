import { useState } from 'react';
import { motion } from 'motion/react';
import { Fuel, Scale, Ruler, ArrowRight, Info, RefreshCw } from 'lucide-react';
import SEO from '@/src/components/SEO';
import { cn } from '@/src/lib/utils';

export default function Calculators() {
  const [activeTab, setActiveTab] = useState<'fuel' | 'backpack' | 'units'>('fuel');

  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 relative z-10">
      <SEO 
        title="Calculadoras de Viagem Hub - Logística de Estrada" 
        description="Ferramentas essenciais para planejar sua autonomia de combustível, peso de carga e conversões técnicas."
      />

      <section className="pt-12 mb-12">
        <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">CORE_MODULE // LOGISTICS_SOLUTIONS</div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-4 text-[#F8FAFC]">
          OPS_CALCS<span className="text-[#ff641d]">.</span>PRTCL
        </h1>
        <p className="text-[#F8FAFC]/40 text-sm font-medium max-w-xl">
          Protocolos de cálculo para travessias continentais. Otimize sua carga e combustível para territórios hostis.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
        <button
          onClick={() => setActiveTab('fuel')}
          className={cn(
            "px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.3em] transition-all relative",
            activeTab === 'fuel' ? "text-[#ff641d]" : "text-[#F8FAFC]/30 hover:text-white"
          )}
        >
          Autonomia_Fuel
          {activeTab === 'fuel' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff641d]" />}
        </button>
        <button
          onClick={() => setActiveTab('backpack')}
          className={cn(
            "px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.3em] transition-all relative",
            activeTab === 'backpack' ? "text-[#ff641d]" : "text-[#F8FAFC]/30 hover:text-white"
          )}
        >
          Cargo_Weights
          {activeTab === 'backpack' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff641d]" />}
        </button>
        <button
          onClick={() => setActiveTab('units')}
          className={cn(
            "px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.3em] transition-all relative",
            activeTab === 'units' ? "text-[#ff641d]" : "text-[#F8FAFC]/30 hover:text-white"
          )}
        >
          Unit_Conversion
          {activeTab === 'units' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff641d]" />}
        </button>
      </div>

      <div className="dashboard-card p-10 md:p-14 border-white/[0.03] mb-12">
        {activeTab === 'fuel' && <FuelCalculator />}
        {activeTab === 'backpack' && <BackpackCalculator />}
        {activeTab === 'units' && <UnitConverter />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-card p-10 border-white/[0.03]">
          <div className="flex items-center gap-4 mb-8">
            <Info size={20} className="text-[#ff641d]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d]">OPS_INTEL: PROTOCOLO</h3>
          </div>
          <p className="text-xs text-[#F8FAFC]/30 leading-relaxed font-medium">
            Em travessias de altitude elevada, o consumo de combustível pode aumentar em até 30% devido à mistura pobre de oxigênio. 
            Mantenha sempre 5L de reserva estratégica para situações de isolamento geográfico.
          </p>
        </div>
        <div className="dashboard-card p-10 border-white/[0.03]">
          <div className="flex items-center gap-4 mb-8">
            <RefreshCw size={20} className="text-[#ff641d]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d]">OPS_INTEL: CARGA</h3>
          </div>
          <p className="text-xs text-[#F8FAFC]/30 leading-relaxed font-medium">
            O peso ideal da mochila não deve exceder 15% do seu peso corporal. Para overlanders, a distribuição de peso no veículo 
            deve manter o centro de gravidade baixo para evitar capotamentos em terrenos de rípio.
          </p>
        </div>
      </div>
    </div>
  );
}

function FuelCalculator() {
  const [dist, setDist] = useState(500);
  const [cons, setCons] = useState(15);
  const [price, setPrice] = useState(5.80);

  const totalLiters = dist / cons;
  const totalCost = totalLiters * price;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <label className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-[#ff641d]">DISTÂNCIA_KM</label>
          <input 
            type="number" 
            className="w-full bg-white/[0.02] border border-white/5 rounded-sm h-16 px-6 text-3xl font-display font-black focus:outline-none focus:border-[#ff641d]/30 transition-all text-[#F8FAFC]"
            value={dist}
            onChange={(e) => setDist(Number(e.target.value))}
          />
        </div>
        <div className="space-y-6">
          <label className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-[#ff641d]">CONSUMO_KML</label>
          <input 
            type="number" 
            className="w-full bg-white/[0.02] border border-white/5 rounded-sm h-16 px-6 text-3xl font-display font-black focus:outline-none focus:border-[#ff641d]/30 transition-all text-[#F8FAFC]"
            value={cons}
            onChange={(e) => setCons(Number(e.target.value))}
          />
        </div>
        <div className="space-y-6">
          <label className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-[#ff641d]">PREÇO_LITRO</label>
          <input 
            type="number" 
            className="w-full bg-white/[0.02] border border-white/5 rounded-sm h-16 px-6 text-3xl font-display font-black focus:outline-none focus:border-[#ff641d]/30 transition-all text-[#F8FAFC]"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="bg-white/[0.01] p-10 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-2">
          <div className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/20">LITROS_PARA_MISSÃO</div>
          <div className="text-5xl font-display font-black text-[#F8FAFC] tracking-tighter">{totalLiters.toFixed(1)} L</div>
        </div>
        <div className="space-y-2">
          <div className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/20">CUSTO_ESTIMADO</div>
          <div className="text-5xl font-display font-black text-[#ff641d] tracking-tighter">R$ {totalCost.toFixed(2)}</div>
        </div>
      </div>
    </motion.div>
  );
}

function BackpackCalculator() {
  const [weight, setWeight] = useState(75);
  const ideal = weight * 0.15;
  const limit = weight * 0.20;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="max-w-xs space-y-6">
        <label className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-[#ff641d]">PESO_CORPORAL_KG</label>
        <input 
          type="number" 
          className="w-full bg-white/[0.02] border border-white/5 rounded-sm h-20 px-8 text-4xl font-display font-black focus:outline-none focus:border-[#ff641d]/30 transition-all text-[#F8FAFC]"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-8 border border-white/5 bg-white/[0.01] space-y-2">
            <span className="text-[8px] font-mono uppercase tracking-widest text-green-400/40">MARGE_IDEAL (15%)</span>
            <div className="text-4xl font-display font-black text-green-400 tracking-tighter">{ideal.toFixed(1)} KG</div>
        </div>
        <div className="p-8 border border-white/5 bg-white/[0.01] space-y-2">
            <span className="text-[8px] font-mono uppercase tracking-widest text-orange-400/40">MARGE_LIMITE (20%)</span>
            <div className="text-4xl font-display font-black text-orange-400 tracking-tighter">{limit.toFixed(1)} KG</div>
        </div>
      </div>
    </motion.div>
  );
}

function UnitConverter() {
  const [km, setKm] = useState(1);
  const mi = km * 0.621371;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-10">
        <div className="space-y-6">
          <label className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-[#ff641d]">QUILÔMETROS</label>
          <input 
            type="number" 
            className="w-full bg-white/[0.02] border border-white/5 rounded-sm h-20 px-8 text-4xl font-display font-black focus:outline-none focus:border-[#ff641d]/30 transition-all text-[#F8FAFC]"
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
          />
        </div>
        <div className="md:mt-10 flex justify-center">
            <ArrowRight size={32} className="text-white/10" />
        </div>
        <div className="space-y-6">
          <label className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-[#ff641d]">MILHAS</label>
          <div className="w-full bg-white/[0.02] border border-white/5 rounded-sm h-20 px-8 text-4xl font-display font-black flex items-center text-[#F8FAFC]/40">
            {mi.toFixed(2)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
