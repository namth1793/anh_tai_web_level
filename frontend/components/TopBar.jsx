import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { clearAuth, getUser } from '../lib/auth';
import { LogOut } from 'lucide-react';

export default function TopBar({ title, showCoin = true, showLogout = false }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => { setUser(getUser()); }, []);

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="md:hidden flex items-center justify-between px-5 pt-5 pb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #FF7A00, #FFA94D)' }}>F</div>
        <span className="font-bold text-gray-800 text-base">{title || 'Home'}</span>
      </div>
      <div className="flex items-center gap-2">
        {showCoin && user && (
          <Link href="/rewards">
            <div className="coin-badge active:scale-95 transition-transform cursor-pointer">
              <span>🪙</span>
              <span>{user.total_coins || 0}</span>
            </div>
          </Link>
        )}
        {showLogout && (
          <button onClick={logout} className="text-gray-400 hover:text-red-400 p-1">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );
}