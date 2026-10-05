# L2 — Logic

Scratch. Cổng: con tự thiết kế Dodge (L32), bố không đưa code mẫu.
Badge: Problem Solver nếu L32 xong không mẫu.

Mỗi bài 50 phút, 8 câu hỏi. Kịch bản giờ tự sinh khi đưa lên Work OS.

---

# L21 — Boolean

## Objective
Con biết: máy tính trả lời câu hỏi bằng **true** (đúng) hoặc **false** (sai). Không có “hơi đúng”.

## Parent prep
10 thẻ giấy câu hỏi (bố viết sẵn): “2+2=4”, “Trời đang mưa trong phòng”, “Mèo có 4 chân”, “5 lớn hơn 9”… Hai thẻ to: TRUE (xanh) · FALSE (đỏ). Project L20 mở sẵn.

## Story
**Bố nói:** “Máy tính rất thẳng thắn. Hỏi nó gì, nó chỉ nói ‘đúng’ hoặc ‘sai’. Câu trả lời đó có tên là **Boolean** — theo tên ông George Boole, người nghĩ ra logic đúng/sai.”

## Ask
- “Con đang ngồi” — đúng hay sai?
- “Mèo biết bay” — đúng hay sai?
- Có câu nào vừa đúng vừa sai không?

## Unplugged
**Bố** đọc từng thẻ. **Con** giơ TRUE hoặc FALSE trong 3 giây.
Đổi vai: con đọc, bố giơ — bố cố tình giơ sai 1 lần, con bắt lỗi.
Con tự viết 2 câu: 1 câu true, 1 câu false.

## Explain
Boolean = true hoặc false.
Trong Scratch, khối **6 cạnh** ◇ luôn trả về boolean.
If (L19) chỉ nhận khối 6 cạnh.

## Build
1. Mở nhóm **Sensing**. Kéo `touching mouse-pointer?` ra vùng code, **không** gắn vào script.
2. Bấm vào khối: Scratch hiện bong bóng `true` / `false`.
3. Đưa chuột chạm mèo rồi bấm lại — xem đổi.
4. Làm script: `forever` → `say (touching mouse-pointer?)`.

```scratch
when green flag clicked
forever
  say <touching (mouse-pointer)?>
end
```

## Practice
Thử `key space pressed?` trong say: giữ space → true, thả → false.
Thử `mouse down?`.

## Challenge
Tìm 3 khối 6 cạnh khác trong Scratch (nhóm Sensing, Operators). Bấm thử từng cái.

## Mistakes
Cố nhét khối tròn vào ô 6 cạnh — không vừa. Bố: “Ô này chỉ nhận câu hỏi đúng/sai.”
Bấm khối khi mèo không ở vị trí — luôn false. Bố: “Thử chạm rồi bấm lại.”

## Check
1. Boolean có mấy giá trị?
2. Hình khối boolean trong Scratch?
3. Đưa ra 1 khối cho true và 1 khối cho false.

## Homework
- [ ] Viết 5 câu về nhà mình, đánh T/F bên cạnh. Đố mẹ.

## Pass
Con chỉ được 1 khối đang true, 1 khối đang false, và nói “boolean chỉ có đúng hoặc sai”.

## Next
L22 Comparison — so sánh lớn hơn, nhỏ hơn, bằng.

---

# L22 — Comparison

## Objective
Con dùng `>`, `<`, `=` để so sánh hai số. Kết quả là boolean.

## Parent prep
Bộ thẻ số 0–20. Ba thẻ dấu to: `>` `<` `=`. Project trống.

## Story
**Bố nói:** “Cá sấu tham ăn luôn há miệng về phía số lớn hơn. 8 > 3: cá sấu há về số 8. Máy tính so sánh như vậy và trả lời true hoặc false.”

## Ask
- 7 và 4, số nào lớn hơn?
- 5 = 5 đúng hay sai?
- 10 < 2 đúng hay sai?

## Unplugged
**Bố** rút 2 thẻ số. **Con** đặt thẻ dấu ở giữa cho đúng.
Bố đặt sẵn dấu sai: “9 < 3”. Con hô “FALSE!”.
5 lượt. Lượt cuối hai số bằng nhau.

## Explain
`a > b` true khi a lớn hơn.
`a < b` true khi a nhỏ hơn.
`a = b` true khi bằng nhau. Cả 3 là khối xanh lá 6 cạnh (Operators).

## Build
1. Make a Variable `score`. `set score to 0`.
2. `if score > 10 then say Win! else say Not yet`.
3. Bấm cờ: Not yet. Sửa set thành 15, bấm cờ: Win!

```scratch
when green flag clicked
set [score] to (15)
if <(score) > (10)> then
  say [Win!]
else
  say [Not yet]
end
```

## Practice
Đổi 10 thành 3, rồi 20. Con đoán trước kết quả rồi mới bấm cờ.
Thử `score = 10` với score = 10.

## Challenge
Hỏi tuổi bằng `ask`. If `answer > 8` → “Big kid!” else “Little one!”.

## Mistakes
Nhầm chiều `>` và `<`. Bố: “Cá sấu há về số nào?”
Gõ chữ vào ô số. Bố: “Ô này chờ số.”
Score 10 với `> 10` → Not yet. Bố: “10 có lớn hơn 10 không?”

## Check
1. `3 > 8` → ?
2. `6 = 6` → ?
3. Muốn “10 điểm trở lên” thì dùng gì? (`> 9`)

## Homework
- [ ] So chiều cao 3 người trong nhà, viết bằng dấu > <.

## Pass
Đổi 10 thành 3, con giải thích vì sao output đổi.

## Next
L23 AND — hai điều cùng đúng.

---

# L23 — AND

## Objective
Con dùng `and`: chỉ true khi **cả hai** điều đều true.

## Parent prep
Cửa phòng + đèn. Hai thẻ: “CỬA MỞ” · “ĐÈN SÁNG”. Project có mèo + sprite tường đỏ.

## Story
**Bố nói:** “Muốn vào phòng đọc sách, con cần cửa mở **và** đèn sáng. Thiếu một cái là không vào được. Đó là **AND**.”

## Ask
- Cửa mở, đèn tắt — vào được không?
- Cửa đóng, đèn sáng?
- Lúc nào mới vào được?

## Unplugged
Bố bật/tắt đèn, mở/đóng cửa theo 4 kiểu. **Con** nói “VÀO” hoặc “KHÔNG”.
Con điền bảng 4 dòng trên giấy:

```
cửa mở | đèn sáng | vào?
  có   |   có     |  CÓ
  có   |  không   | KHÔNG
 không |   có     | KHÔNG
 không |  không   | KHÔNG
```

## Explain
`A and B` = true chỉ khi A true **và** B true.
3 trường hợp còn lại đều false.
AND làm luật **khó** hơn.

## Build
1. Mèo đi bằng mũi tên (L12).
2. Forever: `if <touching red?> and <key space pressed?> then turn 180`.
3. Thử: chạm đỏ không bấm space → đi xuyên. Chạm + space → quay.

```scratch
when green flag clicked
forever
  if <<touching color [red]?> and <key [space] pressed?>> then
    turn right (180) degrees
    move (20) steps
  end
end
```

## Practice
Đổi thành: `score > 5 and lives > 0` → say “Keep playing”. Test 4 trường hợp trong bảng.

## Challenge
Mở “cửa bí mật”: chỉ khi giữ phím A **và** phím B cùng lúc, mèo say “Open!”.

## Mistakes
Dùng AND chỉ với 1 điều (một ô trống). Bố: “AND cần hai câu hỏi.”
Test 1 trường hợp rồi kết luận. Bố: “Bảng có mấy dòng? Test đủ chưa?”

## Check
1. AND true khi nào?
2. Bảng AND có mấy dòng true?
3. Ví dụ AND trong đời: …

## Homework
- [ ] Tìm 2 luật “và” trong nhà (ví dụ: làm xong bài **và** dọn đồ mới được xem TV).

## Pass
Hành động chỉ xảy ra khi **cả hai** điều đúng, con test đủ 4 dòng.

## Next
L24 OR — chỉ cần một điều đúng.

---

# L24 — OR

## Objective
Con dùng `or`: true khi **ít nhất một** điều true.

## Parent prep
Hai món ăn vặt (bánh, trái cây). Thẻ “CÓ BÁNH” · “CÓ TRÁI CÂY”. Project có mèo, vùng đỏ, vùng xanh dương.

## Story
**Bố nói:** “Con đói. Có bánh **hoặc** có trái cây là con vui rồi. Không cần cả hai. Đó là **OR**.”

## Ask
- Có bánh, không trái cây — vui không?
- Không có gì — vui không?
- OR dễ hơn hay khó hơn AND?

## Unplugged
Bố giấu bánh / trái cây theo 4 kiểu. **Con** nói “VUI” hoặc “BUỒN”.
Con điền bảng OR 4 dòng, so với bảng AND hôm qua. Đếm số dòng true.

## Explain
`A or B` = true khi A true, hoặc B true, hoặc cả hai.
Chỉ false khi **cả hai** false.
OR làm luật **dễ** hơn.

## Build
1. Mèo đi bằng mũi tên.
2. Forever: `if <touching red?> or <touching blue?> then say You lose! → stop all`.
3. Test 3 lần: chạm đỏ, chạm xanh, không chạm.

```scratch
when green flag clicked
go to x: (-200) y: (0)
forever
  if <<touching color [red]?> or <touching color [blue]?>> then
    say [You lose!] for (1) seconds
    stop [all]
  end
end
```

## Practice
Thêm phím thoát: `key q pressed? or key escape pressed?` → stop.

## Challenge
Kết hợp: thắng khi chạm táo **or** chạm sao, nhưng chỉ khi `score > 3` (and).

## Mistakes
Nhầm AND với OR — game quá khó / quá dễ. Bố: “Luật nói ‘và’ hay ‘hoặc’?”
Test thiếu trường hợp không chạm. Bố: “Có test lúc an toàn chưa?”

## Check
1. OR false khi nào?
2. Bảng OR có mấy dòng true?
3. Đổi or thành and thì game thế nào?

## Homework
- [ ] Viết 1 luật “hoặc” và 1 luật “và” cho gia đình, đọc cho mẹ đoán.

## Pass
Con test 3 trường hợp: chạm đỏ, chạm xanh, không chạm — đều đúng.

## Next
L25 NOT — đảo ngược câu trả lời.

---

# L25 — NOT

## Objective
Con dùng `not`: đảo true thành false và ngược lại.

## Parent prep
Thẻ TRUE/FALSE. Một tờ giấy ghi “KHÔNG” để lật ngược thẻ. Project có mèo + tường.

## Story
**Bố nói:** “Có trò chơi ‘nói ngược’: bố nói ‘đứng’, con ngồi. Bố nói ‘cười’, con nghiêm. **NOT** là nút nói ngược của máy tính.”

## Ask
- Not true là gì?
- “Không mưa” — khi nào đúng?
- Not not true là gì? (đố vui)

## Unplugged
Chơi “nói ngược” 1 phút: bố ra lệnh, con làm ngược.
Bố giơ thẻ TRUE, con đặt tờ “KHÔNG” lên → con lật thành FALSE.
Bố đọc: “Không chạm tường” — mèo đi hay dừng?

## Explain
`not <A>` = ngược của A.
Dùng khi muốn làm việc lúc **không** có gì xảy ra.
“Nếu KHÔNG chạm tường thì đi” = mèo đi tới khi chạm.

## Build
1. Sprite tường đỏ bên phải.
2. Forever: `if not <touching Wall?> then move 3`.
3. Mèo đi tới tường rồi tự dừng.

```scratch
when green flag clicked
go to x: (-200) y: (0)
forever
  if <not <touching (Wall)?>> then
    move (3) steps
  end
end
```

## Practice
Dùng `repeat until <touching Wall?>` thay forever + not. So sánh: hai cách cùng kết quả.

## Challenge
Mèo chỉ đi khi **không** bấm space (space = phanh).

## Mistakes
Quên not — mèo chỉ đi khi đang chạm (không bao giờ). Bố: “Đọc to câu hỏi.”
Lồng not hai lần — rối. Bố: “Not not = không đổi.”

## Check
1. Not false = ?
2. Giải thích một câu: “not touching wall” nghĩa là gì?
3. Khi nào dùng not?

## Homework
- [ ] Nói 3 câu có “không” trong ngày (nếu không mưa thì đi chơi…).

## Pass
Mèo dừng đúng ở tường nhờ `not`, con giải thích 1 câu.

## Next
L26 Nested IF — if trong if, hai cửa liên tiếp.

---

# L26 — Nested IF

## Objective
Con đặt if **trong** if: phải qua cửa 1 mới tới cửa 2.

## Parent prep
Hai “cửa” bằng ghế trong phòng. Thẻ: “SCORE > 10?” và “LIVES > 0?”. Project có biến score, lives.

## Story
**Bố nói:** “Vào lâu đài có hai cửa. Cửa 1 hỏi: ‘Đủ điểm chưa?’ Qua rồi mới tới cửa 2: ‘Còn mạng không?’ Qua cả hai mới thắng.”

## Ask
- Không qua cửa 1 thì có gặp cửa 2 không?
- Nested IF giống AND ở điểm nào?
- Khi nào cần cửa 2 nói câu khác cửa 1?

## Unplugged
**Con** đi qua ghế 1: bố hỏi “Score bao nhiêu?” — con rút thẻ số. > 10 mới qua.
Ghế 2: “Lives?” — > 0 mới thắng.
Chơi 3 lượt: score thấp; score cao lives 0; cả hai ok. Mỗi lượt con nói dừng ở cửa nào.

## Explain
If lồng = if nằm trong ngăn “then” của if khác.
Cửa ngoài sai → không bao giờ hỏi cửa trong.
Mỗi cửa có thể có else riêng để nói lý do.

## Build
1. `set score to 15`, `set lives to 0`.
2. If score > 10: (if lives > 0: say Win! else say No lives) else say Need more points.

```scratch
when green flag clicked
set [score] to (15)
set [lives] to (0)
if <(score) > (10)> then
  if <(lives) > (0)> then
    say [Win!]
  else
    say [No lives left]
  end
else
  say [Need more points]
end
```

## Practice
Test 3 bộ số: (5, 3) · (15, 0) · (15, 2). Con đoán câu nói trước khi bấm cờ.

## Challenge
Viết lại bằng `and`. Hỏi: cách nào nói được **lý do** thua? (nested)

## Mistakes
If trong đặt sai ngăn (else thay vì then). Bố: “Qua cửa 1 rồi mới tới cửa 2 — ngăn nào?”
Thụt lề rối. Bố: “Nhìn màu khối: if nào ôm if nào?”

## Check
1. Cửa ngoài sai thì cửa trong có chạy không?
2. Kết quả với score 15, lives 0?
3. Nested IF hơn AND ở chỗ nào?

## Homework
- [ ] Vẽ sơ đồ 2 cửa cho một luật trong nhà (ví dụ: xong bài? → dọn phòng? → chơi).

## Pass
3 test đúng: score thấp; score cao lives 0; cả hai ok.

## Next
L27 Timer — đồng hồ đếm giờ trong game.

---

# L27 — Timer

Project: 10-second Game

## Objective
Con dùng `timer` và `reset timer`: game dừng sau 10 giây.

## Parent prep
Đồng hồ bấm giờ điện thoại. Project có mèo đi bằng mũi tên. Bật hiển thị `timer` trên Stage (tick ô cạnh khối).

## Story
**Bố nói:** “Mỗi trò chơi đều có đồng hồ: bóng đá 90 phút, đố vui 10 giây. Scratch có sẵn một đồng hồ chạy mãi — tên là **timer**. Mình chỉ cần bấm nút về 0 lúc bắt đầu.”

## Ask
- Đồng hồ trong game bóng đá bắt đầu từ mấy?
- Khi nào cần đưa đồng hồ về 0?
- 10 giây trôi qua thì game nên làm gì?

## Unplugged
**Con** bấm đồng hồ điện thoại, nhảy lò cò. Bố hô “10 giây — dừng!”.
Hỏi: “Nếu không bấm reset, lần 2 đồng hồ bắt đầu từ đâu?”
Con thử: lần 2 không reset — thấy số cũ chạy tiếp.

## Explain
`timer` = số giây từ lúc reset.
`reset timer` = đưa về 0. Đặt ngay khi bấm cờ.
`timer > 10` là boolean → dùng trong if.

## Build
1. `when green flag clicked` → `reset timer`.
2. Forever: `if timer > 10 then say Time's up! → stop all`.
3. Script khác: mũi tên di chuyển mèo.

```scratch
when green flag clicked
reset timer
forever
  if <(timer) > (10)> then
    say [Time's up!] for (1) seconds
    stop [all]
  end
end
```

## Practice
Con bấm cờ và đồng hồ điện thoại cùng lúc. So: dừng đúng ~10 giây?
Đổi 10 thành 5, 20.

## Challenge
Hiện thời gian còn lại: `say (10 - timer)` (làm tròn: `round`).

## Mistakes
Quên reset — lần 2 game dừng ngay. Bố: “Đồng hồ bắt đầu từ đâu?”
Reset trong forever — không bao giờ hết giờ. Bố: “Reset mấy lần?”

## Check
1. `timer` đếm gì?
2. Vì sao reset lúc cờ xanh?
3. Muốn game 30 giây đổi số nào?

## Homework
- [ ] Đo bằng đồng hồ: con nhảy dây được bao nhiêu cái trong 10 giây.

## Pass
Game dừng đúng khoảng 10 giây, bấm cờ lại vẫn đúng.

## Next
L28 Score — điểm số tăng khi bắt táo.

---

# L28 — Score

Project: Catch Apple (mầm)

## Objective
Con dùng biến `score`: chạm táo +1 điểm, táo nhảy chỗ khác.

## Parent prep
Project: mèo (mũi tên) + sprite Apple. Rổ + 5 quả bóng giấy. Biến `score` hiện trên Stage.

## Story
**Bố nói:** “Game nào cũng cần bảng điểm. Bảng điểm là một **cái hộp có tên** — hộp `score`. Bắt được táo thì bỏ thêm 1 vào hộp.”

## Ask
- Bắt đầu game, điểm nên là mấy?
- Bắt 1 táo thì điểm đổi thế nào?
- Táo ở yên một chỗ thì có vui không?

## Unplugged
**Con** ném bóng giấy vào rổ. Mỗi lần trúng, bố đổi tờ giấy trong hộp “SCORE”: 0 → 1 → 2.
Hỏi: “Bố có viết lại tên hộp không?” (Không, chỉ đổi số bên trong.)
Bắt đầu ván 2: bố quên đưa về 0 — con bắt lỗi.

## Explain
Variable `score` = hộp có tên, chứa một số.
`set score to 0` = đổ hộp, bỏ số 0.
`change score by 1` = lấy số cũ cộng 1 cất lại.

## Build
1. Make a Variable `score`.
2. Mèo: cờ → `set score to 0`.
3. Táo: forever → `if touching Cat? then change score by 1 → go to random position`.

```scratch
when green flag clicked
set [score] to (0)
go to (random position)
forever
  if <touching (Cat)?> then
    change [score] by (1)
    play sound (pop)
    go to (random position)
  end
end
```

## Practice
Chơi 30 giây (dùng timer L27). Con ghi điểm 3 lượt lên giấy.

## Challenge
Mỗi táo +2 điểm. Thêm táo vàng hiếm +5.

## Mistakes
Không set 0 — điểm cộng tiếp ván trước. Bố: “Ván mới hộp phải có gì?”
Táo không nhảy đi — điểm tăng liên tục. Bố: “Chạm xong táo nên ở đâu?”

## Check
1. Variable là gì?
2. `set` khác `change` thế nào?
3. Chạm 3 táo điểm là mấy?

## Homework
- [ ] Đếm số lần con đánh răng trong tuần bằng “hộp điểm” dán tủ lạnh.

## Pass
Score tăng khi chạm táo, không tăng khi không chạm, về 0 khi bấm cờ.

## Next
L29 Lives — số mạng, hết mạng thì thua.

---

# L29 — Lives

## Objective
Con dùng biến `lives = 3`: chạm đỏ mất 1 mạng, `lives = 0` → thua.

## Parent prep
3 trái tim giấy. Project Catch Apple L28 + sprite chướng ngại đỏ (Rock) rơi từ trên xuống.

## Story
**Bố nói:** “Siêu Mario có mấy mạng? Mỗi lần trúng quái là mất một. Hết mạng là Game Over. Hôm nay mèo cũng có 3 trái tim.”

## Ask
- Bắt đầu có mấy mạng?
- Mất mạng thì số đổi thế nào? (+1 hay -1)
- Khi nào thua?

## Unplugged
Con giữ 3 trái tim. Bố ném bóng giấy “quái”. Trúng → con đưa bố 1 tim, nói số còn lại.
Hết tim → con hô “GAME OVER”.
Hỏi: “Trúng một quả mà mất 2 tim có công bằng không?” (lỗi chạm nhiều lần)

## Explain
`set lives to 3` lúc bắt đầu.
`change lives by -1` khi chạm đỏ.
`if lives = 0 then stop all`.
Chạm xong phải dời vật đỏ đi, nếu không mất mạng liên tục.

## Build
1. Biến `lives`. Mèo: cờ → `set lives to 3`.
2. Rock: forever rơi xuống (`change y by -5`), tới đáy thì lên lại ở x random.
3. Rock: `if touching Cat? then change lives by -1 → go to x: random y: 180`.
4. Mèo: forever → `if lives = 0 then say Game over → stop all`.

```scratch
when green flag clicked
go to x: (pick random (-200) to (200)) y: (180)
forever
  change y by (-5)
  if <(y position) < (-170)> then
    go to x: (pick random (-200) to (200)) y: (180)
  end
  if <touching (Cat)?> then
    change [lives] by (-1)
    go to x: (pick random (-200) to (200)) y: (180)
  end
end
```

## Practice
Chơi đến chết đúng 3 lần chạm. Con đếm to từng lần.

## Challenge
Hiện trái tim: costume Heart đổi theo lives (3, 2, 1).

## Mistakes
Mất cả 3 mạng một lần chạm. Bố: “Chạm xong Rock ở đâu?”
`change lives by 1` — mạng tăng. Bố: “Mất mạng là cộng hay trừ?”

## Check
1. Lives bắt đầu bằng mấy?
2. Dòng nào làm mất mạng?
3. Vì sao Rock phải nhảy lên sau khi chạm?

## Homework
- [ ] Chơi game cho em / mẹ, ghi mỗi người chết sau bao nhiêu giây.

## Pass
Chết đúng sau 3 lần chạm.

## Next
L30 Game State — START, PLAYING, GAME OVER.

---

# L30 — Game State

## Objective
Con dùng biến `state` để game biết đang ở giai đoạn nào: START / PLAYING / GAME OVER.

## Parent prep
3 tờ giấy to: START · PLAYING · GAME OVER, dán thành vòng tròn có mũi tên. Project L29.

## Story
**Bố nói:** “Trận bóng có lúc chưa bắt đầu, lúc đang đá, lúc kết thúc. Cầu thủ chỉ chạy lúc đang đá. Game cũng vậy — ta ghi giai đoạn vào hộp tên `state`.”

## Ask
- Lúc Game Over, bấm phím mèo có nên đi không?
- Từ START sang PLAYING khi nào?
- Từ PLAYING sang GAME OVER khi nào?

## Unplugged
**Con** đứng trên tờ START. Bố hô “Bắt đầu!” → con nhảy sang PLAYING, được chạy tại chỗ.
Bố hô “Hết mạng!” → con nhảy sang GAME OVER, đứng im dù bố bảo chạy.
Con vẽ sơ đồ 3 ô + mũi tên + chữ trên mũi tên (cờ, lives = 0).

## Explain
`state` = biến chứa chữ: START, PLAYING, GAME OVER.
Mỗi việc kiểm tra state trước khi làm: `if state = PLAYING then move`.
Đổi state ở **đúng một chỗ** cho mỗi mũi tên.

## Build
1. Biến `state`. Cờ → `set state to START` → `say Press space` → `wait until key space pressed` → `set state to PLAYING`.
2. Di chuyển: `if state = PLAYING and key right pressed then move 10`.
3. Khi `lives = 0`: `set state to GAME OVER` → `say Game over`.

```scratch
when green flag clicked
set [state] to [START]
say [Press space to start]
wait until <key [space] pressed?>
say []
set [state] to [PLAYING]
forever
  if <<(state) = [PLAYING]> and <key [right arrow] pressed?>> then
    move (10) steps
  end
  if <(lives) = (0)> then
    set [state] to [GAME OVER]
    say [Game over]
  end
end
```

## Practice
Thua xong bấm mũi tên: mèo không đi. Con giải thích vì sao.
Rock cũng chỉ rơi khi `state = PLAYING`.

## Challenge
Thêm state WIN: score ≥ 10 → WIN, mọi thứ dừng.

## Mistakes
Gõ “playing” thường vs “PLAYING” hoa — so sánh có thể sai ý. Bố: “Viết giống hệt một kiểu.”
Đổi state ở nhiều chỗ, game nhảy loạn. Bố: “Mũi tên này nằm ở script nào?”

## Check
1. Game có mấy state?
2. Sau Game Over, phím có làm mèo đi không? Vì sao?
3. Chỉ dòng đổi state sang PLAYING.

## Homework
- [ ] Vẽ sơ đồ state của máy giặt hoặc đèn giao thông.

## Pass
Sau khi thua, phím không làm mèo đi. Con vẽ được sơ đồ 3 state.

## Next
L31 Broadcast — các sprite nhắn tin cho nhau.

---

# L31 — Broadcast

## Objective
Con dùng `broadcast` và `when I receive`: một sprite báo tin, sprite khác phản ứng.

## Parent prep
Một cái loa / còi. Project L30 có 3 sprite: Cat, Apple, Rock.

## Story
**Bố nói:** “Trong lớp, cô giáo nói qua loa: ‘Ra chơi!’ Cả lớp cùng nghe và cùng đứng dậy. Cô không đi từng bàn. Scratch có loa đó — tên là **broadcast**.”

## Ask
- Cô giáo nói 1 lần, bao nhiêu bạn nghe?
- Mỗi bạn có thể làm việc khác nhau khi nghe không?
- Không ai nghe thì sao?

## Unplugged
Bố là loa: thổi còi + hô “GAME_OVER”. **Con** và **gấu bông** (con điều khiển) đều phản ứng: con ngồi xuống, gấu nằm.
Đổi tin “START”: con đứng dậy.
Con nói: “Một tin — nhiều người — mỗi người làm việc của mình.”

## Explain
`broadcast GAME_OVER` = phát tin.
`when I receive GAME_OVER` = khối mũ, chờ tin đó.
Sprite gửi không cần biết ai nghe.

## Build
1. Mèo: khi lives = 0 → `broadcast GAME_OVER`.
2. Apple: `when I receive GAME_OVER` → `hide`.
3. Rock: `when I receive GAME_OVER` → `hide` → `stop this script`.
4. Stage: `when I receive GAME_OVER` → đổi backdrop “Game Over”.

```scratch
// Cat
if <(lives) = (0)> then
  broadcast [GAME_OVER]
end

// Apple
when I receive [GAME_OVER]
hide
```

## Practice
Thêm tin `START`: cờ → mèo broadcast START → Apple, Rock `show` và bắt đầu chạy.

## Challenge
Tin `LEVEL_UP` khi score = 5: Rock rơi nhanh hơn.

## Mistakes
Gõ sai tên tin (GAMEOVER vs GAME_OVER) — không ai nghe. Bố: “Chọn từ danh sách, đừng gõ lại.”
Quên `show` khi bắt đầu — sprite ẩn mãi. Bố: “Ván mới ai làm cho táo hiện lại?”

## Check
1. Broadcast giống gì ở trường?
2. Bao nhiêu sprite nghe được một tin?
3. Chỉ khối mũ nhận tin.

## Homework
- [ ] Nghĩ 3 “tin” trong nhà (CƠM_XONG, ĐI_NGỦ…) và ai làm gì khi nghe.

## Pass
2 sprite cùng phản ứng với 1 tin.

## Next
L32 Logic Challenge — con tự thiết kế game Dodge.

---

# L32 — Logic Challenge

Project: Dodge the Falling Objects

## Objective
Con tự thiết kế và làm game né vật rơi. Bố **không** đưa code mẫu, chỉ hỏi 8 câu. Checkpoint Level 2.

## Parent prep
Spec dán tường (bố viết sẵn): vật rơi · né bằng mũi tên · score tăng mỗi vật né được · lives 3 · hết 30 giây hoặc lives 0 là hết. Giấy vẽ state. Coding Passport mở.

## Story
**Bố nói:** “Hôm nay con là kỹ sư. Bố là khách hàng. Đây là yêu cầu của khách. Bố sẽ không chỉ cách làm — con dùng mọi thứ đã học: event, loop, if, and, or, not, score, lives, timer, state, broadcast.”

## Ask
- Problem là gì? (một câu)
- Game cần những sprite nào?
- Có mấy state?

## Spec [5]
Con đọc to spec, tick từng dòng hiểu chưa.
Con vẽ sơ đồ state: START → PLAYING → GAME OVER.
Con viết danh sách biến: score, lives, state.

## Build [24]
Con tự làm. Bố chỉ hỏi khi con kẹt:
- “Algorithm là những bước nào?”
- “Khối nào cho việc đó?”
- “Test bằng trường hợp nào?”
Gợi ý thứ tự (chỉ nói nếu kẹt > 5 phút): mèo di chuyển → 1 vật rơi → chạm mất mạng → score → timer → state.

## Test [8]
Con test 3 trường hợp: né hết 30 giây · chết 3 lần · thắng/thua rồi bấm cờ lại.
Ghi bug lên giấy, sửa 1 bug.

## Mistakes
Bố muốn sửa hộ. Bố: tự nhắc “Hỏi, không làm.”
Con làm quá nhiều tính năng. Bố: “Spec có yêu cầu cái đó không?”

## Check
1. Chỉ chỗ dùng AND hoặc OR trong game.
2. Vẽ lại state của game.
3. Nếu vật rơi nhanh gấp đôi thì sửa dòng nào?

## Homework
- [ ] Cho 2 người chơi thử, hỏi họ 1 điều muốn cải thiện.

## Pass
Game chạy đúng luật trong spec, con vẽ được state. Làm không mẫu → tick **Problem Solver** (có thể tick sau ở L72 nếu chưa đạt).

## Next
L33 Variable — Level 3 Data & State: hộp có tên.
