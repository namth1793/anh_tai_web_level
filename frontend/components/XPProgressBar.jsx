import { getLevelInfo } from '../lib/auth';
import { motion } from 'framer-motion';

export default function XPProgressBar({ xp, className = '' }) {
  const info = getLevelInfo(xp || 0);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #FF7A00, #FFA94D)' }}>
            {info.level}
          </div>
          <span className="text-sm font-bold text-gray-700">Level {info.level} — {info.name}</span>
        </div>
        <span className="text-xs text-gray-500">{xp || 0} / {info.maxXP} XP</span>
      </div>
      <div className="xp-track">
        <motion.div
          className="xp-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(info.progress, 100)}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}