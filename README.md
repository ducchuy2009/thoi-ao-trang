# Thời Áo Trắng — mô phỏng đời học sinh cấp 3

Game chạy trên trình duyệt, không cần cài gì: mở `index.html`.
Toàn bộ đồ hoạ pixel được vẽ bằng code, không dùng file ảnh.

## Bố cục thành phố

```
                 Ga tàu ──(tàu hoả)── Bãi biển
                   │
Khu phố nhà mình ─ Phố Hoa Phượng ─ Trường ── lối mòn vòng sau trường ── Núi
(nhà, tạp hoá,     (nhà bạn bè, trà sữa,   (cổng, sân, lớp, phòng thí nghiệm,
 công viên)         TTTM, khu game —        trạm y tế, phòng nhạc, thư viện,
                    đều vào được)          phòng ngủ trưa, khu vệ sinh)
                   │
                 Bờ sông (câu cá)
```

Đi bộ dọc đường qua từng khu (mỗi ranh giới +10 phút), đi xe đạp / xe máy của mình (bấm vào xe ở sân nhà, `X` để xuống), hoặc ra trạm bấm vào **xe bus** rồi chọn điểm đến (vé đồng giá, càng xa càng lâu). Biển chỉ đi được bằng tàu.

## Cấu trúc mã nguồn

| File | Nội dung |
|---|---|
| `src/01_data.js` | Cấu hình và số liệu cân bằng: giờ giấc, mùa, học kỳ, ngày lễ, môn học, thời khoá biểu, việc nhà, phương tiện, cửa hàng, thiện cảm bố mẹ, bảng "làm việc riêng" và "quậy", buổi thực hành, hệ số điểm, xếp loại |
| `src/02_art.js` | Đồ hoạ: nhân vật chibi (4 hướng, hoạt ảnh đi bộ, trang phục), vật thể, nền |
| `src/02b_art2.js` | Đồ hoạ bổ sung: TTTM, khu game, trà sữa, núi, xe bus, tàu, ga, biển, bờ sông, đạo cụ hoạt cảnh, biểu tượng vật phẩm cho thanh đồ, chân dung hội thoại và thẻ cầu thủ |
| `src/03_maps.js` | Bản đồ: Nhà, Khu phố, Phố Hoa Phượng, Trường, Lớp học, Phòng thí nghiệm, Núi, Bờ sông, Ga tàu, Bãi biển; các bản đồ chỉ dùng cho hoạt cảnh (nhà vệ sinh nam/nữ, cảnh xe chạy, cảnh tàu chạy); vật thể tương tác và NPC |
| `src/03b_maps2.js` | Các phòng vào được: trong trường (trạm y tế, phòng nhạc, thư viện, phòng ngủ trưa, khu vệ sinh — cửa nằm trên dãy nhà chính), bên trong TTTM (7 gian hàng), khu game (quầy xèng + các máy), nhà bạn (phòng khách + phòng riêng), đồ trang trí phòng ngủ ở nhà |
| `src/04_game.js` | Luật chơi: đồng hồ, ngày mới/đi ngủ, tiết học, kiểm tra, điểm, hạnh kiểm, qua cổng trường, việc nhà, buôn bán |
| `src/04a_family.js` | Bố mẹ: lịch trong ngày, tìm đường A*, ra cửa lấy xe đi làm, đi chợ; trò chuyện, đấm lưng; về muộn |
| `src/04b_mischief.js` | Làm việc riêng trong giờ, trốn học cùng bạn (ra ngoài thật, thời gian trôi thật, qua cổng trường mới là về lớp), quậy trong trường, tố cáo bạn (có hoạt cảnh bị phạt), buổi thực hành và vật lý của minigame |
| `src/04c_social.js` | Đi lại (ranh giới các khu, xe của mình, xe bus, tàu), câu cá, biển; bộ máy hoạt cảnh `playCut` (lau nhà, rửa xe, đấm lưng, trèo tường, bị giám thị bắt, giải lao); quay sang bạn trong giờ học; mượn sách; sự kiện trong giờ và giờ nghỉ trưa; trà sữa/TTTM/khu game/picnic; thẻ cầu thủ; nhắn tin và hẹn đi chơi |
| `src/04d_life.js` | Đời sống học đường: tụ chơi giờ ra chơi / nghỉ trưa (`yardState`, `yardPos`), đạo cụ và hoạt ảnh trong tiết học (`classProps`, `handOut` phát đề, `toTeacherDesk` lên trả bài), ngất xỉu (`faintFlow`), các phòng mới (`ACT.nap`, `ACT.readBook`, `ACT.music`, `ACT.stall`, `ACT.infirmary`), gian hàng TTTM, máy chơi game, nhà bạn, danh bạ điện thoại, hoạt ảnh nhổ cỏ / đá bóng |
| `src/05_ui.js` | HUD, thanh đồ, hộp thoại (hội thoại với nhân vật nằm dưới màn hình kèm chân dung), minigame, túi đồ, điện thoại, và **menu chung** dạng tab icon (`MV`): Chỉ số, Bạn bè, Thời khoá biểu, Học bạ, Lịch, Thẻ cầu thủ, Cài đặt (kèm mã thử nghiệm và du hành thời gian) |
| `src/05b_games.js` | Khung mini-game `UI.game()` + các trò (`GAMES`): tâng cầu, bấm mũi tên theo nhịp, nốt nhạc rơi, ném xiên (Lý), pha chế (Hoá), ghép hình (Quốc phòng), kính hiển vi (Sinh), trốn tìm, gắp thú, máy may rủi — trò nào cũng có nút Bỏ qua. Cửa hàng dạng icon `UI.store()` |
| `src/06_engine.js` | Vòng lặp, WASD + chuột phải, va chạm, camera, vẽ, bong bóng thoại của cắt cảnh |
| `build.py` | Gộp tất cả thành một file: `index.html` (ở gốc, để mở trực tiếp) và `dist/index.html` |

Sửa xong chạy `python3 build.py`.

## Chỗ hay chỉnh

Trong `01_data.js`:

- `CFG` — tốc độ thời gian, giờ vào học (`GATE_TIME` 08:00), giờ bố mẹ đi làm (07:30), giờ phải về nhà (`LATE_HOME` 20:00 — chỉ áp dụng NGÀY ĐI HỌC; đã về nhà sau khi tan học rồi mới đi chơi tiếp, hoặc đã xin phép, thì không bị mắng; thứ 7, chủ nhật, ngày nghỉ về muộn thoải mái), số ngày học trước khi có kiểm tra miệng / 15'.
- `WALK_HOP`, `VEHICLES`, `BUS_STOPS`, `BUS_MIN_PER_HOP`, `TRAIN` — đi lại: phút mất thêm khi đi bộ qua ranh giới khu, tốc độ từng loại xe, các bến xe bus, giá và thời gian tàu.
- `FISH`, `FISHING`, `BEACH` — câu cá và các hoạt động ở biển.
- `FRIENDS[*].bday`, `PARENT_BDAY`, `FESTIVALS` (để trống, định nghĩa sau), `HOLIDAYS` — những gì hiện trên Lịch.
- `IN_CLASS` — rủi ro và mức mất tập trung khi chủ động quay sang bạn trong giờ học.
- `SEASONS`, `SEMESTERS` — năm học bắt đầu mùa Thu; HK1 = Thu → Đông 15, HK2 = Đông 16 → hết Xuân, rồi nghỉ hè. `HOLIDAYS` — ngày lễ (đang để sẵn Tết, Xuân 1–3).
- `TIMETABLE` — thời khoá biểu; các ô `th_ly`, `th_hoa`, `th_sinh`, `th_qp` là buổi thực hành.
- `PARENT`, `parentNeed()` — điểm thiện cảm cộng/trừ và ngưỡng lên cấp tiền tiêu vặt.
- `CLASS_FUN`, `MISCHIEF`, `FRIEND_LIKES` — các trò làm việc riêng / quậy: thời gian, điểm tình bạn, xác suất bị bắt (`risk`), mức nghiêm trọng (`sev`). `INVITE_ACCEPT` — khả năng bạn nhận lời khi mình chủ động rủ. `OUTING_FRIEND_RATE` — hệ số điểm thân thiết khi đi chơi sau giờ học (không rủi ro).
- `TEACHERS`, `TEACHER`, `CHEAT`, `SNITCH` — thiện cảm của TỪNG thầy cô (giáo viên bộ môn quý thì chấm môn đó nhẹ tay, khó bắt quay cóp), quay cóp, tố cáo bạn rủ rê. `SOCIETY` — người ngoài xã hội hiện trong tab Bạn bè.
- `PERIODS`, `AM_END`, `PM_START`, `CFG.SCHOOL_END` — giờ các tiết (hai tiết liền nhau rồi ra chơi 20', không còn nghỉ 10' giữa tiết). `COEF` — hệ số điểm (đang để 1 hết: đã bỏ hệ số nhân).
- `SKIP` — trốn học cùng bạn: khả năng bạn nhận lời, nguy cơ bị bắt. `SELL_FOOD`, `SELL_CARD` — giá bán đồ ăn, thẻ cho bạn.
- `CHEATS` — mã thử nghiệm dán vào Cài đặt → Cài đặt khác → Dán mã (không phân biệt hoa thường): `HI!IAMBILLGATES` (+100.000.000đ), `HI!IAMCIRI` (du hành tới một ngày bất kỳ trên lịch), `HI!IAMBALDER` (+2 thiện cảm với mọi nhân vật).
- `OUTING` — xin tiền bố mẹ đi chơi · `BORROW` — khả năng mượn được sách/bút · `BREAK_FUN` — trò giải lao giữa 2 tiết · `LUNCH_EVENT_CHANCE`, `CLASS_EVENT_CHANCE` — tần suất sự kiện.
- `PLACES`, `MALL`, `ARCADE`, `TEA`, `PICNIC`, `TRAVEL`, `HILL_HOURS` — địa điểm vui chơi: giờ mở cửa, giá, thời gian, điểm thưởng.
- `CARDS`, `CARD_RARITY`, `DUEL_TIER`, `CARD_SET_REWARD` — bộ thẻ cầu thủ, tỉ lệ độ hiếm, trình của đối thủ khi đấu thẻ.
- `DIFF_WEIGHTS`, `practicalReward()` — xác suất độ khó và điểm thưởng buổi thực hành. `PRACTICALS[*].game` — mỗi buổi thực hành dùng mini-game nào.
- `LESSON_STAM`, `FAINT`, `INFIRM`, `NAP` — thể lực mất sau mỗi tiết; vào tiết mà thể lực ≤ `FAINT.at` thì ngất, được đưa xuống trạm y tế và nghỉ luôn buổi học. Ngủ trưa chỉ được ở phòng ngủ trưa.
- `YARD_GAMES`, `YARD_JOIN` — các tụ chơi ngoài sân (số người, mini-game khi mình xin vào, điểm thân thiết). `SMOKE` — trốn trong buồng vệ sinh hút thuốc (hồi thể lực, nguy cơ bị giám thị bắt).
- `MUSIC` — phòng nhạc / micro ở nhà: số lần mỗi ngày, điểm Văn nghệ theo kết quả mini-game. `LIBRARY` — đọc sách ở tủ từng môn.
- `MALL_STALLS`, `MALL_GOODS` — các gian hàng trong TTTM và hàng bán (đồ trang trí phòng `d_*`, micro, guitar, dụng cụ thể thao). `DECOR_SLEEP` — mỗi món trang trí giúp ngủ hồi thêm thể lực. `TOKENS`, `MACHINES` — giá xèng và số xèng mỗi máy.
- `FRIEND_HOME_HEARTS`, `FRIEND_ROOM_HEARTS`, `PHONE_HEARTS`, `FH` — độ thân cần để vào nhà bạn, vào phòng riêng, xin số điện thoại.

Trong `04_game.js`: `testScore()` là công thức làm bài kiểm tra (năng lực môn + may rủi, "trúng tủ", "học tài thi phận").
Trong `04b_mischief.js`: `MGP` là thông số của minigame giữ-thanh kiểu cũ (giờ chỉ còn dùng cho câu cá). Các mini-game mới chỉnh ngay trong `GAMES` (`05b_games.js`).
Trong `04d_life.js`: `YARD_SPOT`, `HIDE_SPOTS`, `EAT_SEATS` là vị trí các tụ chơi ngoài sân.
Trong `04a_family.js`: `SCHED` là lịch trong ngày của bố và mẹ, `POI` là các điểm bố mẹ lui tới.

Trong `04c_social.js`: `LINKS` là ranh giới giữa các khu (đi tới đâu, mất bao lâu); `CUTS`, `VENUE`, `wallCut()`, `mopCut()`, `washCut()`, `massageCut()` là kịch bản các hoạt cảnh (vị trí nhân vật, lời thoại, đạo cụ, các bước `say` / `move` / `hop`); `classAction()` là menu quay sang bạn trong giờ học; `classEvent()` và `runLunchEvent()` là các sự kiện trong giờ học / giờ nghỉ trưa; `MSG_TAM` là câu trả lời tin nhắn của từng bạn.

## Điều khiển

`W` `A` `S` `D` di chuyển · chuột phải (hoặc `E`) tương tác · `Q` quay sang bạn trong giờ học · `X` xuống xe · `B` túi đồ · `Esc` / `M` menu (`C` chỉ số · `F` bạn bè · `T` thời khoá biểu · `G` học bạ · `L` lịch · `K` thẻ) · `P` điện thoại. Thanh đồ ở cạnh dưới cho biết đang mang gì; bấm vào đồ ăn để ăn. Game tự lưu mỗi khi đi ngủ.
