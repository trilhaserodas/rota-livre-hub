import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { MessageCircle, Clock, MapPin, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Report {
  id: string;
  userName: string;
  content: string;
  category: string;
  location?: string;
  createdAt: any;
}

export default function CommunityReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'reports'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(docs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao listar reports:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-white/5 rounded-2xl" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 px-2">
        <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">Reportes_Recentes</h4>
        <div className="w-1.5 h-1.5 rounded-full bg-[#ff641d] animate-pulse" />
      </div>

      <AnimatePresence mode="popLayout">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="dashboard-card p-5 border-white/[0.03] hover:border-[#ff641d]/20 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#ff641d]/10 flex items-center justify-center text-[#ff641d]">
                <User size={14} />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{report.userName}</div>
                <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={10} /> 
                  {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed font-sans mb-3 line-clamp-3 group-hover:line-clamp-none transition-all cursor-help">
              "{report.content}"
            </p>

            <div className="flex items-center gap-4 text-[9px] font-mono text-[#ff641d]/60 uppercase tracking-widest">
              <span className="flex items-center gap-1"><MessageCircle size={10} /> {report.category}</span>
              {report.location && (
                <span className="flex items-center gap-1 text-white/30 truncate max-w-[120px]">
                  <MapPin size={10} /> {report.location}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {reports.length === 0 && (
        <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl">
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Aguardando inteligência local...</p>
        </div>
      )}
    </div>
  );
}
