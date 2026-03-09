import Link from 'next/link';
import { useRouter } from 'next/router';
import { BookOpen, GitBranch, Home, Users, Gift } from 'lucide-react';

const NAV = [
  { href: '/missions',    icon: BookOpen,  label: 'Giới thiệu' },
  { href: '/quests',      icon: GitBranch, label: 'Cây NV' },
  { href: '/dashboard',   icon: Home,      label: 'Home', big: true },
  { href: '/leaderboard', icon: Users,     label: 'Bạn bè' },
  { href: '/vouchers',    icon: Gift,      label: 'Voucher' },
];

export default function BottomNav() {
  const { pathname } = useRouter();

  return (
    <nav className="bottom-nav">
      <div className="flex items-end justify-around px-1 py-2">
        {NAV.map(({ href, icon: Icon, label, big }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          if (big) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center -mt-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-btn"
                  style={{ background: 'linear-gradient(135deg, #FF7A00, #FFA94D)' }}>
                  <Icon size={26} color="white" />
                </div>
                <span className={`text-xs mt-1 ${active ? 'text-orange-primary font-bold' : 'text-gray-400'}`}>{label}</span>
              </Link>
            );
          }
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 py-1 px-1">
              <Icon size={20} color={active ? '#FF7A00' : '#9CA3AF'} />
              <span className={`text-xs ${active ? 'text-orange-primary font-bold' : 'text-gray-400'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}