import Head from 'next/head';
import BottomNav from './BottomNav';
import DesktopNav from './DesktopNav';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { getUser, getLevelInfo } from '../lib/auth';

export default function Layout({ children, title = 'F-QUEST', showNav = true }) {
  const [user, setUser] = useState(null);

  useEffect(() => { setUser(getUser()); }, []);

  return (
    <>
      <Head>
        <title>{title} | F-QUEST</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {/* ── DESKTOP layout (md and above) ── */}
      <div className="hidden md:flex min-h-screen"
        style={{ background: 'linear-gradient(160deg, #FFF5EB 0%, #FFE8CC 60%, #FFF0E0 100%)' }}>

        {showNav && <DesktopNav />}

        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop top bar */}
          {showNav && (
            <header className="bg-white/70 backdrop-blur-sm border-b border-orange-100 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
              <h1 className="font-bold text-gray-800 text-lg">{title}</h1>
              {user && (
                <div className="flex items-center gap-3">
                  <div className="coin-badge text-base">
                    <span>🪙</span>
                    <span>{user.total_coins || 0} F-Coins</span>
                  </div>
                  <div className="text-sm text-gray-400 font-medium">
                    Lv.{getLevelInfo(user.xp || 0).level}
                  </div>
                </div>
              )}
            </header>
          )}

          {/* Desktop content */}
          <main className="flex-1 px-6 py-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* ── MOBILE layout (below md) ── */}
      <div className="md:hidden">
        <div className="mobile-container">
          <div className={showNav ? 'pb-24' : ''}>
            {children}
          </div>
          {showNav && <BottomNav />}
        </div>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#fff', color: '#1a1a1a', border: '1px solid #FFD4A8', borderRadius: '16px' },
          success: { iconTheme: { primary: '#FF7A00', secondary: '#fff' } }
        }}
      />
    </>
  );
}