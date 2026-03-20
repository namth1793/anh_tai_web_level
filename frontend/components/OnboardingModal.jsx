import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const SLIDES = [
  {
    badge: 'Trang 1 / 2',
    title: 'Chào mừng đến F-QUEST! ⚔️',
    subtitle: 'Hướng dẫn sử dụng',
    content: [
      {
        icon: '⚔️',
        label: 'Nhiệm Vụ',
        desc: 'Vào trang Giới thiệu để xem danh sách nhiệm vụ. Chọn nhiệm vụ, chụp ảnh bằng chứng và nộp để nhận thưởng.',
      },
      {
        icon: '🌳',
        label: 'Cây Nhiệm Vụ',
        desc: 'Trang Cây NV hiển thị toàn bộ nhiệm vụ theo 3 nhánh: Học Thuật, Văn Hóa, Xã Hội — theo dõi tiến độ của bạn.',
      },
      {
        icon: '🏆',
        label: 'Bảng Xếp Hạng',
        desc: 'Trang Bạn bè xếp hạng sinh viên theo F-Coins và số nhiệm vụ hoàn thành. Cạnh tranh lành mạnh cùng bạn bè!',
      },
      {
        icon: '🎫',
        label: 'Khu Voucher',
        desc: 'Trang Voucher tổng hợp các ưu đãi từ đối tác trên campus. Xem và dùng ngay khi mua sắm, ăn uống.',
      },
    ],
  },
  {
    badge: 'Trang 2 / 2',
    title: 'Hệ thống F-Coins 🪙',
    subtitle: 'Cách sử dụng điểm thưởng',
    content: [
      {
        icon: '✅',
        label: 'Kiếm F-Coins',
        desc: 'Hoàn thành nhiệm vụ và được admin duyệt → nhận F-Coins. Nhiệm vụ dễ: 10 coins, vừa: 20 coins, khó: 50 coins.',
      },
      {
        icon: '⭐',
        label: 'Tích XP & Lên Cấp',
        desc: 'Mỗi nhiệm vụ cũng cho XP. Khi đủ XP, bạn lên cấp — từ Tân Binh → Bá Vương (10 cấp).',
      },
      {
        icon: '🎁',
        label: 'Đổi Phần Thưởng',
        desc: 'Vào trang Đổi F-Coin (biểu tượng Gift). Chọn phần thưởng mong muốn và nhấn Đổi ngay khi có đủ coins.',
      },
      {
        icon: '🛒',
        label: 'Phần thưởng có gì?',
        desc: 'Voucher canteen, cà phê, áo thun, bình nước, sổ tay, bút F-Quest... Hơn 10 loại phần thưởng đang chờ bạn!',
      },
    ],
  },
];

export default function OnboardingModal({ onClose }) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (page < SLIDES.length - 1) {
      setDirection(1);
      setPage(p => p + 1);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (page > 0) {
      setDirection(-1);
      setPage(p => p - 1);
    }
  };

  const slide = SLIDES[page];
  const isLast = page === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center px-0 md:px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        className="relative w-full max-w-[420px] md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header gradient */}
        <div className="px-6 pt-6 pb-5 relative"
          style={{ background: 'linear-gradient(135deg, #FF7A00 0%, #FFA94D 100%)' }}>
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform">
            <X size={16} />
          </button>

          {/* Badge */}
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            {slide.badge}
          </span>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.div key={page}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 30 }}
              transition={{ duration: 0.25 }}>
              <h2 className="text-white font-black text-xl leading-tight">{slide.title}</h2>
              <p className="text-white/70 text-sm mt-0.5">{slide.subtitle}</p>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="flex gap-2 mt-4">
            {SLIDES.map((_, i) => (
              <div key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === page ? 'bg-white w-6' : 'bg-white/40 w-3'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div key={page}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 40 }}
              transition={{ duration: 0.25 }}
              className="space-y-3">
              {slide.content.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 bg-orange-50 rounded-2xl p-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{item.label}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer buttons */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {page > 0 ? (
            <button onClick={goPrev}
              className="w-11 h-11 rounded-full border-2 border-orange-200 flex items-center justify-center text-orange-primary active:scale-90 transition-transform flex-shrink-0">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <button onClick={onClose}
              className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors flex-shrink-0">
              Bỏ qua
            </button>
          )}

          <motion.button
            onClick={goNext}
            whileTap={{ scale: 0.96 }}
            className="flex-1 btn-orange py-3 flex items-center justify-center gap-2 text-sm">
            {isLast ? (
              <>Bắt đầu thôi! 🚀</>
            ) : (
              <>Tiếp theo <ChevronRight size={16} /></>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
