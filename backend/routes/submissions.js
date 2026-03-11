const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { auth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

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

// POST /api/submissions - submit mission proof
router.post('/', auth, upload.single('proof'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Proof image required' });

  const { mission_id, note } = req.body;
  if (!mission_id) return res.status(400).json({ error: 'mission_id required' });

  const mission = db.prepare('SELECT * FROM missions WHERE id = ? AND is_active = 1').get(mission_id);
  if (!mission) return res.status(404).json({ error: 'Mission not found' });

  const existing = db.prepare('SELECT * FROM submissions WHERE user_id = ? AND mission_id = ?').get(req.user.id, mission_id);
  if (existing && existing.status !== 'rejected') return res.status(409).json({ error: 'Already submitted this mission' });

  try {
    let submission;
    if (existing && existing.status === 'rejected') {
      db.prepare(`UPDATE submissions SET proof_image=?, note=?, status='pending', admin_note='', reviewed_by=NULL, reviewed_at=NULL, created_at=CURRENT_TIMESTAMP WHERE id=?`)
        .run(req.file.filename, note || '', existing.id);
      submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(existing.id);
    } else {
      const result = db.prepare(`
        INSERT INTO submissions (user_id, mission_id, proof_image, note)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, mission_id, req.file.filename, note || '');
      submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(result.lastInsertRowid);
    }
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/submissions/base64 - submit via base64 (camera capture)
router.post('/base64', auth, (req, res) => {
  const { mission_id, note, image_data } = req.body;
  if (!mission_id || !image_data) return res.status(400).json({ error: 'mission_id and image_data required' });

  const mission = db.prepare('SELECT * FROM missions WHERE id = ? AND is_active = 1').get(mission_id);
  if (!mission) return res.status(404).json({ error: 'Mission not found' });

  const existing = db.prepare('SELECT * FROM submissions WHERE user_id = ? AND mission_id = ?').get(req.user.id, mission_id);
  if (existing && existing.status !== 'rejected') return res.status(409).json({ error: 'Already submitted this mission' });

  try {
    const fsModule = require('fs');
    const matches = image_data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: 'Invalid image data' });

    const ext = matches[1];
    const base64Data = matches[2];
    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(__dirname, '../uploads', filename);
    fsModule.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

    let submission;
    if (existing && existing.status === 'rejected') {
      db.prepare(`UPDATE submissions SET proof_image=?, note=?, status='pending', admin_note='', reviewed_by=NULL, reviewed_at=NULL, created_at=CURRENT_TIMESTAMP WHERE id=?`)
        .run(filename, note || '', existing.id);
      submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(existing.id);
    } else {
      const result = db.prepare(`
        INSERT INTO submissions (user_id, mission_id, proof_image, note)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, mission_id, filename, note || '');
      submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(result.lastInsertRowid);
    }
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/submissions/my
router.get('/my', auth, (req, res) => {
  const submissions = db.prepare(`
    SELECT s.*, m.title as mission_title, m.branch, m.difficulty, m.coins_reward, m.xp_reward
    FROM submissions s
    JOIN missions m ON s.mission_id = m.id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `).all(req.user.id);
  res.json(submissions);
});

module.exports = router;