import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Calendar, Share2, MapPin, Activity, Compass, 
  Info, CheckCircle2, AlertTriangle, Car, Clock, Copy, 
  MessageCircle, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import SEO from '@/src/components/SEO';

export default function CarreteraAustral() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Confira este guia sobre a Carretera Austral no Rota Livre Hub: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Carretera Austral — Rota Livre Hub',
        text: 'Guia completo sobre a Carretera Austral com relatos reais da comunidade.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 relative z-10 pt-12">
      <SEO 
        title="Carretera Austral — A Rota Mais Selvagem da Patagônia" 
        description="Guia completo sobre a Carretera Austral com relatos reais da comunidade. Logística, trilhas, fronteiras e custos."
      />

      <Link 
        to="/rotas" 
        className="inline-flex items-center gap-2 text-[10px] font-mono text-[#ff641d] uppercase tracking-[0.4em] mb-12 hover:pl-2 transition-all"
      >
        <ArrowLeft size={14} /> VOLTAR_PARA_ROTAS
      </Link>

      <header className="mb-16">
        <div className="flex flex-wrap gap-4 mb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff641d]/10 border border-[#ff641d]/20 text-[#ff641d] text-[8px] font-mono font-bold uppercase tracking-widest">
             <MapPin size={10} /> CHILE / PATAGÔNIA
           </div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[8px] font-mono font-bold uppercase tracking-widest">
             <Calendar size={10} /> FIELD_GUIDE_V.1
           </div>
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black uppercase tracking-tighter mb-8 leading-[0.9] text-[#F8FAFC]">
          CARRETERA<br />AUSTRAL<span className="text-[#ff641d]">.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 font-medium uppercase tracking-wide leading-relaxed italic border-l-4 border-[#ff641d] pl-8">
          A rota que não é apenas uma estrada, mas uma experiência que muda perspectiva. Cruza mais de 1.200 km de asfalto, cascalho e barro no sul do Chile.
        </p>
      </header>

      {/* Hero Image */}
      <div className="aspect-[21/9] w-full rounded-sm overflow-hidden mb-20 grayscale hover:grayscale-0 transition-all duration-700 border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9d?auto=format&fit=crop&q=80&w=1200" 
          alt="Carretera Austral View" 
          className="w-full h-full object-cover"
        />
      </div>

      <article className="prose prose-invert max-w-none prose-p:text-white/60 prose-p:leading-loose prose-h3:text-[#F8FAFC] prose-h3:uppercase prose-h3:tracking-tighter prose-h3:font-display prose-h3:font-black prose-h3:text-2xl prose-blockquote:border-[#ff641d] prose-blockquote:bg-white/[0.02] prose-blockquote:py-2 prose-blockquote:px-8 prose-li:text-white/40 prose-li:font-mono prose-li:uppercase prose-li:tracking-widest prose-li:text-[11px]">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <div className="dashboard-card p-6 border-white/5 flex flex-col items-center text-center">
            <Activity className="text-[#ff641d] mb-4" size={24} />
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-1">DISTÂNCIA_TOTAL</div>
            <div className="text-xl font-display font-black text-white tracking-widest">~4.000 KM (LOOP)</div>
          </div>
          <div className="dashboard-card p-6 border-white/5 flex flex-col items-center text-center">
            <Clock className="text-[#ff641d] mb-4" size={24} />
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-1">DURAÇÃO_IDEAL</div>
            <div className="text-xl font-display font-black text-white tracking-widest">3-6 SEMANAS</div>
          </div>
          <div className="dashboard-card p-6 border-white/5 flex flex-col items-center text-center">
            <Car className="text-[#ff641d] mb-4" size={24} />
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mb-1">LOGÍSTICA_AUTO</div>
            <div className="text-xl font-display font-black text-white tracking-widest">US$ 1.200 (16 DIAS)</div>
          </div>
        </div>

        <h3 className="flex items-center gap-4">
          <div className="w-8 h-[2px] bg-[#ff641d]"></div>
          O Roteiro Real — Como viajantes independentes fazem
        </h3>
        <p>A maioria parte de <strong>Puerto Montt</strong> de carro alugado e faz um loop para entregar o veículo no mesmo lugar. Um roteiro típico de 3 semanas cobre em torno de <strong>4.000 km</strong> e passa por:</p>
        <ul className="space-y-4">
          <li><strong>Parque Pumalín</strong> — Descrito como "sensacional". Florestas primárias e vulcões nevados.</li>
          <li><strong>Chaitén</strong> — Cidade de parada para supermercado e descanso.</li>
          <li><strong>Lago Verde e Rio Yelcho</strong> — Região de lodges de pesca, águas cristalinas.</li>
          <li><strong>La Junta</strong> — Pequeníssima, mas com calor humano fora do comum.</li>
          <li><strong>Futaleufú</strong> — Meca do rafting, com o Rio Futaleufú turquesa.</li>
          <li><strong>Puerto Bertrand / Baker Lodge</strong> — Experiência gastronômica à beira do Rio Baker.</li>
          <li><strong>Coyhaique</strong> — A maior cidade da rota, com infraestrutura completa.</li>
          <li><strong>Chile Chico</strong> — Cruzamento para a Argentina, acesso ao lago General Carrera.</li>
        </ul>
        <blockquote>
          "A viagem toda durou 3 semanas. Se eu tivesse mais tempo, acho que o mesmo roteiro merecia o dobro da duração." — u/matei1987
        </blockquote>

        <h3 className="mt-20 flex items-center gap-4">
          <div className="w-8 h-[2px] bg-[#ff641d]"></div>
          Logística do Carro — O que a comunidade aprendeu
        </h3>
        <p><strong>Onde alugar:</strong> Puerto Montt é o ponto ideal. A Budget foi a mais citada positivamente — fizeram toda a papelada para cruzamento de fronteira por e-mail, sem taxas extras no final.</p>
        <p><strong>Como são as estradas:</strong> Muito cascalho, esburacadas em alguns trechos. O trânsito é quase inexistente — exceto o momento clássico de encontrar um caminhão na estrada de terra de mão única.</p>
        <blockquote>
          "As estradas estavam boas. Um monte de cascalho, mas bem cuidadas." — u/demosthenes83
        </blockquote>

        <h3 className="mt-20 flex items-center gap-4">
          <div className="w-8 h-[2px] bg-[#ff641d]"></div>
          Fronteiras — O ponto que exige paciência
        </h3>
        <p>Cruzar entre Chile e Argentina é parte do roteiro, mas merece atenção especial:</p>
        <ul className="space-y-4">
          <li><strong>Chile Chico → Argentina:</strong> Tranquilo. Apenas 30 minutos.</li>
          <li><strong>Volta para o Chile:</strong> Pode ser um pesadelo. Relatos de esperas de até <strong>9 horas</strong> em dias de greve.</li>
        </ul>
        <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-sm mb-12">
           <div className="flex items-center gap-3 text-orange-400 font-mono text-[10px] uppercase tracking-widest mb-4">
              <AlertTriangle size={16} /> PROTOCOLO_RECOMENDADO
           </div>
           <p className="text-[11px] text-white/40 uppercase tracking-widest leading-relaxed">
             Para levar um carro alugado para a Argentina, é preciso solicitar autorização prévia por e-mail diretamente para a locadora.
           </p>
        </div>

        <h3 className="mt-20 flex items-center gap-4">
          <div className="w-8 h-[2px] bg-[#ff641d]"></div>
          Hospedagem — O jeito patagônico de receber
        </h3>
        <p>Esqueça redes de hotéis. A hospedagem aqui é em cabanas familiares e pousadas pequenas. A hospitalidade é o ponto alto, com relatos de viajantes sendo convidados para ceias de Natal em família.</p>
        <blockquote>
          "Ficamos numa cabaninha na véspera e no dia de Natal. A família nos convidou pra ceia e até colocaram presentes embaixo da árvore pra gente." — u/matei1987
        </blockquote>

        <h3 className="mt-20 flex items-center gap-4">
          <div className="w-8 h-[2px] bg-[#ff641d]"></div>
          Trilhas — O que vale a pena
        </h3>
        <ul className="space-y-4">
          <li><strong>Parque Pumalín:</strong> Trilhas com vista para o vulcão Chaitén.</li>
          <li><strong>Torres del Paine (Sul):</strong> A trilha da base das torres (~14 km) é destino obrigatório.</li>
          <li><strong>Fitz Roy (Argentina):</strong> A trilha que começa discretamente no El Pilar.</li>
        </ul>
        <blockquote>
          "Dirija de El Chaltén para Fitz Roy bem tarde com céu limpo. Você terá uma vista da Via Láctea que não vai acreditar que é real." — u/bored_designer
        </blockquote>

        <h3 className="mt-20 flex items-center gap-4">
          <div className="w-8 h-[2px] bg-[#ff641d]"></div>
          Em Números
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] font-mono">
            <thead>
              <tr className="border-b border-white/10 uppercase tracking-widest text-[#ff641d]">
                <th className="py-4 text-left">VAR_AMB</th>
                <th className="py-4 text-left">VALOR_ESTIMADO</th>
              </tr>
            </thead>
            <tbody className="text-white/40">
              <tr className="border-b border-white/5">
                <td className="py-4 uppercase tracking-[0.2em]">Duração ideal</td>
                <td className="py-4">3 semanas (6 seriam melhores)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 uppercase tracking-[0.2em]">Km percorridos</td>
                <td className="py-4">~4.000 km em loop</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 uppercase tracking-[0.2em]">Horas de luz (Verão)</td>
                <td className="py-4">Das 6h30 às 21h40</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 uppercase tracking-[0.2em]">Fronteiras</td>
                <td className="py-4">2 (Chile→Argentina→Chile)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-24 p-12 bg-white/[0.02] border border-white/5 text-center rounded-sm relative overflow-hidden group">
           <Compass className="text-[#ff641d] mx-auto mb-6 opacity-20 group-hover:rotate-45 transition-transform duration-700" size={40} />
           <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] mb-1 text-center font-bold">TUDO_É_POSSÍVEL</p>
           <p className="text-[11px] text-white/60 uppercase tracking-widest leading-relaxed max-w-lg mx-auto">
             A Carretera Austral é acessível para quem tem planejamento, seja de carro, moto ou bike. As pessoas são o combustível dessa rota.
           </p>
           
           <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-mono text-white/40 uppercase tracking-widest">
                 <Calendar size={12} className="text-[#ff641d]" /> EDITADO EM 11-05-2026
              </div>
           </div>
        </div>
      </article>

      {/* Related Routes Section */}
      <section className="mt-40 border-t border-white/5 pt-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">LOG_PROTOCOL // RELATED_TRAILS</div>
            <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-[#F8FAFC]">
              CONTINUAR<span className="text-[#ff641d]">.</span>A_EXPLORAÇÃO
            </h2>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
          {[
            {
              id: 'ruta-40',
              name: 'RUTA_40',
              country: 'ARGENTINA',
              difficulty: 'EXTREMO',
              image: 'https://images.unsplash.com/photo-1498677231914-50deb6ba421a?auto=format&fit=crop&q=80&w=800'
            },
            {
              id: 'transamazonica',
              name: 'TRANSAMAZÔNICA',
              country: 'BRASIL',
              difficulty: 'CRÍTICO',
              image: 'https://images.unsplash.com/photo-1502484433149-bc9197c3664c?auto=format&fit=crop&q=80&w=800'
            },
            {
              id: 'circuito-huayhuash',
              name: 'HUAYHUASH_CIRCUIT',
              country: 'PERU',
              difficulty: 'ALTO_ALTITUDE',
              image: 'https://images.unsplash.com/photo-1544198305-e0d02447990c?auto=format&fit=crop&q=80&w=800'
            }
          ].map((route) => (
            <motion.div
              key={route.id}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-[300px] snap-start"
            >
              <Link to={`/rotas/${route.id}`} className="block group">
                <div className="aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 mb-6 border border-white/5 bg-white/[0.02]">
                  <img 
                    src={route.image} 
                    alt={route.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#ff641d] text-[9px] font-mono font-bold uppercase tracking-widest">
                    <MapPin size={10} /> {route.country}
                  </div>
                  <h3 className="text-xl font-display font-black text-[#F8FAFC] uppercase tracking-tighter group-hover:text-[#ff641d] transition-colors">
                    {route.name}
                  </h3>
                  <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
                    LVL: {route.difficulty}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="mt-24 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6">
           <button 
             onClick={handleNativeShare}
             className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] hover:text-[#ff641d] transition-colors group"
           >
             <Share2 size={14} className="group-hover:scale-110 transition-transform" /> SHARE_INTEL
           </button>
           
           <button 
             onClick={handleWhatsAppShare}
             className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] hover:text-[#25D366] transition-colors group"
           >
             <MessageCircle size={14} className="group-hover:scale-110 transition-transform" /> WHATSAPP
           </button>

           <button 
             onClick={handleCopyLink}
             className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] hover:text-white transition-all group relative"
           >
             <AnimatePresence mode="wait">
               {copied ? (
                 <motion.span 
                   key="copied"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   exit={{ scale: 0 }}
                   className="flex items-center gap-2 text-[#ff641d]"
                 >
                   <Check size={14} /> COPIADO!
                 </motion.span>
               ) : (
                 <motion.span 
                   key="copy"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   exit={{ scale: 0 }}
                   className="flex items-center gap-2"
                 >
                   <Copy size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> COPIAR_LINK
                 </motion.span>
               )}
             </AnimatePresence>
           </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">
           OPS_PROTOCOL_V.4.2 // CONTINENTAL_ATLAS
        </div>
      </footer>
    </div>
  );
}

