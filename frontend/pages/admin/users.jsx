import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { isLoggedIn, isAdmin, getLevelInfo } from '../../lib/auth';
import api from '../../lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) { router.push('/login'); return; }
    api.get('/admin/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.student_id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Quản Lý Người Dùng">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin" className="text-gray-400 hover:text-orange-primary"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-800">👥 Người Dùng</h1>
      </div>

      <input className="q-input mb-4" placeholder="🔍 Tìm kiếm theo tên, email, MSV..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? <div className="text-center py-12 text-gray-400">Đang tải...</div> : (
        <div className="space-y-2">
          {filtered.map(u => {
            const li = getLevelInfo(u.xp || 0);
            return (
              <div key={u.id} className="q-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#FF7A00,#FFA94D)' }}>
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-800 font-bold text-sm truncate">{u.name}</p>
                    {u.role === 'admin' && <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">Admin</span>}
                  </div>
                  <p className="text-gray-400 text-xs">{u.email} • {u.student_id || 'No ID'}</p>
                  <p className="text-gray-400 text-xs">{u.major || 'No major'}</p>
                </div>
                <div className="text-right text-sm flex-shrink-0">
                  <div className="text-orange-primary font-bold">🪙 {u.total_coins}</div>
                  <div className="text-gray-500 text-xs">Lv.{li.level}</div>
                  <div className="text-gray-400 text-xs">✅ {u.completed_missions}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}