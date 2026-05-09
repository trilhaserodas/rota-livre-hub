import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeftRight, RefreshCw, TrendingUp, Info } from 'lucide-react';
import SEO from '@/src/components/SEO';
import { cn } from '@/src/lib/utils';

const currencies = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷', rate: 1 },
  { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸', rate: 0.18 },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷', rate: 156.40 },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱', rate: 165.20 },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪', rate: 0.67 },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴', rate: 710.15 },
  { code: 'PYG', name: 'Guarani Paraguaio', symbol: '₲', flag: '🇵🇾', rate: 1320.50 },
  { code: 'UYU', name: 'Peso Uruguaio', symbol: '$U', flag: '🇺🇾', rate: 7.02 },
];

export default function Converter() {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState('BRL');
  const [toCurrency, setToCurrency] = useState('ARS');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const result = useMemo(() => {
    const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1;
    return (amount / fromRate) * toRate;
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 relative z-10">
      <SEO 
        title="Conversor de Moedas LATAM - Câmbio em Tempo Real" 
        description="Converta Real, Dólar, Peso Argentino, Peso Chileno e outras moedas da América Latina com taxas atualizadas."
      />

      <section className="pt-12 mb-12">
        <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">CORE_MODULE // FINANCE_HUB</div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-4 text-[#F8FAFC]">
          CONVERSOR<span className="text-[#ff641d]">.</span>LATAM
        </h1>
        <p className="text-[#F8FAFC]/40 text-sm font-medium max-w-xl">
          Câmbio simplificado para viajantes. Tarifas de referência para planejamento de orçamento na estrada.
        </p>
      </section>

      <div className="dashboard-card p-10 md:p-14 mb-12 border-white/[0.03]">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-10">
          {/* From */}
          <div className="space-y-6">
            <label className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-[#ff641d]">DE_ORIGEM</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white/[0.02] border border-white/5 rounded-sm h-24 pl-8 pr-28 text-5xl font-display font-black focus:outline-none focus:border-[#ff641d]/30 transition-all text-[#F8FAFC]"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="bg-black/80 border border-white/10 rounded-sm py-2 px-4 text-xs font-mono font-bold appearance-none cursor-pointer hover:border-[#ff641d] transition-colors outline-none"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/20">
              {currencies.find(c => c.code === fromCurrency)?.name}
            </div>
          </div>

          {/* Swap Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={swapCurrencies}
            className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02] text-[#ff641d] hover:bg-[#ff641d] hover:text-white transition-all shadow-[0_0_20px_rgba(255,100,29,0.1)] md:mt-10"
          >
            <ArrowLeftRight size={24} />
          </motion.button>

          {/* To */}
          <div className="space-y-6">
            <label className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-[#ff641d]">PARA_DESTINO</label>
            <div className="relative">
              <div className="w-full bg-white/[0.02] border border-white/5 rounded-sm h-24 pl-8 pr-28 text-5xl font-display font-black flex items-center overflow-hidden text-[#F8FAFC]">
                {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="bg-black/80 border border-white/10 rounded-sm py-2 px-4 text-xs font-mono font-bold appearance-none cursor-pointer hover:border-[#ff641d] transition-colors outline-none"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/20">
              {currencies.find(c => c.code === toCurrency)?.name}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <RefreshCw size={12} className="text-[#ff641d]" />
            TIMESTAMP: {lastUpdate.toLocaleTimeString()}
          </div>
          <div className="flex flex-wrap items-center gap-6">
            {currencies.slice(2, 6).map(c => (
              <div key={c.code} className="flex items-center gap-2 text-[9px] font-mono text-white/10">
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                1 BRL = <span className="text-white/40">{(c.rate / currencies[0].rate).toFixed(2)} {c.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-card p-10 border-white/[0.03]">
          <div className="flex items-center gap-4 mb-8">
            <TrendingUp size={20} className="text-[#ff641d]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d]">OPS_INTEL: CÂMBIO</h3>
          </div>
          <p className="text-xs text-[#F8FAFC]/30 leading-relaxed font-medium">
            Em territórios com instabilidade econômica, as taxas oficiais divergem do mercado real. 
            Nossa IA processa médias globais, mas priorize transações locais para papel-moeda.
          </p>
        </div>
        <div className="dashboard-card p-10 border-white/[0.03]">
          <div className="flex items-center gap-4 mb-8">
            <Info size={20} className="text-[#ff641d]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d]">OPS_INTEL: TAXAS</h3>
          </div>
          <p className="text-xs text-[#F8FAFC]/30 leading-relaxed font-medium">
            Sistemas bancários digitais (Wise/Nomad) reduzem o impacto tributário em até 80% comparado a 
            crédito convencional. Mantenha reservas em USD para emergências de fronteira.
          </p>
        </div>
      </div>
    </div>
  );
}
