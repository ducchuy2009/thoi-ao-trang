# Thời Áo Trắng — mô phỏng đời học sinh cấp 3

Game chạy trên trình duyệt, không cần cài gì: mở `index.html`.
Toàn bộ đồ hoạ pixel được vẽ bằng code, không dùng file ảnh.

## Bố cục thành phố

```
                 Ga tàu ──(tàu hoả)── Bãi biển
                   │
Khu phố nhà mình ─ Phố Hoa Phượng ─ Trường ── lối mòn vòng sau trường ── Núi
(nhà, tạp hoá,     (nhà bạn bè, trà sữa,   (cổng, sân, lớp, phòng thí nghiệm, nhà vệ sinh nam/nữ,
 nhà cô Hạnh,       TTTM, khu game —        trạm y tế, phòng nhạc, thư viện,
 nhà thầy Tùng,     đều vào được)          phòng ngủ trưa)
 công viên)        │
   │             Bờ sông (câu cá)
   │               │
 Chùa Hoa Phượng ──┘
 (thắp nhang, xin xăm)
```

Đi bộ dọc đường qua từng khu (mỗi ranh giới +10 phút), đi xe đạp / xe máy của mình (bấm vào xe ở sân nhà, `X` để xuống), hoặc ra trạm bấm vào **xe bus** rồi chọn điểm đến (vé đồng giá, càng xa càng lâu). Biển chỉ đi được bằng tàu.

## Cấu trúc mã nguồn

| File | Nội dung |
|---|---|
| `src/01_data.js` | Cấu hình và số liệu cân bằng: giờ giấc, mùa, học kỳ, ngày lễ, môn học, thời khoá biểu, việc nhà, phương tiện, cửa hàng, thiện cảm bố mẹ, bảng "làm việc riêng" và "quậy", buổi thực hành, hệ số điểm, xếp loại |
| `src/02_art.js` | Đồ hoạ: nhân vật chibi (4 hướng, hoạt ảnh đi bộ, trang phục), vật thể, nền |
| `src/02b_art2.js` | Đồ hoạ bổ sung: TTTM, khu game, trà sữa, núi, xe bus, tàu, ga, biển, bờ sông, đạo cụ hoạt cảnh, biểu tượng vật phẩm cho thanh đồ, chân dung hội thoại và thẻ cầu thủ |
| `src/03_maps.js` | Bản đồ: Nhà, Khu phố, Phố Hoa Phượng, Trường, Lớp học, Phòng thí nghiệm, Núi, Bờ sông, Ga tàu, Bãi biển; các bản đồ chỉ dùng cho hoạt cảnh (nhà vệ sinh nam/nữ, cảnh xe chạy, cảnh tàu chạy); vật thể tương tác và NPC |
| `src/03b_maps2.js` | Các phòng vào được: trong trường (trạm y tế, phòng nhạc, thư viện, phòng ngủ trưa — cửa trên dãy nhà chính; khối nhà vệ sinh riêng NAM / NỮ ở góc sân cạnh nhà xe, `WC_BLOCK`), bên trong TTTM (7 cửa hàng, mỗi nhà một kiểu, có nhân viên đứng quầy — `addShop`, `MALL_VENDOR`), khu game (quầy xèng + các máy), nhà bạn (phòng khách + phòng riêng), đồ trang trí phòng ngủ ở nhà |
| `src/04_game.js` | Luật chơi: đồng hồ, ngày mới/đi ngủ, tiết học, kiểm tra, điểm, hạnh kiểm, qua cổng trường, việc nhà, buôn bán |
| `src/04a_family.js` | Bố mẹ: lịch trong ngày, tìm đường A*, ra cửa lấy xe đi làm, đi chợ; trò chuyện, đấm lưng; về muộn |
| `src/04b_mischief.js` | Làm việc riêng trong giờ, trốn học cùng bạn (ra ngoài thật, thời gian trôi thật, qua cổng trường mới là về lớp), quậy trong trường, tố cáo bạn (có hoạt cảnh bị phạt), buổi thực hành và vật lý của minigame |
| `src/04c_social.js` | Đi lại (ranh giới các khu, xe của mình, xe bus, tàu), câu cá, biển; bộ máy hoạt cảnh `playCut` (lau nhà, rửa xe, đấm lưng, trèo tường, bị giám thị bắt, giải lao); quay sang bạn trong giờ học; mượn sách; sự kiện trong giờ và giờ nghỉ trưa; trà sữa/TTTM/khu game/picnic; thẻ cầu thủ; nhắn tin và hẹn đi chơi |
| `src/04d_life.js` | Đời sống học đường: tụ chơi giờ ra chơi / nghỉ trưa (`yardState`, `yardPos`), đạo cụ và hoạt ảnh trong tiết học (`classProps`, `handOut` phát đề, `toTeacherDesk` lên trả bài), ngất xỉu (`faintFlow`), các phòng mới (`ACT.nap`, `ACT.readBook`, `ACT.music`, `ACT.stall`, `ACT.infirmary`), gian hàng TTTM, máy chơi game, nhà bạn, danh bạ điện thoại, hoạt ảnh nhổ cỏ / đá bóng |
| `src/04e_events.js` | Sự kiện và kỷ niệm: lưu bút (`addMemo`, `graduationDay`), chùa (`ACT.incense`, ống xăm `xinxamUI`), Tết (`tetMorning`, `templeWithFamily`, `tetVisitFriend`, `ACT.teacherHouse`), đêm giao thừa (`eveInvite`, `startFest`, `leaveFest`, `fireworksCut`, các trò `ACT.festGame / festJoin / festSkip`), hội thi gói bánh chưng (`bcAsk`, `bcGame`, `bcContest`, `winPhotoCut`), `eventTick()` điều phối mỗi khung hình |
| `src/04f_cards.js` | Đấu thẻ cầu thủ chiến thuật: đội hình (`squadIssues`, `autoSquad`), bộ thẻ đối thủ (`genDeck`, `oppDeck`), cộng chỉ số theo màu áo (`teamBonus`), trận 5 lượt (`cardMatch`), `cardDuel`, tụ đấu thẻ và hướng dẫn của anh Phong (`cardGroupTalk`) |
| `src/05_ui.js` | HUD, thanh đồ, hộp thoại (hội thoại với nhân vật nằm dưới màn hình kèm chân dung), minigame, túi đồ, điện thoại, và **menu chung** dạng tab icon (`MV`): Chỉ số, Bạn bè, Thời khoá biểu, Học bạ, Lịch, Thẻ cầu thủ, Cài đặt (kèm mã thử nghiệm và du hành thời gian) |
| `src/05b_games.js` | Khung mini-game `UI.game()` + các trò (`GAMES`): tâng cầu, bấm mũi tên theo nhịp, nốt nhạc rơi, ném xiên (Lý), pha chế (Hoá), ghép hình (Quốc phòng), kính hiển vi (Sinh), trốn tìm, gắp thú, máy may rủi — trò nào cũng có nút Bỏ qua. Cửa hàng dạng icon `UI.store()` |
| `src/05c_memo.js` | Tab Lưu bút trong menu: kỷ vật · khoảnh khắc · lời lưu bút |
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
- `CHEATS` — mã thử nghiệm dán vào Cài đặt → Cài đặt khác → Dán mã (không phân biệt hoa thường): `HI!IAMBILLGATES` (+100.000.000đ), `HI!IAMCIRI` (du hành tới một ngày bất kỳ trên lịch), `HI!IAMBALDER` (+2 thiện cảm với mọi nhân vật). `HI!IAMDAVINCI` — mọi môn học (lý thuyết, thực hành, quốc phòng, thể dục) lên thêm 1 cấp.
- `OUTING` — xin tiền bố mẹ đi chơi · `BORROW` — khả năng mượn được sách/bút · `BREAK_FUN` — trò giải lao giữa 2 tiết · `LUNCH_EVENT_CHANCE`, `CLASS_EVENT_CHANCE` — tần suất sự kiện.
- `PLACES`, `MALL`, `ARCADE`, `TEA`, `PICNIC`, `TRAVEL`, `HILL_HOURS` — địa điểm vui chơi: giờ mở cửa, giá, thời gian, điểm thưởng.
- `CARDS` (36 thẻ, mỗi thẻ có CLB `club` và có thể có đội tuyển `nat`), `CARD_CLUBS`, `CARD_NATS`, `CARD_RARITY`, `cardSal()` (lương theo độ hiếm + sức mạnh), `SQUAD` (đội hình 11 người: 1 thủ môn, ≥2 hậu vệ, ≥2 tiền vệ, ≥1 tiền đạo, tổng lương ≤ 55), `MATCH` (5 lượt, thắng 3, mỗi lượt 3–5 lá), `DUEL_TIER` (độ mạnh bộ thẻ đối thủ), `CARD_SET_REWARD`.
  Đấu thẻ (`04f_cards.js`): lượt đầu oẳn tù xì giành quyền ra lệnh; người ra lệnh chọn chỉ số (Tấn công / Phòng thủ / Tốc độ) và số lá; hai bên chọn đúng số lá đó; cầu thủ cùng CLB hoặc cùng đội tuyển ra sân chung thì mỗi người +(số người cùng nhóm − 1); tổng cao hơn thắng lượt; người thua lượt được ra lệnh lượt sau. Thắng trận: mở album người thua chọn 1 thẻ. Thua: đối thủ lấy 1 thẻ trong đội hình. Lần đầu ghé **tụ đấu thẻ** ngoài sân giờ ra chơi, anh Phong (11A1) hướng dẫn, cho mượn bộ thẻ đấu thử rồi tặng 11 thẻ (thắng anh ấy được thêm 1 thẻ Hiếm trở lên — may mắn quyết định độ hiếm). Hôm nào may mắn thì bóc bim bim dễ ra thẻ hiếm. Đủ bộ được tiền thưởng và hồi ký “Nhà sưu tầm” trong lưu bút. Xếp đội hình ở Menu → Thẻ cầu thủ → Đội hình (có nút xếp tự động).
- `DIFF_WEIGHTS`, `practicalReward()` — xác suất độ khó và điểm thưởng buổi thực hành. `PRACTICALS[*].game` — mỗi buổi thực hành dùng mini-game nào.
- `LESSON_STAM`, `FAINT`, `INFIRM`, `NAP` — thể lực mất sau mỗi tiết; vào tiết mà thể lực ≤ `FAINT.at` thì ngất, được đưa xuống trạm y tế và nghỉ luôn buổi học. Ngủ trưa chỉ được ở phòng ngủ trưa.
- `YARD_GAMES`, `YARD_JOIN` — các tụ chơi ngoài sân (số người, điểm thân thiết khi vào chơi cùng). Nói chuyện với bất kỳ bạn nào trong tụ là bạn ấy rủ vào chơi; vào chơi là một hoạt cảnh chơi chung, không có mini-game. Lời thoại ở `YARD_ASK`, `YARD_LINES` (`04d_life.js`). `SMOKE` — trốn trong buồng vệ sinh hút thuốc (hồi thể lực, nguy cơ bị giám thị bắt).
- `MUSIC` — phòng nhạc / micro ở nhà: số lần mỗi ngày, điểm Văn nghệ theo kết quả mini-game. `LIBRARY` — đọc sách ở tủ từng môn.
- `MALL_STALLS`, `MALL_GOODS` — các gian hàng trong TTTM và hàng bán (đồ trang trí phòng `d_*`, micro, guitar, dụng cụ thể thao). `DECOR_SLEEP` — mỗi món trang trí giúp ngủ hồi thêm thể lực. `TOKENS`, `MACHINES` — giá xèng và số xèng mỗi máy.
- `LUCK`, `LUCK_LV` — điểm may mắn: mỗi ngày quay ngẫu nhiên 0–100 (xem trên tivi, kênh “Vận may hôm nay”). May mắn cao thì bài kiểm tra được cộng thêm (tối đa `LUCK.test` điểm) và dễ “trúng tủ”; xui thì ngược lại.
- `EXERCISES`, `EXERCISE_*` — tập ở nhà: thảm tập (chạy tại chỗ, hít đất), dây nhảy, tạ tay, xà đơn. Dụng cụ mua ở gian Thể thao trong TTTM, mua xong thì để quanh thảm tập trong phòng ngủ; bấm vào để tập, mỗi bài một hoạt ảnh (`exerciseCut` trong `04d_life.js`).
- `FESTIVALS` — lễ hội trên Lịch, dạng `{ season, day, name, desc }` (`desc` là câu bản tin đọc khi sắp tới lễ). Bản tin thời sự trên tivi tự thông báo lễ hội, ngày lễ (`HOLIDAYS`), thi học kỳ, nghỉ hè, khai giảng trong 10 ngày tới. Các tin ngẫu nhiên khác ở `NEWS_POOL`, `WEATHER` (`04d_life.js`).
- `BED_NAP` — ban ngày nằm lên giường nào cũng chợp mắt được (giường ở nhà, giường nhà bạn, mọi chiếu trống trong phòng ngủ trưa). Tối ở nhà bạn thì ngủ lại được (chưa xin phép thì bố mẹ phiền lòng).
- `MACHINES`, `machineCut()` (`04d_life.js`) — khu game: số xèng mỗi máy; chơi máy là xem hoạt cảnh, thắng thua tuỳ điểm may mắn hôm nay và cấp Khéo tay (máy nhảy: cấp Văn nghệ).
- `CITY_POI`, `cityLayout()` (`05_ui.js`) — bản đồ thành phố (phím `N`, hoặc nút bản đồ góc trên phải): các khu thật thu nhỏ ghép đúng lối đi, đánh dấu chỗ mình đứng, chỗ hẹn với bạn, xe đang dựng.
- `RIDE_TILES` (`04c_social.js`) — xe chỉ chạy trên các ô nền này (lòng đường, vỉa hè) và trong sân nhà mình. Xe gửi ở nhà xe trường chỉ lấy được sau khi hết tiết (`CFG.SCHOOL_END`); đang đi chơi với bạn thì bấm vào xe để chở bạn.
- `QUE` — các loại thẻ xăm ở chùa: tên, câu thơ, lời giải, điểm may mắn cộng/trừ, tỉ lệ rơi ra. Mỗi ngày xin được một quẻ.
- `FESTIVALS` giờ có sẵn “Đêm giao thừa” (ngày cuối mùa Đông). `EVE` — sáng ngày cuối mùa Đông bố mẹ hoặc bạn thân rủ đi; hôm đó ai cũng lên núi được tới 24:00 (không cần nhận lời). Lễ hội mở từ 18:30 (`EVE.from`), tới núi trước 24:00 là vào hội; về tới nhà lúc 01:00. Trong hội thời gian đứng yên. `FEST_GAME`, `FEST_FOOD` — sạp ném vòng, bắn ná (thắng thua theo may mắn + khéo tay), sạp đồ ăn.
- `LIXI`, `TET_TEMPLE` — Tết (Xuân 1–3): bố mẹ lì xì sáng mùng 1 rồi rủ đi chùa; tới nhà bạn bè (phố Hoa Phượng) và nhà cô Hạnh, thầy Tùng (khu phố nhà mình) để chúc Tết, được lì xì theo độ thân thiết.
- `BANHCHUNG` — hội thi gói bánh chưng chiều ngày học cuối cùng trước Tết: thời gian chơi, các đối thủ và số bánh trung bình họ gói được. Đăng ký ở tiết sinh hoạt lớp trong 14 ngày trước đó (hoặc gặp cô chủ nhiệm trong lớp).
- `MEMO_ITEMS`, `MEMO_SCENES`, `MEMO_NOTES`, `MEMO_NOTE_HEARTS` — lưu bút: kỷ vật, khoảnh khắc, và lời lưu bút mà bạn bè / thầy cô / bố mẹ viết vào ngày tốt nghiệp nếu thân từ 3 tim.
- `SOCIETY` có thêm 4 anh chị khoá trên (11, 12) gặp ngoài sân giờ ra chơi — nói chuyện riêng thì được chỉ mẹo — và sư thầy ở chùa. Lớp học còn khoảng 16 bạn (`seatTaken` trong `03_maps.js`); học sinh lớp khác có tên lớp (10A2, 10A3…).
- `FRIEND_HOME_HEARTS`, `FRIEND_ROOM_HEARTS`, `PHONE_HEARTS`, `FH` — độ thân cần để vào nhà bạn, vào phòng riêng, xin số điện thoại.

Trong `04_game.js`: `testScore()` là công thức làm bài kiểm tra (năng lực môn + may rủi, "trúng tủ", "học tài thi phận").
Trong `04b_mischief.js`: `MGP` là thông số của minigame giữ-thanh kiểu cũ (giờ chỉ còn dùng cho câu cá). Các mini-game mới chỉnh ngay trong `GAMES` (`05b_games.js`).
Trong `04d_life.js`: `YARD_SPOT`, `HIDE_SPOTS`, `EAT_SEATS` là vị trí các tụ chơi ngoài sân.
Trong `04a_family.js`: `SCHED` là lịch trong ngày của bố và mẹ, `POI` là các điểm bố mẹ lui tới.

Trong `04c_social.js`: `LINKS` là ranh giới giữa các khu (đi tới đâu, mất bao lâu); `CUTS`, `VENUE`, `wallCut()`, `mopCut()`, `washCut()`, `massageCut()` là kịch bản các hoạt cảnh (vị trí nhân vật, lời thoại, đạo cụ, các bước `say` / `move` / `hop`); `classAction()` là menu quay sang bạn trong giờ học; `classEvent()` và `runLunchEvent()` là các sự kiện trong giờ học / giờ nghỉ trưa; `MSG_TAM` là câu trả lời tin nhắn của từng bạn.

## Điều khiển

`W` `A` `S` `D` di chuyển · chuột phải (hoặc `E`) tương tác · `Q` quay sang bạn trong giờ học · `X` xuống xe (phím đọc theo vị trí nên bật bộ gõ tiếng Việt vẫn dùng được) · `B` túi đồ · `Esc` / `M` menu (`C` chỉ số · `F` bạn bè · `T` thời khoá biểu · `G` học bạ · `L` lịch · `K` thẻ) · `N` bản đồ · `P` điện thoại. Thanh đồ ở cạnh dưới cho biết đang mang gì; bấm vào đồ ăn để ăn. Game tự lưu mỗi khi đi ngủ.

**Cầm đồ:** bấm một món trong thanh đồ (hoặc nút “Cầm lên” trong túi) để cầm lên — món đó hiện trên đầu nhân vật. Đang cầm mà bấm vào người khác là tặng quà (bạn bè, bố mẹ, thầy cô, người quen…; mỗi người một món mỗi ngày). Bấm vào chính mình hoặc chỗ trống thì hỏi có ăn không (chỉ với đồ ăn được). Bấm lại món đó để cất đi. Mọi đồ ăn uống mua ở căn tin, tạp hoá, trà sữa, xiên que, TTTM, hội chợ, quán hải sản đều cất vào túi; bim bim phải mở gói (ăn) mới thấy thẻ cầu thủ. Đang đi cùng bạn mà ăn thì hai đứa ăn chung.
