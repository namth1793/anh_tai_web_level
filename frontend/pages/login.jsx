import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
import { setAuth } from '../lib/auth';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.token, data.user);
      toast.success(`Chào mừng, ${data.user.name}! ⚔️`);
      router.push(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Đăng nhập | F-QUEST</title></Head>
      {/* Shared form content — extracted for reuse in both layouts */}
      {(() => {
        const FormContent = () => (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Đăng nhập</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-primary"><Mail size={18} /></div>
                <input type="email" placeholder="Email" className="q-input pl-11"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-primary"><Lock size={18} /></div>
                <input type={showPw ? 'text' : 'password'} placeholder="Mật khẩu" className="q-input pl-11 pr-11"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                className="btn-orange w-full py-4 text-base mt-2">
                {loading ? 'Đang đăng nhập...' : '🎮 Đăng nhập'}
              </motion.button>
            </form>
            <p className="text-center text-orange-primary text-sm mt-4 cursor-pointer hover:underline">Quên mật khẩu?</p>
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-600 mb-1">Demo:</p>
              <p>👑 admin@fquest.edu.vn / admin123</p>
              <p>🎓 an.nv@fquest.edu.vn / student123</p>
            </div>
            <p className="text-center text-gray-400 text-sm mt-6">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-orange-primary font-bold">Đăng ký ngay</Link>
            </p>
          </>
        );

        const HeroPanel = () => (
          <div className="relative flex-shrink-0 overflow-hidden flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #FF7A00 0%, #FFA94D 60%, #FFD4A8 100%)' }}>
            <div className="absolute bottom-0 inset-x-0">
              <svg viewBox="0 0 420 120" className="w-full" fill="white" fillOpacity="0.15">
                <rect x="10" y="40" width="60" height="80" rx="4"/><rect x="20" y="20" width="40" height="20" rx="2"/>
                <rect x="100" y="55" width="80" height="65" rx="4"/><rect x="120" y="30" width="40" height="25" rx="2"/>
                <rect x="210" y="35" width="70" height="85" rx="4"/><rect x="225" y="15" width="40" height="20" rx="2"/>
                <rect x="310" y="50" width="90" height="70" rx="4"/><rect x="330" y="28" width="50" height="22" rx="2"/>
              </svg>
            </div>
            {['10%','30%','60%','80%','90%'].map((left, i) => (
              <motion.div key={i} className="absolute text-white/40 text-xl"
                style={{ left, top: `${15 + i * 10}%` }}
                animate={{ opacity:[0.3,1,0.3], scale:[0.8,1.2,0.8] }}
                transition={{ duration: 2 + i*0.5, repeat: Infinity }}>✦</motion.div>
            ))}
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', delay:0.2 }}
              className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-3 relative z-10">
              <span className="text-4xl">⚔️</span>
            </motion.div>
            <motion.h1 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
              className="text-white text-3xl font-black tracking-wide relative z-10">F-QUEST</motion.h1>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
              className="text-white/80 text-sm font-medium relative z-10">THE FIRST YEAR SURVIVOR</motion.p>
            <p className="text-white/60 text-xs mt-4 px-8 text-center relative z-10 hidden md:block">
              Chinh phục campus qua những nhiệm vụ thực tế.<br/>Kiếm F-Coins, lên level và trở thành huyền thoại!
            </p>
          </div>
        );

        return (
          <>
            {/* ── MOBILE ── */}
            <div className="md:hidden mobile-container min-h-screen flex flex-col overflow-hidden">
              <div className="h-64"><HeroPanel /></div>
              <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }}
                transition={{ delay:0.3, type:'spring', damping:20 }}
                className="flex-1 bg-white rounded-t-4xl -mt-6 px-6 pt-8 pb-6 shadow-2xl">
                <FormContent />
              </motion.div>
            </div>

            {/* ── DESKTOP ── */}
            <div className="hidden md:flex min-h-screen"
              style={{ background:'linear-gradient(160deg,#FFF5EB 0%,#FFE8CC 60%,#FFF0E0 100%)' }}>
              {/* Left hero panel */}
              <div className="w-2/5 min-h-screen"><HeroPanel /></div>
              {/* Right form panel */}
              <div className="flex-1 flex items-center justify-center p-12">
                <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:0.2 }}
                  className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
                  <FormContent />
                </motion.div>
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
}