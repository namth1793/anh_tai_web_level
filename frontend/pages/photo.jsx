import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import TabSwitcher from '../components/TabSwitcher';
import PhotoGrid from '../components/PhotoGrid';
import CameraCapture from '../components/CameraCapture';
import { isLoggedIn } from '../lib/auth';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';

const TABS = [
  { key:'all', label:'Tất cả' },
  { key:'academic', label:'Công nghệ' },
  { key:'culture', label:'Văn hóa' },
  { key:'social', label:'Xã hội' },
];

export default function PhotoPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { if (!isLoggedIn()) router.push('/login'); }, []);
  useEffect(() => {
    api.get('/submissions/my').then(({ data }) => setSubmissions(data)).finally(() => setLoading(false));
  }, []);

  const filtered = tab==='all' ? submissions : submissions.filter(s => s.branch===tab);

  return (
    <Layout title="Photo">
      <TopBar title="Photo" showCoin/>

      <div className="px-5 pb-4 pt-2">
        <div className="rounded-3xl overflow-hidden relative"
          style={{ background:'linear-gradient(135deg,#FF7A00,#FFA94D)', height:120 }}>
          <div className="absolute inset-0 flex items-center px-5 gap-4">
            <div>
              <h2 className="text-white font-black text-xl">Thư Viện Ảnh</h2>
              <p className="text-white/70 text-sm">{submissions.length} bằng chứng đã nộp</p>
            </div>
            <div className="ml-auto text-6xl opacity-30">🖼️</div>
          </div>
        </div>
      </div>

      <div className="px-5 mb-4">
        <TabSwitcher tabs={TABS} active={tab} onChange={setTab}/>
      </div>

      <div className="px-5 mb-6">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Đang tải ảnh...</div>
        ) : (
          <PhotoGrid submissions={filtered}/>
        )}
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={e => { if (e.target===e.currentTarget) setShowUpload(false); }}>
            <motion.div initial={{ y:300 }} animate={{ y:0 }} exit={{ y:300 }}
              className="bg-white w-full max-w-[420px] rounded-t-4xl p-6">
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
              <h3 className="font-bold text-gray-800 text-lg mb-4">Upload Ảnh</h3>
              <CameraCapture onCapture={() => setShowUpload(false)}/>
              <p className="text-gray-400 text-xs text-center mt-3">Ảnh phải liên quan đến nhiệm vụ để được duyệt</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-20 right-1/2 translate-x-[160px] z-40">
        <motion.button onClick={() => setShowUpload(true)} whileTap={{ scale:0.9 }}
          className="w-14 h-14 rounded-full shadow-btn flex items-center justify-center"
          style={{ background:'linear-gradient(135deg,#FF7A00,#FFA94D)' }}>
          <Upload size={22} color="white"/>
        </motion.button>
      </div>
    </Layout>
  );
}