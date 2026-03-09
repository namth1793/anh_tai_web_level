const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { auth } = require('../middleware/auth');

// GET /api/leaderboard/coins
router.get('/coins', auth, (req, res) => {
  const top = db.prepare(`
    SELECT id, name, student_id, major, avatar, total_coins, level, xp
    FROM users WHERE role = 'student'
    ORDER BY total_coins DESC, xp DESC
    LIMIT 20
  `).all();

  const myRank = db.prepare(`
    SELECT COUNT(*) + 1 as rank FROM users
    WHERE role = 'student' AND total_coins > (SELECT total_coins FROM users WHERE id = ?)
  `).get(req.user.id);

  res.json({ top, myRank: myRank.rank });
});

// GET /api/leaderboard/missions
router.get('/missions', auth, (req, res) => {
  const top = db.prepare(`
    SELECT u.id, u.name, u.student_id, u.major, u.avatar, u.level,
           COUNT(s.id) as completed_missions
    FROM users u
    LEFT JOIN submissions s ON u.id = s.user_id AND s.status = 'approved'
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY completed_missions DESC, u.level DESC
    LIMIT 20
  `).all();

  res.json({ top });
});

module.exports = router;