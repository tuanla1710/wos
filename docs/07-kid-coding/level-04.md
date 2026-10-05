# L4 — Algorithm

Mọi bài: Problem → Think (không code) → Draw → Algorithm trên giấy → Scratch → Test → Improve.

Cổng: “Cùng một problem có nhiều algorithm.” Badge Sorting Master L59, Search Master (Scratch) L52.

---

# L47 — Counting

## Objective
Con viết algorithm **đếm** trên giấy trước, rồi mới làm Scratch. Test với 0, 1, 5 item.

## Parent prep
Rổ táo (hoặc bóng) 5 quả. Giấy A4 chia 4 ô: PROBLEM · DRAW · ALGORITHM · TEST. Project có list `apples`.

## Story
**Bố nói:** “Từ hôm nay con làm như kỹ sư thật: **không mở Scratch ngay**. Nghĩ trước, vẽ trước, viết các bước trước. Code là bước gần cuối.”

## Ask
- Problem là gì? (một câu: đếm số táo trong rổ)
- Con đếm táo thật bằng cách nào?
- Rổ rỗng thì đáp án là mấy?

## Unplugged
**Con** đếm táo thật, mỗi quả chạm và nói “+1”.
Con viết ô ALGORITHM:

```
1. count = 0
2. Với mỗi táo: count = count + 1
3. Nói count
```

Con chạy algorithm với rổ rỗng (0), 1 quả, 5 quả.

## Explain
Algorithm = các bước giải problem, viết **trước** khi code.
Test case = input để thử: luôn có trường hợp rỗng.
Đếm bằng tay ra giống `length of` — nhưng con hiểu bên trong.

## Build
1. `set count to 0`, `set i to 1`.
2. `repeat (length of apples)`: `change count by 1` → `change i by 1`.
3. `say count`.

```scratch
when green flag clicked
set [count] to (0)
repeat (length of [apples])
  change [count] by (1)
end
say (join [Apples: ] (count))
```

## Practice
Test: list rỗng → 0, 1 item → 1, 5 item → 5. Ghi vào ô TEST.

## Challenge
Chỉ đếm táo **đỏ**: list có Red, Green, Red… → if item i = Red thì +1.

## Mistakes
Code trước khi viết algorithm. Bố: “Ô ALGORITHM trống — quay lại giấy.”
Quên test rỗng. Bố: “Rổ không có táo thì sao?”

## Check
1. Bốn bước làm bài từ nay là gì?
2. Ba test case đã thử?
3. Algorithm đếm có mấy bước?

## Homework
- [ ] Viết algorithm đếm số cửa sổ trong nhà, rồi đi đếm thật.

## Pass
3 test đúng (0, 1, 5) và ô ALGORITHM viết trước code.

## Next
L48 Sum — cộng tất cả.

---

# L48 — Sum

## Objective
Con tính tổng một list bằng accumulator, viết algorithm trước.

## Parent prep
Thẻ số 3, 5, 7, 2. Giấy 4 ô. Project list `nums`.

## Story
**Bố nói:** “Đi chợ mua 4 món: 3 nghìn, 5 nghìn, 7 nghìn, 2 nghìn. Hết bao nhiêu? Máy tính làm việc này cho siêu thị mỗi giây.”

## Ask
- Problem một câu?
- Bắt đầu tổng bằng mấy?
- Đếm và cộng khác nhau ở dòng nào?

## Unplugged
Con viết algorithm:

```
1. sum = 0
2. Với mỗi số x: sum = sum + x
3. Nói sum
```

Chạy tay với 3, 5, 7, 2: viết bảng sum sau mỗi bước: 3 → 8 → 15 → 17.

## Explain
Giống counting, chỉ khác: cộng **item i** thay vì cộng 1.
Bảng theo dõi (trace) = viết giá trị biến sau mỗi bước — kỹ năng debug.

## Build
```scratch
when green flag clicked
set [sum] to (0)
set [i] to (1)
repeat (length of [nums])
  change [sum] by (item (i) of [nums])
  change [i] by (1)
end
say (join [Sum: ] (sum))
```

## Practice
Test: [3,5,7,2] → 17; [] → 0; [10] → 10.

## Challenge
Tổng chỉ các số chẵn: `if (item i mod 2) = 0`.

## Mistakes
Cộng i thay vì item i — ra 1+2+3+4. Bố: “Cộng vị trí hay cộng số trong hộp?”
Bảng trace bỏ bước. Bố: “Viết sau **mỗi** vòng.”

## Check
1. Counting và sum khác dòng nào?
2. Trace của [1, 2, 3]?
3. List rỗng → ?

## Homework
- [ ] Cộng giá 5 món trong tờ hóa đơn siêu thị bằng bảng trace.

## Pass
3 + 5 + 7 + 2 = 17, bảng trace đúng.

## Next
L49 Average — trung bình.

---

# L49 — Average

## Objective
Con tính trung bình = tổng ÷ số lượng, dùng lại L47 và L48.

## Parent prep
3 cốc nước cao khác nhau (2, 4, 6 cm). Cốc to để đổ chung. Project list `nums`.

## Story
**Bố nói:** “Ba cốc nước cao thấp khác nhau. Đổ hết vào rồi chia đều lại ba cốc — mỗi cốc cao bao nhiêu? Đó là **trung bình**.”

## Ask
- Cần biết những gì? (tổng và số lượng)
- 2, 4, 6 trung bình mấy?
- List rỗng thì chia cho mấy?

## Unplugged
Con đổ chung, chia lại 3 cốc, đo: ~4.
Algorithm:

```
1. sum = tổng (L48)
2. count = số item (L47)
3. avg = sum / count
```

## Explain
Average = sum / count.
Dùng lại algorithm cũ = **ghép** các mảnh.
Chia cho 0 là lỗi — phải kiểm tra list rỗng.

## Build
```scratch
when green flag clicked
set [sum] to (0)
set [i] to (1)
repeat (length of [nums])
  change [sum] by (item (i) of [nums])
  change [i] by (1)
end
if <(length of [nums]) > (0)> then
  say (join [Average: ] ((sum) / (length of [nums])))
else
  say [No numbers]
end
```

## Practice
[2, 4, 6] → 4. [1, 2] → 1.5. [] → No numbers.

## Challenge
Làm tròn: `round (sum / length)`.

## Mistakes
Chia trước khi cộng xong. Bố: “Chia khi nào — trong hay sau vòng lặp?”
Quên trường hợp rỗng. Bố: “Chia cho 0 được không?”

## Check
1. Average cần mấy mảnh?
2. [5, 5, 5] → ?
3. Vì sao cần if length > 0?

## Homework
- [ ] Tính điểm trung bình 3 bài kiểm tra gần nhất.

## Pass
2 4 6 → 4 và xử lý list rỗng.

## Next
L50 Maximum — dùng lại L44 với quy trình 4 ô.

---

# L50 — Maximum

## Objective
Con giải lại bài max theo quy trình 4 ô: problem, draw, algorithm, test — và nói “đi hết danh sách”.

## Parent prep
5 thẻ: 3, 8, 2, 10, 5. Giấy 4 ô. Không mở project L44 (con tự làm lại).

## Story
**Bố nói:** “Con đã làm max ở L44. Hôm nay con làm lại mà **không nhìn** — như võ sĩ tập lại một bài quyền cho thuộc.”

## Ask
- Problem một câu?
- Vẽ cách con tìm số lớn nhất?
- Test nào khó nhất? (max ở cuối, tất cả bằng nhau)

## Unplugged
Ô DRAW: con vẽ 5 ô số, mũi tên đi qua từng ô, khoanh max sau mỗi bước.
Ô ALGORITHM: con tự viết (không chép L44).
Ô TEST: [3,8,2,10,5], [10,1,1], [1,1,10], [4,4,4].

## Explain
Max phải xem **mọi** phần tử — không có đường tắt với list chưa sort.
Đây là tư duy “đi hết danh sách”.

## Build
Con tự làm Scratch từ giấy. Bố chỉ hỏi “dòng này trên giấy là khối nào?”.

## Practice
Chạy 4 test. Con ghi Pass/Fail cạnh từng test.

## Challenge
Đếm số lần so sánh (biến `compares`). List 5 số so mấy lần? (4)

## Mistakes
Dừng giữa chừng khi thấy “số to”. Bố: “Chắc phía sau không có số to hơn?”
Nhìn L44 để chép. Bố: “Giấy trước.”

## Check
1. Vì sao phải đi hết list?
2. List 10 số so mấy lần?
3. Test nào con thấy dễ sai?

## Homework
- [ ] Tìm món đồ nặng nhất trong cặp sách bằng cách cân tay từng món.

## Pass
Max = 10 với 4 test đúng, con nói “đi hết danh sách”.

## Next
L51 Minimum — cùng data, cùng quy trình.

---

# L51 — Minimum

## Objective
Con giải min theo 4 ô, rồi so sánh: max và min khác nhau đúng một chỗ.

## Parent prep
Cùng 5 thẻ. Giấy 4 ô. Project mới.

## Story
**Bố nói:** “Hôm qua tìm người khỏe nhất. Hôm nay tìm quả táo nhẹ nhất để cho em bé. Cách làm có giống không?”

## Ask
- Problem một câu?
- Dòng nào đổi so với max?
- Min của [3, 8, 2, 10, 5]?

## Unplugged
Con viết algorithm min bên cạnh algorithm max hôm qua. Khoanh chỗ khác nhau.
Test: [3,8,2,10,5], [1,9,9], [9,9,1], [-3, 0, 5].

## Explain
Min = max với dấu `<`.
Số âm vẫn đúng nếu bắt đầu bằng item 1 (không bắt đầu bằng 0).

## Build
Con tự làm Scratch. Sau đó gộp: một vòng lặp tính cả max và min.

```scratch
set [max] to (item (1) of [nums])
set [min] to (item (1) of [nums])
```

## Practice
4 test. Thử list có số âm.

## Challenge
Tìm số **nhỏ thứ hai** (gợi ý: tìm min, rồi tìm min của các số khác min).

## Mistakes
`set min to 0` → list [3, 8] ra 0. Bố: “0 có trong list không?”

## Check
1. Max → min đổi mấy chỗ?
2. Vì sao không bắt đầu min = 0?
3. Min của [-3, 0, 5]?

## Homework
- [ ] Tìm ngày ngủ ít nhất trong tuần (ghi giờ ngủ 7 ngày).

## Pass
Min = 2, test có số âm đúng.

## Next
L52 Linear Search — bài mẫu chuẩn 8 câu hỏi.

---

# L52 — Linear Search

## Objective
Con tìm một số trong list bằng cách đi từ đầu, dừng khi thấy. Bài mẫu đủ 8 câu hỏi.

## Parent prep
5 cốc úp, dưới mỗi cốc 1 số: 5, 8, 2, 9, 1. Giấy 4 ô. Coding Passport mở.

## Story
**Bố nói:** “Con mất chiếc tất xanh trong 5 ngăn kéo. Con mở ngăn 1, không có. Ngăn 2, không có… Đến ngăn 4: thấy! Có cần mở ngăn 5 không?”

## Ask
- Problem: tìm 9 trong 5 8 2 9 1.
- Con nghĩ cách nào? (nói, không code)
- Thấy rồi có cần xem tiếp không?

## Unplugged
**Draw:** con lật từng cốc, nói “no / no / no / YES”.
**Algorithm** trên giấy:

```
1. Bắt đầu item đầu tiên
2. So với target
3. Nếu bằng → found, dừng
4. Nếu không → item tiếp
5. Hết list → not found
```

Chạy tay: tìm 9 (4 lần so), tìm 7 (5 lần, not found).

## Explain
Linear search = tìm tuần tự từ đầu.
Dừng sớm khi thấy (khác max phải đi hết).
Không thấy = phải đi hết list.

## Build
```scratch
when green flag clicked
ask [What number?] and wait
set [i] to (1)
set [found] to [no]
repeat until <<(found) = [yes]> or <(i) > (length of [nums])>>
  if <(item (i) of [nums]) = (answer)> then
    set [found] to [yes]
  else
    change [i] by (1)
  end
end
if <(found) = [yes]> then
  say (join [Found at ] (i))
else
  say [Not found]
end
```

## Practice
Test: 9 (vị trí 4), 5 (vị trí 1), 1 (vị trí 5), 7 (không có).

## Challenge
Đếm số lần so sánh cho mỗi test. Số ở đâu thì nhanh nhất?

## Mistakes
Quên điều kiện hết list — vòng lặp mãi khi không có. Bố: “Tìm 7 thì khi nào dừng?”
Tăng i cả khi đã thấy — vị trí sai. Bố: “Thấy rồi còn bước tiếp không?”

## Check
1. Linear search dừng khi nào? (2 cách)
2. Tìm số ở đầu so mấy lần? Ở cuối?
3. Transfer: “Sau này Python viết `for item in list`.”

## Homework
- [ ] Tìm một cuốn sách trên kệ bằng cách đọc từng gáy từ trái sang. Đếm số cuốn đã xem.

## Pass
4 test đúng → tick badge **Search Master** (Scratch).

## Next
L53 Search Count — đếm số lần xuất hiện.

---

# L53 — Search Count

## Objective
Con đếm có bao nhiêu lần số X xuất hiện — **không dừng** khi gặp.

## Parent prep
Thẻ: 5, 5, 2, 5, 3. Giấy 4 ô. Project list `nums`.

## Story
**Bố nói:** “Trong lớp có mấy bạn tên Minh? Không phải thấy một bạn là xong — phải điểm danh hết lớp.”

## Ask
- Khác L52 chỗ nào?
- Đáp án với 5 5 2 5 3, tìm 5?
- Không có X thì đáp án?

## Unplugged
Con lật hết thẻ, mỗi lần thấy 5 bỏ 1 hạt đậu vào cốc. Đếm đậu: 3.
Algorithm: count = 0; với mỗi item: nếu = X thì count + 1.

## Explain
Search count = linear search + counter, đi **hết** list.
So sánh: L52 dừng sớm, L53 không dừng.

## Build
```scratch
when green flag clicked
ask [Count which number?] and wait
set [count] to (0)
set [i] to (1)
repeat (length of [nums])
  if <(item (i) of [nums]) = (answer)> then
    change [count] by (1)
  end
  change [i] by (1)
end
say (join (count) [ times])
```

## Practice
Test: 5 → 3, 2 → 1, 9 → 0.

## Challenge
Hỏi chữ: đếm số chữ “a” trong tên (dùng `letter i of`).

## Mistakes
Dùng repeat until found — dừng sau lần đầu. Bố: “Problem hỏi có hay hỏi bao nhiêu?”

## Check
1. Dừng sớm hay đi hết?
2. 5 5 2 5 → đếm 5?
3. Ghép những mảnh nào?

## Homework
- [ ] Đếm số chữ “n” trong một câu truyện ngắn 3 dòng.

## Pass
5 5 2 5 → 3.

## Next
L54 Frequency — đếm mỗi loại.

---

# L54 — Frequency

## Objective
Con đếm **mỗi loại** xuất hiện bao nhiêu lần: A A B C A B → A=3, B=2, C=1.

## Parent prep
6 thẻ chữ A A B C A B. 3 cốc dán A, B, C. Đậu. Project list `letters`.

## Story
**Bố nói:** “Bầu lớp trưởng: phiếu ghi tên. Đếm mỗi bạn được mấy phiếu. Mỗi bạn một cái cốc.”

## Ask
- Cần mấy biến đếm?
- Đi qua list mấy lần là đủ?
- Thêm chữ D thì sao?

## Unplugged
Con lật từng thẻ, bỏ đậu vào đúng cốc. Đếm: A=3, B=2, C=1.
Hỏi: “Con đi qua thẻ mấy lần?” (1 lần, nhiều cốc)

## Explain
Một vòng lặp, nhiều counter.
Mỗi item → if/else chọn counter đúng.
Nhiều loại hơn → cần list đếm (chuẩn bị hash map L105).

## Build
```scratch
when green flag clicked
set [a] to (0)
set [b] to (0)
set [c] to (0)
set [i] to (1)
repeat (length of [letters])
  if <(item (i) of [letters]) = [A]> then
    change [a] by (1)
  end
  if <(item (i) of [letters]) = [B]> then
    change [b] by (1)
  end
  if <(item (i) of [letters]) = [C]> then
    change [c] by (1)
  end
  change [i] by (1)
end
say (join (join [A=] (a)) (join [ B=] (b)))
```

## Practice
Test: AABCAB → 3,2,1. CCC → 0,0,3.

## Challenge
Tìm chữ xuất hiện nhiều nhất (dùng max với 3 số).

## Mistakes
3 vòng lặp riêng cho 3 chữ — đúng nhưng chậm. Bố: “Một lần đi qua được không?”

## Check
1. Cần mấy counter?
2. Đi qua list mấy lần?
3. Chữ nhiều nhất là gì?

## Homework
- [ ] Hỏi 6 người màu yêu thích, đếm mỗi màu.

## Pass
A=3, B=2, C=1.

## Next
L55 Swap — đổi chỗ hai hộp.

---

# L55 — Swap

## Objective
Con đổi chỗ hai giá trị bằng **hộp tạm**: 7, 3 → 3, 7.

## Parent prep
3 cốc: A (nước cam), B (sữa), T (rỗng). Khay hứng. Project list `nums` [7, 3].

## Story
**Bố nói:** “Cốc A có nước cam, cốc B có sữa. Con muốn đổi: A có sữa, B có cam. Không được trộn. Con làm sao?”

## Ask
- Đổ B vào A ngay được không?
- Cần thêm gì?
- Đổi chỗ cần mấy bước?

## Unplugged
Con thử với cốc thật (nước): A → T, B → A, T → B.
Viết 3 bước:

```
1. T = A
2. A = B
3. B = T
```

Thử bỏ bước 1 (không dùng T) — mất nước cam.

## Explain
Swap cần biến tạm, 3 bước, đúng thứ tự.
Đây là viên gạch của mọi thuật toán sort.

## Build
```scratch
when green flag clicked
set [t] to (item (1) of [nums])
replace item (1) of [nums] with (item (2) of [nums])
replace item (2) of [nums] with (t)
```

## Practice
Swap item 1 và item 3 trong list 5 số. Swap 2 biến a, b.

## Challenge
Đảo ngược list 4 số bằng 2 lần swap (1↔4, 2↔3).

## Mistakes
Không dùng t — cả hai thành 3. Bố: “Số 7 đi đâu rồi?”
Sai thứ tự 3 bước. Bố: “Trace từng bước trên giấy.”

## Check
1. Vì sao cần hộp tạm?
2. 3 bước swap?
3. 7 3 sau swap?

## Homework
- [ ] Đổi chỗ 2 cuốn sách trên kệ chỉ dùng 1 tay + 1 chỗ trống trên bàn. Viết 3 bước.

## Pass
7 3 → 3 7 bằng biến tạm.

## Next
L56 Bubble Sort — xếp hàng bằng nhiều lần swap.

---

# L56 — Bubble Sort

## Objective
Con sắp xếp 5 số tăng dần bằng bubble sort: so cặp cạnh nhau, ngược thì swap, lặp lại.

## Parent prep
5 thẻ số to: 5, 1, 4, 2, 8 (hoặc 5 người/thú bông cao thấp). Project list `nums`.

## Story
**Bố nói:** “Bong bóng trong nước luôn nổi lên trên. Trong bubble sort, số lớn nhất ‘nổi’ dần về cuối hàng sau mỗi lượt.”

## Ask
- So những cặp nào?
- Ngược là sao? (trái > phải)
- Sau lượt 1, số nào chắc chắn đứng cuối?

## Unplugged
Con xếp 5 thẻ. So cặp (1,2): 5 > 1 → swap. Cặp (2,3), (3,4), (4,5). Hết lượt 1: 8 ở cuối.
Lặp lượt 2, 3, 4. Đếm số lần swap trên giấy.

```
Lượt 1: 1 4 2 5 8
Lượt 2: 1 2 4 5 8
Lượt 3: không swap → xong
```

## Explain
Một lượt = so mọi cặp cạnh nhau.
n số cần tối đa n − 1 lượt.
Một lượt không swap nào → đã sort, dừng sớm.

## Build
```scratch
when green flag clicked
repeat ((length of [nums]) - (1))
  set [i] to (1)
  repeat ((length of [nums]) - (1))
    if <(item (i) of [nums]) > (item ((i) + (1)) of [nums])> then
      set [t] to (item (i) of [nums])
      replace item (i) of [nums] with (item ((i) + (1)) of [nums])
      replace item ((i) + (1)) of [nums] with (t)
    end
    change [i] by (1)
  end
end
```

## Practice
List 5 số khác: [3, 3, 1, 2, 9]. Số trùng có sao không?

## Challenge
Thêm biến `swaps` đếm số lần swap.

## Mistakes
So `item i+1` khi i = length — ra trống. Bố: “Cặp cuối là cặp số mấy?”
Chỉ chạy 1 lượt. Bố: “Đã thẳng hàng chưa?”

## Check
1. Bubble sort so gì với gì?
2. Sau lượt 1 số nào cố định?
3. 5 số cần tối đa mấy lượt?

## Homework
- [ ] Xếp 5 người trong nhà theo chiều cao bằng bubble sort (chỉ đổi người đứng cạnh).

## Pass
5 số sort tăng đúng.

## Next
L57 Selection Sort — chọn min đưa lên đầu.

---

# L57 — Selection Sort

## Objective
Con sắp xếp bằng selection sort: mỗi lượt tìm min trong phần còn lại, swap lên đầu.

## Parent prep
Cùng 5 thẻ. Dải băng keo chia “đã xếp | chưa xếp”. Project L56 duplicate.

## Story
**Bố nói:** “Chọn đội bóng: đội trưởng chọn bạn giỏi nhất trước, rồi bạn giỏi nhất trong số còn lại… Selection sort chọn số nhỏ nhất trước.”

## Ask
- Lượt 1 tìm gì?
- Tìm xong đặt ở đâu?
- Dùng lại algorithm nào? (min L51, swap L55)

## Unplugged
Lượt 1: tìm min trong 5 thẻ (1), swap với vị trí 1. Dời băng keo sang phải 1 ô.
Lượt 2: tìm min trong 4 thẻ còn lại, swap vị trí 2… Đếm swap.

## Explain
Selection = lặp: min + swap.
Mỗi lượt đúng **1** swap (hoặc 0).
So với bubble: ít swap hơn, số lần so tương tự.

## Build
```scratch
when green flag clicked
set [start] to (1)
repeat ((length of [nums]) - (1))
  set [minPos] to (start)
  set [j] to ((start) + (1))
  repeat ((length of [nums]) - (start))
    if <(item (j) of [nums]) < (item (minPos) of [nums])> then
      set [minPos] to (j)
    end
    change [j] by (1)
  end
  set [t] to (item (start) of [nums])
  replace item (start) of [nums] with (item (minPos) of [nums])
  replace item (minPos) of [nums] with (t)
  change [start] by (1)
end
```

## Practice
Cùng list 5 1 4 2 8 → so swap với bubble (ghi lên giấy).

## Challenge
Sort giảm dần: đổi chỗ nào?

## Mistakes
Tìm min trong cả list thay vì phần còn lại. Bố: “Băng keo ở đâu?”

## Check
1. Mỗi lượt selection làm gì?
2. Swap mấy lần mỗi lượt?
3. Ghép những algorithm nào?

## Homework
- [ ] Xếp 5 cây bút từ ngắn đến dài bằng cách “chọn cây ngắn nhất còn lại”.

## Pass
5 số sort đúng, con nói khác bubble ở đâu.

## Next
L58 Insertion Sort — chèn bài vào tay.

---

# L58 — Insertion Sort

## Objective
Con sắp xếp bằng insertion sort: lấy từng số, chèn vào đúng chỗ trong phần đã thẳng.

## Parent prep
Bộ bài 5 lá (A–5) xáo. Project list `nums`.

## Story
**Bố nói:** “Khi chơi bài, con bốc từng lá và chèn vào đúng chỗ trên tay. Tay con luôn xếp gọn. Đó là insertion sort.”

## Ask
- Lá đầu tiên đã thẳng chưa?
- Bốc lá mới, con so với lá nào?
- Chèn vào thì các lá khác làm gì?

## Unplugged
Con bốc từng lá, chèn vào tay. Nói to: “Lá 3 nhỏ hơn 5 — dịch 5 sang phải — đặt 3.”
Làm với thẻ số 5 1 4 2 8 trên bàn.

## Explain
Phần trái luôn đã sort.
Lấy item tiếp, dịch các số lớn hơn sang phải, chèn vào chỗ trống.
Gần sort sẵn → rất nhanh.

## Build
```scratch
when green flag clicked
set [i] to (2)
repeat ((length of [nums]) - (1))
  set [key] to (item (i) of [nums])
  set [j] to ((i) - (1))
  repeat until <<(j) < (1)> or <not <(item (j) of [nums]) > (key)>>>
    replace item ((j) + (1)) of [nums] with (item (j) of [nums])
    change [j] by (-1)
  end
  replace item ((j) + (1)) of [nums] with (key)
  change [i] by (1)
end
```

## Practice
List gần sort [1, 2, 3, 5, 4] — đếm số lần dịch. So với list ngược [5, 4, 3, 2, 1].

## Challenge
Đếm “shifts” cho cả hai list. Cái nào nhiều hơn? Vì sao?

## Mistakes
Ghi đè key trước khi lưu. Bố: “Lá đang cầm trên tay để ở đâu?”
Quên j < 1 — vượt đầu list. Bố: “Hết bài bên trái thì dừng.”

## Check
1. Phần nào luôn đã sort?
2. List gần sort thì nhanh hay chậm?
3. Giống chơi bài ở chỗ nào?

## Homework
- [ ] Xếp 7 lá bài bằng insertion, đếm số lần phải dịch lá.

## Pass
5 số sort đúng, con giải thích bằng ví dụ chơi bài.

## Next
L59 Compare Sorting — algorithm khác, số việc khác.

---

# L59 — Compare Sorting

## Objective
Con chạy bubble và selection trên cùng list, đếm swap, rồi nói: “Cùng problem, nhiều algorithm, số việc khác nhau.”

## Parent prep
List 20 số random (bố tạo sẵn bằng `add pick random 1 to 99` × 20). Project có 2 script sort + biến `swaps`. Bảng giấy 2 cột.

## Story
**Bố nói:** “Từ nhà đến trường có 3 đường. Đường nào cũng tới, nhưng đường ngắn đỡ mỏi chân. Algorithm cũng vậy: cùng kết quả, nhưng số bước khác nhau.”

## Ask
- Bubble hay selection swap nhiều hơn? Đoán trước.
- 1000 số trên Scratch thì sao? (chậm — tưởng tượng)
- Sort xong có giống nhau không?

## Unplugged
Con ghi dự đoán lên bảng. Bố đọc to 3 lý do mỗi bên.
Nhắc lại tay với 5 thẻ: bubble swap 4 lần, selection 2 lần (ví dụ 5 1 4 2 8).

## Explain
Đo bằng **đếm** việc (swap, so sánh), không bằng cảm giác.
Selection: ít swap. Bubble: nhiều swap.
Kết quả cuối giống nhau → cả hai đúng.

## Build
1. Tạo list 20 số, copy sang `nums2` (cùng dữ liệu).
2. Chạy bubble trên `nums`, đếm `swaps`.
3. Chạy selection trên `nums2`, đếm `swaps2`.
4. `say` cả hai.

## Practice
Chạy 3 lần với 3 list random khác. Ghi bảng.

## Challenge
Thêm insertion. Ai thắng khi list gần sort?

## Mistakes
Chạy sort thứ 2 trên list đã sort — 0 swap. Bố: “Cùng dữ liệu ban đầu chưa?”

## Check
1. Algorithm nào ít swap?
2. Câu cổng L4: “Cùng một problem có nhiều algorithm.”
3. Làm sao biết algorithm nào nhanh hơn? (đếm)

## Homework
- [ ] Đo 2 đường từ phòng khách ra cửa bằng số bước. Đường nào ngắn hơn?

## Pass
Bảng so sánh 3 lần chạy + câu cổng → tick **Sorting Master**.

## Next
L60 Algorithm Challenge — checkpoint Level 4.

---

# L60 — Algorithm Challenge

## Objective
Con tự giải 5 problem trên một list 10 số: max, min, tìm X, đếm X, sort. Bố không viết. Checkpoint Level 4.

## Parent prep
List 10 số in giấy. 5 thẻ problem úp. Giấy 4 ô × 5. Bút đỏ để tick.

## Story
**Bố nói:** “Hôm nay là bài kiểm tra của kỹ sư. Mỗi problem: nghĩ, vẽ, viết algorithm, rồi mới code. Bố chỉ hỏi 8 câu.”

## Ask
- Problem nào con thấy dễ nhất?
- Problem nào dùng lại cái gì?
- Thứ tự làm thế nào cho nhanh?

## Spec [4]
Con lật 5 thẻ: max · min · tìm X (có/không) · đếm X · sort (chọn 1 sort).
Con ghi thứ tự làm.

## Build [27]
Con làm từng problem: 4 ô giấy → Scratch → test.
Bố hỏi khi kẹt:
- “Problem là gì?”
- “Vẽ ra được không?”
- “Algorithm có mấy bước?”

## Test [6]
Mỗi problem 2 test. Tick đỏ trên giấy.

## Mistakes
Code liền không giấy. Bố: “Ô algorithm đâu?”
Kẹt 1 bài > 10 phút. Bố: “Làm bài khác trước, quay lại sau.”

## Check
1. Bài nào dùng “đi hết danh sách”?
2. Bài nào dừng sớm được?
3. Con chọn sort nào, vì sao?

## Homework
- [ ] Giải thích cho mẹ 1 algorithm con thích nhất bằng thẻ giấy.

## Pass
Ít nhất 4/5 problem đúng, giấy đủ 4 ô.

## Next
L61 Catch Apple (design) — Level 5: kỹ sư game.
