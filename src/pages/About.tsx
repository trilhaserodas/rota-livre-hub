import { motion } from 'motion/react';
import { Shield, Users, Zap, Map as MapIcon, Heart, Instagram, Info } from 'lucide-react';
import SEO from '@/src/components/SEO';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
      <SEO 
        title="Sobre o Rota Livre Hub - Nossa Missão" 
        description="Conheça a história e o propósito por trás do hub definitivo para viajantes e aventureiros da América Latina."
      />

      <section className="pt-12 mb-20 text-left">
        <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">ORIGIN_STORY // MISSION_PROTOCOL</div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-4 text-[#F8FAFC]">
          SOBRE<span className="text-[#ff641d]">.</span>NÓS
        </h1>
        <p className="text-[#F8FAFC]/40 text-sm font-medium max-w-xl uppercase tracking-widest leading-loose">
          Tecnologia a serviço da liberdade. Construindo a infraestrutura digital para quem vive o mundo real.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="dashboard-card p-10 border-white/[0.03] bg-white/[0.01]">
            <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-6 text-[#F8FAFC]">
              O PROBLEMA
            </h2>
            <p className="text-sm text-white/40 leading-relaxed font-medium mb-6">
              Quem vive na estrada quase sempre depende de dezenas de aplicativos, sites e informações espalhadas pela internet. 
              Fragmentação gera fadiga de decisão e perda de tempo precioso que deveria ser gasto explorando.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['Horários', 'Rotas', 'Moedas', 'Pontos Seguros', 'Planejamento', 'Custos', 'Mapas', 'Utilitários'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  <div className="w-1 h-1 bg-[#ff641d]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card p-10 border-white/[0.03]">
            <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-6 text-[#F8FAFC]">
              NOSSA SOLUÇÃO
            </h2>
            <p className="text-sm text-white/40 leading-relaxed font-medium">
              O Rota Livre Hub reúne essas utilidades em um único lugar, de forma rápida, gratuita e acessível. 
              Criamos um hub moderno e leve, focado em utilidade real para quem explora o território latino-americano.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dashboard-card p-8 border-white/[0.03] hover:border-[#ff641d]/20 transition-colors group">
              <Users className="text-[#ff641d] mb-6 opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] mb-4">COMUNIDADE_REAL</h3>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                Feito para cicloturistas, mochileiros, moto viajantes e overlanders.
              </p>
            </div>
            <div className="dashboard-card p-8 border-white/[0.03] hover:border-[#ff641d]/20 transition-colors group">
              <Zap className="text-[#ff641d] mb-6 opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] mb-4">LEVEZA_TOTAL</h3>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                Interface otimizada para conexões instáveis e uso em campo.
              </p>
            </div>
            <div className="dashboard-card p-8 border-white/[0.03] hover:border-[#ff641d]/20 transition-colors group">
              <Shield className="text-[#ff641d] mb-6 opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] mb-4">MAPAS_SEGURANÇA</h3>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                Dados colaborativos sobre segurança e infraestrutura.
              </p>
            </div>
            <div className="dashboard-card p-8 border-white/[0.03] hover:border-[#ff641d]/20 transition-colors group">
              <MapIcon className="text-[#ff641d] mb-6 opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] mb-4">ATLAS_VIRTUAL</h3>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                Um guia em constante evolução pelas rotas da América do Sul.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <section className="dashboard-card p-12 md:p-20 border-white/[0.03] text-center mb-32 relative overflow-hidden bg-[#ff641d]/[0.02]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#ff641d]/[0.05] blur-[120px] pointer-events-none rounded-full"></div>
        <div className="relative z-10">
          <Heart size={32} className="text-[#ff641d] mx-auto mb-8 animate-pulse" />
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter mb-8 text-[#F8FAFC]">
            VIAGEM SEM COMPLICAÇÃO
          </h2>
          <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed font-medium">
            O Rota Livre Hub acredita que viajar não precisa ser complicado. 
            A tecnologia deve ajudar quem está na estrada — não atrapalhar. 
            Estamos construindo uma plataforma feita para aventureiros reais, com foco em utilidade, liberdade e comunidade.
          </p>
        </div>
      </section>

      {/* Credits Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <div className="dashboard-card p-10 border-white/[0.03] flex flex-col justify-center">
            <div className="text-[8px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">AUTHOR_CREDITS</div>
            <h4 className="text-xl font-display font-black uppercase tracking-tighter text-[#F8FAFC] mb-2">Criado por: Comunidade Trilhas e rodas</h4>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Cultura outdoor e logística de aventura.</p>
        </div>
        
        <a 
          href="https://instagram.com/trilhas_erodas" 
          target="_blank" 
          rel="noopener noreferrer"
          className="dashboard-card p-10 border-white/[0.1] bg-[#ff641d] text-white flex items-center justify-between group transition-all hover:bg-[#ff641d]/90 shadow-[0_0_40px_rgba(255,100,29,0.2)]"
        >
          <div className="flex items-center gap-6">
            <Instagram size={32} />
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] block mb-1">Follow OPS</span>
              <span className="text-2xl font-display font-black uppercase tracking-tighter italic">@trilhas_erodas</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
             <Zap size={20} />
          </div>
        </a>
      </div>

      <div className="mt-20 flex justify-center">
        <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/[0.02] border border-white/5 rounded-full">
           <Info size={14} className="text-[#ff641d]" />
           <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#F8FAFC]/40">Sua próxima rota começa aqui.</span>
        </div>
      </div>
    </div>
  );
}
