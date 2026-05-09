import { motion } from 'motion/react';
import { Plane, Bike, Luggage, Shield, Info, CheckCircle2, AlertTriangle, ExternalLink, CreditCard, Backpack } from 'lucide-react';
import SEO from '@/src/components/SEO';

const airlineFees = [
  { company: 'LATAM Airlines', bikeFee: 'R$ 150 - 350', rules: 'Até 23kg. Dimensões máx 158cm lineares.', link: 'https://www.latamairlines.com' },
  { company: 'GOL Linhas Aéreas', bikeFee: 'R$ 95 - 150', rules: 'Equipamento esportivo como bagagem despachada.', link: 'https://www.voegol.com.br' },
  { company: 'Azul Linhas Aéreas', bikeFee: 'R$ 150', rules: 'Sujeito a disponibilidade de espaço no porão.', link: 'https://www.voeazul.com.br' },
  { company: 'Aerolineas Argentinas', bikeFee: 'USD 50 - 100', rules: 'Reserva antecipada recomendada para bike.', link: 'https://www.aerolineas.com.ar' },
  { company: 'Avianca', bikeFee: 'USD 60 - 120', rules: 'Máx 230cm lineares incluindo embalagem.', link: 'https://www.avianca.com' },
];

const checklist = [
  'Esvaziar parcialmente os pneus para evitar explosão por pressão.',
  'Remover pedais e fixar ao quadro ou protegê-los.',
  'Desmontar o guidão e fixar lateralmente com plástico bolha.',
  'Proteger o câmbio traseiro (recomenda-se remover e fixar no quadro).',
  'Utilizar caixa de papelão rígida, mala-bike (case) ou bike bag para transporte.',
  'Identificar a embalagem com contatos e "Frágil".',
];

const faq = [
  {
    q: 'Pode levar fogareiro de camping no avião?',
    a: 'O fogareiro pode ser levado como bagagem despachada, desde que esteja completamente limpo, sem resíduos de combustível e sem o botijão de gás (totalmente proibido).'
  },
  {
    q: 'Como economizar no despacho de bike?',
    a: 'Algumas companhias permitem que a bike conte como sua primeira bagagem despachada se estiver dentro do peso e dimensões. Sempre verifique a tarifa comprada.'
  },
  {
    q: 'Mochila de trilha pode ir na cabine?',
    a: 'Depende da litragem. Mochilas até 40L geralmente passam como bagagem de mão se não estiverem estufadas. Lembre-se: bastões de caminhada são proibidos na cabine.'
  }
];

export default function AirTravel() {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
      <SEO 
        title="Viagem Aérea para Aventureiros - Como levar Bike e Equipamentos" 
        description="Guia definitivo para cicloturistas e mochileiros em voos. Regras de despacho de bike, taxas das aéreas e checklist de segurança."
      />

      <section className="pt-20 mb-16 text-center">
        <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">CORE_MODULE // AERO_LOGISTICS</div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-4 text-[#F8FAFC]">
          AIR_TRAVEL<span className="text-[#ff641d]">.</span>HUB
        </h1>
        <p className="text-[#F8FAFC]/40 text-sm font-medium max-w-2xl mx-auto">
          Inteligência para logística aérea de aventuras. Saiba como transportar sua bicicleta, 
          evitar taxas abusivas e garantir que seu equipamento chegue intacto ao destino.
        </p>
      </section>

      {/* Grid de Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Tabelas e Regras */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tabela de Taxas */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="dashboard-card overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-[#ff641d]" size={20} />
              <h2 className="text-lg font-display font-bold text-white uppercase tracking-tight">Taxas de Transporte de Bike</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-4 px-4 text-[10px] font-mono text-white/40 uppercase">Companhia</th>
                    <th className="py-4 px-4 text-[10px] font-mono text-white/40 uppercase">Taxa Estimada</th>
                    <th className="py-4 px-4 text-[10px] font-mono text-white/40 uppercase">Regra Principal</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {airlineFees.map((fee, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-white">{fee.company}</td>
                      <td className="py-4 px-4 text-[#ff641d]">{fee.bikeFee}</td>
                      <td className="py-4 px-4 text-white/50 text-xs">{fee.rules}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Checklist de Embarque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="dashboard-card"
            >
              <div className="flex items-center gap-3 mb-6">
                <Bike className="text-[#ff641d]" size={20} />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Checklist: Bike no Avião</h3>
              </div>
              <ul className="space-y-4">
                {checklist.map((item, i) => (
                  <li key={i} className="flex gap-3 text-xs text-white/50 leading-relaxed">
                    <CheckCircle2 size={16} className="text-[#ff641d] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="dashboard-card bg-[#ff641d]/5 border-[#ff641d]/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <Backpack className="text-[#ff641d]" size={20} />
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Dicas para Mochileiros</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <span className="text-[10px] font-mono text-[#ff641d] block mb-1">PROTEÇÃO</span>
                  <p className="text-xs text-white/60">Use capas de transporte para evitar que as alças da mochila enrosquem nas esteiras.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <span className="text-[10px] font-mono text-[#ff641d] block mb-1">PESO</span>
                  <p className="text-xs text-white/60">Vá com suas botas de trilha e jaqueta pesada no corpo para aliviar o peso da bagagem.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-red-500/20">
                  <span className="text-[10px] font-mono text-red-500 block mb-1">PROIBIDO</span>
                  <p className="text-xs text-white/60">Powerbanks devem ir sempre na bagagem de mão (proibidos no porão).</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Lado Direito: Affiliate Banners & FAQ */}
        <div className="space-y-8">
          
          {/* Affiliate Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] px-4">Parceiros de Jornada</h4>
            
            <a href="#" className="block dashboard-card group hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <Plane size={24} className="text-blue-500" />
                <ExternalLink size={14} className="text-white/20 group-hover:text-white/60" />
              </div>
              <h5 className="text-white font-bold text-sm">Passagens Aéreas</h5>
              <p className="text-[10px] text-white/40 mt-1">Busque voos com as melhores políticas de bagagem.</p>
              <div className="mt-4 px-4 py-2 bg-blue-500/10 text-blue-500 text-[10px] font-mono text-center rounded uppercase tracking-widest group-hover:bg-blue-500 group-hover:text-white transition-all">
                Pesquisar Voos
              </div>
            </a>

            <a href="#" className="block dashboard-card group hover:border-green-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <Shield size={24} className="text-green-500" />
                <ExternalLink size={14} className="text-white/20 group-hover:text-white/60" />
              </div>
              <h5 className="text-white font-bold text-sm">Seguro Viagem</h5>
              <p className="text-[10px] text-white/40 mt-1">Proteção completa para esportes de aventura e eletrônicos.</p>
              <div className="mt-4 px-4 py-2 bg-green-500/10 text-green-500 text-[10px] font-mono text-center rounded uppercase tracking-widest group-hover:bg-green-500 group-hover:text-white transition-all">
                Cotar Seguro
              </div>
            </a>
          </div>

          {/* Mini FAQ */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <Info className="text-[#ff641d]" size={20} />
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Dúvidas Frequentes (FAQ)</h3>
            </div>
            <div className="space-y-6">
              {faq.map((item, i) => (
                <div key={i}>
                  <p className="text-xs font-bold text-white mb-2">{item.q}</p>
                  <p className="text-[11px] text-white/40 leading-relaxed italic border-l-2 border-[#ff641d]/20 pl-3">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Alerta de Verificação Final */}
      <section className="mt-16">
        <div className="p-8 bg-[#0b0c0d] border border-white/5 rounded-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white mb-2 uppercase">Atenção Crítica</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              As regras de bagagem mudam constantemente. Este hub fornece dados de referência. 
              <strong> Sempre</strong> verifique o site oficial da companhia aérea após a compra da sua passagem 
              e antes de se dirigir ao aeroporto. Bagagens fora do padrão podem ser recusadas no balcão.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
