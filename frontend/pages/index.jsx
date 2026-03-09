import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isLoggedIn } from '../lib/auth';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push(isLoggedIn() ? '/dashboard' : '/login');
  }, []);
  return (
    <>
      <Head><title>F-QUEST</title></Head>
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-bounce-soft">⚔️</div>
      </div>
    </>
  );
}