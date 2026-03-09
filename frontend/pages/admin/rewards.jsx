import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { isLoggedIn, isAdmin } from '../../lib/auth';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import Link from 'next/link';

const EMPTY = { title: '', description: '', coin_cost: 30, category: 'item', stock: -1, is_active: 1 };

export default function AdminRewards() {
  const router = useRouter();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) { router.push('/login'); return; }
    load();
  }, []);

  const load = () => api.get('/admin/rewards').then(({ data }) => setRewards(data)).finally(() => setLoading(false));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/rewards/${editId}`, form);
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/admin/rewards', form);
        toast.success('Thêm phần thưởng thành công');
      }
      setShowForm(false); setForm(EMPTY); setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally { setSaving(false); }
  };

  const handleEdit = (r) => {
    setForm({ ...r });
    setEditId(r.id);
    setShowForm(true);
  };

  return (
    <Layout title="Quản Lý Phần Thưởng">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-orange-primary"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold text-gray-800">🎁 Phần Thưởng</h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }} className="btn-orange flex items-center gap-1 text-sm">
          <Plus size={16} /> Thêm
        </button>
      </div>

      {showForm && (
        <div className="q-card mb-4">
          <h2 className="font-bold text-gray-800 mb-3">{editId ? 'Sửa' : 'Thêm'} Phần Thưởng</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="q-input" placeholder="Tên phần thưởng *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea className="q-input resize-none" rows={2} placeholder="Mô tả *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Loại</label>
                <select className="q-input mt-1" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="food">🍜 Đồ ăn</option>
                  <option value="item">🎁 Vật phẩm</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Giá (F-Coins)</label>
                <input type="number" className="q-input mt-1" value={form.coin_cost} onChange={e => setForm({ ...form, coin_cost: +e.target.value })} min={1} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Tồn kho (-1 = ∞)</label>
                <input type="number" className="q-input mt-1" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} min={-1} />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input type="checkbox" id="is_active" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} className="accent-orange-500 w-4 h-4" />
                <label htmlFor="is_active" className="text-sm text-gray-600">Hiển thị</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-orange flex-1 py-2">{saving ? 'Đang lưu...' : 'Lưu'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="border border-orange-200 text-gray-500 px-4 py-2 rounded-full font-medium">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">Đang tải...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rewards.map(r => (
            <div key={r.id} className={`q-card ${!r.is_active ? 'opacity-40' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-800 font-bold">{r.title}</p>
                  <p className="text-gray-400 text-sm">{r.description}</p>
                  <div className="flex gap-3 mt-2 text-sm">
                    <span className="text-orange-primary font-bold">🪙 {r.coin_cost}</span>
                    <span className="text-gray-400">{r.stock === -1 ? '∞ không giới hạn' : `Còn ${r.stock}`}</span>
                  </div>
                </div>
                <button onClick={() => handleEdit(r)} className="text-orange-primary hover:text-orange-600 p-1"><Edit size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}