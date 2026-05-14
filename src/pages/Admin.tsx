import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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
  Lock,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const ADMIN_EMAIL = "trilhaserodas@gmail.com";

interface Report {
  id: string;
  userName: string;
  userEmail?: string;
  content: string;
  category: string;
  location?: string;
  createdAt: any;
  status: 'PENDING' | 'APPROVED';
}

export default function Admin() {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setCurrentUser(user);
      } else {
        // Redireciona se não for admin
        if (!authLoading) navigate('/');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, authLoading]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'reports'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reports', id), {
        status: 'APPROVED'
      });
    } catch (err) {
      console.error("Erro ao aprovar:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este reporte?")) return;
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (err) {
      console.error("Erro ao deletar:", err);
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
    return (
      <div className="min-h-screen bg-[#0b0c0d] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
          <Lock size={32} />
        </div>
        <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-4">ACESO NEGADO</h1>
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest max-w-xs mb-8">
          Você não possui credenciais táticas para acessar o centro de moderação.
        </p>
        <Link to="/" className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-widest border border-white/10 rounded-xl transition-all">
          Voltar à Base
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0d] pt-24 pb-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-[#ff641d]" size={20} />
              <span className="text-[10px] font-mono text-[#ff641d] uppercase tracking-[0.4em] font-bold">Admin_Command_Center</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter">
              MODERAÇÃO<span className="text-[#ff641d]">.</span>HUB
            </h1>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mt-2">
              Controle de inteligência da comunidade // {reports.length} reportes detectados
            </p>
          </div>
          <Link to="/alert-hub" className="flex items-center gap-2 text-[10px] font-mono text-white/40 hover:text-white transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} /> Voltar para Hub Alerta
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`dashboard-card p-8 border-white/[0.03] transition-all relative overflow-hidden ${
                  report.status === 'PENDING' ? 'border-orange-500/30 bg-orange-500/[0.02]' : 'bg-white/[0.01]'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border ${
                        report.status === 'APPROVED' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse'
                      }`}>
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

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[11px] font-mono font-bold text-white uppercase tracking-widest">{report.userName}</div>
                        {report.userEmail && <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{report.userEmail}</div>}
                      </div>
                    </div>

                    <div className={cn(
                      "relative mb-6 rounded-lg p-6",
                      report.category === 'CONTACT_PARTNERSHIP' ? "bg-[#ff641d]/5 border border-[#ff641d]/20" : "bg-white/[0.02]"
                    )}>
                      {report.category === 'CONTACT_PARTNERSHIP' && (
                        <div className="text-[8px] font-mono text-[#ff641d] uppercase tracking-[0.3em] font-black mb-2 flex items-center gap-2">
                           <ShieldCheck size={10} /> MENSAGEM_DE_CONTATO
                        </div>
                      )}
                      <p className="text-sm text-white/70 leading-relaxed italic">
                        "{report.content}"
                      </p>
                    </div>

                    {report.location && (
                      <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/[0.02] w-fit px-3 py-1.5 rounded-lg border border-white/5">
                        <MapPin size={12} className="text-[#ff641d]" /> {report.location}
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col justify-end gap-3 min-w-[160px]">
                    {report.status === 'PENDING' && (
                      <button 
                        onClick={() => handleApprove(report.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-xl"
                      >
                        <CheckCircle size={14} /> Aprovar
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(report.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-xl"
                    >
                      <Trash2 size={14} /> Deletar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {reports.length === 0 && !loading && (
            <div className="py-32 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <AlertCircle size={48} className="mx-auto text-white/5 mb-6" />
              <h3 className="text-xl font-display font-black text-white/20 uppercase tracking-tighter">Nenhum reporte pendente</h3>
              <p className="text-[10px] font-mono text-white/10 uppercase tracking-[0.4em] mt-2">Sistema em estado estável</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
