# L8 — Data Structures

Giấy trước, Python sau. Ví dụ đời sống bắt buộc. Cổng L108. Badge Data Structure Explorer.

---

# L97 — Array/List

## Objective
Con hiểu list là **các ô liền nhau**: lấy ô theo index rất nhanh, chèn giữa thì chậm (phải dời).

## Parent prep
Hộp trứng 10 ô (hoặc 10 cốc liền). 10 viên bi. Thonny.

## Story
**Bố nói:** “Hôm nay bắt đầu học **cấu trúc dữ liệu** — cách sắp xếp đồ để tìm nhanh. Cái đầu tiên con đã biết: list. Nhưng hôm nay con nhìn nó như kỹ sư: cái gì nhanh, cái gì chậm.”

## Ask
- Lấy viên bi ở ô số 7 mất mấy bước?
- Chèn viên bi mới vào ô đầu thì các viên khác làm gì?
- Thêm vào cuối có phải dời viên nào không?

## Unplugged
Con lấy bi ô 7: chỉ 1 bước (biết vị trí là tới thẳng).
Con chèn bi vào ô 0: phải dời **tất cả** sang phải. Đếm số lần dời.
Thêm vào cuối: 0 lần dời.

## Explain
List = ô liền nhau, mỗi ô có index.
Đọc `a[i]`: nhanh (1 bước).
`insert(0, x)`: chậm (dời n ô). `append`: nhanh.

## Build
```python
a = [10, 20, 30, 40, 50]
print(a[len(a) // 2])
a.append(60)
a.insert(0, 5)
print(a)
moves = len(a) - 1
print("Insert at 0 moved about", moves, "items")
```

## Practice
In phần tử giữa của list chẵn và lẻ phần tử. Đếm “số lần dời” khi insert ở giữa.

## Challenge
Đo thời gian: `insert(0, x)` 10000 lần vs `append(x)` 10000 lần (`import time`).

## Mistakes
Nghĩ chèn đầu cũng nhanh như cuối. Bố: “Đếm bi phải dời.”
Phần tử giữa của list chẵn — chọn ô nào? Bố: “Dùng `//` và nói rõ.”

## Check
1. Đọc `a[7]` mất mấy bước?
2. Vì sao insert(0) chậm?
3. Ví dụ đời sống của list?

## Homework
- [ ] Tìm 2 thứ trong nhà xếp “ô liền nhau” (hộp trứng, kệ giày) và nói lấy món thứ 3 thế nào.

## Pass
In phần tử giữa đúng, giải thích chèn đầu chậm.

## Next
L98 Stack — chồng đĩa.

---

# L98 — Stack

## Objective
Con hiểu stack = **vào sau ra trước** (LIFO). Dùng `append` (push) và `pop`.

## Parent prep
5 cái đĩa nhựa (hoặc sách). Thonny.

## Story
**Bố nói:** “Rửa bát xong con chồng đĩa lên. Lấy ra dùng thì lấy đĩa nào? Đĩa trên cùng — cái vừa đặt sau cùng. Đó là **stack**.”

## Ask
- Đĩa đặt đầu tiên lấy ra lúc nào?
- Nút “Back” trên trình duyệt quay về trang nào?
- Ctrl+Z (undo) hủy việc nào trước?

## Unplugged
Con push đĩa A, B, C. Pop: C, B, A. Viết thứ tự ra giấy.
Bố hỏi: “Muốn lấy A ngay được không?” (phải lấy hết C, B trước).

## Explain
Push = đặt lên đỉnh. Pop = lấy đỉnh.
LIFO: Last In, First Out.
Python: `stack.append(x)`, `stack.pop()`, xem đỉnh `stack[-1]`.

## Build
```python
stack = []
stack.append("A")
stack.append("B")
stack.append("C")
print(stack)
print(stack.pop())
print(stack.pop())
print(stack)
```

## Practice
Undo đơn giản: gõ từ, “undo” xóa từ gõ gần nhất.

## Challenge
Kiểm tra ngoặc: “(()())” đúng, “(()” sai — push khi “(”, pop khi “)”.

## Mistakes
Dùng `pop(0)` — lấy đáy, không phải stack. Bố: “Đĩa dưới cùng rút ra được không?”
Pop stack rỗng → IndexError. Bố: “Còn đĩa không?”

## Check
1. LIFO nghĩa là gì?
2. Push A B C, pop 2 lần — còn gì?
3. Ví dụ đời sống?

## Homework
- [ ] Ghi 3 thứ hoạt động như stack (chồng sách, hộp Pringles…).

## Pass
3 đĩa, lấy ra đúng thứ tự ngược.

## Next
L99 Queue — xếp hàng.

---

# L99 — Queue

## Objective
Con hiểu queue = **vào trước ra trước** (FIFO). Dùng `deque`.

## Parent prep
3 thú bông xếp hàng. Thonny.

## Story
**Bố nói:** “Xếp hàng mua kem: ai tới trước được mua trước. Không ai chen ngang. Đó là **queue** — ngược với stack.”

## Ask
- Người vào hàng đứng ở đâu?
- Ai được phục vụ trước?
- Máy in nhiều tờ in tờ nào trước?

## Unplugged
Thú bông A, B, C vào hàng (cuối). Phục vụ: A, B, C (đầu).
So với stack hôm qua: ghi 2 cột LIFO / FIFO.

## Explain
Enqueue = vào cuối. Dequeue = ra đầu.
`list.pop(0)` làm được nhưng chậm (dời mọi người — nhớ L97).
`collections.deque`: `append` + `popleft` nhanh.

## Build
```python
from collections import deque

q = deque()
q.append("A")
q.append("B")
q.append("C")
print(q.popleft())
print(q.popleft())
print(q)
```

## Practice
Mô phỏng quầy kem: 5 khách vào, mỗi lượt phục vụ 1, in hàng còn lại.

## Challenge
Hàng ưu tiên: khách VIP đi vào đầu (`appendleft`). Còn là queue thuần không?

## Mistakes
Dùng `pop()` — lấy người cuối. Bố: “Người mới tới được mua trước à?”
Quên import deque. Bố: “Hộp đồ nghề nào?”

## Check
1. FIFO là gì?
2. Stack và queue khác nhau ở đâu?
3. Vì sao `pop(0)` chậm?

## Homework
- [ ] Quan sát một hàng người (siêu thị) và nói ai ra trước.

## Pass
3 người, vào trước ra trước đúng.

## Next
L100 Linked List — mỗi hộp nhớ hộp sau.

---

# L100 — Linked List

## Objective
Con hiểu linked list: mỗi nút chứa **giá trị** + **chỉ đường tới nút sau**. Đi từ đầu in hết.

## Parent prep
3 tờ giấy: Apple, Banana, Orange. Sợi len nối giữa. Đặt rải rác trong phòng (không cạnh nhau). Thonny.

## Story
**Bố nói:** “Trò truy tìm kho báu: mỗi tờ giấy ghi một món và chỗ giấu tờ tiếp theo. Các tờ không cần nằm cạnh nhau — chỉ cần biết đường. Đó là **linked list**.”

## Ask
- Muốn tới Orange phải đi qua đâu?
- Tờ cuối chỉ đến đâu? (không đâu — None)
- So với list ô liền nhau: lấy món thứ 3 nhanh hay chậm?

## Unplugged
Con đi theo sợi len từ Apple → Banana → Orange, đọc to.
Chèn Mango sau Apple: chỉ cần đổi 2 sợi len (không dời ai). So với L97!

## Explain
Node = (value, next). Head = nút đầu.
Đi: bắt đầu head, lặp tới khi next là None.
Chèn giữa nhanh (đổi dây). Tìm thứ i chậm (phải đi).

## Build
```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node("Apple")
b = Node("Banana")
c = Node("Orange")
a.next = b
b.next = c

node = a
while node is not None:
    print(node.value)
    node = node.next
```

## Practice
Thêm Mango vào giữa Apple và Banana bằng cách đổi `next`. In lại.

## Challenge
Đếm số nút bằng vòng while.

## Mistakes
Quên `node = node.next` → loop vô hạn. Bố: “Con có bước sang tờ sau không?”
Mất head khi chèn. Bố: “Giữ tờ đầu trong tay.”

## Check
1. Mỗi nút chứa gì?
2. Khi nào dừng đi?
3. Linked list nhanh ở việc gì, chậm ở việc gì?

## Homework
- [ ] Làm trò truy tìm kho báu 4 tờ cho em/bạn.

## Pass
Đi từ đầu in đủ 3 trái cây.

## Next
L101 Tree — cây gia phả.

---

# L101 — Tree

## Objective
Con hiểu tree: một gốc (root), mỗi nút có con (child), nút không con là lá (leaf).

## Parent prep
Ảnh gia đình 3 đời (ông bà, bố mẹ cô chú, con). Giấy A3. Thư mục máy tính có thư mục con.

## Story
**Bố nói:** “Gia phả nhà mình là một cái cây úp ngược: ông bà ở trên cùng, con cháu tỏa xuống. Máy tính dùng cây ở khắp nơi — thư mục trong thư mục cũng là cây.”

## Ask
- Ai là gốc trong gia phả?
- Con của bố là ai?
- Ai không có con (lá)?

## Unplugged
Con vẽ gia phả 3 đời lên A3. Khoanh root, đánh dấu leaf.
Mở File Explorer: chỉ thư mục cha và con.

```
        Ông bà
       /      \
     Bố        Cô
    /  \
  Con   Em
```

## Explain
Root = gốc, parent = cha, child = con, leaf = lá.
Mỗi nút (trừ root) có đúng **một** parent.
Cây không có vòng tròn.

## Build
```python
family = {
    "Grandpa": ["Dad", "Aunt"],
    "Dad": ["Nam", "Lan"],
    "Aunt": [],
    "Nam": [],
    "Lan": [],
}
print("Children of Dad:", family["Dad"])
for person in family:
    if family[person] == []:
        print(person, "is a leaf")
```

## Practice
Vẽ cây 4 nút bất kỳ, chỉ parent/child. Thêm một cháu vào dict.

## Challenge
In cây bằng đệ quy với thụt lề (bố gợi ý cấu trúc, con hoàn thành).

## Mistakes
Một nút có 2 parent — không còn là cây. Bố: “Con có 2 bố không?”
Vẽ vòng tròn. Bố: “Cây có mọc vòng lại không?”

## Check
1. Root là gì?
2. Leaf là gì?
3. Ví dụ cây trong máy tính?

## Homework
- [ ] Vẽ cây thư mục trong máy tính của con (3 tầng).

## Pass
Vẽ cây 4 nút, chỉ đúng parent/child.

## Next
L102 Binary Tree — mỗi nút tối đa 2 con.

---

# L102 — Binary Tree

## Objective
Con nhận ra binary tree: mỗi nút **tối đa 2 con** (left, right).

## Parent prep
Thẻ giấy + dây để làm cây. 2 cây vẽ sẵn: một binary, một có nút 3 con.

## Story
**Bố nói:** “Trò chơi ‘Đúng hay Sai’ để đoán con vật: mỗi câu hỏi có 2 nhánh. Cây chỉ có 2 nhánh mỗi chỗ gọi là **binary tree**.”

## Ask
- Mỗi nút có tối đa mấy con?
- Nút có 3 con có phải binary không?
- Câu hỏi có/không giống binary tree chỗ nào?

## Unplugged
Con xây cây đoán con vật: “Biết bay?” → có: “Biết nói?” (vẹt / đại bàng) · không: “Sống dưới nước?” (cá / chó).
Con chỉ cây nào không phải binary trong 2 cây vẽ sẵn.

## Explain
Binary tree: mỗi nút có `left` và `right` (có thể None).
Cây đoán con vật = **decision tree**.

## Build
```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode("Can fly?")
root.left = TreeNode("Parrot")
root.right = TreeNode("Dog")

answer = input(root.value + " (y/n) ")
if answer == "y":
    print("It's a", root.left.value)
else:
    print("It's a", root.right.value)
```

## Practice
Thêm 1 tầng câu hỏi (4 con vật).

## Challenge
Đếm số nút bằng đệ quy: `count(node) = 1 + count(left) + count(right)`.

## Mistakes
Gắn 3 con vào một nút. Bố: “Binary có mấy nhánh?”
Truy cập `.left` của None → lỗi. Bố: “Nút đó có con không?”

## Check
1. Binary tree khác tree thường ở đâu?
2. Vẽ 1 cây không phải binary.
3. Decision tree dùng làm gì?

## Homework
- [ ] Làm cây đoán 8 con vật trên giấy, đố mẹ.

## Pass
Vẽ binary tree; chỉ ra nút 3 con thì **không** phải binary.

## Next
L103 BST — trái nhỏ, phải lớn.

---

# L103 — BST

## Objective
Con xây binary search tree (trái nhỏ hơn, phải lớn hơn) và tìm số **không cần đi hết**.

## Parent prep
Thẻ số 8, 3, 10, 1, 6, 14. Băng keo vẽ cây trên sàn.

## Story
**Bố nói:** “Thủ thư xếp sách: nhỏ hơn đi trái, lớn hơn đi phải. Muốn tìm sách nào, mỗi bước bỏ được nửa cây. Đó là **BST**.”

## Ask
- Root là 8, số 3 đi đâu?
- Tìm 1 cần so mấy lần?
- So với linear search (L52)?

## Unplugged
Con cắm thẻ theo thứ tự 8, 3, 10, 1, 6, 14 lên sàn: so với nút, nhỏ trái lớn phải.
Tìm 6: 8 → trái 3 → phải 6. 3 lần so. Tìm 7: 8 → 3 → 6 → phải trống → không có.

## Explain
BST: mọi nút trái < nút < mọi nút phải.
Tìm: so, đi trái hoặc phải, không quay lại.
Giống ý binary search (L110 sẽ học trên list).

## Build
```python
class Node:
    def __init__(self, v):
        self.v = v
        self.left = None
        self.right = None

def insert(root, v):
    if root is None:
        return Node(v)
    if v < root.v:
        root.left = insert(root.left, v)
    else:
        root.right = insert(root.right, v)
    return root

def find(root, v):
    steps = 0
    while root is not None:
        steps += 1
        if v == root.v:
            return steps
        root = root.left if v < root.v else root.right
    return -1

root = None
for v in [8, 3, 10, 1, 6, 14]:
    root = insert(root, v)
print(find(root, 6), find(root, 7))
```

## Practice
Tìm 1, 14, 7. Đếm số bước mỗi lần.

## Challenge
Chèn 1, 2, 3, 4, 5 theo thứ tự — cây thành gì? (một đường thẳng — BST hết nhanh).

## Mistakes
Đặt số nhỏ bên phải. Bố: “Luật thủ thư?”
Đi hết cây khi tìm. Bố: “Đã biết bên nào không có rồi mà?”

## Check
1. Luật BST?
2. Tìm 6 so mấy lần?
3. Vì sao nhanh hơn đi hết?

## Homework
- [ ] Chơi “đoán số” bằng BST giấy với mẹ: mỗi câu hỏi “nhỏ hơn 8?”.

## Pass
Tìm 1 bằng so sánh, không đi hết cây.

## Next
L104 Heap — lấy cái lớn nhất trước.

---

# L104 — Heap

## Objective
Con hiểu ý tưởng heap / priority queue: luôn lấy phần tử **ưu tiên nhất** trước. Dùng `heapq`.

## Parent prep
Rổ 5 thẻ điểm: 7, 3, 9, 5, 8. Thonny.

## Story
**Bố nói:** “Phòng cấp cứu không phục vụ theo thứ tự đến — ai nặng nhất được khám trước. Cấu trúc giúp luôn lấy ‘quan trọng nhất’ thật nhanh gọi là **heap**.”

## Ask
- Queue phục vụ ai trước? Heap phục vụ ai trước?
- Rút max 3 lần ra những số nào?
- Mỗi lần tìm max trong list mất bao lâu? (đi hết)

## Unplugged
Con rút thẻ lớn nhất khỏi rổ 3 lần: 9, 8, 7. Mỗi lần phải nhìn hết rổ.
Bố nói: “Heap sắp xếp khéo để không phải nhìn hết.”

## Explain
Priority queue = lấy ưu tiên nhất trước.
`max(list)` + `remove` đúng nhưng chậm (đi hết mỗi lần).
`heapq` lấy **nhỏ nhất** nhanh. Muốn lớn nhất: lưu số âm.

## Build
```python
import heapq

scores = [7, 3, 9, 5, 8]
slow = scores[:]
for _ in range(3):
    m = max(slow)
    slow.remove(m)
    print("slow:", m)

heap = [-s for s in scores]
heapq.heapify(heap)
for _ in range(3):
    print("heap:", -heapq.heappop(heap))
```

## Practice
Hàng cấp cứu: (mức độ, tên). Lấy theo mức độ cao nhất.

## Challenge
Đo thời gian 2 cách với 10000 số, rút 100 lần.

## Mistakes
Quên heapq lấy nhỏ nhất. Bố: “Ra 3 hay 9? Muốn lớn nhất làm sao?”
Không bắt con tự code heapify. Bố chỉ dùng thư viện.

## Check
1. Heap phục vụ ai trước?
2. Vì sao dùng số âm?
3. Ví dụ đời sống?

## Homework
- [ ] Viết danh sách 5 việc + mức quan trọng, sắp theo cách heap (quan trọng nhất trước).

## Pass
5 điểm, 3 lần rút max đúng; con nói “heap nhanh hơn đi hết”.

## Next
L105 Hash Map — tra cứu tức thì.

---

# L105 — Hash Map

## Objective
Con hiểu hash map (dict) tra cứu **không cần quét**: tên → chỗ ngồi ngay lập tức.

## Parent prep
Tủ có ngăn dán chữ cái A–Z (hoặc 26 phong bì). 4 thẻ học sinh. Thonny.

## Story
**Bố nói:** “Tìm thẻ của bạn An trong chồng 100 thẻ — phải lật từng cái. Nhưng nếu có tủ ngăn chữ cái, con mở ngay ngăn A. Máy tính làm phép ‘chọn ngăn’ đó gọi là **hash**.”

## Ask
- Tìm trong list 100 tên mất bao lâu?
- Tìm trong tủ ngăn chữ cái mất bao lâu?
- Dict trong Python có phải hash map không? (có)

## Unplugged
Con bỏ 4 thẻ tên vào ngăn theo chữ cái đầu. Bố hỏi “Bình ngồi đâu?” — con mở ngăn B ngay.
So: tìm trong chồng thẻ trộn — đếm số thẻ phải lật.

## Explain
Hash = công thức biến khóa thành “số ngăn”.
Dict dùng hash → `d[key]` gần như tức thì.
`key in d` nhanh, `x in list` chậm (quét).

## Build
```python
seats = {"An": 1, "Binh": 4, "Chi": 2, "Dung": 3}
name = input("Name: ")
print(name, "sits at", seats.get(name, "unknown"))

import time
big_list = list(range(1000000))
big_set = set(big_list)
t = time.time(); 999999 in big_list; print("list", time.time() - t)
t = time.time(); 999999 in big_set; print("set ", time.time() - t)
```

## Practice
Đếm tần suất chữ trong một câu bằng dict (L54 nhanh hơn).

## Challenge
Tự làm hash đơn giản: ngăn = `len(name) % 5`. Hai tên cùng ngăn thì sao? (collision)

## Mistakes
Quét dict bằng for để tìm khóa. Bố: “Mở ngăn thẳng được mà.”
Khóa không có → KeyError. Bố: “Dùng `.get`.”

## Check
1. Hash map tra cứu nhanh vì sao?
2. `in` với set và list khác nhau gì?
3. Collision là gì?

## Homework
- [ ] Sắp xếp bút màu vào hộp theo màu (mỗi màu một ngăn) — tìm màu đỏ mất mấy giây?

## Pass
4 học sinh, hỏi tên ra chỗ ngồi, không quét list.

## Next
L106 Graph — bản đồ thành phố.

---

# L106 — Graph

## Objective
Con biểu diễn graph (nút + cạnh) bằng dict of list, kể hàng xóm của một nút.

## Parent prep
Bản đồ giấy 5 “thành phố” A–E, vẽ đường nối. Len + thẻ. Thonny.

## Story
**Bố nói:** “Bản đồ xe buýt: các trạm nối nhau bằng tuyến. Mạng bạn bè: ai quen ai. Cả hai là **graph** — nút và cạnh. Khác cây: graph có thể có vòng.”

## Ask
- A nối trực tiếp với những ai?
- Từ A tới E có đường không?
- Graph khác tree ở đâu?

## Unplugged
Con nối len giữa các thẻ thành phố theo bản đồ:

```
A — B — D
|   |
C — E
```

Con kể hàng xóm của từng nút. Tìm một vòng (A-B-E-C-A).

## Explain
Graph = nodes + edges.
Danh sách kề: `graph["A"] = ["B", "C"]`.
Cạnh 2 chiều → ghi cả hai phía.

## Build
```python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "E"],
    "D": ["B"],
    "E": ["B", "C"],
}
print("Neighbors of A:", graph["A"])
for city in graph:
    print(city, "has", len(graph[city]), "roads")
```

## Practice
Thêm thành phố F nối với D. Kiểm tra cả 2 phía.

## Challenge
Thành phố nhiều đường nhất (max theo len).

## Mistakes
Ghi cạnh một chiều. Bố: “A nối B thì B có nối A không?”
Nhầm graph với tree. Bố: “Có vòng không?”

## Check
1. Node và edge là gì?
2. Hàng xóm của B?
3. Ví dụ graph đời sống?

## Homework
- [ ] Vẽ graph bạn bè trong lớp (5 bạn, ai chơi với ai).

## Pass
Vẽ graph + kể đúng hàng xóm của A.

## Next
L107 BFS — lan như sóng nước.

---

# L107 — BFS

## Objective
Con duyệt graph theo chiều rộng (BFS) bằng queue: thăm theo **từng lớp**.

## Parent prep
Chậu nước + viên sỏi. Bản đồ L106. 5 thẻ thành phố + deque.

## Story
**Bố nói:** “Thả sỏi vào nước: sóng lan ra vòng 1, rồi vòng 2, vòng 3. BFS đi graph giống sóng nước — thăm tất cả hàng xóm gần trước, rồi mới xa hơn.”

## Ask
- Vòng 1 từ A gồm ai?
- Vòng 2 gồm ai?
- Cần cấu trúc nào để giữ thứ tự? (queue L99)

## Unplugged
Con đứng ở A, xếp hàng thẻ (queue): lấy đầu hàng, thăm, thêm hàng xóm **chưa thăm** vào cuối.
Ghi thứ tự thăm: A, B, C, D, E.

## Explain
BFS = queue + tập `visited`.
Lấy đầu → thăm → thêm hàng xóm chưa thăm vào cuối.
BFS tìm đường **ít bước nhất** (L118).

## Build
```python
from collections import deque

graph = {"A": ["B", "C"], "B": ["A", "D", "E"], "C": ["A", "E"], "D": ["B"], "E": ["B", "C"]}

def bfs(start):
    visited = [start]
    q = deque([start])
    while q:
        node = q.popleft()
        print(node)
        for nb in graph[node]:
            if nb not in visited:
                visited.append(nb)
                q.append(nb)

bfs("A")
```

## Practice
BFS từ D. Thứ tự khác gì từ A?

## Challenge
In “vòng” (khoảng cách) của mỗi nút từ A.

## Mistakes
Không có visited → thăm mãi (vòng). Bố: “Đã thăm rồi còn thêm vào hàng?”
Dùng pop() thay popleft → thành DFS. Bố: “Queue hay stack?”

## Check
1. BFS dùng queue hay stack?
2. Thứ tự từ A?
3. Vì sao cần visited?

## Homework
- [ ] Vẽ sơ đồ lan tin đồn: con kể 2 bạn, mỗi bạn kể 2 bạn — vòng 3 có bao nhiêu người?

## Pass
Thứ tự thăm đúng trên graph 5 nút.

## Next
L108 DFS — đi sâu trước.

---

# L108 — DFS

## Objective
Con duyệt graph theo chiều sâu (DFS) bằng stack / đệ quy, so thứ tự với BFS. Checkpoint Level 8.

## Parent prep
Mê cung giấy. Bản đồ L106. Coding Passport mở.

## Story
**Bố nói:** “Đi mê cung: con chọn một lối, đi tới cùng. Cụt thì quay lại ngã rẽ gần nhất, thử lối khác. Đó là **DFS** — đi sâu trước.”

## Ask
- DFS khác BFS ở đâu?
- Cấu trúc nào giúp ‘quay lại ngã rẽ gần nhất’? (stack L98)
- Cùng graph, thứ tự có giống BFS không?

## Unplugged
Con đi mê cung giấy bằng bút chì, cụt thì quay lại. Đánh số ngã rẽ.
Trên bản đồ: DFS từ A → ghi thứ tự. So với BFS hôm qua.

## Explain
DFS = stack (hoặc đệ quy) + visited.
Đi sâu tới cùng rồi lùi.
BFS: rộng trước, DFS: sâu trước. Cả hai thăm hết.

## Build
```python
graph = {"A": ["B", "C"], "B": ["A", "D", "E"], "C": ["A", "E"], "D": ["B"], "E": ["B", "C"]}

def dfs(node, visited):
    visited.append(node)
    print(node)
    for nb in graph[node]:
        if nb not in visited:
            dfs(nb, visited)

dfs("A", [])
```

## Practice
DFS bằng stack (không đệ quy). Thứ tự có khác bản đệ quy không?

## Challenge
Đếm số “vùng” trong graph rời rạc bằng DFS.

## Mistakes
Quên visited → đệ quy mãi (RecursionError). Bố: “Đã tới đây rồi mà.”

## Check
1. DFS dùng gì?
2. Thứ tự DFS vs BFS từ A?
3. Khi nào dùng BFS, khi nào DFS? (BFS: ít bước nhất)

## Homework
- [ ] Giải 2 mê cung giấy bằng cách DFS, đánh dấu chỗ quay lại.

## Pass
Thứ tự DFS khác BFS trên cùng graph, con giải thích → tick **Data Structure Explorer**.

## Next
L109 Linear Search — Level 9 Algorithms.
