# L3 — Data & State

Variable = hộp có tên. List = dãy hộp. Cổng L46 High Score.
Badge: Variable Master L34, Data Explorer L46.

---

# L33 — Variable

## Objective
Con hiểu variable = **hộp có tên**. Tên không đổi, đồ bên trong đổi được.

## Parent prep
3 hộp giày dán nhãn: `score`, `name`, `age`. Giấy nhỏ + bút. Project trống.

## Story
**Bố nói:** “Tủ đồ của con có ngăn ghi ‘Áo’, ‘Quần’, ‘Tất’. Đồ trong ngăn thay mỗi ngày, nhưng nhãn vẫn vậy. Máy tính cũng có ngăn như thế — gọi là **variable**.”

## Ask
- Hộp `score` đang chứa gì?
- Thay số mới thì số cũ đi đâu?
- Hai hộp có thể trùng tên không?

## Unplugged
**Con** viết 0, bỏ vào hộp `score`. Bố hỏi “score bằng mấy?” — con mở hộp đọc.
Bố bảo “set score to 7”: con **lấy giấy cũ ra**, bỏ giấy 7 vào.
Con bỏ tên mình vào hộp `name`, tuổi vào `age`. Bố đọc: “Hello Nam, 9 tuổi.”

## Explain
Variable có **tên** và **giá trị**.
`set x to 7` = bỏ giấy cũ, cất giấy mới.
Một hộp chỉ chứa **một** thứ tại một lúc.

## Build
1. Variables → Make a Variable → `score` (For all sprites).
2. `set score to 0` → `say score for 2 seconds`.
3. Make `name`. `ask What's your name?` → `set name to answer`.
4. `say (join Hello name)`.

```scratch
when green flag clicked
set [score] to (0)
say (score) for (2) seconds
ask [What's your name?] and wait
set [name] to (answer)
say (join [Hello ] (name)) for (2) seconds
```

## Practice
Đổi `set score to 7`. Bấm cờ. Bỏ tick hiển thị biến rồi tick lại.
Hỏi thêm tuổi, lưu vào `age`.

## Challenge
Hỏi 2 câu, lưu 2 biến, rồi nói cả hai: “Nam is 9” (nhớ L13: answer chỉ giữ câu mới nhất — nay biến giữ hộ).

## Mistakes
Tạo biến tên lạ (`my variable`). Bố: “Tên phải nói được nó chứa gì.”
Dùng `answer` sau 2 câu hỏi — mất câu 1. Bố: “Cất vào hộp ngay sau khi hỏi.”

## Check
1. Variable là gì?
2. `set score to 7` thì số cũ đâu?
3. Vì sao cần biến `name` dù có `answer`?

## Homework
- [ ] Dán nhãn 3 hộp trong nhà (bút, đồ chơi, sách) và ghi số đồ trong mỗi hộp.

## Pass
Đổi set thành 7, mèo nói 7. Con giải thích “hộp có tên”.

## Next
L34 Counter — mỗi lần bấm, hộp tăng 1.

---

# L34 — Counter

## Objective
Con làm bộ đếm: `count = count + 1` mỗi lần bấm space.

## Parent prep
Máy đếm bấm tay (hoặc hạt đậu + cốc). Hộp giày `count`. Project trống.

## Story
**Bố nói:** “Người gác cổng sân vận động bấm ‘tách’ mỗi khi có người vào. Cuối ngày nhìn số là biết bao nhiêu người. Hôm nay mèo là người gác cổng.”

## Ask
- Mỗi người vào, số tăng mấy?
- Bắt đầu ngày, máy đếm bằng mấy?
- “Tăng 1” thật ra gồm mấy bước?

## Unplugged
Hộp `count` có giấy 0. **Con** làm 3 bước mỗi lần bố vỗ tay:
1. Lấy giấy ra, đọc số.
2. Cộng 1 trong đầu.
3. Viết số mới, cất vào.
Vỗ 5 lần. Con nói: “Lấy cũ — cộng 1 — cất lại.”

## Explain
`change count by 1` = lấy cũ, cộng 1, cất lại (3 bước gói trong 1 khối).
Counter luôn bắt đầu bằng `set count to 0`.

## Build
1. Biến `count`. Cờ → `set count to 0`.
2. `when space key pressed` → `change count by 1` → `say count`.
3. Bấm 5 lần.

```scratch
when green flag clicked
set [count] to (0)

when [space] key pressed
change [count] by (1)
say (count) for (0.5) seconds
```

## Practice
Đếm click vào mèo. Đếm ngược: `set count to 10`, `change by -1`.

## Challenge
Khi count = 10, mèo nói “Ten!” và `set count to 0`.

## Mistakes
Dùng `set count to 1` thay vì change — luôn bằng 1. Bố: “Set là thay, change là cộng.”
Quên reset lúc cờ. Bố: “Ngày mới, máy đếm bằng mấy?”

## Check
1. `change count by 1` gồm mấy bước bên trong?
2. Bấm 5 lần → count = ?
3. Đếm ngược dùng số mấy?

## Homework
- [ ] Đếm số bậc cầu thang nhà / chung cư, ghi lên giấy.

## Pass
Bấm 5 lần, biến = 5. Con giải thích “lấy cũ cộng 1 cất lại” → tick **Variable Master**.

## Next
L35 Accumulator — cộng dồn nhiều số.

---

# L35 — Accumulator

## Objective
Con cộng dồn: `sum = sum + answer` qua nhiều lần hỏi.

## Parent prep
Ống heo + đồng xu giấy (1, 2, 5). Hộp `sum`. Project trống.

## Story
**Bố nói:** “Ống heo không đếm số đồng xu — nó cộng **giá trị**. Bỏ đồng 5 thì tăng 5, đồng 2 thì tăng 2. Hôm nay mèo là ống heo.”

## Ask
- Counter tăng mấy mỗi lần? Accumulator tăng mấy?
- Ống heo mới có bao nhiêu tiền?
- 3 + 5 + 2 = ?

## Unplugged
Hộp `sum` = 0. Bố đưa đồng 3: con lấy giấy ra, 0 + 3 = 3, cất.
Đồng 5: 3 + 5 = 8. Đồng 2: 8 + 2 = 10.
Con nói: “Lấy cũ — cộng **số mới** — cất lại.”

## Explain
Accumulator = biến cộng dồn.
`change sum by (answer)` = cộng số vừa nhập.
Counter cộng 1, accumulator cộng giá trị.

## Build
1. Biến `sum`. `set sum to 0`.
2. `repeat 3`: `ask Give me a number` → `change sum by answer`.
3. `say (join Total:  sum)`.

```scratch
when green flag clicked
set [sum] to (0)
repeat (3)
  ask [Give me a number] and wait
  change [sum] by (answer)
end
say (join [Total: ] (sum))
```

## Practice
Nhập 3, 5, 2 → 10. Nhập 10, 20, 30 → 60. Con tính nhẩm trước.

## Challenge
Hỏi “Bao nhiêu số?” trước, dùng `repeat (answer)` — nhớ lưu vào biến `n` trước.

## Mistakes
Set sum trong repeat — mất số cũ. Bố: “Đổ ống heo mấy lần?”
Gõ chữ thay số — Scratch coi là 0. Bố: “Máy cần số.”

## Check
1. Counter và accumulator khác nhau ở đâu?
2. 4 + 4 + 4 → ?
3. Dòng nào phải đứng ngoài repeat?

## Homework
- [ ] Cộng tiền tiêu vặt 1 tuần trên giấy theo cách “lấy cũ cộng mới”.

## Pass
3 + 5 + 2 → 10.

## Next
L36 Random — máy chọn ngẫu nhiên, táo rơi khắp nơi.

---

# L36 — Random

Project: Apple Rain

## Objective
Con dùng `pick random`: mỗi lần chạy, táo rơi ở chỗ khác.

## Parent prep
Một con xúc xắc. Project có sprite Apple. Stage nền bầu trời.

## Story
**Bố nói:** “Nếu táo luôn rơi đúng một chỗ, con chỉ đứng đó là thắng — chán lắm. Game hay phải **bất ngờ**. Máy tính có xúc xắc riêng: `pick random`.”

## Ask
- Tung xúc xắc ra số mấy? Biết trước không?
- Random 1 đến 6 có ra 7 không?
- Táo nên rơi từ x bao nhiêu đến bao nhiêu?

## Unplugged
**Con** tung xúc xắc 5 lần, ghi số. Hỏi: “Có đoán trước được không?”
Con đứng ở giữa phòng, bố tung xúc xắc: 1–2 bố ném bóng bên trái, 3–4 giữa, 5–6 phải. Con bắt.

## Explain
`pick random 1 to 6` = xúc xắc 6 mặt.
`pick random -200 to 200` = vị trí x ngẫu nhiên trên Stage.
Mỗi lần gọi ra số mới.

## Build
1. Apple: cờ → `go to x: (pick random -200 to 200) y: 180`.
2. Forever: `change y by -5`.
3. Nếu `y < -170`: lên lại đầu với x random mới.

```scratch
when green flag clicked
go to x: (pick random (-200) to (200)) y: (180)
forever
  change y by (-5)
  if <(y position) < (-170)> then
    go to x: (pick random (-200) to (200)) y: (180)
  end
end
```

## Practice
Mèo nói số xúc xắc: `say (pick random 1 to 6)` mỗi lần bấm space. Ghi 10 lần.
Tốc độ rơi random: `change y by (pick random -3 to -8)`.

## Challenge
Duplicate Apple 3 lần → mưa táo. Mỗi táo tự random.

## Mistakes
Random -200 đến 200 cho y — táo xuất hiện giữa màn hình. Bố: “Táo rơi từ đâu?”
Random chỉ một lần ngoài forever — táo rơi mãi một chỗ. Bố: “Lên lại có random lại không?”

## Check
1. `pick random 1 to 10` có thể ra số mấy?
2. Vì sao game cần random?
3. Dòng nào làm táo rơi chỗ mới?

## Homework
- [ ] Tung xúc xắc 30 lần, đếm mỗi số ra mấy lần.

## Pass
Mỗi lần bấm cờ và mỗi lần rơi lại, táo ở chỗ khác.

## Next
L37 Guess the Number — máy nghĩ số, con đoán.

---

# L37 — Guess the Number

## Objective
Con làm game: máy chọn số 1–20, con đoán, máy gợi ý “lớn hơn / nhỏ hơn” cho tới khi đúng.

## Parent prep
Thẻ số 1–20 úp. Giấy ghi số lần đoán. Project trống.

## Story
**Bố nói:** “Bố nghĩ một số từ 1 đến 20. Con đoán. Bố chỉ nói ‘lớn hơn’ hoặc ‘nhỏ hơn’. Con đoán ít lần nhất là thắng. Hôm nay con dạy máy tính chơi trò này.”

## Ask
- Đoán đầu tiên nên là số mấy? Vì sao?
- Nếu bố nói “lớn hơn” thì bỏ những số nào?
- Khi nào trò chơi dừng?

## Unplugged
Bố rút 1 thẻ. Con đoán, bố gợi ý. Đếm số lần.
Chơi 2 ván. Ván 2 con thử đoán 10 trước. Hỏi: “Đoán giữa có nhanh hơn không?”

## Explain
Máy cần nhớ số bí mật → biến `secret`.
`repeat until answer = secret` = lặp tới khi đúng.
Trong vòng lặp: if nhỏ hơn → “Higher”, else → “Lower”.

## Build
1. `set secret to (pick random 1 to 20)`.
2. `ask Guess 1-20` lần đầu.
3. `repeat until answer = secret`: if `answer < secret` say Higher else say Lower → ask lại.
4. Sau vòng lặp: `say You got it!`.

```scratch
when green flag clicked
set [secret] to (pick random (1) to (20))
ask [Guess a number 1-20] and wait
repeat until <(answer) = (secret)>
  if <(answer) < (secret)> then
    say [Higher!] for (1) seconds
  else
    say [Lower!] for (1) seconds
  end
  ask [Guess again] and wait
end
say [You got it!]
```

## Practice
Thêm biến `tries`: đếm số lần đoán. Nói “You got it in 4 tries”.

## Challenge
Số 1–100. Con đoán bao nhiêu lần? (Gợi ý cho L110 Binary Search.)

## Mistakes
Random trong vòng lặp — số bí mật đổi liên tục. Bố: “Máy nghĩ số mấy lần?”
Nhầm Higher/Lower. Bố: “Answer nhỏ hơn secret thì con nên đoán lớn hơn hay nhỏ hơn?”

## Check
1. Biến `secret` để làm gì?
2. Vòng lặp dừng khi nào?
3. Đoán giữa có lợi gì?

## Homework
- [ ] Chơi Guess the Number với mẹ trên giấy 1–50, ghi số lần.

## Pass
Đoán được số, gợi ý đúng chiều, con hiểu “lớn hơn / nhỏ hơn”.

## Next
L38 String — chữ cũng là dữ liệu.

---

# L38 — String

## Objective
Con biết **string** = chuỗi chữ. Dùng `join`, `length of`, `letter 1 of`.

## Parent prep
Thẻ chữ cái rời: N-A-M (tên con, không dấu). Dây kẹp quần áo để kẹp chữ thành hàng. Project trống.

## Story
**Bố nói:** “Chữ trong máy tính giống chuỗi hạt: mỗi hạt một chữ cái, xâu thành dây. Dây đó gọi là **string**. Máy biết đếm hạt, lấy hạt số 1, nối hai dây.”

## Ask
- Tên con có mấy chữ cái?
- Chữ cái đầu tiên là gì?
- Nối “NAM” và “123” ra gì?

## Unplugged
**Con** kẹp thẻ N-A-M lên dây. Bố hỏi: “Dài mấy?” (3) “Hạt số 1?” (N).
Nối thêm dây “-9” → “NAM-9”.
Con đếm tên bố, tên mẹ.

## Explain
String = chữ, đặt trong `" "` khi nói về code.
`length of NAM` = 3. `letter 1 of NAM` = N.
`join A B` = nối dây (L13).
Số `"5"` trong ô chữ cũng là chữ.

## Build
1. `ask What's your name?`.
2. `say (join (length of answer)  letters)`.
3. `say (join First letter:  (letter 1 of answer))`.

```scratch
when green flag clicked
ask [What's your name?] and wait
say (join (length of (answer)) [ letters]) for (2) seconds
say (join [First letter: ] (letter (1) of (answer))) for (2) seconds
```

## Practice
Chữ cái cuối: `letter (length of answer) of answer`.
Thử tên dài, tên 1 chữ.

## Challenge
In tên ngược: repeat với biến i từ length xuống 1, join từng chữ.

## Mistakes
Gõ tên có dấu (Nam → “Nâm”) — vẫn chạy nhưng con đếm khác. Bố: “Hôm nay gõ không dấu.”
Dấu cách cũng là 1 chữ. Bố: “Đếm cả khoảng trắng.”

## Check
1. String là gì?
2. `length of HELLO` = ?
3. `letter 2 of CAT` = ?

## Homework
- [ ] Viết tên 3 người trong nhà, đếm chữ cái, ai dài nhất?

## Pass
Tên 3 chữ → máy nói 3, và nói đúng chữ cái đầu.

## Next
L39 List — một dãy hộp.

---

# L39 — List

## Objective
Con biết **list** = dãy hộp có số thứ tự. Tạo list `fruits`, lấy item 1.

## Parent prep
3 cốc giấy xếp hàng, đánh số 1, 2, 3. Giấy ghi Apple, Banana, Orange. Project trống.

## Story
**Bố nói:** “Một hộp chỉ chứa một thứ. Muốn nhớ cả danh sách đi chợ thì sao? Ta xếp nhiều hộp thành hàng, đánh số 1, 2, 3. Hàng hộp đó là **list**.”

## Ask
- Hộp số 1 chứa gì?
- List có mấy item?
- Thêm Mango thì nó ở số mấy?

## Unplugged
**Con** bỏ Apple vào cốc 1, Banana cốc 2, Orange cốc 3.
Bố hỏi: “Item 2 là gì?” “Có mấy item?”
Bố đổi chỗ cốc — con nói: “Số thứ tự là vị trí, không phải tên.”

## Explain
List có tên (`fruits`) và nhiều item.
Item đánh số **từ 1** trong Scratch.
`item 1 of fruits`, `length of fruits`.

## Build
1. Variables → Make a List → `fruits`.
2. Bấm dấu + dưới list trên Stage, gõ tay: Apple, Banana, Orange.
3. `say (item 1 of fruits)`.
4. `say (join Count:  (length of fruits))`.

```scratch
when green flag clicked
say (item (1) of [fruits]) for (2) seconds
say (join [Count: ] (length of [fruits])) for (2) seconds
```

## Practice
`say (item (pick random 1 to 3) of fruits)` — mèo chọn trái cây ngẫu nhiên.
Tạo list `friends` 3 tên.

## Challenge
Mèo đọc hết list: repeat `length of fruits`, biến i tăng dần, say item i.

## Mistakes
Hỏi item 4 khi list có 3 — trống. Bố: “Có hộp số 4 không?”
Nhầm list với biến. Bố: “Biến 1 hộp, list nhiều hộp.”

## Check
1. List khác variable chỗ nào?
2. Item đầu tiên số mấy?
3. List `fruits` dài bao nhiêu?

## Homework
- [ ] Viết list đi chợ 5 món, đánh số, đọc cho mẹ item 3.

## Pass
List có 3 item gõ tay, mèo nói item 1 đúng.

## Next
L40 List Add — thêm vào list bằng code.

---

# L40 — List Add

## Objective
Con dùng `add answer to list`: thêm item bằng code thay vì gõ tay.

## Parent prep
Cốc giấy rỗng thêm vào cuối hàng. Project L39.

## Story
**Bố nói:** “Gõ tay từng món thì chậm. Mình bảo mèo hỏi, rồi tự bỏ vào cuối hàng.”

## Ask
- Item mới đứng ở đầu hay cuối?
- Hỏi 3 lần thì list dài thêm mấy?
- Bắt đầu chương trình, list nên rỗng hay đầy?

## Unplugged
Bố đọc “Mango” — **con** đặt cốc mới ở **cuối** hàng, bỏ giấy vào.
Đọc 3 món. Con đếm length.
Bố hỏi: “Muốn bắt đầu lại sạch thì làm gì?” (đổ hết cốc)

## Explain
`add X to fruits` = thêm vào cuối.
`delete all of fruits` = làm rỗng list. Đặt ở đầu chương trình.

## Build
1. Cờ → `delete all of fruits`.
2. `repeat 3`: `ask Name a fruit` → `add answer to fruits`.
3. `say (join I have  (length of fruits))`.

```scratch
when green flag clicked
delete all of [fruits]
repeat (3)
  ask [Name a fruit] and wait
  add (answer) to [fruits]
end
say (join [I have ] (length of [fruits])) for (2) seconds
```

## Practice
Hỏi tới khi gõ “done”: `repeat until answer = done`. Không add chữ done.

## Challenge
`insert answer at 1 of fruits` — thêm vào đầu. So với add.

## Mistakes
Không delete all — list dài mãi sau mỗi lần cờ. Bố: “Bấm cờ 3 lần list dài bao nhiêu?”
Add chữ “done” vào list. Bố: “Kiểm tra trước khi add.”

## Check
1. `add` thêm vào đâu?
2. Vì sao delete all ở đầu?
3. Hỏi 3 lần, list dài?

## Homework
- [ ] Ghi list 5 con vật con thích theo thứ tự nghĩ ra, đánh số.

## Pass
Hỏi 3 lần, list dài đúng 3, bấm cờ lại vẫn 3.

## Next
L41 List Delete — xóa item.

---

# L41 — List Delete

## Objective
Con dùng `delete N of list` để xóa item và thấy các item sau **dồn lên**.

## Parent prep
Hàng 4 cốc trái cây. Project có list fruits 4 item.

## Story
**Bố nói:** “Con ăn quả táo đầu hàng. Hàng còn lại có giữ chỗ trống không, hay mọi người dồn lên?”

## Ask
- Xóa item 1 thì Banana thành số mấy?
- List còn dài bao nhiêu?
- Xóa item 10 khi list có 4 thì sao?

## Unplugged
Hàng: Apple(1) Banana(2) Orange(3) Mango(4). **Con** “ăn” cốc 1, dồn cả hàng lên.
Bố hỏi lại số của Banana (giờ là 1).
Xóa cốc 2 (Orange) → còn Banana, Mango.

## Explain
`delete 1 of fruits` = xóa item số 1, các item sau dồn lên.
`delete (length of fruits) of fruits` = xóa item cuối.
Vị trí đổi sau mỗi lần xóa.

## Build
1. Cờ → delete all → add Apple, Banana, Orange, Mango.
2. `when space key pressed` → `say (join Eat:  (item 1 of fruits))` → `delete 1 of fruits`.
3. Bấm space từng lần, nhìn list trên Stage.

```scratch
when [space] key pressed
if <(length of [fruits]) > (0)> then
  say (join [Eat: ] (item (1) of [fruits])) for (1) seconds
  delete (1) of [fruits]
else
  say [No more fruit!]
end
```

## Practice
Xóa item cuối mỗi lần bấm phím x.
Hỏi “Xóa số mấy?” → `delete answer of fruits`.

## Challenge
Xóa theo tên: tìm vị trí `item # of Banana in fruits` rồi delete.

## Mistakes
Xóa khi list rỗng — không sao nhưng mèo nói trống. Bố: “Kiểm tra length trước.”
Nghĩ vị trí không đổi. Bố: “Xóa xong đếm lại.”

## Check
1. Xóa item 1, item 2 cũ thành số mấy?
2. Xóa hết 4 item cần bấm mấy lần?
3. Vì sao cần if length > 0?

## Homework
- [ ] Xếp 5 viên kẹo thành hàng, ăn viên số 2, đánh số lại.

## Pass
Từ 3 item, xóa 1 → còn 2, các item dồn lên đúng.

## Next
L42 List Search — list có chứa X không?

---

# L42 — List Search

## Objective
Con dùng `list contains X?` và test cả khi **có** và khi **không có**.

## Parent prep
Hàng cốc úp có giấy trái cây bên trong. Project L41.

## Story
**Bố nói:** “Mẹ hỏi: ‘Nhà còn chuối không?’ Con phải xem từng ngăn tủ lạnh. Máy tính có khối làm việc đó trong chớp mắt: `contains`.”

## Ask
- Câu hỏi “có chuối không?” trả lời kiểu gì? (boolean)
- Phải test mấy trường hợp?
- Nếu gõ “banana” thường thì sao?

## Unplugged
Con lật từng cốc tìm “Orange”. Thấy → hô “TRUE”. Hết cốc không thấy “Grape” → “FALSE”.
Bố hỏi: “Con lật mấy cốc cho Grape?” (hết hàng)

## Explain
`fruits contains Apple?` = boolean.
Test **có** và **không có** — luôn 2 trường hợp.
Scratch không phân biệt hoa thường trong contains.

## Build
1. List fruits có 3 item.
2. `ask What fruit?` → if `fruits contains answer` say Found! else say Not here.

```scratch
when green flag clicked
ask [What fruit are you looking for?] and wait
if <[fruits] contains (answer)?> then
  say [Found it!]
else
  say [Not here]
end
```

## Practice
Test: Apple (có), Grape (không), apple thường (có).
Thêm: nếu không có thì hỏi “Add it?” → add.

## Challenge
Nói vị trí: `item # of answer in fruits`.

## Mistakes
Test một trường hợp. Bố: “Đã test lúc không có chưa?”
Gõ thừa dấu cách “Apple ”. Bố: “Đếm chữ.”

## Check
1. contains trả về gì?
2. Hai test bắt buộc?
3. Không có thì máy phải xem mấy item?

## Homework
- [ ] Đố mẹ: con nghĩ 1 món trong list đi chợ, mẹ hỏi “có X không?”.

## Pass
Test có và không đều đúng.

## Next
L43 List Count — list dài bao nhiêu.

---

# L43 — List Count

## Objective
Con dùng `length of list` để đếm item và phân biệt với **giá trị** bên trong.

## Parent prep
List số: 5, 10, 3, 8. Hộp giấy có số 100. Project trống.

## Story
**Bố nói:** “Trong ví có 3 tờ tiền. Ví có 3 tờ nhưng chưa chắc có 3 nghìn. Đếm **số tờ** khác với cộng **giá trị**.”

## Ask
- List 5, 10, 3, 8 có mấy item?
- Tổng bằng mấy?
- Hai câu hỏi đó khác nhau ở đâu?

## Unplugged
Con xếp 4 thẻ số. Bố hỏi “Có mấy thẻ?” (4) rồi “Tổng?” (26).
Thêm thẻ 0. Mấy thẻ? (5) Tổng? (vẫn 26).

## Explain
`length of list` = số item.
Tổng = phải cộng dồn (L35) — bài L48.
Item có thể là số 0 — vẫn tính 1 item.

## Build
1. List `nums`: 5, 10, 3, 8.
2. `say (join Count:  (length of nums))`.
3. Hỏi số mới, add, nói length mới.

```scratch
when green flag clicked
say (join [Count: ] (length of [nums])) for (2) seconds
ask [Add a number] and wait
add (answer) to [nums]
say (join [Now: ] (length of [nums])) for (2) seconds
```

## Practice
Đếm số trái cây trong list fruits 4 item → 4.
List rỗng → 0.

## Challenge
Đếm bằng tay: biến `c = 0`, repeat length, change c by 1 — ra giống length không? (chuẩn bị L47)

## Mistakes
Nhầm length với item cuối. Bố: “Đếm thẻ hay đọc số trên thẻ?”
Thêm chữ rỗng — vẫn tăng length. Bố: “Ô trống cũng là một item.”

## Check
1. length đếm gì?
2. List [0, 0] có length?
3. Muốn tổng thì dùng gì?

## Homework
- [ ] Đếm số bút trong hộp và cộng tổng giá tiền (hỏi mẹ giá).

## Pass
4 trái → 4. Con nói được khác nhau giữa đếm và tổng.

## Next
L44 List Maximum — số lớn nhất.

---

# L44 — List Maximum

## Objective
Con tìm số lớn nhất bằng cách đi hết list, giữ “nhà vô địch” trong biến `max`.

## Parent prep
5 thẻ số: 3, 8, 2, 10, 5. Một “cúp” giấy. Project trống, list `nums`.

## Story
**Bố nói:** “Cuộc thi vật tay: nhà vô địch ngồi ghế. Người mới tới đấu — thắng thì ngồi ghế thay. Hết người, ai ngồi ghế là mạnh nhất.”

## Ask
- Ai ngồi ghế đầu tiên?
- Người mới thua thì sao?
- Có cần xem hết mọi người không?

## Unplugged
Thẻ úp thành hàng. Con lật thẻ 1 (3) → đặt cúp lên. Lật thẻ 2 (8) > 3 → chuyển cúp.
Lật hết: 2 (giữ), 10 (chuyển), 5 (giữ). Cúp ở 10.
Con nói từng bước: “So — lớn hơn thì đổi.”

## Explain
`max = item 1`. Đi i từ 2 tới length.
`if item i > max then set max to item i`.
Phải đi **hết** list.

## Build
1. `set max to item 1 of nums`, `set i to 2`.
2. `repeat (length of nums - 1)`: if item i > max → set max; `change i by 1`.
3. `say max`.

```scratch
when green flag clicked
set [max] to (item (1) of [nums])
set [i] to (2)
repeat ((length of [nums]) - (1))
  if <(item (i) of [nums]) > (max)> then
    set [max] to (item (i) of [nums])
  end
  change [i] by (1)
end
say (join [Max: ] (max))
```

## Practice
List 3, 8, 2, 10, 5 → 10. Đổi số lớn nhất về đầu list. Về cuối list.

## Challenge
Nói cả vị trí của max (biến `pos`).

## Mistakes
`set max to 0` với list số âm → sai. Bố: “Nếu tất cả âm thì sao?” (dùng item 1)
Quên change i — so mãi item 2. Bố: “i có tăng không?”

## Check
1. max bắt đầu bằng gì?
2. Vì sao phải đi hết list?
3. Max ở cuối list có tìm được không?

## Homework
- [ ] Tìm người cao nhất trong nhà bằng cách “đổi cúp”.

## Pass
3 8 2 10 5 → 10.

## Next
L45 List Minimum — số nhỏ nhất.

---

# L45 — List Minimum

## Objective
Con tìm số nhỏ nhất — giống max nhưng đổi dấu `<`.

## Parent prep
Cùng 5 thẻ. Project L44 (duplicate thành L45).

## Story
**Bố nói:** “Thi chạy: ai về **ít giây nhất** thắng. Cũng là đổi cúp, nhưng lần này nhỏ hơn mới thắng.”

## Ask
- Code max đổi chỗ nào để thành min?
- Min của 3 8 2 10 5?
- Có cần đi hết list không?

## Unplugged
Lật thẻ, cúp đổi khi số **nhỏ hơn**. 3 → 2 (đổi) → giữ tới hết.
Con so sánh với hôm qua: “Chỉ đổi một dấu.”

## Explain
`min = item 1`. `if item i < min then set min`.
Một thay đổi nhỏ (dấu) → kết quả ngược.
Đây là lần đầu con **tái sử dụng** algorithm.

## Build
1. Duplicate project L44.
2. Đổi tên biến max → min (chuột phải → rename).
3. Đổi `>` thành `<`.

```scratch
when green flag clicked
set [min] to (item (1) of [nums])
set [i] to (2)
repeat ((length of [nums]) - (1))
  if <(item (i) of [nums]) < (min)> then
    set [min] to (item (i) of [nums])
  end
  change [i] by (1)
end
say (join [Min: ] (min))
```

## Practice
Tính cả max và min trong 1 vòng lặp.

## Challenge
Khoảng cách: `max - min`.

## Mistakes
Đổi dấu nhưng quên tên biến — đọc rối. Bố: “Tên nói đúng việc chưa?”

## Check
1. Từ max sang min đổi mấy chỗ?
2. 3 8 2 10 5 → min?
3. Max − min = ?

## Homework
- [ ] Ghi nhiệt độ 5 ngày (xem dự báo), tìm ngày lạnh nhất.

## Pass
3 8 2 10 5 → 2.

## Next
L46 Data Challenge — bảng điểm cao.

---

# L46 — Data Challenge

Project: High Score Table

## Objective
Con làm bảng điểm cao: sau mỗi ván, thêm tên + điểm vào 2 list. Checkpoint Level 3.

## Parent prep
Game Catch Apple (L28–L29) đã có score. Giấy kẻ bảng 2 cột Tên | Điểm. Coding Passport mở.

## Story
**Bố nói:** “Máy game ngoài khu vui chơi có bảng ‘High Score’ — tên người chơi và điểm. Hôm nay game của con cũng có bảng đó. Con tự thiết kế, bố chỉ hỏi.”

## Ask
- Cần mấy list? (names, scores)
- Item 1 của names khớp item mấy của scores?
- Khi nào thêm vào bảng?

## Spec [5]
Con đọc spec, vẽ 2 cột trên giấy.
Spec: hết ván → hỏi tên → add tên vào `names`, add score vào `scores` → hiện cả 2 list. Bấm cờ chơi lại, bảng **vẫn còn**.

## Build [24]
Con tự làm. Gợi ý nếu kẹt:
- Không `delete all` 2 list khi bấm cờ.
- Hỏi tên khi `lives = 0` (hoặc nhận tin GAME_OVER).
- Hiện max của scores (dùng L44).

```scratch
when I receive [GAME_OVER]
ask [Your name?] and wait
add (answer) to [names]
add (score) to [scores]
```

## Test [8]
Chơi 3 ván, 3 tên. Kiểm tra: tên và điểm cùng hàng? Điểm cao nhất đúng?
Bấm cờ: bảng còn?

## Mistakes
Delete all lúc cờ — mất bảng. Bố: “Bảng điểm cao có nên xóa mỗi ván không?”
Add tên mà quên add điểm — 2 list lệch. Bố: “Đếm length 2 list.”

## Check
1. Vì sao 2 list phải cùng length?
2. Tìm điểm cao nhất dùng algorithm nào?
3. Item 2 của names là ai, điểm bao nhiêu?

## Homework
- [ ] Mời 3 người chơi, chụp bảng điểm.

## Pass
Thêm điểm mới, bảng còn sau khi bấm cờ lại, hiện điểm cao nhất → tick **Data Explorer**.

## Next
L47 Counting — Level 4 Algorithm: Think trước, code sau.
