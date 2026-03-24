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
    .run('Nguyễn Văn An', 'an.nv@fquest.edu.vn', hashPw('student123'), 'SE180001', 'Logistics', 150, 320, 2);

  db.prepare(`INSERT INTO users (name, email, password, student_id, major, total_coins, xp, level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run('Trần Thị Bình', 'binh.tt@fquest.edu.vn', hashPw('student123'), 'BA180002', 'Logistics', 80, 180, 1);

  db.prepare(`INSERT INTO users (name, email, password, student_id, major, total_coins, xp, level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run('Lê Hoàng Cường', 'cuong.lh@fquest.edu.vn', hashPw('student123'), 'MK180003', 'Logistics', 220, 500, 3);

  // 50 sample students for leaderboard diversity
  const insertStudent = db.prepare(`INSERT INTO users (name, email, password, student_id, major, total_coins, xp, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const sampleStudents = [
    // Top tier - Level 10 (2500+ XP)
    ['Phạm Minh Khôi',      'khoi.pm@fquest.edu.vn',   'LG190010', 'Logistics', 380, 2600, 10],
    ['Nguyễn Thị Lan Anh',  'lanh.nt@fquest.edu.vn',   'LG190011', 'Logistics', 360, 2550, 10],
    ['Trần Quốc Bảo',       'bao.tq@fquest.edu.vn',    'LG190012', 'Logistics', 340, 2510, 10],
    // Level 9 (2200–2499 XP)
    ['Lê Thị Thu Hà',       'ha.lt@fquest.edu.vn',     'LG190013', 'Logistics', 310, 2450, 9],
    ['Võ Thanh Tùng',       'tung.vt@fquest.edu.vn',   'LG190014', 'Logistics', 295, 2380, 9],
    ['Đỗ Ngọc Huyền',       'huyen.dn@fquest.edu.vn',  'LG190015', 'Logistics', 280, 2300, 9],
    // Level 8 (1900–2199 XP)
    ['Bùi Văn Đức',         'duc.bv@fquest.edu.vn',    'LG190016', 'Logistics', 260, 2180, 8],
    ['Hoàng Thị Ngọc',      'ngoc.ht@fquest.edu.vn',   'LG190017', 'Logistics', 245, 2100, 8],
    ['Nguyễn Hoàng Long',   'long.nh@fquest.edu.vn',   'LG190018', 'Logistics', 230, 2020, 8],
    ['Trịnh Thị Phương',    'phuong.tt@fquest.edu.vn', 'LG190019', 'Logistics', 215, 1960, 8],
    // Level 7 (1600–1899 XP)
    ['Lâm Thành Đạt',       'dat.lt@fquest.edu.vn',    'LG190020', 'Logistics', 200, 1850, 7],
    ['Phùng Thị Minh',      'minh.pt@fquest.edu.vn',   'LG190021', 'Logistics', 188, 1780, 7],
    ['Đặng Văn Hùng',       'hung.dv@fquest.edu.vn',   'LG190022', 'Logistics', 175, 1710, 7],
    ['Vũ Thị Thanh Thảo',   'thao.vt@fquest.edu.vn',   'LG190023', 'Logistics', 162, 1650, 7],
    // Level 6 (1300–1599 XP)
    ['Cao Nguyên Phúc',     'phuc.cn@fquest.edu.vn',   'LG190024', 'Logistics', 150, 1580, 6],
    ['Đinh Thị Quỳnh',      'quynh.dt@fquest.edu.vn',  'LG190025', 'Logistics', 138, 1500, 6],
    ['Lý Gia Huy',          'huy.lg@fquest.edu.vn',    'LG190026', 'Logistics', 126, 1430, 6],
    ['Ngô Thị Bảo Châu',    'chau.nt@fquest.edu.vn',   'LG190027', 'Logistics', 114, 1380, 6],
    ['Phan Văn Kiên',       'kien.pv@fquest.edu.vn',   'LG190028', 'Logistics', 102, 1320, 6],
    // Level 5 (1000–1299 XP)
    ['Trương Thị Hồng',     'hong.tt@fquest.edu.vn',   'LG190029', 'Logistics',  95, 1260, 5],
    ['Lê Quang Minh',       'minh.lq@fquest.edu.vn',   'LG190030', 'Logistics',  88, 1190, 5],
    ['Nguyễn Thúy Linh',    'linh.nt@fquest.edu.vn',   'LG190031', 'Logistics',  80, 1130, 5],
    ['Phạm Văn Tài',        'tai.pv@fquest.edu.vn',    'LG190032', 'Logistics',  72, 1070, 5],
    ['Hoàng Mạnh Cường',    'cuong.hm@fquest.edu.vn',  'LG190033', 'Logistics',  65, 1010, 5],
    // Level 4 (700–999 XP)
    ['Vũ Ngọc Anh',         'anh.vn@fquest.edu.vn',    'LG190034', 'Logistics',  58,  960, 4],
    ['Bùi Thị Thu',         'thu.bt@fquest.edu.vn',    'LG190035', 'Logistics',  52,  900, 4],
    ['Đoàn Văn Phát',       'phat.dv@fquest.edu.vn',   'LG190036', 'Logistics',  46,  840, 4],
    ['Nguyễn Khánh Linh',   'linh.nk@fquest.edu.vn',   'LG190037', 'Logistics',  40,  780, 4],
    ['Trần Việt Dũng',      'dung.tv@fquest.edu.vn',   'LG190038', 'Logistics',  34,  730, 4],
    // Level 3 (450–699 XP)
    ['Lê Thị Diễm',         'diem.lt@fquest.edu.vn',   'LG190039', 'Logistics',  30,  680, 3],
    ['Võ Văn Khải',         'khai.vv@fquest.edu.vn',   'LG190040', 'Logistics',  26,  620, 3],
    ['Đỗ Thị Hà',           'ha.dt@fquest.edu.vn',     'LG190041', 'Logistics',  22,  560, 3],
    ['Hồ Trung Hiếu',       'hieu.ht@fquest.edu.vn',   'LG190042', 'Logistics',  18,  500, 3],
    ['Lưu Thị Thanh',       'thanh.lt@fquest.edu.vn',  'LG190043', 'Logistics',  15,  450, 3],
    ['Phạm Quốc Cường',     'cuong.pq@fquest.edu.vn',  'LG190044', 'Logistics',  12,  415, 2],
    // Level 2 (200–449 XP)
    ['Nguyễn Thị Xuân',     'xuan.nt@fquest.edu.vn',   'LG190045', 'Logistics',  10,  380, 2],
    ['Trần Văn Hải',        'hai.tv@fquest.edu.vn',    'LG190046', 'Logistics',   8,  330, 2],
    ['Lê Hoàng Phúc',       'phuc.lh@fquest.edu.vn',   'LG190047', 'Logistics',   6,  290, 2],
    ['Đặng Thị Kim',        'kim.dt@fquest.edu.vn',    'LG190048', 'Logistics',   5,  250, 2],
    ['Bùi Quang Trung',     'trung.bq@fquest.edu.vn',  'LG190049', 'Logistics',   4,  210, 2],
    // Level 1 (0–199 XP) - newbies
    ['Cao Thị Thùy',        'thuy.ct@fquest.edu.vn',   'LG200050', 'Logistics',   3,  180, 1],
    ['Đinh Văn Nam',        'nam.dv@fquest.edu.vn',    'LG200051', 'Logistics',   2,  145, 1],
    ['Nguyễn Thị Nhi',      'nhi.nt@fquest.edu.vn',   'LG200052', 'Logistics',   2,  110, 1],
    ['Phan Thế Anh',        'anh.pt@fquest.edu.vn',    'LG200053', 'Logistics',   1,   80, 1],
    ['Lý Thị Mai',          'mai.lt@fquest.edu.vn',    'LG200054', 'Logistics',   1,   60, 1],
    ['Trương Văn Bình',     'binh.tv@fquest.edu.vn',   'LG200055', 'Logistics',   1,   45, 1],
    ['Vũ Thị Hoa',          'hoa.vt@fquest.edu.vn',    'LG200056', 'Logistics',   0,   30, 1],
    ['Đoàn Minh Tuấn',      'tuan.dm@fquest.edu.vn',   'LG200057', 'Logistics',   0,   20, 1],
    ['Hoàng Thị Yến',       'yen.ht@fquest.edu.vn',    'LG200058', 'Logistics',   0,   10, 1],
    ['Lê Văn Sơn',          'son.lv@fquest.edu.vn',    'LG200059', 'Logistics',   0,    5, 1],
  ];

  const pw = hashPw('student123');
  for (const [name, email, student_id, major, coins, xp, level] of sampleStudents) {
    insertStudent.run(name, email, pw, student_id, major, coins, xp, level);
  }

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

  // ===== SUBMISSIONS FOR ALL STUDENTS =====
  // Mission IDs order: easy first (11 missions), medium (6), hard (2) = 19 total
  const missionOrder = [1,2,3,7,8,9,10,14,15,16,17,4,5,6,12,18,19,11,13];
  const subNotes = [
    'Đã hoàn thành thử thách', 'Chụp ảnh tại campus FPT', 'Bằng chứng rõ ràng',
    'Thực hiện thành công', 'Hoàn thành đúng yêu cầu', 'Check-in thành công',
    'Nhiệm vụ hoàn tất', 'Ảnh chụp rõ nét', 'Đã xác nhận', 'Hoàn thành xuất sắc',
  ];
  const subInsert = db.prepare(`INSERT OR IGNORE INTO submissions (user_id, mission_id, proof_image, note, status, reviewed_at) VALUES (?, ?, 'sample.jpg', ?, 'approved', CURRENT_TIMESTAMP)`);

  function missionCountForXP(xp) {
    if (xp >= 2500) return 19;
    if (xp >= 2200) return 17;
    if (xp >= 1900) return 15;
    if (xp >= 1600) return 12;
    if (xp >= 1300) return 10;
    if (xp >= 1000) return 7;
    if (xp >= 700)  return 5;
    if (xp >= 450)  return 3;
    if (xp >= 200)  return 2;
    if (xp >= 100)  return 1;
    return 0;
  }

  const allStudents = db.prepare(`SELECT id, xp FROM users WHERE role = 'student'`).all();
  for (const student of allStudents) {
    const count = missionCountForXP(student.xp);
    for (let i = 0; i < count; i++) {
      subInsert.run(student.id, missionOrder[i], subNotes[i % subNotes.length]);
    }
  }

  console.log('✅ F-QUEST database seeded successfully!');
}

module.exports = db;