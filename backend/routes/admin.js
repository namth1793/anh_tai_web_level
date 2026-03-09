const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { adminOnly } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', adminOnly, (req, res) => {
  const totalUsers = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role='student'`).get().c;
  const totalMissions = db.prepare(`SELECT COUNT(*) as c FROM missions WHERE is_active=1`).get().c;
  const pendingSubmissions = db.prepare(`SELECT COUNT(*) as c FROM submissions WHERE status='pending'`).get().c;
  const totalSubmissions = db.prepare(`SELECT COUNT(*) as c FROM submissions`).get().c;
  const approvedSubmissions = db.prepare(`SELECT COUNT(*) as c FROM submissions WHERE status='approved'`).get().c;
  const totalCoinsDistributed = db.prepare(`SELECT SUM(total_coins) as s FROM users WHERE role='student'`).get().s || 0;
  const totalRedemptions = db.prepare(`SELECT COUNT(*) as c FROM redemptions`).get().c;

  const popularMissions = db.prepare(`
    SELECT m.title, m.branch, COUNT(s.id) as submissions
    FROM missions m
    LEFT JOIN submissions s ON m.id = s.mission_id AND s.status = 'approved'
    GROUP BY m.id ORDER BY submissions DESC LIMIT 5
  `).all();

  res.json({
    totalUsers, totalMissions, pendingSubmissions, totalSubmissions,
    approvedSubmissions, totalCoinsDistributed, totalRedemptions, popularMissions
  });
});

// GET /api/admin/submissions
router.get('/submissions', adminOnly, (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT s.*, u.name as user_name, u.student_id, u.email as user_email,
           m.title as mission_title, m.branch, m.difficulty, m.coins_reward, m.xp_reward
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    JOIN missions m ON s.mission_id = m.id
  `;
  const params = [];
  if (status) { query += ' WHERE s.status = ?'; params.push(status); }
  query += ' ORDER BY s.created_at DESC';
  const submissions = db.prepare(query).all(...params);
  res.json(submissions);
});

// PUT /api/admin/submissions/:id/approve
router.put('/submissions/:id/approve', adminOnly, (req, res) => {
  const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  if (submission.status !== 'pending') return res.status(400).json({ error: 'Already reviewed' });

  const mission = db.prepare('SELECT * FROM missions WHERE id = ?').get(submission.mission_id);

  const approve = db.transaction(() => {
    db.prepare(`UPDATE submissions SET status='approved', reviewed_by=?, reviewed_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(req.user.id, submission.id);

    db.prepare(`UPDATE users SET total_coins = total_coins + ?, xp = xp + ? WHERE id = ?`)
      .run(mission.coins_reward, mission.xp_reward, submission.user_id);

    // Update level
    const user = db.prepare('SELECT xp FROM users WHERE id = ?').get(submission.user_id);
    let level = 1;
    if (user.xp >= 2000) level = Math.floor(user.xp / 500) + 1;
    else if (user.xp >= 1000) level = 5;
    else if (user.xp >= 500) level = 4;
    else if (user.xp >= 250) level = 3;
    else if (user.xp >= 100) level = 2;
    db.prepare('UPDATE users SET level = ? WHERE id = ?').run(level, submission.user_id);
  });

  approve();
  res.json({ success: true, message: `Approved! +${mission.coins_reward} F-Coins, +${mission.xp_reward} XP` });
});

// PUT /api/admin/submissions/:id/reject
router.put('/submissions/:id/reject', adminOnly, (req, res) => {
  const { admin_note } = req.body;
  const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  if (submission.status !== 'pending') return res.status(400).json({ error: 'Already reviewed' });

  db.prepare(`UPDATE submissions SET status='rejected', admin_note=?, reviewed_by=?, reviewed_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(admin_note || '', req.user.id, submission.id);

  res.json({ success: true });
});

// CRUD Missions
router.get('/missions', adminOnly, (req, res) => {
  res.json(db.prepare('SELECT * FROM missions ORDER BY branch, id').all());
});

router.post('/missions', adminOnly, (req, res) => {
  const { title, description, branch, difficulty, coins_reward, xp_reward, hint, example_image } = req.body;
  if (!title || !description || !branch || !difficulty || !coins_reward)
    return res.status(400).json({ error: 'Missing required fields' });

  const result = db.prepare(`
    INSERT INTO missions (title, description, branch, difficulty, coins_reward, xp_reward, hint, example_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, branch, difficulty, coins_reward, xp_reward || 0, hint || '', example_image || '');

  res.status(201).json(db.prepare('SELECT * FROM missions WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/missions/:id', adminOnly, (req, res) => {
  const { title, description, branch, difficulty, coins_reward, xp_reward, hint, is_active } = req.body;
  db.prepare(`UPDATE missions SET title=?, description=?, branch=?, difficulty=?, coins_reward=?, xp_reward=?, hint=?, is_active=? WHERE id=?`)
    .run(title, description, branch, difficulty, coins_reward, xp_reward, hint || '', is_active ?? 1, req.params.id);
  res.json(db.prepare('SELECT * FROM missions WHERE id = ?').get(req.params.id));
});

router.delete('/missions/:id', adminOnly, (req, res) => {
  db.prepare('UPDATE missions SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// CRUD Rewards
router.get('/rewards', adminOnly, (req, res) => {
  res.json(db.prepare('SELECT * FROM rewards ORDER BY id').all());
});

router.post('/rewards', adminOnly, (req, res) => {
  const { title, description, coin_cost, category, stock } = req.body;
  const result = db.prepare(`INSERT INTO rewards (title, description, coin_cost, category, stock) VALUES (?, ?, ?, ?, ?)`)
    .run(title, description, coin_cost, category || 'item', stock ?? -1);
  res.status(201).json(db.prepare('SELECT * FROM rewards WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/rewards/:id', adminOnly, (req, res) => {
  const { title, description, coin_cost, category, stock, is_active } = req.body;
  db.prepare(`UPDATE rewards SET title=?, description=?, coin_cost=?, category=?, stock=?, is_active=? WHERE id=?`)
    .run(title, description, coin_cost, category, stock ?? -1, is_active ?? 1, req.params.id);
  res.json(db.prepare('SELECT * FROM rewards WHERE id = ?').get(req.params.id));
});

// GET /api/admin/users
router.get('/users', adminOnly, (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.student_id, u.major, u.role, u.total_coins, u.xp, u.level, u.created_at,
           COUNT(s.id) as completed_missions
    FROM users u
    LEFT JOIN submissions s ON u.id = s.user_id AND s.status = 'approved'
    GROUP BY u.id ORDER BY u.created_at DESC
  `).all();
  res.json(users);
});

module.exports = router;