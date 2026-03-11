import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, XCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CameraCapture from '../../components/CameraCapture';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { isLoggedIn } from '../../lib/auth';

const BRANCH_CONFIG = {
  academic:{ icon:'📚', label:'Học Thuật', bg:'bg-blue-50' },
  culture:{ icon:'🎭', label:'Văn Hóa', bg:'bg-pink-50' },
  social:{ icon:'🤝', label:'Xã Hội', bg:'bg-green-50' },
};

export default function MissionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => { if (!isLoggedIn()) router.push('/login'); }, []);
  useEffect(() => {
    if (!id) return;
    api.get(`/missions/${id}`).then(({ data }) => setMission(data))
      .catch(() => router.push('/missions')).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!capturedImage) { toast.error('Hãy chụp ảnh bằng chứng!'); return; }
    setSubmitting(true);
    try {
      await api.post('/submissions/base64', { mission_id:id, note, image_data:capturedImage });
      toast.success('Nộp thành công! Chờ admin duyệt 🎉');
      setMission(prev => ({ ...prev, submission:{ status:'pending' } }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi nộp');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="mobile-container flex items-center justify-center min-h-screen">
      <div className="text-4xl animate-bounce-soft">⚔️</div>
    </div>
  );
  if (!mission) return null;

  const branch = BRANCH_CONFIG[mission.branch] || BRANCH_CONFIG.academic;
  const isApproved = mission.submission?.status==='approved';
  const isPending = mission.submission?.status==='pending';
  const isRejected = mission.submission?.status==='rejected';

  return (
    <Layout title={mission.title}>
      <div className="px-5 pt-5 pb-16"
        style={{ background:'linear-gradient(135deg,#FF7A00,#FFA94D)' }}>
        <Link href="/missions" className="flex items-center gap-1 text-white/80 text-sm mb-4">
          <ArrowLeft size={18}/> Quay lại
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${branch.bg}`}>{branch.icon}</div>
          <div>
            <span className="text-white/70 text-xs">{branch.label}</span>
            <h1 className="text-white font-black text-lg leading-tight">{mission.title}</h1>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 pb-24">
        <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }}
          className="q-card mb-4 flex gap-6 justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-orange-primary">🪙 {mission.coins_reward}</div>
            <div className="text-xs text-gray-400">F-Coins</div>
          </div>
          <div className="w-px bg-gray-100"/>
          <div className="text-center">
            <div className="text-2xl font-black text-violet-500 flex items-center gap-1">
              <Zap size={20}/>{mission.xp_reward}
            </div>
            <div className="text-xs text-gray-400">XP</div>
          </div>
          <div className="w-px bg-gray-100"/>
          <div className="text-center">
            <div className="text-2xl">
              {mission.difficulty==='easy'?'🟢':mission.difficulty==='medium'?'🟡':'🔴'}
            </div>
            <div className="text-xs text-gray-400">
              {mission.difficulty==='easy'?'Dễ':mission.difficulty==='medium'?'Vừa':'Khó'}
            </div>
          </div>
        </motion.div>

        <div className="q-card mb-4">
          <h2 className="font-bold text-gray-800 mb-2">📋 Nhiệm vụ</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{mission.description}</p>
          {mission.hint && (
            <div className="mt-3 bg-amber-50 rounded-xl p-3">
              <p className="text-amber-700 text-sm"><span className="font-bold">💡 Gợi ý:</span> {mission.hint}</p>
            </div>
          )}
        </div>

        {isApproved && (
          <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }}
            className="q-card mb-4 border-2 border-green-200 bg-green-50 flex items-center gap-3">
            <CheckCircle size={28} className="text-green-500 flex-shrink-0"/>
            <div>
              <p className="font-bold text-green-700">Hoàn thành xuất sắc!</p>
              <p className="text-green-600 text-sm">+{mission.coins_reward} F-Coins, +{mission.xp_reward} XP đã được cộng.</p>
            </div>
          </motion.div>
        )}
        {isPending && (
          <div className="q-card mb-4 border-2 border-amber-200 bg-amber-50 flex items-center gap-3">
            <Clock size={28} className="text-amber-500 flex-shrink-0"/>
            <div>
              <p className="font-bold text-amber-700">Đang chờ duyệt...</p>
              <p className="text-amber-600 text-sm">Admin sẽ xem xét bằng chứng sớm nhất.</p>
            </div>
          </div>
        )}
        {isRejected && (
          <div className="q-card mb-4 border-2 border-red-200 bg-red-50">
            <div className="flex items-center gap-3 mb-1">
              <XCircle size={24} className="text-red-500"/>
              <p className="font-bold text-red-700">Bị từ chối</p>
            </div>
            {mission.submission?.admin_note && (
              <p className="text-red-600 text-sm pl-9">{mission.submission.admin_note}</p>
            )}
          </div>
        )}

        {!isApproved && !isPending && (
          <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.3 }}
            className="q-card mb-4">
            <h2 className="font-bold text-gray-800 mb-1">{isRejected ? '🔄 Nộp Lại Bằng Chứng' : '📸 Nộp Bằng Chứng'}</h2>
            <p className="text-gray-400 text-xs mb-4">{isRejected ? 'Bạn có thể nộp lại ảnh mới sau khi bị từ chối.' : 'Chụp hoặc tải lên ảnh làm bằng chứng. Admin sẽ duyệt và trao thưởng.'}</p>
            <CameraCapture onCapture={setCapturedImage}/>
            <textarea className="q-input mt-4 resize-none text-sm" rows={3}
              placeholder="Ghi chú thêm... (tùy chọn)"
              value={note} onChange={e => setNote(e.target.value)}/>
            <motion.button onClick={handleSubmit} disabled={submitting||!capturedImage}
              whileTap={{ scale:0.97 }}
              className={`w-full py-4 rounded-full font-bold text-white mt-4 transition-all ${
                capturedImage ? '' : 'opacity-40 cursor-not-allowed'
              }`}
              style={capturedImage
                ? { background:'linear-gradient(135deg,#FF7A00,#FFA94D)', boxShadow:'0 4px 15px rgba(255,122,0,0.4)' }
                : { background:'#D1D5DB' }}>
              {submitting ? 'Đang nộp...' : '⚔️ Nộp Bằng Chứng'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}