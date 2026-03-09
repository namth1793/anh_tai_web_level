import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import TopBar from '../../components/TopBar';
import MissionCard from '../../components/MissionCard';
import TabSwitcher from '../../components/TabSwitcher';
import { isLoggedIn } from '../../lib/auth';
import api from '../../lib/api';
import { motion } from 'framer-motion';

const TABS = [
  { key:'all', label:'Tất cả' },
  { key:'academic', label:'Academic' },
  { key:'culture', label:'Culture' },
  { key:'social', label:'Social' },
];

export default function Missions() {
  const router = useRouter();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => { if (!isLoggedIn()) router.push('/login'); }, []);

  useEffect(() => {
    setLoading(true);
    const params = tab !== 'all' ? { branch:tab } : {};
    api.get('/missions', { params }).then(({ data }) => setMissions(data)).finally(() => setLoading(false));
  }, [tab]);

  const completed = missions.filter(m => m.userStatus==='approved').length;
  const pending = missions.filter(m => m.userStatus==='pending').length;

  return (
    <Layout title="Nhiệm Vụ">
      <TopBar title="Giới thiệu" showCoin/>

      {/* Branch icons */}
      <div className="px-5 mb-4">
        <div className="flex gap-3">
          {[
            { key:'academic', icon:'📚', label:'Academic', bg:'bg-blue-50', border:'border-blue-300' },
            { key:'culture', icon:'🎭', label:'Culture', bg:'bg-pink-50', border:'border-pink-300' },
            { key:'social', icon:'🤝', label:'Social', bg:'bg-green-50', border:'border-green-300' },
          ].map(b => (
            <motion.button key={b.key} onClick={() => setTab(b.key)} whileTap={{ scale:0.95 }}
              className={`flex-1 rounded-2xl p-3 text-center border-2 transition-all ${b.bg} ${
                tab===b.key ? b.border+' shadow-md' : 'border-transparent'
              }`}>
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-xs font-bold text-gray-600">{b.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 mb-4">
        <div className="q-card">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold text-gray-800">Tiến độ</span>
            <span className="text-orange-primary font-bold">{completed}/{missions.length}</span>
          </div>
          <div className="xp-track">
            <motion.div className="xp-fill" initial={{ width:0 }}
              animate={{ width: missions.length>0 ? `${(completed/missions.length)*100}%` : '0%' }}
              transition={{ duration:1 }}/>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span className="text-green-500 font-medium">✅ {completed}</span>
            <span className="text-amber-500 font-medium">⏳ {pending}</span>
            <span>{missions.length-completed-pending} chưa làm</span>
          </div>
        </div>
      </div>

      <div className="px-5 mb-4">
        <TabSwitcher tabs={TABS} active={tab} onChange={setTab}/>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="text-center py-10 text-gray-400">
            <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1 }} className="text-4xl mx-auto mb-2">⚔️</motion.div>
            <p className="text-sm">Đang tải...</p>
          </div>
        ) : missions.length===0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-400 text-sm">Không có nhiệm vụ nào</p>
          </div>
        ) : (
          <div className="md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-3">
            {missions.map((m,i) => <MissionCard key={m.id} mission={m} index={i}/>)}
          </div>
        )}
      </div>
    </Layout>
  );
}