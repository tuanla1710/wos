# L5 — Game Engineering

Bố **không viết code**. Chỉ 8 câu + spec trên giấy.
Mỗi game = 2 buổi: thứ 7 design (spec, state, algorithm, bắt đầu code) + chủ nhật ship (code xong, test, demo).
Badge Problem Solver: một game không mẫu.

Spec dán tường mỗi game. Con tick. Thiếu luật = chưa Pass.

---

# L61 — Catch Apple (design)

Project: Catch Apple

## Objective
Con viết spec và vẽ sơ đồ cho game Catch Apple, rồi làm phần di chuyển. Chưa cần xong game.

## Parent prep
Giấy A3 + bút màu. Spec trống 6 dòng dán tường. Project Scratch mới tên `CatchApple`. Không mở project cũ L28.

## Story
**Bố nói:** “Từ hôm nay con là kỹ sư game. Kỹ sư không bắt đầu bằng code — họ bắt đầu bằng **bản vẽ**. Bố là khách hàng, con là người xây.”

## Ask
- Người chơi làm gì trong game?
- Khi nào thắng, khi nào thua?
- Game cần những sprite nào?

## Spec [6]
Con viết 6 luật bắt buộc (bố đọc gợi ý nếu con quên):
1. Rổ di chuyển trái/phải bằng mũi tên.
2. Táo rơi từ chỗ random.
3. Rổ chạm táo → +1 điểm.
4. Táo chạm đất → táo mới.
5. Đồng hồ 30 giây.
6. Hết giờ → Game Over, hiện điểm.

## Design [15]
Con vẽ trên A3:
- **State:** START → PLAYING → GAME OVER (mũi tên ghi lý do).
- **Sprites:** Basket, Apple, Stage.
- **Biến:** score, state.
- **Algorithm táo:**

```
1. Lên đỉnh, x random
2. Lặp: rơi xuống 5
3. Nếu chạm rổ: score + 1, về bước 1
4. Nếu chạm đất: về bước 1
```

## Build [16]
Con code phần dễ trước:
- Basket đi trái/phải.
- Apple rơi từ x random.
Bố chỉ hỏi: “Dòng nào trên giấy là khối này?”

## Mistakes
Con nhảy vào code trước khi vẽ. Bố: “Bản vẽ đâu?”
Spec thiếu luật thua. Bố: “Khi nào game dừng?”

## Check
1. Game có mấy state?
2. Chỉ algorithm táo trên giấy.
3. Mai con code phần nào trước?

## Homework
- [ ] Đọc lại spec cho mẹ nghe, hỏi mẹ có luật nào khó hiểu.

## Pass
Spec 6 luật + sơ đồ state + rổ di chuyển được.

## Next
L62 Catch Apple (ship) — code xong, test, demo.

---

# L62 — Catch Apple (ship)

Project: Catch Apple

## Objective
Con code xong 6 luật, test 3 lần chơi, demo cho bố.

## Parent prep
Spec + bản vẽ hôm qua dán tường. Đồng hồ bấm giờ. Bút đỏ tick spec.

## Ask
- Hôm qua xong những luật nào?
- Còn luật nào?
- Test thế nào để biết đồng hồ đúng 30 giây?

## Build [24]
Con code theo thứ tự spec: va chạm + score → táo chạm đất → timer → state + Game Over.
Mỗi luật xong → tick đỏ trên spec.
Bố hỏi khi kẹt: “Algorithm bước này là gì?” “Test bằng gì?”

## Test [10]
3 lần chơi:
1. Bắt nhiều táo nhất có thể.
2. Không bắt quả nào — điểm phải là 0.
3. Đo 30 giây bằng đồng hồ.
Ghi bug lên giấy, sửa ít nhất 1.

## Demo [6]
Con chơi cho bố xem và nói: “Luật 1… luật 6.” Chỉ code từng luật.

## Mistakes
Điểm tăng liên tục khi táo đứng trong rổ. Bố: “Chạm xong táo đi đâu?”
Không reset timer. Bố: “Ván 2 đồng hồ bắt đầu từ đâu?”

## Check
1. Spec tick đủ 6 dòng chưa?
2. Bug nào con tìm được?
3. Nếu muốn khó hơn, đổi số nào?

## Homework
- [ ] Cho 2 người chơi, ghi điểm và 1 lời góp ý.

## Pass
Chơi được 30 giây, điểm tăng khi bắt, hết giờ dừng.

## Next
L63 Maze (design) — mê cung.

---

# L63 — Maze (design)

Project: Maze

## Objective
Con thiết kế game mê cung: tường, mạng, đồng hồ, gem, đích.

## Parent prep
Giấy kẻ ô vẽ mê cung. Spec trống. Project mới `Maze`.

## Story
**Bố nói:** “Mê cung có tường. Đụng tường là đau — mất một mạng. Phải lấy viên ngọc rồi mới ra được cửa.”

## Ask
- Làm sao máy biết đụng tường? (màu tường)
- Có cần lấy gem trước khi tới đích không?
- Bắt đầu mấy mạng?

## Spec [6]
1. Nhân vật đi 4 hướng bằng mũi tên.
2. Đụng tường (màu xanh đen) → mất 1 mạng, về chỗ xuất phát.
3. Lives 3, hết → thua.
4. Lấy gem → biến `hasGem = yes`.
5. Tới cửa khi đã có gem → thắng.
6. Timer 60 giây.

## Design [15]
- Vẽ mê cung trên giấy ô (bản vẽ backdrop).
- State: START → PLAYING → WIN / LOSE.
- Biến: lives, hasGem, state.
- Algorithm đi: mũi tên → move 3; nếu chạm tường → về start, lives − 1.

## Build [16]
Con vẽ backdrop mê cung (Paint, tường 1 màu). Sprite nhân vật nhỏ. Code 4 hướng đi.

## Mistakes
Tường nhiều màu — chạm màu không bắt. Bố: “Tường một màu thôi.”
Nhân vật to hơn hành lang. Bố: “Thu nhỏ sprite (size 30%).”

## Check
1. Thắng cần mấy điều? (and)
2. Chỉ state WIN và LOSE.
3. Đi xuyên tường có trong spec không?

## Homework
- [ ] Vẽ thêm 1 mê cung khó hơn trên giấy ô.

## Pass
Spec + mê cung vẽ xong + nhân vật đi 4 hướng.

## Next
L64 Maze (ship).

---

# L64 — Maze (ship)

Project: Maze

## Objective
Con code xong mê cung: tường, mạng, gem, đích, timer.

## Parent prep
Spec + bản vẽ. Đồng hồ. Bút đỏ.

## Ask
- Luật nào xong rồi?
- Thắng cần những gì?
- Test đụng tường thế nào?

## Build [24]
Va chạm tường → mất mạng → về start. Gem → hasGem. Cửa + gem → WIN. Timer → LOSE.
Tick từng dòng spec.

## Test [10]
1. Đụng tường 3 lần → thua.
2. Tới cửa **không** gem → chưa thắng.
3. Lấy gem rồi tới cửa → thắng.

## Demo [6]
Con chơi một ván thắng, chỉ code luật “and”.

## Mistakes
Mất cả 3 mạng một lần đụng. Bố: “Đụng xong nhân vật ở đâu?”
Thắng dù không có gem. Bố: “Đọc lại luật 5.”

## Check
1. Luật thắng dùng AND hay OR?
2. Bug khó nhất hôm nay?
3. Thêm cửa khóa thứ 2 cần biến gì?

## Homework
- [ ] Cho người nhà chơi, đo ai ra nhanh nhất.

## Pass
Thắng được 1 lần, đụng tường mất mạng, không gem không thắng.

## Next
L65 Snake (design).

---

# L65 — Snake (design)

Project: Snake

## Objective
Con thiết kế rắn săn mồi: rắn đi liên tục, ăn mồi dài ra (hoặc tăng điểm), cắn tường là thua.

## Parent prep
Giấy ô 10×10. Đồng xu làm mồi. Project mới `Snake`.

## Story
**Bố nói:** “Rắn luôn bò, không dừng. Con chỉ đổi hướng. Ăn mồi thì dài ra. Đụng tường là hết. Game cổ điển trên điện thoại ngày xưa của bố.”

## Ask
- Rắn đi tự động hay bấm mới đi?
- Làm sao để rắn “dài ra”?
- Thua khi nào?

## Spec [6]
1. Đầu rắn đi liên tục theo hướng hiện tại.
2. Mũi tên đổi hướng.
3. Mồi ở chỗ random.
4. Ăn mồi → score + 1, mồi chỗ mới.
5. Dài ra: thân là chuỗi stamp/clone theo sau (hoặc “rắn 3 khúc” nếu khó).
6. Chạm cạnh Stage → Game Over.

## Design [15]
- Trên giấy ô: đầu rắn đi 5 bước, vẽ thân theo sau.
- Biến: score, length, state.
- Cách làm thân đơn giản: mỗi bước `create clone of myself`, clone tự xóa sau `length × 0.1` giây.

## Build [16]
Con code đầu rắn đi liên tục + đổi hướng bằng mũi tên. Mồi random.

## Mistakes
Rắn đi lùi được (quay 180 ngay) → tự cắn. Bố: “Đang đi phải bấm trái thì sao?”
Clone quá nhiều → Scratch chậm. Bố: “Clone có tự xóa không?”

## Check
1. Thân rắn làm bằng cách nào?
2. Biến length dùng để làm gì?
3. Luật thua?

## Homework
- [ ] Chơi Snake trên giấy ô với bố (bố vẽ mồi, con vẽ rắn).

## Pass
Spec + rắn đi liên tục, đổi hướng, mồi random.

## Next
L66 Snake (ship).

---

# L66 — Snake (ship)

Project: Snake

## Objective
Con hoàn thành Snake: ăn mồi dài ra / tăng điểm, chạm tường thua.

## Parent prep
Spec + bản vẽ. Nếu clone khó: cho phép “rắn 3 khúc” — 3 sprite đi theo nhau (bố hỏi, không làm hộ).

## Ask
- Còn luật nào chưa tick?
- Thân rắn đã chạy chưa?
- Test thua thế nào?

## Build [24]
Ăn mồi → score + length. Thân theo sau. Chạm cạnh → Game Over (state).

```scratch
when I start as a clone
wait ((length) * (0.1)) seconds
delete this clone
```

## Test [10]
1. Ăn 3 mồi → score 3, rắn dài hơn.
2. Đâm tường → thua.
3. Bấm cờ lại → reset.

## Demo [6]
Con chơi và giải thích thân rắn chạy thế nào.

## Mistakes
Rắn không dài ra. Bố: “Length có tăng không? Clone sống bao lâu?”
Mồi xuất hiện ngoài Stage. Bố: “Random từ bao nhiêu đến bao nhiêu?”

## Check
1. Tăng length làm rắn dài ra vì sao?
2. Bug khó nhất?
3. Thêm luật cắn thân thua: cần kiểm tra gì?

## Homework
- [ ] Ghi kỷ lục điểm của cả nhà lên giấy.

## Pass
Ăn → dài hơn hoặc điểm tăng, và thua được.

## Next
L67 Flappy Bird (design).

---

# L67 — Flappy Bird (design)

Project: Flappy

## Objective
Con thiết kế Flappy: trọng lực kéo chim xuống, space đẩy lên, ống chạy ngang.

## Parent prep
Quả bóng nhỏ để thả (minh họa trọng lực). Giấy. Project `Flappy`.

## Story
**Bố nói:** “Thả bóng, nó rơi càng lúc càng nhanh — đó là trọng lực. Chim Flappy cũng bị kéo xuống. Con vỗ cánh (space) để bay lên một chút.”

## Ask
- Không bấm gì chim đi đâu?
- Ống di chuyển hay chim di chuyển ngang?
- Thua khi nào?

## Spec [6]
1. Chim rơi xuống liên tục (gravity).
2. Space → chim nhảy lên.
3. Ống đi từ phải sang trái, khe hở ở độ cao random.
4. Qua 1 ống → score + 1.
5. Chạm ống hoặc đáy → Game Over.
6. Bấm cờ → reset.

## Design [15]
- Biến `speedY`: mỗi frame `change speedY by -1`, `change y by speedY`.
- Space: `set speedY to 10`.
- Ống: x từ 240 → -240, rồi về 240 với y random.
- Vẽ biểu đồ y của chim theo thời gian (đường nhấp nhô).

## Build [16]
Con code chim: gravity + space. Thử cho tới khi “cảm giác” vừa.

## Mistakes
`change y by -5` cố định — không giống rơi thật. Bố: “Bóng rơi đều hay nhanh dần?”
Space giữ liên tục → bay mãi. Bố: “Nhấn một lần hay giữ?”

## Check
1. speedY làm gì?
2. Space đổi biến nào?
3. Ống đi theo hướng nào?

## Homework
- [ ] Thả 3 vật (bóng, giấy, bút) — vật nào rơi nhanh? Ghi lại.

## Pass
Spec + chim rơi và nhảy mượt.

## Next
L68 Flappy Bird (ship).

---

# L68 — Flappy Bird (ship)

Project: Flappy

## Objective
Con hoàn thành Flappy: ống, điểm, va chạm, Game Over.

## Parent prep
Spec + bản vẽ. Bút đỏ.

## Ask
- Chim đã bay ổn chưa?
- Ống tạo thế nào?
- Score tăng lúc nào?

## Build [24]
Ống chạy + y random. Score khi ống đi qua chim (x ống < x chim, đánh dấu đã tính). Chạm ống / đáy → Game Over.

## Test [10]
1. Qua được 1 ống → score 1.
2. Chạm ống → thua.
3. Không bấm gì → rơi đáy → thua.

## Demo [6]
Con chơi, giải thích gravity bằng biến speedY.

## Mistakes
Score tăng liên tục khi ống đi qua. Bố: “Mỗi ống tính mấy lần?”
Khe quá hẹp → không ai qua được. Bố: “Test với người khác.”

## Check
1. Score tính 1 lần mỗi ống bằng cách nào?
2. Thay đổi nào làm game dễ hơn?
3. Bug khó nhất?

## Homework
- [ ] Cho 3 người chơi, ghi ai qua nhiều ống nhất.

## Pass
1 ống qua được, 1 lần chết được.

## Next
L69 Space Shooter (design).

---

# L69 — Space Shooter (design)

Project: Space Shooter

## Objective
Con thiết kế game bắn phi thuyền: tàu, đạn, địch, điểm, mạng, wave.

## Parent prep
Giấy. Súng nước / bóng giấy minh họa đạn. Project `SpaceShooter`.

## Story
**Bố nói:** “Phi thuyền của con bảo vệ Trái Đất. Địch bay xuống. Con bắn. Cứ mỗi 10 điểm, địch bay nhanh hơn — đó là **wave**.”

## Ask
- Đạn là sprite riêng hay clone?
- Địch chạm tàu thì sao?
- Wave làm game khó hơn bằng cách nào?

## Spec [6]
1. Tàu đi trái/phải.
2. Space bắn đạn (clone) bay lên.
3. Địch rơi từ trên, x random.
4. Đạn chạm địch → score + 1, cả hai biến mất.
5. Địch chạm tàu → lives − 1. Lives 0 → thua.
6. Mỗi 10 điểm → địch nhanh hơn.

## Design [15]
- Biến: score, lives, enemySpeed.
- Wave: `if score mod 10 = 0 then change enemySpeed by 1` (chỉ một lần mỗi mốc).
- Vẽ sơ đồ: đạn sinh ra ở tàu → bay lên → chạm địch / ra khỏi màn → xóa.

## Build [16]
Tàu di chuyển + bắn đạn clone.

```scratch
when [space] key pressed
create clone of [Bullet]

when I start as a clone
go to [Ship]
show
repeat until <<touching [edge]?> or <touching [Enemy]?>>
  change y by (10)
end
delete this clone
```

## Mistakes
Đạn gốc bay đi — không còn đạn để clone. Bố: “Sprite gốc nên ẩn.”
Giữ space → 100 đạn. Bố: “Thêm chờ 0.2 giây giữa mỗi phát.”

## Check
1. Clone là gì?
2. Clone đạn khi nào bị xóa?
3. Wave đổi biến nào?

## Homework
- [ ] Vẽ 3 kiểu địch con muốn thêm.

## Pass
Spec + tàu bắn được đạn.

## Next
L70 Space Shooter (ship).

---

# L70 — Space Shooter (ship)

Project: Space Shooter

## Objective
Con hoàn thành Space Shooter: địch, va chạm, điểm, mạng, wave.

## Parent prep
Spec + bản vẽ. Bút đỏ.

## Ask
- Đạn ổn chưa?
- Địch rơi thế nào?
- Wave test ra sao?

## Build [24]
Địch rơi (clone hoặc 1 sprite lặp lại). Đạn chạm địch → điểm. Địch chạm tàu → mất mạng. Wave.

## Test [10]
1. Bắn trúng → điểm tăng.
2. Để địch chạm tàu 3 lần → thua.
3. Đạt 10 điểm → địch nhanh hơn rõ ràng.

## Demo [6]
Con chơi, chỉ code wave.

## Mistakes
Wave tăng tốc liên tục ở 10 điểm. Bố: “Mốc 10 cộng mấy lần?”
Địch không biến mất khi trúng. Bố: “Ai xóa địch?”

## Check
1. Bug khó nhất?
2. Wave chạy đúng 1 lần mỗi mốc vì sao?
3. Thêm boss cần gì?

## Homework
- [ ] Viết 3 câu “hướng dẫn chơi” cho game.

## Pass
Bắn được, chết được, có điểm.

## Next
L71 Final Scratch Game (design) — game của riêng con.

---

# L71 — Final Scratch Game (design)

Project: Final Scratch Game

## Objective
Con chọn ý tưởng game **của riêng mình**, tự viết spec 6 luật và thiết kế. Bố không mở tutorial.

## Parent prep
Thứ 6 tối: con nghĩ trước ý tưởng (bố nhắc). Giấy A3. Project mới.

## Story
**Bố nói:** “Con đã làm 5 game theo đề của bố. Lần này con là người ra đề. Game nào cũng được — miễn có luật rõ ràng.”

## Ask
- Ý tưởng game của con là gì? (một câu)
- Người chơi làm gì?
- Thắng / thua thế nào?

## Spec [6]
Con tự viết 6 luật. Bố chỉ hỏi “luật này test thế nào?” cho từng dòng.
Phải có: điều khiển · mục tiêu · điểm hoặc thời gian · thắng hoặc thua · reset.

## Design [15]
State, sprite, biến, algorithm 2 phần khó nhất trên giấy.

## Build [16]
Con code phần lõi (nhân vật + luật chính).

## Mistakes
Ý tưởng quá lớn (thế giới mở, 10 màn). Bố: “Phiên bản nhỏ nhất chơi được là gì?”
Chép game trên mạng. Bố: “Game của con, không tải.”

## Check
1. Spec 6 luật đủ chưa?
2. Phần khó nhất là gì?
3. Mai cần làm gì để demo được?

## Homework
- [ ] Viết tên game + 3 câu giới thiệu.

## Pass
Spec 6 luật tự viết + lõi chạy được.

## Next
L72 Final Scratch Game (ship) — demo checkpoint Scratch.

---

# L72 — Final Scratch Game (ship)

Project: Final Scratch Game

## Objective
Con hoàn thành game, demo 3 phút và trả lời 8 câu hỏi. Checkpoint Scratch.

## Parent prep
Mời cả nhà xem demo cuối buổi. Coding Passport mở. Spec dán tường.

## Ask
- Luật nào còn thiếu?
- Demo sẽ nói gì trước?
- Phần nào con tự hào nhất?

## Build [22]
Con hoàn thành spec. Tick từng dòng.

## Test [8]
Mỗi luật 1 test. Ghi bug, sửa.

## Demo [10]
Demo 3 phút cho cả nhà. Sau đó trả lời 8 câu:
1. Problem là gì?
2. Con nghĩ cách nào?
3. Vẽ ra được không?
4. Algorithm là những bước nào?
5. Code bước đó thế nào?
6. Test bằng trường hợp nào?
7. Nếu input đổi thì sao?
8. Có cách nào tốt hơn không?

## Mistakes
Thêm tính năng phút chót → hỏng. Bố: “Ship cái chạy được trước.”

## Check
1. Spec đủ 6/6 chưa?
2. Con học được gì từ 6 game?
3. Scratch khó nhất ở đâu? (chuẩn bị sang Python)

## Homework
- [ ] Chia sẻ game lên studio Kid Coding, mời ông bà chơi.

## Pass
Demo + trả lời 8 câu. Không cần đẹp. Game không mẫu → tick **Problem Solver** (nếu chưa tick ở L32).

## Next
L73 Python Hello — Level 6: từ khối sang chữ.
