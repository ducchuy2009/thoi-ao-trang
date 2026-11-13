'use strict';
/* ============================================================
 *  THỜI ÁO TRẮNG — 01. DỮ LIỆU & CẤU HÌNH
 *  Mọi con số cân bằng game nằm ở đây để dễ chỉnh.
 * ============================================================ */
const CFG = {
  TICK_MIN: 10,              // mỗi lần cập nhật giờ = 10 phút trong game
  TICK_SEC: 7,               // mặc định: 7 giây thực cho 10 phút game, giống Stardew Valley (chỉnh trong Cài đặt)
  DAY_START: 5 * 60,         // 05:00 thức dậy
  DAY_END: 27 * 60,          // 03:00 sáng hôm sau: buộc phải ngủ
  DAYS_PER_SEASON: 30,
  GATE_TIME: 8 * 60,         // đến trường đúng giờ = TRƯỚC 08:00
  PARENT_LEAVE: 7 * 60 + 30, // bố mẹ đi làm lúc 07:30
  RIDE_DEADLINE: 7 * 60 + 20,// nhờ bố/mẹ chở phải hỏi trước 07:20
  SCHOOL_END: 17 * 60,
  LATE_HOME: 20 * 60,        // về nhà sau 20:00 thì bố mẹ phiền lòng
  ORAL_AFTER_SCHOOLDAYS: 5,  // sau tuần học đầu tiên: có thể bị kiểm tra miệng
  P15_AFTER_SCHOOLDAYS: 10,  // sau tuần thứ 2: có thể bị kiểm tra 15' đột xuất
  START_MONEY: 50000,
  SLEEP_FROM: 18 * 60,
};

// Năm học bắt đầu từ mùa Thu. HK1: Thu → giữa Đông · HK2: nửa sau Đông → hết Xuân · sau đó nghỉ hè.
const SEASONS = [
  { id: 'thu', name: 'Thu', school: true },
  { id: 'dong', name: 'Đông', school: true },
  { id: 'xuan', name: 'Xuân', school: true },
  { id: 'he', name: 'Hè', school: false },   // nghỉ hè
];
const YEAR_DAYS = SEASONS.length * CFG.DAYS_PER_SEASON;
// Học kỳ tính theo "ngày trong năm" (0 = ngày 1 mùa Thu)
const SEMESTERS = [
  { id: 1, name: 'Học kỳ 1', from: 0, to: 44 },    // Thu 1 → Đông 15
  { id: 2, name: 'Học kỳ 2', from: 45, to: 89 },   // Đông 16 → Xuân 30
];
// Ngày lễ — ĐỂ SẴN, thêm/bớt tuỳ ý: season = chỉ số mùa (0 Thu, 1 Đông, 2 Xuân, 3 Hè)
const HOLIDAYS = [
  { season: 2, day: 1, name: 'Tết Nguyên Đán' },
  { season: 2, day: 2, name: 'Tết Nguyên Đán' },
  { season: 2, day: 3, name: 'Tết Nguyên Đán' },
];
const DOW = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

/* ---------- Môn học ---------- */
const SUBJ = {
  toan: { name: 'Toán', short: 'Toán', color: '#e2574c' },
  van: { name: 'Ngữ văn', short: 'Văn', color: '#c9862b' },
  anh: { name: 'Tiếng Anh', short: 'Anh', color: '#3b82c4' },
  ly: { name: 'Vật lý', short: 'Lý', color: '#7a5fc9' },
  hoa: { name: 'Hoá học', short: 'Hoá', color: '#2e9e86' },
  sinh: { name: 'Sinh học', short: 'Sinh', color: '#5aa83a' },
  su: { name: 'Lịch sử', short: 'Sử', color: '#a8643a' },
  dia: { name: 'Địa lý', short: 'Địa', color: '#3f8f6b' },
  td: { name: 'Thể dục', short: 'TD', color: '#d9742b', outdoor: true },
  qp: { name: 'Quốc phòng', short: 'QP', color: '#6f8440', outdoor: true },
  cc: { name: 'Chào cờ', short: 'C.cờ', color: '#d7352b', outdoor: true, nograde: true },
  shl: { name: 'Sinh hoạt lớp', short: 'SHL', color: '#5f6b7a', nograde: true },
};
// Buổi thực hành riêng (không chấm điểm sổ, cộng điểm THỰC HÀNH qua minigame)
Object.assign(SUBJ, {
  th_ly: { name: 'Thực hành Vật lý', short: 'TH Lý', color: '#7a5fc9', base: 'ly', lab: true, nograde: true },
  th_hoa: { name: 'Thực hành Hoá học', short: 'TH Hoá', color: '#2e9e86', base: 'hoa', lab: true, nograde: true },
  th_sinh: { name: 'Thực hành Sinh học', short: 'TH Sinh', color: '#5aa83a', base: 'sinh', lab: true, nograde: true },
  th_qp: { name: 'Thực hành Quốc phòng', short: 'TH QP', color: '#6f8440', base: 'qp', outdoor: true, nograde: true },
});
const GRADED = ['toan', 'van', 'anh', 'ly', 'hoa', 'sinh', 'su', 'dia', 'td', 'qp'];
const BOOK_SUBJ = ['toan', 'van', 'anh', 'ly', 'hoa', 'sinh', 'su', 'dia']; // môn cần sách + vở
const THEORY = ['toan', 'van', 'anh', 'ly', 'hoa', 'su', 'dia'];              // Lý thuyết = TB cấp các môn này
const PRACTICE = ['qp', 'th_ly', 'th_hoa', 'th_sinh'];                        // Thực hành = TB cấp: Quốc phòng + thực hành Lý, Hoá, Sinh
const statOfSubj = s => (s === 'td' ? 'thethao' : s === 'th_qp' ? 'qp' : s);

/* ---------- Thời khoá biểu (T2→T6, 4 tiết sáng + 5 tiết chiều) ---------- */
const TIMETABLE = [
  ['cc', 'toan', 'toan', 'van', 'anh', 'ly', 'hoa', 'su', 'td'],
  ['van', 'van', 'anh', 'toan', 'th_ly', 'sinh', 'dia', 'qp', 'th_qp'],
  ['toan', 'toan', 'hoa', 'anh', 'van', 'van', 'su', 'th_sinh', 'td'],
  ['ly', 'van', 'toan', 'dia', 'anh', 'th_hoa', 'sinh', 'van', 'toan'],
  ['van', 'toan', 'ly', 'hoa', 'anh', 'su', 'dia', 'td', 'shl'],
];
// Tiết 1 lúc 08:00; mỗi tiết 30', nghỉ 10'; sau mỗi 2 tiết ra chơi 20'; chiều bắt đầu 13:30
const PERIODS = [
  { n: 1, start: 480 }, { n: 2, start: 520 }, { n: 3, start: 570 }, { n: 4, start: 610 },
  { n: 5, start: 810 }, { n: 6, start: 850 }, { n: 7, start: 900 }, { n: 8, start: 940 }, { n: 9, start: 990 },
];
const PERIOD_LEN = 30;
// Khoảng thời gian học sinh ra sân (ra chơi 20', nghỉ trưa)
const YARD_WINDOWS = [[360, 480], [550, 570], [640, 810], [880, 900], [970, 990], [1020, 1060]];

/* ---------- Chỉ số ---------- */
// Chỉ số hỗ trợ: 10 level. Level 1 cần 50 điểm, mỗi level sau cần hơn level trước 20 điểm.
function lvlInfo(pts) {
  let lv = 0, need = 50, rem = Math.max(0, pts || 0);
  while (lv < 10 && rem >= need) { rem -= need; lv++; need += 20; }
  return { lv, cur: rem, need: lv >= 10 ? 0 : need, frac: lv >= 10 ? 0 : rem / need };
}
// Thể lực (chỉ số chính): 10 level, mỗi level +15 thể lực tối đa
function tlInfo(xp) {
  let lv = 1, need = 80, rem = Math.max(0, xp || 0);
  while (lv < 10 && rem >= need) { rem -= need; lv++; need += 80; }
  return { lv, cur: rem, need: lv >= 10 ? 0 : need, max: 100 + 15 * (lv - 1) };
}
// Tiền tiêu vặt (chỉ số chính): 10 cấp theo THIỆN CẢM của bố mẹ.
// Bố mẹ càng hài lòng thì tiền cho đầu tuần càng nhiều. Lên cấp càng cao càng cần nhiều thiện cảm.
const PARENT_MAX = 700;
const parentNeed = lv => 30 + 10 * (lv - 1);   // điểm cần để từ cấp lv lên cấp lv+1
function parentInfo(pts) {
  const p = Math.max(0, Math.min(PARENT_MAX, pts || 0)); let lv = 1, rem = p;
  while (lv < 10 && rem >= parentNeed(lv)) { rem -= parentNeed(lv); lv++; }
  return { lv, pts: p, cur: lv >= 10 ? 1 : rem, need: lv >= 10 ? 1 : parentNeed(lv), allowance: 20000 + 10000 * (lv - 1) };
}
const PARENT_TITLE = ['', 'Hay bị nhắc nhở', 'Tạm yên tâm', 'Ngoan ngoãn', 'Biết phụ giúp', 'Được tin tưởng', 'Con cưng', 'Niềm vui của bố mẹ', 'Niềm tự hào', 'Con nhà người ta', 'Bố mẹ hết lòng tin'];
// Điểm thiện cảm cộng / trừ
const PARENT = {
  start: 40, chat: 1, massage: 2, chore: 1, cook: 2, football: 2, goodScore: 2, badScore: -2,
  lateHome: -5, notHome: -10, teacherCall: -8, skipCall: -10, smoke: -15,
  hkTot: 3, hkYeu: -5, semGioi: 20, semKha: 8, semYeu: -15,
};
const STAT_NAMES = {
  toan: 'Toán', van: 'Văn', anh: 'Tiếng Anh', ly: 'Lý', hoa: 'Hoá', su: 'Sử', dia: 'Địa', sinh: 'Sinh học', qp: 'Quốc phòng',
  th_ly: 'TH Lý', th_hoa: 'TH Hoá', th_sinh: 'TH Sinh',
  thethao: 'Thể thao', buonban: 'Buôn bán', giaotiep: 'Giao tiếp', kheotay: 'Khéo tay',
};

/* ---------- Việc nhà ---------- */
const CHORES = {
  ruabat: { name: 'Rửa bát', mins: 10, pay: 3000, stam: 3, kt: 2 },
  quetnha: { name: 'Quét và lau nhà', mins: 30, pay: 15000, stam: 8, kt: 4 },
  nhoco: { name: 'Nhổ cỏ', mins: 40, pay: 30000, stam: 12, kt: 5 },
  ruaxe: { name: 'Rửa xe', mins: 60, pay: 50000, stam: 15, kt: 6 },
};

/* ---------- Tập thể dục ---------- */
const EXERCISES = [
  { id: 'tay', name: 'Hít đất, chạy tại chỗ (không đạo cụ)', pts: 5, need: null },
  { id: 'daynhay', name: 'Nhảy dây', pts: 8, need: 'daynhay' },
  { id: 'tatay', name: 'Tập tạ tay', pts: 12, need: 'tatay' },
  { id: 'xadon', name: 'Hít xà đơn', pts: 16, need: 'xadon' },
];
const EXERCISE_MIN = 20, EXERCISE_STAM = 12, EXERCISE_MAX_PER_DAY = 2;

/* ---------- Phương tiện đến trường ---------- */
const TRANSPORT = {
  walk: { name: 'Đi bộ', mins: 60, cost: 0 },
  bike: { name: 'Xe đạp', mins: 30, cost: 2000, own: 'xedap', fee: 'gửi xe' },
  ebike: { name: 'Xe đạp điện', mins: 20, cost: 2000, own: 'xedapdien', fee: 'gửi xe' },
  moto: { name: 'Xe máy', mins: 10, cost: 2000, own: 'xemay', fee: 'gửi xe' },
  bus: { name: 'Xe bus', mins: 20, cost: 3000 },   // 3.000 có thẻ HS, 6.000 không thẻ, vé tháng 50.000
  mom: { name: 'Bố mẹ chở', mins: 10, cost: 0 },
};
const BUS_FARE_CARD = 3000, BUS_FARE_NOCARD = 6000, BUS_PASS_PRICE = 50000, BUS_PASS_DAYS = 30;

/* ---------- Vật phẩm ---------- */
const ITEMS = {
  hopbut: { name: 'Hộp bút', desc: 'Không có bút thì coi như không có vở.' },
  thehs: { name: 'Thẻ học sinh', desc: 'Vé xe bus còn 3.000đ.' },
  vethang: { name: 'Vé tháng xe bus', desc: 'Đi bus miễn phí khi còn hạn.' },
  dp_td: { name: 'Đồng phục thể dục', desc: 'Cần cho tiết Thể dục.' },
  dp_qp: { name: 'Đồ quốc phòng', desc: 'Áo lính cho tiết Quốc phòng.' },
};
for (const s of BOOK_SUBJ) {
  ITEMS['sach_' + s] = { name: 'Sách ' + SUBJ[s].short, subj: s, kind: 'sach' };
  ITEMS['vo_' + s] = { name: 'Vở ' + SUBJ[s].short, subj: s, kind: 'vo' };
}
const FOODS = {
  comhop: { name: 'Cơm hộp mẹ nấu', stam: 30 },
  banhmi: { name: 'Bánh mì', stam: 15 },
  sua: { name: 'Sữa hộp', stam: 8 },
};
const SHOP = [
  { id: 'banhmi', name: 'Bánh mì', price: 10000, desc: 'Ăn: +15 thể lực', inv: 'banhmi', n: 1 },
  { id: 'sua', name: 'Sữa hộp', price: 6000, desc: 'Uống: +8 thể lực', inv: 'sua', n: 1 },
  { id: 'banhtrang', name: 'Bánh tráng trộn ×5', price: 25000, desc: 'Hàng để bán lại cho bạn trong giờ ra chơi', inv: 'banhtrang', n: 5 },
  { id: 'vethang', name: 'Vé tháng xe bus', price: BUS_PASS_PRICE, desc: 'Dùng 30 ngày kể từ ngày mua', special: 'vethang' },
  { id: 'daynhay', name: 'Dây nhảy', price: 60000, desc: 'Tập: +8 điểm Thể thao/buổi', own: 'daynhay' },
  { id: 'tatay', name: 'Tạ tay', price: 150000, desc: 'Tập: +12 điểm Thể thao/buổi', own: 'tatay' },
  { id: 'xadon', name: 'Xà đơn gắn cửa', price: 350000, desc: 'Tập: +16 điểm Thể thao/buổi', own: 'xadon' },
  { id: 'xedap', name: 'Xe đạp', price: 400000, desc: 'Đến trường 30 phút', own: 'xedap' },
  { id: 'xedapdien', name: 'Xe đạp điện', price: 2500000, desc: 'Đến trường 20 phút', own: 'xedapdien' },
  { id: 'xemay', name: 'Xe máy 50cc', price: 6000000, desc: 'Đến trường 10 phút', own: 'xemay' },
];
const CANTEEN = [
  { name: 'Cơm trưa', price: 20000, stam: 30, mins: 20 },
  { name: 'Bánh mì', price: 10000, stam: 15, mins: 10 },
  { name: 'Nước mía', price: 5000, stam: 6, mins: 0 },
];
const TUTOR = { price: 50000, mins: 90, pts: 12, stam: 10 };
const SELF_STUDY = { mins: 60, pts: 5, stam: 8 };
const PART_TIME = { mins: 120, pay: 30000, payPerLv: 3000, pts: 10, stam: 12 };
const SELL = { cost: 5000, price: 8000, pricePerLv: 500, baseChance: 0.45, caught: 0.07 };

/* ---------- Làm việc riêng trong giờ học (sev: 1 nhẹ, 2 nặng) ---------- */
const CLASS_FUN_CHANCE = 0.22;
const CLASS_FUN = [
  { id: 'banhtrang', text: 'chìa bịch bánh tráng trộn dưới gầm bàn: “Ăn không?”', join: 'Ăn vụng', risk: 0.22, sev: 1, friend: 4, stam: 4 },
  { id: 'tam', text: 'quay sang thì thầm kể chuyện hôm qua', join: 'Tám chuyện', risk: 0.18, sev: 1, friend: 4, giaotiep: 2 },
  { id: 'game', text: 'rủ chơi game trên điện thoại dưới gầm bàn', join: 'Chơi game', risk: 0.38, sev: 2, friend: 6, stam: 3 },
  { id: 'video', text: 'mở video hài rồi đưa cho một bên tai nghe', join: 'Xem video', risk: 0.33, sev: 2, friend: 5, stam: 3 },
];

/* ---------- Quậy cùng bạn ở trường (sev: 1 nhẹ → 3 rất nặng) ---------- */
// leave: rời khỏi trường (trốn tiết nếu trùng giờ học). Càng rủi ro thì điểm tình bạn càng nhiều.
const MISCHIEF = {
  trasua: { name: 'Trốn ra ngoài uống trà sữa', verb: 'Đi uống trà sữa', mins: 60, cost: 25000, leave: true, risk: 0.20, sev: 1, friend: 12, giaotiep: 4, stam: 10 },
  dabong: { name: 'Trốn ra sân bóng gần trường', verb: 'Đi đá bóng', mins: 60, leave: true, risk: 0.20, sev: 1, friend: 12, thethao: 6, stamCost: 15 },
  arcade: { name: 'Trốn ra trung tâm thương mại chơi arcade', verb: 'Đi chơi arcade', mins: 90, cost: 30000, leave: true, risk: 0.28, sev: 2, friend: 16, giaotiep: 4, stam: 6 },
  thinghiem: { name: 'Làm thí nghiệm dởm trong phòng hoá', verb: 'Nghịch trong phòng hoá', mins: 20, risk: 0.30, sev: 2, friend: 14, th_hoa: 2 },
  hutthuoc: { name: 'Hút thuốc trong nhà vệ sinh', verb: 'Trốn trong nhà vệ sinh', mins: 10, risk: 0.35, sev: 3, friend: 15, stamCost: 8, thethao: -2, smoke: true },
};
const FRIEND_LIKES = { khoa: ['dabong', 'arcade', 'trasua'], vy: ['trasua', 'thinghiem', 'arcade'], dat: ['hutthuoc', 'arcade', 'dabong', 'thinghiem'] };
const INVITE_CHANCE = 0.2, INVITE_MAX_PER_DAY = 2;
const INVITE_TEXT = {
  trasua: '“Ê, trốn ra quán trà sữa đi, tớ khao… à mà thôi, chia đôi.”',
  dabong: '“Sân bóng bên kia đang thiếu người. Chuồn ra đá một trận không?”',
  arcade: '“Trung tâm thương mại mới có máy arcade. Trốn ra chơi tí đi!”',
  thinghiem: '“Phòng hoá đang không có ai. Vào trộn thử mấy lọ xem ra màu gì không?”',
  hutthuoc: '“Ra nhà vệ sinh làm một điếu không? Tớ có sẵn rồi.”',
};

/* ---------- Buổi thực hành (minigame kiểu câu cá) ---------- */
const PRACTICALS = {
  th_ly: { stat: 'th_ly', title: 'Thí nghiệm Vật lý', task: 'Giữ kim ampe kế nằm trong vùng xanh để đo cho chuẩn', icon: 'kim' },
  th_hoa: { stat: 'th_hoa', title: 'Pha chế trong phòng Hoá', task: 'Giữ nhiệt độ dung dịch trong vùng an toàn', icon: 'nhiet' },
  th_sinh: { stat: 'th_sinh', title: 'Soi mẫu vật dưới kính hiển vi', task: 'Giữ mẫu vật nằm trong vùng lấy nét', icon: 'mau' },
  th_qp: { stat: 'qp', title: 'Tháo lắp súng AK mô hình, lắp lựu đạn tập', task: 'Giữ đúng nhịp thao tác trong vùng xanh', icon: 'nhip' },
};
const DIFF_WEIGHTS = [0.15, 0.30, 0.30, 0.18, 0.07];   // xác suất độ khó 1–5 sao
// Hoàn thành ở độ khó càng cao càng được nhiều điểm thực hành
const practicalReward = (d, win, perfect) => (win ? 3 + 3 * d + (perfect ? 2 : 0) : 2);

/* ---------- Hệ số điểm ---------- */
const COEF = { mieng: 1, p15: 1, tiet: 2, thi: 3 };
const TEST_NAME = { mieng: 'Kiểm tra miệng', p15: "Kiểm tra 15'", tiet: 'Kiểm tra 1 tiết', thi: 'Thi học kỳ' };
const TEST_DIFF = { mieng: 0.3, p15: 0, tiet: -0.3, thi: -0.5 };

/* ---------- Bạn bè ---------- */
const FRIENDS = {
  khoa: { name: 'Khoa', note: 'Bạn cùng bàn' },
  vy: { name: 'Vy', note: 'Lớp phó học tập' },
  dat: { name: 'Đạt', note: 'Cây văn nghệ của lớp' },
};

/* ---------- Tiện ích lịch & định dạng ---------- */
function cal(day) {
  const doy = ((day % YEAR_DAYS) + YEAR_DAYS) % YEAR_DAYS;
  const season = Math.floor(doy / CFG.DAYS_PER_SEASON);
  return { day, year: Math.floor(day / YEAR_DAYS), doy, season, dos: doy % CFG.DAYS_PER_SEASON + 1, dow: ((day % 7) + 7) % 7, sName: SEASONS[season].name };
}
function holidayOf(day) { const c = cal(day); return HOLIDAYS.find(h => h.season === c.season && h.day === c.dos) || null; }
function isSchoolDay(day) { const c = cal(day); return SEASONS[c.season].school && c.dow < 5 && !holidayOf(day); }
function semOf(day) { const d = cal(day).doy; return SEMESTERS.find(s => d >= s.from && d <= s.to) || null; }
function semKey(day) { const s = semOf(day); return s ? cal(day).year + '-' + s.id : null; }
function dateLabel(day) { const c = cal(day); return `${DOW[c.dow]}, ${c.dos} ${c.sName}`; }

const fmtMoney = n => (n < 0 ? '-' : '') + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
const fmtTime = m => { const h = Math.floor(m / 60) % 24, mm = m % 60; return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
const fmtScore = s => (s === null || s === undefined || isNaN(s)) ? '–' : (Math.round(s * 100) / 100).toString().replace('.', ',');
const fmtAvg = s => (s === null || s === undefined || isNaN(s)) ? '–' : s.toFixed(1).replace('.', ',');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ---------- Xếp loại ---------- */
// Học lực: ĐTB + điều kiện Toán hoặc Văn
function hocLuc(avg, toan, van) {
  if (avg === null || avg === undefined) return '–';
  const mx = Math.max(toan || 0, van || 0);
  if (avg >= 8 && mx >= 8) return 'Giỏi';
  if (avg >= 6 && mx >= 6) return 'Khá';
  if (avg >= 4 && mx >= 4) return 'Trung bình';
  return 'Yếu';
}
function hanhKiem(p) {
  if (p === null || p === undefined) return '–';
  if (p >= 8) return 'Tốt'; if (p >= 6) return 'Khá'; if (p >= 4) return 'Trung bình'; return 'Yếu';
}
