# L9 — Algorithms

Python implementation. Cổng: chọn algorithm đúng problem L120.
Search Master (Python) L109. Giữ giấy Think trước code.

---

# L109 — Linear Search

## Objective
Con viết `find(xs, t)` bằng Python, trả về vị trí hoặc −1, và so với bản Scratch L52.

## Parent prep
Mở project Scratch L52 + giấy 4 ô. 5 cốc úp. Coding Passport.

## Story
**Bố nói:** “Hơn nửa năm trước con tìm số trong cốc bằng Scratch. Giờ con viết lại như lập trình viên: một **hàm** nhận list và số cần tìm, trả về vị trí.”

## Ask
- Hàm cần mấy tham số?
- Không tìm thấy trả về gì?
- Tìm số ở cuối list mất mấy lần so?

## Unplugged
Con lật cốc, nói “no / no / YES”. Viết algorithm 5 dòng (nhớ L52) — không nhìn bản cũ.

## Explain
`enumerate(xs)` cho cả vị trí và giá trị.
`return i` ngay khi thấy (dừng sớm).
Hết vòng lặp → `return -1`.
Linear search: O(n) — xem từng phần tử.

## Build
```python
def find(xs, t):
    for i, x in enumerate(xs):
        if x == t:
            return i
    return -1

nums = [5, 8, 2, 9, 1]
print(find(nums, 9))
print(find(nums, 7))
```

## Practice
Test: đầu, giữa, cuối, không có, list rỗng.

## Challenge
`find_all(xs, t)` trả về list mọi vị trí (L53).

## Mistakes
`return -1` trong vòng lặp (else) — dừng sau phần tử đầu. Bố: “Không thấy ở ô 1 đã kết luận không có?”

## Check
1. Hàm dừng sớm khi nào?
2. List 1000 phần tử, tệ nhất so mấy lần?
3. So với Scratch: ngắn hơn bao nhiêu?

## Homework
- [ ] Viết `find` cho list tên người trong nhà, test 3 trường hợp.

## Pass
Test có / không đúng → tick **Search Master** (Python).

## Next
L110 Binary Search — cắt đôi mỗi lần.

---

# L110 — Binary Search

## Objective
Con tìm trong list **đã sắp xếp** bằng cách so với phần giữa và bỏ nửa mỗi lần.

## Parent prep
Thẻ số 1–100 (hoặc danh bạ giấy). Thonny.

## Story
**Bố nói:** “Bố nghĩ một số từ 1 đến 100. Con hỏi ‘lớn hơn 50?’. Mỗi câu hỏi bỏ được một nửa. 7 câu là chắc chắn đoán được! Đó là **binary search**.”

## Ask
- Câu hỏi đầu tiên nên là số mấy?
- Sau 1 câu còn bao nhiêu số?
- Vì sao list phải sắp xếp?

## Unplugged
Chơi đoán số 1–100: con chỉ được hỏi “> X?”. Đếm câu hỏi (≤ 7).
Thử với list chưa sắp xếp: bố trộn thẻ — hỏi “> 50?” vô nghĩa.

## Explain
`lo`, `hi` là hai đầu. `mid = (lo + hi) // 2`.
Bằng → tìm thấy. Nhỏ hơn → bỏ nửa trái. Lớn hơn → bỏ nửa phải.
O(log n): 1000 số chỉ ~10 lần.

## Build
```python
def binary_search(xs, t):
    lo, hi = 0, len(xs) - 1
    steps = 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if xs[mid] == t:
            return mid, steps
        if xs[mid] < t:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, steps

nums = list(range(1, 101))
print(binary_search(nums, 73))
```

## Practice
So số bước: linear vs binary cho 73, 1, 100 trên list 1–100.

## Challenge
List 1 triệu số — binary search mất mấy bước?

## Mistakes
`lo < hi` thay vì `<=` — sót phần tử cuối. Bố: “Còn 1 số thì có kiểm tra không?”
Dùng trên list chưa sort. Bố: “Điều kiện bắt buộc?”

## Check
1. Vì sao list phải sort?
2. 100 số tối đa mấy bước?
3. mid tính thế nào?

## Homework
- [ ] Tìm một từ trong từ điển giấy bằng cách mở giữa — đếm số lần mở.

## Pass
Tìm 1 số + nói vì sao list phải sort.

## Next
L111 Bubble Sort — Python.

---

# L111 — Bubble Sort

## Objective
Con viết bubble sort bằng Python, đếm số lần swap, dừng sớm khi không còn swap.

## Parent prep
6 thẻ số trên giấy. Project Scratch L56 để so. Thonny.

## Story
**Bố nói:** “Con còn nhớ bong bóng nổi lên ở L56? Hôm nay con viết lại bằng Python — ngắn hơn nhiều, và con sẽ thêm một mẹo: không có bong bóng nào nổi thì dừng.”

## Ask
- Một lượt bubble làm gì?
- Khi nào dừng sớm được?
- Swap trong Python viết ngắn thế nào?

## Unplugged
Con sort 6 thẻ trên giấy, đếm swap mỗi lượt. Lượt nào 0 swap → dừng.

## Explain
Hai vòng for. Vòng trong so `xs[j]` và `xs[j+1]`.
Swap: `xs[j], xs[j+1] = xs[j+1], xs[j]`.
Biến `swapped` để dừng sớm.

## Build
```python
def bubble(xs):
    xs = xs[:]
    swaps = 0
    for i in range(len(xs) - 1):
        swapped = False
        for j in range(len(xs) - 1 - i):
            if xs[j] > xs[j + 1]:
                xs[j], xs[j + 1] = xs[j + 1], xs[j]
                swaps += 1
                swapped = True
        if not swapped:
            break
    return xs, swaps

print(bubble([5, 1, 4, 2, 8, 3]))
```

## Practice
List 10 số random, list đã sort sẵn (swap = 0), list ngược.

## Challenge
Vì sao `len(xs) - 1 - i`? (cuối đã cố định)

## Mistakes
`range(len(xs))` ở vòng trong → IndexError ở j+1. Bố: “Cặp cuối là cặp nào?”
Sửa list gốc khi không muốn. Bố: “`xs[:]` để làm gì?”

## Check
1. Dừng sớm khi nào?
2. List ngược swap nhiều hay ít?
3. Swap kiểu Python?

## Homework
- [ ] Sort 6 thẻ tay, ghi số swap. So với chương trình.

## Pass
Sort đúng 10 số + đếm swap.

## Next
L112 Selection Sort — Python.

---

# L112 — Selection Sort

## Objective
Con viết selection sort Python, đếm swap và so với bubble (1 khác biệt).

## Parent prep
Kết quả bubble hôm qua. 6 thẻ. Thonny.

## Story
**Bố nói:** “Hôm qua bong bóng nổi lên. Hôm nay mỗi lượt con **chọn** người nhỏ nhất đưa lên đầu — như chọn đội bóng ở L57.”

## Ask
- Mỗi lượt có mấy swap?
- So với bubble, swap nhiều hay ít?
- Dùng lại algorithm nào?

## Unplugged
Con sort 6 thẻ bằng selection, đếm swap. So với số swap bubble trên cùng thẻ.

## Explain
Lượt i: tìm vị trí min trong `xs[i:]`, swap với `xs[i]`.
Tối đa n−1 swap.
Số lần so như bubble (~n²/2).

## Build
```python
def selection(xs):
    xs = xs[:]
    swaps = 0
    for i in range(len(xs) - 1):
        m = i
        for j in range(i + 1, len(xs)):
            if xs[j] < xs[m]:
                m = j
        if m != i:
            xs[i], xs[m] = xs[m], xs[i]
            swaps += 1
    return xs, swaps

print(selection([5, 1, 4, 2, 8, 3]))
```

## Practice
Chạy bubble và selection trên cùng 3 list, ghi bảng swap.

## Challenge
Sort giảm dần bằng selection — đổi 1 dấu.

## Mistakes
Tìm min từ 0 mỗi lượt. Bố: “Phần đầu đã xếp rồi.”

## Check
1. Selection mỗi lượt swap mấy lần?
2. Khác bubble ở đâu (1 câu)?
3. List đã sort: selection có dừng sớm không?

## Homework
- [ ] Giải thích bằng lời cho mẹ sự khác nhau bubble vs selection.

## Pass
Sort đúng + nói 1 khác biệt so với bubble.

## Next
L113 Insertion Sort — Python.

---

# L113 — Insertion Sort

## Objective
Con viết insertion sort Python, thấy nó rất nhanh với list **gần sort**.

## Parent prep
Bộ bài. Thonny.

## Story
**Bố nói:** “Chơi bài: bốc lá nào chèn lá đó vào đúng chỗ (L58). Nếu bài trên tay gần đúng thứ tự rồi, con gần như không phải làm gì.”

## Ask
- Phần nào luôn đã sort?
- List gần sort thì insertion nhanh hay chậm?
- Khác selection ở đâu?

## Unplugged
Con sort 7 lá bài bằng insertion, đếm số lần dịch lá. Thử với bài gần đúng thứ tự.

## Explain
Lấy `key = xs[i]`, dịch các phần tử lớn hơn sang phải, đặt key vào chỗ trống.
List gần sort: ~n bước. List ngược: ~n²/2.

## Build
```python
def insertion(xs):
    xs = xs[:]
    shifts = 0
    for i in range(1, len(xs)):
        key = xs[i]
        j = i - 1
        while j >= 0 and xs[j] > key:
            xs[j + 1] = xs[j]
            j -= 1
            shifts += 1
        xs[j + 1] = key
    return xs, shifts

print(insertion([5, 1, 4, 2, 8, 3]))
print(insertion([1, 2, 3, 5, 4, 6]))
```

## Practice
Bảng: bubble / selection / insertion trên list random, gần sort, ngược.

## Challenge
Vì sao insertion thắng ở list gần sort? Nói bằng ví dụ bài.

## Mistakes
Quên lưu key trước khi dịch → mất giá trị. Bố: “Lá đang cầm để đâu?”

## Check
1. Insertion nhanh nhất khi nào?
2. Bảng 3 sort — ai ít việc nhất với list gần sort?
3. 1 khác biệt so với selection?

## Homework
- [ ] Sắp xếp kệ sách đã gần đúng bằng cách “chèn” — đếm số cuốn phải dời.

## Pass
Sort đúng + 1 khác biệt so với bài trước.

## Next
L114 Merge Sort — chia đôi và trộn.

---

# L114 — Merge Sort

## Objective
Con hiểu merge sort: chia đôi tới khi còn 1, rồi **trộn** hai list đã sort. Pass tối thiểu: viết hàm `merge`.

## Parent prep
8 lá bài. Hai người (bố + con) mỗi người cầm 4 lá đã sort. Thonny.

## Story
**Bố nói:** “Sắp xếp 8 lá khó. Nhưng 1 lá thì luôn ‘đã sort’. Merge sort chia nhỏ tới 1 lá, rồi ghép lại thật khéo: hai chồng đã sort trộn thành một chồng sort.”

## Ask
- 1 lá đã sort chưa?
- Trộn 2 chồng đã sort: so lá nào với lá nào?
- Chia đôi 8 lá mấy lần thì còn 1?

## Unplugged
Bố và con mỗi người cầm 4 lá đã sort (ngửa lá nhỏ nhất). So 2 lá trên cùng, lá nhỏ hơn đặt vào chồng chung. Lặp tới hết.
Vẽ cây chia đôi: 8 → 4+4 → 2+2+2+2 → 1×8.

## Explain
`merge(a, b)`: hai con trỏ, mỗi lần lấy phần tử nhỏ hơn.
Merge sort = chia đôi (đệ quy) + merge.
Nhanh: O(n log n).

## Build
```python
def merge(a, b):
    out = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    return out + a[i:] + b[j:]

def merge_sort(xs):
    if len(xs) <= 1:
        return xs
    mid = len(xs) // 2
    return merge(merge_sort(xs[:mid]), merge_sort(xs[mid:]))

print(merge([1, 4, 7], [2, 3, 9]))
print(merge_sort([5, 1, 4, 2, 8, 3, 7, 6]))
```

## Practice
Test merge với list rỗng, list 1 phần tử, list trùng số.

## Challenge
Merge sort đệ quy đầy đủ (nếu đệ quy khó, để sau L116).

## Mistakes
Quên nối phần còn lại `a[i:] + b[j:]`. Bố: “Hết chồng bố thì chồng con đi đâu?”

## Check
1. Merge làm gì?
2. Vì sao chia tới 1?
3. So với bubble: list 1000 số, ai nhanh hơn?

## Homework
- [ ] Trộn 2 chồng bài đã sort với mẹ (mỗi người 5 lá).

## Pass
Hàm `merge` đúng (recursive = Challenge).

## Next
L115 Quick Sort — chọn pivot.

---

# L115 — Quick Sort

## Objective
Con hiểu quick sort: chọn **pivot**, chia trái nhỏ phải lớn. Pass: 1 lượt partition đúng.

## Parent prep
6 thú bông khác chiều cao (hoặc thẻ số). Thonny.

## Story
**Bố nói:** “Chọn một bạn làm ‘cột mốc’. Ai thấp hơn đứng bên trái, cao hơn đứng bên phải. Rồi làm lại với từng bên. Đó là **quick sort**.”

## Ask
- Pivot là gì?
- Sau 1 lượt, pivot đứng đúng chỗ chưa?
- Hai bên làm tiếp thế nào?

## Unplugged
Con chọn thú bông đầu làm pivot. Chia trái nhỏ, phải lớn. Pivot đứng giữa — đã đúng chỗ!
Làm tiếp với nhóm trái, nhóm phải.

## Explain
Partition: dùng pivot chia 3 nhóm: nhỏ hơn, bằng, lớn hơn.
Quick sort = partition + đệ quy 2 bên.
Thường rất nhanh; pivot tệ thì chậm.

## Build
```python
def partition(xs):
    pivot = xs[0]
    left = [x for x in xs[1:] if x < pivot]
    right = [x for x in xs[1:] if x >= pivot]
    return left, pivot, right

def quick(xs):
    if len(xs) <= 1:
        return xs
    left, pivot, right = partition(xs)
    return quick(left) + [pivot] + quick(right)

print(partition([5, 1, 4, 2, 8, 3]))
print(quick([5, 1, 4, 2, 8, 3]))
```

## Practice
Partition với pivot khác nhau. Pivot là số nhỏ nhất thì sao?

## Challenge
Quick sort đầy đủ (đệ quy).

## Mistakes
Bỏ quên pivot khi ghép. Bố: “Cột mốc đứng đâu?”
Số bằng pivot bị mất. Bố: “Đặt bên nào?”

## Check
1. Pivot sau 1 lượt ở đâu?
2. Pivot xấu làm gì?
3. Merge và quick khác nhau 1 câu?

## Homework
- [ ] Xếp 6 người theo chiều cao bằng quick sort (chọn 1 người làm mốc).

## Pass
1 round partition đúng (full quicksort = Challenge).

## Next
L116 Recursion — hàm gọi chính nó.

---

# L116 — Recursion

## Objective
Con viết hàm đệ quy `fact(n)` có **điểm dừng** (base case), vẽ chồng lời gọi.

## Parent prep
Búp bê Nga (Matryoshka) hoặc các hộp lồng nhau. Thonny.

## Story
**Bố nói:** “Mở búp bê to thấy búp bê nhỏ hơn, mở nữa thấy nhỏ hơn nữa… tới búp bê nhỏ nhất không mở được. Hàm đệ quy cũng vậy: gọi chính nó với bài nhỏ hơn, tới khi gặp bài nhỏ nhất.”

## Ask
- Búp bê nhỏ nhất là gì? (base case)
- `fact(5) = 5 × fact(4)` — fact(4) là gì?
- Không có búp bê nhỏ nhất thì sao?

## Unplugged
Con mở búp bê, nói to: “fact(5) = 5 × fact(4)… fact(1) = 1.” Rồi đóng lại, nhân dần: 1 → 2 → 6 → 24 → 120.
Vẽ chồng đĩa lời gọi.

## Explain
Đệ quy = hàm gọi chính nó.
Phải có base case (`n == 1`), nếu không → RecursionError.
Mỗi lời gọi chờ lời gọi bên trong trả về.

## Build
```python
def fact(n):
    if n == 1:
        return 1
    return n * fact(n - 1)

print(fact(5))

def countdown(n):
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    countdown(n - 1)

countdown(3)
```

## Practice
`sum_to(n)` = 1 + 2 + … + n bằng đệ quy.

## Challenge
Đếm số búp bê: `count(box)` với list lồng `[1, [2, [3]]]`.

## Mistakes
Quên base case → RecursionError. Bố: “Búp bê nhỏ nhất đâu?”
`fact(n)` gọi `fact(n)` (không nhỏ đi). Bố: “Bài có nhỏ hơn không?”

## Check
1. Base case là gì?
2. fact(4) = ?
3. Vẽ chồng gọi của fact(3).

## Homework
- [ ] Vẽ hình “gương trong gương” và giải thích base case.

## Pass
fact(5) = 120. Con nói được lỗi “quên đáy”.

## Next
L117 Backtracking — thử, sai thì lùi.

---

# L117 — Backtracking

Project: Maze Solver (mini)

## Objective
Con giải mê cung 4×4 bằng backtracking: thử 4 hướng, sai thì lùi.

## Parent prep
Mê cung 4×4 trên giấy ô (bố vẽ). Bút chì + tẩy. Thonny.

## Story
**Bố nói:** “Đi mê cung thật: con thử một lối. Cụt thì quay lại ngã rẽ, thử lối khác. Thử — sai — lùi — thử. Máy tính gọi đó là **backtracking**, và nó dùng đệ quy.”

## Ask
- Từ một ô có mấy hướng?
- Cụt thì làm gì?
- Đánh dấu ô đã đi để làm gì?

## Unplugged
Con đi bút chì, cụt thì tẩy lùi về ngã rẽ. Đếm số lần lùi.

```
S . # .
# . # .
. . . #
# # . E
```

## Explain
Hàm `solve(r, c)`: ngoài lưới / tường / đã đi → False. Là đích → True.
Đánh dấu, thử 4 hướng. Không hướng nào được → bỏ đánh dấu (lùi), trả False.

## Build
```python
maze = ["S.#.",
        "#.#.",
        "...#",
        "##.E"]
seen = set()

def solve(r, c):
    if r < 0 or c < 0 or r >= 4 or c >= 4:
        return False
    if maze[r][c] == "#" or (r, c) in seen:
        return False
    if maze[r][c] == "E":
        return True
    seen.add((r, c))
    for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
        if solve(r + dr, c + dc):
            print(r, c)
            return True
    return False

print(solve(0, 0))
```

## Practice
Vẽ mê cung khác, chạy lại.

## Challenge
In mê cung với đường đi đánh dấu `*`.

## Mistakes
Không đánh dấu đã đi → đi vòng mãi. Bố: “Ô này đã tới chưa?”

## Check
1. Backtracking làm gì khi cụt?
2. Base case của solve?
3. Vì sao cần `seen`?

## Homework
- [ ] Giải 2 mê cung trong sách bằng cách đánh dấu chỗ lùi.

## Pass
1 mê cung tìm được đường (tay hoặc code).

## Next
L118 BFS Path — đường ngắn nhất.

---

# L118 — BFS Path

## Objective
Con dùng BFS + nhớ **parent** để in đường đi ít bước nhất.

## Parent prep
Graph L106 trên giấy. Thẻ “đến từ đâu”. Thonny.

## Story
**Bố nói:** “Sóng nước BFS lan ra từng vòng. Nếu mỗi nút nhớ ‘sóng tới từ đâu’, khi chạm đích ta đi ngược lại là ra đường ngắn nhất.”

## Ask
- BFS thăm theo thứ tự nào?
- Nhớ parent để làm gì?
- Đường in ra ngược hay xuôi?

## Unplugged
Con BFS từ A, mỗi khi thêm nút mới ghi thẻ “đến từ X”. Tới E, đi ngược thẻ: E ← B ← A. Đảo lại.

## Explain
`parent[nb] = node` khi thêm nb vào queue.
Tới đích → lần ngược parent → đảo list.
BFS cho đường ít **cạnh** nhất.

## Build
```python
from collections import deque

graph = {"A": ["B", "C"], "B": ["A", "D", "E"], "C": ["A", "E"], "D": ["B"], "E": ["B", "C"]}

def bfs_path(start, goal):
    parent = {start: None}
    q = deque([start])
    while q:
        node = q.popleft()
        if node == goal:
            break
        for nb in graph[node]:
            if nb not in parent:
                parent[nb] = node
                q.append(nb)
    path = []
    node = goal
    while node is not None:
        path.append(node)
        node = parent[node]
    return path[::-1]

print(bfs_path("A", "D"))
```

## Practice
Đường A → E, D → C.

## Challenge
BFS trên lưới mê cung L117 — in đường ngắn nhất.

## Mistakes
Quên đảo ngược path. Bố: “Đường đi từ A hay từ D?”

## Check
1. parent lưu gì?
2. Đường A → D?
3. Vì sao BFS ra đường ít cạnh nhất?

## Homework
- [ ] Tìm đường ít trạm nhất trên bản đồ xe buýt giấy (bố vẽ).

## Pass
Đường ngắn (ít cạnh) đúng trên graph nhỏ.

## Next
L119 DFS Path — đường bằng DFS.

---

# L119 — DFS Path

## Objective
Con tìm đường bằng DFS trên cùng graph, so với BFS: đường có thể dài hơn.

## Parent prep
Graph L118. Kết quả BFS hôm qua. Thonny.

## Story
**Bố nói:** “DFS đi sâu một lối tới cùng. Nó tìm được đường — nhưng chưa chắc ngắn nhất. Hôm nay mình so hai cách.”

## Ask
- DFS có chắc ra đường ngắn nhất không?
- Khi nào DFS vẫn hữu ích? (chỉ cần có đường, ít bộ nhớ)
- Đường DFS A → E là gì?

## Unplugged
Con DFS bằng tay trên graph, ghi đường tìm được. Đặt cạnh đường BFS. Đếm cạnh.

## Explain
DFS path: đệ quy, thêm nút vào path, gặp đích thì trả về.
BFS: ít cạnh nhất (khi mỗi cạnh = 1 bước). DFS: có đường, chưa chắc ngắn.

## Build
```python
graph = {"A": ["B", "C"], "B": ["A", "D", "E"], "C": ["A", "E"], "D": ["B"], "E": ["B", "C"]}

def dfs_path(node, goal, path, seen):
    path.append(node)
    seen.add(node)
    if node == goal:
        return path
    for nb in graph[node]:
        if nb not in seen:
            found = dfs_path(nb, goal, path, seen)
            if found:
                return found
    path.pop()
    return None

print(dfs_path("A", "E", [], set()))
```

## Practice
Đổi thứ tự hàng xóm trong graph — đường DFS đổi không? BFS đổi không?

## Challenge
Tìm graph mà DFS ra đường dài hơn BFS rõ ràng.

## Mistakes
Quên `path.pop()` khi lùi → đường có nút thừa. Bố: “Lùi rồi có bỏ nút không?”

## Check
1. So 2 đường A → E.
2. BFS tốt hơn khi nào?
3. DFS tốt khi nào?

## Homework
- [ ] Vẽ 1 graph 6 nút, tìm đường bằng cả BFS và DFS trên giấy.

## Pass
So 2 đường, nói BFS tốt khi mỗi cạnh = 1 bước.

## Next
L120 Algorithm Challenge — checkpoint Level 9.

---

# L120 — Algorithm Challenge

## Objective
Con nhận 3 problem, **chọn** algorithm đúng cho mỗi cái, giải thích vì sao, code 1 trong 3. Checkpoint Level 9.

## Parent prep
3 thẻ problem: (1) tìm tên trong danh bạ đã sort · (2) sort bảng điểm 20 bạn · (3) đường đi ít trạm giữa 4 nhà. Coding Passport mở.

## Story
**Bố nói:** “Thợ giỏi không chỉ biết dùng búa — họ biết **chọn** đúng dụng cụ. Hôm nay con là thợ: bố đưa việc, con chọn dụng cụ.”

## Ask
- Danh bạ đã sort — dùng gì?
- Sort 20 số — dùng sort nào, vì sao?
- Đường ít trạm — BFS hay DFS?

## Spec [6]
Con viết cho mỗi problem: tên algorithm + 1 câu vì sao + độ nhanh (n, log n, n²).

## Build [25]
Con chọn 1 problem, viết code từ giấy, test 3 case.

## Test [6]
3 test cho code. Trình bày 2 problem còn lại bằng lời.

## Mistakes
Chọn linear cho danh bạ sort. Bố: “Đã sort thì có cách nào nhanh hơn?”
Chọn DFS cho đường ngắn nhất. Bố: “DFS có chắc ngắn nhất không?”

## Check
1. Câu cổng: “Mỗi problem có algorithm phù hợp.”
2. Algorithm nào nhanh nhất con biết để tìm?
3. Để sort?

## Homework
- [ ] Viết bảng “dụng cụ”: 6 algorithm, mỗi cái dùng khi nào.

## Pass
Chọn đúng 3/3, code 1/3 chạy → tick **Algorithm Explorer**.

## Next
L121 Big-O intuition — Level 10 Advanced.
