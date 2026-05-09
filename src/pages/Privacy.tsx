import { motion } from 'motion/react';
import { Shield, Eye, Lock, FileText, ExternalLink, Info } from 'lucide-react';
import SEO from '@/src/components/SEO';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 pb-24 relative z-10">
      <SEO 
        title="Política de Privacidade - Rota Livre Hub" 
        description="Entenda como tratamos seus dados e garantimos sua segurança digital enquanto você explora a América Latina."
      />

      <section className="pt-12 mb-16">
        <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-4 uppercase">LEGAL_PROTOCOL // DATA_PRIVACY</div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-4 text-[#F8FAFC]">
          PRIVACIDADE<span className="text-[#ff641d]">.</span>DOC
        </h1>
        <p className="text-[#F8FAFC]/40 text-sm font-medium max-w-xl">
          Última atualização: Maio de 2026. Transparência total sobre o processamento de dados no painel Rota Livre.
        </p>
      </section>

      <div className="space-y-12">
        <div className="dashboard-card p-10 border-white/[0.03] bg-white/[0.01]">
          <div className="flex items-center gap-4 mb-8">
            <Shield size={20} className="text-[#ff641d]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d]">01. DISPOSIÇÕES_GERAIS</h2>
          </div>
          <p className="text-sm text-white/40 leading-relaxed font-medium">
            A sua privacidade é importante para o Rota Livre Hub. Esta página explica de forma simples como coletamos, utilizamos e protegemos informações durante a navegação em nossa plataforma.
          </p>
        </div>

        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="dashboard-card p-8 border-white/[0.03]">
              <div className="flex items-center gap-3 mb-6">
                <FileText size={18} className="text-white/20" />
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F8FAFC]">COLETA_DE_DADOS</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Tipo de navegador',
                  'Dispositivo utilizado',
                  'Páginas acessadas',
                  'Tempo de navegação',
                  'Localização aproximada',
                  'Dados estatísticos'
                ].map((item) => (
                  <li key={item} className="text-[10px] text-white/30 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#ff641d]/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-card p-8 border-white/[0.03]">
              <div className="flex items-center gap-3 mb-6">
                <Eye size={18} className="text-white/20" />
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F8FAFC]">COOKIES_PROTOCOL</h3>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest mb-4">
                Utilizamos cookies para melhorar a navegação, salvar preferências, entender métricas de acesso e personalizar conteúdos.
              </p>
              <p className="text-[9px] font-mono text-[#ff641d]/60 italic">
                * Os cookies podem ser desativados nas configurações do seu terminal (navegador).
              </p>
            </div>
          </div>

          <div className="dashboard-card p-10 border-white/[0.03]">
            <div className="flex items-center gap-4 mb-8">
              <Lock size={20} className="text-[#ff641d]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d]">02. GOOGLE_ADSENSE_&_TERCEIROS</h2>
            </div>
            <div className="space-y-6">
              <p className="text-sm text-white/40 leading-relaxed font-medium">
                O Rota Livre Hub utiliza serviços de publicidade do Google Adsense. O Google pode utilizar cookies para exibir anúncios relevantes com base em visitas anteriores.
              </p>
              <a 
                href="https://policies.google.com/technologies/ads" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-[#ff641d] hover:underline"
              >
                EXT_LINK: POLÍTICAS_GOOGLE <ExternalLink size={12} />
              </a>
              <div className="pt-6 border-t border-white/5 space-y-4">
                <p className="text-xs text-white/20 uppercase tracking-widest font-bold">SERVIÇOS_INTEGRADOS:</p>
                <div className="flex flex-wrap gap-4">
                  {['OpenStreetMap', 'Leaflet.js', 'Currency_APIs', 'Analytics_Nodes'].map(s => (
                    <span key={s} className="px-3 py-1 bg-white/[0.02] border border-white/5 text-[9px] font-mono text-white/40">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="dashboard-card p-8 border-white/[0.03]">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F8FAFC] mb-4">SEGURANÇA_ATIVA</h3>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                Buscamos utilizar práticas modernas de segurança para proteger os dados e a navegação. Entretanto, nenhum sistema online é 100% livre de riscos.
              </p>
            </div>
            <div className="dashboard-card p-8 border-white/[0.03]">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F8FAFC] mb-4">LINKS_EXTERNOS</h3>
              <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                Não nos responsabilizamos pelas políticas ou conteúdos de plataformas externas linkadas em nossos diários ou ferramentas.
              </p>
            </div>
          </div>
        </section>

        <div className="dashboard-card p-12 text-center border-white/[0.03] bg-[#ff641d]/[0.01]">
          <h3 className="text-xl font-display font-black uppercase tracking-tighter text-[#F8FAFC] mb-6">ALTERAÇÕES_E_CONTATO</h3>
          <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-10 max-w-xl mx-auto leading-relaxed">
            Esta política pode ser atualizada periodicamente. Caso tenha dúvidas, entre em contato através dos canais oficiais do projeto Trilhas e Rodas.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-[#ff641d]/30 text-[10px] font-mono text-[#ff641d]">
            <Info size={14} />
            SISTEMA_ROTA_LIVRE_VER_1.4.2
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
