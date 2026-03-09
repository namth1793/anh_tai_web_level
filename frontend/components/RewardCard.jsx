import { motion } from 'framer-motion';

const CATEGORY_EMOJI = { food: '🍜', item: '🎁' };
const REWARD_EMOJI = {
  'Bình Nước F-Quest': '🍶',
  'Áo Thun F-Quest': '👕',
  'Sổ Tay F-Quest': '📓',
  'Bộ Bút F-Quest': '✏️',
  'Móc Khóa F-Quest': '🔑',
  'Mũ Lưỡi Trai F-Quest': '🧢',
};

export default function RewardCard({ reward, userCoins, onRedeem, loading, index = 0 }) {
  const canAfford = userCoins >= reward.coin_cost;
  const outOfStock = reward.stock === 0;
  const emoji = REWARD_EMOJI[reward.title] || CATEGORY_EMOJI[reward.category] || '🎁';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -3 }}
      className={`bg-white rounded-2xl shadow-card overflow-hidden ${outOfStock ? 'opacity-50' : ''}`}>
      <div className="h-28 flex items-center justify-center text-5xl"
        style={{ background: 'linear-gradient(135deg, #FFF5EB, #FFE0C0)' }}>
        {emoji}
      </div>
      <div className="p-3">
        <p className="font-bold text-gray-800 text-sm leading-tight mb-1">{reward.title}</p>
        <p className="text-gray-400 text-xs line-clamp-2 mb-3">{reward.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 font-bold text-orange-primary text-sm">
            🪙 <span>{reward.coin_cost}</span>
          </div>
          <button
            onClick={() => onRedeem(reward)}
            disabled={!canAfford || outOfStock || loading}
            className={`text-xs font-bold py-1.5 px-3 rounded-full transition-all ${
              canAfford && !outOfStock
                ? 'text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            style={canAfford && !outOfStock ? { background: 'linear-gradient(135deg, #FF7A00, #FFA94D)' } : {}}>
            {outOfStock ? 'Hết' : !canAfford ? 'Thiếu xu' : 'Đổi'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}