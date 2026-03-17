import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
import { setAuth } from '../lib/auth';
import Head from 'next/head';

function HeroPanel() {
  return (
    <div className="relative flex-shrink-0 overflow-hidden flex flex-col items-center justify-center h-full"
      style={{ background: 'linear-gradient(160deg, #FF6B00 0%, #FF8C00 40%, #FFA94D 100%)' }}>
      {/* Decorative circles */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5"/>
      <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-white/5"/>
      <div className="absolute top-1/4 -right-8 w-40 h-40 rounded-full bg-white/5"/>
      {/* Floating stars */}
      {[{left:'8%',top:'12%'},{left:'85%',top:'18%'},{left:'15%',top:'72%'},{left:'78%',top:'65%'},{left:'50%',top:'8%'}].map((pos, i) => (
        <motion.div key={i} className="absolute text-white/30 text-lg"
          style={pos}
          animate={{ opacity:[0.2,0.8,0.2], y:[0,-8,0] }}
          transition={{ duration: 2.5 + i*0.4, repeat: Infinity, delay: i*0.3 }}>✦</motion.div>
      ))}
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-10 text-center">
        <motion.div initial={{ scale:0, rotate:-20 }} animate={{ scale:1, rotate:0 }}
          transition={{ type:'spring', delay:0.1, stiffness:200 }}
          className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-3 md:mb-5">
          <span className="text-3xl md:text-5xl">⚔️</span>
        </motion.div>
        <motion.h1 initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="text-white text-3xl md:text-4xl font-black tracking-widest mb-1">F-QUEST</motion.h1>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
          className="text-white/70 text-xs font-semibold tracking-[0.2em] uppercase">The First Year Survivor</motion.p>
        {/* Feature cards — desktop only */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          className="hidden md:flex flex-col gap-3 w-full mt-8">
          {[
            { icon:'📚', text:'Nhiệm vụ học thuật thực tế' },
            { icon:'🎭', text:'Khám phá văn hóa FPT campus' },
            { icon:'🤝', text:'Kết nối cộng đồng & kiếm F-Coins' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5 text-left">
              <span className="text-xl">{item.icon}</span>
              <span className="text-white/90 text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
        {/* Stats row — desktop only */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
          className="hidden md:flex mt-8 gap-6">
          {[['🏆','Leaderboard'],['🪙','F-Coins'],['⚡','XP & Level']].map(([icon,label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-white/60 text-xs">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function LoginForm({ form, setForm, showPw, setShowPw, loading, handleSubmit }) {
  return (
    <>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Đăng nhập</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-primary"><Mail size={18} /></div>
          <input type="email" placeholder="Email" className="q-input pl-11"
            value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} required />
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-primary"><Lock size={18} /></div>
          <input type={showPw ? 'text' : 'password'} placeholder="Mật khẩu" className="q-input pl-11 pr-11"
            value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} required />
          <button type="button" onClick={() => setShowPw(v => !v)}
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
      <p className="text-center text-gray-400 text-sm mt-6">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-orange-primary font-bold">Đăng ký ngay</Link>
      </p>
    </>
  );
}

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

  const formProps = { form, setForm, showPw, setShowPw, loading, handleSubmit };

  return (
    <>
      <Head><title>Đăng nhập | F-QUEST</title></Head>

      {/* ── MOBILE ── */}
      <div className="md:hidden mobile-container min-h-screen flex flex-col overflow-hidden">
        <div className="h-64"><HeroPanel /></div>
        <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }}
          transition={{ delay:0.3, type:'spring', damping:20 }}
          className="flex-1 bg-white rounded-t-4xl -mt-6 px-6 pt-8 pb-6 shadow-2xl">
          <LoginForm {...formProps} />
        </motion.div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex min-h-screen"
        style={{ background:'linear-gradient(135deg,#FFF3E6 0%,#FFE0B2 100%)' }}>
        {/* Left hero panel */}
        <div className="w-[480px] min-h-screen flex-shrink-0"><HeroPanel /></div>
        {/* Right form area */}
        <div className="flex-1 flex items-center justify-center px-16 py-12">
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.25, type:'spring', damping:22 }}
            className="w-full max-w-lg">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-800 mb-1">Chào mừng trở lại! 👋</h1>
              <p className="text-gray-500">Đăng nhập để tiếp tục hành trình của bạn</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-orange-100">
              <LoginForm {...formProps} />
            </div>
            <p className="text-center text-gray-400 text-xs mt-6">F-QUEST © FPT University Da Nang 2024</p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
