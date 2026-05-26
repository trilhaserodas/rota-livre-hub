import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Zap, Map as MapIcon, Heart, Instagram, Info } from 'lucide-react';
import SEO from '@/src/components/SEO';

export default function About() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

      {/* --- SEÇÃO FAQ — SOBRE O ROTA LIVRE HUB --- */}
      <section className="mb-32 scroll-mt-24">
        <div className="dashboard-card p-8 md:p-16 border-white/[0.03] space-y-12">
          <div className="text-left space-y-4">
            <div className="text-[8px] font-mono tracking-[0.4em] text-[#ff641d] uppercase font-black">DOCUMENTAÇÃO_OFICIAL // CENTRAL_DE_DÚVIDAS</div>
            <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter text-[#F8FAFC]">
              FAQ — Sobre o Rota Livre Hub
            </h2>
            <p className="text-[#F8FAFC]/40 text-xs font-mono uppercase tracking-widest max-w-xl">
              Dúvidas frequentes sobre a plataforma tática definitiva para os estradeiros da América Latina.
            </p>
          </div>

          <div className="space-y-4">
            {faqAbout.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`bg-white/[0.01] border ${isOpen ? 'border-[#ff641d]/30' : 'border-white/[0.03] hover:border-white/[0.08]'} rounded-sm transition-all overflow-hidden`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#F8FAFC]">
                      {item.question}
                    </span>
                    <span className={`text-[10px] font-mono shrink-0 ml-4 ${isOpen ? 'text-[#ff641d]' : 'text-white/30'}`}>
                      {isOpen ? '[ - ]' : '[ + ]'}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="border-t border-white/[0.03] py-5 px-6 text-[11px] text-[#F8FAFC]/50 space-y-3 font-medium uppercase tracking-wide leading-relaxed bg-black/10">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
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

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const faqAbout: FaqItem[] = [
  {
    question: "O que é o Rota Livre Hub?",
    answer: (
      <>
        <p className="mb-2">O Rota Livre Hub é uma plataforma digital criada para viajantes da América Latina.</p>
        <p className="mb-2">O projeto funciona como uma base operacional para aventureiros da estrada, reunindo ferramentas úteis em um único lugar.</p>
        <p className="mb-1 font-bold text-[#ff641d]">A plataforma integra:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>mapas operacionais</li>
          <li>clima e previsão do tempo</li>
          <li>conversor de moedas LATAM</li>
          <li>fusos horários</li>
          <li>HUB ALERTA</li>
          <li>rotas salvas</li>
          <li>pontos de apoio</li>
          <li>sistema colaborativo</li>
          <li>blog tático para viajantes</li>
          <li>monitoramento operacional de estrada</li>
        </ul>
        <p className="mt-2">Tudo pensado para quem vive viajando.</p>
      </>
    )
  },
  {
    question: "O Rota Livre Hub é apenas um aplicativo de mapas?",
    answer: (
      <>
        <p className="mb-2">Não. O mapa é apenas uma parte do ecossistema.</p>
        <p className="mb-2">O objetivo do projeto é centralizar ferramentas realmente úteis para:</p>
        <ul className="list-disc pl-4 space-y-1 mb-2">
          <li>cicloturistas</li>
          <li>mochileiros</li>
          <li>overlanders</li>
          <li>motorhome</li>
          <li>moto viajantes</li>
          <li>exploradores independentes</li>
        </ul>
        <p>A proposta é funcionar como uma central operacional da estrada.</p>
      </>
    )
  },
  {
    question: "Quais ferramentas existem dentro da plataforma?",
    answer: (
      <>
        <p className="mb-3">O Rota Livre Hub reúne diversas ferramentas em um único sistema:</p>
        
        <div className="space-y-3">
          <div>
            <h5 className="font-bold text-white mb-1">Navegação e Estrada</h5>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>mapa operacional</li>
              <li>visão satélite</li>
              <li>rotas salvas</li>
              <li>pontos estratégicos</li>
              <li>oficinas</li>
              <li>campings</li>
              <li>hostels</li>
              <li>sistema de avaliação operacional</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-white mb-1">Clima e Monitoramento</h5>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>clima em tempo real</li>
              <li>radar climático</li>
              <li>monitoramento operacional</li>
              <li>alertas de risco</li>
              <li>previsão estratégica de estrada</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-white mb-1">Ferramentas de Viagem</h5>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>conversor de moedas LATAM</li>
              <li>fusos horários</li>
              <li>horários internacionais</li>
              <li>calculadoras de viagem</li>
              <li>planejamento operacional</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-1">HUB ALERTA</h5>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>fronteiras</li>
              <li>clima severo</li>
              <li>alertas operacionais</li>
              <li>mudanças em rotas</li>
              <li>informações úteis para estrada</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-1">Conteúdo Estratégico</h5>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>blog tático</li>
              <li>sobrevivência</li>
              <li>documentação</li>
              <li>manutenção</li>
              <li>logística de expedição</li>
              <li>cicloturismo</li>
              <li>mochilão</li>
            </ul>
          </div>
        </div>
      </>
    )
  },
  {
    question: "O que diferencia o Rota Livre Hub do Google Maps?",
    answer: (
      <>
        <p className="mb-2">O Google Maps mostra locais.</p>
        <p className="mb-1 font-bold text-[#ff641d]">O Rota Livre Hub reúne:</p>
        <ul className="list-disc pl-4 space-y-1 mb-2">
          <li>contexto operacional</li>
          <li>clima</li>
          <li>logística</li>
          <li>apoio ao viajante</li>
          <li>informações úteis da estrada</li>
          <li>inteligência comunitária</li>
          <li>ferramentas integradas para expedições</li>
        </ul>
        <p>A plataforma foi criada especificamente para quem vive viajando.</p>
      </>
    )
  },
  {
    question: "O que é o HUB ALERTA?",
    answer: (
      <>
        <p className="mb-2">O HUB ALERTA é a central de monitoramento operacional do projeto.</p>
        <p className="mb-1">Ele reúne:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>alertas climáticos</li>
          <li>condições de estrada</li>
          <li>mudanças operacionais</li>
          <li>fronteiras</li>
          <li>riscos regionais</li>
          <li>avisos importantes para viajantes</li>
        </ul>
        <p className="mt-2 text-white">Tudo com linguagem objetiva e foco em utilidade real.</p>
      </>
    )
  },
  {
    question: "O Rota Livre Hub possui previsão do tempo?",
    answer: (
      <>
        <p className="mb-2">Sim.</p>
        <p className="mb-1">A plataforma possui integração com sistemas meteorológicos e monitoramento climático para ajudar viajantes a entender:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>vento</li>
          <li>chuva</li>
          <li>clima severo</li>
          <li>condições da rota</li>
          <li>regiões críticas</li>
          <li>comportamento climático operacional</li>
        </ul>
      </>
    )
  },
  {
    question: "Existe conversor de moedas dentro da plataforma?",
    answer: (
      <>
        <p className="mb-2">Sim.</p>
        <p className="mb-1">O sistema possui ferramentas de conversão para viajantes da América Latina, incluindo:</p>
        <ul className="list-disc pl-4 space-y-1 mb-2">
          <li>Real</li>
          <li>Dólar</li>
          <li>Peso Argentino</li>
          <li>Peso Chileno</li>
          <li>Guarani</li>
          <li>Sol Peruano</li>
          <li>Peso Colombiano</li>
        </ul>
        <p>O objetivo é facilitar planejamento financeiro durante viagens internacionais.</p>
      </>
    )
  },
  {
    question: "O sistema possui fusos horários?",
    answer: (
      <>
        <p className="mb-2">Sim.</p>
        <p className="mb-1">O Rota Livre Hub também reúne:</p>
        <ul className="list-disc pl-4 space-y-1 font-mono">
          <li>horários internacionais</li>
          <li>fusos LATAM</li>
          <li>relógio mundial</li>
          <li>comparação entre países</li>
        </ul>
        <p className="mt-2 text-white">Tudo integrado ao ecossistema de viagem.</p>
      </>
    )
  },
  {
    question: "Quem pode usar o Rota Livre Hub?",
    answer: (
      <>
        <p className="mb-1 font-bold text-white">A plataforma foi criada para:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>cicloturistas</li>
          <li>mochileiros</li>
          <li>overlanders</li>
          <li>viajantes de motorhome</li>
          <li>moto viajantes</li>
          <li>exploradores da América Latina</li>
        </ul>
      </>
    )
  },
  {
    question: "O Rota Livre Hub é gratuito?",
    answer: (
      <>
        <p>Sim. Grande parte das ferramentas da plataforma são gratuitas e voltadas para utilidade pública de viagem.</p>
      </>
    )
  },
  {
    question: "O projeto possui sistema colaborativo?",
    answer: (
      <>
        <p className="mb-2">Sim.</p>
        <p className="mb-1">Os próprios usuários podem contribuir com:</p>
        <ul className="list-disc pl-4 space-y-1 mb-2">
          <li>avaliações operacionais</li>
          <li>alertas</li>
          <li>informações da estrada</li>
          <li>condições das rotas</li>
          <li>pontos de apoio táticos</li>
        </ul>
        <p>O objetivo é construir uma inteligência coletiva da estrada.</p>
      </>
    )
  },
  {
    question: "O Rota Livre Hub funciona apenas no Brasil?",
    answer: (
      <>
        <p className="mb-2">Não. O projeto foi criado pensando em toda a América Latina.</p>
        <p className="mb-1">O foco inclui:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>expedições continentais</li>
          <li>travessias internacionais</li>
          <li>rotas LATAM</li>
          <li>logística para viajantes de longa distância</li>
        </ul>
      </>
    )
  },
  {
    question: "Qual a missão do projeto?",
    answer: (
      <>
        <p className="mb-2">Construir a maior base operacional colaborativa para aventureiros da América Latina.</p>
        <p className="mb-1">Unindo:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>tecnologia</li>
          <li>mapas</li>
          <li>clima</li>
          <li>ferramentas úteis</li>
          <li>inteligência operacional</li>
          <li>comunidade</li>
          <li>informação estratégica para estrada</li>
        </ul>
      </>
    )
  }
];
