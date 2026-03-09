import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isLoggedIn, isAdmin, clearAuth } from '../../lib/auth';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import { LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()||!isAdmin()) { router.push('/login'); return; }
    api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  const logout = () => { clearAuth(); router.push('/login'); };

  const pages = [
    { href:'/admin/submissions', icon:'📸', label:'Duyệt Bằng Chứng', sub:stats?`${stats.pendingSubmissions} chờ duyệt`:'...', urgent:stats?.pendingSubmissions>0 },
    { href:'/admin/missions', icon:'⚔️', label:'Nhiệm Vụ', sub:`${stats?.totalMissions||'...'} nhiệm vụ` },
    { href:'/admin/rewards', icon:'🎁', label:'Phần Thưởng', sub:`${stats?.totalRedemptions||'...'} lần đổi` },
    { href:'/admin/users', icon:'👥', label:'Người Dùng', sub:`${stats?.totalUsers||'...'} sinh viên` },
  ];

  return (
    <>
      <Head><title>Admin | F-QUEST</title></Head>
      <div className="mobile-container min-h-screen">
        <div className="px-5 pt-10 pb-6" style={{ background:'linear-gradient(135deg,#FF7A00,#FFA94D)' }}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white text-sm font-bold">🛡️</div>
              <span className="text-white font-black text-lg">Admin Panel</span>
            </div>
            <button onClick={logout} className="text-white/70"><LogOut size={20}/></button>
          </div>
          <p className="text-white/70 text-sm">F-QUEST Management Dashboard</p>
        </div>

        <div className="px-5 pt-4">
          {!loading && stats && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label:'Sinh Viên', value:stats.totalUsers, icon:'👥', color:'text-blue-500' },
                { label:'Chờ Duyệt', value:stats.pendingSubmissions, icon:'⏳', color:'text-amber-500' },
                { label:'Coins Phát', value:stats.totalCoinsDistributed, icon:'🪙', color:'text-orange-500' },
                { label:'Đã Duyệt', value:stats.approvedSubmissions, icon:'✅', color:'text-green-500' },
              ].map((s,i) => (
                <motion.div key={s.label} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:i*0.1 }} className="bg-white rounded-2xl p-4 shadow-card text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {pages.map((p,i) => (
              <motion.div key={p.href} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.3+i*0.1 }}>
                <Link href={p.href}>
                  <div className={`bg-white rounded-2xl p-4 shadow-card cursor-pointer relative transition-all hover:shadow-btn ${p.urgent?'border-2 border-orange-400':''}`}>
                    {p.urgent && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"/>}
                    <div className="text-3xl mb-2">{p.icon}</div>
                    <div className="font-bold text-gray-800 text-sm">{p.label}</div>
                    <div className="text-gray-400 text-xs mt-1">{p.sub}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}