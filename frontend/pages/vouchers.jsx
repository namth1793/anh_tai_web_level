import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import VoucherCard from '../components/VoucherCard';
import TabSwitcher from '../components/TabSwitcher';
import { isLoggedIn } from '../lib/auth';
import { motion } from 'framer-motion';

const TABS = [
  { key:'all', label:'Tất cả' },
  { key:'food', label:'Đồ ăn' },
  { key:'shop', label:'Mua sắm' },
  { key:'cafe', label:'Café' },
];

const VOUCHERS = [
  { id:1, brand:'BobaPop', discount:50, description:'Giảm 50% đơn đầu tiên tại BobaPop campus', expiry:'31/12/2025', category:'food' },
  { id:2, brand:'BanTrà', discount:20, description:'Mua 1 tặng 1 cho trà sữa size M', expiry:'30/06/2025', category:'cafe' },
  { id:3, brand:'Canteen FPT', discount:15, description:'Giảm 15% tổng hóa đơn tại canteen', expiry:'31/03/2025', category:'food' },
  { id:4, brand:'Mini Mart', discount:10, description:'Giảm 10% mua sắm tại siêu thị mini campus', expiry:'30/06/2025', category:'shop' },
  { id:5, brand:'Pắp C', discount:25, description:'Voucher mua sắm đặc biệt dành cho sinh viên', expiry:'31/05/2025', category:'shop' },
  { id:6, brand:'Campus Café', discount:30, description:'Giảm 30% mọi đồ uống trong tuần', expiry:'15/04/2025', category:'cafe' },
];

export default function Vouchers() {
  const router = useRouter();
  const [tab, setTab] = useState('all');
  useEffect(() => { if (!isLoggedIn()) router.push('/login'); }, []);
  const filtered = tab==='all' ? VOUCHERS : VOUCHERS.filter(v => v.category===tab);

  return (
    <Layout title="Khu Voucher">
      <TopBar title="Khu Voucher" showCoin/>

      <div className="px-5 mb-4">
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background:'linear-gradient(135deg,#FF7A00,#FFA94D)' }}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"/>
          <h2 className="text-white font-black text-xl">🎫 Khu Voucher</h2>
          <p className="text-white/70 text-sm mt-1">{VOUCHERS.length} voucher đang có hiệu lực</p>
          <div className="mt-3 flex gap-2">
            <div className="bg-white/20 rounded-xl px-3 py-1.5 text-white text-xs font-medium">🍜 Đồ ăn</div>
            <div className="bg-white/20 rounded-xl px-3 py-1.5 text-white text-xs font-medium">☕ Café</div>
            <div className="bg-white/20 rounded-xl px-3 py-1.5 text-white text-xs font-medium">🛍️ Mua sắm</div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 mb-4">
        <TabSwitcher tabs={TABS} active={tab} onChange={setTab}/>
      </div>

      <div className="px-5">
        {filtered.map((v,i) => <VoucherCard key={v.id} voucher={v} index={i}/>)}
      </div>
    </Layout>
  );
}