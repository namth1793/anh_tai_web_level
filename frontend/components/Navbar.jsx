import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { clearAuth, getUser, isAdmin } from '../lib/auth';
import { Sword, Map, Gift, Trophy, User, Shield, Menu, X, Home } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = getUser();

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { href: '/missions', label: 'Nhiệm Vụ', icon: <Sword size={18} /> },
    { href: '/rewards', label: 'Phần Thưởng', icon: <Gift size={18} /> },
    { href: '/leaderboard', label: 'Xếp Hạng', icon: <Trophy size={18} /> },
    { href: '/profile', label: 'Hồ Sơ', icon: <User size={18} /> },
  ];

  if (isAdmin()) navItems.push({ href: '/admin', label: 'Admin', icon: <Shield size={18} /> });

  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');

  return (
    <nav className="sticky top-0 z-50 bg-quest-dark/90 backdrop-blur-md border-b border-quest-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">⚔️</span>
          <span className="font-bold text-purple-300 text-lg hidden sm:block">F-QUEST</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive(item.href) ? 'bg-purple-900 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-400 font-bold">🪙 {user.total_coins || 0}</span>
              <span className="text-purple-400">Lv.{user.level || 1}</span>
            </div>
          )}
          <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
            Đăng xuất
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-quest-border bg-quest-dark pb-4 px-4">
          {user && (
            <div className="flex gap-4 py-3 border-b border-quest-border mb-2">
              <span className="text-yellow-400 font-bold">🪙 {user.total_coins || 0} F-Coins</span>
              <span className="text-purple-400">Lv.{user.level || 1}</span>
            </div>
          )}
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm transition-all ${
                isActive(item.href) ? 'bg-purple-900 text-purple-300' : 'text-gray-400'
              }`}>
              {item.icon} {item.label}
            </Link>
          ))}
          <button onClick={logout} className="flex items-center gap-2 px-3 py-3 text-sm text-red-400 w-full">
            Đăng xuất
          </button>
        </div>
      )}
    </nav>
  );
}