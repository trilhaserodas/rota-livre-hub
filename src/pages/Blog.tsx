import { motion } from 'motion/react';
import { Calendar, User, Search, ArrowRight, Share2 } from 'lucide-react';
import SEO from '@/src/components/SEO';

const posts = [
  {
    id: 1,
    title: 'DOCUMENTAÇÃO PARA TRAVESSIA TRANSBORDE',
    excerpt: 'Manual tático sobre aduanas, seguros de responsabilidade civil e protocolos de entrada em zonas de fronteira.',
    category: 'LOGÍSTICA',
    author: 'RT_EXPLORER',
    date: '12.10.25',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c4b282?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    title: 'EQUIPAMENTOS DE SOBREVIVÊNCIA PATAGÔNIA',
    excerpt: 'Análise técnica de sistemas de camadas e isolamento térmico para ambientes de frio extremo e ventos catabáticos.',
    category: 'GEAR_INTEL',
    author: 'LM_GEAR',
    date: '05.10.25',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    title: 'MANUTENÇÃO DE CAMPO: REPAROS CRÍTICOS',
    excerpt: 'Protocolos de emergência para falhas mecânicas em isolamento geográfico. O que levar no kit de intervenção.',
    category: 'FIELD_OPS',
    author: 'CC_MECHANIC',
    date: '28.09.25',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600'
  }
];

export default function Blog() {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
      <SEO 
        title="Intel & Relatos - Rota Livre Hub" 
        description="Fronteiras, mecânica, equipamentos e diários de bordo técnicos para viajantes da América Latina."
      />

      <section className="pt-12 mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="flex-1">
          <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">INTEL_DATABASE // FIELD_REPORTS</div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-4 text-[#F8FAFC]">
            DIÁRIO<span className="text-[#ff641d]">.</span>DE_BORDO
          </h1>
          <p className="text-[#F8FAFC]/40 text-sm font-medium max-w-xl uppercase tracking-widest leading-loose">
            Arquivos técnicos e relatos de infraestrutura. Experiência bruta acumulada em milhares de quilômetros de rípio e asfalto.
          </p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#ff641d] transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="BUSCAR_INTEL..."
            className="w-full bg-white/[0.02] border border-white/5 rounded-sm py-4 pl-12 pr-4 focus:outline-none focus:border-[#ff641d]/30 transition-all text-[10px] font-mono tracking-widest text-[#F8FAFC]"
          />
        </div>
      </section>

      {/* Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex flex-col"
          >
            <div className="dashboard-card h-full p-0 overflow-hidden border-white/[0.03] flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.8] group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#ff641d] text-[8px] font-mono font-bold uppercase tracking-widest text-white">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-6 text-[8px] font-mono text-white/20 uppercase tracking-[0.2em] mb-6">
                    <span className="flex items-center gap-2 border-r border-white/5 pr-4"><Calendar size={10} /> {post.date}</span>
                    <span className="flex items-center gap-2"><User size={10} /> {post.author}</span>
                  </div>

                  <h3 className="text-xl font-display font-black tracking-tighter mb-4 text-[#F8FAFC] group-hover:text-[#ff641d] transition-colors leading-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-[10px] text-white/30 leading-relaxed font-medium mb-8 flex-grow">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                    <button className="flex items-center gap-3 text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d] group-hover:gap-5 transition-all">
                      ACCESS_INTEL <ArrowRight size={14} />
                    </button>
                    <button className="text-white/10 hover:text-white transition-colors">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Ops Center / Sub Block */}
      <div className="mt-32 dashboard-card p-12 md:p-16 border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -top-1/2 -right-1/4 w-[500px] h-[500px] bg-[#ff641d]/5 blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-md relative z-10">
          <div className="text-[8px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">CORE_COMMUNICATIONS</div>
          <h4 className="text-3xl font-display font-black uppercase tracking-tighter mb-4 text-[#F8FAFC]">CENTRO_DE_OPERAÇÕES</h4>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
            Receba coordenadas estratégicas e avisos de condições de estrada diretamente no seu terminal semanalmente.
          </p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3 relative z-10">
          <input 
            type="email" 
            placeholder="TERMINAL_ID@EMAIL.COM"
            className="flex-grow md:w-64 bg-white/[0.02] border border-white/5 rounded-sm px-6 py-4 focus:outline-none focus:border-[#ff641d]/30 text-[10px] font-mono tracking-widest text-[#F8FAFC]"
          />
          <button className="px-8 py-4 bg-[#ff641d] text-white font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-[#ff641d]/80 transition-colors shadow-[0_0_20px_rgba(255,100,29,0.3)]">
            CONNECT
          </button>
        </div>
      </div>
    </div>
  );
}
