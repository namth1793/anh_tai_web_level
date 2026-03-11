import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Hash, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { setAuth } from '../lib/auth';
import Head from 'next/head';


function RegisterForm({ fields, form, setForm, loading, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(f => (
        <div key={f.key} className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-primary">{f.icon}</div>
          <input type={f.type} placeholder={f.placeholder} className="q-input pl-11"
            value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})} required={f.required}/>
        </div>
      ))}
      <motion.button type="submit" disabled={loading} whileTap={{ scale:0.97 }}
        className="btn-orange w-full py-4 text-base mt-2">
        {loading ? 'Đang tạo tài khoản...' : '⚔️ Bắt đầu hành trình!'}
      </motion.button>
      <p className="text-center text-gray-400 text-sm mt-2">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-orange-primary font-bold">Đăng nhập</Link>
      </p>
    </form>
  );
}

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name:'', email:'', password:'', student_id:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.token, data.user);
      toast.success('Chào mừng đến F-QUEST! ⚔️');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  const fields = [
    { key:'name', icon:<User size={18}/>, placeholder:'Họ và tên', type:'text', required:true },
    { key:'email', icon:<Mail size={18}/>, placeholder:'Email', type:'email', required:true },
    { key:'password', icon:<Lock size={18}/>, placeholder:'Mật khẩu (ít nhất 6 ký tự)', type:'password', required:true },
    { key:'student_id', icon:<Hash size={18}/>, placeholder:'Mã sinh viên (VD: SE180001)', type:'text' },
  ];

  return (
    <>
      <Head><title>Đăng ký | F-QUEST</title></Head>
      {/* MOBILE */}
      <div className="md:hidden mobile-container min-h-screen">
        <div className="px-5 pt-10 pb-6" style={{ background:'linear-gradient(135deg,#FF7A00,#FFA94D)' }}>
          <Link href="/login" className="text-white/80 flex items-center gap-1 text-sm mb-4">
            <ArrowLeft size={18}/> Quay lại
          </Link>
          <h1 className="text-white text-2xl font-black">Tạo tài khoản</h1>
          <p className="text-white/70 text-sm">Bắt đầu hành trình F-QUEST của bạn!</p>
        </div>
        <motion.div initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}
          className="bg-white rounded-t-4xl -mt-4 px-6 pt-8 pb-10 min-h-[70vh]">
          <RegisterForm fields={fields} form={form} setForm={setForm} loading={loading} handleSubmit={handleSubmit} />
        </motion.div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen"
        style={{ background:'linear-gradient(160deg,#FFF5EB 0%,#FFE8CC 60%,#FFF0E0 100%)' }}>
        {/* Left banner */}
        <div className="w-2/5 flex flex-col items-center justify-center"
          style={{ background:'linear-gradient(160deg,#FF7A00,#FFA94D)' }}>
          <div className="text-7xl mb-4">⚔️</div>
          <h1 className="text-white text-4xl font-black mb-2">F-QUEST</h1>
          <p className="text-white/80 font-medium mb-6">THE FIRST YEAR SURVIVOR</p>
          <div className="flex flex-col gap-3 text-white/70 text-sm text-center px-10">
            <div className="bg-white/20 rounded-2xl px-4 py-2">📚 Hoàn thành nhiệm vụ học thuật</div>
            <div className="bg-white/20 rounded-2xl px-4 py-2">🎭 Khám phá văn hóa campus</div>
            <div className="bg-white/20 rounded-2xl px-4 py-2">🤝 Kết nối cộng đồng sinh viên</div>
          </div>
        </div>
        {/* Right form */}
        <div className="flex-1 flex items-center justify-center p-12">
          <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.2 }}
            className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
            <div className="mb-6">
              <Link href="/login" className="flex items-center gap-1 text-sm text-gray-400 hover:text-orange-primary mb-4">
                <ArrowLeft size={16}/> Quay lại đăng nhập
              </Link>
              <h1 className="text-2xl font-black text-gray-800">Tạo tài khoản</h1>
              <p className="text-gray-400 text-sm">Bắt đầu hành trình F-QUEST của bạn!</p>
            </div>
            <RegisterForm fields={fields} form={form} setForm={setForm} loading={loading} handleSubmit={handleSubmit} />
          </motion.div>
        </div>
      </div>
    </>
  );
}