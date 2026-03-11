const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { auth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'fquest_secret';

function getLevelFromXP(xp) {
  if (xp < 200)  return 1;
  if (xp < 450)  return 2;
  if (xp < 700)  return 3;
  if (xp < 1000) return 4;
  if (xp < 1300) return 5;
  if (xp < 1600) return 6;
  if (xp < 1900) return 7;
  if (xp < 2200) return 8;
  if (xp < 2500) return 9;
  return 10;
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, student_id } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password, student_id, major)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, hashed, student_id || null, 'Logistics');

    const user = db.prepare('SELECT id, name, email, student_id, major, avatar, role, total_coins, xp, level, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Student ID already exists' });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  const { password: _, ...safeUser } = req.user;

  // Get mission completion counts by branch
  const branches = db.prepare(`
    SELECT m.branch, COUNT(*) as count
    FROM submissions s JOIN missions m ON s.mission_id = m.id
    WHERE s.user_id = ? AND s.status = 'approved'
    GROUP BY m.branch
  `).all(req.user.id);

  const branchProgress = { academic: 0, culture: 0, social: 0 };
  branches.forEach(b => { branchProgress[b.branch] = b.count; });

  const totalCompleted = db.prepare(`SELECT COUNT(*) as c FROM submissions WHERE user_id = ? AND status = 'approved'`).get(req.user.id).c;

  res.json({ ...safeUser, branchProgress, totalCompleted });
});

// PUT /api/auth/profile
router.put('/profile', auth, (req, res) => {
  const { name, student_id, avatar } = req.body;
  db.prepare(`UPDATE users SET name = ?, student_id = ?, avatar = ? WHERE id = ?`)
    .run(name || req.user.name, student_id || req.user.student_id, avatar || req.user.avatar, req.user.id);

  const updated = db.prepare('SELECT id, name, email, student_id, major, avatar, role, total_coins, xp, level, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(updated);
});

module.exports = router;