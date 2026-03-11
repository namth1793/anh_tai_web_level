import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { clearAuth, getUser, isAdmin, getLevelInfo } from '../lib/auth';
import {
  Home, BookOpen, GitBranch, Camera, Gift, Ticket,
  Trophy, User, Shield, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',   icon: Home,      label: 'Trang chủ' },
  { href: '/missions',    icon: BookOpen,  label: 'Nhiệm vụ' },
  { href: '/quests',      icon: GitBranch, label: 'Cây nhiệm vụ' },
  { href: '/photo',       icon: Camera,    label: 'Thư viện ảnh' },
  { href: '/rewards',     icon: Gift,      label: 'Đổi F-Coin' },
  { href: '/vouchers',    icon: Ticket,    label: 'Khu Voucher' },
  { href: '/leaderboard', icon: Trophy,    label: 'Xếp hạng' },
  { href: '/profile',     icon: User,      label: 'Hồ sơ' },
];

export default function DesktopNav() {
  const { pathname } = useRouter();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const user = mounted ? getUser() : null;
  const li = user ? getLevelInfo(user.xp || 0) : null;

  const logout = () => { clearAuth(); router.push('/login'); };

  const allNav = (mounted && isAdmin())
    ? [...NAV_ITEMS, { href: '/admin', icon: Shield, label: 'Admin Panel' }]
    : NAV_ITEMS;

  return (
    <aside className="w-56 xl:w-64 bg-white flex flex-col min-h-screen sticky top-0 border-r border-orange-100 shadow-sm flex-shrink-0">

      {/* Logo */}
      <div className="p-5 border-b border-orange-50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF7A00, #FFA94D)' }}>
            ⚔️
          </div>
          <div>
            <div className="font-black text-gray-800 text-base leading-tight">F-QUEST</div>
            <div className="text-xs font-medium" style={{ color: '#FF7A00' }}>First Year Survivor</div>
          </div>
        </Link>
      </div>

      {/* User card */}
      {user && (
        <div className="px-4 py-3 border-b border-orange-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">
              🧑‍🎓
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate">{user.name}</p>
              <p className="text-xs font-medium" style={{ color: '#FF7A00' }}>
                🪙 {user.total_coins} · Lv.{li ? li.level : getLevelInfo(user.xp || 0).level}
              </p>
            </div>
          </div>
          {li && (
            <>
              <div className="xp-track">
                <div className="xp-fill" style={{ width: `${li.progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{user.xp || 0} / {li.maxXP} XP</p>
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {allNav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                active
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #FF7A00, #FFA94D)' } : {}}>
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-orange-50">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all w-full">
          <LogOut size={17} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}