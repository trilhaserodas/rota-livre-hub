import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Trash2, ShieldAlert, Check, Clock, UserCog, Radio } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  date: string;
  isUserAdded?: boolean;
}

const ROLE_OPTIONS = [
  { label: '🚴 CICLOTURISTA', value: '🚴 CICLOTURISTA' },
  { label: '🎒 MOCHILEIRO', value: '🎒 MOCHILEIRO' },
  { label: '🏍️ MOTO VIAJANTE', value: '🏍️ MOTO VIAJANTE' },
  { label: '🚐 OVERLANDER', value: '🚐 OVERLANDER' }
];

// Pre-populated realistic community comments for indexability and authenticity (no socials, pure tactical utility)
const DEFAULT_COMMENTS: Record<number, Comment[]> = {
  8: [
    {
      id: "def-8-1",
      author: "Carlos_Expedicao",
      role: "🚐 OVERLANDER",
      content: "Desenho tático cirúrgico! Centralizar todos os utilitários operacionais em uma única interface poupa bateria nas aduanas e otimiza a sobrevivência. O mapa dinâmico com altimetria em tempo real é simplesmente incrível e funcional para quem vive de rípio.",
      date: "Há 18 minutos"
    },
    {
      id: "def-8-2",
      author: "Cris_Overlander",
      role: "🏍️ MOTO VIAJANTE",
      content: "Fiz o teste prático de autonomia de combustível ontem à noite do meu notebook no quintal e funcionou impecavelmente. Cruzar o Paso de Jama vai ser cem vezes mais tranquilo tendo uma base brasileira cooperativa de relatórios de campo.",
      date: "Há 2 horas"
    },
    {
      id: "def-8-3",
      author: "Guto_Randonneur",
      role: "🚴 CICLOTURISTA",
      content: "Essencial ter as métricas integradas para planejamento hídrico em trechos desérticos. Na Puna Argentina não há rede telefônica e depender de planilhas locais offline cruzadas com esses relatos é ouro.",
      date: "Há 1 dia"
    }
  ],
  7: [
    {
      id: "def-7-1",
      author: "Thiago_Riders",
      role: "🚴 CICLOTURISTA",
      content: "Prevenção impecável sobre o limite de 100Wh! Ano passado quase me apreenderam duas baterias extras na aduana aérea de Santiago porque as marcações de fábrica da carcaça estavam riscadas. Tenham cuidado e comprem power banks com especificações gravadas no relevo do plástico.",
      date: "Ontem"
    },
    {
      id: "def-7-2",
      author: "Leticia_Patagonia",
      role: "🎒 MOCHILEIRO",
      content: "Eu sempre viajo com dois blocos homologados de 10.000 mAh e apresento logo na bandeja de raio-x soltos da mochila. Facilita o desembaraço rápido com a equipe de terra e evita atritos demorados no check-in.",
      date: "Há 3 dias"
    }
  ],
  6: [
    {
      id: "def-6-1",
      author: "Bruno_MountainBike",
      role: "🚴 CICLOTURISTA",
      content: "Dica clássica sobre o Wind Chill! O pessoal foca na temperatura do termômetro estático de rua e esquece que pedalar a 30 km/h na descida da Serra de São Joaquim com vento contra transforma 5°C em sensação térmica negativa imediata. Corta-vento de qualidade é obrigatório no alforge.",
      date: "Há 4 dias"
    }
  ],
  5: [
    {
      id: "def-5-1",
      author: "Mch_Survivalist",
      role: "🚐 OVERLANDER",
      content: "Trocar o lubrificante de corrente comum de cera para o óleo sintético úmido no inverno da Patagônia mudou tudo para mim. A cera congela e vira uma pasta cinza abrasiva que estraga a transmissão em poucos quilômetros de neve acumulada.",
      date: "Há 1 semana"
    }
  ]
};

const GENERIC_FALLBACK_COMMENTS: Comment[] = [
  {
    id: "fallback-c1",
    author: "Ronaldo_Aventureiro",
    role: "🎒 MOCHILEIRO",
    content: "Artigo extremamente curado e direto ao assunto. Na estrada a gente não precisa de floreios linguísticos, precisa de parâmetros objetivos de planejamento e segurança operativa.",
    date: "Há 5 dias"
  }
];

interface BlogCommentsProps {
  postId: number;
}

export default function BlogComments({ postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [selectedRole, setSelectedRole] = useState('🚴 CICLOTURISTA');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Anti-spam constraint tracking
  const lastSubmissionTime = useRef<number>(0);

  // Load comments from localStorage combined with default mock comments on change of postId
  useEffect(() => {
    const customKey = `blog_comments_post_${postId}`;
    const localSaved = localStorage.getItem(customKey);
    const defaults = DEFAULT_COMMENTS[postId] || GENERIC_FALLBACK_COMMENTS;
    
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved) as Comment[];
        setComments([...defaults, ...parsed]);
      } catch (e) {
        setComments(defaults);
      }
    } else {
      setComments(defaults);
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [postId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    // Strictly block typing past 600 characters
    if (val.length <= 600) {
      setContent(val);
    }
  };

  // Handle comment submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedAuthor = author.trim().replace(/\s+/g, '_'); // Replace spaces with underscore for high tactical vibe
    const trimmedContent = content.trim();

    // Verification check for empty data
    if (!trimmedAuthor) {
      setErrorMsg("O identificador / codename é obrigatório.");
      return;
    }

    if (!trimmedContent) {
      setErrorMsg("A observação de relato está vazia.");
      return;
    }

    // Strict 600 char check
    if (trimmedContent.length > 600) {
      setErrorMsg("O relato excede o limite máximo de segurança de 600 caracteres.");
      return;
    }

    // Anti-spam check: prevent fast multiple submissions within 15 seconds
    const nowMs = Date.now();
    if (nowMs - lastSubmissionTime.current < 15000) {
      setErrorMsg("PROTEÇÃO ANTI-SPAM ATIVA: Aguarde 15 segundos antes de enviar um novo relatório.");
      return;
    }

    // Safety checks: look for suspicious links or typical spam markers
    const linkRegex = /https?:\/\/[^\s]+|www\.[^\s]+|\.com\b|\.org\b|\.net\b|\.gov\b|\.vercel\.app/i;
    if (linkRegex.test(trimmedContent) || linkRegex.test(trimmedAuthor)) {
      setErrorMsg("SEGURANÇA BLOQUEADA: Não é permitido incluir links ou endereços externos nos relatos.");
      return;
    }

    // Prepare new comment block
    const newComment: Comment = {
      id: `user-${Date.now()}`,
      author: trimmedAuthor,
      role: selectedRole,
      content: trimmedContent,
      date: "Agora mesmo",
      isUserAdded: true
    };

    // Save added comment to localStorage
    const customKey = `blog_comments_post_${postId}`;
    const localSaved = localStorage.getItem(customKey);
    let userCommentsList: Comment[] = [];
    if (localSaved) {
      try {
        userCommentsList = JSON.parse(localSaved);
      } catch (e) {
        userCommentsList = [];
      }
    }
    userCommentsList.push(newComment);
    localStorage.setItem(customKey, JSON.stringify(userCommentsList));

    // Update state lists
    setComments(prev => [...prev, newComment]);
    
    // Track submissions timestamps
    lastSubmissionTime.current = nowMs;

    // Reset fields & success signal
    setAuthor('');
    setContent('');
    setSuccessMsg("Relato de campo registrado com sucesso! Indexado ao sistema operacional.");
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 5000);
  };

  // Delete comment action
  const handleDelete = (commentId: string) => {
    const customKey = `blog_comments_post_${postId}`;
    const localSaved = localStorage.getItem(customKey);
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved) as Comment[];
        const filtered = parsed.filter(c => c.id !== commentId);
        localStorage.setItem(customKey, JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
    }
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const charCount = content.length;

  return (
    <div className="mt-16 pt-12 border-t border-white/5 font-sans" id="relatos-da-estrada-container">
      
      {/* Tactical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#ff7828]/15">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-[#ff641d] uppercase mb-1.5">
            <Radio size={12} className="animate-pulse text-[#ff641d]" /> INTELIGÊNCIA_COLETIVA
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-tight">
            RELATOS DA ESTRADA
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            “Compartilhe experiência, alerta ou dica útil para outros aventureiros.”
          </p>
        </div>
        <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest bg-zinc-950/60 border border-[#ff7828]/18 px-3.5 py-1.5 rounded-sm flex items-center gap-2">
          Logs ativos: <span className="text-[#ff641d] font-bold">{comments.length.toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Comment rendering feed with tactical design */}
      <div className="space-y-4 mb-10">
        <AnimatePresence initial={false}>
          {comments.map((comment, index) => {
            const commentRole = comment.role || '🚴 CICLOTURISTA';
            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0a0a0a]/45 hover:bg-[#0c0c0c]/70 p-5 rounded-md border border-[#ff7828]/18 hover:border-[#ff641d]/50 hover:shadow-[0_0_15px_rgba(255,100,29,0.06)] transition-all flex flex-col gap-3 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-zinc-900 border border-[#ff7828]/18 flex items-center justify-center">
                      <span className="text-xs">{commentRole.split(' ')[0]}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-zinc-200 tracking-wide uppercase">
                          {comment.author}
                        </span>
                        <span className="text-[8px] font-mono bg-zinc-900/90 text-[#ff641d] border border-[#ff641d]/20 px-2 py-0.5 rounded-full select-none font-semibold tracking-wider">
                          {commentRole.split(' ').slice(1).join(' ')}
                        </span>
                      </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 mt-0.5 uppercase">
                      <Clock size={10} className="text-zinc-500" />
                      {comment.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-mono text-zinc-600 uppercase select-none tracking-tight">
                    LOG_#{ (index + 1).toString().padStart(2, '0') }
                  </span>
                  {comment.isUserAdded && (
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-zinc-600 hover:text-red-500 p-1 rounded transition-colors"
                      title="Excluir este relato de campo"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* The content itself - beautifully renderable */}
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap select-text selection:bg-[#ff641d]/30 font-sans">
                {comment.content}
              </p>
            </motion.div>
          );})}
        </AnimatePresence>
      </div>

      {/* FORM FOR ADDING FIELD REPORTS / LOGS */}
      <div className="bg-[#0a0a0a]/45 border border-[#ff7828]/18 p-6 sm:p-7 rounded-md relative overflow-hidden backdrop-blur-sm shadow-[inset_0_1px_3px_rgba(255,100,29,0.02)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff641d]/5 rounded-full blur-3xl pointer-events-none" />
        
        <h4 className="text-xs font-mono font-bold text-[#ff641d] uppercase tracking-[0.2em] flex items-center gap-2 mb-1.5">
          <UserCog size={14} className="text-[#ff641d]" /> REGISTRAR NOVA OBSERVAÇÃO OPERACIONAL
        </h4>
        <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mb-6">
          Seu relato ajudará a construir inteligência coletiva nas estradas latinas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name/Identifier field */}
            <div>
              <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                Nome / Codename (Sem espaços)
              </label>
              <input 
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Pedro_Bikepacker"
                maxLength={30}
                className="w-full bg-zinc-950/80 border border-[#ff7828]/18 focus:border-[#ff641d] focus:shadow-[0_0_8px_rgba(255,100,29,0.1)] text-zinc-200 p-3 rounded-sm text-xs font-mono outline-none transition-all placeholder:text-zinc-650"
                required
              />
            </div>

            {/* Operational Category Selection */}
            <div>
              <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                Perfil de Aventureiro
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedRole(opt.value)}
                    className={`p-2 rounded-sm text-[10px] font-mono uppercase tracking-tighter text-left border transition-all ${
                      selectedRole === opt.value
                        ? 'bg-[#ff641d]/15 border-[#ff641d] text-white font-bold'
                        : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:bg-[#ff7828]/5 hover:text-zinc-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment description field */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-1.5">
              <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                Mensagem do Relato (Máx 600 Caracteres)
              </label>
              <div className={`text-[9px] font-mono uppercase tracking-widest ${charCount >= 600 ? 'text-[#ff641d] font-bold' : 'text-zinc-500'}`}>
                {charCount} / 600
              </div>
            </div>
            
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Descreva condições de rípio, locais seguros de abrigo, interdições geográficas ou alertas de segurança..."
              maxLength={600}
              rows={4}
              className="w-full bg-zinc-950/80 border border-[#ff7828]/18 focus:border-[#ff641d] focus:shadow-[0_0_8px_rgba(255,100,29,0.1)] text-zinc-200 p-3 rounded-sm text-sm outline-none transition-all resize-none leading-relaxed placeholder:text-zinc-650 font-sans"
              required
            />
          </div>

          {/* Operational logs warnings/success messages */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-red-400 text-xs font-mono uppercase"
              >
                <ShieldAlert size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-sm text-green-400 text-xs font-mono uppercase"
              >
                <Check size={14} className="flex-shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submission row */}
          <div className="flex justify-between items-center pt-2 gap-4 border-t border-white/5">
            <span className="text-[8px] font-mono text-zinc-600 uppercase select-none tracking-widest hidden sm:inline">
              Filtro ativo: Anti-spam / links bloqueados de segurança
            </span>
            <button
              type="submit"
              disabled={charCount > 600 || !author || !content}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-md bg-[#ff641d] hover:bg-[#ff8548] disabled:bg-zinc-900 disabled:border-white/5 disabled:text-zinc-600 text-white font-mono text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_2px_12px_rgba(255,100,29,0.15)] disabled:shadow-none hover:shadow-[0_2px_20px_rgba(255,100,29,0.35)] hover:scale-[1.01] active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send size={11} /> PUBLICAR RELATO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
