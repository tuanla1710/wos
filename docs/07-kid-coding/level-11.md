# L11 — Final Projects

Không còn “bài học khối”. Engineering. Con **chọn 1** project, làm 6 weekend. Bố: 8 câu, spec, test. Không gõ hộ.

---

# L133 — Chọn + spec

## Objective
Con chọn **1** trong 8 project và viết **1 trang spec**: problem, luật thắng, input, output, test.

## Parent prep
In bảng 8 project. Giấy A4 kẻ 5 ô spec. Coding Passport mở (để con nhìn lại các badge đã có).

> WARNING: Luật cả level — không tải game có sẵn, không ChatGPT viết hộ, kẹt 15 phút thì thu nhỏ spec.

## Story
**Bố nói:** “18 tháng trước con còn chưa biết lệnh là gì. Giờ con sẽ làm một chương trình **của riêng con** — từ ý tưởng tới demo. Kỹ sư thật bắt đầu bằng giấy, không bằng code.”

## Ask
- Project nào con thấy vui nhất?
- Project đó cần algorithm nào con đã học?
- Nếu chỉ còn 3 buổi, phần nhỏ nhất vẫn chơi được là gì?

## Choose [12]
Con đọc bảng, khoanh 2 project, rồi chọn 1 (lý do 1 câu).

| Mã | Project | Cần |
|---|---|---|
| A | Snake AI | list, greedy/BFS tìm mồi |
| B | Maze Solver | BFS/DFS (L117–L119) |
| C | Sorting Visualizer | in từng bước sort |
| D | Mini Chess | bàn 4×4 hoặc 8×8 đơn giản, nước đi hợp lệ — không AI sâu |
| E | Pac-Man | lưới, ghost BFS (optional) |
| F | Tower Defense | loop, list địch, tầm bắn |
| G | Robot Path Finding | như L132 nhưng lớn hơn |
| H | Tic-Tac-Toe AI | rule hoặc minimax 1–2 tầng |

## Spec [25]
Con viết 5 ô trên A4:
1. **Problem**: chương trình làm gì (1 câu).
2. **Luật thắng / xong**: khi nào kết thúc.
3. **Input**: người dùng gõ gì / file gì.
4. **Output**: in ra gì.
5. **Test**: 3 case viết sẵn (input → output mong đợi).

Ví dụ (B Maze Solver): input lưới 10×10 text; output lưới có `*`; test: có đường / không đường / S cạnh E.

## Mistakes
Spec quá to (“Pac-Man có 5 màn, nhạc, điểm cao online”). Bố: “Bản nhỏ nhất chơi được là gì?”
Spec không có test. Bố: “Làm sao biết xong?”

## Check
1. Đọc to spec trong 30 giây.
2. Algorithm chính là gì?
3. Test 1 là gì?

## Homework
- [ ] Đọc spec cho mẹ nghe, sửa 1 chỗ mẹ không hiểu.

## Pass
1 trang spec đủ 5 ô.

## Next
L134 Chia module — chia project thành hàm.

---

# L134 — Chia module (hàm)

## Objective
Con chia project thành **5–8 hàm**, mỗi hàm 1 việc, viết tên + input + output.

## Parent prep
Spec L133. Giấy note dán (mỗi hàm 1 tờ).

## Ask
- Chương trình có mấy bước lớn?
- Mỗi bước có thể là 1 hàm không?
- Hàm nào gọi hàm nào?

## Design [15]
Con viết mỗi hàm lên 1 tờ note: tên, nhận gì, trả gì.
Xếp các tờ thành sơ đồ: `main` ở trên, mũi tên tới hàm con.

Ví dụ (B):
- `load_grid(text)` → list các dòng
- `find(grid, ch)` → (r, c)
- `neighbors(grid, cell)` → list ô đi được
- `bfs(grid, start, goal)` → parent
- `path(parent, goal)` → list ô
- `draw(grid, path)` → in lưới

## Build [25]
Con tạo file `project.py` chỉ có **khung hàm** (`def … : pass` + 1 dòng mô tả), và `main()` gọi theo thứ tự. Chạy được (không lỗi) dù chưa làm gì.

## Mistakes
Một hàm làm mọi thứ (100 dòng). Bố: “Hàm này làm mấy việc?”
Tên hàm `f1`, `abc`. Bố: “Đọc tên có biết nó làm gì không?”

## Check
1. Liệt kê hàm theo thứ tự chạy.
2. Hàm nào khó nhất?
3. Hàm nào test được riêng?

## Homework
- [ ] Vẽ lại sơ đồ hàm sạch sẽ, dán lên tường góc học.

## Pass
List 5–8 hàm có input/output + file khung chạy không lỗi.

## Next
L135 Model dữ liệu — dữ liệu nằm ở đâu.

---

# L135 — Model dữ liệu

## Objective
Con quyết định dữ liệu lưu bằng gì: **list, dict, grid, set, queue** — vẽ trên giấy rồi viết vào code.

## Parent prep
Bảng “dụng cụ” L120 + bảng data structure L108. Spec + sơ đồ hàm.

## Ask
- Bàn chơi / bản đồ lưu bằng gì?
- Điểm, mạng, trạng thái lưu bằng gì?
- Cần tra nhanh “đã thăm chưa” → dùng gì?

## Design [15]
Con vẽ dữ liệu trên giấy với ví dụ thật:
- Grid: list các chuỗi hoặc list of list.
- Vị trí: tuple `(r, c)`.
- Đã thăm: set.
- Parent: dict ô → ô.
- Hàng chờ: deque.

Mỗi cái ghi “vì sao chọn” 1 câu.

## Build [25]
Con viết dữ liệu mẫu vào `project.py` (lưới thật, nhân vật thật) và hàm `show()` in dữ liệu ra để nhìn.

## Mistakes
Dùng list để kiểm tra “đã thăm” với lưới lớn. Bố: “`in list` nhanh hay `in set` nhanh?” (L130)
Lưu vị trí bằng 2 biến rời rạc khắp nơi. Bố: “Gói lại thành 1 tuple được không?”

## Check
1. Mỗi dữ liệu dùng cấu trúc gì, vì sao?
2. `show()` in đúng không?
3. Dữ liệu nào thay đổi khi chạy?

## Homework
- [ ] Vẽ 1 trạng thái giữa chừng của chương trình (ví dụ: robot đi được nửa đường).

## Pass
Vẽ list/dict/grid đúng + dữ liệu mẫu in được.

## Next
L136 Algorithm lõi — chạy tay trước khi code.

---

# L136 — Algorithm lõi

## Objective
Con viết algorithm chính bằng **lời / giấy** và chạy tay **1 case** từ đầu tới cuối.

## Parent prep
Test case 1 từ spec, in to. Bút 3 màu. Thẻ queue/stack nếu cần.

## Ask
- Algorithm chính là gì (BFS, sort, greedy, minimax…)?
- Bắt đầu từ đâu, dừng khi nào?
- Có trường hợp “không có đáp án” không?

## Unplugged [20]
Con chạy tay test case 1: ghi từng bước vào bảng (queue / biến / lưới). Bố chỉ hỏi, không nói đáp án.

## Design [20]
Con viết algorithm thành 6–10 dòng tiếng Việt có thụt lề (như code giả):

```text
cho start vào queue
lặp khi queue còn:
    lấy ô đầu
    nếu là đích: dừng
    với mỗi hàng xóm chưa thăm:
        ghi parent, cho vào queue
lần ngược parent ra đường
```

## Mistakes
Nhảy vào code luôn. Bố: “Tay chạy được chưa?”
Bỏ qua case không có đáp án. Bố: “Nếu bị chặn hết thì sao?”

## Check
1. Đọc to algorithm.
2. Kết quả tay case 1 là gì?
3. Algorithm dừng khi nào?

## Homework
- [ ] Chạy tay test case 2 trên giấy (15 phút).

## Pass
Giấy chạy đúng 1 case.

## Next
L137 Code core — biến giấy thành code.

---

# L137 — Code core

## Objective
Con code phần lõi theo giấy L136, **chạy đúng test case 1**.

## Parent prep
Giấy algorithm + khung `project.py`. Thonny mở sẵn file. Đồng hồ hẹn giờ 15 phút (luật kẹt).

## Ask
- Hàm nào code trước?
- Test case 1 mong đợi gì?
- Kẹt 15 phút thì làm gì?

## Build [32]
Con code từng hàm theo thứ tự sơ đồ, **chạy sau mỗi hàm** (print kiểm tra).
Bố ngồi cạnh, chỉ hỏi 8 câu: “Dòng này làm gì? Biến này giờ bằng mấy? Con mong đợi gì? Thực tế ra gì?…”

> TIP: Kẹt 15 phút → thu nhỏ: lưới nhỏ hơn, ít luật hơn. Không đổi project.

## Test [8]
Chạy test case 1. So output với spec.

## Mistakes
Viết hết rồi mới chạy → 10 lỗi cùng lúc. Bố: “Chạy sau mỗi hàm.”
Bố cầm bàn phím. Không được — con gõ.

## Check
1. Test case 1 ra đúng chưa?
2. Hàm nào còn `pass`?
3. Bug nào con tự sửa hôm nay?

## Homework
- [ ] Ghi vào sổ: hàm đã xong / chưa xong.

## Pass
Chạy đúng case 1.

## Next
L138 Code core — case 2.

---

# L138 — Code core

## Objective
Con hoàn thiện phần lõi, **chạy đúng test case 2** (thường là case khó: không có đáp án / biên).

## Parent prep
Sổ “đã xong / chưa xong”. Test case 2 in to.

## Ask
- Case 2 khác case 1 ở đâu?
- Code hiện tại xử lý case 2 chưa?
- Phần nào còn thiếu để chơi được trọn vẹn?

## Build [32]
Con làm nốt các hàm còn `pass`, nối `main()` để chạy trọn từ đầu tới cuối.
Thêm xử lý case 2 (ví dụ: “No path”, nước đi không hợp lệ, hết mạng).

## Test [8]
Chạy case 1 lại (không được hỏng) + case 2.

## Mistakes
Sửa cho case 2 làm hỏng case 1. Bố: “Chạy lại case 1 chưa?”

## Check
1. Case 1 và 2 cùng đúng?
2. Chương trình chạy trọn chưa?
3. Còn thiếu gì so với spec?

## Homework
- [ ] Cho 1 người nhà dùng thử, ghi lại họ bị kẹt ở đâu.

## Pass
Case 1 + case 2 đúng.

## Next
L139 Test — 5 test viết sẵn.

---

# L139 — Test

## Objective
Con viết **5 test** (input → expected) và chạy tất cả; ghi test nào fail.

## Parent prep
Ghi chép người nhà dùng thử. Giấy bảng test 3 cột: input / mong đợi / thực tế.

## Ask
- Case bình thường?
- Case biên (rỗng, 1 ô, cạnh tường)?
- Case sai input (gõ chữ thay số)?

## Spec [10]
Con viết bảng 5 test: 2 bình thường, 2 biên, 1 input sai.

## Test [30]
Con viết hàm test đơn giản và chạy:

```python
def check(name, got, want):
    print("OK  " if got == want else "FAIL", name, got, want)

check("S cạnh E", len(path(...)), 1)
```

Test nào FAIL → ghi lại, chưa sửa vội.

## Mistakes
Test chỉ case dễ. Bố: “Chương trình có thể chết ở đâu?”
Sửa expected cho khớp kết quả sai. Bố: “Spec nói gì?”

## Check
1. Bao nhiêu test OK / FAIL?
2. Test nào khó nghĩ nhất?
3. FAIL nào nghiêm trọng nhất?

## Homework
- [ ] Nghĩ thêm 1 test “ác” bố chưa nghĩ ra.

## Pass
5 test viết sẵn và đã chạy.

## Next
L140 Debug — sửa test FAIL.

---

# L140 — Debug

## Objective
Con sửa các test FAIL bằng quy trình debug, **ghi log 2 bug** (triệu chứng → nguyên nhân → sửa).

## Parent prep
Danh sách FAIL từ L139. Sổ “bug log” 3 cột. Thẻ quy trình: đọc lỗi → đoán → print → sửa → chạy lại.

## Ask
- Bug nào sửa trước (nghiêm trọng nhất)?
- Lỗi báo dòng nào?
- Con đoán nguyên nhân gì trước khi sửa?

## Debug [34]
Mỗi bug: đọc lỗi → đoán → thêm `print` → sửa 1 chỗ → chạy lại **mọi** test.
Ghi vào bug log:

| Triệu chứng | Nguyên nhân | Sửa |
|---|---|---|
| IndexError dòng 22 | quên kiểm tra biên | thêm `0 <= nr < H` |

## Test [6]
Chạy lại toàn bộ 5 test. Xoá các `print` debug.

## Mistakes
Sửa lung tung nhiều chỗ cùng lúc. Bố: “Mỗi lần sửa 1 chỗ.”
Không đọc thông báo lỗi. Bố: “Python nói gì?”

## Check
1. Đọc 2 dòng bug log.
2. Bao nhiêu test OK giờ?
3. Bug nào dạy con nhiều nhất?

## Homework
- [ ] Kể cho mẹ 1 bug và cách con tìm ra.

## Pass
Log 2 bug tìm được + đã sửa.

## Next
L141 Improve — làm tốt hơn, đo được.

---

# L141 — Improve

## Objective
Con chọn **1 cải thiện đo được** (nhanh hơn, ít bước hơn, thêm tính năng nhỏ) và chứng minh bằng số.

## Parent prep
Danh sách “muốn thêm” từ người nhà dùng thử. Code đo thời gian L121.

## Ask
- Cải thiện gì có ích nhất?
- Đo bằng gì (giây, số bước, số nước đi)?
- Cải thiện có làm hỏng test cũ không?

## Improve [28]
Con đo **trước**, làm cải thiện, đo **sau**. Ví dụ:
- Maze: `list` → `set` cho đã thăm, đo với lưới 50×50.
- Snake AI: BFS tìm mồi thay greedy → ít chết hơn (đếm 10 ván).
- Sorting Visualizer: thêm đếm swap.
- Tic-Tac-Toe: AI chặn khi người sắp thắng.

## Test [12]
Chạy lại 5 test + ghi số trước / sau.

## Mistakes
Thêm 5 tính năng một lúc. Bố: “1 cải thiện, đo được.”
Không đo trước. Bố: “Làm sao biết đã tốt hơn?”

## Check
1. Số trước / sau là bao nhiêu?
2. Vì sao cải thiện này tốt?
3. Test cũ còn OK?

## Homework
- [ ] Ghi số trước/sau vào cuối spec.

## Pass
1 cải thiện có số đo trước/sau.

## Next
L142 Polish — README và làm gọn.

---

# L142 — Polish

## Objective
Con làm gọn code (tên biến, comment ngắn, bỏ code thừa) và viết **README 5 dòng**.

## Parent prep
Mẫu README in sẵn. Danh sách tên biến xấu bố khoanh trước (không sửa hộ).

## Ask
- Người lạ đọc code có hiểu không?
- README cần nói gì?
- Có code thừa / print debug còn sót không?

## Polish [22]
Con đổi tên biến khó hiểu, xoá code chết, thêm 1 dòng mô tả ở đầu mỗi hàm. Chạy lại test sau khi sửa.

## Readme [12]
Con viết `README.txt` 5 dòng:
1. Tên project.
2. Làm gì (1 câu).
3. Cách chạy.
4. Algorithm chính.
5. Điều con tự hào nhất.

## Test [6]
Chạy lại 5 test — polish không được làm hỏng gì.

## Mistakes
Đổi tên biến chỗ này quên chỗ kia → NameError. Bố: “Chạy test lại chưa?”

## Check
1. Đọc README.
2. 1 tên biến con đã đổi và vì sao.
3. Test còn OK?

## Homework
- [ ] Tập demo 5 phút trước gương / với em.

## Pass
README 5 dòng + test OK.

## Next
L143 Demo — trình bày 5 phút.

---

# L143 — Demo

## Objective
Con **demo 5 phút** cho cả nhà: giới thiệu, chạy, cho người khác thử, trả lời câu hỏi.

## Parent prep
Mời cả nhà (ông bà nếu được). Máy chạy sẵn, phông chữ to. Giấy câu hỏi khán giả.

## Ask
- 5 phút chia thế nào?
- Nếu demo lỗi giữa chừng thì làm gì?
- Con muốn khán giả thử phần nào?

## Build [10]
Tổng duyệt 1 lần (chạy thử, kiểm tra input demo chuẩn bị sẵn).

## Demo [22]
Con trình bày:
1. Problem (30 giây).
2. Chạy chương trình (2 phút).
3. Cho 1 người chơi / chạy thử (1 phút 30).
4. Algorithm chính bằng 1 hình vẽ (1 phút).
Rồi trả lời câu hỏi khán giả.

## Review [8]
Cả nhà mỗi người nói 1 điều thích + 1 gợi ý. Con ghi lại.

## Mistakes
Đọc code từng dòng cho khán giả. Bố: “Khán giả muốn xem nó chạy.”
Lỗi thì hoảng. Bố: “Kỹ sư thật nói: ‘đây là bug, con sẽ sửa’.”

## Check
1. Demo đủ 4 phần chưa?
2. Câu hỏi khó nhất là gì?
3. Gợi ý nào con sẽ làm?

## Homework
- [ ] Ôn 8 câu giải thích cho L144 (bố đưa danh sách).

## Pass
Demo 5 phút chạy/chơi được.

## Next
L144 Giải thích — tốt nghiệp.

---

# L144 — Giải thích

## Objective
Con trả lời **8 câu** về project và giải thích **Big-O bằng tay**. Tốt nghiệp: badge **Junior Computer Scientist**.

## Parent prep
8 câu in to (dưới đây). Coding Passport + mọi badge. Giấy khen tự làm.

## Story
**Bố nói:** “Người hiểu thật là người giải thích được. Hôm nay không code — con là người dạy, bố là học trò.”

## Ask
- Phần nào trong project con hiểu chắc nhất?
- Phần nào con còn chưa chắc?
- Nếu làm lại từ đầu con sẽ đổi gì?

## Explain [25]
Con trả lời 8 câu (nói + vẽ):
1. Chương trình giải problem gì?
2. Dữ liệu lưu bằng cấu trúc nào, vì sao?
3. Algorithm chính là gì? Chạy tay 1 case nhỏ.
4. Vì sao chọn algorithm này, không chọn cái khác?
5. Big-O ước lượng là bao nhiêu? Vì sao không chậm trên input nhỏ?
6. Input lớn gấp 10 thì sao?
7. Bug khó nhất là gì, sửa thế nào?
8. Cải thiện tiếp theo là gì?

## Review [12]
Nhìn lại 18 tháng: mở Coding Passport, con kể 1 bài nhớ nhất mỗi level. Tick **Junior Computer Scientist**. Đánh dấu Passport Done.

## Mistakes
Trả lời “không biết” rồi dừng. Bố: “Thử vẽ ra xem?”
Big-O học thuộc mà không giải thích. Bố: “Đếm vòng lặp cho bố xem.”

## Check
1. Bao nhiêu câu con tự tin?
2. Big-O project là gì?
3. Câu con muốn học tiếp sau khóa?

## Homework
- [ ] Viết 5 dòng “Con đã học được gì” và dán vào cuối Passport.

## Pass
8 câu + Big-O tay → tick **Junior Computer Scientist**, Passport Done.

## Next
Tốt nghiệp. Chọn hướng tiếp: web, game, AI, hoặc thi lập trình.
