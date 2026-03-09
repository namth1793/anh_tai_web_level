import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle, Clock } from 'lucide-react';

const BRANCH_ICON = { academic: '📚', culture: '🎭', social: '🤝' };
const BRANCH_COLOR = {
  academic: 'bg-blue-50 text-blue-600',
  culture: 'bg-pink-50 text-pink-600',
  social: 'bg-green-50 text-green-600',
};

export default function MissionCard({ mission, index = 0 }) {
  const isCompleted = mission.userStatus === 'approved';
  const isPending = mission.userStatus === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}>
      <Link href={`/missions/${mission.id}`}>
        <div className={`mission-card mb-3 transition-all duration-200 ${isCompleted ? 'opacity-70' : ''}`}>
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${BRANCH_COLOR[mission.branch]}`}>
              {BRANCH_ICON[mission.branch]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-800 text-sm leading-tight">{mission.title}</h3>
                {isCompleted ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" /> :
                 isPending ? <Clock size={18} className="text-amber-500 flex-shrink-0" /> :
                 <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />}
              </div>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{mission.description}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-primary bg-amber-50 px-2 py-0.5 rounded-full">
                    🪙 {mission.coins_reward}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    mission.difficulty === 'easy' ? 'bg-green-50 text-green-600' :
                    mission.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {mission.difficulty === 'easy' ? 'Dễ' : mission.difficulty === 'medium' ? 'Vừa' : 'Khó'}
                  </span>
                </div>
                {!isCompleted && !isPending && (
                  <button className="btn-orange text-xs py-1.5 px-4">Làm Ngay</button>
                )}
                {isPending && <span className="text-xs text-amber-500 font-medium">Chờ duyệt...</span>}
                {isCompleted && <span className="text-xs text-green-500 font-medium">✅ Hoàn thành</span>}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}