# Thời Áo Trắng — mô phỏng đời học sinh cấp 3

Game chạy trên trình duyệt, không cần cài gì: mở `dist/index.html`.
Toàn bộ đồ hoạ pixel được vẽ bằng code, không dùng file ảnh.

## Cấu trúc mã nguồn

| File | Nội dung |
|---|---|
| `src/01_data.js` | Cấu hình và số liệu cân bằng: giờ giấc, mùa, học kỳ, ngày lễ, môn học, thời khoá biểu, việc nhà, phương tiện, cửa hàng, thiện cảm bố mẹ, bảng "làm việc riêng" và "quậy", buổi thực hành, hệ số điểm, xếp loại |
| `src/02_art.js` | Đồ hoạ: nhân vật chibi (4 hướng, hoạt ảnh đi bộ, trang phục), vật thể, nền |
| `src/03_maps.js` | 5 bản đồ: Nhà, Khu phố, Sân trường, Lớp học, Phòng thí nghiệm; vật thể tương tác và NPC |
| `src/04_game.js` | Luật chơi: đồng hồ, ngày mới/đi ngủ, tiết học, kiểm tra, điểm, hạnh kiểm, đi lại, việc nhà, bạn bè, buôn bán |
| `src/04a_family.js` | Bố mẹ: lịch trong ngày, tìm đường A*, ra cửa lấy xe đi làm, đi chợ; trò chuyện, đấm lưng; về muộn |
| `src/04b_mischief.js` | Làm việc riêng trong giờ, trốn học/quậy cùng bạn, buổi thực hành và vật lý của minigame |
| `src/05_ui.js` | HUD, hộp thoại, minigame, cặp sách, chỉ số, thời khoá biểu, sổ điểm, cài đặt |
| `src/06_engine.js` | Vòng lặp, WASD + chuột phải, va chạm, camera, vẽ |
| `build.py` | Gộp tất cả thành một file `dist/index.html` |

Sửa xong chạy `python3 build.py`.

## Chỗ hay chỉnh

Trong `01_data.js`:

- `CFG` — tốc độ thời gian, giờ vào học (`GATE_TIME` 08:00), giờ bố mẹ đi làm (07:30), giờ phải về nhà (20:00), số ngày học trước khi có kiểm tra miệng / 15'.
- `SEASONS`, `SEMESTERS` — năm học bắt đầu mùa Thu; HK1 = Thu → Đông 15, HK2 = Đông 16 → hết Xuân, rồi nghỉ hè. `HOLIDAYS` — ngày lễ (đang để sẵn Tết, Xuân 1–3).
- `TIMETABLE` — thời khoá biểu; các ô `th_ly`, `th_hoa`, `th_sinh`, `th_qp` là buổi thực hành.
- `PARENT`, `parentNeed()` — điểm thiện cảm cộng/trừ và ngưỡng lên cấp tiền tiêu vặt.
- `CLASS_FUN`, `MISCHIEF`, `FRIEND_LIKES` — các trò làm việc riêng / quậy: thời gian, điểm tình bạn, xác suất bị bắt (`risk`), mức nghiêm trọng (`sev`).
- `DIFF_WEIGHTS`, `practicalReward()` — xác suất độ khó và điểm thưởng buổi thực hành.

Trong `04_game.js`: `testScore()` là công thức làm bài kiểm tra (năng lực môn + may rủi, "trúng tủ", "học tài thi phận").
Trong `04b_mischief.js`: `MGP` là toàn bộ thông số của minigame (độ rộng vùng xanh theo cấp, tốc độ kim theo độ khó).
Trong `04a_family.js`: `SCHED` là lịch trong ngày của bố và mẹ, `POI` là các điểm bố mẹ lui tới.
