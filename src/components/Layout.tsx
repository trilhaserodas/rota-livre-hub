import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Coins, Clock, Map as MapIcon, Calculator, BookOpen, Menu, X, ArrowRight, Bell, LogIn, LogOut, Shield, Wind, Mail, Send, Loader2, CheckCircle, Wifi, WifiOff, RotateCw, UploadCloud, Trash2, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAIL = "trilhaserodas@gmail.com";

const navItems = [
  { name: 'Início', path: '/', icon: Compass },
  { name: 'Hub Alerta', path: '/alert-hub', icon: Bell },
  { name: 'Clima', path: '/alert-hub/clima', icon: Wind },
  { name: 'Rotas', path: '/rotas', icon: Compass },
  { name: 'Mapa', path: '/mapa', icon: MapIcon },
  { name: 'Moedas', path: '/conversor', icon: Coins },
  { name: 'Fusos', path: '/horarios', icon: Clock },
  { name: 'Blog', path: '/blog', icon: BookOpen },
  { name: 'Parceiros', path: '/parceiros', icon: Store },
  { name: 'Sobre', path: '/sobre', icon: Compass },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [partnershipMsg, setPartnershipMsg] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const location = useLocation();

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineReports, setOfflineReports] = useState<any[]>([]);
  const [showSyncBanner, setShowSyncBanner] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  const isSyncingRef = useRef(false);

  const autoSyncReports = async (reportsToSync: any[]) => {
    if (isSyncingRef.current || reportsToSync.length === 0) return;
    
    isSyncingRef.current = true;
    setSyncing(true);
    setShowSyncBanner(true);
    setSyncedCount(reportsToSync.length);
    
    try {
      console.log(`[AutoSync] Iniciando sincronização automática de ${reportsToSync.length} reportes.`);
      
      for (const report of reportsToSync) {
        const payload: any = {
          userName: report.userName || 'Anônimo',
          content: report.content,
          category: report.category,
          location: report.location || '',
          status: 'PENDING',
          createdAt: serverTimestamp(),
        };

        if (report.pointId) payload.pointId = report.pointId;
        if (report.reportType) payload.reportType = report.reportType;
        if (report.operationalStatus) payload.operationalStatus = report.operationalStatus;
        if (report.userId) payload.userId = report.userId;
        if (report.fileName) payload.fileName = report.fileName;
        if (report.userEmail) payload.userEmail = report.userEmail;

        await addDoc(collection(db, 'reports'), payload);
      }
      
      localStorage.removeItem('offline_reports');
      setOfflineReports([]);
      setSyncSuccess(true);
      
      setTimeout(() => {
        setSyncSuccess(false);
        setShowSyncBanner(false);
        isSyncingRef.current = false;
        setSyncedCount(0);
      }, 4000);
    } catch (error) {
      console.error("[AutoSync] Erro na sincronização automática de reportes:", error);
      isSyncingRef.current = false;
      setSyncing(false);
    }
  };

  const checkOfflineReports = () => {
    const reportsStr = localStorage.getItem('offline_reports');
    if (reportsStr) {
      try {
        const parsed = JSON.parse(reportsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOfflineReports(parsed);
          if (typeof navigator !== 'undefined' && navigator.onLine) {
            autoSyncReports(parsed);
          }
          return;
        }
      } catch (e) {
        console.error("Erro ao analisar offline_reports:", e);
      }
    }
    if (!isSyncingRef.current) {
      setOfflineReports([]);
      setShowSyncBanner(false);
    }
  };

  const handleSyncReports = async () => {
    const reportsStr = localStorage.getItem('offline_reports');
    if (reportsStr) {
      try {
        const parsed = JSON.parse(reportsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await autoSyncReports(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDiscardReports = () => {
    const count = offlineReports.length || syncedCount;
    if (window.confirm(`Deseja mesmo descartar os ${count} reportes salvos offline?`)) {
      localStorage.removeItem('offline_reports');
      setOfflineReports([]);
      setShowSyncBanner(false);
      isSyncingRef.current = false;
      setSyncedCount(0);
    }
  };

  const handleSendPartnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnershipMsg.trim()) return;
    
    setSendLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        content: partnershipMsg,
        category: 'CONTACT_PARTNERSHIP',
        userName: user?.displayName || 'Visitante Anonimo',
        userEmail: user?.email || 'N/A',
        status: 'PENDING',
        createdAt: serverTimestamp()
      });
      setSendSuccess(true);
      setPartnershipMsg("");
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      alert("Houve um erro ao enviar sua mensagem. Tente novamente.");
    } finally {
      setSendLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });
    return () => unsubscribe();
  }, []);

  // Close menu on route change
  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkOfflineReports();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkOfflineReports();

    // Regular check to instantly capture newly saved offline reports
    const interval = setInterval(checkOfflineReports, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Erro no login:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Erro no logout:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c0d] font-sans selection:bg-[#ff641d]/30">
      {/* Navigation */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b',
          scrolled 
            ? 'bg-[#0b0c0d]/90 backdrop-blur-xl border-white/5 py-4' 
            : 'bg-transparent border-transparent py-8'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-sm overflow-hidden group-hover:scale-105 transition-transform">
              <img src="https://i.ibb.co/NnNRsj5N/Facion-site-rota-livre-hub.png" alt="Rota Livre Hub" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-display font-black tracking-tighter uppercase text-[#F8FAFC]">Rota Livre</span>
              <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-[#ff641d]">Dashboard</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F8FAFC]/40">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'hover:text-[#ff641d] transition-all duration-300 relative group py-2',
                  location.pathname === item.path && 'text-[#F8FAFC]'
                )}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#ff641d]"
                  />
                )}
              </Link>
            ))}
            
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            
            {isAdmin && (
              <Link to="/admin" className="text-[#ff641d] hover:opacity-80 flex items-center gap-2">
                <Shield size={12} />
                ADMIN
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-white/60 mb-0.5">{user.displayName?.split(' ')[0]}</span>
                  <button onClick={handleLogout} className="text-[8px] text-white/20 hover:text-red-400 transition-colors">SAIR</button>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                  <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#ff641d] text-white transition-all rounded-lg border border-white/10 group"
              >
                <LogIn size={12} className="group-hover:translate-x-0.5 transition-transform" />
                ACESSO
              </button>
            )}
          </div>

          <div className="flex xl:hidden items-center gap-4">
            {user && (
              <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <button
              className="text-[#F8FAFC]/60 hover:text-[#ff641d] p-2 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay & Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm xl:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ left: 0, right: 300 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) setIsMenuOpen(false);
              }}
              className="fixed top-0 right-0 bottom-0 z-[61] w-[85%] max-w-[400px] bg-[#0b0c0d] border-l border-white/5 flex flex-col xl:hidden"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between px-8 py-8 border-b border-white/5">
                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-sm overflow-hidden">
                    <img src="https://i.ibb.co/NnNRsj5N/Facion-site-rota-livre-hub.png" alt="Rota Livre Hub" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-lg font-display font-black tracking-tighter uppercase text-[#F8FAFC]">Rota Livre</span>
                </Link>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white/40 hover:text-[#ff641d] p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto px-8 py-10 space-y-8 no-scrollbar">
                <div className="flex flex-col gap-6">
                  {navItems.map((item, idx) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 transition-all group",
                          location.pathname === item.path ? "text-[#ff641d]" : "text-[#F8FAFC]/90"
                        )}
                      >
                        <item.icon size={20} className={cn(
                          "transition-colors",
                          location.pathname === item.path ? "text-[#ff641d]" : "text-[#F8FAFC]/20 group-hover:text-[#ff641d]"
                        )} />
                        <span className="text-3xl font-display font-black uppercase tracking-tighter">
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link 
                        to="/admin" 
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 text-[#ff641d] group",
                          location.pathname === '/admin' ? "opacity-100" : "opacity-60"
                        )}
                      >
                        <Shield size={20} />
                        <span className="text-3xl font-display font-black uppercase tracking-tighter">
                          ADMIN_MOD
                        </span>
                      </Link>
                    </motion.div>
                  )}
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col gap-8 pb-12">
                  {!user ? (
                    <button 
                      onClick={handleLogin}
                      className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-[#ff641d] text-white font-display font-black uppercase tracking-tighter rounded-xl text-lg shadow-lg shadow-[#ff641d]/20"
                    >
                      <LogIn size={20} />
                      ENTRAR_COM_GOOGLE
                    </button>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden shrink-0">
                          <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold uppercase tracking-tight line-clamp-1">{user.displayName}</span>
                          <span className="text-[10px] text-white/30 font-mono tracking-widest line-clamp-1">{user.email}</span>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-4 px-8 py-4 bg-white/5 text-white/40 hover:text-red-400 font-display font-black uppercase tracking-tighter rounded-xl border border-white/5 transition-colors"
                      >
                        <LogOut size={20} />
                        LOGOUT_USER
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff641d] animate-pulse" />
                      <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#ff641d] font-bold">Protocol_Active</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#F8FAFC]/20 tracking-[0.2em]">LAT: -25.4411 // LON: -49.2766</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Main Content */}
      <main className="flex-grow pt-24 topo-grid">
        {children}
      </main>

      {/* Adsense Placeholder */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex justify-center">
        <div className="w-full h-[120px] bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-center text-white/5 text-[8px] font-mono tracking-[0.4em] uppercase">
          ADS_UNIT_01 // PUBLICIDADE
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-24 bg-black/40 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-sm overflow-hidden">
                <img src="https://i.ibb.co/NnNRsj5N/Facion-site-rota-livre-hub.png" alt="Rota Livre Hub" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-display font-black tracking-tighter uppercase text-[#F8FAFC]">Rota Livre</span>
            </Link>
            <p className="text-[#F8FAFC]/40 max-w-sm mb-10 leading-relaxed text-sm">
              O painel do aventureiro moderno para quem vive a estrada na América Latina. 
              Tecnologia e utilidade pública gratuita para desbravadores.
            </p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/trilhas_erodas/" target="_blank" rel="noopener noreferrer" className="text-[#ff641d] text-[10px] font-mono tracking-widest hover:opacity-80 transition-opacity">INSTAGRAM</a>
              <a href="https://www.youtube.com/@TrilhaserodasOficial" target="_blank" rel="noopener noreferrer" className="text-[#ff641d] text-[10px] font-mono tracking-widest hover:opacity-80 transition-opacity">YOUTUBE</a>
              <span className="text-[#ff641d] text-[10px] font-mono tracking-widest opacity-20">GITHUB</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff641d] mb-8">Sistemas // Legal</h4>
            <div className="flex flex-col gap-4 text-xs font-semibold uppercase tracking-widest text-[#F8FAFC]/30">
              <Link to="/alert-hub" className="hover:text-white transition-colors">Alert_Hub</Link>
              <Link to="/conversor" className="hover:text-white transition-colors">Currency_Hub</Link>
              <Link to="/horarios" className="hover:text-white transition-colors">Time_Zones</Link>
              <Link to="/mapa" className="hover:text-white transition-colors">Live_Maps</Link>
              <Link to="/rotas" className="hover:text-white transition-colors">Global_Routes</Link>
              <Link to="/parceiros" className="hover:text-white hover:text-[#ff641d] transition-colors text-[11px] text-[#ff641d]/80 font-bold">Parceiros_Operacionais</Link>
              <div className="h-[1px] bg-white/5 my-2" />
              <Link to="/privacidade" className="hover:text-white transition-colors text-[10px]">Privacy_Protocol</Link>
              <Link to="/termos" className="hover:text-white transition-colors text-[10px]">Service_Terms</Link>
              <Link to="/sobre" className="hover:text-white transition-colors text-[10px]">Mission_Log</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff641d] mb-8">Conectar</h4>
            <div className="space-y-8">
              <div>
                <h5 className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Mail size={10} /> Fale_Conosco
                </h5>
                <a href="mailto:trilhaserodas@gmail.com" className="text-xs font-semibold text-[#F8FAFC]/50 hover:text-[#ff641d] transition-colors break-all">
                  trilhaserodas@gmail.com
                </a>
              </div>

              <div>
                <h5 className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Send size={10} /> Parcerias
                </h5>
                <form onSubmit={handleSendPartnership} className="space-y-2">
                  <textarea 
                    value={partnershipMsg}
                    onChange={(e) => setPartnershipMsg(e.target.value)}
                    placeholder="DEIXE SUA MENSAGEM..."
                    className="w-full bg-white/[0.03] border border-white/5 rounded-sm p-3 text-[10px] font-mono text-white focus:outline-none focus:border-[#ff641d]/30 h-20 resize-none placeholder:text-white/10"
                  />
                  <button 
                    disabled={sendLoading || !partnershipMsg.trim()}
                    type="submit"
                    className="w-full py-2 bg-[#ff641d]/10 border border-[#ff641d]/20 text-[#ff641d] text-[9px] font-mono font-bold uppercase tracking-[0.2em] hover:bg-[#ff641d] hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    {sendLoading ? <Loader2 size={12} className="animate-spin" /> : 'ENVIAR_ORDEM'}
                  </button>
                  {sendSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[8px] font-mono text-green-500 uppercase tracking-widest flex items-center gap-1 mt-2"
                    >
                      <CheckCircle size={10} /> MENSAGEM_ENVIADA_COM_SUCESSO
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[8px] text-white/10 uppercase font-mono tracking-[0.4em]">
            © {new Date().getFullYear()} RL.HUB // ALL_SYSTEMS_GO
          </p>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff641d] animate-pulse"></span>
            <span className="text-[8px] text-[#ff641d] uppercase font-mono tracking-[0.4em]">Signal: Valid</span>
          </div>
        </div>
      </footer>

      {/* Toast de Sincronização de Reportes Offline */}
      <AnimatePresence>
        {showSyncBanner && (offlineReports.length > 0 || syncedCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[9999] w-[90%] sm:w-full sm:max-w-sm bg-[#0A0A0A]/95 backdrop-blur-md border border-[#ff641d]/30 rounded-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] font-mono text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#ff641d]/10 text-[#ff641d] rounded-lg shrink-0">
                <Wifi size={18} className="animate-pulse" />
              </div>
              <div className="flex-grow space-y-1.5 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-[#ff641d] tracking-widest uppercase">CONEXÃO RECUPERADA</span>
                  <button 
                    onClick={() => setShowSyncBanner(false)} 
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <h5 className="text-xs font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                  {syncing && <Loader2 size={12} className="animate-spin text-[#ff641d]" />}
                  Sincronização Automática Ativa
                </h5>
                <p className="text-[9px] text-white/50 leading-relaxed uppercase">
                  {syncSuccess ? (
                    `Sincronizado ${syncedCount} ${syncedCount === 1 ? 'reporte offline' : 'reportes offline'} com sucesso para o Firestore!`
                  ) : (
                    `Detectamos ${offlineReports.length} ${offlineReports.length === 1 ? 'reporte salvo' : 'reportes salvos'} localmente. Sincronizando com o banco de dados...`
                  )}
                </p>
                
                <div className="pt-2 flex gap-2">
                  {syncSuccess ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 bg-green-500/10 border border-green-500/20 rounded-md text-green-500 text-[9px] font-bold uppercase tracking-widest">
                      <CheckCircle size={12} /> Sincronizado com Sucesso!
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-1.5 py-1.5 px-3 bg-[#ff641d]/10 border border-[#ff641d]/20 rounded-md text-[#ff641d] text-[9px] font-bold uppercase tracking-wider font-mono">
                      <span className="flex items-center gap-1.5 animate-pulse">
                        <RotateCw size={10} className="animate-spin" /> Enviando dados...
                      </span>
                      <button 
                        onClick={handleDiscardReports} 
                        className="p-1 text-white/40 hover:text-red-400 font-mono text-[8px] uppercase font-bold tracking-widest cursor-pointer"
                      >
                        [Descartar]
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
