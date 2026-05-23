import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User, MessageSquare, MapPin, Tag, Loader2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'ESTRADA', label: 'Condição de Estrada' },
  { id: 'FRONTEIRA', label: 'Fronteira/Aduana' },
  { id: 'CLIMA', label: 'Clima Infere' },
  { id: 'SEGURANÇA', label: 'Segurança/Alerta' },
  { id: 'OUTRO', label: 'Outro' },
];

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [userName, setUserName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ESTRADA');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isOfflineSubmitted, setIsOfflineSubmitted] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setIsOfflineSubmitted(false);
      setUserName('');
      setContent('');
      setLocation('');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !content) return;

    setLoading(true);
    setIsOfflineSubmitted(false);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Save to offline_reports list
        const savedOfflineStr = localStorage.getItem('offline_reports') || '[]';
        let savedOffline = [];
        try {
          savedOffline = JSON.parse(savedOfflineStr);
        } catch (e) {
          savedOffline = [];
        }

        const newOfflineReport = {
          id: 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          userName,
          content,
          category,
          location,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };

        savedOffline.push(newOfflineReport);
        localStorage.setItem('offline_reports', JSON.stringify(savedOffline));

        setIsOfflineSubmitted(true);
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 6000);
        return;
      }

      await addDoc(collection(db, 'reports'), {
        userName,
        content,
        category,
        location,
        status: 'PENDING',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 6000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#0A0A0A] border border-white/10 w-full max-w-xl rounded-[2rem] overflow-hidden relative z-10"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">ENVIAR REPORTE TÁTICO</h3>
                <p className="text-[10px] font-mono text-[#ff641d] uppercase tracking-[0.2em] mt-1">// Sensor de Comunidade</p>
              </div>
              <button type="button" onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {success ? (
                <div className="py-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-[#ff641d]/10 border border-[#ff641d]/20 rounded-full flex items-center justify-center mx-auto text-[#ff641d]">
                    <CheckCircle2 size={32} className="animate-pulse" />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-display font-black text-lg uppercase tracking-tight">
                      {isOfflineSubmitted ? "SALVO NO DISPOSITIVO / OFFLINE!" : "REPORTE REGISTRADO CONCLUÍDO!"}
                    </h4>

                    {/* Elegant text box for the requested message */}
                    <div className="p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] max-w-sm mx-auto shadow-[0_4px_30px_rgba(16,185,129,0.05)]">
                      <p className="text-xs text-emerald-400 font-mono font-bold leading-relaxed text-center">
                        Obrigado! seu Comentário será avaliado o mais Breve Possível, a Comunidade agradece
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 text-white/80 hover:text-[#ff641d] font-mono text-[9px] uppercase tracking-[0.2em] rounded-lg border border-white/5 transition-all cursor-pointer font-bold"
                    >
                      Ok, Entendido
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} className="text-[#ff641d]" /> Seu Nome / Nick
                      </label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="EX: PEDRO_78"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-[#ff641d]/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Tag size={12} className="text-[#ff641d]" /> Categoria
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-[#ff641d]/50 transition-colors appearance-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-[#0A0A0A]">{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} className="text-[#ff641d]" /> Localização (Opcional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="EX: PASO AGUA NEGRA, KM 45"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-[#ff641d]/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={12} className="text-[#ff641d]" /> Descrição da Situação
                    </label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="DESCREVA O QUE ENCONTROU NA ESTRADA..."
                      rows={4}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-[#ff641d]/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#ff641d] hover:bg-[#ff844d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-black text-xs uppercase tracking-[0.2em] transition-all rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,100,29,0.2)]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    ENVIAR AO HUB
                  </button>
                </>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
