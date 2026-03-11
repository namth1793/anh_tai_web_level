import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import XPProgressBar from '../components/XPProgressBar';
import { isLoggedIn, clearAuth, getLevelInfo } from '../lib/auth';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Edit2, LogOut, CheckCircle, Clock, XCircle, Save, X } from 'lucide-react';

const AVATARS = ['🧑‍💻','👩‍🎓','🧑‍🎓','👨‍💻','🧑‍🎨','👩‍💼','👨‍🔬','👩‍🏫'];

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    Promise.all([api.get('/auth/me'), api.get('/submissions/my')])
      .then(([me, subs]) => {
        setUser(me.data);
        setForm({ name: me.data.name, student_id: me.data.student_id || '' });
        setSubmissions(subs.data);
      }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      setUser(prev => ({ ...prev, ...data }));
      localStorage.setItem('fquest_user', JSON.stringify({ ...user, ...data }));
      setEditing(false);
      toast.success('Hồ sơ đã cập nhật!');
    } catch { toast.error('Lỗi cập nhật'); } finally { setSaving(false); }
  };

  const logout = () => { clearAuth(); router.push('/login'); };

  if (loading || !user) return (
    <div className="mobile-container flex items-center justify-center min-h-screen">
      <div className="text-4xl animate-bounce">⚔️</div>
    </div>
  );

  const li = getLevelInfo(user.xp || 0);
  const avatarEmoji = AVATARS[user.id % AVATARS.length];
  const approved = submissions.filter(s => s.status === 'approved');

  return (
    <Layout title="Hồ Sơ">
      {/* ── Orange header — contains ALL user identity info ── */}
      <div className="px-5 pt-5 pb-6" style={{ background: 'linear-gradient(135deg,#FF7A00 0%,#FFA94D 100%)' }}>
        {/* Top row */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-white font-black text-xl">Hồ Sơ</h1>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="bg-white/20 text-white rounded-full p-1.5 active:scale-95">
                  <Save size={18}/>
                </button>
                <button onClick={() => setEditing(false)}
                  className="bg-white/20 text-white rounded-full p-1.5 active:scale-95">
                  <X size={18}/>
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)}
                className="bg-white/20 text-white rounded-full p-1.5 active:scale-95">
                <Edit2 size={18}/>
              </button>
            )}
            <button onClick={logout} className="bg-white/20 text-white rounded-full p-1.5 active:scale-95">
              <LogOut size={18}/>
            </button>
          </div>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0 bg-white/20">
            {avatarEmoji}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input className="bg-white/20 text-white placeholder-white/60 rounded-xl px-3 py-1.5 text-base font-bold w-full border border-white/30 focus:outline-none mb-1"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
            ) : (
              <h2 className="text-white font-black text-lg leading-tight">{user.name}</h2>
            )}
            <p className="text-white/80 text-sm">{user.email}</p>
            {editing ? (
              <input className="bg-white/20 text-white placeholder-white/60 rounded-xl px-3 py-1 text-xs w-full border border-white/30 focus:outline-none mt-1"
                placeholder="Mã sinh viên" value={form.student_id}
                onChange={e => setForm({ ...form, student_id: e.target.value })}/>
            ) : (
              <p className="text-white/70 text-xs">MSV: {user.student_id || 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>


        {/* Stats row */}
        <div className="flex gap-3">
          {[
            { label: 'Level', value: li.level, color: 'text-white' },
            { label: 'F-Coins', value: `🪙${user.total_coins}`, color: 'text-yellow-200' },
            { label: 'Hoàn thành', value: approved.length, color: 'text-green-200' },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-white/15 rounded-2xl py-2 text-center">
              <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
              <div className="text-white/60 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── XP bar ── */}
      <div className="px-5 py-4 bg-white border-b border-orange-100">
        <XPProgressBar xp={user.xp || 0}/>
      </div>

      {/* ── History ── */}
      <div className="px-5 pt-4 pb-6">
        <h2 className="font-bold text-gray-800 mb-3">📜 Lịch Sử</h2>
        <div className="space-y-2">
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Chưa nộp nhiệm vụ nào</div>
          ) : submissions.slice(0, 10).map((s, i) => (
            <motion.div key={s.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.05 }} className="q-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-amber-50">
                  {s.branch === 'academic' ? '📚' : s.branch === 'culture' ? '🎭' : '🤝'}
                </div>
                <div>
                  <p className="text-gray-800 text-sm font-bold leading-tight">{s.mission_title}</p>
                  <p className="text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              {s.status === 'approved' ? <CheckCircle size={20} className="text-green-500"/> :
               s.status === 'pending'  ? <Clock size={20} className="text-amber-500"/> :
               <XCircle size={20} className="text-red-400"/>}
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}