const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// DB_PATH env var lets Railway Volume override the default path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/fquest.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ===== SCHEMA =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    student_id TEXT UNIQUE,
    major TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    role TEXT DEFAULT 'student',
    total_coins INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    branch TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    coins_reward INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL,
    hint TEXT DEFAULT '',
    example_image TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mission_id INTEGER NOT NULL,
    proof_image TEXT NOT NULL,
    note TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    admin_note TEXT DEFAULT '',
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (mission_id) REFERENCES missions(id),
    UNIQUE(user_id, mission_id)
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT DEFAULT '',
    coin_cost INTEGER NOT NULL,
    category TEXT DEFAULT 'item',
    stock INTEGER DEFAULT -1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reward_id INTEGER NOT NULL,
    coins_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reward_id) REFERENCES rewards(id)
  );
`);

// ===== SEED DATA =====
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const hashPw = (pw) => bcrypt.hashSync(pw, 10);

  // Admin
  db.prepare(`INSERT INTO users (name, email, password, student_id, major, role, total_coins, xp, level)
    VALUES (?, ?, ?, ?, ?, 'admin', 0, 0, 1)`)
    .run('Admin F-Quest', 'admin@fquest.edu.vn', hashPw('admin123'), 'ADMIN001', 'Administration');

  // Students
  db.prepare(`INSERT INTO users (name, email, password, student_id, major, total_coins, xp, level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run('Nguyễn Văn An', 'an.nv@fquest.edu.vn', hashPw('student123'), 'SE180001', 'Software Engineering', 150, 320, 4);

  db.prepare(`INSERT INTO users (name, email, password, student_id, major, total_coins, xp, level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run('Trần Thị Bình', 'binh.tt@fquest.edu.vn', hashPw('student123'), 'BA180002', 'Business Administration', 80, 180, 2);

  db.prepare(`INSERT INTO users (name, email, password, student_id, major, total_coins, xp, level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run('Lê Hoàng Cường', 'cuong.lh@fquest.edu.vn', hashPw('student123'), 'MK180003', 'Marketing', 220, 500, 5);

  // Missions
  const insertMission = db.prepare(`INSERT INTO missions (title, description, branch, difficulty, coins_reward, xp_reward, hint)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);

  // Academic Branch
  insertMission.run('Học từ Đàn Anh', 'Hỏi một sinh viên năm trên ít nhất 1 tips học tập cho ngành của bạn. Chụp ảnh cùng họ làm bằng chứng.', 'academic', 'easy', 10, 15, 'Tìm sinh viên ở khu vực thư viện hoặc phòng tự học');
  insertMission.run('Góc Học Tập Yên Tĩnh', 'Khám phá và chụp ảnh một nơi yên tĩnh trên campus mà bạn có thể học tập hiệu quả.', 'academic', 'easy', 10, 15, 'Thư viện, hành lang, sân vườn đều là gợi ý tốt');
  insertMission.run('Bài Học Hôm Nay', 'Ghi lại một điều bạn học được trong lớp hôm nay và chụp ảnh trang vở ghi chú.', 'academic', 'easy', 10, 15, 'Viết rõ ràng, ghi tên môn học và ngày');
  insertMission.run('Nhiệm Vụ ECO102: Phân Tích Canteen', 'Mua một ly cà phê tại canteen và phân tích tại sao giá có thể thay đổi theo số lượng sinh viên trong giờ cao điểm. Chụp ảnh ly cà phê và ghi chú phân tích.', 'academic', 'medium', 20, 30, 'Quan sát giờ cao điểm 11h-12h và 17h-18h');
  insertMission.run('Nhiệm Vụ ENM302: Cơ Hội Kinh Doanh', 'Chụp ảnh một khu vực trên campus mà bạn cho rằng có thể được sử dụng cho mục đích kinh doanh. Giải thích lý do.', 'academic', 'medium', 20, 30, 'Nghĩ về lưu lượng người qua lại, nhu cầu của sinh viên');
  insertMission.run('Nhiệm Vụ MGT103: Cơ Cấu Tổ Chức', 'Chụp ảnh bản thân đứng cạnh một bảng thông báo hoặc sơ đồ tổ chức của một CLB hoặc phòng ban.', 'academic', 'medium', 20, 30, 'Tìm bảng thông báo ở khu vực hành lang chính');

  // Culture Branch
  insertMission.run('Biểu Tượng Campus', 'Chụp ảnh tại một địa điểm mang tính biểu tượng trên campus của bạn.', 'culture', 'easy', 10, 15, 'Cổng trường, sân vườn chính, tòa nhà nổi bật');
  insertMission.run('Ý Nghĩa Slogan', 'Tìm hiểu ý nghĩa slogan của trường và viết một câu về điều đó. Chụp ảnh slogan và ghi chú của bạn.', 'culture', 'easy', 10, 15, 'Slogan thường xuất hiện ở cổng trường hoặc website');
  insertMission.run('Săn Sự Kiện', 'Tìm một sự kiện hoặc hoạt động CLB sắp diễn ra trên campus. Chụp ảnh poster/banner sự kiện.', 'culture', 'easy', 10, 15, 'Xem bảng thông báo, fanpage trường hoặc các CLB');
  insertMission.run('Màu Sắc Trường', 'Chụp ảnh thể hiện màu sắc đặc trưng của trường (thường là xanh lam/cam/trắng).', 'culture', 'easy', 10, 15, 'Đồng phục sinh viên, bảng hiệu, banner trường');
  insertMission.run('Nhiệm Vụ Vovinam: Check-in Sân Tập', 'Check-in tại sân tập Vovinam mặc đồng phục và thực hiện "Chiến lược 1, 2, 3". Chụp ảnh làm bằng chứng.', 'culture', 'hard', 50, 80, 'Liên hệ CLB Vovinam để biết lịch tập');
  insertMission.run('Sách Thư Viện', 'Mượn một cuốn sách logistics từ thư viện và chụp ảnh bìa sách cùng thẻ thư viện của bạn.', 'culture', 'medium', 20, 30, 'Tìm sách ở khu vực kinh tế-quản trị');
  insertMission.run('Phòng Âm Nhạc', 'Chụp ảnh tay đặt trên dây đàn tranh/đàn tỳ bà trong phòng âm nhạc của trường.', 'culture', 'hard', 50, 80, 'Liên hệ CLB Âm nhạc để được hướng dẫn');

  // Social Branch
  insertMission.run('Xin Chỉ Đường', 'Hỏi một sinh viên khác chỉ đường đến một địa điểm trên campus. Chụp ảnh cùng người đó.', 'social', 'easy', 10, 15, 'Thử hỏi đường đến phòng gym, thư viện hoặc văn phòng hỗ trợ sinh viên');
  insertMission.run('Khám Phá Canteen', 'Ghé thăm canteen và ghi lại menu hôm nay. Chụp ảnh các món ăn đang bày bán.', 'social', 'easy', 10, 15, 'Canteen thường có từ 7h sáng');
  insertMission.run('Tên Giảng Viên', 'Tìm tên một giảng viên sẽ dạy môn học của bạn. Chụp ảnh thời khóa biểu hoặc bảng phân công giảng viên.', 'social', 'easy', 10, 15, 'Xem thời khóa biểu trên portal sinh viên');
  insertMission.run('Chỗ Ngồi Mới', 'Ngồi ở một chỗ khác trong lớp học hôm nay và chụp ảnh từ góc nhìn mới của bạn.', 'social', 'easy', 10, 15, 'Hãy thử ngồi gần bạn mới!');
  insertMission.run('Ảnh Nhóm Logistics - Dấu L', 'Chụp ảnh nhóm ít nhất 3 người từ lớp Logistics cùng làm dấu tay chữ "L". Mọi người phải nhìn thấy rõ mặt.', 'social', 'medium', 20, 30, 'Tập hợp bạn cùng lớp Logistics của bạn');
  insertMission.run('Check-in Bàn CLB', 'Chụp ảnh trước standee hoặc bàn đăng ký của một CLB. Bonus nếu bạn đăng ký tham gia!', 'social', 'medium', 20, 30, 'CLB thường dựng bàn ở khu vực sảnh trường');

  // Rewards
  const insertReward = db.prepare(`INSERT INTO rewards (title, description, coin_cost, category, stock)
    VALUES (?, ?, ?, ?, ?)`);

  insertReward.run('Voucher Canteen 10%', 'Giảm 10% hóa đơn tại canteen trường cho 1 lần mua. Hạn dùng: 30 ngày.', 30, 'food', 50);
  insertReward.run('Voucher Canteen 20%', 'Giảm 20% hóa đơn tại canteen trường cho 1 lần mua. Hạn dùng: 30 ngày.', 60, 'food', 30);
  insertReward.run('Voucher Cà Phê Campus', 'Mua 1 tặng 1 tại quầy cà phê campus. Hạn dùng: 15 ngày.', 40, 'food', 40);
  insertReward.run('Voucher Siêu Thị Mini 15%', 'Giảm 15% tại siêu thị mini trong khuôn viên trường. Hạn dùng: 30 ngày.', 50, 'food', 25);
  insertReward.run('Bình Nước F-Quest', 'Bình nước inox 500ml in logo F-Quest. Màu ngẫu nhiên.', 80, 'item', 20);
  insertReward.run('Áo Thun F-Quest', 'Áo thun cotton in logo F-Quest. Size S/M/L/XL.', 150, 'item', 15);
  insertReward.run('Sổ Tay F-Quest', 'Sổ tay bìa cứng A5, 100 trang, in logo F-Quest.', 60, 'item', 30);
  insertReward.run('Bộ Bút F-Quest', 'Hộp bút 5 cây nhiều màu in logo F-Quest.', 40, 'item', 50);
  insertReward.run('Móc Khóa F-Quest', 'Móc khóa kim loại hình khiên quest với logo F-Quest.', 25, 'item', 100);
  insertReward.run('Mũ Lưỡi Trai F-Quest', 'Mũ lưỡi trai có thêu logo F-Quest. Điều chỉnh được kích thước.', 100, 'item', 10);

  // Sample submissions (approved)
  const u2 = db.prepare('SELECT id FROM users WHERE email = ?').get('an.nv@fquest.edu.vn');
  const u3 = db.prepare('SELECT id FROM users WHERE email = ?').get('binh.tt@fquest.edu.vn');
  const u4 = db.prepare('SELECT id FROM users WHERE email = ?').get('cuong.lh@fquest.edu.vn');

  if (u2) {
    db.prepare(`INSERT OR IGNORE INTO submissions (user_id, mission_id, proof_image, note, status, reviewed_at) VALUES (?, 1, 'sample.jpg', 'Đã hỏi anh Minh năm 3', 'approved', CURRENT_TIMESTAMP)`).run(u2.id);
    db.prepare(`INSERT OR IGNORE INTO submissions (user_id, mission_id, proof_image, note, status, reviewed_at) VALUES (?, 2, 'sample.jpg', 'Góc thư viện tầng 2', 'approved', CURRENT_TIMESTAMP)`).run(u2.id);
    db.prepare(`INSERT OR IGNORE INTO submissions (user_id, mission_id, proof_image, note, status, reviewed_at) VALUES (?, 7, 'sample.jpg', 'Chụp tại cổng trường', 'approved', CURRENT_TIMESTAMP)`).run(u2.id);
  }
  if (u4) {
    db.prepare(`INSERT OR IGNORE INTO submissions (user_id, mission_id, proof_image, note, status, reviewed_at) VALUES (?, 1, 'sample.jpg', 'Học tips từ anh Hùng', 'approved', CURRENT_TIMESTAMP)`).run(u4.id);
    db.prepare(`INSERT OR IGNORE INTO submissions (user_id, mission_id, proof_image, note, status, reviewed_at) VALUES (?, 4, 'sample.jpg', 'Phân tích ECO102', 'approved', CURRENT_TIMESTAMP)`).run(u4.id);
    db.prepare(`INSERT OR IGNORE INTO submissions (user_id, mission_id, proof_image, note, status, reviewed_at) VALUES (?, 8, 'sample.jpg', 'Slogan campus', 'approved', CURRENT_TIMESTAMP)`).run(u4.id);
    db.prepare(`INSERT OR IGNORE INTO submissions (user_id, mission_id, proof_image, note, status, reviewed_at) VALUES (?, 14, 'sample.jpg', 'Hỏi đường thư viện', 'approved', CURRENT_TIMESTAMP)`).run(u4.id);
    db.prepare(`INSERT OR IGNORE INTO submissions (user_id, mission_id, proof_image, note, status, reviewed_at) VALUES (?, 19, 'sample.jpg', 'Chụp cùng nhóm Logistics', 'approved', CURRENT_TIMESTAMP)`).run(u4.id);
  }

  console.log('✅ F-QUEST database seeded successfully!');
}

module.exports = db;