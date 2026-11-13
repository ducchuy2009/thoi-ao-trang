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
  LATE_HOME: 20 * 60,        // NGÀY ĐI HỌC: 20:00 chưa có mặt ở nhà thì bố mẹ phiền lòng (trừ khi đã về rồi mới đi chơi tiếp, hoặc đã xin phép). Thứ 7, Chủ nhật, ngày nghỉ: về muộn thoải mái.
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

/* ---------- Đi lại trong thành phố ---------- */
// Bố cục: Khu phố nhà mình (trái) — Phố Hoa Phượng (giữa) — Trường (phải) · Bờ sông (dưới phố) · Ga tàu (trên phố) → tàu ra Biển · Núi (sau trường)
// Đi bộ qua ranh giới hai khu mất WALK_HOP phút; đi xe thì không mất thêm, lại chạy nhanh hơn (speed).
const WALK_HOP = 10, HILL_CLIMB = 10, PARK_FEE = 2000;
const VEHICLES = {
  bike: { name: 'Xe đạp', own: 'xedap', spr: 'bike', speed: 1.6, sol: [2, 10, 24, 8] },
  ebike: { name: 'Xe đạp điện', own: 'xedapdien', spr: 'ebike', speed: 2.1, sol: [2, 10, 28, 10] },
  moto: { name: 'Xe máy 50cc', own: 'xemay', spr: 'moto50', speed: 2.8, sol: [2, 10, 28, 10] },
};
// Xe bus: vé đồng giá, thời gian theo số chặng (pos: vị trí trên tuyến chính, off: chặng rẽ nhánh)
const BUS_FARE_CARD = 3000, BUS_FARE_NOCARD = 6000, BUS_PASS_PRICE = 50000, BUS_PASS_DAYS = 30;
const BUS_MIN_PER_HOP = 10, BUS_HOURS = [300, 1320];
const BUS_STOPS = {
  home: { name: 'Khu phố nhà mình', map: 'town', x: 684, y: 186, pos: 0, off: 0 },
  pho: { name: 'Phố Hoa Phượng', map: 'pho', x: 256, y: 184, pos: 1, off: 0 },
  truong: { name: 'Trường THPT Hoa Phượng', map: 'school', x: 182, y: 408, pos: 2, off: 0 },
  ga: { name: 'Ga tàu', map: 'ga', x: 458, y: 200, pos: 1, off: 1 },
};
const busMins = (a, b) => BUS_MIN_PER_HOP * Math.max(1, Math.abs(BUS_STOPS[a].pos - BUS_STOPS[b].pos) + BUS_STOPS[a].off + BUS_STOPS[b].off);
const PARENT_RIDE_MIN = 10;
// Tàu hoả: chỉ có tàu mới ra được biển
const TRAIN = { price: 15000, mins: 40, hours: [360, 1140], lastBack: 1260 };
const BEACH = { swim: { mins: 40, stam: 12, pts: 6 }, castle: { mins: 30, pts: 3, stam: 4 }, food: { price: 30000, mins: 20, stam: 30, friend: 8 }, rest: { mins: 30, stam: 15 }, shell: { mins: 10, perDay: 3 }, friend: 12 };
const SHELL_FRIEND = 6;
// Câu cá ở bờ sông (minigame giữ cá trong vùng xanh). diff: độ khó 1–5 · w: tỉ lệ gặp
const FISHING = { mins: 20, stam: 3, nothing: 0.15, momGift: 2 };
const FISH = [
  { id: 'ro', name: 'Cá rô', diff: 1, price: 6000, w: 34 }, { id: 'tre', name: 'Cá trê', diff: 2, price: 10000, w: 28 },
  { id: 'chep', name: 'Cá chép', diff: 3, price: 16000, w: 20 }, { id: 'loc', name: 'Cá lóc', diff: 4, price: 26000, w: 13 },
  { id: 'chinh', name: 'Cá chình', diff: 5, price: 48000, w: 5 },
];

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
}
const FOODS = {
  comhop: { name: 'Cơm hộp mẹ nấu', stam: 30 },
  banhmi: { name: 'Bánh mì', stam: 15 },
  sua: { name: 'Sữa hộp', stam: 8 },
  bimbim: { name: 'Bim bim Sao Vàng', stam: 5 },
};
const SHOP = [
  { id: 'banhmi', name: 'Bánh mì', price: 10000, desc: 'Ăn: +15 thể lực', inv: 'banhmi', n: 1 },
  { id: 'sua', name: 'Sữa hộp', price: 6000, desc: 'Uống: +8 thể lực', inv: 'sua', n: 1 },
  { id: 'bimbim', name: 'Bim bim Sao Vàng', price: 5000, desc: 'Ăn: +5 thể lực · trong gói có 1 thẻ cầu thủ', inv: 'bimbim', n: 1, pack: 1 },
  { id: 'bimbim5', name: 'Lốc 5 gói bim bim Sao Vàng', price: 23000, desc: '5 gói = 5 thẻ cầu thủ', inv: 'bimbim', n: 5, pack: 5 },
  { id: 'banhtrang', name: 'Bánh tráng trộn ×5', price: 25000, desc: 'Hàng để bán lại cho bạn trong giờ ra chơi', inv: 'banhtrang', n: 5 },
  { id: 'vethang', name: 'Vé tháng xe bus', price: BUS_PASS_PRICE, desc: 'Dùng 30 ngày kể từ ngày mua', special: 'vethang' },
  { id: 'daynhay', name: 'Dây nhảy', price: 60000, desc: 'Tập: +8 điểm Thể thao/buổi', own: 'daynhay' },
  { id: 'tatay', name: 'Tạ tay', price: 150000, desc: 'Tập: +12 điểm Thể thao/buổi', own: 'tatay' },
  { id: 'xadon', name: 'Xà đơn gắn cửa', price: 350000, desc: 'Tập: +16 điểm Thể thao/buổi', own: 'xadon' },
  { id: 'cancau', name: 'Cần câu', price: 80000, desc: 'Câu cá ở bờ sông (dưới phố Hoa Phượng)', own: 'cancau' },
  { id: 'xedap', name: 'Xe đạp', price: 400000, desc: 'Để ở sân nhà, bấm vào xe để đi · nhanh gấp 1,6 lần đi bộ', own: 'xedap' },
  { id: 'xedapdien', name: 'Xe đạp điện', price: 2500000, desc: 'Nhanh gấp 2,1 lần đi bộ', own: 'xedapdien' },
  { id: 'xemay', name: 'Xe máy 50cc', price: 6000000, desc: 'Nhanh gấp 2,8 lần đi bộ', own: 'xemay' },
];
const CANTEEN = [
  { name: 'Cơm trưa', price: 20000, stam: 30, mins: 20 },
  { name: 'Bánh mì', price: 10000, stam: 15, mins: 10 },
  { name: 'Nước mía', price: 5000, stam: 6, mins: 0 },
  { name: 'Bim bim Sao Vàng (kèm 1 thẻ cầu thủ)', price: 5000, stam: 5, mins: 0, pack: 1 },
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
  tttm: { name: 'Trốn ra trung tâm thương mại xem phim', verb: 'Đi xem phim', mins: 110, cost: 45000, leave: true, risk: 0.26, sev: 2, friend: 18, giaotiep: 3, stam: 12 },
  nui: { name: 'Cúp tiết leo núi sau trường', verb: 'Leo núi sau trường', mins: 80, leave: true, risk: 0.18, sev: 1, friend: 14, thethao: 4, stamCost: 10, day: true },
  cantin: { name: 'Cúp tiết ngồi lì dưới căn tin', verb: 'Ngồi căn tin', mins: 40, cost: 10000, leave: true, inside: true, risk: 0.30, sev: 1, friend: 9, giaotiep: 2, stam: 8 },
  thinghiem: { name: 'Làm thí nghiệm dởm trong phòng hoá', verb: 'Nghịch trong phòng hoá', mins: 20, risk: 0.30, sev: 2, friend: 14, th_hoa: 2 },
  hutthuoc: { name: 'Hút thuốc trong nhà vệ sinh', verb: 'Trốn trong nhà vệ sinh', mins: 10, risk: 0.35, sev: 3, friend: 15, stamCost: 8, thethao: -2, smoke: true },
};
// leave: không có mặt trong lớp (trốn tiết nếu trùng giờ học) · inside: vẫn ở trong khuôn viên trường · day: chỉ đi được khi trời còn sáng
// Sau giờ học / ngày nghỉ, các trò "leave" (trừ inside) chỉ là đi chơi bình thường: không ai bắt, không bị phạt (xem OUTING_FRIEND_RATE).
const OUTING_FRIEND_RATE = 0.75;   // đi chơi đàng hoàng thì ít "kỷ niệm liều lĩnh" hơn: điểm thân thiết × 0,75
const FRIEND_LIKES = { khoa: ['dabong', 'arcade', 'trasua', 'nui', 'cantin'], vy: ['trasua', 'thinghiem', 'tttm'], dat: ['hutthuoc', 'arcade', 'dabong', 'thinghiem', 'cantin'], ngan: ['trasua', 'tttm', 'arcade'] };
const INVITE_CHANCE = 0.2, INVITE_MAX_PER_DAY = 2;
const INVITE_TEXT = {
  trasua: '“Ê, trốn ra quán trà sữa đi, tớ khao… à mà thôi, chia đôi.”',
  dabong: '“Sân bóng bên kia đang thiếu người. Chuồn ra đá một trận không?”',
  arcade: '“Trung tâm thương mại mới có máy arcade. Trốn ra chơi tí đi!”',
  thinghiem: '“Phòng hoá đang không có ai. Vào trộn thử mấy lọ xem ra màu gì không?”',
  hutthuoc: '“Ra nhà vệ sinh làm một điếu không? Tớ có sẵn rồi.”',
  tttm: '“Rạp ở trung tâm thương mại đang chiếu phim mới. Trốn đi xem suất trưa không?”',
  nui: '“Lên núi sau trường hóng gió đi, trên đó mát lắm!”',
  cantin: '“Tiết sau chán lắm. Xuống căn tin ngồi với tớ đi.”',
};
// Khi BẠN chủ động rủ: bạn ấy có nhận lời không? (thích trò đó + càng thân thì càng dễ gật đầu)
const INVITE_ACCEPT = { like: 0.6, other: 0.3, perHeart: 0.08, freeBonus: 0.25 };

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
  khoa: { name: 'Khoa', note: 'Bạn cùng bàn', g: 'boy', seat: 'cùng bàn', duel: 'kha', bday: [0, 12] },
  vy: { name: 'Vy', note: 'Lớp phó học tập', g: 'girl', seat: 'bàn bên phải', duel: 'gà', bday: [1, 8] },
  dat: { name: 'Đạt', note: 'Cây văn nghệ của lớp', g: 'boy', seat: 'bàn dưới', duel: 'caothu', bday: [2, 20] },
  ngan: { name: 'Ngân', note: 'Bạn bàn bên, mê làm đẹp', g: 'girl', seat: 'bàn bên trái', duel: 'gà', bday: [0, 25] },
};
// Sinh nhật: [chỉ số mùa (0 Thu, 1 Đông, 2 Xuân, 3 Hè), ngày]. Hiện trên Lịch; hôm đó chúc mừng / tặng quà được cộng nhiều hơn.
const PARENT_BDAY = { mom: [1, 20], dad: [2, 12] };
const BDAY_FRIEND = 8, BDAY_PARENT = 4;
// Lễ hội — ĐỂ SẴN, sẽ định nghĩa sau: { season, day, name }. Lịch tự hiển thị.
const FESTIVALS = [];
const isDate = (d, day) => { const c = cal(day); return !!d && c.season === d[0] && c.dos === d[1]; };

/* ---------- Thiện cảm của thầy cô ---------- */
// 0–100 điểm, 20 điểm một cấp (0–5). Cấp 1 là bình thường.
// Mỗi cấp trên 1: bài kiểm tra được chấm nhẹ tay +0,15 điểm và nguy cơ bị bắt quay cóp giảm 6%.
const TEACHER = {
  start: 20, max: 100, perLv: 20,
  snitch: 8, snitchClass: 5, volunteer: 1, answer: 1, duty: 3, notebook: 1,
  caughtFun: -3, caughtSkip: -5, caughtCheat: -10, noNotebook: -1,
  gradePerLv: 0.15, cheatBase: 0.40, cheatPerLv: 0.06,
};
const TEACHER_TITLE = ['Bị thầy cô để ý', 'Bình thường', 'Có thiện cảm', 'Trò ngoan', 'Trò cưng', 'Được tin tuyệt đối'];
const teacherLvOf = pts => Math.max(0, Math.min(5, Math.floor((pts || 0) / TEACHER.perLv)));
// Quay cóp: trót lọt được cộng điểm, bị bắt thì bài bị trừ một nửa + trừ hạnh kiểm + mất thiện cảm thầy cô
const CHEAT = { min: 1.5, max: 2.5, vyBonus: 0.5, conduct: -1, parentCall: 0.5 };
// Tố cáo bạn rủ rê: được lòng thầy cô nhưng mất lòng bạn bè
const SNITCH = { friend: -15, others: -2, grudgeDays: 7, friendClass: -10 };
// Chủ động quay sang bạn TRONG GIỜ HỌC (chơi bài, con quay, đấu thẻ, xin ra ngoài đi vệ sinh…): mất tập trung và dễ bị cô bắt hơn giờ giải lao
const IN_CLASS = { delta: -2, riskAdd: 0.18, chat: { friend: 3, risk: 0.15 }, duelRisk: 0.2 };

/* ---------- Mượn sách khi quên (quay sang hỏi bạn) ---------- */
const BORROW = { deskmate: 0.35, other: 0.22, perHeart: 0.12, perTalk: 0.03, grudge: -0.5, scold: 0.15 };

/* ---------- Xin tiền bố mẹ đi chơi (sau khi đã về nhà) ---------- */
const OUTING = { base: 10000, perLv: 4000, perWeek: 2, chance: 0.45, perLvChance: 0.05 };

/* ---------- Giải lao giữa 2 tiết ---------- */
// g: giới tính nhân vật được rủ trò này (bạn cùng giới) · risk: nguy cơ bị giám thị / cô nhắc
const BREAK_FUN = {
  wc: { g: 'girl', name: 'Rủ đi vệ sinh chung', friend: 5, giaotiep: 1, risk: 0.08 },
  yoyo: { g: 'boy', name: 'Rủ chơi yoyo', friend: 4, kheotay: 1 },
  conquay: { g: 'boy', name: 'Rủ chơi con quay', friend: 4, kheotay: 1 },
  danhbai: { g: 'boy', name: 'Rủ đánh bài tiến lên', friend: 6, giaotiep: 1, risk: 0.14 },
};
const BREAK_FUN_MIN_HEARTS = 1, BREAK_FUN_PER_DAY = 2, BREAK_FUN_MINS = 10, BREAK_INVITE_CHANCE = 0.3;
const SHORT_BREAK_AFTER = [1, 3, 5, 7];   // sau các tiết này chỉ nghỉ 10' (ngồi tại lớp)

/* ---------- Sự kiện giờ nghỉ trưa & trong giờ học ---------- */
const LUNCH_EVENT_TIME = 680, LUNCH_EVENT_CHANCE = 0.55, CLASS_EVENT_CHANCE = 0.26;
const LIBRARY = { mins: 30, pts: 3, stam: 3 };
const NAP = { mins: 40, stam: 18 };

/* ---------- Địa điểm vui chơi ---------- */
// x, y: chỗ bạn bè đứng đợi khi đã hẹn · open: giờ mở cửa (phút)
const PLACES = {
  tea: { name: 'Tiệm trà sữa Mây', short: 'tiệm trà sữa', map: 'pho', x: 506, y: 140, open: [540, 1290] },
  mall: { name: 'TTTM Hoa Phượng Plaza', short: 'trung tâm thương mại', map: 'pho', x: 644, y: 140, open: [540, 1290] },
  arcade: { name: 'Khu game Arcade', short: 'khu game', map: 'pho', x: 800, y: 140, open: [540, 1320] },
  park: { name: 'Công viên', short: 'công viên', map: 'town', x: 380, y: 318, open: [360, 1290] },
  nui: { name: 'Núi sau trường', short: 'núi sau trường (picnic)', map: 'nui', x: 200, y: 298, open: [360, 1110] },
  bien: { name: 'Bãi biển', short: 'biển (đi tàu)', map: 'bien', x: 300, y: 160, open: [420, 1200] },
};
const PLACE_LIKES = { khoa: ['arcade', 'park', 'nui'], vy: ['tea', 'mall', 'nui'], dat: ['arcade', 'park', 'bien'], ngan: ['mall', 'tea', 'bien'] };
const MEET_END = 1290;            // bạn đợi tới 21:30
const HILL_HOURS = [360, 1110];   // 06:00–18:30: trời tối thì không lên núi
const MALL = { movie: { price: 45000, mins: 100, stam: 20, friend: 12 }, book: { price: 60000, pts: 10 }, box: { price: 30000, n: 5 }, chicken: { price: 35000, mins: 30, stam: 35, friend: 6 } };
const ARCADE = { claw: { price: 10000 }, cab: { price: 30000, mins: 60, stam: 8, friend: 10 }, dance: { price: 15000, mins: 20, stam: 6, pts: 3, friend: 5 } };
const TEA = { cup: { price: 25000, mins: 40, stam: 10, friend: 10 }, togo: { price: 15000, stam: 6 } };
const PICNIC = { mins: 90, base: 12, friend: 14 };
const GIFT_FRIEND = 10;           // tặng gấu bông gắp được

/* ---------- Thẻ cầu thủ sưu tầm (trong gói bim bim Sao Vàng) ---------- */
// r: độ hiếm 0 Thường · 1 Hiếm · 2 Siêu hiếm · 3 Huyền thoại. Đấu thẻ: chọn 1 lá + 1 chỉ số để so; thua mất lá, thắng lấy lá của đối thủ.
const CARD_RARITY = [
  { name: 'Thường', w: 62, col: '#8fa0ab' }, { name: 'Hiếm', w: 28, col: '#3b82c4' },
  { name: 'Siêu hiếm', w: 9, col: '#f2a93b' }, { name: 'Huyền thoại', w: 1, col: '#d9534f' },
];
const CARD_STATS = [['atk', 'Tấn công', 'TC'], ['def', 'Phòng thủ', 'PT'], ['spd', 'Tốc độ', 'TĐ']];
const CARD_POS = { tm: 'Thủ môn', hv: 'Hậu vệ', tv: 'Tiền vệ', td: 'Tiền đạo' };
const CARDS = [
  ['Tùng “Tay Nhện”', 'tm', 0, 2, 6, 3], ['Đức “Găng Sắt”', 'tm', 0, 1, 7, 3],
  ['Lâm “Lá Chắn”', 'hv', 0, 2, 6, 4], ['Hùng “Xe Ủi”', 'hv', 0, 3, 6, 2], ['Phong “Bóng Ma”', 'hv', 0, 3, 5, 5],
  ['Nam “Con Thoi”', 'tv', 0, 4, 4, 5], ['Quân “Nhạc Trưởng”', 'tv', 0, 5, 4, 3], ['Bảo “Máy Quét”', 'tv', 0, 3, 5, 4], ['Tài “Ong Thợ”', 'tv', 0, 4, 5, 4],
  ['Minh “Chớp”', 'td', 0, 5, 2, 6], ['Sơn “Búa Tạ”', 'td', 0, 6, 3, 2], ['Việt “Cáo Già”', 'td', 0, 6, 2, 4],
  ['Khánh “Người Nhện”', 'tm', 1, 2, 9, 5], ['Trung “Bức Tường”', 'hv', 1, 4, 9, 4], ['Hải “Mũi Khoan”', 'hv', 1, 6, 7, 7],
  ['Long “Phù Thuỷ”', 'tv', 1, 8, 5, 6], ['Kiên “La Bàn”', 'tv', 1, 7, 7, 5], ['Duy “Tia Chớp”', 'td', 1, 7, 3, 9], ['Thắng “Sát Thủ”', 'td', 1, 9, 3, 6],
  ['Vũ “Thần Giữ Cửa”', 'tm', 2, 3, 11, 7], ['Cường “Đá Tảng”', 'hv', 2, 6, 11, 6], ['An “Bậc Thầy”', 'tv', 2, 10, 8, 8], ['Hoàng “Vua Phá Lưới”', 'td', 2, 11, 5, 9],
  ['Rồng Vàng “Số 10 huyền thoại”', 'tv', 3, 12, 10, 11],
].map(([name, pos, r, atk, def, spd], i) => ({ id: 'c' + String(i + 1).padStart(2, '0'), no: i + 1, name, pos, r, atk, def, spd }));
const CARD_BY_ID = {}; for (const c of CARDS) CARD_BY_ID[c.id] = c;
// Tỉ lệ độ hiếm của lá bài đối thủ tung ra, theo trình của đối thủ
const DUEL_TIER = { 'gà': [72, 24, 4, 0], kha: [60, 30, 9, 1], caothu: [45, 35, 17, 3], lop: [65, 28, 6, 1] };
const CARD_SET_REWARD = 200000;

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
