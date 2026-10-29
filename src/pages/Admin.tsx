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
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
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

  // 2. Verificação de Acesso:
  // Só mostrar se estiver logado com Google, email_verified === true e e-mail igual a ADMIN_EMAIL.
  // Caso contrário, redirecionar para a home.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isGoogle = user.providerData?.some(p => p.providerId === 'google.com');
        const isVerified = Boolean(user.emailVerified);
        const isAdminEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        if (isGoogle && isVerified && isAdminEmail) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
          navigate('/');
        }
      } else {
        setCurrentUser(null);
        navigate('/');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // 3. Logout automático após 30 minutos sem atividade
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
      <div className="min-h-screen bg-[#0b0c0d] flex items-center justify-center">
        <Loader2 className="text-[#ff641d] animate-spin" size={32} />
      </div>
    );
  }

  if (!currentUser) {
    return null; // O hook já redireciona para '/'
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
