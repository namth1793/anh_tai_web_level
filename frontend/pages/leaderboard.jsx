import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import TabSwitcher from '../components/TabSwitcher';
import { isLoggedIn, getUser } from '../lib/auth';
import api from '../lib/api';
import { motion } from 'framer-motion';

const TABS = [
  { key:'coins', label:'🪙 F-Coins' },
  { key:'missions', label:'⚔️ Nhiệm Vụ' },
];

const MAJOR_EMOJI = {
  'Software Engineering':'💻','Business Administration':'📊',
  'Marketing':'📣','Logistics':'📦','Graphic Design':'🎨','Artificial Intelligence':'🤖',
};

export default function Leaderboard() {
  const router = useRouter();
  const [coinsBoard, setCoinsBoard] = useState([]);
  const [missionsBoard, setMissionsBoard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [tab, setTab] = useState('coins');
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(getUser());

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    Promise.all([
      api.get('/leaderboard/coins'),
      api.get('/leaderboard/missions'),
      api.get('/auth/me'),
    ]).then(([c, m, meRes]) => {
      setCoinsBoard(c.data.top);
      setMyRank(c.data.myRank);
      setMissionsBoard(m.data.top);
      // sync fresh user data so name/coins are always up-to-date
      const fresh = meRes.data;
      setMe(fresh);
      localStorage.setItem('fquest_user', JSON.stringify(fresh));
    }).finally(() => setLoading(false));
  }, []);

  const MEDAL = ['🥇','🥈','🥉'];
  const data = tab==='coins' ? coinsBoard : missionsBoard;

  return (
    <Layout title="Bạn bè">
      <TopBar title="Bạn bè" showCoin/>

      {myRank && (
        <div className="px-5 mb-4">
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background:'linear-gradient(135deg,#FF7A00,#FFA94D)' }}>
            <div className="text-3xl">🏆</div>
            <div>
              <p className="text-white/80 text-xs">Hạng của bạn</p>
              <p className="text-white font-black text-2xl">#{myRank}</p>
            </div>
            <div className="ml-auto text-right text-white">
              <p className="text-xs text-white/70">F-Coins</p>
              <p className="font-black text-xl">🪙 {me?.total_coins||0}</p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="px-5 mb-4">
        <TabSwitcher tabs={TABS} active={tab} onChange={setTab}/>
      </div>

      {/* Top 3 podium */}
      {!loading && data.length>=3 && (
        <div className="px-5 mb-4">
          <div className="flex items-end justify-center gap-3">
            {[1,0,2].map((i) => {
              const u = data[i];
              if (!u) return null;
              const heights = [80,112,64];
              const emoji = MAJOR_EMOJI[u.major]||'🎓';
              const colors = ['#FFA94D','#FF7A00','#FFD4A8'];
              return (
                <motion.div key={u.id} initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.1 }} className="flex flex-col items-center flex-1 max-w-[100px]">
                  <div className="text-2xl mb-1">{MEDAL[i]}</div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-1 bg-amber-50">{emoji}</div>
                  <p className="text-xs font-bold text-gray-700 text-center truncate w-full px-1">
                    {u.name.split(' ').slice(-1)[0]}
                  </p>
                  <div className="mt-1 rounded-t-xl w-full flex items-start justify-center pt-2"
                    style={{ height:heights[i], backgroundColor:colors[i] }}>
                    <span className="text-white font-black text-xs">
                      {tab==='coins'?`🪙${u.total_coins}`:`⚔️${u.completed_missions}`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-5">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Đang tải...</div>
        ) : (
          <div className="space-y-2">
            {data.slice(3).map((u,i) => {
              const isMe = u.id===me?.id;
              const emoji = MAJOR_EMOJI[u.major]||'🎓';
              return (
                <motion.div key={u.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:i*0.05 }}
                  className={`q-card flex items-center gap-3 ${isMe?'border-2 border-orange-primary':''}`}>
                  <span className="text-gray-400 font-bold w-6 text-center text-sm">#{i+4}</span>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-amber-50">{emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isMe?'text-orange-primary':'text-gray-800'}`}>
                      {u.name} {isMe&&'👈'}
                    </p>
                    <p className="text-gray-400 text-xs">{u.major||'FPT University'}</p>
                  </div>
                  <div className="font-black text-orange-primary text-sm">
                    {tab==='coins'?`🪙 ${u.total_coins}`:`⚔️ ${u.completed_missions}`}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}