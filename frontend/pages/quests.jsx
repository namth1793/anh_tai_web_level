import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { isLoggedIn, getUser, getLevelInfo } from '../lib/auth';
import api from '../lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';

const ChibiQuestScene = dynamic(() => import('../components/ChibiQuestScene'), { ssr: false });

const BRANCHES = [
  { key:'academic', icon:'📚', label:'Học Thuật', color:'#3B82F6' },
  { key:'culture', icon:'🎭', label:'Văn Hóa', color:'#EC4899' },
  { key:'social', icon:'🤝', label:'Xã Hội', color:'#10B981' },
];

export default function QuestTree() {
  const router = useRouter();
  const [missions, setMissions] = useState([]);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    // Get level from cached user (avoids extra API call)
    const u = getUser();
    if (u) setUserLevel(getLevelInfo(u.xp || 0).level);
    api.get('/missions').then(({ data }) => setMissions(data));
  }, []);

  return (
    <Layout title="Cây Nhiệm Vụ">
      <TopBar title="Cây nhiệm vụ" showCoin/>

      {/* Chibi level path + branch list side by side on desktop */}
      <div className="px-5">

        {/* Chibi hero banner */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          className="q-card flex items-start gap-4 mb-5">
          {/* Scrollable quest path */}
          <div style={{ width:160, height:300, overflowY:'auto' }} className="flex-shrink-0 rounded-xl">
            <ChibiQuestScene level={userLevel} />
          </div>
          <div className="flex-1 min-w-0 pt-2">
            <p className="text-xs text-gray-400 font-medium mb-1">Nhân vật của bạn</p>
            <p className="text-lg font-black text-gray-800">Level {userLevel}</p>
            <p className="text-sm text-orange-primary font-bold">
              {getLevelInfo(getUser()?.xp || 0).name}
            </p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Hoàn thành nhiệm vụ để leo lên cấp cao hơn!
            </p>
            <div className="mt-3 space-y-1">
              {[...Array(10)].map((_,i) => {
                const lv = i+1;
                const names = ['Tân Binh','Thám Hiểm','Chiến Binh','Dũng Sĩ','Anh Hùng','Huyền Thoại','Chiến Thần','Thiên Long','Bất Bại','Bá Vương'];
                return (
                  <div key={lv} className={`flex items-center gap-1.5 text-xs ${lv<=userLevel?'text-orange-primary font-bold':'text-gray-300'}`}>
                    <span>{lv<=userLevel?'🔥':'○'}</span>
                    <span>Lv.{lv} {names[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Mission branches */}
        {BRANCHES.map((branch, bi) => {
          const bm = missions.filter(m => m.branch===branch.key);
          const completed = bm.filter(m => m.userStatus==='approved').length;
          const pct = bm.length>0 ? (completed/bm.length)*100 : 0;

          return (
            <motion.div key={branch.key} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:bi*0.15 }} className="mb-6">
              <div className="flex items-center gap-3 mb-3 p-3 rounded-2xl"
                style={{ background:`${branch.color}15` }}>
                <div className="text-3xl">{branch.icon}</div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-800">{branch.label}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ backgroundColor:branch.color }}
                        initial={{ width:0 }} animate={{ width:`${pct}%` }}
                        transition={{ duration:1, delay:0.5+bi*0.2 }}/>
                    </div>
                    <span className="text-xs font-bold" style={{ color:branch.color }}>{completed}/{bm.length}</span>
                  </div>
                </div>
              </div>

              <div className="relative pl-6">
                {bm.map((m,i) => {
                  const isCompleted = m.userStatus==='approved';
                  const isPending = m.userStatus==='pending';
                  return (
                    <div key={m.id} className="relative">
                      {i<bm.length-1 && (
                        <div className="absolute left-[-16px] top-6 w-0.5 h-full"
                          style={{ backgroundColor:`${branch.color}30` }}/>
                      )}
                      <div className="absolute left-[-22px] top-4 w-3 h-3 rounded-full border-2"
                        style={{ borderColor:branch.color, backgroundColor:isCompleted?branch.color:'white' }}/>
                      <Link href={`/missions/${m.id}`}>
                        <motion.div whileHover={{ x:4 }} whileTap={{ scale:0.98 }}
                          className={`q-card mb-3 border-l-4 ${isCompleted?'opacity-70':''}`}
                          style={{ borderLeftColor:branch.color }}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">{m.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-orange-primary font-bold">🪙 {m.coins_reward}</span>
                                <span className={`text-xs px-1.5 rounded-full ${
                                  m.difficulty==='easy'?'bg-green-100 text-green-600':
                                  m.difficulty==='medium'?'bg-amber-100 text-amber-600':
                                  'bg-red-100 text-red-600'}`}>
                                  {m.difficulty==='easy'?'Dễ':m.difficulty==='medium'?'Vừa':'Khó'}
                                </span>
                              </div>
                            </div>
                            <span className="text-2xl ml-2">
                              {isCompleted?'✅':isPending?'⏳':'🔒'}
                            </span>
                          </div>
                        </motion.div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Layout>
  );
}