const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { auth } = require('../middleware/auth');

// GET /api/missions
router.get('/', auth, (req, res) => {
  const { branch, difficulty } = req.query;

  let query = 'SELECT * FROM missions WHERE is_active = 1';
  const params = [];

  if (branch) { query += ' AND branch = ?'; params.push(branch); }
  if (difficulty) { query += ' AND difficulty = ?'; params.push(difficulty); }
  query += ' ORDER BY branch, difficulty, id';

  const missions = db.prepare(query).all(...params);

  // Get user's completed missions
  const completed = db.prepare(`
    SELECT mission_id, status FROM submissions WHERE user_id = ?
  `).all(req.user.id);

  const completedMap = {};
  completed.forEach(s => { completedMap[s.mission_id] = s.status; });

  const result = missions.map(m => ({
    ...m,
    userStatus: completedMap[m.id] || null
  }));

  res.json(result);
});

// GET /api/missions/:id
router.get('/:id', auth, (req, res) => {
  const mission = db.prepare('SELECT * FROM missions WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!mission) return res.status(404).json({ error: 'Mission not found' });

  const submission = db.prepare(`
    SELECT * FROM submissions WHERE user_id = ? AND mission_id = ?
  `).get(req.user.id, mission.id);

  res.json({ ...mission, submission: submission || null });
});

module.exports = router;