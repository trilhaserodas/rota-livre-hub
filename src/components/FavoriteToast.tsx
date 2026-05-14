import { motion, AnimatePresence } from 'motion/react';
import { Heart, Check } from 'lucide-react';

interface FavoriteToastProps {
  isVisible: boolean;
  isFavorite: boolean;
  routeName: string;
}

export default function FavoriteToast({ isVisible, isFavorite, routeName }: FavoriteToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, x: '-50%' }}
          animate={{ opacity: 1, y: -40, x: '-50%' }}
          exit={{ opacity: 0, y: 100, x: '-50%' }}
          className="fixed bottom-0 left-1/2 z-[3000] flex items-center gap-4 px-6 py-4 bg-[#121417] border border-[#ff641d]/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl min-w-[300px]"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFavorite ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/40'}`}>
            {isFavorite ? <Heart size={20} fill="currentColor" /> : <Heart size={20} />}
          </div>
          
          <div className="flex flex-col">
            <div className="text-[10px] font-mono tracking-[0.3em] text-[#ff641d] uppercase font-black mb-1">
              {isFavorite ? 'PROTOCOLO_SALVO' : 'PROTOCOLO_REMOVIDO'}
            </div>
            <div className="text-xs text-white font-bold uppercase tracking-tight">
              {routeName}
            </div>
          </div>

          <div className="ml-auto">
            <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center">
              <Check size={12} className="text-[#ff641d]" />
            </div>
          </div>

          {/* Tactical line */}
          <div className="absolute top-0 left-0 w-1 h-full bg-[#ff641d]"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
