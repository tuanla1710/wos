# L10 — Advanced

Không học thuộc Big-O. Đo. Cổng Path Visualizer L132.

---

# L121 — Big-O intuition

## Objective
Con **đo** thời gian vòng lặp với n = 10, 100, 1000, 10000 và nhận ra 4 kiểu lớn lên: O(1), O(n), O(n²), O(log n).

## Parent prep
Giấy kẻ bảng 4 cột. Bút 2 màu để vẽ đồ thị. Thonny.

## Story
**Bố nói:** “Có việc làm 1 lần là xong (mở cửa). Có việc phải đi qua từng người (điểm danh). Có việc mỗi người bắt tay mọi người (n²). Khi lớp có 1000 người, khác biệt rất lớn. Hôm nay con đo — không học thuộc.”

## Ask
- Điểm danh 10 người vs 1000 người: lâu gấp mấy?
- Bắt tay mọi người: 10 người mấy cái bắt tay?
- Đoán số trong 1000 (L110) mấy câu?

## Unplugged
Lớp 4 người bắt tay nhau: đếm (6). 8 người? (28). Con thấy: gấp đôi người → gấp 4 lần bắt tay.
Vẽ 4 đường trên giấy: phẳng, thẳng, cong lên, gần phẳng.

## Explain
O(1): lấy `xs[0]` — không đổi.
O(n): một vòng for.
O(n²): hai vòng lồng.
O(log n): cắt đôi mỗi lần.
Không cần công thức — nhìn hình dạng.

## Build
```python
import time

def one_loop(n):
    s = 0
    for i in range(n):
        s += i

def two_loops(n):
    s = 0
    for i in range(n):
        for j in range(n):
            s += 1

for n in [10, 100, 1000, 3000]:
    t = time.time(); one_loop(n); a = time.time() - t
    t = time.time(); two_loops(n); b = time.time() - t
    print(n, round(a, 5), round(b, 5))
```

## Practice
Ghi bảng kết quả, vẽ 2 đường. Đoán `two_loops(6000)` mất bao lâu trước khi chạy.

## Challenge
Đo binary search vs linear search trên list 1 triệu số.

## Mistakes
Chạy `two_loops(100000)` → đơ máy. Bố: “Đoán trước: 100000² là bao nhiêu?”

## Check
1. Chỉ 1 ví dụ O(1), O(n), O(n²), O(log n).
2. n gấp đôi, O(n²) lâu gấp mấy?
3. Vì sao không cần thuộc bảng?

## Homework
- [ ] Tìm 3 việc trong nhà: O(1), O(n), O(n²).

## Pass
Chỉ đúng 1 ví dụ mỗi loại bằng tay.

## Next
L122 Greedy — luôn lấy cái tốt nhất ngay.

---

# L122 — Greedy

## Objective
Con đổi tiền bằng greedy (luôn lấy xu lớn nhất vừa), và tìm được trường hợp greedy **sai**.

## Parent prep
Xu giấy 10, 5, 1 (và bộ lạ 1, 3, 4). Thonny.

## Story
**Bố nói:** “Thối 27 nghìn: con lấy tờ to nhất vừa trước — 10, 10, 5, 1, 1. Nhanh và gọn. Đó là **greedy** — tham lam. Nhưng tham lam không phải lúc nào cũng đúng…”

## Ask
- Đổi 27 với xu 10, 5, 1 mấy đồng?
- Luôn lấy lớn nhất có ổn không?
- Đổi 6 với xu 1, 3, 4?

## Unplugged
Con đổi 27 bằng xu giấy. Rồi bộ 1, 3, 4 đổi 6: greedy lấy 4+1+1 (3 xu). Tốt hơn: 3+3 (2 xu)! Greedy sai.

## Explain
Greedy: mỗi bước chọn cái tốt nhất **lúc này**.
Nhanh, đơn giản. Đúng với tiền Việt / xu 10-5-1.
Có bài greedy sai → cần cách khác (DP — L123).

## Build
```python
def change(amount, coins):
    coins = sorted(coins, reverse=True)
    used = []
    for c in coins:
        while amount >= c:
            amount -= c
            used.append(c)
    return used

print(change(27, [10, 5, 1]))
print(change(6, [1, 3, 4]))
```

## Practice
Đổi 99, 48 với xu 10, 5, 2, 1.

## Challenge
Tìm 1 bộ xu khác làm greedy sai.

## Mistakes
Không sort xu giảm dần. Bố: “Lấy xu nào trước?”

## Check
1. Greedy là gì?
2. 27 = ?
3. Ví dụ greedy sai?

## Homework
- [ ] Xếp đồ vào ba lô kiểu greedy (món nặng trước) — có vừa không?

## Pass
27 = 2×10 + 1×5 + 2×1. Nói được greedy không luôn đúng.

## Next
L123 DP Fibonacci — nhớ để khỏi tính lại.

---

# L123 — DP Fibonacci

## Objective
Con tính Fibonacci hai cách: đệ quy (chậm) và **bảng** (nhanh), đo sự khác biệt.

## Parent prep
Giấy kẻ bảng 1 hàng 15 ô. Thonny.

## Story
**Bố nói:** “Thỏ con: mỗi tháng số cặp = tháng trước + tháng trước nữa. 1, 1, 2, 3, 5, 8… Đệ quy tính đi tính lại một chỗ hàng trăm lần. Viết vào bảng thì chỉ tính một lần.”

## Ask
- fib(5) = ?
- fib(5) cần fib(4) và fib(3). fib(4) cần fib(3)… fib(3) bị tính mấy lần?
- Ghi bảng có giúp không?

## Unplugged
Vẽ cây fib(5): đếm số lần fib(2) xuất hiện (3 lần).
Rồi điền bảng từ trái sang: 1, 1, 2, 3, 5, 8 — mỗi ô cộng 2 ô trước.

## Explain
Đệ quy thuần: rất nhiều việc lặp lại (~2ⁿ).
DP bảng: điền từ nhỏ đến lớn, mỗi ô 1 lần (n).
DP = chia nhỏ + nhớ kết quả.

## Build
```python
import time

def fib_rec(n):
    if n <= 2:
        return 1
    return fib_rec(n - 1) + fib_rec(n - 2)

def fib_table(n):
    t = [0, 1, 1]
    for i in range(3, n + 1):
        t.append(t[i - 1] + t[i - 2])
    return t[n]

print(fib_rec(10), fib_table(10))
t = time.time(); fib_rec(30); print("rec", round(time.time() - t, 3))
t = time.time(); fib_table(30); print("table", round(time.time() - t, 6))
```

## Practice
fib_table(50), fib_table(100). Đừng chạy fib_rec(40)!

## Challenge
Số cách leo n bậc thang (mỗi bước 1 hoặc 2) — cũng là Fibonacci.

## Mistakes
Chạy fib_rec(40) → chờ rất lâu. Bố: “Cây có bao nhiêu nhánh?”

## Check
1. Vì sao đệ quy chậm?
2. Bảng nhanh vì sao?
3. fib(10) = ?

## Homework
- [ ] Điền tay bảng fib tới 15.

## Pass
2 cách ra cùng kết quả, cách bảng nhanh hơn (đo fib(30)).

## Next
L124 Memoization — giữ đệ quy nhưng nhớ.

---

# L124 — Memoization

## Objective
Con thêm **dict nhớ** vào fib đệ quy, fib(30) xong dưới 1 giây.

## Parent prep
Sổ tay “đã tính” (giấy). Thonny.

## Story
**Bố nói:** “Nếu ai hỏi ‘7 × 8 bằng mấy?’ lần thứ hai, con không tính lại — con nhớ. Hàm cũng có thể có sổ tay: tính rồi thì ghi lại.”

## Ask
- Sổ tay lưu gì? (n → kết quả)
- Trước khi tính nên làm gì?
- Khác bảng L123 ở đâu?

## Unplugged
Bố hỏi fib các số, con tra sổ tay trước. Có rồi → trả ngay, chưa có → tính rồi ghi.

## Explain
`memo = {}` lưu n → fib(n).
Đầu hàm: có trong memo → return.
Cuối: ghi memo rồi return.
Memo = top-down; bảng = bottom-up. Cả hai là DP.

## Build
```python
import time

memo = {}

def fib(n):
    if n in memo:
        return memo[n]
    if n <= 2:
        return 1
    memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]

t = time.time()
print(fib(30), round(time.time() - t, 6))
print(fib(100))
```

## Practice
Đếm số lần hàm thực sự tính (thêm biến đếm) — có memo vs không.

## Challenge
Dùng `functools.lru_cache` — 1 dòng thay memo.

## Mistakes
Ghi memo nhưng không kiểm tra đầu hàm. Bố: “Có tra sổ tay trước không?”

## Check
1. Memo lưu gì?
2. fib(30) mất bao lâu?
3. Memo và bảng khác gì?

## Homework
- [ ] Viết `climb(n)` (bậc thang) có memo.

## Pass
fib(30) memo xong dưới 1 giây.

## Next
L125 Knapsack — chọn đồ vào ba lô.

---

# L125 — Knapsack

## Objective
Con chọn đồ vào ba lô 5 kg sao cho **điểm cao nhất**, thử mọi tổ hợp bằng tay và (optional) code.

## Parent prep
3–4 đồ chơi có thẻ: (2 kg, 30 điểm), (3 kg, 40), (2 kg, 25), (1 kg, 10). Ba lô giấy. Thonny.

## Story
**Bố nói:** “Đi cắm trại, ba lô chỉ chịu 5 kg. Mỗi món có cân nặng và độ ‘vui’. Chọn thế nào để vui nhất? Greedy lấy món điểm cao nhất có thể sai.”

## Ask
- Lấy món 40 điểm trước có tốt nhất không?
- Có bao nhiêu cách chọn 3 món? (8)
- Làm sao chắc chọn tốt nhất?

## Unplugged
Con liệt kê mọi tổ hợp trên giấy: cân nặng ≤ 5? tổng điểm? Khoanh tốt nhất.

| Tổ hợp | kg | điểm |
|---|---|---|
| A+B | 5 | 70 |
| A+C | 4 | 55 |

## Explain
Thử hết (brute force) với ít món: OK.
Nhiều món → DP bảng (lớp lớn học sau).
Bài học: greedy không chắc đúng; thử hết thì chắc đúng nhưng chậm.

## Build
```python
from itertools import combinations

items = [("A", 2, 30), ("B", 3, 40), ("C", 2, 25), ("D", 1, 10)]
best = (0, [])
for k in range(1, len(items) + 1):
    for combo in combinations(items, k):
        kg = sum(x[1] for x in combo)
        pts = sum(x[2] for x in combo)
        if kg <= 5 and pts > best[0]:
            best = (pts, [x[0] for x in combo])
print(best)
```

## Practice
Đổi sức chứa 4 kg, 6 kg. Thêm món mới.

## Challenge
Greedy theo “điểm/kg” — có ra kết quả tốt nhất không?

## Mistakes
Quên kiểm tra kg ≤ 5. Bố: “Ba lô có rách không?”

## Check
1. Tổ hợp tốt nhất với 5 kg?
2. Vì sao greedy có thể sai?
3. Brute force chậm khi nào?

## Homework
- [ ] Chọn đồ mang đi chơi cuối tuần với giới hạn 1 túi — ghi lý do.

## Pass
Chọn được tổ hợp điểm cao và giải thích.

## Next
L126 Shortest Path — khi cạnh có độ dài.

---

# L126 — Shortest Path

## Objective
Con thấy BFS không đủ khi cạnh có **km**, và cập nhật khoảng cách bằng tay trên graph 4 nút.

## Parent prep
Bản đồ 4 nút có số km trên cạnh (vẽ to). Thẻ khoảng cách. Thonny.

## Story
**Bố nói:** “Đường A → C trực tiếp 10 km, nhưng A → B → C chỉ 3 + 2 = 5 km. Đi ít đoạn chưa chắc gần. BFS đếm đoạn — giờ ta cần đếm **km**.”

## Ask
- BFS chọn đường nào A → C?
- Đường nào thật sự ngắn?
- Làm sao biết đường ngắn nhất?

## Unplugged
```
A --3-- B
|       |
10      2
|       |
C --1-- D
```
Con ghi khoảng cách từ A: A=0, B=3, C=10, D=∞. Đi qua B: D = 3+2 = 5. Qua D: C = 5+1 = 6 < 10 → cập nhật!

## Explain
Mỗi nút giữ “khoảng cách tốt nhất biết tới giờ”.
Tìm đường mới ngắn hơn → **cập nhật** (relax).
Lặp tới khi không cập nhật được nữa.

## Build
```python
edges = [("A", "B", 3), ("B", "D", 2), ("A", "C", 10), ("C", "D", 1)]
dist = {"A": 0, "B": float("inf"), "C": float("inf"), "D": float("inf")}

changed = True
while changed:
    changed = False
    for u, v, w in edges + [(v, u, w) for u, v, w in edges]:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            changed = True
print(dist)
```

## Practice
Thêm cạnh B–C 1 km. Khoảng cách đổi thế nào?

## Challenge
In luôn đường đi (nhớ parent như L118).

## Mistakes
Chỉ cập nhật một chiều với đường hai chiều. Bố: “Đường này có đi ngược được không?”

## Check
1. Vì sao BFS không đủ?
2. “Cập nhật” nghĩa là gì?
3. A → C ngắn nhất bao nhiêu km?

## Homework
- [ ] Vẽ đường từ nhà tới 3 nơi quen (km ước lượng), tìm đường ngắn nhất tay.

## Pass
Tay 4 nút ra khoảng cách đúng.

## Next
L127 Dijkstra — cách thông minh để cập nhật.

---

# L127 — Dijkstra

## Objective
Con chạy Dijkstra bằng **bảng** trên giấy: luôn chọn nút gần nhất chưa chốt. Code dùng `heapq` (L104).

## Parent prep
Graph L126 + 1 graph 5 nút. Bảng khoảng cách in sẵn. Thonny.

## Story
**Bố nói:** “Ông Dijkstra nghĩ ra cách này trong 20 phút khi ngồi uống cà phê. Ý tưởng: nút nào gần nhất chưa chốt thì chốt nó, rồi cập nhật hàng xóm.”

## Ask
- Nút nào chốt đầu tiên?
- Chốt rồi có đổi nữa không?
- Heap (L104) giúp gì?

## Unplugged
Bảng: nút | khoảng cách | chốt?
Vòng 1: chốt A (0), cập nhật B=3, C=10.
Vòng 2: chốt B (3), cập nhật D=5.
Vòng 3: chốt D (5), cập nhật C=6.
Vòng 4: chốt C (6).

## Explain
Heap luôn cho nút gần nhất.
Pop → nếu đã chốt bỏ qua → chốt → đẩy hàng xóm với khoảng cách mới.
Chỉ đúng khi km không âm.

## Build
```python
import heapq

graph = {"A": [("B", 3), ("C", 10)], "B": [("A", 3), ("D", 2)],
         "C": [("A", 10), ("D", 1)], "D": [("B", 2), ("C", 1)]}

def dijkstra(start):
    dist = {}
    heap = [(0, start)]
    while heap:
        d, node = heapq.heappop(heap)
        if node in dist:
            continue
        dist[node] = d
        for nb, w in graph[node]:
            if nb not in dist:
                heapq.heappush(heap, (d + w, nb))
    return dist

print(dijkstra("A"))
```

## Practice
Chạy trên graph 5 nút của bố, so với bảng tay.

## Challenge
Lưu parent và in đường A → C.

## Mistakes
Chốt nút trước khi pop nó. Bố: “Có chắc nó gần nhất chưa?”

## Check
1. Mỗi vòng chốt nút nào?
2. Vì sao dùng heap?
3. Khoảng cách A → C?

## Homework
- [ ] Chạy Dijkstra bằng bảng cho bản đồ nhà của L126.

## Pass
Đường đúng cho 1 case (bảng tay hoặc code).

## Next
L128 A* — Dijkstra có thêm “la bàn”.

---

# L128 — A*

## Objective
Con hiểu A* = Dijkstra **cộng ước lượng còn bao xa**, chạy tay trên lưới 5×5.

## Parent prep
Lưới 5×5 trên giấy ô có vài tường. Thước đo. (Không bắt code A* đầy đủ.)

## Story
**Bố nói:** “Dijkstra lan ra mọi hướng như sóng. A* có la bàn: nó biết đích ở hướng nào, nên ưu tiên đi về phía đó.”

## Ask
- Dijkstra có biết đích ở đâu không?
- “Còn bao xa” ước lượng thế nào trên lưới?
- A* nhanh hơn vì sao?

## Unplugged
Trên lưới, mỗi ô ghi: g = đã đi, h = còn bao xa (đếm ô ngang + dọc tới đích), f = g + h.
Con luôn mở ô có f nhỏ nhất. So với Dijkstra: mở ít ô hơn.

## Explain
h (heuristic) = ước lượng, như chim bay hoặc đếm ô.
A* chọn f = g + h nhỏ nhất.
h tốt → mở ít ô. h = 0 → A* thành Dijkstra.

## Build
```python
def h(cell, goal):
    return abs(cell[0] - goal[0]) + abs(cell[1] - goal[1])

goal = (4, 4)
for cell in [(0, 0), (2, 3), (4, 3)]:
    print(cell, "còn khoảng", h(cell, goal), "ô")
```

## Practice
Chạy A* tay trên lưới 5×5, tô ô đã mở. Chạy Dijkstra tay, tô màu khác. Đếm ô.

## Challenge
Viết A* đầy đủ (dựa trên Dijkstra L127, ưu tiên theo g + h).

## Mistakes
Ước lượng lớn hơn thật → đường sai. Bố: “La bàn có nói quá không?”

## Check
1. A* khác Dijkstra ở đâu?
2. h trên lưới tính thế nào?
3. h = 0 thì thành gì?

## Homework
- [ ] Giải thích A* cho mẹ bằng ví dụ “đi về phía có mùi bánh”.

## Pass
Nói được A* khác Dijkstra ở chỗ cộng ước lượng.

## Next
L129 Graph Challenge.

---

# L129 — Graph Challenge

## Objective
Con nhận bản đồ 6 điểm, **chọn** BFS hay Dijkstra, rồi tìm đường.

## Parent prep
2 bản đồ 6 điểm: (1) không có km · (2) có km. Code BFS L118 + Dijkstra L127.

## Story
**Bố nói:** “Bản đồ thứ nhất chỉ có đường nối. Bản đồ thứ hai có km. Thợ giỏi chọn dụng cụ đúng.”

## Ask
- Bản đồ không km → dùng gì?
- Bản đồ có km → dùng gì?
- DFS có dùng được không?

## Unplugged
Con nhìn 2 bản đồ, viết lựa chọn + lý do 1 câu cho mỗi cái.

## Explain
Không km (mỗi cạnh = 1 bước) → BFS.
Có km không âm → Dijkstra.
Có la bàn / lưới → A*.

## Build
Con nhập 2 bản đồ thành dict, chạy BFS cho bản đồ 1, Dijkstra cho bản đồ 2.

## Practice
Bố đổi 1 số km — đường ngắn nhất đổi không?

## Challenge
Chạy BFS trên bản đồ có km — kết quả sai thế nào?

## Mistakes
Dùng BFS cho bản đồ có km. Bố: “BFS đếm gì?”

## Check
1. Chọn tool nào cho mỗi bản đồ?
2. Đường ngắn nhất là gì?
3. Vì sao?

## Homework
- [ ] Vẽ bản đồ đi học (có km) và chạy Dijkstra bằng bảng.

## Pass
Đúng tool + đường cho cả 2 bản đồ.

## Next
L130 Optimization — làm code nhanh hơn.

---

# L130 — Optimization

## Objective
Con biến code đếm **O(n²)** thành **O(n)** bằng dict, và đo thời gian trước / sau.

## Parent prep
List 5000 chữ cái random. Bảng đo. Thonny.

## Story
**Bố nói:** “Đếm mỗi loại kẹo trong túi: cách chậm là với mỗi viên lại đếm cả túi. Cách nhanh: mỗi viên bỏ vào đúng hộp và cộng 1. Hôm nay con làm code nhanh hơn 100 lần.”

## Ask
- Cách chậm làm gì?
- Cách nhanh dùng cấu trúc nào (L105)?
- Nhanh hơn bao nhiêu?

## Unplugged
Túi 10 viên kẹo: cách chậm — với mỗi viên đếm cả túi (100 lần nhìn). Cách nhanh — bỏ vào hộp (10 lần).

## Explain
`xs.count(x)` trong vòng for = O(n²).
Dict cộng dồn = O(n).
Tối ưu: chọn đúng cấu trúc dữ liệu.

## Build
```python
import random, time

xs = [random.choice("abcde") for _ in range(5000)]

t = time.time()
slow = {x: xs.count(x) for x in xs}
print("slow", round(time.time() - t, 4))

t = time.time()
fast = {}
for x in xs:
    fast[x] = fast.get(x, 0) + 1
print("fast", round(time.time() - t, 4))
print(slow == fast)
```

## Practice
Kiểm tra trùng: `if x in list` vs `if x in set` với 10000 phần tử.

## Challenge
Tìm 2 số trong list có tổng = 10 nhanh (dùng set).

## Mistakes
Tối ưu nhưng kết quả khác. Bố: “Nhanh mà sai có ích không?” (luôn so `slow == fast`)

## Check
1. Cách chậm O mấy?
2. Cách nhanh O mấy?
3. Đo: nhanh hơn bao nhiêu lần?

## Homework
- [ ] Đếm tần suất chữ trong 1 đoạn văn bằng dict.

## Pass
1 đoạn từ O(n²) thành O(n) (đếm tần suất), kết quả giống.

## Next
L131 Complexity Challenge.

---

# L131 — Complexity Challenge

## Objective
Con nhìn 4 đoạn code trên giấy, **đoán** O của mỗi đoạn, đo nếu nghi ngờ. Đúng 3/4.

## Parent prep
4 thẻ code in sẵn (dưới đây). Thonny để đo.

## Story
**Bố nói:** “Hôm nay con là thám tử tốc độ: nhìn code, đoán nó chạy nhanh hay chậm khi n lớn. Không chắc thì đo.”

## Ask
- Một vòng for → ?
- Hai vòng lồng → ?
- Cắt đôi mỗi lần → ?

## Unplugged
Con xếp 4 thẻ vào 4 hộp: O(1), O(log n), O(n), O(n²).

```text
A: return xs[0]
B: for x in xs: print(x)
C: for x in xs:
       for y in xs: print(x, y)
D: while n > 1: n = n // 2
```

## Explain
Đếm vòng lặp và xem n thay đổi thế nào.
Không chắc → đo với n và 2n.
O(n) gấp đôi; O(n²) gấp bốn; O(log n) thêm 1 bước.

## Build
Con đo đoạn D với n = 1000, 1000000 — đếm số vòng. Đo đoạn C với n = 100, 200.

## Practice
Bố viết thêm 2 đoạn bí ẩn — con đoán.

## Challenge
Viết 1 đoạn O(n²) và tối ưu nó thành O(n).

## Mistakes
Thấy 2 vòng for liền nhau (không lồng) đoán O(n²). Bố: “Lồng hay nối tiếp?”

## Check
1. A, B, C, D là gì?
2. Đoạn nào chậm nhất khi n lớn?
3. Không chắc thì làm gì?

## Homework
- [ ] Đoán O cho 3 hàm con đã viết ở L109–L130.

## Pass
3/4 đúng loại.

## Next
L132 Path Visualizer — checkpoint Level 10.

---

# L132 — Path Visualizer

Project: Path Visualizer

## Objective
Con in lưới 8×8 bằng chữ (`.` `#` `*`), chạy BFS tìm đường ngắn nhất từ S tới E và vẽ đường bằng `*`. Checkpoint Level 10.

## Parent prep
Lưới 8×8 vẽ sẵn trên giấy. Code BFS L118. Coding Passport mở.

## Story
**Bố nói:** “Game và bản đồ trên điện thoại đều tìm đường. Hôm nay con làm máy tìm đường của riêng mình — và nhìn thấy đường hiện ra.”

## Ask
- Lưới là graph thế nào? (mỗi ô là nút, 4 hàng xóm)
- Dùng BFS hay Dijkstra? Vì sao?
- In đường bằng gì?

## Spec [4]
Con viết: input lưới 8×8, S, E, `#` tường. Output: lưới có `*` trên đường. Không có đường → in “No path”.

## Build [25]
```python
from collections import deque

grid = ["S..#....",
        ".#.#.##.",
        ".#...#..",
        ".####.#.",
        "......#.",
        "#.###...",
        "..#...#.",
        "....#..E"]

def find(ch):
    for r, row in enumerate(grid):
        if ch in row:
            return r, row.index(ch)

start, goal = find("S"), find("E")
parent = {start: None}
q = deque([start])
while q:
    r, c = q.popleft()
    if (r, c) == goal:
        break
    for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
        nr, nc = r + dr, c + dc
        if 0 <= nr < 8 and 0 <= nc < 8 and grid[nr][nc] != "#" and (nr, nc) not in parent:
            parent[(nr, nc)] = (r, c)
            q.append((nr, nc))

rows = [list(row) for row in grid]
node = parent.get(goal)
while node and node != start:
    rows[node[0]][node[1]] = "*"
    node = parent[node]
print("\n".join("".join(row) for row in rows) if goal in parent else "No path")
```

## Test [8]
Test: lưới gốc · chặn hết đường (No path) · S cạnh E · con tự vẽ lưới mới.

## Mistakes
Quên kiểm tra biên → IndexError. Bố: “Ô ngoài lưới có tồn tại không?”
Đường vẽ đè lên S/E. Bố: “Dừng tô ở đâu?”

## Check
1. Lưới thành graph thế nào?
2. Vì sao BFS cho đường ngắn nhất ở đây?
3. Tự đánh giá: phần nào khó nhất?

## Homework
- [ ] Vẽ 2 lưới mê cung mới cho người nhà giải bằng chương trình.

## Pass
In được đường đúng → checkpoint Level 10 xong, sẵn sàng Final Project.

## Next
L133 Final Project — chọn đề + spec.
