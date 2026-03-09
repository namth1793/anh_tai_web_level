import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { isLoggedIn, getLevelInfo } from '../lib/auth';
import api from '../lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';

const ChibiWalker = dynamic(() => import('../components/ChibiWalker'), { ssr: false });

const AVATAR_EMOJIS = ['🧑‍💻','👩‍🎓','🧑‍🎓','👨‍💻','🧑‍🎨','👩‍💼'];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    Promise.all([api.get('/auth/me'), api.get('/missions')])
      .then(([me, ms]) => {
        setUser(me.data);
        localStorage.setItem('fquest_user', JSON.stringify(me.data));
        setMissions(ms.data.filter(m => !m.userStatus).slice(0, 3));
      }).catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) return (
    <div className="mobile-container flex items-center justify-center min-h-screen">
      <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1 }} className="text-4xl">⚔️</motion.div>
    </div>
  );

  const li = getLevelInfo(user.xp || 0);
  const avatarEmoji = AVATAR_EMOJIS[user.id % AVATAR_EMOJIS.length] || '🧑‍🎓';
  const majors = ['Công nghệ','Kinh tế','Mỹ thuật','Logistics','Marketing'];

  return (
    <Layout title="Home">
      <TopBar title="Home" showCoin showLogout/>

      {/* Welcome hero card */}
      <div className="px-5 mb-4">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="relative rounded-3xl overflow-hidden p-5"
          style={{ background:'linear-gradient(135deg,#FF7A00 0%,#FFA94D 100%)' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"/>
          <div className="absolute -bottom-6 -right-4 w-20 h-20 bg-white/10 rounded-full"/>
          <p className="text-white/80 text-sm font-medium">Xin chào, Hero!</p>
          <h2 className="text-white text-xl font-black mb-4">Welcome, {user.name.split(' ').slice(-1)[0]}!</h2>
          <div className="flex items-end gap-4">
            <Link href="/profile">
              <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:3, repeat:Infinity }}
                className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 cursor-pointer active:scale-95 transition-transform">
                {avatarEmoji}
              </motion.div>
            </Link>
            <div className="flex-1">
              <div className="bg-white/20 rounded-2xl p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-white text-sm font-bold">Level {li.level}</span>
                  <span className="text-white/70 text-xs">{user.xp||0} / {li.maxXP} XP</span>
                </div>
                <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-white rounded-full"
                    initial={{ width:0 }} animate={{ width:`${li.progress}%` }}
                    transition={{ duration:1.5, ease:'easeOut' }}/>
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/80">
                  <span>✅ {user.totalCompleted||0} nhiệm vụ</span>
                  <span>🪙 {user.total_coins} coins</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chibi walker */}
      <div className="px-5 mb-2">
        <div className="bg-white/60 rounded-3xl overflow-hidden">
          <ChibiWalker />
        </div>
      </div>

      {/* Active missions + Community — 2 col on desktop */}
      <div className="md:grid md:grid-cols-2 md:gap-5 px-5 mb-4">
      {/* Active missions */}
      <div className="mb-4 md:mb-0">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">🔔 Nhiệm Vụ Nổi Bật</h3>
          <Link href="/missions" className="text-orange-primary text-sm font-medium">Xem tất cả</Link>
        </div>
        <div className="space-y-3">
          {missions.length === 0 ? (
            <div className="q-card text-center py-6">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-gray-500 text-sm">Bạn đã hoàn thành tất cả nhiệm vụ!</p>
            </div>
          ) : missions.map((m, i) => {
            const branchIcon = m.branch==='academic'?'📚':m.branch==='culture'?'🎭':'🤝';
            return (
              <motion.div key={m.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:i*0.1 }} className="q-card flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-amber-50 flex-shrink-0">{branchIcon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{m.title}</p>
                  <p className="text-gray-400 text-xs truncate">{m.description}</p>
                </div>
                <Link href={`/missions/${m.id}`}>
                  <button className="btn-orange text-xs py-2 px-4 flex-shrink-0">Làm Ngay</button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Community section — 2nd column on desktop */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">👥 Cộng Đồng</h3>
          <Link href="/leaderboard" className="text-orange-primary text-sm font-medium">Xem thêm</Link>
        </div>
        <div className="flex md:flex-wrap gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {majors.map((major, i) => (
            <motion.div key={major} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:0.3+i*0.1 }}
              className="flex-shrink-0 md:flex-shrink w-24 md:w-auto md:flex-1 q-card text-center p-3 cursor-pointer">
              <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-2"
                style={{ background:'linear-gradient(135deg,#FFF5EB,#FFD4A8)' }}>
                {['💻','📊','🎨','📦','📣'][i]}
              </div>
              <p className="text-xs font-medium text-gray-600 leading-tight">{major}</p>
            </motion.div>
          ))}
        </div>
      </div>
      </div>{/* end 2-col grid */}

      {/* Stats */}
      <div className="px-5 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Hoàn thành', value:user.totalCompleted||0, icon:'✅', color:'#22C55E' },
            { label:'F-Coins', value:user.total_coins, icon:'🪙', color:'#FF7A00' },
            { label:'Level', value:li.level, icon:'⭐', color:'#8B5CF6' },
          ].map((s,i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.5+i*0.1 }} className="q-card text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black" style={{ color:s.color }}>{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}