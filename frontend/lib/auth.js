export const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('fquest_token') : null;
export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('fquest_user')); } catch { return null; }
};
export const setAuth = (token, user) => {
  localStorage.setItem('fquest_token', token);
  localStorage.setItem('fquest_user', JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem('fquest_token');
  localStorage.removeItem('fquest_user');
};
export const isLoggedIn = () => !!getToken();
export const isAdmin = () => getUser()?.role === 'admin';

export function getLevelInfo(xp) {
  const levels = [
    { level: 1, name: 'Tân Binh', minXP: 0, maxXP: 100 },
    { level: 2, name: 'Thám Hiểm', minXP: 100, maxXP: 250 },
    { level: 3, name: 'Chiến Binh', minXP: 250, maxXP: 500 },
    { level: 4, name: 'Dũng Sĩ', minXP: 500, maxXP: 1000 },
    { level: 5, name: 'Anh Hùng', minXP: 1000, maxXP: 2000 },
  ];
  if (xp >= 2000) return { level: Math.floor(xp / 500) + 1, name: 'Huyền Thoại', minXP: 2000, maxXP: xp + 500, progress: 99 };
  const cur = levels.find(l => xp >= l.minXP && xp < l.maxXP) || levels[0];
  const progress = Math.round(((xp - cur.minXP) / (cur.maxXP - cur.minXP)) * 100);
  return { ...cur, progress };
}