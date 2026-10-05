# L1 — Scratch Foundation

Scratch 3: https://scratch.mit.edu — tài khoản bố, project trong studio “Kid Coding”.  
Cổng: con tự làm sprite chuyển động bằng event + loop + if.  
Badge: Scratch Explorer sau L20. Loop Master sau L17.

Mỗi bài: mở Scratch trước 08:50. Cỡ chữ lớn. Không add extension.

---

# L09 — Scratch interface

Project: Hello Cat

## Objective
Con chỉ được 5 thứ: **Stage, Sprite, Block, Script, cờ xanh**. Mèo bước khi bấm cờ.

## Parent prep
Tài khoản Scratch, studio “Kid Coding”. Xóa project mẫu trên màn. Cỡ chữ trình duyệt 125%. 5 tờ giấy ghi: STAGE · SPRITE · BLOCK · SCRIPT · CỜ XANH.

## Story
**Bố nói:** “Đây là nhà hát. Sân khấu là **Stage**. Diễn viên là **Sprite** — bạn mèo. Kịch bản làm từ những viên lego lệnh gọi là **Block**. Ghép lego lại thành **Script**. Cờ xanh = mở màn.”

## Ask
- Đâu là con mèo? Đâu là sân khấu?
- Lego lệnh nằm ở đâu trên màn hình?
- Bấm cờ xanh thì ai chạy?

## Unplugged
**Bố** chỉ từng vùng trên màn hình. **Con** dán đúng tờ giấy lên mép màn (băng keo giấy).
Đổi vai: bố đọc tên, con chỉ trong 3 giây.
Nhắc L01: “Robot làm đúng lời. Block chính là lời.”

## Explain
Block = 1 lệnh (như Walk ở L01). Script = nhiều block dính nhau = program.
Block phải **cắp** vào nhau mới chạy chung.
Cờ xanh = event bắt đầu.

## Build
1. Bấm nhóm **Events** (vàng) → kéo `when green flag clicked`.
2. Bấm nhóm **Motion** (xanh) → kéo `move 10 steps` cắp dưới.
3. Con bấm cờ xanh. Mèo nhích.

```scratch
when green flag clicked
move (10) steps
```

## Sample
Chỉ 2 khối đó. Không thêm motion khác.

## Practice
Bấm cờ 10 lần: mèo đi xa dần. Hỏi: “Mỗi lần cờ, script chạy lại từ đầu không?”
Đổi 10 thành 50. Bấm cờ.

## Challenge
Thêm `say Hello! for 2 seconds` sau move.

## Mistakes
Kéo khối không dính. Bố: “Nghe tiếng cắp. Chưa cắp là chưa vào script.”
Nhầm cờ trên Stage với khối cờ. Bố chỉ cả hai: “Khối = lời. Nút = bấm chạy.”
Mèo chạy ra khỏi Stage. Kéo mèo về giữa bằng chuột.

## Check
1. Chỉ 5 thứ: Stage, Sprite, Block, Script, cờ xanh.
2. Script của con có mấy block?
3. Tự làm mèo nhích từ project trống.

## Homework
- [ ] Chỉ cho mẹ 5 từ trên màn hình. Làm mèo nhích 1 lần.

## Pass
Từ project trống, mèo move khi bấm cờ xanh.

## Next
L10 Movement — move + turn = robot đi đường gãy.

---

# L10 — Movement

Project: Robot Walk

## Objective
Con dùng `move` và `turn` để mèo đi đường chữ L — giống robot bố ở L01.

## Parent prep
Băng keo chữ L trên sàn (3 bước + rẽ + 2 bước). Mèo giữa Stage. Thêm `wait 1` sẵn trong nhóm Control để con thấy từng bước.

## Story
**Bố nói:** “Nhớ hôm con điều khiển bố-robot lấy táo không? Walk, Turn. Hôm nay mèo là robot. Lệnh Walk thành `move`, lệnh Turn thành `turn`.”

## Ask
- Ở L01, lệnh nào để đi? Lệnh nào để rẽ?
- Rẽ phải một góc vuông là bao nhiêu độ?
- Mèo đi 10 bước dài hay ngắn?

## Unplugged
**Con** đi chữ L trên băng keo, nói to từng lệnh: “Đi 3 — rẽ phải — đi 2.”
**Bố** viết lên giấy thành khối: `move 30` · `turn 90` · `move 20`.
Hỏi: “Mỗi bước con = 10 bước của mèo.”

## Explain
`move` = đi thẳng theo hướng mặt.
`turn ↻ 90` = quay phải 1 góc vuông. `turn ↺ 90` = quay trái.
`wait 1` = chờ để mắt kịp nhìn.

## Build
1. `when green flag clicked` → `go to x: 0 y: 0` → `point in direction 90`.
2. `move 100 steps` → `wait 1`.
3. `turn ↻ 90 degrees` → `wait 1`.
4. `move 60 steps`.

```scratch
when green flag clicked
go to x: (0) y: (0)
point in direction (90)
move (100) steps
wait (1) seconds
turn right (90) degrees
wait (1) seconds
move (60) steps
```

## Practice
Đi chữ U: thêm `turn ↻ 90` + `move 100` ở cuối. Không xóa, chỉ thêm.

## Challenge
Đi về đúng chỗ cũ (hình vuông) — con sẽ gặp lại ở L16.

## Mistakes
Turn 15 quá nhỏ, tưởng hỏng. Bố: “Bao nhiêu độ là một góc vuông?” (90)
Không có wait — mèo nhảy tới cuối luôn. Bố: “Máy nhanh quá. Thêm chờ để nhìn.”
Bấm cờ lần 2 mèo bắt đầu chỗ khác. Bố: “Đầu script cần go to 0,0.”

## Check
1. `move` và `turn` giống lệnh nào ở L01?
2. Rẽ phải góc vuông là mấy độ?
3. Vì sao cần `go to x:0 y:0` ở đầu?

## Homework
- [ ] Vẽ lên giấy một đường con muốn mèo đi (chữ Z, chữ N) và viết các khối.

## Pass
Bấm cờ, mèo đi chữ L. Bấm lại cờ, vẫn đúng chữ L.

## Next
L11 Coordinates — bản đồ x y tìm kho báu.

---

# L11 — Coordinates

Project: Find the Treasure

## Objective
Con đặt sprite bằng **x, y**. (0, 0) là giữa Stage. Mèo glide tới kho báu.

## Parent prep
Giấy A4 kẻ trục: ngang = x, dọc = y, gốc giữa. Đánh dấu +x phải, +y lên. Sprite thứ 2: hộp kho báu (Treasure / Crystal). Chỉ cho con ô x y dưới Stage.

## Story
**Bố nói:** “Cướp biển có bản đồ kho báu: ‘Đi sang phải 120, lên trên 80.’ Stage cũng có bản đồ như vậy. Mỗi điểm có một địa chỉ gồm hai số: x và y.”

## Ask
- Giữa Stage có địa chỉ gì?
- Sang phải thì x to lên hay nhỏ đi?
- Đi xuống thì y thế nào?

## Unplugged
Trên giấy trục, **bố** đặt đồng xu ở (120, 80). **Con** đọc địa chỉ.
Con đặt đồng xu theo bố đọc: (0, 0), (-100, 0), (0, -100), (150, 100).
Chơi “bắn tàu”: con đoán địa chỉ chỗ bố giấu xu, bố nói “x lớn hơn / y nhỏ hơn”.

## Explain
x = trái phải. Phải là dương, trái là âm.
y = lên xuống. Lên là dương, xuống là âm.
`go to x y` = nhảy tới. `glide 1 secs to x y` = trượt tới.

## Build
1. Kho báu: `when green flag clicked` → `go to x: 120 y: 80`.
2. Mèo: `when green flag clicked` → `go to x: -150 y: -100`.
3. Mèo: `wait 1` → `glide 1 secs to x: 120 y: 80` → `say Found it!`.

```scratch
when green flag clicked
go to x: (-150) y: (-100)
wait (1) seconds
glide (1) secs to x: (120) y: (80)
say [Found it!] for (2) seconds
```

## Practice
Mèo ghé 3 điểm lần lượt: (0, 0) → (-100, 100) → kho báu.
Con rê chuột trên Stage, đọc x y ở góc dưới.

## Challenge
Đo: góc trên-phải Stage x y khoảng bao nhiêu? Góc dưới-trái? (≈ 240, 180 và -240, -180)

## Mistakes
y âm là đi xuống — mèo “rớt” xuống đáy. Cười, ghi bug, sửa dấu.
Đảo x với y. Bố: “x là ngang hay dọc?”
Glide 0 giây — nhảy luôn. Bố: “Trượt mất bao lâu?”

## Check
1. (0, 0) ở đâu?
2. (-100, 50) ở bên nào, cao hay thấp?
3. Đặt kho báu đúng một điểm bố đọc.

## Homework
- [ ] Vẽ bản đồ phòng con trên giấy trục, ghi x y của giường, bàn, cửa.

## Pass
Find the Treasure: mèo glide tới kho báu ở điểm cố định.

## Next
L12 Events — mèo nghe phím bấm.

---

# L12 — Events

Project: Keyboard Controller

## Objective
Con biết: script chỉ chạy khi có **event** (cờ xanh, bấm phím, click). Con làm mèo đi bằng phím.

## Parent prep
Scratch mở project trống, mèo giữa Stage. Giấy ghi 3 chữ: CỜ · PHÍM · CLICK. Chuông nhỏ hoặc vỗ tay.

## Story
**Bố nói:** “Con mèo này đang ngủ. Nó chỉ dậy khi có chuông. Chuông có 3 loại: cờ xanh, bấm phím, bấm vào mèo. Không chuông thì mèo ngủ tiếp.”

## Ask
- Sáng nay cái gì đánh thức con dậy?
- Nếu không ai bấm gì, máy tính có tự chạy không?
- Mỗi chuông có thể gọi một việc khác không?

## Unplugged
**Bố:** đứng làm “mèo ngủ”. Con giữ 3 thẻ CỜ · PHÍM · CLICK.
**Luật:** Con giơ CỜ → bố nói “Ready!”. Giơ PHÍM → bố bước 1 bước. Giơ CLICK (chạm vai) → bố xoay.
Chơi 6 lượt. Lượt 5 con giơ không thẻ nào → bố đứng im. Hỏi: “Sao bố không làm gì?”

## Explain
Event = chuông đánh thức một script.
Mỗi script có đúng **một** khối mũ (hat block) ở đầu.
Không event → script ngủ.

## Build
1. Kéo `when green flag clicked` → `say Ready! for 2 seconds`.
2. Kéo `when space key pressed` → `move 10 steps`.
3. Kéo `when this sprite clicked` → `turn ↻ 15 degrees`.
4. Con bấm lần lượt: cờ, space, click mèo.

```scratch
when green flag clicked
say [Ready!] for (2) seconds

when [space] key pressed
move (10) steps

when this sprite clicked
turn right (15) degrees
```

## Practice
Đổi space thành phím mũi tên phải. Đưa mèo từ trái sang phải Stage chỉ bằng phím.
Thêm `when left arrow key pressed` → `move -10 steps`.

## Challenge
4 phím mũi tên, 4 script: dùng `point in direction` 0 / 90 / 180 / -90 rồi `move 10`. Đi vòng quanh Stage.

## Mistakes
Gắn move dưới cờ xanh rồi bấm phím — mèo không đi. Bố: “Khối này nằm dưới chuông nào?”
Hai khối mũ trong một script. Bố: “Mỗi script chỉ một chuông. Tách ra.”
Chọn sai phím trong ô dropdown. Bố: “Đọc to tên phím trong khối.”

## Check
1. Event là gì? (chuông đánh thức script)
2. Có bao nhiêu script trong project con?
3. Bấm space thì script nào chạy?

## Homework
- [ ] Kể cho mẹ 3 chuông trong nhà (chuông cửa, báo thức, lò vi sóng) và mỗi chuông làm gì.

## Pass
Space hoặc mũi tên làm mèo đi, click làm mèo xoay, cờ làm mèo nói.

## Next
L13 Say / Ask — mèo biết hỏi và nghe trả lời.

---

# L13 — Say / Ask

Project: Mini Chatbot

## Objective
Con làm mèo hỏi tên, chờ con gõ, rồi chào đúng tên đó (`ask`, `answer`, `join`).

## Parent prep
Project trống. Bàn phím cạnh con. Giấy 2 mảnh: “Hello” và “Nam” (tên con).

## Story
**Bố nói:** “Robot giỏi không chỉ nói. Nó còn **nghe**. Hôm nay mèo sẽ hỏi con, ghi nhớ câu con trả lời trong một cái hộp tên là `answer`.”

## Ask
- Khi bố hỏi tên, con trả lời xong bố nhớ ở đâu?
- Nếu mèo nói trước khi con trả lời thì sao?
- Ghép “Hello” và “Nam” thành gì?

## Unplugged
**Bố** đóng mèo: “Tên con là gì?” rồi **chờ**.
**Con** viết tên lên giấy, bỏ vào hộp có nhãn ANSWER.
**Bố** mở hộp, đọc: “Hello” + tên → “Hello Nam!”.
Đổi vai: con làm mèo, bố trả lời “Bố”. Hai mảnh giấy dán cạnh nhau = join.

## Explain
`ask … and wait` = hỏi và **dừng chờ**.
`answer` = hộp chứa câu trả lời mới nhất.
`join` = dán hai mảnh chữ thành một.

## Build
1. `when green flag clicked`.
2. `ask What's your name? and wait`.
3. `say (join Hello  (answer))` — nhớ dấu cách sau Hello.

```scratch
when green flag clicked
ask [What's your name?] and wait
say (join [Hello ] (answer)) for (2) seconds
```

## Practice
Hỏi thêm: `ask What color do you like? and wait` → `say (join answer [ is nice!])`.
Chạy 3 lần, mỗi lần gõ màu khác.

## Challenge
Mèo hỏi 2 câu (tên, tuổi) rồi nói: “Nam is 9”. Cần 2 lần join.

## Mistakes
Đặt say trước ask — mèo nói answer cũ hoặc trống. Bố: “Thứ tự đúng chưa? Nhớ L04 Debug.”
Quên dấu cách: “HelloNam”. Bố: “Đọc to. Thiếu gì giữa hai chữ?”
Answer chỉ nhớ câu **mới nhất**. Hỏi 2 câu thì câu 1 mất — để dành cho bài variable.

## Check
1. `ask and wait` khác `say` thế nào?
2. `answer` giữ cái gì?
3. Join “Hi” và “Bố” ra gì?

## Homework
- [ ] Viết 3 câu mèo sẽ hỏi bạn bè (tên, món thích, con vật thích).

## Pass
Gõ tên bất kỳ, mèo chào đúng tên đó.

## Next
L14 Sound — biến bàn phím thành đàn piano.

---

# L14 — Sound

Project: Piano

## Objective
Con làm đàn 4 phím: mỗi phím số 1–4 phát một nốt. Event + sound.

## Parent prep
Loa / tai nghe bật, âm lượng vừa. Extension **Music** đã thêm sẵn (hoặc dùng sound có sẵn của sprite). 4 thẻ giấy ghi 1 2 3 4.

## Story
**Bố nói:** “Nhạc cũng là algorithm: nốt nào trước, nốt nào sau, dài bao lâu. Hôm nay con là nhạc sĩ, bàn phím là cây đàn.”

## Ask
- Con biết bài hát nào chỉ cần 3 nốt?
- Bấm 1 phím, đàn phát mấy nốt?
- Muốn phát 3 nốt liền nhau thì cần gì? (sequence)

## Unplugged
Đặt 4 thẻ 1 2 3 4 lên bàn.
**Con** chạm thẻ → **bố** hát “Đô / Rê / Mi / Pha”.
Con “chơi” 1-2-3-1-2-3. Bố hát đúng thứ tự con chạm.
Hỏi: “Nếu con chạm 3-2-1 thì sao?” — sequence khác = bài khác.

## Explain
Mỗi phím = 1 event. Mỗi event = 1 script phát 1 nốt.
`play note` có 2 thứ: **nốt nào** và **dài bao lâu** (beats).

## Build
1. `when 1 key pressed` → `play note 60 for 0.5 beats`.
2. Chuột phải → duplicate. Đổi thành phím 2, nốt 62.
3. Phím 3 → 64. Phím 4 → 65.
4. Con chơi “1 2 3 / 1 2 3”.

```scratch
when [1] key pressed
play note (60) for (0.5) beats

when [2] key pressed
play note (62) for (0.5) beats
```

## Practice
Thêm phím 5 = trống: `play drum (1) for 0.25 beats`.
Đổi nhạc cụ: `set instrument to Piano / Guitar`.

## Challenge
Cờ xanh tự chơi bài 3 nốt: `play 60` → `play 62` → `play 64`. Đây là sequence (L03) trong Scratch.

## Mistakes
Duplicate mà quên đổi phím — 2 script cùng phím 1. Bố: “Bấm 2 thì ai trả lời?”
Không nghe gì. Bố kiểm tra loa trước khi hỏi code.
Beat quá dài (4) — đàn chậm. Bố: “Đổi số beat xem.”

## Check
1. 4 phím cần mấy script?
2. Số 60 nghĩa là gì? (nốt nào)
3. Bài tự chơi khi bấm cờ là loại gì? (sequence)

## Homework
- [ ] Chơi một bài 5–8 nốt trên đàn Scratch cho cả nhà nghe.

## Pass
Piano 4 phím chạy, mỗi phím một nốt khác.

## Next
L15 Costume — làm nhân vật cử động.

---

# L15 — Costume

Project: Animation Character

## Objective
Con biết costume = bộ hình của sprite. Đổi costume nhanh = nhân vật cử động.

## Parent prep
Mèo có sẵn 2 costume. 4 tờ giấy nhỏ vẽ người que: chân trái trước / chân phải trước (bố vẽ sẵn 2 tờ).

## Story
**Bố nói:** “Phim hoạt hình thật ra là nhiều tấm hình đứng yên, lật thật nhanh. Mắt mình tưởng là đang chạy. Hôm nay con làm phim hoạt hình đầu tiên.”

## Ask
- Con đã xem flipbook (sách lật) chưa?
- Lật chậm thì sao? Lật nhanh thì sao?
- Mèo có mấy tấm hình?

## Unplugged
Bố đưa 2 tờ người que. **Con** lật qua lại: chậm 5 lần, nhanh 10 lần.
Hỏi: “Lúc nào trông như đang đi?”
Con nói số: “mỗi tấm chờ bao lâu?” (nửa giây, 1 giây…).

## Explain
Costume = 1 tấm hình. `next costume` = lật sang tấm tiếp.
`wait 0.2` = chờ giữa hai lần lật. Không chờ thì máy lật quá nhanh, không thấy.

## Build
1. Mở tab **Costumes**: chỉ costume1, costume2.
2. `when green flag clicked`.
3. `next costume` → `wait 0.2 seconds` — lặp lại 4 lần bằng tay (kéo 4 cặp).
4. Bấm cờ: mèo bước tại chỗ.

```scratch
when green flag clicked
next costume
wait (0.2) seconds
next costume
wait (0.2) seconds
```

## Practice
Đổi `wait` thành 1 giây rồi 0.05 giây. Con nói số nào đẹp nhất.
Thêm `move 10` vào mỗi cặp — mèo vừa bước vừa đi.

## Challenge
Vẽ costume3 cho mèo (tab Costumes → paint → đổi màu tai). Mèo nhấp nháy 3 màu.

## Mistakes
Không có wait — bấm cờ không thấy gì. Bố: “Máy lật nhanh quá. Thêm chờ.”
Sửa nhầm costume gốc. Bố: “Duplicate costume trước khi vẽ.”

## Check
1. Costume là gì?
2. Vì sao cần `wait`?
3. Kéo 4 cặp giống nhau có mệt không? (để dành L17 Repeat)

## Homework
- [ ] Làm sách lật 4 trang ở góc vở: quả bóng nảy.

## Pass
Bấm cờ, nhân vật “bước” tại chỗ ít nhất 4 lần.

## Next
L16 Sequence Square — vẽ hình vuông bằng bút.

---

# L16 — Sequence Square

Project: Draw a Square (long)

## Objective
Con vẽ hình vuông bằng bút: 4 lần `move 100` + `turn 90`, **chưa** dùng repeat.

## Parent prep
Thêm extension **Pen**. Băng keo dán hình vuông 4 bước trên sàn. Giữ file tên `L16-square-long` cho bài sau.

## Story
**Bố nói:** “Hôm nay mèo cầm bút. Mèo đi tới đâu, bút vẽ tới đó. Muốn vẽ hình vuông thì mèo phải đi thế nào?”

## Ask
- Hình vuông có mấy cạnh? Mấy góc?
- Mỗi góc quay bao nhiêu độ? (góc vuông = 90)
- Đi 4 cạnh xong mèo đứng ở đâu?

## Unplugged
**Con** đi trên băng keo: “Đi 4 bước — rẽ phải — đi 4 bước — rẽ phải…”.
**Bố** đếm: con nói mấy lần “đi”, mấy lần “rẽ”?
Viết lên giấy đúng 8 dòng con vừa nói.

## Explain
Pen down = hạ bút. Pen up = nhấc bút. Erase all = xóa giấy.
Hình vuông = 4 lần (đi + quay 90).

## Build
1. `when green flag clicked` → `erase all` → `go to x: 0 y: 0` → `point in direction 90`.
2. `pen down`.
3. `move 100 steps` → `turn ↻ 90 degrees` — kéo đủ **4 cặp** (8 khối).
4. `pen up`.

```scratch
when green flag clicked
erase all
go to x: (0) y: (0)
point in direction (90)
pen down
move (100) steps
turn right (90) degrees
move (100) steps
turn right (90) degrees
move (100) steps
turn right (90) degrees
move (100) steps
turn right (90) degrees
pen up
```

## Practice
Đổi `move 100` thành 50 ở cả 4 chỗ. Con thấy phải sửa mấy chỗ? (4 — mệt!)
Đổi màu bút: `set pen color to`.

## Challenge
Vẽ hình chữ nhật: 2 cạnh dài 150, 2 cạnh ngắn 80.

## Mistakes
Quên pen down — mèo đi mà không vẽ. Bố: “Bút đang ở đâu?”
Turn 45 — hình không khép. Bố: “Góc vuông bao nhiêu độ?”
Bấm cờ lần 2 vẽ đè. Bố: “Thêm erase all ở đầu.”

## Check
1. Hình vuông cần mấy khối move?
2. Muốn đổi kích thước phải sửa mấy chỗ?
3. Con có thấy đoạn nào lặp lại không?

## Homework
- [ ] Vẽ lên giấy chương trình hình tam giác (gợi ý: 3 cạnh, mỗi góc quay 120).

## Pass
Hình vuông khép kín. File `L16-square-long` đã lưu.

## Next
L17 Repeat — làm lại hình vuông với ít khối hơn.

---

# L17 — Repeat

Project: Draw a Square (short)

## Objective
Con thay 8 khối bằng `repeat 4`. Con nói được: “Repeat làm lại một nhóm lệnh nhiều lần.”

## Parent prep
Mở file `L16-square-long`. Duplicate thành `L17-square-repeat`. Giấy dán ghi “REPEAT = làm lại”.

## Story
**Bố nói:** “Hôm qua con kéo 8 khối. Nếu vẽ hình 100 cạnh thì con phải kéo 200 khối. Lập trình viên lười một cách thông minh: họ bảo máy **làm lại**.”

## Ask
- Trong file L16, đoạn nào giống hệt nhau?
- Giống nhau mấy lần?
- Nếu bố nói “nhảy 10 lần”, con có cần bố nói “nhảy” 10 lần không?

## Unplugged
**Bố** ra lệnh dài: “Vỗ tay, dậm chân, vỗ tay, dậm chân, vỗ tay, dậm chân.”
**Bố** ra lệnh ngắn: “Lặp 3 lần: vỗ tay, dậm chân.”
Con làm cả hai. Hỏi: “Giống nhau không? Câu nào ngắn hơn?”
Con tự ra lệnh “lặp 4 lần: đi 4 bước, rẽ phải” trên băng keo.

## Explain
`repeat 4` = cái hộp. Lệnh nào nằm **trong** hộp thì làm lại 4 lần.
Lệnh **ngoài** hộp chỉ chạy 1 lần.

## Build
1. Xóa 3 cặp move/turn, giữ 1 cặp.
2. Kéo `repeat 10` bọc cặp đó. Đổi 10 → 4.
3. Bấm cờ. So với file L16: hình giống hệt.

```scratch
when green flag clicked
erase all
go to x: (0) y: (0)
point in direction (90)
pen down
repeat (4)
  move (100) steps
  turn right (90) degrees
end
pen up
```

## Practice
Đổi kích thước: sửa **1** chỗ thay vì 4.
Tam giác: `repeat 3`, `turn 120`.

## Challenge
Ngũ giác `repeat 5`, `turn 72`. Lục giác `repeat 6`, `turn 60`. Con đoán: repeat 36, turn 10 ra hình gì?

## Mistakes
Để `pen down` trong repeat — vẫn chạy nhưng thừa. Bố: “Khối nào chỉ cần chạy 1 lần?”
Đặt turn ngoài repeat — chỉ vẽ một đường. Bố: “Turn nằm trong hay ngoài hộp?”

## Check
1. Vì sao file L17 ngắn hơn mà vẽ giống L16?
2. Lệnh trong repeat chạy mấy lần?
3. Muốn hình 8 cạnh, con đổi những số nào?

## Homework
- [ ] Tìm 3 việc trong ngày “lặp lại” (đánh răng mỗi răng, leo cầu thang…) và nói số lần.

## Pass
Hình vuông bằng `repeat 4`. Con giải thích được → tick badge **Loop Master** ở Coding Passport.

## Next
L18 Nested Loop — vòng lặp trong vòng lặp, vẽ pixel art.

---

# L18 — Nested Loop

Project: Pixel Art

## Objective
Con vẽ lưới 3×3 bằng repeat lồng: repeat ngoài = hàng, repeat trong = ô trong hàng.

## Parent prep
Giấy kẻ ô 3×3 (bố kẻ sẵn 2 tờ). Bút màu. Sprite là một hình vuông nhỏ 20×20 (vẽ trong Costumes). Extension Pen.

## Story
**Bố nói:** “Màn hình máy tính làm từ những ô vuông tí hon gọi là pixel. Hôm nay con làm họa sĩ pixel: tô từng ô, từng hàng.”

## Ask
- Lưới 3×3 có mấy ô?
- Tô xong 1 hàng, con làm gì tiếp?
- 3 hàng × 3 ô = ?

## Unplugged
**Con** tô lưới 3×3 trên giấy, nói to: “Hàng 1: ô, ô, ô. Xuống hàng. Hàng 2: ô, ô, ô. Xuống hàng…”
**Bố** viết lại thành: “Lặp 3 hàng: (lặp 3 ô: tô, sang phải) rồi về đầu, xuống.”
Hỏi: “Câu ‘lặp 3 ô’ nằm trong câu nào?”

## Explain
Nested loop = hộp repeat nằm **trong** hộp repeat khác.
Vòng trong chạy hết rồi vòng ngoài mới đi tiếp.
3 × 3 = 9 lần stamp.

## Build
1. `go to x: -40 y: 40`, `erase all`.
2. Vòng ngoài `repeat 3` (hàng).
3. Bên trong: vòng trong `repeat 3` (ô): `stamp` → `move 20 steps`.
4. Sau vòng trong: `move -60 steps` (về đầu hàng) → `change y by -20` (xuống).

```scratch
when green flag clicked
erase all
go to x: (-40) y: (40)
point in direction (90)
repeat (3)
  repeat (3)
    stamp
    move (20) steps
  end
  move (-60) steps
  change y by (-20)
end
```

Bố **không** kéo hộ. Hỏi từng vòng: “Vòng này lặp cái gì?”

## Practice
Đổi thành 4×4: con sửa những số nào? (3→4, -60→-80).
`change color effect by 25` trước stamp — mỗi ô một màu.

## Challenge
Vẽ bàn cờ: ô xen kẽ hai màu. Gợi ý: đổi màu sau mỗi stamp.

## Mistakes
Quên `move -60` — hàng sau lệch sang phải. Bố: “Hết hàng, bút đang ở đâu?”
Để `change y` trong vòng trong — vẽ đường chéo. Bố: “Xuống hàng là việc của vòng nào?”

## Check
1. Vòng nào là hàng, vòng nào là ô?
2. Stamp chạy tổng cộng mấy lần?
3. Lưới 5×2 thì hai số repeat là gì?

## Homework
- [ ] Tô một hình pixel 5×5 trên giấy (trái tim, mặt cười) và viết số hàng, số ô.

## Pass
Lưới 3×3 stamp đúng chỗ. Không cần đẹp.

## Next
L19 If — mèo biết “nếu chạm tường thì quay lại”.

---

# L19 — If

Project: Wall Collision

## Objective
Con dùng `if touching edge then turn 180`. Con nói được: “If kiểm tra một câu hỏi đúng/sai rồi mới làm.”

## Parent prep
Project trống, mèo. Dán băng keo hai “tường” trên sàn cách 5 bước. Giải thích sẵn chữ `forever` = lặp mãi cho tới khi bấm stop.

## Story
**Bố nói:** “Con đi trong hành lang tối. Mỗi bước con tự hỏi: ‘Đụng tường chưa?’ Đụng rồi thì quay lại. Chưa thì đi tiếp. Máy tính cũng hỏi như vậy — gọi là **if**.”

## Ask
- Câu hỏi “đụng tường chưa?” có mấy câu trả lời?
- Nếu không hỏi thì sao?
- Hỏi một lần có đủ không, hay hỏi mỗi bước?

## Unplugged
**Con** đi giữa 2 tường băng keo. Mỗi bước con nói: “Chạm chưa? Chưa → đi.”
Chạm tường → con nói “Chạm! Quay lại.” và quay 180.
Đi qua lại 3 lần. Bố hỏi: “Con hỏi câu đó bao nhiêu lần?” (mỗi bước = forever).

## Explain
`if <câu hỏi> then` = chỉ làm khi câu trả lời là **true**.
Khối 6 cạnh (◇) là câu hỏi true/false.
`forever` = lặp mãi để hỏi liên tục.

## Build
1. `when green flag clicked` → `forever`.
2. Trong forever: `move 5 steps`.
3. Trong forever: `if touching edge? then` → `turn ↻ 180 degrees`.
4. `set rotation style left-right` để mèo không lộn ngược.

```scratch
when green flag clicked
set rotation style [left-right]
forever
  move (5) steps
  if <touching (edge)?> then
    turn right (180) degrees
  end
end
```

## Practice
Đổi tốc độ 5 → 10 → 2. Mèo vẫn nảy đúng?
Thêm `play sound pop` khi chạm tường.

## Challenge
Vẽ sprite “tường” màu đỏ giữa Stage. `if touching color red then turn 180`.

## Mistakes
If nằm ngoài forever — chỉ hỏi một lần, mèo biến mất khỏi Stage. Bố: “Mèo hỏi câu đó mấy lần?”
Mèo lộn ngược. Bố: “Thêm rotation style.”
Kéo nhầm `if else`. Không sao — để trống phần else, bài sau dùng.

## Check
1. If cần gì để chạy? (câu hỏi true/false)
2. Vì sao phải có forever?
3. Chỉ ra khối câu hỏi trong project.

## Homework
- [ ] Nói 3 câu “nếu… thì…” trong ngày (nếu mưa thì mang ô…).

## Pass
Mèo nảy qua lại giữa hai cạnh, không biến mất.

## Next
L20 If / Else — thắng hay thua: hai đường đi.

---

# L20 — If / Else

Project: Win / Lose

## Objective
Con dùng `if … else`: chạm táo → Win, chạm đỏ → Lose. Checkpoint Level 1.

## Parent prep
Project có mèo + sprite Apple + sprite thanh đỏ (bố vẽ sẵn). Coding Passport mở để tick badge. Giấy ghi câu cổng L1.

## Story
**Bố nói:** “Ở ngã ba, con phải chọn một đường: trái hoặc phải, không đi cả hai. **If / else** là ngã ba của máy tính: đúng thì đi đường này, sai thì đường kia.”

## Ask
- If ở bài trước, khi câu trả lời là sai thì mèo làm gì?
- Ví dụ “nếu… thì…, không thì…” trong nhà mình?
- Game này có mấy kết quả?

## Unplugged
Bố đứng ở ngã ba (hai tờ giấy WIN / CONTINUE trên sàn).
**Con** hỏi: “Bố chạm táo chưa?” — bố giơ táo (đúng) → đi về WIN. Không giơ → đi về CONTINUE.
Thêm thẻ LOSE: “Chạm đỏ chưa?” Chơi 5 lượt.

## Explain
`if … else` có 2 ngăn. Đúng → ngăn trên. Sai → ngăn dưới.
Luôn chạy **đúng một** ngăn.
Có thể đặt nhiều if trong forever cho nhiều luật.

## Build
1. Mèo đi bằng mũi tên (dùng lại L12).
2. Trong forever: `if touching Apple? then say You win! else say Keep going`.
3. Thêm `if touching color red? then say You lose!` → `stop all`.
4. Cờ xanh: `go to x: -200 y: 0` để reset.

```scratch
when green flag clicked
go to x: (-200) y: (0)
forever
  if <touching (Apple)?> then
    say [You win!]
  else
    say [Keep going]
  end
  if <touching color [red]?> then
    say [You lose!] for (1) seconds
    stop [all]
  end
end
```

## Practice
Chơi 3 lần: 1 lần thắng, 1 lần thua, 1 lần chưa chạm gì. Con nói ngăn nào chạy.
Đổi chỗ táo và thanh đỏ.

## Challenge
Thắng thì `stop all` + play sound. Thêm thanh đỏ thứ hai.

## Mistakes
Không reset vị trí — bấm cờ mèo đang ở chỗ thua. Bố: “Lúc bắt đầu mèo nên đứng đâu?”
Win không dừng game. Bố: “Thắng rồi có cần đi tiếp không?”

## Check
1. If / else khác if thế nào?
2. Ngăn else chạy khi nào?
3. Câu cổng L1: “Scratch chạy từng khối theo thứ tự khi event xảy ra.” Con nói lại bằng lời của con.

## Homework
- [ ] Cho người nhà chơi Win / Lose. Hỏi họ thắng mấy lần.

## Pass
Win và Lose đều thử được. Con nói được câu cổng → tick badge **Scratch Explorer**.

## Next
L21 Boolean — câu hỏi đúng/sai là trái tim của logic.
