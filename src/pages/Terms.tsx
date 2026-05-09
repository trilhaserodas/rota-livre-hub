import { motion } from 'motion/react';
import { ShieldAlert, Terminal, Scaling, MessageSquare, Monitor, ExternalLink, Info } from 'lucide-react';
import SEO from '@/src/components/SEO';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 relative z-10">
      <SEO 
        title="Termos de Uso - Rota Livre LATAM" 
        description="Leia os termos e condições de uso da plataforma Rota Livre LATAM. Transparência e responsabilidade na estrada."
      />

      <section className="pt-12 mb-16">
        <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">LEGAL_PROTOCOL // TERMS_OF_SERVICE</div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-4 text-[#F8FAFC]">
          TERMOS_DE_USO<span className="text-[#ff641d]">.</span>PRTCL
        </h1>
        <p className="text-[#F8FAFC]/40 text-sm font-medium max-w-xl">
          Última atualização: Maio de 2026. Ao acessar o sistema, você confirma a aceitação dos protocolos abaixo.
        </p>
      </section>

      <div className="space-y-12">
        <div className="dashboard-card p-10 border-white/[0.03] bg-white/[0.01]">
          <div className="flex items-center gap-4 mb-8">
            <ShieldAlert size={20} className="text-[#ff641d]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d]">01. OBJETO_DO_PROJETO</h2>
          </div>
          <p className="text-sm text-white/40 leading-relaxed font-medium">
            O Rota Livre LATAM é uma plataforma gratuita de utilidade pública voltada para viajantes, aventureiros e exploradores da América Latina. O objetivo é oferecer um hub de ferramentas táticas, mapas colaborativos e informações essenciais para a jornada.
          </p>
        </div>

        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="dashboard-card p-8 border-white/[0.03]">
              <div className="flex items-center gap-3 mb-6">
                <Terminal size={18} className="text-white/20" />
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F8FAFC]">USO_PERMITIDO</h3>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest mb-4">
                O usuário concorda em utilizar o site de forma ética, responsável e legal.
              </p>
              <div className="space-y-2 opacity-50">
                 <div className="text-[8px] font-mono text-white/40 uppercase line-through decoration-[#ff641d]/50">Atividades Ilegais</div>
                 <div className="text-[8px] font-mono text-white/40 uppercase line-through decoration-[#ff641d]/50">Comprometer Segurança</div>
                 <div className="text-[8px] font-mono text-white/40 uppercase line-through decoration-[#ff641d]/50">Conteúdos Maliciosos</div>
              </div>
            </div>

            <div className="dashboard-card p-8 border-white/[0.03]">
              <div className="flex items-center gap-3 mb-6">
                <Scaling size={18} className="text-white/20" />
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F8FAFC]">LIMITES_RESPONSABILIDADE</h3>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                Não garantimos precisão absoluta em mapas, rotas, horários ou câmbio. O usuário é o único responsável por validar dados antes de decisões críticas de segurança.
              </p>
            </div>
          </div>

          <div className="dashboard-card p-10 border-white/[0.03]">
            <div className="flex items-center gap-4 mb-8">
              <MessageSquare size={20} className="text-[#ff641d]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d]">02. CONTEÚDO_COLABORATIVO</h2>
            </div>
            <p className="text-sm text-white/40 leading-relaxed font-medium">
              Contribuições da comunidade são bem-vindas, mas o autor declara total responsabilidade sobre o conteúdo. Reservamos o direito de remover informações ofensivas, falsas ou inadequadas sem aviso prévio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="dashboard-card p-8 border-white/[0.03]">
              <div className="flex items-center gap-3 mb-6">
                <Monitor size={18} className="text-white/20" />
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F8FAFC]">ADS_E_MONETIZAÇÃO</h3>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                Utilizamos Google Adsense para manter o projeto gratuito. Os anúncios ajudam na infraestrutura do servidor.
              </p>
            </div>
            <div className="dashboard-card p-8 border-white/[0.03]">
              <div className="flex items-center gap-3 mb-6">
                 <ExternalLink size={18} className="text-white/20" />
                 <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F8FAFC]">SERVIÇOS_EXTERNOS</h3>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                O uso de APIs externas e links de terceiros segue as políticas próprias de cada provedor de serviço.
              </p>
            </div>
          </div>
        </section>

        <div className="dashboard-card p-12 text-center border-white/[0.03] bg-[#ff641d]/[0.01]">
          <h3 className="text-xl font-display font-black uppercase tracking-tighter text-[#F8FAFC] mb-6">REVISÃO_PERIÓDICA</h3>
          <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-10 max-w-xl mx-auto leading-relaxed">
            Estes Termos de Uso podem ser alterados para melhorias do sistema. O uso contínuo após alterações constitui aceitação dos novos protocolos.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-[#ff641d]/30 text-[10px] font-mono text-[#ff641d]">
            <Info size={14} />
            STATUS: OPERACIONAL_STABLE
          </div>
        </div>
      </div>

      <div className="mt-20 pt-12 border-t border-white/5 flex flex-col items-center gap-6">
        <p className="text-[8px] text-white/10 uppercase tracking-[0.4em] font-mono">
          PROJETO DESENVOLVIDO PELA COMUNIDADE TRILHAS E RODAS
        </p>
        <span className="text-[10px] text-[#ff641d] font-mono font-bold uppercase tracking-widest italic">
          @TRILHAS_ERODAS
        </span>
      </div>
    </div>
  );
}
