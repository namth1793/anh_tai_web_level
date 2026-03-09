import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { isLoggedIn, isAdmin } from '../../lib/auth';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

const EMPTY = { title: '', description: '', branch: 'academic', difficulty: 'easy', coins_reward: 10, xp_reward: 15, hint: '', is_active: 1 };

export default function AdminMissions() {
  const router = useRouter();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) { router.push('/login'); return; }
    load();
  }, []);

  const load = () => api.get('/admin/missions').then(({ data }) => setMissions(data)).finally(() => setLoading(false));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/missions/${editId}`, form);
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/admin/missions', form);
        toast.success('Thêm nhiệm vụ thành công');
      }
      setShowForm(false); setForm(EMPTY); setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Ẩn nhiệm vụ này?')) return;
    await api.delete(`/admin/missions/${id}`);
    toast.success('Đã ẩn nhiệm vụ');
    load();
  };

  const handleEdit = (m) => {
    setForm({ ...m });
    setEditId(m.id);
    setShowForm(true);
  };

  const branchBadge = (b) => b === 'academic' ? 'bg-blue-100 text-blue-700' : b === 'culture' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700';
  const diffBadge = (d) => d === 'easy' ? 'bg-green-100 text-green-700' : d === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600';

  return (
    <Layout title="Quản Lý Nhiệm Vụ">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-orange-primary"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold text-gray-800">⚔️ Nhiệm Vụ</h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }} className="btn-orange flex items-center gap-1 text-sm">
          <Plus size={16} /> Thêm
        </button>
      </div>

      {showForm && (
        <div className="q-card mb-4">
          <h2 className="font-bold text-gray-800 mb-3">{editId ? 'Sửa' : 'Thêm'} Nhiệm Vụ</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="q-input" placeholder="Tên nhiệm vụ *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea className="q-input resize-none" rows={3} placeholder="Mô tả nhiệm vụ *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Nhánh</label>
                <select className="q-input mt-1" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}>
                  <option value="academic">📚 Học Thuật</option>
                  <option value="culture">🎭 Văn Hóa</option>
                  <option value="social">🤝 Xã Hội</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Độ khó</label>
                <select className="q-input mt-1" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="easy">Dễ</option>
                  <option value="medium">Vừa</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">F-Coins</label>
                <input type="number" className="q-input mt-1" value={form.coins_reward} onChange={e => setForm({ ...form, coins_reward: +e.target.value })} min={1} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">XP</label>
                <input type="number" className="q-input mt-1" value={form.xp_reward} onChange={e => setForm({ ...form, xp_reward: +e.target.value })} min={0} />
              </div>
            </div>
            <input className="q-input" placeholder="Gợi ý (tùy chọn)" value={form.hint} onChange={e => setForm({ ...form, hint: e.target.value })} />
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-orange flex-1 py-2">{saving ? 'Đang lưu...' : 'Lưu'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="border border-orange-200 text-gray-500 px-4 py-2 rounded-full font-medium">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">Đang tải...</div> : (
        <div className="space-y-2">
          {missions.map(m => (
            <div key={m.id} className={`q-card flex items-start gap-3 ${!m.is_active ? 'opacity-40' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${branchBadge(m.branch)}`}>{m.branch === 'academic' ? '📚' : m.branch === 'culture' ? '🎭' : '🤝'} {m.branch}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${diffBadge(m.difficulty)}`}>{m.difficulty}</span>
                </div>
                <p className="text-gray-800 font-bold text-sm">{m.title}</p>
                <p className="text-gray-400 text-xs">🪙{m.coins_reward} • ⚡{m.xp_reward}XP</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(m)} className="text-orange-primary hover:text-orange-600 p-1"><Edit size={16} /></button>
                <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}