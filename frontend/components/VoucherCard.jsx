import { motion } from 'framer-motion';

export default function VoucherCard({ voucher, index = 0 }) {
  const colors = [
    { bg: 'from-orange-400 to-amber-500', text: 'text-amber-900' },
    { bg: 'from-rose-400 to-pink-500', text: 'text-pink-900' },
    { bg: 'from-violet-400 to-purple-500', text: 'text-purple-900' },
    { bg: 'from-emerald-400 to-teal-500', text: 'text-teal-900' },
  ];
  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -3 }}
      className="voucher-card flex mb-3 overflow-hidden">
      {/* Left colored section */}
      <div className={`w-28 flex-shrink-0 bg-gradient-to-br ${color.bg} flex flex-col items-center justify-center p-3 relative`}>
        <div className="text-3xl font-black text-white">{voucher.discount}%</div>
        <div className="text-white text-xs font-medium opacity-90">GIẢM GIÁ</div>
        {/* Notch */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-orange-50" />
      </div>

      {/* Dashed separator */}
      <div className="flex flex-col justify-center">
        <div className="h-full border-l-2 border-dashed border-gray-200 mx-0" />
      </div>

      {/* Right content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="font-bold text-gray-800">{voucher.brand}</div>
          <div className="text-gray-400 text-xs mt-1">{voucher.description}</div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-400">HSD: {voucher.expiry}</div>
          <button className="btn-orange text-xs py-1.5 px-4">Dùng ngay</button>
        </div>
      </div>
    </motion.div>
  );
}