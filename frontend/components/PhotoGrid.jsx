import { motion } from 'framer-motion';
import { getImageUrl } from '../lib/api';

export default function PhotoGrid({ submissions }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-3">📷</div>
        <p className="text-gray-400 text-sm">Chưa có ảnh nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {submissions.map((s, i) => {
        const imgUrl = getImageUrl(s.proof_image);
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="aspect-square rounded-xl overflow-hidden bg-orange-100 relative">
            {imgUrl ? (
              <img src={imgUrl} alt={s.mission_title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {s.branch === 'academic' ? '📚' : s.branch === 'culture' ? '🎭' : '🤝'}
              </div>
            )}
            {s.status === 'approved' && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}