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

// Max level 10 — each level requires 200–300 XP more than the previous
export function getLevelInfo(xp) {
  const levels = [
    { level: 1,  name: 'Tân Binh',    minXP: 0,    maxXP: 200  },
    { level: 2,  name: 'Thám Hiểm',   minXP: 200,  maxXP: 450  },
    { level: 3,  name: 'Chiến Binh',  minXP: 450,  maxXP: 700  },
    { level: 4,  name: 'Dũng Sĩ',     minXP: 700,  maxXP: 1000 },
    { level: 5,  name: 'Anh Hùng',    minXP: 1000, maxXP: 1300 },
    { level: 6,  name: 'Huyền Thoại', minXP: 1300, maxXP: 1600 },
    { level: 7,  name: 'Chiến Thần',  minXP: 1600, maxXP: 1900 },
    { level: 8,  name: 'Thiên Long',  minXP: 1900, maxXP: 2200 },
    { level: 9,  name: 'Bất Bại',     minXP: 2200, maxXP: 2500 },
    { level: 10, name: 'Bá Vương',    minXP: 2500, maxXP: 2500 },
  ];
  if (xp >= 2500) return { level: 10, name: 'Bá Vương', minXP: 2500, maxXP: 2500, progress: 100 };
  const cur = levels.find(l => xp >= l.minXP && xp < l.maxXP) || levels[0];
  const progress = Math.round(((xp - cur.minXP) / (cur.maxXP - cur.minXP)) * 100);
  return { ...cur, progress };
}
