import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, User, Search, ArrowRight, Share2, X, ChevronLeft, Instagram, MessageCircle, Copy, Check } from 'lucide-react';
import SEO from '@/src/components/SEO';
import { useSearchParams } from 'react-router-dom';

const posts = [
  {
    id: 5,
    title: 'CHECKLIST DE INVERNO: EXPEDIÇÕES EM CLIMA FRIO',
    excerpt: 'Pedalar no frio extremo exige preparação inteligente. Guia tático de equipamentos, camadas e mecânica para enfrentar temperaturas negativas com segurança.',
    category: 'EXPEDIÇÃO',
    author: 'TR_COMMUNITY',
    date: '09.05.26',
    image: 'https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>1. Lubrificação correta faz diferença real</h2>
      <p>Um dos erros mais comuns de aventureiros iniciantes no frio é continuar usando lubrificantes de cera em temperaturas negativas. Lubrificantes de cera normalmente perdem eficiência abaixo de 0°C porque endurecem mais rápido, perdem fluidez e aumentam o atrito da transmissão.</p>
      <p><strong>Recomendação:</strong> Para viagens frias, use <strong>óleo sintético úmido</strong>. Esse tipo de lubrificante resiste melhor à umidade, suporta neve e chuva gelada e mantém a corrente protegida.</p>

      <h2>2. Proteja as mãos corretamente</h2>
      <p>Mãos congeladas significam perda de reflexo e dificuldade para frear. O ideal é trabalhar em camadas:</p>
      <ul>
        <li><strong>Camada interna:</strong> Luva térmica fina.</li>
        <li><strong>Camada externa:</strong> Luva impermeável corta-vento.</li>
      </ul>
      <p>Evite algodão. Quando molha, ele rouba calor rapidamente.</p>

      <h2>3. Sistema de roupas em camadas</h2>
      <p>O segredo do inverno NÃO é usar uma roupa gigante, mas usar camadas inteligentes:</p>
      <ul>
        <li><strong>Camada base (Base layer):</strong> Responsável por retirar suor da pele. Use tecido térmico sintético ou lã merino.</li>
        <li><strong>Camada intermediária:</strong> Mantém o calor corporal. Use fleece, softshell ou isolamento leve.</li>
        <li><strong>Camada externa:</strong> Proteção contra vento, neve e chuva. Use uma jaqueta impermeável respirável.</li>
      </ul>

      <h2>4. Cuidados com freios e cabos</h2>
      <p>Temperaturas negativas podem endurecer cabos e congelar conduítes. Revise seus freios antes da viagem, troque cabos antigos e aplique lubrificação adequada. Freios hidráulicos normalmente performam melhor no frio intenso.</p>

      <h2>5. Pneus certos evitam acidentes</h2>
      <p>Em regiões geladas, pressão muito alta reduz a aderência. Reduza ligeiramente a pressão, use pneus mais largos se possível e priorize aderência ao invés de velocidade. Em neve extrema, pneus com cravos podem ser necessários.</p>

      <h2>6. Água congelando durante a rota</h2>
      <p>Em clima extremo, mangueiras de hidratação e garrafas podem congelar. Carregue garrafas invertidas, use capas térmicas e evite deixar a água exposta ao vento.</p>

      <h2>7. Bateria acaba muito mais rápido no frio</h2>
      <p>O frio intenso reduz drasticamente a autonomia de eletrônicos. Mantenha celular, GPS e powerbanks próximos ao corpo, dentro de bolsos internos e protegidos do vento.</p>

      <h2>8. Alimentação muda no frio</h2>
      <p>O corpo consome mais energia para manter a temperatura. Leve alimentos energéticos, snacks rápidos e bebidas quentes sempre que possível. O gasto calórico é significativamente maior.</p>

      <h2>9. Nunca subestime o vento frio</h2>
      <p>O vento pode transformar uma temperatura suportável em sensação térmica perigosa, especialmente em descidas longas ou regiões abertas. Proteção contra o vento é tão vital quanto isolamento térmico.</p>

      <h2>10. O inverno pune o improviso</h2>
      <p>No frio extremo, o ambiente cobra rápido. Planejamento, revisão mecânica e equipamentos adequados viram itens de sobrevivência, não luxo.</p>

      <div class="bg-[#ff641d]/10 p-6 border-l-4 border-[#ff641d] my-8">
        <p class="text-white font-bold mb-2 italic">"O inverno recompensa quem respeita a natureza e se prepara estrategicamente."</p>
      </div>

      <p>Projeto desenvolvido pela comunidade Trilhas e Rodas.<br/>Instagram: @trilhas_erodas</p>
    `
  },
  {
    id: 4,
    title: 'COMO VIAJAR DE AVIÃO COM BICICLETA SEM DOR DE CABEÇA',
    excerpt: 'Guia definitivo para cicloturistas: regras, embalagens, proteção de componentes e checklist para despachar a bike com segurança.',
    category: 'LOGÍSTICA',
    author: 'TR_COMMUNITY',
    date: '09.05.26',
    image: 'https://i.ibb.co/ycFWcS9D/viajar-de-bike-o-avi-o.png',
    content: `
      <h2>1. Verifique as regras da companhia aérea</h2>
      <p>Cada companhia possui regras diferentes para peso permitido, tamanho da embalagem e taxas extras. Antes da viagem, leia as políticas atualizadas no site oficial. Algumas empresas tratam bicicleta como “equipamento esportivo”, outras como “bagagem especial”.</p>

      <h2>2. Escolha a embalagem correta</h2>
      <ul>
        <li><strong>Caixa de papelão:</strong> Barata, fácil de encontrar em bicicletarias e oferece boa proteção básica.</li>
        <li><strong>Mala rígida (Mala-bike):</strong> Maior segurança, ideal para viagens frequentes, porém mais cara e pesada.</li>
        <li><strong>Bike bag para transporte:</strong> Leve e prática, excelente para quem já tem habilidade em desmontar a bike parcial ou totalmente.</li>
      </ul>

      <h2>3. O que você precisa desmontar</h2>
      <p>Na maioria dos voos será necessário: retirar a roda dianteira, alinhar o guidão no sentido do quadro (ou removê-lo completamente), recolher o canote e remover os pedais. <strong>Dica de ouro:</strong> Atualmente existem pneus dobráveis que facilitam muito o transporte; para pneus comuns, a recomendação padrão das aéreas é esvaziá-los parcialmente para evitar problemas de pressão no porão.</p>

      <h2>4. Proteja as partes frágeis</h2>
      <p>As áreas mais sensíveis são: câmbio traseiro, discos de freio, quadro, suspensão e coroas. Use espuma, papelão reforçado e plástico bolha. Pequenos cuidados evitam grandes prejuízos.</p>

      <h2>5. Protocolo de Aeroporto</h2>
      <p>Bagagens especiais exigem balcão específico e inspeção adicional. Chegue com pelo menos 3 horas de antecedência para voos internacionais e 2 horas para nacionais.</p>

      <h2>6. Documentação Fotográfica</h2>
      <p>Fotografe o quadro, rodas, embalagem e etiquetas antes do embarque. Isso é fundamental caso ocorra algum dano ou extravio.</p>

      <div class="bg-[#ff641d]/10 p-6 border-l-4 border-[#ff641d] my-8">
        <p class="text-white font-bold mb-2 italic">"A estrada não termina no aeroporto. Ela só muda de direção."</p>
      </div>

      <p>Projeto desenvolvido pela comunidade Trilhas e Rodas.<br/>Instagram: @trilhas_erodas</p>
    `
  },
  {
    id: 1,
    title: 'DOCUMENTAÇÃO: FRONTEIRAS AMÉRICA DO SUL',
    excerpt: 'Manual tático sobre RG, passaporte, comprovantes de vacina e protocolos de entrada em zonas de fronteira em 2026.',
    category: 'LOGÍSTICA',
    author: 'TR_COMMUNITY',
    date: '09.05.26',
    image: 'https://i.ibb.co/qMN3Xmmd/Documenta-o-para-cicloviajante.png',
    content: `
      <h2>1. Documento de identidade válido</h2>
      <p>Brasileiros conseguem entrar em diversos países da América do Sul apenas com RG em bom estado ou Passaporte válido. <strong>Atenção:</strong> CNH normalmente NÃO substitui documento internacional em imigração.</p>
      <p>Idealmente, seu documento deve ter sido emitido há menos de 10 anos, estar com foto reconhecível e sem nenhum rasgo ou dano estrutural.</p>

      <h2>2. Países que aceitam apenas RG</h2>
      <p>Argentina, Chile, Uruguai, Paraguai, Bolívia, Peru, Colômbia. Em geral, brasileiros conseguem entrar apenas com RG em países do Mercosul e associados. As regras podem mudar com o tempo, por isso consulte informações oficiais antes da viagem.</p>

      <h2>3. Passaporte: Quando vale a pena</h2>
      <p>Mesmo onde o RG é aceito, viajantes experientes preferem o Passaporte. Ele facilita a imigração, reduz problemas, agiliza carimbos e melhora a identificação internacional. Em viagens longas, o passaporte traz mais segurança.</p>

      <h2>4. Comprovante de vacinação</h2>
      <p>Alguns países podem exigir vacina contra febre amarela (Certificado Internacional), principalmente em áreas tropicais, fronteiras amazônicas ou regiões específicas. Verifique exigências sanitárias atualizadas.</p>

      <h2>5. Seguro viagem pode ser obrigatório</h2>
      <p>Alguns destinos podem solicitar seguro médico internacional com cobertura específica. Mesmo quando não obrigatório, é altamente recomendado para expedições longas, cobrindo internações e evacuação.</p>

      <h2>6. Documentos da bicicleta</h2>
      <p>Em viagens de bike, leve a nota fiscal (se possível), fotos da bike e o número do quadro anotado. Isso ajuda em fiscalizações, seguros e transporte internacional.</p>

      <h2>7. Atenção às fronteiras remotas</h2>
      <p>Nem toda fronteira funciona 24 horas. Algumas possuem horários reduzidos ou fechamento climático. Pesquise funcionamento, exigências e condições da estrada antes de chegar.</p>

      <h2>8. Dinheiro e câmbio</h2>
      <p>Nem todas as fronteiras possuem caixas eletrônicos. Leve dinheiro emergencial, cartão internacional e uma pequena reserva em dólar para evitar ficar preso em regiões isoladas.</p>

      <h2>9. Internet pode desaparecer completamente</h2>
      <p>Em algumas travessias, o sinal desaparece. Baixe mapas offline, documentos digitais e traduções antes de sair. Apps offline fazem enorme diferença.</p>

      <h2>10. Organização salva expedições</h2>
      <p>A maioria dos problemas em fronteiras acontece por desorganização ou falta de informação. Quem viaja preparado cruza fronteiras com muito menos estresse.</p>

      <div class="bg-[#ff641d]/10 p-8 rounded-2xl border-white/5 my-12">
        <h4 class="text-white font-display font-black uppercase tracking-widest mb-6">Checklist rápido antes da travessia</h4>
        <ul class="text-[11px] font-mono uppercase tracking-widest space-y-3">
          <li>[ ] RG atualizado ou passaporte válido</li>
          <li>[ ] Documentos protegidos contra chuva</li>
          <li>[ ] Comprovantes digitais salvos offline</li>
          <li>[ ] Seguro viagem e vacinação conferida</li>
          <li>[ ] Dinheiro reserva e mapa offline</li>
        </ul>
      </div>

      <p class="text-white/40 italic">Cruzar uma fronteira pedalando é mais do que mudar de país. É sentir que o mapa deixa de ser imagem... e vira estrada.</p>

      <p>Projeto desenvolvido pela comunidade Trilhas e Rodas.<br/>Instagram: @trilhas_erodas</p>
    `
  },
  {
    id: 2,
    title: 'EQUIPAMENTOS DE SOBREVIVÊNCIA PATAGÔNIA',
    excerpt: 'Análise técnica de sistemas de camadas e isolamento térmico para ambientes de frio extremo e ventos catabáticos.',
    category: 'GEAR_INTEL',
    author: 'LM_GEAR',
    date: '05.10.25',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600',
    content: '<p>Conteúdo em fase de digitalização...</p>'
  },
  {
    id: 3,
    title: 'MANUTENÇÃO DE CAMPO: REPAROS CRÍTICOS',
    excerpt: 'Protocolos de emergência para falhas mecânicas em isolamento geográfico. O que levar no kit de intervenção.',
    category: 'FIELD_OPS',
    author: 'CC_MECHANIC',
    date: '28.09.25',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600',
    content: '<p>Conteúdo em fase de digitalização...</p>'
  }
];

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPost, setSelectedPost] = useState<typeof posts[0] | null>(null);

  useEffect(() => {
    const postId = searchParams.get('id');
    if (postId) {
      const post = posts.find(p => p.id === parseInt(postId));
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [searchParams]);

  const handleBack = () => {
    setSelectedPost(null);
    setSearchParams({});
  };

  const handleSelectPost = (post: typeof posts[0]) => {
    setSelectedPost(post);
    setSearchParams({ id: post.id.toString() });
    window.scrollTo(0, 0);
  };

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto px-6 pb-24 relative z-10 antialiased">
        <SEO 
          title={`${selectedPost.title} - Rota Livre Hub`} 
          description={selectedPost.excerpt}
        />
        
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-[10px] font-mono text-[#ff641d] mb-12 hover:gap-4 transition-all uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Voltar para o Arquivo
        </button>

        <article className="prose prose-invert prose-orange max-w-none">
          <div className="text-[10px] font-mono tracking-[0.4em] text-[#ff641d] mb-6 uppercase">
            {selectedPost.category} // {selectedPost.id.toString().padStart(4, '0')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tighter mb-8 text-[#F8FAFC]">
            {selectedPost.title}
          </h1>

          <div className="flex items-center gap-6 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-12 border-b border-white/5 pb-8">
            <span className="flex items-center gap-2"><Calendar size={12} /> {selectedPost.date}</span>
            <span className="flex items-center gap-2"><User size={12} /> {selectedPost.author}</span>
          </div>

          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-12 border border-white/5">
            <img 
              src={selectedPost.image} 
              alt={selectedPost.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div 
            className="text-white/60 leading-relaxed space-y-6 text-base italic-content"
            style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
          />

          <div className="mt-24 pt-12 border-t border-white/5">
            <div className="flex flex-col gap-12">
              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ff641d] flex items-center justify-center font-display font-black text-white shadow-[0_0_20px_rgba(255,100,29,0.3)]">
                  TR
                </div>
                <div>
                  <div className="text-xs font-mono text-white uppercase tracking-widest">{selectedPost.author}</div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">Field Intelligence Lead</div>
                </div>
              </div>

              {/* Share Interface */}
              <div className="dashboard-card bg-white/[0.02] border-white/5 p-8 rounded-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div>
                    <h4 className="text-sm font-display font-bold text-white uppercase tracking-tight mb-1">Compartilhar Relato</h4>
                    <p className="text-[11px] text-white/30 font-mono uppercase tracking-widest">Disseminar inteligência na rede</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        const url = `https://wa.me/?text=${encodeURIComponent(`${selectedPost.title} - Rota Livre Hub: ${window.location.href}`)}`;
                        window.open(url, '_blank');
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all border border-[#25D366]/20 group"
                      title="Compartilhar no WhatsApp"
                    >
                      <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">WhatsApp</span>
                    </button>

                    <button 
                      onClick={() => {
                        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                        window.open(url, '_blank');
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all border border-[#1877F2]/20 group"
                      title="Compartilhar no Facebook"
                    >
                      <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Facebook</span>
                    </button>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        const btn = document.getElementById('copy-btn');
                        if (btn) {
                          const originalHtml = btn.innerHTML;
                          btn.innerHTML = '<span class="text-[10px] font-mono font-bold uppercase tracking-widest">Copiado!</span>';
                          btn.classList.add('bg-[#ff641d]', 'text-white');
                          setTimeout(() => {
                            btn.innerHTML = originalHtml;
                            btn.classList.remove('bg-[#ff641d]', 'text-white');
                          }, 2000);
                        }
                      }}
                      id="copy-btn"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/10 group"
                      title="Copiar Link"
                    >
                      <Copy size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Copiar Link</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instagram Promo */}
              <div className="flex items-center justify-center py-8">
                <a 
                  href="https://instagram.com/trilhas_erodas" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[10px] font-mono text-white/20 hover:text-[#E4405F] transition-colors uppercase tracking-[0.3em]"
                >
                  <Instagram size={14} /> Seguir @trilhas_erodas no Instagram
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

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
            className="group flex flex-col cursor-pointer"
            onClick={() => handleSelectPost(post)}
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
                    <div className="flex items-center gap-3 text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#ff641d] group-hover:gap-5 transition-all">
                      ACCESS_INTEL <ArrowRight size={14} />
                    </div>
                    <button 
                      className="text-white/10 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // share logic
                      }}
                    >
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

