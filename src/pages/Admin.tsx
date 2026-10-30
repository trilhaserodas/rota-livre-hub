import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  QueryDocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { onAuthStateChanged, signOut, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Trash2, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  LogOut,
  LogIn,
  MessageSquare,
  FileText,
  AlertTriangle,
  ExternalLink,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

// Constante única de e-mail do administrador
const ADMIN_EMAIL = "trilhaserodas@gmail.com";

interface Report {
  id: string;
  userName: string;
  content: string;
  category: string;
  location?: string;
  createdAt: any;
  status: 'PENDING' | 'APPROVED';
}

interface ContactMessage {
  id: string;
  type: 'PARTNERSHIP_APPLY' | 'CONTACT_PARTNERSHIP';
  name: string;
  contact: string;
  message: string;
  userId: string;
  createdAt: any;
}

/**
 * Componente para renderizar links vindos de usuários com segurança:
 * Só abre se começar com "https://", sempre com target="_blank" e rel="noopener noreferrer".
 * Caso contrário, renderiza como texto puro sem link.
 */
function SafeUserLink({ value, className }: { value: string; className?: string }) {
  const trimmed = value.trim();
  if (trimmed.startsWith('https://')) {
    return (
      <a 
        href={trimmed} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={cn("text-[#ff641d] hover:underline inline-flex items-center gap-1 break-all", className)}
      >
        <span>{trimmed}</span>
        <ExternalLink size={11} className="inline flex-shrink-0" />
      </a>
    );
  }
  return <span className={className}>{trimmed}</span>;
}

export default function Admin() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'contacts'>('reports');

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsLoadingMore, setReportsLoadingMore] = useState(false);
  const [hasMoreReports, setHasMoreReports] = useState(false);
  const [lastReportDoc, setLastReportDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Contacts state
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsLoadingMore, setContactsLoadingMore] = useState(false);
  const [hasMoreContacts, setHasMoreContacts] = useState(false);
  const [lastContactDoc, setLastContactDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // User feedback notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estados de diagnóstico de autenticação
  const [authError, setAuthError] = useState<{ code: string; message: string } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [unauthorizedUser, setUnauthorizedUser] = useState<string | null>(null);

  const navigate = useNavigate();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Meta tag noindex, nofollow (adicionada na montagem e removida ao sair)
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    const previousContent = meta ? meta.content : null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
      created = true;
    }
    meta.content = 'noindex, nofollow';

    return () => {
      if (created && meta && meta.parentNode) {
        meta.parentNode.removeChild(meta);
      } else if (meta && previousContent !== null) {
        meta.content = previousContent;
      }
    };
  }, []);

  // 2. Tratar retorno de redirecionamento (signInWithRedirect)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setAuthError(null);
        }
      })
      .catch((err: any) => {
        console.error("Erro no retorno de redirecionamento no Admin:", err);
        setAuthError({
          code: err?.code || 'auth/redirect-error',
          message: err?.message || 'Falha ao processar retorno da autenticação por redirecionamento.'
        });
      });
  }, []);

  // 3. Verificação de Acesso:
  // Enquanto o login estiver em andamento: NÃO redirecionar, NÃO recarregar a página e NÃO trocar de rota.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthLoading(false);
      if (user) {
        const isGoogle = user.providerData?.some(p => p.providerId === 'google.com');
        const isVerified = Boolean(user.emailVerified);
        const isAdminEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        if (isGoogle && isVerified && isAdminEmail) {
          setCurrentUser(user);
          setUnauthorizedUser(null);
        } else {
          setCurrentUser(null);
          setUnauthorizedUser(user.email || 'Conta não autorizada');
        }
      } else {
        setCurrentUser(null);
        setUnauthorizedUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 4. Login administrativo direto com Google
  const handleAdminLogin = () => {
    setAuthError(null);
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Chamada direta e síncrona dentro do onClick sem await nem código assíncrono prévio
    signInWithPopup(auth, provider)
      .then(() => {
        setIsLoggingIn(false);
        setAuthError(null);
      })
      .catch((error: any) => {
        setIsLoggingIn(false);
        console.error("Erro no login Google em Admin:", error);

        // Se o popup for bloqueado pelo navegador, usa o fluxo alternativo signInWithRedirect
        if (error?.code === 'auth/popup-blocked') {
          signInWithRedirect(auth, provider).catch((redirectErr: any) => {
            setAuthError({
              code: redirectErr?.code || 'auth/popup-blocked',
              message: redirectErr?.message || 'Popup bloqueado e falha ao iniciar redirecionamento.'
            });
          });
        } else {
          setAuthError({
            code: error?.code || 'auth/unknown',
            message: error?.message || 'Erro desconhecido ao logar com Google.'
          });
        }
      });
  };

  // 5. Logout
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Erro ao sair:", err);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetInactivityTimer);
      });
    };
  }, [currentUser, handleLogout]);

  // Helper de formatação de erros
  const parseFirestoreError = (err: unknown): string => {
    if (err && typeof err === 'object' && 'code' in err) {
      const code = String((err as any).code);
      if (code === 'permission-denied') {
        return 'Sem permissão para realizar esta operação no servidor.';
      }
    }
    if (err instanceof Error) {
      if (err.message.includes('permission-denied') || err.message.includes('insufficient permissions')) {
        return 'Sem permissão para realizar esta operação.';
      }
      return err.message;
    }
    return 'Erro ao processar operação.';
  };

  // 4. Carregamento inicial paginado de Reports (limit 50)
  const fetchReports = useCallback(async () => {
    if (!currentUser) return;
    setReportsLoading(true);
    setErrorMessage(null);
    try {
      const q = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const loaded: Report[] = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          userName: data.userName || 'Anônimo',
          content: data.content || '',
          category: data.category || 'GERAL',
          location: data.location,
          createdAt: data.createdAt,
          status: data.status || 'PENDING'
        };
      });
      setReports(loaded);
      const last = snapshot.docs[snapshot.docs.length - 1] || null;
      setLastReportDoc(last);
      setHasMoreReports(snapshot.docs.length === 50);
    } catch (err) {
      setErrorMessage(parseFirestoreError(err));
    } finally {
      setReportsLoading(false);
    }
  }, [currentUser]);

  const loadMoreReports = async () => {
    if (!lastReportDoc || reportsLoadingMore) return;
    setReportsLoadingMore(true);
    setErrorMessage(null);
    try {
      const q = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        startAfter(lastReportDoc),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const loaded: Report[] = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          userName: data.userName || 'Anônimo',
          content: data.content || '',
          category: data.category || 'GERAL',
          location: data.location,
          createdAt: data.createdAt,
          status: data.status || 'PENDING'
        };
      });
      setReports(prev => [...prev, ...loaded]);
      const last = snapshot.docs[snapshot.docs.length - 1] || null;
      setLastReportDoc(last);
      setHasMoreReports(snapshot.docs.length === 50);
    } catch (err) {
      setErrorMessage(parseFirestoreError(err));
    } finally {
      setReportsLoadingMore(false);
    }
  };

  // 5. Carregamento inicial paginado de Contacts (limit 50)
  const fetchContacts = useCallback(async () => {
    if (!currentUser) return;
    setContactsLoading(true);
    setErrorMessage(null);
    try {
      const q = query(
        collection(db, 'contacts'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const loaded: ContactMessage[] = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          type: data.type,
          name: data.name || '',
          contact: data.contact || '',
          message: data.message || '',
          userId: data.userId || '',
          createdAt: data.createdAt
        };
      });
      setContacts(loaded);
      const last = snapshot.docs[snapshot.docs.length - 1] || null;
      setLastContactDoc(last);
      setHasMoreContacts(snapshot.docs.length === 50);
    } catch (err) {
      setErrorMessage(parseFirestoreError(err));
    } finally {
      setContactsLoading(false);
    }
  }, [currentUser]);

  const loadMoreContacts = async () => {
    if (!lastContactDoc || contactsLoadingMore) return;
    setContactsLoadingMore(true);
    setErrorMessage(null);
    try {
      const q = query(
        collection(db, 'contacts'),
        orderBy('createdAt', 'desc'),
        startAfter(lastContactDoc),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const loaded: ContactMessage[] = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          type: data.type,
          name: data.name || '',
          contact: data.contact || '',
          message: data.message || '',
          userId: data.userId || '',
          createdAt: data.createdAt
        };
      });
      setContacts(prev => [...prev, ...loaded]);
      const last = snapshot.docs[snapshot.docs.length - 1] || null;
      setLastContactDoc(last);
      setHasMoreContacts(snapshot.docs.length === 50);
    } catch (err) {
      setErrorMessage(parseFirestoreError(err));
    } finally {
      setContactsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchReports();
      fetchContacts();
    }
  }, [currentUser, fetchReports, fetchContacts]);

  // 6. Operações de Moderação de Reportes
  const handleApproveReport = async (id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      // Uso estrito de updateDoc com status APPROVED conforme exigido pelas regras
      await updateDoc(doc(db, 'reports', id), {
        status: 'APPROVED'
      });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
      setSuccessMessage('Reporte aprovado com sucesso.');
    } catch (err) {
      setErrorMessage(parseFirestoreError(err));
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja apagar este reporte?")) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await deleteDoc(doc(db, 'reports', id));
      setReports(prev => prev.filter(r => r.id !== id));
      setSuccessMessage('Reporte excluído com sucesso.');
    } catch (err) {
      setErrorMessage(parseFirestoreError(err));
    }
  };

  // 7. Operações de Exclusão de Mensagens de Contato
  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja apagar esta mensagem?")) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await deleteDoc(doc(db, 'contacts', id));
      setContacts(prev => prev.filter(c => c.id !== id));
      setSuccessMessage('Mensagem excluída com sucesso.');
    } catch (err) {
      setErrorMessage(parseFirestoreError(err));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c0d] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-[#ff641d] animate-spin" size={36} />
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
            Verificando credenciais táticas...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b0c0d] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-[#131517] border border-white/10 rounded-2xl p-8 shadow-2xl relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#ff641d]/10 border border-[#ff641d]/20 flex items-center justify-center text-[#ff641d]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-display font-black text-white uppercase tracking-tighter">
                Painel Administrativo
              </h1>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Acesso Restrito ao Administrador
              </p>
            </div>
          </div>

          {unauthorizedUser && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Conta sem permissão:</p>
                  <p className="font-mono break-all text-white/90">{unauthorizedUser}</p>
                  <p className="text-[11px] text-amber-300/80 mt-1">
                    Este painel é exclusivo para o e-mail: <strong className="text-white">{ADMIN_EMAIL}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Diagnóstico de Erro em Vermelho */}
          {authError && (
            <div 
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-950/95 border-2 border-red-500 text-red-200 space-y-2 animate-in fade-in"
            >
              <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase tracking-wider">
                <AlertTriangle size={16} />
                <span>Falha no Login Google (Diagnóstico)</span>
              </div>
              <div className="p-2.5 rounded bg-black/60 border border-red-500/40 font-mono text-xs space-y-1">
                <div>
                  <span className="text-red-400 font-bold">error.code: </span>
                  <span className="text-white font-bold">{authError.code}</span>
                </div>
                <div>
                  <span className="text-red-400 font-bold">error.message: </span>
                  <span className="text-red-200 break-words">{authError.message}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleAdminLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#ff641d] hover:bg-[#e05516] text-white font-display font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#ff641d]/20 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>CONECTANDO...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>ENTRAR COM GOOGLE</span>
                </>
              )}
            </button>

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-mono text-xs uppercase tracking-widest rounded-xl border border-white/5 transition-all text-center"
            >
              <ArrowLeft size={14} /> Voltar para o Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0d] pt-24 pb-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Feedback visual de erros e sucessos na tela */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4 text-red-400 font-mono text-xs"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="text-red-400 hover:text-white transition-colors"
                aria-label="Fechar mensagem de erro"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-between gap-4 text-green-400 font-mono text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button 
                onClick={() => setSuccessMessage(null)} 
                className="text-green-400 hover:text-white transition-colors"
                aria-label="Fechar mensagem de confirmação"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header do Painel */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-[#ff641d]" size={20} />
              <span className="text-[10px] font-mono text-[#ff641d] uppercase tracking-[0.4em] font-bold">Admin_Command_Center</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter">
              PAINEL<span className="text-[#ff641d]">.</span>ADMIN
            </h1>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mt-2">
              Sessão segura // {currentUser.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/alert-hub" 
              className="flex items-center gap-2 text-[10px] font-mono text-white/40 hover:text-white transition-colors uppercase tracking-widest px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5"
            >
              <ArrowLeft size={14} /> Hub Alerta
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
              title="Encerrar sessão de administrador"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </header>

        {/* Navegação entre Abas */}
        <div className="flex gap-3 mb-8 border-b border-white/5 pb-4">
          <button
            onClick={() => setActiveTab('reports')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all",
              activeTab === 'reports'
                ? "bg-[#ff641d] text-white shadow-[0_4px_20px_rgba(255,100,29,0.3)]"
                : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
            )}
          >
            <FileText size={15} />
            Reportes ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all",
              activeTab === 'contacts'
                ? "bg-[#ff641d] text-white shadow-[0_4px_20px_rgba(255,100,29,0.3)]"
                : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
            )}
          >
            <MessageSquare size={15} />
            Mensagens ({contacts.length})
          </button>
        </div>

        {/* Conteúdo da Aba Reportes */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 gap-6">
            {reportsLoading && reports.length === 0 ? (
              <div className="py-24 flex items-center justify-center">
                <Loader2 className="text-[#ff641d] animate-spin" size={28} />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={cn(
                      "dashboard-card p-6 md:p-8 border-white/[0.03] transition-all relative overflow-hidden",
                      report.status === 'PENDING' ? 'border-orange-500/30 bg-orange-500/[0.02]' : 'bg-white/[0.01]'
                    )}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4 flex-wrap">
                          <div className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border",
                            report.status === 'APPROVED' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse'
                          )}>
                            {report.status}
                          </div>
                          <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={10} /> 
                            {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleString('pt-BR') : 'RECÉM_CHEGADO'}
                          </span>
                          <span className="text-[9px] font-mono text-[#ff641d] uppercase tracking-widest font-bold">
                            {report.category}
                          </span>
                        </div>

                        {/* Informações do usuário (SEM userEmail conforme requisito estrito) */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                            <User size={14} />
                          </div>
                          <div className="text-[11px] font-mono font-bold text-white uppercase tracking-widest">
                            {report.userName}
                          </div>
                        </div>

                        {/* Conteúdo em TEXTO PURO (sem dangerouslySetInnerHTML) */}
                        <div className="relative mb-4 rounded-lg p-5 bg-white/[0.02] border border-white/5">
                          <p className="text-sm text-white/80 leading-relaxed font-sans whitespace-pre-wrap break-words">
                            {report.content}
                          </p>
                        </div>

                        {/* Localização com link seguro se aplicável */}
                        {report.location && (
                          <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest bg-white/[0.02] w-fit px-3 py-1.5 rounded-lg border border-white/5">
                            <MapPin size={12} className="text-[#ff641d] flex-shrink-0" />
                            <SafeUserLink value={report.location} />
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col justify-end gap-3 min-w-[160px]">
                        {report.status === 'PENDING' && (
                          <button 
                            onClick={() => handleApproveReport(report.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-xl"
                          >
                            <CheckCircle size={14} /> Aprovar
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteReport(report.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-xl"
                        >
                          <Trash2 size={14} /> Deletar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {reports.length === 0 && !reportsLoading && (
              <div className="py-24 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <AlertCircle size={40} className="mx-auto text-white/10 mb-4" />
                <h3 className="text-lg font-display font-black text-white/30 uppercase tracking-tighter">Nenhum reporte encontrado</h3>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mt-2">Sem pendências registradas</p>
              </div>
            )}

            {/* Botão Carregar Mais para Reportes */}
            {hasMoreReports && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMoreReports}
                  disabled={reportsLoadingMore}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-widest rounded-xl border border-white/10 transition-all disabled:opacity-50"
                >
                  {reportsLoadingMore ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Carregando...
                    </span>
                  ) : (
                    'Carregar mais reportes'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da Aba Mensagens (contacts) */}
        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 gap-6">
            {contactsLoading && contacts.length === 0 ? (
              <div className="py-24 flex items-center justify-center">
                <Loader2 className="text-[#ff641d] animate-spin" size={28} />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {contacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="dashboard-card p-6 md:p-8 bg-white/[0.01] border-white/[0.03] transition-all relative overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4 flex-wrap">
                          <div className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border",
                            contact.type === 'PARTNERSHIP_APPLY'
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-[#ff641d]/10 text-[#ff641d] border-[#ff641d]/20"
                          )}>
                            {contact.type}
                          </div>
                          <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={10} /> 
                            {contact.createdAt?.toDate ? new Date(contact.createdAt.toDate()).toLocaleString('pt-BR') : 'DATA_DESCONHECIDA'}
                          </span>
                        </div>

                        {/* Remetente e Contato */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                          <div>
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block mb-1">Nome</span>
                            <div className="text-xs font-mono font-bold text-white break-words">
                              {contact.name}
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block mb-1">Contato</span>
                            <div className="text-xs font-mono text-[#ff641d] break-words">
                              <SafeUserLink value={contact.contact} />
                            </div>
                          </div>
                        </div>

                        {/* Mensagem em TEXTO PURO (sem dangerouslySetInnerHTML) */}
                        <div className="relative mb-4 rounded-lg p-5 bg-white/[0.02] border border-white/5">
                          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block mb-2">Mensagem</span>
                          <p className="text-sm text-white/80 leading-relaxed font-sans whitespace-pre-wrap break-words">
                            {contact.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex lg:flex-col justify-end gap-3 min-w-[160px]">
                        <button 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-xl"
                        >
                          <Trash2 size={14} /> Deletar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {contacts.length === 0 && !contactsLoading && (
              <div className="py-24 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <MessageSquare size={40} className="mx-auto text-white/10 mb-4" />
                <h3 className="text-lg font-display font-black text-white/30 uppercase tracking-tighter">Nenhuma mensagem recebida</h3>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] mt-2">Caixa de entrada limpa</p>
              </div>
            )}

            {/* Botão Carregar Mais para Contatos */}
            {hasMoreContacts && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMoreContacts}
                  disabled={contactsLoadingMore}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-widest rounded-xl border border-white/10 transition-all disabled:opacity-50"
                >
                  {contactsLoadingMore ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Carregando...
                    </span>
                  ) : (
                    'Carregar mais mensagens'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
