import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  ShieldAlert, 
  Mountain, 
  RefreshCw, 
  Globe, 
  CloudRain, 
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  MapPin,
  ChevronRight,
  X,
  Compass
} from "lucide-react";

interface AlertItem {
  id: string;
  title: string;
  link: string;
  date: string;
  timestamp: number;
  resumo: string;
  fonte: string;
  category: "BLOQUEIO" | "FRONTEIRA" | "CLIMA" | "CRÍTICO" | "GERAL";
  priority: "CRITICAL" | "ATTENTION" | "MODERATE" | "LOW";
  country: "Brasil" | "Argentina" | "Chile" | "Uruguai" | "América Latina";
}

const CATEGORY_THEMES = {
  BLOQUEIO: {
    color: "text-amber-400 border-amber-500/20 bg-amber-500/[0.03]",
    badge: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.08)] hover:border-amber-500/30",
    icon: AlertTriangle
  },
  FRONTEIRA: {
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/[0.03]",
    badge: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.08)] hover:border-cyan-500/30",
    icon: Globe
  },
  CLIMA: {
    color: "text-blue-400 border-blue-500/20 bg-blue-500/[0.03]",
    badge: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.08)] hover:border-blue-500/30",
    icon: CloudRain
  },
  CRÍTICO: {
    color: "text-rose-400 border-rose-500/20 bg-rose-500/[0.03]",
    badge: "border-rose-500/30 text-rose-400 bg-rose-500/10",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.08)] hover:border-rose-500/30",
    icon: ShieldAlert
  },
  GERAL: {
    color: "text-zinc-400 border-zinc-700 bg-zinc-800/[0.03]",
    badge: "border-zinc-700 text-zinc-400 bg-zinc-800/20",
    glow: "shadow-none hover:border-zinc-650",
    icon: Mountain
  }
};

const PRIORITY_THEMES = {
  CRITICAL: "border-rose-900/30 text-rose-400 bg-rose-500/10",
  ATTENTION: "border-amber-900/30 text-amber-400 bg-amber-500/10",
  MODERATE: "border-blue-900/30 text-blue-400 bg-blue-500/10",
  LOW: "border-zinc-800 text-zinc-500 bg-zinc-950/20"
};

// Helper function to dynamically construct high-legibility tactical alerts & operational summaries based on actual keywords
function getOperationalBriefing(alert: AlertItem) {
  const titleLower = alert.title.toLowerCase();
  const summaryLower = alert.resumo.toLowerCase();
  const fullText = `${titleLower} ${summaryLower}`.toLowerCase();

  let oQueAconteceu = alert.resumo;
  let impactoViajantes = "Fluxo operacional sob parâmetros normais. Atenção a oscilações climáticas pontuais.";
  let impactoCicloturistas = "Condição favorável. Recomenda-se manter visibilidade alta e iluminação ativa.";
  let impactoMotorhome = "Trajeto regular. Planeje pontos de abastecimento secundários de água e combustível prévio.";
  let acaoRecomendada = "Mantenha a velocidade padrão da via e consulte atualizações nas páginas do Rota Livre.";
  
  let statusBadge = { 
    label: "🟢 ESTÁVEL", 
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[#F1F1F1]" 
  };

  if (
    fullText.includes("bloqueio") || 
    fullText.includes("bloqueada") || 
    fullText.includes("bloqueado") || 
    fullText.includes("bloquear") || 
    fullText.includes("interdição") ||
    fullText.includes("interrompido") ||
    fullText.includes("cerrada") ||
    fullText.includes("cerrado") ||
    fullText.includes("paso cerrado") ||
    fullText.includes("cortada") ||
    fullText.includes("cortado")
  ) {
    oQueAconteceu = `Bloqueio físico ou restrição operacional imposta devido a ocorrências extraordinárias, reparos estruturais na pista ou condições adjacentes adversas.`;
    impactoViajantes = "Tráfego impedido ou funcionando sob sistema de pare e siga. Previsão de lentidão extrema no trecho afetado.";
    impactoCicloturistas = "Risco elevado de interrupção física. Passagem de ciclistas pode estar obstruída por resíduos espessos ou impedida por diretrizes policiais.";
    impactoMotorhome = "Totalmente desaconselhado avançar para este quadrante. Dimensões elevadas reduzem drasticamente capacidade de manobra em desvios íngremes.";
    acaoRecomendada = "Suspenda o avanço imediato. Encontre um ponto de apoio seguro ou use as ferramentas de mapas integradas para traçar desvios.";
    statusBadge = {
      label: "🔴 ALERTA CRÍTICO",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20 text-[#F1F1F1]"
    };
  } else if (
    fullText.includes("deslizamento") || 
    fullText.includes("queda de barreira") || 
    fullText.includes("desmoronamento") || 
    fullText.includes("avalancha") || 
    fullText.includes("barranco")
  ) {
    oQueAconteceu = `Deslizamento de terra ou quedas de pedras soltas obstruindo o leito carroçável de rodovia decorrente do acúmulo de umidade no solo.`;
    impactoViajantes = "Condição asfáltica escorregadia extrema com presença de detritos arenosos sob a via. Lentidão no fluxo local.";
    impactoCicloturistas = "Perigo grave. Risco iminente de desníveis abruptos acumulados e perda súbita de aderência dos pneus.";
    impactoMotorhome = "Perigo aos eixos de tração devido à lama espessa. Manobre com cautela absoluta para preservar a suspensão traseira.";
    acaoRecomendada = "Evite trafegar durante chuva persistente de encosta e planeje desvios antes das principais serras.";
    statusBadge = {
      label: "🔴 ALERTA CRÍTICO",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20 text-[#F1F1F1]"
    };
  } else if (
    fullText.includes("clima") || 
    fullText.includes("chuva") || 
    fullText.includes("tempestade") || 
    fullText.includes("nevada") || 
    fullText.includes("neve") || 
    fullText.includes("hielo") || 
    fullText.includes("gelo") || 
    fullText.includes("frio") || 
    fullText.includes("ventania") || 
    fullText.includes("viento") || 
    fullText.includes("tormenta") || 
    fullText.includes("neblina") || 
    fullText.includes("congelamento")
  ) {
    oQueAconteceu = `Instabilidade atmosférica severa diminuindo os fatores de atrito do leito asfáltico e reduzindo os limites de visão vertical dos viajantes.`;
    impactoViajantes = "Chuvas ou precipitações gerando aquaplanagem e baixa visibilidade frontal. Cautela com o fluxo de veículos de carga.";
    impactoCicloturistas = "Risco de hipotermia devido à exposição climática contínua em altitudes de serra. Proteja-se.";
    impactoMotorhome = "Ventos de través podem afetar sensivelmente a estabilidade lateral do veículo alto. Reduza a velocidade de cruzeiro.";
    acaoRecomendada = "Consulte o clima regional nos botões integrados, portar correntes de pneu adequadas e trafegar com faróis baixos ligados.";
    statusBadge = {
      label: "🟠 RISCO MODERADO",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20 text-[#F1F1F1]"
    };
  } else if (
    fullText.includes("fronteira") || 
    fullText.includes("aduana") || 
    fullText.includes("migraciones") || 
    fullText.includes("paso") || 
    fullText.includes("jama") || 
    fullText.includes("libertadores") || 
    fullText.includes("cristo redentor")
  ) {
    oQueAconteceu = `Saturação alfandegária, operação restritiva ou horário excepcional no controle de aduanas entre países fronteiriços da América Latina.`;
    impactoViajantes = "Tempos prolongados em filas de triagem aduaneiras. Verifique se possui documentação impressa obrigatória à mão.";
    impactoCicloturistas = "Altas variações térmicas nas filas externas do controle migratório de altitude. Recomenda-se jaqueta térmica.";
    impactoMotorhome = "Vistoria interna minuciosa da estrutura veicular de apoio. Verifique permissões fiscais e restrições de produtos animais.";
    acaoRecomendada = "Estudos de rotas e confirmação prévia nos postos antes de avançar para evitar pernoite indesejado na montanha.";
    statusBadge = {
      label: "🟡 ATENÇÃO",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[#F1F1F1]"
    };
  } else if (
    fullText.includes("alerta") || 
    fullText.includes("perigo") || 
    fullText.includes("urgente") || 
    fullText.includes("crítico")
  ) {
    oQueAconteceu = `Ocorrência de interesse operacional sinalizada nas proximidades. Requer vigília estrita dos condutores.`;
    impactoViajantes = "Atenção redobrada a veículos parados no acostamento ou equipes de desobstrução trabalhando.";
    impactoCicloturistas = "Transitar rigidamente dentro dos recuos da via utilizando sinalizadores noturnos de alta intensidade.";
    impactoMotorhome = "Manejo seguro de velocidade e distância para evitar freadas abruptas decorrentes de obstáculos inesperados.";
    acaoRecomendada = "Adotar direção defensiva em tempo integral e consultar mapa operacional interativo.";
    statusBadge = {
      label: "🟡 ATENÇÃO",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[#F1F1F1]"
    };
  }

  return { oQueAconteceu, impactoViajantes, impactoCicloturistas, impactoMotorhome, acaoRecomendada, statusBadge };
}

export default function RadarContingencia() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("TODOS");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODAS");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const countries = ["TODOS", "Brasil", "Argentina", "Chile", "Uruguai", "América Latina"];
  const categories = ["TODAS", "BLOQUEIO", "FRONTEIRA", "CLIMA", "CRÍTICO", "GERAL"];

  const fetchAlerts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const response = await fetch("/api/alerts");
      if (!response.ok) {
        throw new Error(`Serviço respondeu com erro ${response.status}`);
      }
      const data = await response.json();
      setAlerts(data);
    } catch (err: any) {
      console.error("[RadarContingencia] Falha ao sincronizar:", err);
      setError("Falha operacional ao conectar com a rede de inteligência LATAM. Verifique sua conexão de satélite.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Auto-update every 3 minutes
    const interval = setInterval(() => fetchAlerts(false), 180000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch = 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.resumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.fonte.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = selectedCountry === "TODOS" || alert.country === selectedCountry;
      const matchesCategory = selectedCategory === "TODAS" || alert.category === selectedCategory;

      return matchesSearch && matchesCountry && matchesCategory;
    });
  }, [alerts, searchTerm, selectedCountry, selectedCategory]);

  return (
    <div className="w-full font-sans bg-zinc-950/40 border border-white/[0.03] rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden" id="radar_contingencia">
      {/* Decorative radar lines background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff641d]/[0.01] rounded-full border border-[#ff641d]/[0.03] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff641d]/[0.015] rounded-full border border-dashed border-[#ff641d]/[0.05] -translate-y-1/2 translate-x-1/2 pointer-events-none animate-[spin_120s_linear_infinite]" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff641d]/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.04] mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff641d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff641d]"></span>
            </span>
            <div className="text-[10px] font-mono tracking-[0.3em] font-extrabold text-[#ff641d] uppercase flex items-center gap-1.5">
              <Radio size={12} className="animate-pulse" /> SATELLITE_HYPER_STREAM_LATAM
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight uppercase">
            RADAR_DE_CONTINGÊNCIA
          </h2>
          <p className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
            Monitoramento operacional em tempo real da malha logística da América Latina
          </p>
        </div>

        <button
          onClick={() => fetchAlerts(true)}
          disabled={loading || refreshing}
          className="self-start md:self-center flex items-center gap-2.5 px-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 active:scale-95 disabled:opacity-50 text-[10px] font-mono font-bold text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none"
        >
          <RefreshCw size={12} className={`${loading || refreshing ? "animate-spin text-[#ff641d]" : "text-white/60"}`} />
          {refreshing ? "Sincronizando..." : "Atualizar Radar"}
        </button>
      </div>

      {/* Controls: Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Filtrar por palavra-chave..."
            className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 focus:border-[#ff641d]/30 text-xs font-mono tracking-wider text-white uppercase pl-10 pr-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-white/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Country */}
        <div className="md:col-span-4 flex items-center gap-2">
          <span className="text-[9px] font-mono text-white/30 px-2 uppercase select-none">Origem:</span>
          <div className="flex-1 flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-white/[0.01] border border-white/5 focus:border-[#ff641d]/30 text-xs font-mono text-white uppercase p-3 rounded-2xl outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c} className="bg-zinc-950 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Category */}
        <div className="md:col-span-4 flex items-center gap-2">
          <span className="text-[9px] font-mono text-white/30 px-2 uppercase select-none">Alerta:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white/[0.01] border border-white/5 focus:border-[#ff641d]/30 text-xs font-mono text-white uppercase p-3 rounded-2xl outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-950 text-white">
                {cat === "TODAS" ? "TODOS OS TIPOS" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List Area */}
      <div className="relative min-h-[300px]">
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 relative overflow-hidden animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/5" />
                  <div className="space-y-2 flex-1">
                    <div className="h-2.5 bg-white/5 rounded w-1/3" />
                    <div className="h-2 bg-white/5 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-4/5" />
                </div>
                <div className="h-8 bg-white/5 rounded-xl w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Operational Error Fallback */
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-red-500/10 rounded-2xl bg-red-950/[0.02]"
          >
            <ShieldAlert size={40} className="text-red-500/60 mb-4 animate-bounce" />
            <h4 className="text-sm font-mono font-bold text-red-400 uppercase tracking-wider mb-2">ERRO NA REDE DE TELEMETRIA</h4>
            <p className="max-w-md text-xs text-white/45 leading-relaxed font-sans px-4">
              {error}
            </p>
            <button
               onClick={() => fetchAlerts(false)}
               className="mt-6 px-5 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 font-mono text-[9px] font-bold tracking-widest uppercase transition-all rounded-lg cursor-pointer"
            >
              Reestabelecer Comunicação
            </button>
          </motion.div>
        ) : filteredAlerts.length === 0 ? (
          /* Clean elegant empty state */
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-white/5 bg-white/[0.005] rounded-3xl"
          >
            <CheckCircle2 size={36} className="text-[#ff641d]/75 mb-4 animate-pulse" />
            <h4 className="text-xs font-mono font-bold text-white/60 uppercase tracking-widest mb-1.5">ALTA FLUIDEZ LATAM DETECTADA</h4>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider max-w-sm px-6">
              Nenhuma anomalia, bloqueio crítico ou intempérie meteorológica registrada sob os parâmetros escolhidos. Passagem limpa.
            </p>
          </motion.div>
        ) : (
          /* Beautiful feed layout cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.map((alert) => {
                const theme = CATEGORY_THEMES[alert.category] || CATEGORY_THEMES.GERAL;
                const Icon = theme.icon;

                return (
                  <motion.div
                    key={alert.id}
                    layout // Smooth rearrangement animation
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`bg-zinc-900/[0.15] hover:bg-zinc-900/[0.4] border border-white/[0.03] hover:border-white/[0.09] p-5 rounded-2xl flex flex-col justify-between gap-5 transition-all group duration-300 ${theme.glow}`}
                  >
                    <div>
                      {/* Top bar info */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${theme.color} transition-colors group-hover:scale-105 duration-300`}>
                            <Icon size={14} className="group-hover:rotate-6 transition-transform" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border tracking-wider ${theme.badge}`}>
                                {alert.category}
                              </span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border tracking-wider ${PRIORITY_THEMES[alert.priority]}`}>
                                {alert.priority}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/20 uppercase tracking-widest mt-1">
                              <MapPin size={9} className="text-[#ff641d]" /> {alert.country}
                            </div>
                          </div>
                        </div>

                        <span className="text-[8px] font-mono text-white/15 group-hover:text-[#ff641d]/40 transition-colors">
                          {alert.id}
                        </span>
                      </div>

                      {/* Content text */}
                      <h3 className="text-sm font-display font-black text-white/95 uppercase tracking-wide group-hover:text-[#ff641d] transition-colors leading-snug mb-3">
                        {alert.title}
                      </h3>

                      <p className="text-white/45 text-xs font-sans leading-relaxed block overflow-hidden line-clamp-3 select-text">
                        {alert.resumo}
                      </p>
                    </div>

                    {/* Bottom Metadata & CTA */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.03] text-[9px] font-mono text-white/35">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[8px] tracking-wider uppercase font-semibold">
                          <Clock size={10} className="text-white/25" /> {alert.date}
                        </span>
                        <span className="text-white/10">|</span>
                        <span className="text-[8px] max-w-[100px] truncate uppercase text-white/25">
                          {alert.fonte}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="flex items-center gap-1.5 text-[#ff641d] hover:text-[#ff8548] font-bold group/link uppercase tracking-wider transition-all cursor-pointer text-[8px] border border-[#ff641d]/15 bg-[#ff641d]/5 hover:bg-[#ff641d]/10 px-2.5 py-1.5 rounded-lg active:scale-95 duration-200 select-none"
                      >
                        Ver Alerta 
                        <ChevronRight size={10} className="translate-y-[-0.5px] group-hover/link:translate-x-0.5 duration-200" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Safety Notice and Tactical footprint */}
      <div className="mt-8 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[8px] font-mono text-white/20 uppercase tracking-widest">
        <span>Filtro de contingência: Google News RSS indexing + AI categorization</span>
        <span>A segurança na rota depende de confirmação ativa individual — use com juízo.</span>
      </div>

      {/* Modal/Bottom-Sheet Overlay for Full Alert Contingency Intelligence */}
      <AnimatePresence>
        {selectedAlert && (() => {
          const brief = getOperationalBriefing(selectedAlert);
          const categoryTheme = CATEGORY_THEMES[selectedAlert.category] || CATEGORY_THEMES.GERAL;
          const AlertIcon = categoryTheme.icon;

          return (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-[12px] transition-all">
              {/* Click outside to close */}
              <div 
                className="absolute inset-0 cursor-zoom-out" 
                onClick={() => setSelectedAlert(null)} 
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="w-full max-w-2xl bg-[#080808]/95 border border-[#ff7828]/18 shadow-[0_0_50px_rgba(255,100,29,0.06)] relative z-10 overflow-hidden max-md:rounded-t-3xl md:rounded-3xl flex flex-col max-h-[85vh] md:max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Grab Bar Indicator for Mobile Bottom Sheet */}
                <div className="md:hidden flex justify-center py-3.5 border-b border-white/[0.02]">
                  <div className="w-12 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Header Area */}
                <div className="p-6 md:p-8 pb-4 border-b border-white/[0.04] relative">
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="absolute right-6 top-6 p-2 rounded-full bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 text-white/50 hover:text-white transition-all cursor-pointer select-none"
                  >
                    <X size={14} />
                  </button>

                  {/* Tags and Status line */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 pr-8">
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${brief.statusBadge.color}`}>
                      {brief.statusBadge.label}
                    </span>
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${categoryTheme.badge}`}>
                      {selectedAlert.category}
                    </span>
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={9} className="text-[#ff641d]" /> {selectedAlert.country}
                    </span>
                  </div>

                  {/* Title - No excessive bold */}
                  <h3 className="text-base md:text-lg font-display font-medium text-[#F1F1F1] tracking-tight uppercase leading-snug">
                    {selectedAlert.title}
                  </h3>

                  {/* Underline indicators */}
                  <div className="flex items-center gap-4 mt-3 text-[9px] font-mono text-white/35">
                    <span className="flex items-center gap-1 uppercase">
                      <Clock size={10} className="text-[#ff641d]" /> {selectedAlert.date}
                    </span>
                    <span>|</span>
                    <span className="truncate uppercase">
                      Fonte: {selectedAlert.fonte}
                    </span>
                  </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="p-6 md:p-8 pt-4 pb-4 overflow-y-auto flex-1 space-y-6">
                  {/* Resumo Operacional IA Frame */}
                  <div className="bg-white/[0.01] rounded-2xl border border-white/[0.03] overflow-hidden relative">
                    {/* Vertical left accent flow indicator bar */}
                    <div className={`absolute top-0 left-0 bottom-0 w-[3px] ${selectedAlert.category === "BLOQUEIO" ? "bg-amber-500" : selectedAlert.category === "FRONTEIRA" ? "bg-cyan-500" : selectedAlert.category === "CLIMA" ? "bg-blue-500" : selectedAlert.category === "CRÍTICO" ? "bg-rose-500" : "bg-zinc-500"}`} />
                    
                    <div className="p-5 pl-6 space-y-5">
                      <div className="flex items-center gap-2 mb-2 text-[#ff641d] font-mono text-[9px] tracking-widest font-extrabold uppercase">
                        <Radio size={11} className="animate-pulse" /> RELATÓRIO DE INTELIGÊNCIA OPERACIONAL
                      </div>

                      {/* Section O Que Aconteceu */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono tracking-wider text-white/40 uppercase block">
                          O que aconteceu:
                        </span>
                        <p className="text-xs text-[#F1F1F1] font-normal leading-relaxed">
                          {brief.oQueAconteceu}
                        </p>
                      </div>

                      {/* Section Impacto para Viajantes */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono tracking-wider text-white/40 uppercase block">
                          Impacto para Viajantes:
                        </span>
                        <p className="text-xs text-[#F1F1F1] font-normal leading-relaxed">
                          {brief.impactoViajantes}
                        </p>
                      </div>

                      {/* Section Impacto para Cicloturistas */}
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-mono tracking-wider text-white/40 uppercase block">
                          Impacto para Cicloturistas:
                        </span>
                        <p className="text-xs text-[#F1F1F1] font-normal leading-relaxed">
                          {brief.impactoCicloturistas}
                        </p>
                      </div>

                      {/* Section Impacto para Motorhome */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono tracking-wider text-white/40 uppercase block">
                          Impacto para Motorhome:
                        </span>
                        <p className="text-xs text-[#F1F1F1] font-normal leading-relaxed">
                          {brief.impactoMotorhome}
                        </p>
                      </div>

                      {/* Section Ação Recomendada */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono tracking-wider text-[#ff641d] uppercase block font-semibold">
                          Ação Recomendada:
                        </span>
                        <p className="text-xs text-[#F1F1F1] font-normal leading-relaxed">
                          {brief.acaoRecomendada}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direct App Integration Action Buttons */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono tracking-wider text-white/35 uppercase block">
                      Navegação Operacional Integrada Rota Livre:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <Link
                        to="/mapa"
                        className="flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-[#ff641d]/30 text-[10px] font-mono font-bold text-white uppercase tracking-wider rounded-xl transition-all active:scale-95 duration-200"
                      >
                        <span className="flex items-center gap-2">
                          <Compass size={12} className="text-[#ff641d]" /> Ver no Mapa
                        </span>
                        <ChevronRight size={10} className="text-white/30" />
                      </Link>

                      <Link
                        to="/alert-hub"
                        onClick={() => {
                          setSelectedAlert(null);
                          // Seamless soft reload to clima tab within alert hub if needed, or point directly to /alert-hub/clima
                        }}
                        className="flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/30 text-[10px] font-mono font-bold text-white uppercase tracking-wider rounded-xl transition-all active:scale-95 duration-200"
                      >
                        <span className="flex items-center gap-2">
                          <CloudRain size={12} className="text-blue-400" /> Clima da Região
                        </span>
                        <ChevronRight size={10} className="text-white/30" />
                      </Link>

                      <Link
                        to="/rotas"
                        className="flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/30 text-[10px] font-mono font-bold text-white uppercase tracking-wider rounded-xl transition-all active:scale-95 duration-200"
                      >
                        <span className="flex items-center gap-2">
                          <MapPin size={12} className="text-cyan-400" /> Rotas Próximas
                        </span>
                        <ChevronRight size={10} className="text-white/30" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Footer Area with low visual priority original source */}
                <div className="p-5 border-t border-white/[0.03] bg-black/40 flex items-center justify-between gap-4">
                  <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest max-md:hidden">
                    Radar ID: {selectedAlert.id} | SATELLITE_INDEXED
                  </span>
                  
                  {selectedAlert.link ? (
                    <a
                      href={selectedAlert.link}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors duration-200 uppercase tracking-widest font-mono text-[9px] ml-auto py-1.5 px-3 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-white/5"
                    >
                      Fonte Original
                      <ExternalLink size={10} className="text-white/30" />
                    </a>
                  ) : (
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest ml-auto">
                      FONTE_OFICIAL_ARST_GOV
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
