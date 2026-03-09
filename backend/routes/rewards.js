const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { auth } = require('../middleware/auth');

// GET /api/rewards
router.get('/', auth, (req, res) => {
  const rewards = db.prepare('SELECT * FROM rewards WHERE is_active = 1 ORDER BY coin_cost').all();
  res.json(rewards);
});

// POST /api/rewards/redeem/:id
router.post('/redeem/:id', auth, (req, res) => {
  const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!reward) return res.status(404).json({ error: 'Reward not found' });

  if (req.user.total_coins < reward.coin_cost)
    return res.status(400).json({ error: 'Not enough F-Coins' });

  if (reward.stock === 0)
    return res.status(400).json({ error: 'Out of stock' });

  const redeem = db.transaction(() => {
    db.prepare('UPDATE users SET total_coins = total_coins - ? WHERE id = ?')
      .run(reward.coin_cost, req.user.id);

    if (reward.stock > 0) {
      db.prepare('UPDATE rewards SET stock = stock - 1 WHERE id = ?').run(reward.id);
    }

    const result = db.prepare(`
      INSERT INTO redemptions (user_id, reward_id, coins_spent)
      VALUES (?, ?, ?)
    `).run(req.user.id, reward.id, reward.coin_cost);

    return result.lastInsertRowid;
  });

  try {
    const redemptionId = redeem();
    const redemption = db.prepare('SELECT * FROM redemptions WHERE id = ?').get(redemptionId);
    const updatedUser = db.prepare('SELECT total_coins FROM users WHERE id = ?').get(req.user.id);
    res.json({ redemption, remaining_coins: updatedUser.total_coins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rewards/history
router.get('/history', auth, (req, res) => {
  const history = db.prepare(`
    SELECT r.*, rw.title as reward_title, rw.image, rw.category
    FROM redemptions r
    JOIN rewards rw ON r.reward_id = rw.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `).all(req.user.id);
  res.json(history);
});

module.exports = router;