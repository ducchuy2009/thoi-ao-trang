'use strict';
/* ============================================================
 *  THỜI ÁO TRẮNG — 01. DỮ LIỆU & CẤU HÌNH
 *  Mọi con số cân bằng game nằm ở đây để dễ chỉnh.
 * ============================================================ */
const CFG = {
  TICK_MIN: 10,              // mỗi lần cập nhật giờ = 10 phút trong game
  TICK_SEC: 7,               // mặc định: 7 giây thực cho 10 phút game, giống Stardew Valley (chỉnh trong Cài đặt)
  DAY_START: 6 * 60,         // 06:00 thức dậy
  DAY_END: 27 * 60,          // 03:00 sáng hôm sau: buộc phải ngủ
  DAYS_PER_SEASON: 30,
  GATE_TIME: 8 * 60,         // đến trường đúng giờ = TRƯỚC 08:00
  PARENT_LEAVE: 7 * 60 + 30, // bố mẹ đi làm lúc 07:30
  RIDE_DEADLINE: 7 * 60 + 20,// nhờ bố/mẹ chở phải hỏi trước 07:20
  SCHOOL_END: 17 * 60,       // tan học 17:00 (cứ 2 tiết thì ra chơi 30')
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
// Học tập = TB cấp các môn. Mỗi môn MỘT chỉ số: môn chỉ có lý thuyết cộng khi ngồi học trên lớp; môn có thực hành (Lý, Hoá, Sinh, Quốc phòng)
// thì tiết lý thuyết lẫn tiết thực hành đều cộng chung vào chỉ số của môn đó. Thể dục dùng chỉ số Thể thao.
const STUDY_SUBJ = ['toan', 'van', 'anh', 'ly', 'hoa', 'sinh', 'su', 'dia', 'qp'];
const statOfSubj = s => (s === 'td' ? 'thethao' : SUBJ[s] && SUBJ[s].base ? SUBJ[s].base : s);

/* ---------- Thời khoá biểu (T2→T6, 4 tiết sáng + 5 tiết chiều) ----------
 * null = không có tiết: thứ 4 và thứ 6 chỉ học buổi sáng (chiều nghỉ, tan học lúc nghỉ trưa) */
const TIMETABLE = [
  ['cc', 'toan', 'toan', 'van', 'anh', 'ly', 'hoa', 'su', 'td'],
  ['van', 'van', 'anh', 'toan', 'th_ly', 'sinh', 'dia', 'qp', 'th_qp'],
  ['toan', 'toan', 'hoa', 'anh', null, null, null, null, null],
  ['ly', 'van', 'toan', 'dia', 'th_hoa', 'sinh', 'th_sinh', 'td', 'shl'],
  ['van', 'toan', 'su', 'van', null, null, null, null, null],
];
const HALF_DAYS = [2, 4];                        // thứ 4, thứ 6: nghỉ buổi chiều
// Tiết 1 lúc 08:00; mỗi tiết 30', hai tiết học liền nhau rồi ra chơi 30'; nghỉ trưa 10:30–13:30; tan học 17:00
const PERIODS = [
  { n: 1, start: 480 }, { n: 2, start: 510 }, { n: 3, start: 570 }, { n: 4, start: 600 },
  { n: 5, start: 810 }, { n: 6, start: 840 }, { n: 7, start: 900 }, { n: 8, start: 930 }, { n: 9, start: 990 },
];
const PERIOD_LEN = 30;
const AM_END = 630, PM_START = 810;             // nghỉ trưa
// Khoảng thời gian học sinh ra sân (trước giờ học, ra chơi 30', nghỉ trưa, tan học)
const YARD_WINDOWS = [[360, 480], [540, 570], [AM_END, PM_START], [870, 900], [960, 990], [CFG.SCHOOL_END, CFG.SCHOOL_END + 40]];
const INVITE_TIMES = [540, AM_END, 870, 960];   // đầu giờ ra chơi: bạn có thể rủ rê
const AFTER_SCHOOL = CFG.SCHOOL_END + 20;       // bạn bè rời trường (ra công viên, tới chỗ hẹn)

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
  thethao: 'Thể thao', buonban: 'Buôn bán', kheotay: 'Khéo tay', vannghe: 'Văn nghệ',
};

/* ---------- Việc nhà ---------- */
// Tiền công việc nhà (cũng như phụ bán, việc thầy cô nhờ) được cộng dồn và trả vào cuối ngày
const CHORES = {
  ruabat: { name: 'Rửa bát', mins: 10, pay: 2000, stam: 3, kt: 2 },
  quetnha: { name: 'Quét và lau nhà', mins: 30, pay: 5000, stam: 8, kt: 4 },
  nhoco: { name: 'Nhổ cỏ', mins: 40, pay: 7000, stam: 12, kt: 5 },
  ruaxe: { name: 'Rửa xe', mins: 60, pay: 10000, stam: 15, kt: 6 },
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
  pho: { name: 'Phố Hoa Phượng', map: 'pho', x: 276, y: 186, pos: 1, off: 0 },
  truong: { name: 'Trường THPT Hoa Phượng', map: 'school', x: 182, y: 456, pos: 2, off: 0 },
  ga: { name: 'Ga tàu', map: 'ga', x: 458, y: 200, pos: 1, off: 1 },
  dong: { name: 'Phố Bờ Đông', map: 'dong', x: 320, y: 196, pos: 2, off: 1 },
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
// Đồ ăn uống mua về đều cất vào túi; cầm lên rồi bấm vào mình để ăn, bấm vào người khác để tặng
// stam: thể lực hồi · drink: đồ uống · pack: trong gói có thẻ cầu thủ · duo: ăn cùng bạn đang đi chung thì có hoạt cảnh (khoá DUO) · gift: điểm thân thiết khi tặng bạn
const FOODS = {
  comhop: { name: 'Cơm hộp mẹ nấu', stam: 30, gift: 3 },
  banhmi: { name: 'Bánh mì', stam: 15, gift: 2 },
  sua: { name: 'Sữa hộp', stam: 8, drink: true, gift: 2 },
  bimbim: { name: 'Bim bim Sao Vàng', stam: 5, pack: 1, gift: 2 },
  comtrua: { name: 'Cơm trưa căn tin', stam: 30, gift: 3 },
  nuocmia: { name: 'Nước mía', stam: 6, drink: true, gift: 2 },
  trasua: { name: 'Trà sữa trân châu', stam: 12, drink: true, duo: 'tea', gift: 5 },
  tradao: { name: 'Trà đào', stam: 6, drink: true, gift: 4 },
  xien: { name: 'Xiên que', stam: 12, duo: 'xien', gift: 3 },
  kem: { name: 'Kem ốc quế', stam: 8, duo: 'kem', gift: 4 },
  garan: { name: 'Gà rán', stam: 35, duo: 'chicken', gift: 6 },
  haisan: { name: 'Hải sản nướng', stam: 30, duo: 'seafood', gift: 5 },
  banhnuong: { name: 'Bánh nướng Trung thu', stam: 18, gift: 6 },
  banhdeo: { name: 'Bánh dẻo Trung thu', stam: 14, gift: 5 },
  buoi: { name: 'Múi bưởi', stam: 6, gift: 3 },
  banhchung: { name: 'Bánh chưng rán', stam: 20, gift: 4 },
  xoi: { name: 'Xôi gấc', stam: 15, gift: 3 },
  keobong: { name: 'Kẹo bông', stam: 6, gift: 4 },
};
const SHOP = [
  { id: 'banhmi', name: 'Bánh mì', price: 10000, desc: 'Bánh mì kẹp, ăn lót dạ', inv: 'banhmi', n: 1 },
  { id: 'sua', name: 'Sữa hộp', price: 6000, desc: 'Hộp sữa nhỏ mang theo', inv: 'sua', n: 1 },
  { id: 'bimbim', name: 'Bim bim Sao Vàng', price: 5000, desc: 'Mở gói ra là có 1 thẻ cầu thủ', inv: 'bimbim', n: 1 },
  { id: 'bimbim5', name: 'Lốc 5 gói bim bim Sao Vàng', price: 23000, desc: '5 gói, mỗi gói 1 thẻ cầu thủ', inv: 'bimbim', n: 5 },
  { id: 'banhtrang', name: 'Bánh tráng trộn ×5', price: 25000, desc: 'Hàng để bán lại cho bạn trong giờ ra chơi', inv: 'banhtrang', n: 5 },
  { id: 'vethang', name: 'Vé tháng xe bus', price: BUS_PASS_PRICE, desc: 'Dùng 30 ngày kể từ ngày mua', special: 'vethang' },
  { id: 'cancau', name: 'Cần câu', price: 80000, desc: 'Câu cá ở bờ sông (dưới phố Hoa Phượng)', own: 'cancau' },
  { id: 'xedap', name: 'Xe đạp', price: 400000, desc: 'Để ở sân nhà, bấm vào xe để đi', own: 'xedap' },
  { id: 'xedapdien', name: 'Xe đạp điện', price: 2500000, desc: 'Chạy nhanh hơn xe đạp', own: 'xedapdien' },
  { id: 'xemay', name: 'Xe máy 50cc', price: 6000000, desc: 'Chạy nhanh nhất', own: 'xemay' },
];
const CANTEEN = [
  { id: 'comtrua', name: 'Cơm trưa', price: 20000, inv: 'comtrua', desc: 'Hộp cơm nóng, cất vào túi ăn dần' },
  { id: 'banhmi', name: 'Bánh mì', price: 10000, inv: 'banhmi', desc: 'Cất vào túi ăn dần' },
  { id: 'nuocmia', name: 'Nước mía', price: 5000, inv: 'nuocmia', desc: 'Ly nước mía mát lạnh' },
  { id: 'bimbim', name: 'Bim bim Sao Vàng', price: 5000, inv: 'bimbim', desc: 'Mở gói ra là có 1 thẻ cầu thủ' },
];
/* ---------- Gian hàng trong TTTM ---------- */
// [id, tên, sprite]. Hàng của từng gian: own = mua một lần (để ở nhà); act = làm ngay tại chỗ
const MALL_STALLS = [['phim', 'Rạp phim', 'stA'], ['sach', 'Nhà sách', 'stB'], ['sieuthi', 'Siêu thị', 'stC'], ['anuong', 'Ăn uống', 'stD'], ['noithat', 'Nội thất', 'stE'], ['nhaccu', 'Nhạc cụ', 'stF'], ['thethao', 'Thể thao', 'stG']];
const MALL_GOODS = {
  phim: [{ id: 'vephim', name: 'Vé xem phim', price: 45000, desc: 'Vào rạp xem một suất phim', act: 'movie' }],
  sach: [{ id: 'sachtk', name: 'Sách tham khảo', price: 60000, desc: 'Chọn một môn để đọc thêm (mỗi ngày một cuốn)', act: 'book' }],
  sieuthi: [{ id: 'bimbim', name: 'Bim bim Sao Vàng', price: 5000, desc: 'Mở gói ra là có 1 thẻ cầu thủ', inv: 'bimbim' }, { id: 'hopthe', name: 'Hộp thẻ đặc biệt', price: 30000, desc: '5 thẻ, chắc chắn có thẻ Hiếm trở lên', act: 'box' }, { id: 'banhmi', name: 'Bánh mì', price: 10000, desc: 'Mang theo ăn dần', inv: 'banhmi' }, { id: 'sua', name: 'Sữa hộp', price: 6000, desc: 'Mang theo uống dần', inv: 'sua' }],
  anuong: [{ id: 'garan', name: 'Gà rán', price: 35000, desc: 'Hộp gà rán giòn, cất vào túi', inv: 'garan' }, { id: 'trasua', name: 'Trà sữa', price: 25000, desc: 'Ly trà sữa trân châu, cất vào túi', inv: 'trasua' }],
  noithat: [{ id: 'd_poster', name: 'Tấm áp phích', price: 40000, desc: 'Dán tường phòng ngủ', own: 'd_poster' }, { id: 'd_den', name: 'Đèn cây', price: 90000, desc: 'Đặt ở góc phòng ngủ', own: 'd_den' }, { id: 'd_cay', name: 'Chậu cây cảnh', price: 60000, desc: 'Đặt trong phòng ngủ', own: 'd_cay' }, { id: 'd_tham', name: 'Thảm trải sàn', price: 120000, desc: 'Trải giữa phòng ngủ', own: 'd_tham' }],
  nhaccu: [{ id: 'micro', name: 'Micro karaoke', price: 150000, desc: 'Để trong phòng ngủ, tập hát ở nhà', own: 'micro' }, { id: 'guitar', name: 'Đàn guitar', price: 400000, desc: 'Dựng trong phòng ngủ; có đàn tập hát vào hơn', own: 'guitar' }],
  thethao: [{ id: 'daynhay', name: 'Dây nhảy', price: 60000, desc: 'Dụng cụ tập thể dục ở nhà', own: 'daynhay' }, { id: 'tatay', name: 'Tạ tay', price: 150000, desc: 'Dụng cụ tập thể dục ở nhà, nặng hơn dây nhảy', own: 'tatay' }, { id: 'xadon', name: 'Xà đơn gắn cửa', price: 350000, desc: 'Dụng cụ tập thể dục ở nhà, khó nhất', own: 'xadon' }],
};
const DECOR_SLEEP = 2;        // mỗi món trang trí phòng: ngủ dậy hồi thêm chừng này thể lực
/* ---------- Khu game: chơi bằng xèng ---------- */
const TOKENS = { price: 10000, n: 5 };
const MACHINES = { claw: 2, fight: 2, slot: 1, race: 2, dance: 2 };   // số xèng mỗi lượt
/* ---------- Phòng nhạc / tập ở nhà ---------- */
const MUSIC = { perDay: 3, stam: 6, mins: 20, base: 2, bonus: 6, homeBase: 1, homeBonus: 4 };   // điểm Văn nghệ = base + bonus × điểm mini-game
/* ---------- Nhà bạn ---------- */
const FRIEND_HOME_HEARTS = 2, FRIEND_ROOM_HEARTS = 4, PHONE_HEARTS = 1;
const FH = { tv: { mins: 30, friend: 5 }, game: { mins: 40, friend: 8 } };
/* ---------- Tụ chơi giờ ra chơi / nghỉ trưa ---------- */
// game: mini-game khi xin chơi cùng · n: số người · sport: cộng Thể thao
const YARD_GAMES = {
  chat: { name: 'tám chuyện', n: 3 }, eat: { name: 'ăn trưa', n: 2 },
  dauthe: { name: 'đấu thẻ cầu thủ', n: 3 },
  danhbai: { name: 'đánh bài', n: 3, game: 'arrows', what: 'Ra bài' }, conquay: { name: 'chọi con quay', n: 3, game: 'arrows', what: 'Quấn dây, giật con quay' },
  rongran: { name: 'rồng rắn lên mây', n: 4, game: 'arrows', what: 'Lượn theo đầu rồng' }, trontim: { name: 'trốn tìm', n: 3, game: 'seek' },
  duoibat: { name: 'đuổi bắt', n: 3, game: 'arrows', what: 'Né trái né phải', sport: 1 }, dabong: { name: 'đá bóng', n: 3, game: 'keepup', sport: 2 }, dacau: { name: 'đá cầu', n: 3, game: 'keepup', sport: 2 },
};
const YARD_JOIN = { friend: 3, bonus: 4, mins: 10 };
/* ---------- Thể lực trong giờ học ---------- */
const LESSON_STAM = 6;        // mỗi tiết lý thuyết tốn chừng này thể lực; hết thể lực thì ngất trong lớp, được đưa xuống trạm y tế
const FAINT = { at: 2, rest: 60, stam: 0.4 };
// Đi ngủ sau 02:00 (late) → hôm sau 3 tiết cuối mỗi tiết có thể ngủ gục (chance + step × thứ tự tiết trong 3 tiết cuối), dù đã ăn sáng
const LATE_NIGHT = { late: 26 * 60, chance: 0.35, step: 0.15 };   // at: thể lực từ mức này trở xuống khi vào tiết là ngất · rest: phút nằm trạm y tế · stam: tỉ lệ thể lực hồi lại
const INFIRM = { mins: 30, stam: 15 };          // tự xuống trạm y tế nằm nghỉ
const SMOKE = { mins: 10, stam: 12, risk: 0.3, perDay: 2, conduct: 1.5 };   // trốn trong buồng vệ sinh hút thuốc: hồi thể lực nhưng dễ bị giám thị bắt
const TUTOR = { price: 50000, mins: 90, pts: 12, stam: 10 };
const SELF_STUDY = { mins: 60, pts: 5, stam: 8 };
const PART_TIME = { mins: 120, pay: 20000, payPerLv: 2000, pts: 10, stam: 12 };
const SELL = { cost: 5000, price: 8000, pricePerLv: 500, baseChance: 0.45, caught: 0.07 };
// Bán đồ cho bạn: đồ ăn mang theo và thẻ cầu thủ (giá thẻ theo độ hiếm)
const SELL_FOOD = { bimbim: 7000, banhmi: 13000, sua: 8000 };
const SELL_CARD = [3000, 9000, 25000, 80000];

/* ---------- Việc thầy cô nhờ (bảng thông báo ở sân trường, cạnh căn tin) ----------
 * Mỗi ngày học thầy cô dán việc lên bảng; chỉ việc mình bấm "Nhận việc" mới vào danh sách nhiệm vụ.
 * steps: các chỗ phải tới (1–2 chỗ: lấy đồ → mang tới) { map, x, y, do: việc làm ở đó, where: tên chỗ, win?: khung giờ riêng }
 * mins: tổng thời gian làm · win: khung giờ làm được · days: số ngày từ lúc dán tới hạn chót · until: giờ hạn chót của ngày cuối
 * pay: tiền công (trả cuối ngày) · aff: điểm thân thiết với thầy cô · stat: [chỉ số, điểm] */
const TASK_BOARD = { open: 3, maxActive: 3, failAff: -3, dropAff: -1, stam: 4 };
// Mỗi ngày chỉ 0–2 lời nhờ mới (thầy cô dán bảng / bố mẹ nhắn / bạn bè, anh chị đăng nhóm): quota = số lời nhờ trong ngày, xác suất theo QUOTA_P
// Làm xong luôn được thêm thân thiết với người nhờ; tiền công thì có lúc có lúc không (payChance)
const TASK_QUOTA = { p: [0.25, 0.45, 0.30], payChance: 0.5 };
const TASKS = {
  xepsach: { tid: 'lan', name: 'Xếp lại sách thư viện', desc: 'Sau giờ đọc, các kệ sách bị xáo trộn hết. Cô cần một bạn xếp lại sách theo từng môn.', steps: [{ map: 'thuvien', x: 92, y: 48, do: 'Xếp sách lên kệ theo môn', where: 'Thư viện (kệ sách)' }], mins: 40, win: [390, 1080], days: 3, until: 1080, pay: 6000, aff: 6, stat: ['kheotay', 2] },
  laubang: { tid: 'hanh', name: 'Trực nhật lớp sau giờ học', desc: 'Tan học rồi em lau bảng, kê lại bàn ghế và quét lớp 10A1 giúp cô nhé.', steps: [{ map: 'class', x: 160, y: 54, do: 'Lau bảng, kê bàn ghế, quét lớp', where: 'Lớp 10A1 (trước bảng)' }], mins: 30, win: [CFG.SCHOOL_END, 1110], days: 2, until: 1110, pay: 5000, aff: 6, stat: ['kheotay', 1] },
  tuoicay: { tid: 'tung', name: 'Tưới cây phượng sân trường', desc: 'Mấy hôm nay nắng to quá, thầy nhờ em tưới mấy gốc phượng trước sân trường.', steps: [{ map: 'school', x: 114, y: 194, do: 'Xách bình tưới các gốc phượng', where: 'Sân trường (gốc phượng bên trái)' }], mins: 20, win: [390, 1080], days: 2, until: 1080, pay: 4000, aff: 5, stat: ['thethao', 1] },
  dungcu: { tid: 'manh', name: 'Dọn dụng cụ thể dục', desc: 'Sau giờ thể dục bóng, cầu, dây nhảy vương vãi khắp sân. Thầy nhờ em gom lại cất vào kho.', steps: [{ map: 'school', x: 600, y: 214, do: 'Gom bóng, cầu, dây nhảy cất vào kho', where: 'Sân thể dục' }], mins: 30, win: [CFG.SCHOOL_END, 1110], days: 3, until: 1110, pay: 6000, aff: 7, stat: ['thethao', 2] },
  decuong: { tid: 'tung', name: 'Mang đề cương ôn tập về lớp', desc: 'Thầy để xấp đề cương ôn tập Toán ở bàn thủ thư. Em lấy giúp thầy rồi đặt lên bàn giáo viên lớp 10A1.', steps: [{ map: 'thuvien', x: 252, y: 154, do: 'Nhận xấp đề cương ở bàn thủ thư', where: 'Thư viện (bàn thủ thư)' }, { map: 'class', x: 56, y: 64, do: 'Đặt đề cương lên bàn giáo viên', where: 'Lớp 10A1 (bàn giáo viên)' }], mins: 16, win: [390, 1080], days: 2, until: 1080, pay: 4000, aff: 6 },
  phan: { tid: 'hanh', name: 'Mua giúp cô hộp phấn', desc: 'Lớp mình hết phấn rồi. Em ghé tạp hoá Cô Ba mua giúp cô một hộp phấn trắng rồi để lên bàn giáo viên nhé, tiền phấn cô gửi lại.', steps: [{ map: 'town', x: 290, y: 150, do: 'Mua hộp phấn ở tạp hoá Cô Ba', where: 'Tạp hoá Cô Ba (khu phố nhà mình)', win: [360, 1260] }, { map: 'class', x: 56, y: 64, do: 'Để hộp phấn lên bàn giáo viên', where: 'Lớp 10A1 (bàn giáo viên)' }], mins: 20, win: [390, 1080], days: 3, until: 1080, pay: 5000, aff: 6 },
  phongnhac: { tid: 'lan', name: 'Dọn phòng nhạc trước buổi văn nghệ', desc: 'Sắp có buổi văn nghệ, cô nhờ lau sân khấu nhỏ và cuộn gọn dây loa trong phòng nhạc.', steps: [{ map: 'nhac', x: 150, y: 132, do: 'Lau sân khấu, cuộn dây loa', where: 'Phòng nhạc' }], mins: 30, win: [390, 1110], days: 4, until: 1110, pay: 5000, aff: 5, stat: ['vannghe', 1] },
  baotuong: { tid: 'hanh', name: 'Trang trí báo tường của lớp', desc: 'Sắp tới đợt thi đua, cô nhờ em vẽ tranh, cắt dán báo tường treo ở cuối lớp.', steps: [{ map: 'class', x: 230, y: 196, do: 'Vẽ tranh, cắt dán báo tường', where: 'Lớp 10A1 (cuối lớp)' }], mins: 45, win: [CFG.SCHOOL_END, 1140], days: 4, until: 1140, pay: 7000, aff: 7, stat: ['kheotay', 3] },
  mohinh: { tid: 'quan', name: 'Kiểm đếm mô hình súng tập', desc: 'Thầy nhờ em đếm lại các mô hình súng tập ở góc sân thể dục và ghi vào sổ trước buổi Quốc phòng tới.', steps: [{ map: 'school', x: 586, y: 172, do: 'Đếm mô hình, ghi vào sổ', where: 'Góc sân thể dục' }], mins: 25, win: [390, 1080], days: 3, until: 1080, pay: 5000, aff: 6 },
};

/* ---------- Việc bố mẹ nhờ (nhắn qua điện thoại, KHÔNG nhắn trong giờ học) ----------
 * Ngày đi làm: nhắn lúc nghỉ trưa (hạn trước giờ vào học buổi chiều) hoặc sau giờ tan học (hạn trước khi bố mẹ tan làm).
 * Nghỉ hè: nhắn buổi sáng. Cuối tuần: việc ở nhà. Phải tới chỗ lấy đồ (cho vào túi), rồi cầm lên, bấm vào bố/mẹ để đưa tận tay.
 * where: chỗ đưa · lunch: chỉ nhắn lúc nghỉ trưa · off: việc cuối tuần (bố mẹ ở nhà) · cost: tiền bỏ ra mua (bố mẹ trả lại) */
const PARENT_TASK = { chance: 0.3, slots: { lunch: [630, PM_START - 15], after: [CFG.SCHOOL_END + 10, CFG.SCHOOL_END + 50], summer: [540, 1050], off: [540, 720] }, pay: 8000, aff: 3 };
const PARENT_TASKS = {
  tailieu: { who: 'dad', name: 'Mang tài liệu cho bố', msg: 'Con ơi, bố để quên tập tài liệu trong hộc bàn làm việc ở phòng bố mẹ. Con mang lên nhà máy giúp bố được không? Chiều nay bố phải nộp rồi.', item: 'tailieu', pick: { map: 'phongbm', x: 37, y: 60, do: 'Lấy tập tài liệu trong hộc bàn của bố', where: 'Phòng bố mẹ (bàn làm việc)' }, where: 'Nhà máy bánh kẹo (phố Bờ Đông)' },
  comtrua: { who: 'mom', name: 'Mang cơm trưa cho mẹ', msg: 'Mẹ để quên hộp cơm trưa trên bàn ăn ở nhà rồi. Trưa nay con mang qua công ty giúp mẹ nhé, công ty Sen Vàng ở cuối phố Hoa Phượng đó!', item: 'comme', lunch: true, pick: { map: 'home', x: 416, y: 146, do: 'Lấy hộp cơm trưa mẹ để quên trên bàn ăn', where: 'Nhà mình (bàn ăn)' }, where: 'Công ty Sen Vàng (cuối phố Hoa Phượng)' },
  vi: { who: 'dad', name: 'Mang ví cho bố', msg: 'Bố quên cái ví ở tủ đầu giường rồi. Con mang lên nhà máy cho bố nhé, chiều bố còn đổ xăng.', item: 'vibo', pick: { map: 'phongbm', x: 160, y: 70, do: 'Lấy cái ví bố để ở tủ đầu giường', where: 'Phòng bố mẹ (tủ đầu giường)' }, where: 'Nhà máy bánh kẹo (phố Bờ Đông)' },
  kinh: { who: 'mom', name: 'Mang kính cho mẹ', msg: 'Mẹ để quên cặp kính trên bàn trang điểm, không có kính mẹ không đọc được giấy tờ. Con mang qua công ty giúp mẹ nhé!', item: 'kinhme', pick: { map: 'phongbm', x: 210, y: 62, do: 'Lấy cặp kính trên bàn trang điểm của mẹ', where: 'Phòng bố mẹ (bàn trang điểm)' }, where: 'Công ty Sen Vàng (cuối phố Hoa Phượng)' },
  usb: { who: 'dad', name: 'Mang USB cho bố', msg: 'Cái USB bố cắm ở máy tính bàn làm việc ngoài phòng khách có file bố cần gấp. Con rút ra mang lên nhà máy giúp bố với!', item: 'usb', pick: { map: 'home', x: 299, y: 64, do: 'Rút cái USB ở máy tính bàn làm việc', where: 'Nhà mình (bàn làm việc phòng khách)' }, where: 'Nhà máy bánh kẹo (phố Bờ Đông)' },
  nuocmam: { who: 'mom', name: 'Mua nước mắm cho mẹ', msg: 'Nhà hết nước mắm rồi con ơi. Con chạy ra tạp hoá Cô Ba mua giúp mẹ một chai, về mẹ gửi lại tiền nhé!', item: 'nuocmam', off: true, cost: 25000, pick: { map: 'town', x: 290, y: 150, do: 'Mua một chai nước mắm ở tạp hoá Cô Ba', where: 'Tạp hoá Cô Ba (khu phố nhà mình)' }, where: 'Mẹ (ở nhà)' },
};
const PARENT_ITEMS = { tailieu: 'Tập tài liệu của bố', comme: 'Hộp cơm trưa của mẹ', vibo: 'Cái ví của bố', kinhme: 'Kính của mẹ', usb: 'USB của bố', nuocmam: 'Chai nước mắm' };

/* ---------- Nhóm học sinh trường trên điện thoại ----------
 * Ai cũng tự động được vào nhóm “Học sinh THPT Hoa Phượng”. Ngày đi học (không đăng trong giờ học), các bạn thân và anh chị
 * khoá trên đăng nhờ vả lên nhóm: bấm “Nhận” ngay trong nhóm → vào danh sách nhiệm vụ → tới chỗ lấy đồ (cho vào túi) → cầm lên →
 * bấm vào người nhờ để đưa tận tay. Thưởng: điểm thân thiết (♥ với bạn thân, quen thân với anh chị). Để lâu không ai nhận thì bạn khác giúp mất.
 * slots: giờ đăng (đầu giờ, ra chơi, nghỉ trưa, ra chơi chiều) · claim: sau bao nhiêu phút chưa ai nhận thì bạn khác nhận
 * who: ai có thể nhờ việc này (bạn thân hoặc anh chị khoá trên) · cost: tiền bỏ ra mua (người nhờ trả lại) · days: 1 = hạn tới buổi học hôm sau */
const GROUP = { name: 'Học sinh THPT Hoa Phượng', slots: [400, 540, AM_END + 10, 870, 960], chance: 0.45, max: 2, maxActive: 2, claim: 80, aff: 5, socAff: 8, lateAff: 1, failAff: -2, chat: [410, 550, 700, 880, 1200, 1290], chatChance: 0.3 };
const GROUP_REQS = {
  gr_vo: { name: 'Lấy giúp vở ghi Hoá', item: 'gr_vo', who: ['khoa', 'dat', 'ngan'], msg: 'Ai còn ở lớp không, mình để quên quyển vở ghi Hoá trong ngăn bàn cuối lớp rồi 😭 Cầm ra giúp mình với, chiều nay cô kiểm tra vở!', pick: { map: 'class', x: 176, y: 172, do: 'Lấy quyển vở ghi Hoá trong ngăn bàn', where: 'Lớp 10A1 (ngăn bàn cuối lớp)' } },
  gr_sach: { name: 'Mượn giúp sách tham khảo', item: 'gr_sach', who: ['vy', 'c_thao', 'a_hung'], msg: 'Có ai qua thư viện mượn giúp mình cuốn “Bài tập Toán nâng cao” không? Mình đang kẹt việc, cảm ơn nhiều nha!', pick: { map: 'thuvien', x: 160, y: 50, do: 'Mượn cuốn “Bài tập Toán nâng cao” ở kệ sách', where: 'Thư viện (kệ sách)' } },
  gr_nuoc: { name: 'Mua giúp chai nước', item: 'gr_nuoc', cost: 6000, who: ['khoa', 'dat', 'a_phong', 'ngan'], msg: 'Khát khô cổ mà căn tin đông quá, ai mua giúp mình chai nước suối với, gửi lại tiền liền!', pick: { map: 'school', x: 78, y: 116, do: 'Mua một chai nước suối ở căn tin', where: 'Căn tin trường' } },
  gr_banh: { name: 'Mua giúp ổ bánh mì', item: 'gr_banh', cost: 15000, who: ['khoa', 'vy', 'dat', 'c_mai'], msg: 'Sáng nay dậy muộn chưa kịp ăn gì 🥲 Ai mua giúp mình ổ bánh mì ở căn tin với, mình gửi lại tiền nha!', pick: { map: 'school', x: 78, y: 116, do: 'Mua một ổ bánh mì ở căn tin', where: 'Căn tin trường' } },
  gr_bong: { name: 'Lấy bóng cho đội bóng', item: 'gr_bong', who: ['a_phong', 'khoa', 'dat'], msg: 'Đội bóng thiếu bóng tập! Ai tiện ghé góc sân thể dục lấy giúp quả bóng trong rổ mang lại đây với!', pick: { map: 'school', x: 630, y: 196, do: 'Lấy quả bóng trong rổ dụng cụ', where: 'Góc sân thể dục (rổ bóng)' } },
  gr_micro: { name: 'Lấy micro tập văn nghệ', item: 'gr_micro', who: ['c_mai', 'dat'], msg: 'Đội văn nghệ cần cái micro ở phòng nhạc để tập, ai lấy giúp mang ra sân với nha! 🎤', pick: { map: 'nhac', x: 110, y: 120, do: 'Lấy cái micro ở phòng nhạc', where: 'Phòng nhạc' } },
  gr_the: { name: 'Tìm giúp thẻ học sinh', item: 'gr_the', who: ['ngan', 'vy', 'khoa', 'c_thao'], msg: 'Ai thấy thẻ học sinh của mình không 😢 Hình như rơi ở gốc cây to bên trái sân trường lúc sáng…', pick: { map: 'school', x: 132, y: 196, do: 'Nhặt tấm thẻ học sinh rơi dưới gốc cây', where: 'Sân trường (gốc cây to bên trái)' } },
  gr_sotay: { name: 'Lấy giúp sổ tay Đoàn', item: 'gr_sotay', who: ['a_hung'], msg: 'Mình để quên sổ tay Đoàn trên bàn giáo viên lớp 12A1, em nào lên tầng 2 lấy giúp mang cho mình với!', pick: { map: 'l12a1', x: 56, y: 66, do: 'Lấy cuốn sổ tay Đoàn trên bàn giáo viên', where: 'Lớp 12A1 (tầng 2, bàn giáo viên)' } },
  gr_butmau: { name: 'Mua giúp hộp bút màu', item: 'gr_butmau', cost: 12000, days: 1, who: ['ngan', 'vy', 'c_mai'], msg: 'Mai có giờ Mĩ thuật mà mình hết bút màu rồi, ai về qua tạp hoá Cô Ba mua giúp hộp bút chì màu với, mai lên lớp gửi tiền nha!', pick: { map: 'town', x: 290, y: 150, do: 'Mua hộp bút chì màu ở tạp hoá Cô Ba', where: 'Tạp hoá Cô Ba (khu phố nhà mình)' } },
};
const GROUP_ITEMS = { gr_vo: 'Vở ghi Hoá', gr_sach: 'Sách “Bài tập Toán nâng cao”', gr_nuoc: 'Chai nước suối', gr_banh: 'Ổ bánh mì', gr_bong: 'Quả bóng đá', gr_micro: 'Cái micro', gr_the: 'Thẻ học sinh', gr_sotay: 'Sổ tay Đoàn', gr_butmau: 'Hộp bút chì màu' };
// gặp người nhờ ở đâu để đưa đồ
const GROUP_MEET = { khoa: 'sân trường / lớp 10A1', vy: 'sân trường / lớp 10A1', dat: 'sân trường / lớp 10A1', ngan: 'sân trường / lớp 10A1', a_hung: 'sân trường giờ ra chơi / lớp 12A1 (tầng 2)', c_mai: 'sân trường giờ ra chơi / lớp 12A2 (tầng 2)', a_phong: 'sân trường giờ ra chơi / lớp 11A1 (tầng 2)', c_thao: 'sân trường giờ ra chơi / lớp 11A3 (tầng 2)' };
// người trong nhóm hay nhắn chuyện phiếm: [tên, look]
const GROUP_PEOPLE = { x1: ['Tú · 10A2', 'x1'], x2: ['Linh · 10A2', 'x2'], x3: ['Bảo · 10A3', 'x3'], x4: ['Nhi · 10A4', 'x4'], m1: ['Quang · lớp trưởng 10A1', 'c1'], m3: ['Đức · 10A1', 'c3'] };
const GROUP_CHAT = [
  ['m1', 'Nhắc cả lớp: mai kiểm tra 15 phút Toán nhé, ôn kỹ phần bài tập về nhà!'], ['x1', 'Hôm nay căn tin có bánh mì pate mới, ngon xỉu luôn 😋'],
  ['x2', 'Ai có ảnh buổi chào cờ sáng nay gửi lên nhóm với, mình nhắm mắt trong ảnh mất rồi 😂'], ['x3', 'Chiều nay đội bóng 10A3 đá giao hữu với 10A1, ra cổ vũ đi mọi người!'],
  ['x4', 'Thư viện vừa về sách mới đó, có cả truyện tranh khoa học nữa.'], ['a_hung', 'Đoàn trường thông báo: thứ Bảy này có buổi trồng cây, bạn nào muốn tham gia thì đăng ký với lớp trưởng nhé.'],
  ['c_mai', 'Đội văn nghệ tuyển thêm thành viên nha, ai thích hát múa thì nhắn chị!'], ['a_phong', 'Đội bóng trường thắng giải liên trường rồi!!! ⚽🏆'],
  ['c_thao', 'Mấy em khối 10 cần đề cương ôn tập thì nhắn chị, chị còn giữ của năm ngoái.'], ['m3', 'Có ai thấy cái ô màu xanh để ở hành lang không, của mình đó 😥'],
  ['x1', 'Trời hôm nay nóng quá, chiều mà được nghỉ thể dục thì tốt 🥵'], ['x2', 'Tiệm trà sữa Mây giảm giá 20% cho học sinh đó, đeo thẻ học sinh vào nha.'],
  ['m1', 'Thứ Hai tuần sau lớp mình trực tuần, mọi người đi học sớm giúp mình nhé.'], ['x3', 'Có ai giải được câu cuối đề cương Lý chưa, chỉ mình với 🙏'],
];

/* ---------- Làm việc riêng trong giờ học (sev: 1 nhẹ, 2 nặng) ---------- */
const CLASS_FUN_CHANCE = 0.22;
const CLASS_FUN = [
  { id: 'banhtrang', text: 'chìa bịch bánh tráng trộn dưới gầm bàn: “Ăn không?”', join: 'Ăn vụng', risk: 0.22, sev: 1, friend: 4, stam: 4 },
  { id: 'tam', text: 'quay sang thì thầm kể chuyện hôm qua', join: 'Tám chuyện', risk: 0.18, sev: 1, friend: 4 },
  { id: 'game', text: 'rủ chơi game trên điện thoại dưới gầm bàn', join: 'Chơi game', risk: 0.38, sev: 2, friend: 6, stam: 3 },
  { id: 'video', text: 'mở video hài rồi đưa cho một bên tai nghe', join: 'Xem video', risk: 0.33, sev: 2, friend: 5, stam: 3 },
];

/* ---------- Quậy cùng bạn ở trường (sev: 1 nhẹ → 3 rất nặng) ---------- */
// leave: rời khỏi trường (trốn tiết nếu trùng giờ học). Càng rủi ro thì điểm tình bạn càng nhiều.
const MISCHIEF = {
  trasua: { name: 'Trốn ra ngoài uống trà sữa', verb: 'Đi uống trà sữa', mins: 60, cost: 25000, leave: true, risk: 0.20, sev: 1, friend: 12, stam: 10 },
  dabong: { name: 'Trốn ra sân bóng gần trường', verb: 'Đi đá bóng', mins: 60, leave: true, risk: 0.20, sev: 1, friend: 12, thethao: 6, stamCost: 15 },
  arcade: { name: 'Trốn ra trung tâm thương mại chơi arcade', verb: 'Đi chơi arcade', mins: 90, cost: 30000, leave: true, risk: 0.28, sev: 2, friend: 16, stam: 6 },
  tttm: { name: 'Trốn ra trung tâm thương mại xem phim', verb: 'Đi xem phim', mins: 110, cost: 45000, leave: true, risk: 0.26, sev: 2, friend: 18, stam: 12 },
  nui: { name: 'Cúp tiết leo núi sau trường', verb: 'Leo núi sau trường', mins: 80, leave: true, risk: 0.18, sev: 1, friend: 14, thethao: 4, stamCost: 10, day: true },
  cantin: { name: 'Cúp tiết ngồi lì dưới căn tin', verb: 'Ngồi căn tin', mins: 40, cost: 10000, leave: true, inside: true, risk: 0.30, sev: 1, friend: 9, stam: 8 },
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
  th_ly: { stat: 'ly', title: 'Thí nghiệm Vật lý', task: 'Chuyển động ném xiên: chỉnh góc, canh lực để ném quả cầu vào rổ phía sau bức tường', game: 'physics' },
  th_hoa: { stat: 'hoa', title: 'Pha chế trong phòng Hoá', task: 'Rót các chất vào cốc cho đúng liều lượng cô yêu cầu', game: 'mix' },
  th_sinh: { stat: 'sinh', title: 'Soi mẫu vật dưới kính hiển vi', task: 'Rê kính hiển vi, tìm đúng vi sinh vật cô yêu cầu trước khi hết giờ', game: 'micro' },
  th_qp: { stat: 'qp', title: 'Tháo lắp súng AK mô hình, lựu đạn tập', task: 'Ghép các mảnh lại thành hình khẩu súng hoặc quả lựu đạn hoàn chỉnh', game: 'jigsaw' },
};
const DIFF_WEIGHTS = [0.15, 0.30, 0.30, 0.18, 0.07];   // xác suất độ khó 1–5 sao
// Hoàn thành ở độ khó càng cao càng được nhiều điểm thực hành
const practicalReward = (d, win, perfect) => (win ? 3 + 3 * d + (perfect ? 2 : 0) : 2);

/* ---------- Hệ số điểm ---------- */
// Điểm môn học kỳ = (điểm miệng × 1 + điểm 15' × 1 + điểm kiểm tra 1 tiết × 2 + điểm thi học kỳ × 3) / tổng hệ số
// Điểm TB học kỳ = trung bình cộng các môn · Điểm TB cả năm = (TB học kỳ 1 × 1 + TB học kỳ 2 × 2) / 3
const COEF = { mieng: 1, p15: 1, tiet: 2, thi: 3 };
const TEST_NAME = { mieng: 'Kiểm tra miệng', p15: "Kiểm tra 15'", tiet: 'Kiểm tra 1 tiết', thi: 'Thi học kỳ' };
const TEST_DIFF = { mieng: 0.3, p15: 0, tiet: -0.3, thi: -0.5 };
/* ---------- Cân bằng điểm học tập (đã kiểm chứng bằng mô phỏng) ----------
 * điểm ≈ base + kLv·√(cấp môn) + kLt·√(cấp Học tập TB) − gradeOff[khối] ± may rủi (+1 nếu tối trước đã ôn môn đó)
 * Lớp 10: học đủ tiết (mang đủ sách) + tối nào cũng ôn 2 buổi → vừa đủ học sinh Giỏi.
 * Lớp 11 khó hơn: chăm chỉ thôi chỉ Khá, cần thêm ~2 buổi học thêm + 1 buổi luyện thực hành mỗi tuần.
 * Lớp 12 khó hơn nữa: cần ~4 buổi học thêm + 2 buổi luyện thực hành mỗi tuần mới chắc Giỏi.
 * prac*: bài kiểm tra thực hành (Thể dục, Quốc phòng) — dựa vào kết quả mini-game + cấp môn + cấp Học tập TB */
const STUDY = { base: 5.3, kLv: 1.15, kLt: 0.45, comp: 0.04, gradeOff: [0, 1.65, 2.75], roll: [0.5, 0.8, 1.4], tutor: 0.25, tutorMax: 1.0, pracBase: 3.8, pracProg: 4.0, pracLv: 0.25, pracTh: 0.08, pracGrade: [0, 0.7, 1.3] };
// học thêm: mỗi buổi học thêm một môn được cộng STUDY.tutor vào bài kiểm tra môn đó trong cùng học kỳ (tối đa STUDY.tutorMax)

/* ---------- Bạn bè ---------- */
const FRIENDS = {
  // bạn cùng bàn (mã 'khoa'): nhân vật chính là nam thì là Đạt (lanh lợi, hơi tròn trịa), là nữ thì là Duyên (hậu đậu)
  khoa: { get name() { return isGirlMain() ? 'Duyên' : 'Đạt'; }, get note() { return isGirlMain() ? 'Bạn cùng bàn, hơi hậu đậu' : 'Bạn cùng bàn, lanh lợi'; }, get g() { return isGirlMain() ? 'girl' : 'boy'; }, seat: 'cùng bàn', duel: 'kha', bday: [0, 12] },
  vy: { name: 'Vy', note: 'Hoa khôi của trường, lớp phó học tập', g: 'girl', seat: 'bàn bên phải', duel: 'gà', bday: [1, 8] },
  dat: { name: 'Thái', note: 'Cây văn nghệ của lớp, fan cứng ca sĩ thần tượng', g: 'boy', seat: 'bàn dưới', duel: 'caothu', bday: [2, 20] },
  ngan: { name: 'Ngân', note: 'Chị khoá trên lớp 11A1, mê thể thao', g: 'girl', seat: 'lớp 11A1', senior: true, duel: 'gà', bday: [0, 25] },
};
// Sinh nhật: [chỉ số mùa (0 Thu, 1 Đông, 2 Xuân, 3 Hè), ngày]. Hiện trên Lịch; hôm đó chúc mừng / tặng quà được cộng nhiều hơn.
const PARENT_BDAY = { mom: [1, 20], dad: [2, 12] };
const BDAY_FRIEND = 8, BDAY_PARENT = 4;
// Lễ hội — ĐỂ SẴN, sẽ định nghĩa sau: { season, day, name }. Lịch tự hiển thị.
// Lễ hội trên Lịch: { season, day, name, desc } — desc là câu bản tin đọc khi sắp tới lễ
const FESTIVALS = [
  { season: 0, day: 15, icon: 'sc_trungthu', name: 'Tết Trung thu', desc: 'Đêm hội trăng rằm ở phố Hoa Phượng (20:00–23:00): múa lân, rước đèn, đập niêu, kéo co, làm đèn ông sao.' },
  { season: 1, day: 30, name: 'Đêm giao thừa', desc: 'Núi sau trường mở hội chợ đón giao thừa, có sạp trò chơi, đồ ăn và pháo hoa lúc nửa đêm.' },
];
/* ---------- Tết Trung thu (giữa mùa thu) ở phố Hoa Phượng ----------
 * from–until: tới phố trong khung giờ này là vào hội (thời gian đứng yên) · end: buổi lễ kết thúc, về nhà
 * matDays: bao nhiêu ngày trước Trung thu thì tạp hoá Cô Ba, căn tin bắt đầu bán nguyên liệu làm đèn lồng */
const TT = { season: 0, day: 15, from: 1200, until: 1380, end: 1440, matDays: 7, decor: 1020, nieuPrice: 5000, keocoFriend: 3 };
const TT_MATS = [
  { id: 'nl_tre', name: 'Nan tre', price: 8000, desc: 'Mười thanh tre vót mỏng để ghép khung đèn ông sao.' },
  { id: 'nl_giay', name: 'Giấy bóng kính', price: 6000, desc: 'Giấy kiếng đỏ, vàng để dán quanh khung đèn.' },
  { id: 'nl_nen', name: 'Nến', price: 3000, desc: 'Cây nến nhỏ thắp sáng chiếc đèn.' },
];
const TT_FOOD = [
  { id: 'banhnuong', name: 'Bánh nướng', price: 25000, desc: 'Vỏ vàng ruộm, nhân thập cẩm có trứng muối.' },
  { id: 'banhdeo', name: 'Bánh dẻo', price: 20000, desc: 'Trắng mềm, thơm mùi hoa bưởi.' },
  { id: 'buoi', name: 'Múi bưởi', price: 10000, desc: 'Bưởi ngọt mát, mâm cỗ nào cũng có.' },
];
const isDate = (d, day) => { const c = cal(day); return !!d && c.season === d[0] && c.dos === d[1]; };

/* ---------- Thiện cảm của TỪNG thầy cô (như bạn bè) ---------- */
// 0–100 điểm mỗi người, 20 điểm một tim (0–5). 1 tim là bình thường.
// Mỗi tim trên 1 của giáo viên bộ môn: bài kiểm tra môn đó được chấm nhẹ tay +0,15 điểm và nguy cơ bị bắt quay cóp giảm 6%.
const TEACHERS = {
  hanh: { name: 'Cô Hạnh', note: 'Chủ nhiệm · dạy Văn, Sinh', look: 'teacherA', subj: ['van', 'sinh', 'shl', 'cc', 'th_sinh'] },
  lan: { name: 'Cô Lan', note: 'Dạy Anh, Hoá, Địa', look: 'teacherB', subj: ['anh', 'hoa', 'dia', 'th_hoa'] },
  tung: { name: 'Thầy Tùng', note: 'Dạy Toán, Lý, Sử', look: 'teacherC', subj: ['toan', 'ly', 'su', 'th_ly'] },
  manh: { name: 'Thầy Mạnh', note: 'Dạy Thể dục', look: 'teacherM', subj: ['td'] },
  quan: { name: 'Thầy Quân', note: 'Dạy Quốc phòng', look: 'teacherQ', subj: ['qp', 'th_qp'] },
  nghiem: { name: 'Thầy Nghiêm', note: 'Giám thị', look: 'giamthi', subj: [] },
};
const teacherOf = subj => Object.keys(TEACHERS).find(k => TEACHERS[k].subj.includes(subj)) || 'hanh';
const TEACHER = {
  start: 20, max: 100, perLv: 20,
  snitch: 8, snitchClass: 5, volunteer: 1, answer: 1, duty: 3, notebook: 1,
  caughtFun: -3, caughtSkip: -5, caughtCheat: -10, noNotebook: -1,
  gradePerLv: 0.15, cheatBase: 0.40, cheatPerLv: 0.06,
};
const teacherLvOf = pts => Math.max(0, Math.min(5, Math.floor((pts || 0) / TEACHER.perLv)));
// Người ngoài xã hội hay gặp: quen mặt dần mỗi lần ghé (mỗi ngày +SOC_GAIN lần đầu)
const SOCIETY = {
  coba: { name: 'Cô Ba', note: 'Chủ tiệm tạp hoá', look: 'vendor' },
  cantin: { name: 'Cô căn tin', note: 'Bán hàng ở căn tin trường', look: 'vendor' },
  baove: { name: 'Bác bảo vệ', note: 'Gác cổng trường', look: 'guard' },
  taixe: { name: 'Bác tài', note: 'Lái xe bus', look: 'driver' },
  soatve: { name: 'Cô soát vé', note: 'Ga Hoa Phượng', look: 'clerk' },
  a_hung: { name: 'Anh Hùng', note: 'Khoá trên · 12A1, bí thư Đoàn trường', look: 'sA' },
  c_mai: { name: 'Chị Mai', note: 'Khoá trên · 12A2, đội trưởng văn nghệ', look: 'sB' },
  a_phong: { name: 'Anh Phong', note: 'Khoá trên · 11A1, đội trưởng đội bóng', look: 'sC' },
  c_thao: { name: 'Chị Trang', note: 'Khoá trên · 11A3, lớp phó học tập', look: 'sD' },
  a_hoang: { name: 'Anh Hoàng', note: 'Khoá trên · 12A2, “đầu gấu” khối 12', look: 'hoang' },
  su: { name: 'Sư thầy', note: 'Trụ trì chùa Hoa Phượng', look: 'monk' },
  hieutruong: { name: 'Thầy hiệu trưởng', note: 'Hiệu trưởng trường THPT Hoa Phượng', look: 'principal' },
  thitruong: { name: 'Ông thị trưởng', note: 'Thị trưởng thành phố Hoa Phượng', look: 'mayor' },
  bac_tu: { name: 'Bác Tư', note: 'Hàng xóm phố Bờ Đông · về hưu', look: 'principal' },
  co_lanh: { name: 'Cô Lành', note: 'Hàng xóm phố Bờ Đông · bán bánh cuốn', look: 'vendor' },
  anh_long: { name: 'Anh Long', note: 'Đầu bếp nhà hàng Sen Hồng', look: 'chef' },
};
const SOC_GAIN = 2;
// Mã thử nghiệm (dán vào ô "Dán mã" trong Cài đặt, không phân biệt hoa thường)
const CHEATS = { money: 'HI!IAMBILLGATES', time: 'HI!IAMCIRI', love: 'HI!IAMBALDER', level: 'HI!IAMDAVINCI', sport: 'HI!IAMRONALDO', trade: 'HI!IAMTRUMP', craft: 'HI!IAMMOM', art: 'HI!IAMJACKSON' };
// mã tăng 1 cấp một chỉ số hỗ trợ
const CHEAT_STAT = { [CHEATS.sport]: 'thethao', [CHEATS.trade]: 'buonban', [CHEATS.craft]: 'kheotay', [CHEATS.art]: 'vannghe' };
const CHEAT_MONEY = 100000000, CHEAT_LOVE = 2;
// Trốn học cùng bạn (đi thật ra ngoài, thời gian trôi thật): nguy cơ bị bắt khi quay lại / khi tan học mà chưa về
const SKIP = { friend: 6, risk: 0.18, perMissed: 0.1, accept: 0.4, perHeart: 0.11, freeBonus: 0.3, perDay: 3, endAt: 1290 };
// Quay cóp: trót lọt được cộng điểm, bị bắt thì bài bị trừ một nửa + trừ hạnh kiểm + mất thiện cảm thầy cô
const CHEAT = { min: 1.5, max: 2.5, vyBonus: 0.5, conduct: -1, parentCall: 0.5 };
// Tố cáo bạn rủ rê: được lòng thầy cô nhưng mất lòng bạn bè
const SNITCH = { friend: -15, others: -2, grudgeDays: 7, friendClass: -10 };
// Chủ động quay sang bạn TRONG GIỜ HỌC (chơi bài, con quay, đấu thẻ, xin ra ngoài đi vệ sinh…): mất tập trung và dễ bị cô bắt hơn giờ giải lao
const IN_CLASS = { delta: -2, riskAdd: 0.18, chat: { friend: 3, risk: 0.15 }, duelRisk: 0.2 };

/* ---------- Mượn sách khi quên (quay sang hỏi bạn) ---------- */
const BORROW = { deskmate: 0.35, other: 0.22, perHeart: 0.12, grudge: -0.5, scold: 0.15 };

/* ---------- Xin tiền bố mẹ đi chơi (sau khi đã về nhà) ---------- */
const OUTING = { base: 10000, perLv: 4000, perWeek: 2, chance: 0.45, perLvChance: 0.05 };

/* ---------- Trò riêng với bạn cùng giới (giờ ra chơi, hoặc lén làm trong giờ học) ---------- */
// g: giới tính nhân vật được rủ trò này (bạn cùng giới) · risk: nguy cơ bị giám thị / cô nhắc
const BREAK_FUN = {
  wc: { g: 'girl', name: 'Rủ đi vệ sinh chung', friend: 5, risk: 0.08 },
  yoyo: { g: 'boy', name: 'Rủ chơi yoyo', friend: 4, kheotay: 1 },
  conquay: { g: 'boy', name: 'Rủ chơi con quay', friend: 4, kheotay: 1 },
  danhbai: { g: 'boy', name: 'Rủ đánh bài tiến lên', friend: 6, risk: 0.14 },
};
const BREAK_FUN_MIN_HEARTS = 1, BREAK_FUN_PER_DAY = 2, BREAK_FUN_MINS = 10;

/* ---------- Sự kiện giờ nghỉ trưa & trong giờ học ---------- */
const LUNCH_EVENT_TIME = 660, LUNCH_EVENT_CHANCE = 0.55, CLASS_EVENT_CHANCE = 0.26;
const LIBRARY = { mins: 30, pts: 3, stam: 3, perDay: 2 };
const NAP = { mins: 40, stam: 18 };
const BED_NAP = { mins: 30, stam: 12, perDay: 2 };
/* ---------- Chùa: thắp nhang rồi lắc ống xăm, thẻ xăm rơi ra cho biết vận may hôm nay ---------- */
// luck: điểm may mắn hôm nay cộng/trừ · w: tỉ lệ rơi ra (tương đối)
const QUE = [
  { name: 'Thượng thượng — Đại cát', luck: 35, w: 12, col: '#d9534f', poem: 'Mây tan trăng sáng giữa trời,<br>Thuyền xuôi gió thuận, việc đời hanh thông.', giai: 'Mọi việc như ý. Làm bài kiểm tra dễ trúng tủ, đi đâu cũng gặp may.' },
  { name: 'Thượng — Cát', luck: 18, w: 28, col: '#f2a93b', poem: 'Cây non gặp nắng xuân sang,<br>Chăm vun ắt có ngày vàng trổ hoa.', giai: 'Có quý nhân giúp đỡ. Chăm chỉ thì kết quả sẽ tốt.' },
  { name: 'Trung bình', luck: 0, w: 30, col: '#5fae4a', poem: 'Đường xa từng bước mà đi,<br>Chẳng lo chẳng vội, việc gì cũng xong.', giai: 'Không hên không xui. Học bao nhiêu được bấy nhiêu.' },
  { name: 'Hạ — Hung', luck: -15, w: 20, col: '#3b82c4', poem: 'Gió ngược thuyền nhỏ chòng chành,<br>Cẩn thận từng bước, an lành về sau.', giai: 'Hơi xui. Làm gì cũng nên cẩn thận, đọc kỹ đề bài.' },
  { name: 'Hạ hạ — Đại hung', luck: -30, w: 10, col: '#5f656f', poem: 'Mây đen che khuất vầng trăng,<br>Hôm nay nên tĩnh, chớ hăng việc gì.', giai: 'Ngày xấu. Dễ “học tài thi phận”, tránh quậy phá kẻo bị bắt.' },
];
/* ---------- Tết, giao thừa, thi gói bánh chưng ---------- */
// Lì xì: bố mẹ (sáng mùng 1) · nhà bạn và nhà thầy cô (khi đến chúc Tết): base + perHeart × số tim
const LIXI = { parents: 50000, perParentLv: 5000, friend: 10000, teacher: 20000, perHeart: 10000, friendGain: 6, teacherGain: 6 };
const TET_TEMPLE = { luck: 25, parent: 3, mins: 60 };   // đi chùa đầu năm cùng bố mẹ
// Đêm giao thừa (ngày cuối mùa đông): sáng hôm đó bố mẹ hoặc bạn thân rủ đi; ai cũng lên núi được tới 24:00
// from: giờ lễ hội bắt đầu (18:30) · until: hạn chót tới núi (24:00) · home: giờ về tới nhà sau khi xem pháo hoa (01:00). Trong hội thời gian đứng yên.
const EVE = { from: 1110, until: 1440, home: 1500 };
const FEST_GAME = { price: 5000, friend: 4 };
const FEST_FOOD = [
  { id: 'banhchung', name: 'Bánh chưng rán', price: 15000, stam: 20, desc: 'Giòn rụm, nóng hổi' },
  { id: 'xoi', name: 'Xôi gấc', price: 10000, stam: 15, desc: 'Đỏ may mắn đầu năm' },
  { id: 'keobong', name: 'Kẹo bông', price: 8000, stam: 6, desc: 'Ngọt lịm, tan ngay trong miệng' },
];
// Hội gói bánh chưng (chiều ngày học cuối cùng của mùa đông): time: giây chơi mini-game thi · npc: [mã, tên, số bánh trung bình gói được] của 3 đối thủ
const BANHCHUNG = { time: 60, npc: [['m1', 'Quang (10A1)', 4.6], ['x1', 'Tú (10A2)', 5.4], ['x3', 'Bảo (10A3)', 6.2]], end: 1020 };
// Sự kiện của trường thay cho một số tiết: các tiết đó nghỉ (không tính vắng), thời khoá biểu, bảng tin, soạn cặp tự cập nhật
// when(năm) → ngày diễn ra · periods: các tiết bị thay · from/to: giờ sự kiện
const SCHOOL_EVENTS = [
  { id: 'banhchung', name: 'Hội gói bánh chưng', short: 'Gói bánh chưng', col: '#3f8f3a', when: y => contestDay(y), periods: [5, 6, 7, 8, 9], from: 810, to: 1020 },
];
/* ---------- Lưu bút: kỷ vật, khoảnh khắc, lời lưu bút (viết vào ngày tốt nghiệp) ---------- */
const MEMO_ITEMS = {
  cup: { name: 'Cúp Vua gói bánh chưng', desc: 'Vô địch hội thi gói bánh chưng của trường.', hint: 'Thắng hội thi gói bánh chưng trước Tết' },
  photo: { name: 'Ảnh cả lớp ăn mừng', desc: 'Cả lớp đứng chen nhau quanh chiếc cúp, cười tít mắt.', hint: 'Thắng hội thi gói bánh chưng trước Tết' },
  lixi: { name: 'Phong bao lì xì đầu năm', desc: 'Bao lì xì đỏ bố mẹ trao sáng mùng 1 Tết.', hint: 'Ăn Tết ở nhà' },
  que: { name: 'Thẻ xăm Đại cát', desc: 'Thẻ xăm may mắn nhất rút được ở chùa.', hint: 'Xin được quẻ thật tốt ở chùa' },
  longden: { name: 'Lồng đèn hội chợ', desc: 'Phần thưởng ném vòng ở hội chợ đêm giao thừa.', hint: 'Ném vòng trúng ở hội chợ giao thừa' },
  gaubong: { name: 'Gấu bông gắp được', desc: 'Con gấu đầu tiên gắp được ở khu game.', hint: 'Gắp thú ở khu game' },
  the: { name: 'Thẻ cầu thủ huyền thoại', desc: 'Lá thẻ hiếm nhất trong bộ sưu tập.', hint: 'Bóc được thẻ huyền thoại' },
  voso: { name: 'Vỏ sò biển Hoa Phượng', desc: 'Áp lên tai nghe được tiếng sóng.', hint: 'Đi biển nhặt vỏ sò' },
  anhgiaothua: { name: 'Ảnh đón giao thừa', desc: 'Gia đình và bạn bè chụp chung dưới bầu trời pháo hoa.', hint: 'Ngắm pháo hoa giao thừa trên núi', photo: true },
  denongsao: { name: 'Đèn ông sao tự làm', desc: 'Khung nan tre, giấy bóng kính đỏ, ánh nến lung linh.', hint: 'Tự ghép đèn lồng ở hội Trung thu' },
  anhhkpd: { name: 'Ảnh lớp ngày Hội khoẻ Phù Đổng', desc: 'Cả lớp đứng chụp chung sau lễ trao giải, ai thi đấu thì đứng hàng trước.', hint: 'Dự lễ trao giải Hội khoẻ Phù Đổng', photo: true },
  anhhsg: { name: 'Ảnh nhận giải học sinh giỏi quốc gia', desc: 'Đứng cạnh thầy hiệu trưởng, đeo huy chương, tay cầm bằng khen.', hint: 'Đoạt giải học sinh giỏi quốc gia', photo: true },
  anhtrungthu: { name: 'Ảnh rước đèn Trung thu', desc: 'Cả đoàn rước đèn ông sao dưới trăng rằm.', hint: 'Rước đèn cùng mọi người đêm Trung thu', photo: true },
};
// Danh hiệu & huy hiệu trong lưu bút
/* ---------- Hội khoẻ Phù Đổng: thứ 7 đầu tiên của mùa đông, ở sân trường ----------
 * from–until: phải vào trường (qua cổng) trong khoảng này, không thì lớp bị xử thua cả 4 môn — mọi thầy cô và bạn bè mất điểm thân thiết
 * Trong hội thời gian đứng yên. 4 môn: kéo co, cướp cờ, tung còn đấu vòng tròn với 3 lớp (đối thủ khó dần HK_ORDER);
 * nhảy bao bố tiếp sức là một lượt đua chung cả 4 lớp. Xong cả 4 môn thì gặp thầy hiệu trưởng → trao giải → ảnh lớp → end (17:00).
 * str: sức mạnh lớp bạn (0–3) · team: bạn cùng lớp thi cùng mình ở mỗi môn */
const HKPD = { season: 1, open: 360, from: 480, until: 660, end: 1020, failTeacher: -8, failFriend: -10, cupFriend: 6, cupTeacher: 4, playFriend: 2 };
const HK_CLASSES = {
  a1: { suf: 'A1', str: 0, col: '#3b82c4' },
  a2: { suf: 'A2', str: 3, col: '#e2574c', looks: ['x1', 'x2', 'c5', 'c8', 'c1', 'c6', 'c7', 'c2'] },
  a3: { suf: 'A3', str: 2, col: '#3f8f3a', looks: ['x3', 'c7', 'c4', 'c1', 'c8', 'c5', 'c3', 'c2'] },
  a4: { suf: 'A4', str: 1, col: '#c9962a', looks: ['x4', 'c3', 'c6', 'c5', 'c2', 'c7', 'c4', 'c1'] },
};
const HK_ORDER = ['a4', 'a3', 'a2'];        // đối thủ lần lượt của lớp mình: dễ → khó
const HK_MATES = { get khoa() { return FRIENDS.khoa.name; }, vy: 'Vy', dat: 'Thái', ngan: 'Ngân', c1: 'Quang', c3: 'Đức', c4: 'Minh Anh', c5: 'Vũ', c2: 'Thảo', c6: 'Hoa', c7: 'Nam Anh', c8: 'Phương', c9: 'Hiền', get c10() { return isGirlMain() ? 'Đạt' : 'Duyên'; } };
const HK_SPORTS = {
  keoco: { name: 'Kéo co', ref: 'manh', team: ['khoa', 'dat', 'c5', 'c7', 'c3'], rule: 'Hai lớp cầm dây, dải lụa đỏ ở giữa. <b>Bấm Space thật nhanh</b> (hoặc nút BẤM) để cả đội kéo về phía mình — kéo dải lụa qua vạch bên mình là thắng. Điểm Thể thao càng cao kéo càng khoẻ.' },
  cuopco: { name: 'Cướp cờ', ref: 'quan', team: ['vy', 'c1', 'khoa', 'dat'], rule: 'Hai đội đứng hai hàng đối diện, mỗi người một số, lá cờ ở giữa. Trọng tài gọi số nào thì hai bạn số đó chạy ra cướp cờ mang về hàng mình. Cầm cờ mà bị đối phương chạm vào là mất điểm. <b>Chỉ khi gọi đúng số của mình</b> mới được chạy (W A S D / phím mũi tên); chạy ra sai lượt hoặc bị gọi "về" mà không chạy về vạch là phạm quy (trọng tài dừng trận nhắc nhở) — 3 lần phạm quy thì lớp mình bị trừ 1 điểm. Mỗi lượt trọng tài chỉ gọi một số; đội nào được 3 điểm trước là thắng.' },
  tungcon: { name: 'Tung còn', ref: 'lan', team: ['vy', 'c6', 'c3'], rule: 'Mỗi lớp một cột còn, trên đỉnh có vòng tròn. <b>Nhấn giữ chuột rồi kéo</b> để vẽ hướng và lực ném, thả ra để tung. Để ý gió thổi làm còn bay lệch! Ngày may mắn thì còn dễ lọt vòng hơn. Hết giờ thì không ném được nữa; lớp nào tung lọt nhiều hơn thì thắng, hoà thì hiệp phụ 15 giây, vẫn hoà thì bốc thăm.' },
  baobo: { name: 'Nhảy bao bố', ref: 'tung', team: ['khoa', 'vy', 'c5'], rule: 'Cả 4 lớp cùng nhảy tiếp sức một vòng quanh sân trường. Bạn điều khiển lần lượt cả 4 bạn trong đội lớp mình: <b>bấm Space thật nhanh</b> để nhảy, tới chỗ bạn kế tiếp là đổi người. Lớp nào về đích trước xếp trên.' },
};
const HK_FOOD = [{ id: 'nuocmia', name: 'Nước mía', price: 10000 }, { id: 'kem', name: 'Kem ốc quế', price: 15000 }, { id: 'xoi', name: 'Xôi gấc', price: 15000 }, { id: 'banhmi', name: 'Bánh mì', price: 12000 }, { id: 'xien', name: 'Xiên que', price: 10000 }];
const HK_CHEER = ['Cố lên 10A1 ơi!', 'Một, hai, ba… cố lên!', 'Tập trung nào các em!', 'Hay lắm, giữ vững nhé!', 'Đừng bỏ cuộc!'];
const MEMO_BADGES = {
  giaothua: { name: 'Người đón giao thừa', icon: 'b_giaothua', desc: 'Cùng gia đình, bạn bè ngắm pháo hoa giao thừa trên núi.', hint: 'Ngắm pháo hoa giao thừa' },
  trungthu: { name: 'Huy hiệu Trung thu', icon: 'b_trungthu', desc: 'Tự tay ghép thành công một chiếc đèn ông sao.', hint: 'Làm đèn lồng ở hội Trung thu' },
  dapnieu: { name: 'Cao thủ đập niêu', icon: 'b_dapnieu', desc: 'Bịt mắt mà vẫn đập vỡ niêu kẹo đêm Trung thu.', hint: 'Bịt mắt đập niêu ở hội Trung thu' },
  keoco: { name: 'Lực sĩ kéo co', icon: 'b_keoco', desc: 'Kéo đội bạn qua vạch trong hội Trung thu.', hint: 'Thắng kéo co ở hội Trung thu' },
  capybara: { name: 'Capybara', icon: 'b_capybara', desc: 'Hiền lành, dễ mến như chú capybara — chơi thân hết mức với tất cả bạn bè.', hint: 'Thân thiết tối đa với mọi người bạn' },
  connoan: { name: 'Con Ngoan Trò Giỏi', icon: 'b_connoan', desc: 'Được bố mẹ và tất cả thầy cô thương quý hết mức.', hint: 'Thiện cảm tối đa với bố mẹ và mọi thầy cô' },
  hocba: { name: 'Học bá', icon: 'b_hocba', desc: 'Đứng hạng nhất lớp trong buổi họp phụ huynh cuối học kỳ.', hint: 'Đứng đầu lớp khi họp phụ huynh cuối kỳ' },
  hstb: { name: 'Học sinh tiêu biểu', icon: 'b_hstb', desc: 'Lọt tốp 3 cả khối trong bài thi chọn đội tuyển, vào đội tuyển ôn thi học sinh giỏi quốc gia.', hint: 'Lọt tốp 3 bài thi chọn đội tuyển HSG' },
  quocgia: { name: 'Đẳng cấp quốc gia', icon: 'b_quocgia', desc: 'Đoạt giải trong kỳ thi chọn học sinh giỏi quốc gia, được thầy hiệu trưởng trao bằng khen và huy chương.', hint: 'Đoạt giải học sinh giỏi quốc gia' },
  hsg: { name: 'Đội tuyển học sinh giỏi', icon: 'b_hsg', desc: 'Lọt tốp 3 của lớp cuối năm học, được chọn vào đội tuyển chuẩn bị thi học sinh giỏi quốc gia.', hint: 'Tốp 3 của lớp cuối học kỳ 2' },
  phudong: { name: 'Phù Đổng', icon: 'b_phudong', desc: 'Cùng cả lớp giành cúp tập thể ở Hội khoẻ Phù Đổng.', hint: 'Giành cúp tập thể ở Hội khoẻ Phù Đổng' },
};
const MEMO_SCENES = {
  hsgchon: { name: 'Chọn môn thi học sinh giỏi', icon: 'sc_hsg', desc: 'Bố mẹ đi họp về báo tin được vào đội tuyển, cả nhà cùng chọn môn thi.' },
  hsgthi: { name: 'Thi học sinh giỏi quốc gia', icon: 'sc_hsg', desc: 'Ngồi trong phòng thi số 07 trường THPT chuyên Hoa Đào, đề khó mà tay vẫn viết đều.' },
  anmung: { name: 'Bữa tối ăn mừng', icon: 'sc_anmung', desc: 'Cả nhà đi nhà hàng Sen Hồng ăn mừng giải học sinh giỏi quốc gia.' },
  giaothua: { name: 'Đón giao thừa trên núi', icon: 'sc_giaothua', desc: 'Pháo hoa nở rực trời lúc nửa đêm, cả thành phố chào năm mới.' },
  chuatet: { name: 'Đi chùa đầu năm', icon: 'sc_chua', desc: 'Sáng mùng 1 cùng bố mẹ thắp nhang cầu may.' },
  tetvisit: { name: 'Đi chúc Tết', icon: 'sc_tetvisit', desc: 'Đi chúc Tết bạn bè, thầy cô và nhận lì xì.' },
  trungthu: { name: 'Đêm hội Trung thu', icon: 'sc_trungthu', desc: 'Xem múa lân, rước đèn ông sao quanh phố Hoa Phượng dưới trăng rằm.' },
  hopph: { name: 'Họp phụ huynh', icon: 'sc_hopph', desc: 'Đứng ngoài cửa lớp nghe cô chủ nhiệm đọc bảng xếp hạng cuối học kỳ.' },
  hkpd: { name: 'Hội khoẻ Phù Đổng', icon: 'sc_hkpd', desc: 'Cả lớp thi kéo co, cướp cờ, tung còn, nhảy bao bố với các lớp khác trong trường.' },
  banhchung: { name: 'Hội gói bánh chưng', icon: 'sc_banhchung', desc: 'Cả trường nghỉ học buổi chiều, ngồi quanh mâm lá dong gói bánh đón Tết.' },
  xinxam: { name: 'Xin xăm ở chùa', icon: 'sc_xinxam', desc: 'Lắc ống xăm, hồi hộp chờ thẻ rơi ra.' },
  skip: { name: 'Lần đầu trốn học', icon: 'sc_skip', desc: 'Trèo tường trốn ra ngoài cùng bạn — tim đập thình thịch.' },
  picnic: { name: 'Picnic trên núi', icon: 'sc_picnic', desc: 'Trải tấm bạt trên bãi cỏ, nhìn xuống ngôi trường bé tí.' },
  bien: { name: 'Chuyến đi biển', icon: 'sc_bien', desc: 'Ngồi tàu hoả ra biển, gió mặn và cát trắng.' },
  movie: { name: 'Xem phim cùng bạn', icon: 'sc_movie', desc: 'Hai đứa chia nhau hộp bắp rang trong rạp tối om.' },
  faint: { name: 'Ngất trong giờ học', icon: 'sc_faint', desc: 'Tỉnh dậy ở trạm y tế, cô y tá dặn phải giữ sức khoẻ.' },
  caught: { name: 'Bị giám thị bắt', icon: 'sc_caught', desc: 'Tiếng còi của thầy giám thị — một kỷ niệm khó quên.' },
  ngu: { name: 'Ngủ lại nhà bạn', icon: 'sc_ngu', desc: 'Nằm nói chuyện tới khuya ở nhà bạn thân.' },
  suutam: { name: 'Nhà sưu tầm', icon: 'm_cards', desc: 'Gom đủ trọn bộ thẻ cầu thủ Sao Vàng. Cả trường kháo nhau: muốn xem thẻ hiếm thì cứ tìm tới bạn!' },
  totnghiep: { name: 'Ngày tốt nghiệp', icon: 'sc_totnghiep', desc: 'Ba năm áo trắng khép lại, ai cũng ký tên vào lưu bút.' },
};
const MEMO_NOTE_HEARTS = 3;          // thân từ 3 tim trở lên thì người đó viết lưu bút cho mình vào ngày tốt nghiệp
const MEMO_NOTES = {
  khoa: 'Ê bạn cùng bàn! Ba năm chia nhau cái bàn, chia nhau cả bịch bánh tráng. Lên đại học nhớ nhắn tin cho tớ nha, đừng có quên đó!',
  vy: 'Cảm ơn cậu vì những buổi ôn bài trong thư viện. Mong cậu luôn tự tin và đạt được ước mơ của mình. Hẹn gặp lại ở giảng đường nhé!',
  dat: 'Nhớ mấy trận đá bóng với những lần trốn tiết không? Đỉnh nhất cấp ba luôn! Sau này thành đạt rồi thì bao tớ ly trà sữa nha.',
  ngan: 'Lớn rồi thì cũng đừng quên mấy buổi tô son lén trong nhà vệ sinh nha, hihi. Chúc cậu luôn xinh, luôn vui và thật hạnh phúc!',
  hanh: 'Cô chúc em vững vàng bước vào chặng đường mới. Dù đi đâu cũng nhớ về mái trường Hoa Phượng nhé.',
  lan: 'Keep going! Cô tin em sẽ làm được những điều tuyệt vời. Nhớ giữ thói quen đọc sách mỗi ngày.',
  tung: 'Toán học dạy ta kiên nhẫn. Chúc em kiên trì với mọi bài toán của cuộc đời.',
  manh: 'Sức khoẻ là vốn quý nhất. Ra trường rồi vẫn phải tập thể dục đều đặn đấy nhé!',
  quan: 'Kỷ luật và bản lĩnh — mang theo hai điều đó, em sẽ đi rất xa.',
  parents: 'Con yêu, bố mẹ tự hào về con. Dù con chọn con đường nào, bố mẹ luôn ở bên con.',
};       // ban ngày nằm lên giường nào cũng chợp mắt được
/* ---------- Điểm may mắn: mỗi ngày quay ngẫu nhiên 0–100, xem trên tivi (kênh “Vận may hôm nay”) ---------- */
// test: điểm cộng/trừ tối đa vào bài kiểm tra (may 100 → +test, xui 0 → −test) · tu: may thì dễ “trúng tủ”, xui thì dễ “học tài thi phận”
const LUCK = { test: 0.8, tu: 0.7 };
const LUCK_LV = [   // [ngưỡng dưới, tên, lời khuyên]
  [0, 'Rất xui', 'Hôm nay sao xấu chiếu mệnh. Làm bài kiểm tra dễ gặp cảnh “học tài thi phận” — ôn bài thật kỹ vào nhé!'],
  [20, 'Hơi xui', 'Vận hơi kém một chút. Cẩn thận khi làm bài, đọc kỹ đề trước khi trả lời.'],
  [40, 'Bình thường', 'Một ngày bình thường. Học được bao nhiêu thì điểm phản ánh bấy nhiêu.'],
  [60, 'May mắn', 'Hôm nay khá may! Làm bài kiểm tra dễ được điểm cao hơn mọi ngày.'],
  [80, 'Đại cát', 'Ngày cực kỳ may mắn! Đề dễ “trúng tủ”, điểm kiểm tra cao hơn hẳn. Tranh thủ xung phong lên bảng đi!'],
];

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
// r: độ hiếm 0 Thường · 1 Hiếm · 2 Siêu hiếm · 3 Huyền thoại · club: câu lạc bộ · nat: quốc tịch (cầu thủ nào cũng có đủ CLB và quốc tịch)
const CARD_RARITY = [
  { name: 'Thường', w: 62, col: '#8fa0ab' }, { name: 'Hiếm', w: 28, col: '#3b82c4' },
  { name: 'Siêu hiếm', w: 9, col: '#f2a93b' }, { name: 'Huyền thoại', w: 1, col: '#d9534f' },
];
// 6 chỉ số: mỗi chỉ số chỉ được chọn so tài MỘT lần trong một trận (không spam một chỉ số mạnh nhất)
const CARD_STATS = [['atk', 'Tấn công', 'TC'], ['def', 'Phòng thủ', 'PT'], ['spd', 'Tốc độ', 'TĐ'], ['str', 'Sức mạnh', 'SM'], ['tec', 'Kỹ thuật', 'KT'], ['iq', 'Tư duy', 'IQ']];
const cardPower = c => CARD_STATS.reduce((s, [k]) => s + c[k], 0);
const CARD_POS = { tm: 'Thủ môn', hv: 'Hậu vệ', tv: 'Tiền vệ', td: 'Tiền đạo' };
const CARD_CLUBS = { HP: { name: 'Hoa Phượng FC', col: '#d9534f', kit: ['#d9534f', '#ffe066'] }, SX: { name: 'Sông Xanh', col: '#3b82c4', kit: ['#3b82c4', '#fffaf0'] }, CB: { name: 'Cảng Biển', col: '#2e9e86', kit: ['#2e9e86', '#fffaf0'] }, ND: { name: 'Núi Đá', col: '#8a5a3a', kit: ['#8a5a3a', '#f2c94c'] } };
const CARD_NATS = { VN: { name: 'Việt Nam', col: '#da251d' }, NB: { name: 'Nhật Bản', col: '#ffffff', fg: '#bc002d' }, TH: { name: 'Thái Lan', col: '#2d2a4a' }, BR: { name: 'Brazil', col: '#009c3b', fg: '#ffdf00' } };
const CARDS = [
  ['Tùng “Tay Nhện”', 'tm', 0, 2, 6, 3, 2, 2, 6, 'HP', 'VN'], ['Đức “Găng Sắt”', 'tm', 0, 1, 7, 3, 3, 2, 3, 'SX', 'VN'],
  ['Lâm “Lá Chắn”', 'hv', 0, 2, 6, 4, 6, 1, 3, 'CB', 'VN'], ['Hùng “Xe Ủi”', 'hv', 0, 3, 6, 2, 6, 1, 4, 'ND', 'VN'], ['Phong “Bóng Ma”', 'hv', 0, 3, 5, 5, 4, 2, 2, 'HP', 'VN'],
  ['Nam “Con Thoi”', 'tv', 0, 4, 4, 5, 2, 6, 4, 'SX', 'VN'], ['Quân “Nhạc Trưởng”', 'tv', 0, 5, 4, 3, 3, 4, 6, 'CB', 'VN'], ['Bảo “Máy Quét”', 'tv', 0, 3, 5, 4, 1, 4, 6, 'ND', 'VN'], ['Tài “Ong Thợ”', 'tv', 0, 4, 5, 4, 2, 6, 4, 'HP', 'VN'],
  ['Minh “Chớp”', 'td', 0, 5, 2, 6, 4, 3, 2, 'CB', 'VN'], ['Sơn “Búa Tạ”', 'td', 0, 6, 3, 2, 5, 4, 4, 'ND', 'VN'], ['Việt “Cáo Già”', 'td', 0, 6, 2, 4, 2, 5, 1, 'SX', 'VN'],
  ['Khánh “Người Nhện”', 'tm', 1, 2, 9, 5, 6, 5, 6, 'CB', 'VN'], ['Trung “Bức Tường”', 'hv', 1, 4, 9, 4, 8, 2, 6, 'HP', 'VN'], ['Hải “Mũi Khoan”', 'hv', 1, 6, 7, 7, 6, 4, 6, 'SX', 'VN'],
  ['Long “Phù Thuỷ”', 'tv', 1, 8, 5, 6, 4, 8, 6, 'ND', 'VN'], ['Kiên “La Bàn”', 'tv', 1, 7, 7, 5, 4, 5, 7, 'HP', 'VN'], ['Duy “Tia Chớp”', 'td', 1, 7, 3, 9, 7, 6, 6, 'SX', 'VN'], ['Thắng “Sát Thủ”', 'td', 1, 9, 3, 6, 4, 7, 3, 'CB', 'VN'],
  ['Vũ “Thần Giữ Cửa”', 'tm', 2, 3, 11, 7, 8, 8, 8, 'ND', 'VN'], ['Cường “Đá Tảng”', 'hv', 2, 6, 11, 6, 10, 5, 8, 'SX', 'VN'], ['An “Bậc Thầy”', 'tv', 2, 10, 8, 8, 5, 9, 11, 'CB', 'VN'], ['Hoàng “Vua Phá Lưới”', 'td', 2, 11, 5, 9, 8, 10, 6, 'HP', 'VN'],
  ['Rồng Vàng “Số 10 huyền thoại”', 'tv', 3, 12, 10, 11, 10, 10, 12, 'HP', 'VN'],
  ['Kenji “Samurai”', 'tv', 1, 7, 6, 7, 6, 6, 8, 'CB', 'NB'], ['Somchai “Voi Chiến”', 'hv', 1, 5, 9, 4, 6, 4, 4, 'SX', 'TH'], ['Rafael “Vũ Công”', 'td', 2, 11, 4, 10, 8, 10, 6, 'HP', 'BR'],
  ['Takumi “Mũi Tên”', 'td', 0, 6, 2, 6, 4, 4, 3, 'ND', 'NB'], ['Anan “Rắn Hổ Mang”', 'tv', 0, 5, 4, 4, 1, 4, 6, 'CB', 'TH'], ['Lucas “Thần Đèn”', 'tm', 1, 2, 9, 6, 5, 4, 5, 'ND', 'BR'],
  ['Hiro “Lá Thép”', 'hv', 0, 2, 7, 3, 6, 1, 3, 'HP', 'NB'], ['Chaiya “Cơn Lốc”', 'td', 1, 8, 3, 8, 7, 6, 6, 'ND', 'TH'], ['Diego “Bò Tót”', 'hv', 2, 7, 11, 6, 8, 6, 6, 'CB', 'BR'],
  ['Yuto “Cánh Én”', 'tv', 0, 4, 3, 6, 2, 6, 4, 'SX', 'NB'], ['Pedro “Pháp Sư”', 'tv', 3, 11, 9, 12, 10, 10, 12, 'SX', 'BR'], ['Quang “Đội Trưởng”', 'hv', 1, 5, 8, 5, 6, 4, 6, 'HP', 'VN'],
].map(([name, pos, r, atk, def, spd, str, tec, iq, club, nat], i) => ({ id: 'c' + String(i + 1).padStart(2, '0'), no: i + 1, name, pos, r, atk, def, spd, str, tec, iq, club, nat }));
const CARD_BY_ID = {}; for (const c of CARDS) CARD_BY_ID[c.id] = c;
// Lương cầu thủ: hiếm và mạnh thì lương cao — tổng lương đội hình không được vượt trần
const cardSal = c => [3, 5, 8, 12][c.r] + Math.max(0, Math.floor((cardPower(c) - 26) / 12));
// Đội hình: đúng 11 người khác nhau, đúng 1 thủ môn, ít nhất 2 hậu vệ, 2 tiền vệ, 1 tiền đạo; tổng lương ≤ cap
const SQUAD = { size: 11, cap: 55, need: { tm: [1, 1], hv: [2, 9], tv: [2, 9], td: [1, 9] } };
// Trận đấu thẻ: 5 lượt, ai thắng 3 lượt trước thắng; người ra lệnh chọn chỉ số và 3–5 lá
const MATCH = { rounds: 5, win: 3, nMin: 3, nMax: 5 };
// Tỉ lệ độ hiếm trong bộ thẻ của đối thủ, theo trình
const DUEL_TIER = { 'gà': [72, 24, 4, 0], kha: [60, 30, 9, 1], caothu: [45, 35, 17, 3], lop: [65, 28, 6, 1] };
const CARD_SET_REWARD = 200000;

/* ---------- Tiện ích lịch & định dạng ---------- */
function cal(day) {
  const doy = ((day % YEAR_DAYS) + YEAR_DAYS) % YEAR_DAYS;
  const season = Math.floor(doy / CFG.DAYS_PER_SEASON);
  return { day, year: Math.floor(day / YEAR_DAYS), doy, season, dos: doy % CFG.DAYS_PER_SEASON + 1, dow: ((day % 7) + 7) % 7, sName: SEASONS[season].name };
}
function holidayOf(day) { const c = cal(day); return HOLIDAYS.find(h => h.season === c.season && h.day === c.dos) || null; }
function isSchoolDayRaw(day) { const c = cal(day); return SEASONS[c.season].school && c.dow < 5 && !holidayOf(day); }
// Ngày họp phụ huynh = ngày học cuối cùng của mỗi học kỳ (sau ngày thi cuối): cả ngày nghỉ học (04n_meeting.js)
const _pmDays = {};
function pmDayOf(year, semId) {
  const k = year + '-' + semId; if (_pmDays[k] !== undefined) return _pmDays[k];
  const s = SEMESTERS.find(q => q.id === semId), base = year * YEAR_DAYS;
  let d = -1; for (let i = s.to; i >= s.from; i--) if (isSchoolDayRaw(base + i)) { d = base + i; break; }
  return (_pmDays[k] = d);
}
function isPmDay(day) { const s = semOf(day); return !!s && pmDayOf(cal(day).year, s.id) === day; }
function isSchoolDay(day) { return isSchoolDayRaw(day) && !isPmDay(day); }
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
// Hạnh kiểm giới hạn học lực: TB hạnh kiểm của kỳ dưới 8 thì không được Giỏi, dưới 6 không được Khá, dưới 5 không được Trung bình
const HL_ORDER = ['Yếu', 'Trung bình', 'Khá', 'Giỏi'];
function capByConduct(hl, hk) {
  if (!HL_ORDER.includes(hl) || hk === null || hk === undefined || isNaN(hk)) return hl;
  const cap = hk >= 8 ? 3 : hk >= 6 ? 2 : hk >= 5 ? 1 : 0;
  return HL_ORDER.indexOf(hl) > cap ? HL_ORDER[cap] : hl;
}
function hanhKiem(p) {
  if (p === null || p === undefined) return '–';
  if (p >= 8) return 'Tốt'; if (p >= 6) return 'Khá'; if (p >= 4) return 'Trung bình'; return 'Yếu';
}
