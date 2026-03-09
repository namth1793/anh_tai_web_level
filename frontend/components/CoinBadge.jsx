import { motion } from 'framer-motion';

export default function CoinBadge({ amount, size = 'md', animated = false }) {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-2' };
  return (
    <motion.div
      className={`inline-flex items-center gap-1 bg-amber-100 rounded-full font-bold text-orange-primary ${sizes[size]}`}
      animate={animated ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5 }}>
      🪙 <span>{amount}</span>
    </motion.div>
  );
}