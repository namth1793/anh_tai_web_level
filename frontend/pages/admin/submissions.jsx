import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { isLoggedIn, isAdmin } from '../../lib/auth';
import api, { getImageUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminSubmissions() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) { router.push('/login'); return; }
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    api.get('/admin/submissions', { params }).then(({ data }) => setSubmissions(data)).finally(() => setLoading(false));
  }, [filter]);

  const approve = async (id) => {
    setProcessing(true);
    try {
      const { data } = await api.put(`/admin/submissions/${id}/approve`);
      toast.success(data.message);
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally { setProcessing(false); }
  };

  const reject = async (id) => {
    setProcessing(true);
    try {
      await api.put(`/admin/submissions/${id}/reject`, { admin_note: rejectNote });
      toast.success('Đã từ chối');
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
      setSelected(null);
      setRejectNote('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally { setProcessing(false); }
  };

  const statusBadge = (status) => {
    if (status === 'approved') return 'bg-green-100 text-green-700 border border-green-200';
    if (status === 'pending') return 'bg-amber-100 text-amber-700 border border-amber-200';
    return 'bg-red-100 text-red-600 border border-red-200';
  };

  const diffBadge = (d) => {
    if (d === 'easy') return 'bg-green-100 text-green-700 border border-green-200';
    if (d === 'medium') return 'bg-amber-100 text-amber-700 border border-amber-200';
    return 'bg-red-100 text-red-600 border border-red-200';
  };

  return (
    <Layout title="Duyệt Bằng Chứng">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin" className="text-gray-400 hover:text-orange-primary"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-800">📸 Duyệt Bằng Chứng</h1>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${filter === f ? 'btn-orange' : 'bg-white text-gray-500 border border-orange-200'}`}>
            {f === 'pending' ? '⏳ Chờ duyệt' : f === 'approved' ? '✅ Đã duyệt' : f === 'rejected' ? '❌ Từ chối' : '🔍 Tất cả'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Đang tải...</div> : (
        <div className="space-y-3">
          {submissions.length === 0 ? (
            <div className="q-card text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-400">Không có bằng chứng nào</p>
            </div>
          ) : submissions.map(s => (
            <div key={s.id} className="q-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 flex-wrap mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(s.status)}`}>
                      {s.status === 'approved' ? '✅' : s.status === 'pending' ? '⏳' : '❌'} {s.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${diffBadge(s.difficulty)}`}>
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-800 font-bold text-sm">{s.mission_title}</p>
                  <p className="text-orange-primary text-xs">{s.user_name} • {s.student_id}</p>
                  {s.note && <p className="text-gray-400 text-xs mt-1">"{s.note}"</p>}
                  <p className="text-gray-400 text-xs">{new Date(s.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <button onClick={() => setSelected(selected?.id === s.id ? null : s)} className="text-orange-primary hover:text-orange-600 p-1">
                  <Eye size={18} />
                </button>
              </div>

              {selected?.id === s.id && (
                <div className="mt-3 pt-3 border-t border-orange-100">
                  {s.proof_image && s.proof_image !== 'sample.jpg' ? (
                    <img src={getImageUrl(s.proof_image)} alt="proof" className="w-full max-h-64 object-cover rounded-2xl mb-3" />
                  ) : (
                    <div className="bg-orange-50 rounded-2xl h-32 flex items-center justify-center text-gray-400 text-sm mb-3">
                      [Ảnh demo - {s.proof_image}]
                    </div>
                  )}

                  {s.status === 'pending' && (
                    <>
                      <input className="q-input text-sm mb-2" placeholder="Ghi chú từ chối (tùy chọn)" value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => approve(s.id)} disabled={processing}
                          className="btn-orange flex-1 flex items-center justify-center gap-1 py-2 text-sm">
                          <CheckCircle size={16} /> Duyệt (+{s.coins_reward}🪙 +{s.xp_reward}XP)
                        </button>
                        <button onClick={() => reject(s.id)} disabled={processing}
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-sm bg-red-500 text-white rounded-full font-bold">
                          <XCircle size={16} /> Từ chối
                        </button>
                      </div>
                    </>
                  )}

                  {s.status === 'rejected' && s.admin_note && (
                    <p className="text-red-500 text-sm">Lý do từ chối: {s.admin_note}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}