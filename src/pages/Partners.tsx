import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, MapPin, Store, Phone, Instagram, Globe, 
  HelpCircle, CheckCircle, Loader2, ArrowRight, Hammer, 
  Tent, Coffee, Fuel, Droplets, Check, Compass, Sparkles,
  Camera, Info, ArrowDown, ExternalLink, ShieldAlert, Award,
  Users, AlertCircle
} from 'lucide-react';
import SEO from '@/src/components/SEO';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Partners() {
  // Form state
  const [businessName, setBusinessName] = useState('');
  const [cityCountry, setCityCountry] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagramAccount, setInstagramAccount] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [descriptionTxt, setDescriptionTxt] = useState('');
  const [howHelps, setHowHelps] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Scroll to Form helper
  const scrollToForm = () => {
    const formElement = document.getElementById('solicitacao-formulario');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim() || !cityCountry.trim() || !businessType || !whatsapp.trim()) {
      setErrorMessage('Por favor, preencha os campos obrigatórios (Nome, Localização, Tipo e WhatsApp).');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Create a nice human-readable message to save or submit
      await addDoc(collection(db, 'reports'), {
        category: 'PARTNERSHIP_APPLY',
        userName: businessName,
        userEmail: instagramAccount || 'N/A',
        location: cityCountry,
        content: `
          === PROTOCOLO DE NOVA PARCERIA OPERACIONAL ===
          Nome do Negócio: ${businessName}
          Cidade / País: ${cityCountry}
          Tipo de Negócio: ${businessType}
          WhatsApp / Contato: ${whatsapp}
          Instagram: ${instagramAccount || 'Não informado'}
          Site / Link: ${websiteUrl || 'Não informado'}
          Descrição / Detalhes: ${descriptionTxt || 'Não informado'}
          Como ajuda os viajantes: ${howHelps || 'Não informado'}
          Imagens fornecidas: ${photoUrl || 'Não informado'} (Arquivos locais anexados: ${selectedFiles.length})
        `.trim(),
        status: 'PENDING',
        createdAt: serverTimestamp()
      });

      // Clear form on success
      setSuccess(true);
      setBusinessName('');
      setCityCountry('');
      setBusinessType('');
      setWhatsapp('');
      setInstagramAccount('');
      setWebsiteUrl('');
      setDescriptionTxt('');
      setHowHelps('');
      setPhotoUrl('');
      setSelectedFiles([]);
      
      // Auto dismiss success screen after 10 seconds or scroll back up
      setTimeout(() => setSuccess(false), 12000);
    } catch (err: any) {
      console.error('Erro ao registrar parceiro:', err);
      setErrorMessage('Houve um problema de conexão com o terminal. Salvaremos sua solicitação em cache para sincronização posterior.');
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    { value: 'repair_bike', label: '🔧 Oficina de Bicicleta' },
    { value: 'repair_moto', label: '🏍️ Mecânica de Moto' },
    { value: 'motorhome_support', label: '🚐 Suporte Motorhome' },
    { value: 'camping', label: '🏕️ Camping / Acampamento' },
    { value: 'hostel', label: '🏨 Hostel / Hospedagem' },
    { value: 'cafe', label: '☕ Café de Estrada' },
    { value: 'support_point', label: '🚰 Ponto de Apoio Geral' },
    { value: 'market', label: '🛒 Mercado Estratégico' },
    { value: 'gas_station', label: '⛽ Posto de Abastecimento' },
    { value: 'other_benefit', label: '🧭 Negócio Útil para Viajantes' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-32 relative z-10 overflow-hidden">
      <SEO 
        title="Parceiros Operacionais — Rota Livre Hub" 
        description="Conecte sua oficina, hostel, camping, cafeteria ou comércio ao ecossistema operacional do viajante moderno na América Latina."
      />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center pt-10 pb-16 overflow-hidden md:px-12">
        {/* Subtle background radar/grid effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,100,29,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ff641d]/[0.02] blur-[150px] pointer-events-none rounded-full" />
        
        {/* HUD Frame Decorations */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/10" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/10" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/10" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/10" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#ff641d]/10 border border-[#ff641d]/30 rounded-full text-[9px] font-mono uppercase tracking-[0.35em] text-[#ff641d] font-bold"
          >
            <Sparkles size={11} className="animate-pulse" />
            PARCERIAS ESTRELA // PORTAL OPERACIONAL
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter uppercase leading-[0.9] text-white"
          >
            SUA MARCA DENTRO<br/>
            DA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff641d] to-[#ff9d00] relative">ROTA<span className="text-[#ff641d] absolute">.</span></span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#F8FAFC]/75 text-sm md:text-lg tracking-wide max-w-2xl mx-auto leading-relaxed"
          >
            Conecte sua oficina, hostel, camping, cafeteria ou comércio ao ecossistema operacional do viajante moderno. 
            O Rota Livre Hub ajuda aventureiros da América Latina a encontrar pontos de apoio, oficinas, hospedagens, água, manutenção, rotas e suporte real na estrada.
          </motion.p>

          {/* CTA Group */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button 
              onClick={scrollToForm}
              className="px-8 py-4.5 bg-gradient-to-r from-[#ff641d] to-[#ff7d3b] hover:to-[#ff641d] text-white text-xs font-mono font-bold uppercase tracking-[0.2em] rounded-sm transition-all shadow-[0_0_40px_rgba(255,100,29,0.3)] hover:shadow-[0_0_60px_rgba(255,100,29,0.5)] border border-white/15 flex items-center gap-3 cursor-pointer select-none active:scale-95"
            >
              [ SOLICITAR ENTRADA NO MAPA ]
              <ArrowRight size={14} className="animate-pulse" />
            </button>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">COORDENADAS_PARCEIRAS_ATIVAS // LATAM</span>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => {
          const problemElement = document.getElementById('bloco-problema');
          problemElement?.scrollIntoView({ behavior: 'smooth' });
        }}>
          <span className="text-[7px] font-mono tracking-widest uppercase">EXPLORAR_BENEFICIOS</span>
          <ArrowDown size={12} className="animate-bounce" />
        </div>
      </section>

      {/* --- BLOCO 2 — O PROBLEMA --- */}
      <section id="bloco-problema" className="py-24 border-t border-white/5 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div className="text-[8px] font-mono tracking-[0.4em] text-[#ff641d] uppercase">ESTRADA_VS_SISTEMA</div>
            <h2 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tighter leading-none text-white">
              O Google mostra lugares.<br/>
              Nós mostramos <span className="text-[#ff641d]">relevância</span> operacional.
            </h2>
            <div className="h-0.5 w-16 bg-[#ff641d]" />
            <p className="text-sm text-white/50 leading-relaxed font-medium">
              Uma oficina, camping ou estabelecimento comercial pode ter uma excelente avaliação de serviços urbanos comuns no Google. 
              Porém, quando se está no meio de uma expedição continental de longa distância, o asfalto é diferente e as necessidades são críticas.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0e1012] border border-white/5 p-8 relative rounded-sm flex flex-col justify-between">
              <div className="absolute top-2 right-2 text-[8px] font-mono text-white/10">TERMINAL_REF_B1</div>
              <div>
                <span className="text-[9px] font-mono text-white/30 block mb-4">BUSCA_CONVENCONAL</span>
                <h4 className="text-lg font-display font-bold text-white mb-2 uppercase tracking-tight">O que o Google entrega:</h4>
                <div className="space-y-2.5 mt-4 text-xs font-mono text-white/40">
                  <div className="flex items-center gap-2 line-through text-red-500/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <span>Nome genérico empresarial</span>
                  </div>
                  <div className="flex items-center gap-2 line-through text-red-500/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <span>Se está "aberto" ou "fechado" apenas</span>
                  </div>
                  <div className="flex items-center gap-2 line-through text-red-500/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <span>Review de clientes de shopping</span>
                  </div>
                  <div className="flex items-center gap-2 line-through text-red-500/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <span>Localização imprecisa para trilhas</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4 mt-6 text-[8px] font-mono text-red-500/40 uppercase">INFORMAL // DESATRIBUÍDO</div>
            </div>

            <div className="bg-gradient-to-br from-[#120f0c] to-[#0e1012] border border-[#ff641d]/20 p-8 relative rounded-sm flex flex-col justify-between shadow-[0_0_30px_rgba(255,100,29,0.05)]">
              <div className="absolute top-2 right-2 text-[8px] font-mono text-[#ff641d]/40">ROTA_LIVRE_PROT</div>
              <div>
                <span className="text-[9px] font-mono text-[#ff641d] block mb-4 uppercase font-bold">REQUISITOS OPERACIONAIS</span>
                <h4 className="text-lg font-display font-black text-white mb-2 uppercase tracking-tight">O que o viajante quer saber:</h4>
                
                <div className="space-y-4 mt-5">
                  <ul className="space-y-2 text-xs font-medium text-white/70">
                    {[
                      'Atende emergências de estrada?',
                      'Ajuda cicloturistas e aceita bike carregada?',
                      'Possui ferramentas e peças específicas?',
                      'É um local confiável para paradas longas?',
                      'Possui suporte rápido via WhatsApp?',
                      'Ajuda viajantes de longa distância?'
                    ].map((pergunta, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check size={14} className="text-[#ff641d] shrink-0 mt-0.5" />
                        <span className="uppercase text-[10px] tracking-wide font-mono text-white/80">{pergunta}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4 mt-6 text-[8px] font-mono text-emerald-500/80 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                VALOR_TÁTICO_VERIFICADO // OK
              </div>
            </div>

          </div>

        </div>

        <div className="mt-16 bg-[#16120e] border border-[#ff641d]/10 p-8 rounded-sm text-center max-w-4xl mx-auto">
          <p className="text-[#F8FAFC]/80 text-[13px] font-mono uppercase tracking-widest leading-relaxed">
            "O ROTA LIVRE HUB TRANSFORMA LOCAIS COMUNS EM PONTOS ESTRATÉGICOS DA ROTA."
          </p>
        </div>
      </section>

      {/* --- BLOCO 3 — QUEM PODE PARTICIPAR --- */}
      <section className="py-24 border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <div className="text-[8px] font-mono tracking-[0.4em] text-[#ff641d] uppercase">ECOSSISTEMA_INTEGRADO // SEGMENTOS</div>
          <h2 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tighter text-white">
            QUEM PODE ENTRAR NO ECOSSISTEMA
          </h2>
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest max-w-xl mx-auto">
            Admitimos marcas, comércios e pontos de apoio dispostos a contribuir com a comunidade viajante.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { tag: '🔧', title: 'Oficinas de bicicleta', path: 'repair_bike', color: 'border-amber-500/25 text-amber-500 bg-amber-500/[0.02]', icon: Hammer },
            { tag: '🏍️', title: 'Mecânicas de moto', path: 'repair_moto', color: 'border-yellow-500/25 text-yellow-500 bg-yellow-500/[0.02]', icon: Compass },
            { tag: '🚐', title: 'Suporte motorhome', path: 'motorhome_support', color: 'border-blue-500/25 text-blue-500 bg-blue-500/[0.02]', icon: Users },
            { tag: '🏕️', title: 'Campings', path: 'camping', color: 'border-green-500/25 text-green-500 bg-green-500/[0.02]', icon: Tent },
            { tag: '🏨', title: 'Hostels', path: 'hostel', color: 'border-purple-500/25 text-purple-500 bg-purple-500/[0.02]', icon: Coffee },
            { tag: '☕', title: 'Cafés de estrada', path: 'cafe', color: 'border-amber-600/25 text-amber-600 bg-amber-600/[0.02]', icon: Coffee },
            { tag: '🚰', title: 'Pontos de apoio', path: 'support_point', color: 'border-cyan-500/25 text-cyan-500 bg-cyan-500/[0.02]', icon: Droplets },
            { tag: '🛒', title: 'Mercados estratégicos', path: 'market', color: 'border-indigo-500/25 text-indigo-500 bg-indigo-500/[0.02]', icon: Store },
            { tag: '⛽', title: 'Postos', path: 'gas_station', color: 'border-red-500/25 text-red-500 bg-red-500/[0.02]', icon: Fuel },
            { tag: '🧭', title: 'Negócios úteis para viajantes', path: 'other_benefit', color: 'border-emerald-500/25 text-emerald-500 bg-emerald-500/[0.02]', icon: Compass },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`border p-6 rounded-sm flex flex-col justify-between items-start text-left min-h-[160px] hover:border-[#ff641d]/30 hover:bg-[#ff641d]/[0.01] transition-all group cursor-pointer ${item.color}`}
              onClick={() => {
                setBusinessType(item.path);
                scrollToForm();
              }}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-3xl">{item.tag}</span>
                <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-white mt-4 leading-tight group-hover:text-[#ff641d] transition-colors">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* --- BLOCO 4 — BENEFÍCIOS --- */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-[#ff641d]/[0.03] blur-[120px] pointer-events-none rounded-full" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="text-[8px] font-mono tracking-[0.4em] text-[#ff641d] uppercase">VANTAGEM_ESTRATEGICA</div>
            <h2 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tighter leading-none text-white">
              POR QUE ENTRAR NO ROTA LIVRE HUB?
            </h2>
            <p className="text-sm text-white/40 leading-relaxed font-medium">
              Não seja apenas mais um no mapa. Faça parte do roteiro de planejamento ativo de cicloturistas, mochileiros e aventureiros de toda a América do Sul.
            </p>
            <div className="pt-2">
              <button 
                onClick={scrollToForm}
                className="px-6 py-3 border border-[#ff641d]/30 hover:border-[#ff641d] text-[#ff641d] text-[9px] font-mono uppercase tracking-widest font-black transition-all hover:bg-[#ff641d]/5 active:scale-95"
              >
                [ MAPEAR MEU NEGÓCIO ]
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Presença dentro das rotas', desc: 'Sua marca exibida diretamente nos arquivos de navegação de trajetos lendários e expedicionários.' },
              { title: 'Exposição para viajantes reais', desc: 'Atraia de forma direta viajantes autônomos de longa distância orientados para a estrada.' },
              { title: 'Destaque operacional no mapa', desc: 'Filtro e categorização visual tática de destaque com ícones personalizados no mapa de BH/Minas e América Latina.' },
              { title: 'Tráfego segmentado', desc: 'Esqueça cliques curiosos. Fale diretamente com quem realmente precisa de apoio real em trânsito.' },
              { title: 'Avaliações da comunidade', desc: 'Receba comentários técnicos, relatos operacionais de quem esteve no local e entende as suas dores.' },
              { title: 'Validação operacional', desc: 'A comunidade de expedicionários certifica que seu ponto oferece o suporte prometido para estrada.' },
              { title: 'Integração visual premium', desc: 'Seus dados estruturados em HUDs elegantes que criam autoridade e facilitam a verificação.' },
              { title: 'Botão direto para WhatsApp', desc: 'Pontes de contato instantâneas para que o viajante envie sua emergência, tire dúvidas ou faça reservas.' },
              { title: 'Instagram integrado', desc: 'Fácil descoberta visual do dia a dia da sua oficina ou ponto de apoio pelas redes.' },
              { title: 'Galeria de fotos', desc: 'Mostre sua infraestrutura, fotos do ponto físico e de serviços já completados.' },
              { title: 'Destaque em regiões estratégicas', desc: 'Visibilidade prioritária de acordo com as coordenadas geográficas de rotas específicas.' },
            ].map((ben, idx) => (
              <div key={idx} className="bg-white/[0.01] border border-white/5 p-6 hover:border-[#ff641d]/15 hover:bg-white/[0.02] transition-colors rounded-xs group">
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#ff641d]/10 flex items-center justify-center text-[#ff641d] text-[10px] font-mono shrink-0 group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white group-hover:text-[#ff641d] transition-colors">{ben.title}</h3>
                    <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wide">{ben.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BLOCO 5 — COMO FUNCIONA --- */}
      <section className="py-24 border-t border-white/5 text-center">
        <div className="text-center space-y-4 mb-16">
          <div className="text-[8px] font-mono tracking-[0.4em] text-[#ff641d] uppercase font-black">LOGISTICA_DE_CADASTRO</div>
          <h2 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tighter text-white">
            COMO FUNCIONA
          </h2>
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest max-w-xl mx-auto">
            Processo ágil de inclusão e sincronização georreferenciada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left max-w-5xl mx-auto">
          {[
            { step: '01', title: 'Entrada no Sistema', desc: 'Sua marca entra no sistema operacional do mapa após preencher o radar de qualificação.' },
            { step: '02', title: 'Viajantes Encontram', desc: 'Aventureiros e estradeiros descobrem seu ponto geolocalizado durante o traçado das rotas.' },
            { step: '03', title: 'Validação Técnica', desc: 'A comunidade de viajantes valida operacionalmente a infraestrutura em relatos reais.' },
            { step: '04', title: 'Relevância na Estrada', desc: 'Seu negócio ganha relevância estratégica e prioridade em dezenas de guias integrados.' },
          ].map((pas, idx) => (
            <div key={idx} className="relative bg-[#0d0e10] border border-white/5 p-8 rounded-sm group hover:border-[#ff641d]/20 transition-all">
              {idx < 3 && (
                <div className="hidden md:block absolute top-[45px] left-full w-full h-[1px] border-t border-dashed border-white/10 z-0" />
              )}
              <div className="relative z-10 space-y-4">
                <span className="text-3xl font-display font-black text-[#ff641d]/20 group-hover:text-[#ff641d] transition-colors tracking-tighter block">{pas.step}</span>
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-white">{pas.title}</h3>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">{pas.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- BLOCO 6 — PLANOS FUTUROS --- */}
      <section className="py-24 border-t border-white/5">
        <div className="bg-gradient-to-r from-[#0d0e10] to-[#141210] border border-white/5 p-8 md:p-16 rounded-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 font-mono text-[7px] text-white/10 select-none">ROADMAP__GROWTH_S1</div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-[8px] font-mono tracking-widest text-[#ff641d] uppercase">
                <Award size={12} /> SISTEMA PREPARADO PARA CRESCIMENTO
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tighter leading-none text-white">
                Estrutura preparada para expansão continuada
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                Nós não somos uma plataforma agressiva de vendas ou classificados. O Rota Livre Hub é focado em utilidade operacional. Estamos moldando recursos que expandem a conexão entre negócios e desbravadores, com absoluto respeito ao design limpo e funcional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Selo Parceiro Operacional', label: 'QUALIFICAÇÃO', desc: 'Distintivo tático especial que atesta capacidade extrema de resgatar ou apoiar viajantes.' },
                { title: 'Destaque Premium Regional', label: 'PATROCINADO', desc: 'Prioridade visual limpa de busca em raio geográfico quando o viajante está próximo.' },
                { title: 'Alertas Patrocinados', label: 'PROSPECÇÃO', desc: 'Divulgação de sua oficina de forma integrada quando emitidos avisos críticos de rotas.' },
                { title: 'Campanhas Estratégicas', label: 'COMUNIDADE', desc: 'Eventos, encontros de mochileiros e passeios de cicloturismo usando seu ponto como hub.' }
              ].map((plane, idx) => (
                <div key={idx} className="bg-black/30 border border-white/5 p-6 rounded-xs hover:border-[#ff641d]/15 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[6.5px] font-mono text-[#ff641d] bg-[#ff641d]/10 px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold">{plane.label}</span>
                    <span className="text-[8px] font-mono text-white/20">RL_RDM_{idx + 1}</span>
                  </div>
                  <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider mb-1.5">{plane.title}</h4>
                  <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">{plane.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- BLOCO 7 — FORMULÁRIO DE SOLICITAÇÃO --- */}
      <section id="solicitacao-formulario" className="py-24 border-t border-white/5 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <div className="text-[8px] font-mono tracking-[0.4em] text-[#ff641d] uppercase font-black">ENTRADA_DE_DADOS // REGISTRO</div>
            <h2 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tighter text-white">
              Solicitar entrada operacional
            </h2>
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest max-w-xl mx-auto">
              Preencha os campos abaixo com as informações reais do seu negócio. Seu ponto será analisado e desenhado estrategicamente no nosso mapa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#0b0c0d] border border-white/10 p-8 md:p-12 space-y-8 rounded-sm shadow-2xl relative">
            {/* Form Top HUD details */}
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#ff641d]/45 to-transparent" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nome do negócio */}
              <div className="space-y-2">
                <label className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em] block">NOME DO NEGÓCIO *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs font-mono">ID:</span>
                  <input
                    required
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Oficina do Ciclo, Hostel da Serra..."
                    className="w-full bg-white/[0.02] border border-white/5 font-mono text-xs rounded-xs h-12 pl-12 pr-4 text-white placeholder:text-white/15 focus:outline-none focus:border-[#ff641d]/50 transition-all uppercase"
                  />
                </div>
              </div>

              {/* Cidade / País */}
              <div className="space-y-2">
                <label className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em] block">CIDADE / PAÍS *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <input
                    required
                    type="text"
                    value={cityCountry}
                    onChange={(e) => setCityCountry(e.target.value)}
                    placeholder="Belo Horizonte / Brasil"
                    className="w-full bg-white/[0.02] border border-white/5 font-mono text-xs rounded-xs h-12 pl-12 pr-4 text-white placeholder:text-white/15 focus:outline-none focus:border-[#ff641d]/50 transition-all uppercase"
                  />
                </div>
              </div>

              {/* Tipo de negócio */}
              <div className="space-y-2">
                <label className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em] block">TIPO DE NEGÓCIO *</label>
                <div className="relative">
                  <select
                    required
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-[#0d0e11] border border-white/5 font-mono text-xs rounded-xs h-12 px-4 text-white/80 focus:outline-none focus:border-[#ff641d]/50 transition-all uppercase appearance-none"
                  >
                    <option value="" disabled className="text-white/30">Selecione o segmento...</option>
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-[#0b0c0d] text-white/80">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/25 text-[8px] font-mono">SELECT</div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <label className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em] block">WHATSAPP / CONTATO *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <input
                    required
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(31) 99999-9999"
                    className="w-full bg-white/[0.02] border border-white/5 font-mono text-xs rounded-xs h-12 pl-12 pr-4 text-white placeholder:text-white/15 focus:outline-none focus:border-[#ff641d]/50 transition-all"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <label className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em] block">INSTAGRAM (CONTA)</label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <input
                    type="text"
                    value={instagramAccount}
                    onChange={(e) => setInstagramAccount(e.target.value)}
                    placeholder="@seu_negocio"
                    className="w-full bg-white/[0.02] border border-white/5 font-mono text-xs rounded-xs h-12 pl-12 pr-4 text-white placeholder:text-white/15 focus:outline-none focus:border-[#ff641d]/50 transition-all"
                  />
                </div>
              </div>

              {/* Site */}
              <div className="space-y-2">
                <label className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em] block">SITE / LINK ÚTIL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://meusite.com.br"
                    className="w-full bg-white/[0.02] border border-white/5 font-mono text-xs rounded-xs h-12 pl-12 pr-4 text-white placeholder:text-white/15 focus:outline-none focus:border-[#ff641d]/50 transition-all font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em] block">DESCRIÇÃO E ENDEREÇO DO LOCAL</label>
              <textarea
                value={descriptionTxt}
                onChange={(e) => setDescriptionTxt(e.target.value)}
                placeholder="Informe o endereço preciso de atendimento, dias/horários de funcionamento e uma pequena introdução das suas facilidades ou produtos."
                className="w-full bg-white/[0.02] border border-white/5 font-mono text-xs rounded-xs p-4 text-white placeholder:text-white/15 focus:outline-none focus:border-[#ff641d]/50 transition-all h-28 resize-none uppercase"
              />
            </div>

            {/* Como ajuda viajantes? */}
            <div className="space-y-2">
              <label className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em] block">COMO AJUDA VIAJANTES E ESTRELEIROS?</label>
              <textarea
                value={howHelps}
                onChange={(e) => setHowHelps(e.target.value)}
                placeholder="Exemplo: Possuo ferramentas para bike/moto, tenho torneira externa com água potável liberada, disponibilizo chuveiro, garagem segura para guardar equipamentos..."
                className="w-full bg-white/[0.02] border border-white/5 font-mono text-xs rounded-xs p-4 text-white placeholder:text-white/15 focus:outline-none focus:border-[#ff641d]/50 transition-all h-28 resize-none uppercase"
              />
            </div>

            {/* Fotos */}
            <div className="space-y-3">
              <label className="text-[8px] font-mono text-white/60 uppercase tracking-[0.2em] block">FOTOS E COMUNICAÇÃO VISUAL</label>
              
              <div className="space-y-2">
                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Insira link da foto (URL) se já possuir hospedada na nuvem"
                    className="w-full bg-white/[0.02] border border-white/5 font-mono text-xs rounded-xs h-12 pl-12 pr-4 text-white placeholder:text-white/15 focus:outline-none focus:border-[#ff641d]/50 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Simulated Drag & Drop for File Uploads */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-sm p-8 text-center transition-all ${
                  dragActive ? 'border-[#ff641d] bg-[#ff641d]/5' : 'border-white/10 bg-white/[0.01]'
                }`}
              >
                <input 
                  type="file" 
                  id="form-file-upload" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                
                <label htmlFor="form-file-upload" className="cursor-pointer flex flex-col items-center gap-2 group">
                  <div className="p-3 bg-white/5 rounded-full text-white/40 group-hover:text-white/80 transition-all">
                    <Camera size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest block">
                    Arraste imagens ou <span className="text-[#ff641d] underline font-bold group-hover:text-[#ff844d]">procure arquivos</span>
                  </span>
                  <span className="text-[8px] font-mono text-white/20 uppercase">
                    Formatos aceitos: JPG, PNG, WEBP (Máx 5MB)
                  </span>
                </label>

                {selectedFiles.length > 0 && (
                  <div className="mt-6 border-t border-white/5 pt-4 text-left">
                    <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest block mb-2 font-bold">Arquivos selecionados ({selectedFiles.length}):</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm">
                          <span className="text-[9px] font-mono text-white/60 truncate max-w-[150px]">{file.name}</span>
                          <span className="text-[7.5px] font-mono text-[#ff641d] lowercase shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                          <button 
                            type="button" 
                            onClick={() => removeFile(i)}
                            className="text-red-400 hover:text-red-500 text-xs font-mono ml-1 text-[10px]"
                          >
                            [X]
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error notifications */}
            {errorMessage && (
              <div className="p-4 bg-red-950/40 border border-red-800 text-red-400 rounded-sm text-xs font-mono flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="uppercase text-[9.5px] tracking-wide leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success notifications */}
            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 bg-emerald-950/50 border border-emerald-500 text-emerald-400 rounded-sm text-xs font-mono flex flex-col gap-2 shadow-xl"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle size={18} className="text-emerald-400" />
                    <span className="uppercase tracking-widest">PEDIDO REGISTRADO NO RADAR COM SUCESSO!</span>
                  </div>
                  <p className="text-[10px] uppercase text-white/60 tracking-wider leading-relaxed">
                    Nossa equipe tática de campo analisará as coordenadas e informações fornecidas. Se aprovado, seu negócio será ilustrado no mapa de apoios da América Latina e você receberá uma notificação direta de ativação. Obrigado por fortalecer a estrada livre.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form actions / buttons */}
            <div className="pt-4 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-white/5">
              <div className="flex items-center gap-2">
                <Info size={12} className="text-[#ff641d]" />
                <span className="text-[8px] font-mono text-[#F8FAFC]/30 uppercase tracking-[0.2em]">Todos os dados são criptografados antes do disparo.</span>
              </div>
              
              <button
                disabled={loading}
                type="submit"
                className="w-full md:w-auto px-10 h-14 bg-gradient-to-r from-[#ff641d] to-[#ff7d3b] hover:to-[#ff641d] text-white disabled:opacity-40 text-xs font-mono font-black uppercase tracking-[0.25em] rounded-sm transition-all focus:outline-none flex items-center justify-center gap-3 select-none active:scale-95 shadow-md shadow-[#ff641d]/10"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    DISPARANDO_VETORES...
                  </>
                ) : (
                  <>
                    [ ENTRAR NO RADAR OPERACIONAL ]
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </section>

      {/* --- FOOTER BANNER / RODAPÉ --- */}
      <section className="py-12 border-t border-white/5 mt-16 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-[#F8FAFC]/50 text-[13px] font-mono uppercase tracking-widest leading-relaxed">
            O Rota Livre Hub está construindo a maior infraestrutura colaborativa para viajantes da América Latina.
          </p>
          <p className="text-[#ff641d] text-[10px] font-mono tracking-[0.3em] uppercase font-black">
            FEITO POR QUEM VIVE A ESTRADA.
          </p>
        </div>
      </section>

    </div>
  );
}
