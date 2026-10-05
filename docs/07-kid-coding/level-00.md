# L0 — Computational Thinking

Công cụ: giấy, bút, người (bố = robot), băng keo. Scratch chỉ **xem** bài 09 sau.  
Cổng: con nói “Algorithm là một chuỗi bước để giải quyết một vấn đề.”  
Badge: Algorithm Thinker sau L08.

---

# L01 — What is a Computer?

Level: L0 beginner
Duration: 50 min
Language: unplugged
When: Sat 2026-10-10 09:00

## Objective
Con ra lệnh từng bước cho bố-robot lấy táo. Con nói được: máy tính làm đúng lời, không đoán ý.

## Parent prep
1 quả táo (hoặc gấu bông) đặt trên bàn cách xa 4–6 bước. Băng dán START / END trên sàn. Giấy A4. Bút. Không laptop.

## Story
“Máy tính không phải phù thủy. Nó giống người chỉ biết làm đúng tờ giấy lệnh. Hôm nay bố là máy. Con là lập trình viên.”

## Ask
- Máy tính biết đói không?
- Nếu con nói “lấy táo giúp con” mà không nói đi đâu, bố-máy có hiểu không?
- Lệnh phải ngắn hay dài?

## Unplugged
Con đứng ở START. Bố đứng im cho tới khi con nói **một** lệnh.

Lệnh được phép (viết sẵn cho con, con chọn):

```
Walk
Turn left
Turn right
Pick Apple
STOP
```

Luật: mỗi lần chỉ 1 lệnh. Bố làm **ngu ngốc đúng lời**: Walk = đúng 1 bước. Turn = 90 độ. Không tự né ghế.

Con phải đưa bố tới táo rồi Pick Apple rồi STOP.

Chạy 3 lần. Lần 2 bố cố tình hiểu sai nếu con nói câu dài (“đi lấy táo đi”). Dừng. Hỏi: “Lệnh nào trên giấy?”

## Explain
Instruction = một lệnh nhỏ máy làm được. Máy không đoán. Máy không “biết ý con”.

## Build
Con viết program trên giấy:

```
START
Walk
Walk
Turn right
Walk
Pick Apple
STOP
```

Đóng kịch lại từ giấy, không được nói thêm.

## Sample
(Bố giữ. Đường L-shape 2 bước + rẽ + 1 bước.)

## Practice
Đổi chỗ táo. Con viết program mới. Không xóa bài cũ — giữ 2 tờ.

## Challenge
Thêm ghế giữa đường. Con thêm Turn. Không được nói “né ghế”.

## Mistakes
Con nói cả câu. Bố đứng im. Hỏi: “Cắt thành lệnh nào trên giấy?”
Con quên STOP. Táo đã nhấc mà bố vẫn Walk — cười, ghi bug.

## Check
1. Máy tính có đoán ý không?
2. Instruction là gì? (một lệnh nhỏ)
3. Chỉ tờ giấy cho bố, bố làm được không?

## Homework
- [ ] Vẽ 5 ô START→táo. Viết lệnh. Dạy mẹ hoặc gấu tối nay.

## Pass
Lấy được táo 1 lần chỉ bằng giấy lệnh + nói được “máy không đoán ý”.

## Next
L02 Algorithm — nhiều instruction ghép thành một cách làm bánh.

---

# L02 — Algorithm

Level: L0 beginner
Duration: 50 min
Language: unplugged
When: Sun 2026-10-11 09:00

## Objective
Con viết algorithm làm sandwich. Con thấy đổi thứ tự thì ra sai.

## Parent prep
Bánh mì, 1 lát thịt/phô mai, rau (hoặc giấy cắt hình). Đĩa. Giấy số 1–6.

## Story
“Algorithm là tờ công thức. Bếp không nếm giúp. Bếp làm đúng số.”

## Ask
1. Problem là gì?
2. Con làm sandwich thế nào?
3. Vẽ bước được không?
4. Nếu cho rau trước khi có bánh thì sao?

## Unplugged
Con viết:

```
1.
2.
3.
4.
```

Rồi **làm thật**. Sau đó bố xáo số (rau → thịt → bánh). Con làm đúng bản xáo. Nhìn kết quả. Hỏi: “Máy có biết bản này ngớ ngẩn không?”

## Explain
Algorithm = chuỗi instruction theo thứ tự để giải 1 problem. Sai thứ tự = sai kết quả. Máy không “hiểu ý”.

## Build
Viết lại algorithm đúng. Đánh số. Ký tên.

## Practice
Algorithm “đánh răng” 5 bước. Đổi 2 bước. Kể chuyện gì xảy ra.

## Challenge
Algorithm “ra khỏi phòng” gồm Open door. Cố tình để Close door trước Walk through — nối L04.

## Mistakes
Con viết “làm sandwich ngon”. Quá mơ hồ. Bố hỏi: “Bước 1 tay cầm gì?”

## Check
1. Algorithm là gì?
2. Thứ tự có quan trọng không? Vì sao?
3. Đọc algorithm xáo, kết quả có giống ý không?

## Homework
- [ ] Viết algorithm 4 bước “mặc áo”. Đừng làm thử tới Thứ 7 — giữ giấy.

## Pass
Có 1 tờ algorithm sandwich chạy được, và nói được câu cổng một phần: “Thứ tự bước làm thay đổi kết quả.”

## Next
L03 Sequence — robot giấy trên lưới.

---

# L03 — Sequence

Level: L0 beginner
Duration: 50 min
Language: unplugged
When: Sat 2026-10-17 09:00

## Objective
Con đưa robot tới đích bằng mũi tên theo thứ tự. Con hiểu sequence = thứ tự.

## Parent prep
In hoặc kẻ lưới 5×5. Token robot, đích, 1 tường. Thẻ `↑ → ↓ ←`.

## Story
“Robot chỉ nhìn thẻ trên cùng, làm, rồi thẻ tiếp. Nó không nhìn cả đống.”

## Ask
Problem là gì? Vẽ đường được không? Nếu thẻ 1 là ↓ mà đích ở trên?

## Unplugged
Mê cung dễ:

```
S . . #
. # . #
. . . E
```

Con xếp thẻ thành hàng. Bố chạy token. Đụng tường = đứng im (bug). Không nhấc thẻ giữa chừng trừ khi debug.

3 màn: dễ, 1 tường, tường chữ L.

## Explain
Sequence = làm hết bước 1 rồi mới bước 2. Chương trình là một hàng instruction.

## Build
Ghi sequence bằng chữ:

```
START
down
down
right
right
right
END
```

## Practice
Mê cung 4×4 con tự kẻ. Bố đặt E. Con viết. Bố chạy.

## Challenge
Thêm lệnh `Pick gem` ở ô giữa. Sequence phải ghé gem rồi mới E.

## Mistakes
Con chỉ tay trên giấy “đi vậy là tới”. Bố: “Robot không nghe tay. Chỉ nghe thẻ.”

## Check
1. Sequence nghĩa là gì?
2. Đổi 2 thẻ, robot còn tới E không?
3. Chỉ một đường đi được thôi à? (không — nhiều sequence có thể đúng)

## Homework
- [ ] Kẻ lưới 4×4. Đặt S, E. Viết 1 sequence. Giữ để L08.

## Pass
1 mê cung chạy đúng chỉ bằng thẻ / chữ.

## Next
L04 Debugging — algorithm sai, tìm chỗ hỏng.

---

# L04 — Debugging

Level: L0 beginner
Duration: 50 min
Language: unplugged
When: Sun 2026-10-18 09:00

## Objective
Con tìm bước sai. Con sửa. Con nói: bug = bước sai hoặc thiếu hoặc thừa.

## Parent prep
Tờ “cửa”:

```
1. Open door
2. Walk
3. Close door
4. Walk through door
```

Cửa phòng thật. Bố đóng kịch.

## Story
“Hôm nay chương trình lỗi. Máy không hỏng. Tờ lệnh hỏng. Việc của thợ là tìm dòng.”

## Ask
Chạy từng bước. Hỏi: “Sai ở đâu?” Đừng nói đáp án. Đợi.

Đáp: bước 3 đóng cửa rồi bước 4 không đi xuyên cửa được. Sửa: Walk through **trước** Close, hoặc bỏ Walk thừa.

## Unplugged
3 bug nữa (bố đọc, con tìm số dòng):

A. Sandwich: bánh → đóng nắp → thịt (thịt ở ngoài).  
B. Sequence L03: `right right down` nhưng E ở dưới-trái.  
C. “Uống nước”: Open bottle, Drink, Open bottle.

## Explain
Debug = chạy chậm, so bước với ý, sửa **một** chỗ, test lại. Không viết lại cả tờ nếu chưa biết chỗ sai.

## Build
Con sửa tờ cửa. Đóng kịch 2 lần: bản lỗi (thấy kẹt) + bản mới (ra được).

## Practice
Bố cố ý đi sai 1 thẻ trên lưới L03. Con nói “dòng số mấy”.

## Challenge
Hai bug trên một tờ. Con phải tìm cả hai.

## Mistakes
Con nói “hỏng hết”. Bố: “Chỉ một dòng. Đọc từ 1.”
Con xóa tất cả. Bố giữ bản lỗi, viết bản mới bên cạnh — để so.

## Check
1. Bug là gì?
2. Debug làm gì trước — đoán hay chạy chậm?
3. Sửa xong phải làm gì? (test lại)

## Homework
- [ ] Tìm 1 “bug” trong algorithm mặc áo (L02). Khoanh số bước.

## Pass
Tự chỉ đúng chỗ sai ở bài cửa + sửa chạy được. Badge Debugger: sau khi tích lũy 3 bug tự tìm (ghi trên Passport).

## Next
L05 Input / Output — số vào, lớn/nhỏ ra.

---

# L05 — Input / Output

Level: L0 beginner
Duration: 50 min
Language: unplugged
When: Sat 2026-10-24 09:00

## Objective
Con vẽ Input → Computer → Output. Con làm máy “lớn hơn 10?”.

## Parent prep
Thẻ số 1–20. Hộp ghi COMPUTER. Giấy.

## Story
“Máy không tự nghĩ số. Mình **đưa vào**. Nó **trả ra**.”

Vẽ:

```
Input
  ↓
Computer
  ↓
Output
```

## Ask
Tai là input hay output? Miệng? Bàn phím? Màn hình?

## Unplugged
Luật máy: nếu số > 10 nói LỚN, không thì NHỎ.

Con là máy. Bố đưa thẻ (input). Con nói (output). Đổi vai.

Thêm luật: số = 10 nói BẰNG.

## Explain
Input = cái đưa vào. Output = cái máy trả. Cùng máy, đổi input → đổi output.

## Build
Giấy 3 cột: Input | Luật | Output. Điền 5 thẻ.

## Practice
Máy “chẵn/lẻ”. Input số. Output CHẴN/LẺ. (Chẵn = đếm 2, 4, 6… Không cần modulo.)

## Challenge
Hai input: hai thẻ. Output = thẻ nào lớn hơn.

## Mistakes
Con trả lời theo ý thích, quên luật. Bố chỉ luật. Chạy lại cùng input.

## Check
1. Chỉ đâu là input trên hình?
2. Đổi input, output có đổi không?
3. Máy có tự tạo input không?

## Homework
- [ ] Vẽ Input-Computer-Output cho “hỏi tên → nói xin chào + tên”.

## Pass
Chơi đúng 5 thẻ với luật >10 và giải thích 3 ô.

## Next
L06 Condition — if mưa thì dù.

---

# L06 — Condition

Level: L0 beginner
Duration: 50 min
Language: unplugged
When: Sun 2026-10-25 09:00

## Objective
Con viết IF / ELSE đời sống. Con đóng kịch cửa có/không.

## Parent prep
Dù. Kính râm. Tờ `IF raining`. Không cần mưa thật — thẻ MƯA / NẮNG.

## Story
“Có câu hỏi chỉ yes/no. Câu hỏi mở một trong hai cửa.”

## Ask
Nếu mưa, cầm gì? Nếu không mưa? Có lúc cầm cả hai không — theo luật này?

## Unplugged
```
IF raining
    umbrella
ELSE
    no umbrella
```

Bố giơ thẻ. Con làm. 10 lần. Đổi luật: IF nắng → kính.

## Explain
Condition = câu hỏi yes/no. IF làm nhánh yes. ELSE làm nhánh no. Máy luôn chọn **một**.

## Build
Con viết 3 IF đời sống: đói, tối, tuổi > 8 (con được). Đóng kịch 1 cái.

## Practice
Kết hợp L05: IF số > 10 → LỚN ELSE NHỎ. Đây là cùng ý bằng chữ IF.

## Challenge
Lồng nhẹ bằng lời: IF mưa IF lạnh → áo mưa. Không viết nested code. Chỉ nói.

## Mistakes
Con thêm “hơi mưa thì…”. Bố: “Máy chỉ mưa hoặc không. Chọn một.”

## Check
1. IF cần câu hỏi kiểu gì?
2. ELSE là gì?
3. Đóng kịch 1 luật bố bịa (IF thẻ đỏ → nhảy).

## Homework
- [ ] Viết IF/ELSE “nếu hết kem đánh răng”.

## Pass
1 tờ IF/ELSE + đóng kịch đúng 5/5 thẻ.

## Next
L07 Repetition — clap 5 lần thành REPEAT 5.

---

# L07 — Repetition

Level: L0 beginner
Duration: 50 min
Language: unplugged
When: Sat 2026-10-31 09:00

## Objective
Con đổi 5 dòng Clap thành REPEAT 5. Con biết loop tiết kiệm bước.

## Parent prep
Giấy. Bố sẵn sàng vỗ tay.

## Story
“Viết Clap năm lần thì chán. Lặp là nói: làm việc này, bấy nhiêu lần.”

## Ask
Vỗ 5 lần. Viết 5 dòng. Mệt chưa? 100 lần thì sao?

## Unplugged
Bản dài:

```
Clap
Clap
Clap
Clap
Clap
```

Bản ngắn:

```
REPEAT 5
    Clap
```

Chạy cả hai — tai nghe giống. Mắt thấy khác.

Thêm: REPEAT 3 Walk trên lưới 1 hàng.

## Explain
Loop = lặp. Số lần phải nói rõ. REPEAT 0 = không làm. Quên số lần = máy không biết dừng (nói vui: vỗ mãi — rồi bố dừng, gọi là bug).

## Build
Đổi algorithm “3 bước tới táo” thành REPEAT nếu được. Nếu rẽ khác nhau — **không** nhét REPEAT bừa. Hỏi câu 8.

## Practice
Vẽ vuông: REPEAT 4 { Walk 3, Turn right }. Đi bộ trên sàn.

## Challenge
REPEAT trong REPEAT bằng lời: 3 hàng, mỗi hàng 4 vỗ. Không bắt viết nested đúng syntax.

## Mistakes
REPEAT 5 nhưng Clap 4. Đếm to. Test.

## Check
1. Loop để làm gì?
2. Hai bản Clap khác chữ, giống tai — đúng không?
3. Đi vuông REPEAT 4 được không? Vì sao?

## Homework
- [ ] Viết REPEAT cho việc con làm mỗi sáng (ví dụ 7 ngày đánh răng — nói “cả tuần” vs 7 dòng).

## Pass
Tự viết 1 REPEAT chạy đúng khi đóng kịch.

## Next
L08 Maze challenge + câu cổng + badge.

---

# L08 — Algorithm Challenge

Level: L0 beginner
Duration: 50 min
Language: unplugged
When: Sun 2026-11-01 09:00

## Objective
Con tự thiết kế algorithm robot lấy kho báu. Bố không gợi ý đường. Con nói câu cổng.

## Parent prep
Lưới 6×6, tường, gem, E. Không mẫu đáp án trên bàn.

## Story
“Hôm nay bố không biết đường. Con là kỹ sư. Bố là máy.”

## Ask
Tám câu. Đặc biệt: Problem? Vẽ? Algorithm? Test 2 đường? Đổi chỗ gem thì sao?

## Unplugged
Luật: S → lấy gem → E. Đụng tường = fail. Viết trên giấy rồi mới chạy.

Hai màn. Màn 2 đổi gem.

## Explain
Nhắc 8 từ: instruction, sequence, algorithm, input, output, condition (nếu con tự nói “nếu đụng tường thì dừng”), repetition, debug.

Không nhồi. Chỉ điểm những từ con đã **làm**.

## Build
Tờ program hoàn chỉnh: START … END. Chạy. Debug. Ký.

## Practice
Con đặt tường cho bố. Bố viết algorithm (cố ý 1 bug). Con debug — badge Debugger nếu đủ 3.

## Challenge
REPEAT trên đoạn đi thẳng dài.

## Mistakes
Con vừa đi vừa nghĩ, không viết. Bố: “Máy chỉ đọc giấy. Viết xong mới chạy.”

## Check
Con nói nguyên câu: “Algorithm là một chuỗi bước để giải quyết một vấn đề.”  
Kèm: chỉ tờ giấy vừa chạy.

## Homework
- [ ] Kể cho một người: algorithm là gì + 1 ví dụ sandwich hoặc mê cung.

## Pass
Tới gem rồi E ít nhất 1 màn; nói đúng câu cổng. Tick Algorithm Thinker.

## Next
L09 Scratch interface — máy thật, con mèo, cờ xanh.
