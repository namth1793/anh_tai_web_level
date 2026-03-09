import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import RewardCard from '../components/RewardCard';
import TabSwitcher from '../components/TabSwitcher';
import { isLoggedIn, getUser } from '../lib/auth';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const TABS = [
  { key:'all', label:'Tất cả' },
  { key:'item', label:'Vật Phẩm' },
  { key:'food', label:'Đồ Ăn' },
];

export default function Rewards() {
  const router = useRouter();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [tab, setTab] = useState('all');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    const user = getUser();
    setCoins(user?.total_coins || 0);
    Promise.all([api.get('/rewards'), api.get('/auth/me')])
      .then(([r, me]) => { setRewards(r.data); setCoins(me.data.total_coins); })
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (reward) => {
    if (!confirm(`Đổi "${reward.title}" với ${reward.coin_cost} F-Coins?`)) return;
    setRedeeming(true);
    try {
      const { data } = await api.post(`/rewards/redeem/${reward.id}`);
      setCoins(data.remaining_coins);
      const u = JSON.parse(localStorage.getItem('fquest_user')||'{}');
      u.total_coins = data.remaining_coins;
      localStorage.setItem('fquest_user', JSON.stringify(u));
      toast.success(`Đổi thành công! Còn ${data.remaining_coins} 🪙`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi đổi thưởng');
    } finally { setRedeeming(false); }
  };

  const filtered = tab==='all' ? rewards : rewards.filter(r => r.category===tab);

  return (
    <Layout title="Đổi F-Coin">
      <TopBar title="Đổi F-Coin" showCoin/>

      <div className="px-5 mb-4">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background:'linear-gradient(135deg,#FF7A00 0%,#FFA94D 100%)' }}>
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full"/>
          <p className="text-white/80 text-sm">Số dư của bạn</p>
          <div className="text-white font-black text-4xl">🪙 {coins}</div>
          <p className="text-white/70 text-sm mt-1">F-Coins</p>
        </motion.div>
      </div>

      <div className="px-5 mb-4">
        <TabSwitcher tabs={TABS} active={tab} onChange={setTab}/>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((r,i) => (
              <RewardCard key={r.id} reward={r} userCoins={coins} onRedeem={handleRedeem} loading={redeeming} index={i}/>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}