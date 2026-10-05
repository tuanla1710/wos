# L7 — Python Foundation

Thonny. Cổng: Quiz Game L96. Badge Python Coder.

---

# L85 — Strings

## Objective
Con làm việc với chuỗi trong Python: tạo, nối bằng `+`, đo bằng `len`, lặp bằng `*`.

## Parent prep
Thẻ chữ cái + dây kẹp (L38). Thonny Shell.

## Story
**Bố nói:** “Nhớ chuỗi hạt chữ ở Scratch không? Python gọi là **string** và có nhiều phép hay: nối chuỗi, nhân chuỗi, đo độ dài.”

## Ask
- `join` ở Scratch là gì trong Python?
- `"ha" * 3` ra gì?
- `len("Nam")` = ?

## Unplugged
Con kẹp “HEL” và “LO” → “HELLO” (nối `+`).
Kẹp “HA” ba lần → “HAHAHA” (`*`).
Đếm hạt: `len`.

## Explain
String trong `" "` hoặc `' '`.
`+` nối, `*` lặp, `len()` đếm ký tự (cả dấu cách).
Không cộng string với số: `"Age " + str(10)`.

## Build
```python
first = "Nguyen"
name = "Nam"
full = name + " " + first
print(full)
print(len(full))
print("Ha" * 3)
age = 10
print("I am " + str(age))
```

## Practice
Hỏi tên, in “Hello, <tên>!” và số chữ cái.
In đường kẻ: `print("=" * 20)`.

## Challenge
In tên trong khung:

```
**********
* Nam    *
**********
```

## Mistakes
`"Age " + 10` → TypeError. Bố: “Chữ cộng số được không? Đổi số thành chữ.”
Quên dấu cách khi nối. Bố: “Đọc to kết quả.”

## Check
1. `+` với string làm gì?
2. `len("hi there")` = ?
3. `str(5)` để làm gì?

## Homework
- [ ] Viết chương trình in thiệp sinh nhật có khung `*` cho một người trong nhà.

## Pass
In “Hello + tên” và độ dài đúng.

## Next
L86 String indexing — lấy từng chữ.

---

# L86 — String indexing

## Objective
Con lấy ký tự bằng index: `s[0]`, `s[-1]`, và cắt `s[0:3]`.

## Parent prep
Thẻ chữ P-Y-T-H-O-N đánh số 0–5 phía dưới và −6…−1 phía trên.

## Story
**Bố nói:** “Mỗi chữ trong string có số nhà, bắt đầu từ 0 như list. Đi ngược thì nhà cuối là −1.”

## Ask
- `"PYTHON"[0]` = ?
- Chữ cuối index mấy?
- `"PYTHON"[10]` thì sao?

## Unplugged
Con chỉ thẻ theo bố đọc: [0] P, [3] H, [-1] N, [-2] O.
Cắt: bố che thẻ, chỉ để lộ [0:3] → PYT. Hỏi: “Có thẻ số 3 không?” (không — dừng trước).

## Explain
`s[i]` = ký tự ở vị trí i.
`s[a:b]` = từ a đến b−1 (slice).
Index ngoài → IndexError — **đọc lỗi**, đừng sợ.

## Build
```python
s = "PYTHON"
print(s[0])
print(s[-1])
print(s[0:3])
print(s[2:])
name = input("Name: ")
print("First:", name[0], "Last:", name[-1])
```

## Practice
In chữ cái đầu của 3 từ: “Kid Coding Club” → KCC.

## Challenge
Đảo ngược: `s[::-1]`. Kiểm tra từ đối xứng (“level”, “noon”).

## Mistakes
`s[100]` → IndexError. Bố: “Đọc dòng cuối của lỗi. Nó nói gì?” — con debug.
Nhầm slice có cả b. Bố: “Đếm ra mấy chữ?”

## Check
1. Index đầu là mấy?
2. `"CAT"[-1]` = ?
3. `"HELLO"[1:4]` = ?

## Homework
- [ ] Tìm 3 từ tiếng Anh đối xứng, kiểm tra bằng `s[::-1]`.

## Pass
In chữ đầu và chữ cuối tên, đọc được một IndexError.

## Next
L87 String methods — đồ nghề của chuỗi.

---

# L87 — String methods

## Objective
Con dùng `lower`, `upper`, `strip`, `startswith`, `replace` để xử lý chữ người dùng gõ.

## Parent prep
Danh sách câu trả lời “bẩn”: “ ADA ”, “ada”, “Ada”. Thonny.

## Story
**Bố nói:** “Người gõ phím không cẩn thận: có người gõ hoa, có người thừa dấu cách. Máy phải ‘giặt sạch’ chữ trước khi so sánh.”

## Ask
- “Ada” và “ada” máy coi là giống không?
- Dấu cách thừa ở cuối có thấy được không?
- Làm sao để so sánh không phân biệt hoa thường?

## Unplugged
Bố viết 3 cách gõ tên. Con “giặt”: gạch dấu cách hai đầu (strip), viết lại chữ thường (lower). Ba cái giống nhau!

## Explain
Method = việc của string, gọi bằng dấu chấm: `s.lower()`.
Method **trả về string mới**, không sửa string cũ.
Giặt chuẩn: `s.strip().lower()`.

## Build
```python
answer = input("Who wrote the first program? ")
clean = answer.strip().lower()
if clean == "ada":
    print("Correct! Ada Lovelace.")
else:
    print("Not quite.")
print("ada".upper())
print("I like cats".replace("cats", "dogs"))
print("Python".startswith("Py"))
```

## Practice
Test với “ ADA ”, “Ada”, “ada” — đều Correct.

## Challenge
Đếm nguyên âm trong câu: `for ch in s.lower(): if ch in "aeiou"`.

## Mistakes
`answer.lower` thiếu `()` — in ra chữ lạ. Bố: “Gọi method cần gì?”
Tưởng lower sửa biến cũ. Bố: “In lại answer xem.”

## Check
1. `.strip()` làm gì?
2. Vì sao so sánh nên dùng lower?
3. Method có sửa string cũ không?

## Homework
- [ ] Viết câu đố 1 câu, chấp nhận mọi kiểu gõ hoa/thường.

## Pass
So “Ada” vs “ada” bằng lower ra giống nhau.

## Next
L88 List indexing — sửa ô trong list.

---

# L88 — List indexing

## Objective
Con đọc và **sửa** phần tử list: `a[2] = 9`, slice `a[1:3]`.

## Parent prep
5 cốc 0–4 có số 1, 2, 3, 4, 5. Thonny.

## Story
**Bố nói:** “String giống chữ khắc trên đá — không sửa được từng chữ. List giống hàng cốc — thay đồ trong một cốc thoải mái.”

## Ask
- Sửa ô giữa list 5 phần tử là index mấy?
- `a[-1] = 0` làm gì?
- String có sửa từng chữ được không?

## Unplugged
Con thay giấy trong cốc 2 bằng 9. Đọc lại hàng: 1 2 9 4 5.
Thử “sửa chữ” trên string khắc (tờ giấy đã dán chết) — không được.

## Explain
`a[i] = x` thay phần tử.
List **mutable** (sửa được), string **immutable**.
`a[1:3]` lấy phần giữa.

## Build
```python
a = [1, 2, 3, 4, 5]
a[2] = 9
print(a)
a[-1] = 0
print(a)
print(a[1:3])
s = "cat"
# s[0] = "b"  -> thử bỏ dấu # để xem lỗi
```

## Practice
Đổi phần tử đầu và cuối (swap L55): `a[0], a[-1] = a[-1], a[0]`.

## Challenge
Nhân đôi mọi phần tử bằng `for i in range(len(a)): a[i] = a[i] * 2`.

## Mistakes
`a[5] = 1` với list 5 phần tử → IndexError. Bố: “Ô số 5 có không?”
Thử sửa string → TypeError. Bố: “Đá khắc sửa được không?”

## Check
1. Ô giữa list 5 phần tử index?
2. List và string khác nhau gì khi sửa?
3. `a[1:3]` của [1,2,3,4,5]?

## Homework
- [ ] List điểm 5 môn, sửa một môn vừa có điểm mới, in lại.

## Pass
Đổi ô giữa thành 9 đúng.

## Next
L89 List loop — đi qua từng phần tử.

---

# L89 — List loop

## Objective
Con lặp qua list bằng 2 cách: `for x in a` và `for i in range(len(a))`. Viết linear search Python.

## Parent prep
Project Scratch L52 (linear search). 5 cốc úp.

## Story
**Bố nói:** “Con nhớ Transfer ở L52 không? ‘Sau này Python viết `for item in list`.’ Hôm nay chính là ‘sau này’.”

## Ask
- Muốn dùng giá trị thì cách nào gọn?
- Muốn biết vị trí thì cách nào?
- Linear search cần vị trí không?

## Unplugged
Con lật từng cốc nói giá trị (cách 1). Rồi nói “cốc số i có giá trị…” (cách 2).

## Explain
`for x in a:` — x lần lượt là từng giá trị.
`for i in range(len(a)):` — i là vị trí, giá trị là `a[i]`.
`enumerate(a)` cho cả hai (biết thêm).

## Build
```python
nums = [5, 8, 2, 9, 1]
for x in nums:
    print(x)

for i in range(len(nums)):
    print(i, nums[i])

target = int(input("Find: "))
found = -1
for i in range(len(nums)):
    if nums[i] == target:
        found = i
        break
print("Position:", found)
```

## Practice
Test linear search: 9 → 3, 5 → 0, 7 → −1.
Tổng list bằng for (L48).

## Challenge
Max của list bằng for (L44) — so với hàm có sẵn `max(nums)`.

## Mistakes
`for i in nums: print(nums[i])` — dùng giá trị làm index. Bố: “i là vị trí hay giá trị?”
Quên break — vẫn đúng nhưng chạy thừa. Bố: “Thấy rồi còn tìm tiếp không?”

## Check
1. Hai cách lặp khác nhau thế nào?
2. Linear search trả về −1 khi nào?
3. So với Scratch L52: dòng nào ngắn hơn?

## Homework
- [ ] Viết chương trình tìm tên trong list 5 người, in vị trí.

## Pass
In hết list 2 cách, linear search 3 test đúng.

## Next
L90 List modification — thêm, bớt, chèn.

---

# L90 — List modification

## Objective
Con dùng `append`, `pop`, `insert`, `remove` để thay đổi list.

## Parent prep
Hàng cốc + vài cốc rời. Thonny.

## Story
**Bố nói:** “Danh sách việc cần làm luôn thay đổi: thêm việc mới, xong việc thì gạch. Python có 4 lệnh cho việc đó.”

## Ask
- `add to list` Scratch là gì trong Python?
- `delete 1 of` là gì?
- pop lấy phần tử nào?

## Unplugged
Con thêm cốc cuối (append), lấy cốc cuối ra (pop), chen cốc vào giữa (insert), bỏ cốc có chữ “banana” (remove).

## Explain
`a.append(x)` — thêm cuối.
`a.pop()` — lấy và xóa cuối (trả về giá trị).
`a.insert(i, x)` — chèn ở vị trí i.
`a.remove(x)` — xóa giá trị x đầu tiên.

## Build
```python
todo = ["homework", "piano"]
todo.append("read")
print(todo)
done = todo.pop()
print("Done:", done, "Left:", todo)
todo.insert(0, "breakfast")
print(todo)
todo.remove("piano")
print(todo)
```

## Practice
To-do app: hỏi lặp, gõ “add X”, “done”, “show”, “quit”.

## Challenge
Stack nhỏ: chỉ dùng append + pop — cái nào vào sau ra trước? (chuẩn bị L98)

## Mistakes
`todo.remove("swim")` khi không có → ValueError. Bố: “Kiểm tra `in` trước.”
`todo = todo.append(x)` → None. Bố: “append sửa luôn list, không trả về.”

## Check
1. append thêm vào đâu?
2. pop trả về gì?
3. remove khác pop?

## Homework
- [ ] Làm to-do list cho ngày mai bằng chương trình, in ra dán tủ lạnh.

## Pass
Thêm rồi xóa phần tử cuối, in list đúng sau mỗi bước.

## Next
L91 Tuple — list không sửa được.

---

# L91 — Tuple

## Objective
Con dùng tuple `(x, y)` cho dữ liệu không đổi như tọa độ. Thấy lỗi khi sửa.

## Parent prep
Bản đồ x y từ L11. Thonny.

## Story
**Bố nói:** “Địa chỉ nhà mình không đổi mỗi ngày. Python có loại hộp ‘niêm phong’ cho dữ liệu như vậy: **tuple**.”

## Ask
- Tọa độ có mấy số?
- Có nên cho sửa tọa độ kho báu giữa chừng?
- Tuple viết bằng ngoặc gì?

## Unplugged
Con viết tọa độ kho báu (120, 80) trên giấy, bố dán băng keo niêm phong. Thử sửa — không được, phải làm tờ mới.

## Explain
Tuple: `p = (120, 80)`. Đọc `p[0]`, `p[1]`.
Không sửa được → TypeError.
Mở gói: `x, y = p`.

## Build
```python
treasure = (120, 80)
print(treasure[0], treasure[1])
x, y = treasure
print("x =", x, "y =", y)
# treasure[0] = 3   -> bỏ # để xem lỗi
points = [(0, 0), (-100, 50), (120, 80)]
for px, py in points:
    print(px, py)
```

## Practice
List tọa độ 3 điểm, in khoảng cách x giữa điểm đầu và cuối.

## Challenge
Hàm trả về 2 giá trị: `def min_max(a): return min(a), max(a)`.

## Mistakes
Tuple 1 phần tử `(5)` là số 5. Bố: “Cần dấu phẩy `(5,)`.”
Cố sửa tuple. Bố: “Niêm phong rồi — tạo tuple mới.”

## Check
1. Tuple khác list ở đâu?
2. `x, y = (3, 4)` thì x = ?
3. Khi nào dùng tuple?

## Homework
- [ ] Ghi tọa độ 3 đồ vật trong phòng (L11) thành list tuple.

## Pass
In x y từ tuple, thử gán và nói “tuple không sửa”.

## Next
L92 Set — túi không trùng.

---

# L92 — Set

## Objective
Con dùng set để bỏ phần tử trùng và đếm số loại khác nhau.

## Parent prep
Túi vải. Thẻ chữ A A B A. Thonny.

## Story
**Bố nói:** “Túi thần kỳ này không cho 2 thứ giống nhau vào. Bỏ A lần hai — túi lắc đầu. Python gọi là **set**.”

## Ask
- {1, 2, 2} còn mấy phần tử?
- Set có thứ tự không?
- Đếm số chữ khác nhau trong “AABA”?

## Unplugged
Con bỏ thẻ A A B A vào túi — chỉ giữ 1 A và 1 B. Đếm: 2 loại.

## Explain
Set: `{1, 2, 3}` hoặc `set(list)`.
Không trùng, không thứ tự (không có `s[0]`).
`len(set(x))` = số loại khác nhau. `x in s` rất nhanh.

## Build
```python
s = {1, 2, 2, 3}
print(s)
letters = set("AABA")
print(letters, len(letters))
s.add(4)
print(3 in s)
names = ["Nam", "An", "Nam", "Binh"]
print(len(set(names)), "different names")
```

## Practice
Đếm số chữ cái khác nhau trong tên con. Trong “banana”.

## Challenge
Chữ chung của 2 tên: `set("nam") & set("anh")`.

## Mistakes
`s[0]` → TypeError. Bố: “Túi có thứ tự không?”
`{}` là dict rỗng, không phải set. Bố: “Set rỗng viết `set()`.”

## Check
1. Set giữ phần tử trùng không?
2. `len(set("hello"))` = ?
3. Khi nào dùng set?

## Homework
- [ ] Hỏi 6 người món ăn thích, đếm có bao nhiêu món khác nhau bằng set.

## Pass
Đếm chữ unique trong “AABA” = 2.

## Next
L93 Dictionary — hộp có nhãn.

---

# L93 — Dictionary

## Objective
Con dùng dict `{"Ada": 10}`: tra cứu bằng **khóa**, thêm, sửa.

## Parent prep
Hộp có nhãn tên (Ada, Nam, An) chứa giấy điểm. Thonny.

## Story
**Bố nói:** “Danh bạ điện thoại: tìm theo **tên**, không theo số thứ tự. Dictionary là danh bạ của Python: khóa → giá trị.”

## Ask
- Muốn biết điểm của Ada, tìm bằng gì?
- List tìm bằng vị trí, dict tìm bằng gì?
- Thêm người mới thế nào?

## Unplugged
Bố hỏi “Điểm của Nam?” — con tìm hộp nhãn Nam, đọc giấy.
Thêm hộp “Binh: 7”. Sửa điểm Ada thành 9.

## Explain
`scores = {"Ada": 10, "Nam": 8}`.
`scores["Ada"]` đọc. `scores["Binh"] = 7` thêm hoặc sửa.
Khóa không có → KeyError. Dùng `in` hoặc `.get()`.

## Build
```python
scores = {"Ada": 10, "Nam": 8}
print(scores["Ada"])
scores["Binh"] = 7
scores["Nam"] = 9
print(scores)
name = input("Name: ")
if name in scores:
    print(name, "has", scores[name])
else:
    print("Unknown")
for k in scores:
    print(k, scores[k])
```

## Practice
Từ điển Anh–Việt 5 từ: hỏi từ tiếng Anh, in nghĩa.

## Challenge
Frequency (L54) bằng dict: đếm mỗi chữ trong “banana”.

## Mistakes
`scores["Tom"]` khi không có → KeyError. Bố: “Kiểm tra `in` trước.”
Nhầm dict với list `scores[0]`. Bố: “Danh bạ có trang số 0 không?”

## Check
1. Dict tra cứu bằng gì?
2. Thêm khóa mới viết thế nào?
3. KeyError là gì?

## Homework
- [ ] Làm dict 5 người trong họ hàng → tuổi. Hỏi tên, in tuổi.

## Pass
Hỏi tên in điểm, thêm được người mới.

## Next
L94 Nested data — dữ liệu lồng nhau.

---

# L94 — Nested data

## Objective
Con đọc dữ liệu lồng: list trong dict `{"Ada": [10, 8]}`, dict trong list.

## Parent prep
Hộp nhãn tên, trong mỗi hộp là hàng cốc nhỏ (nhiều điểm). Thonny.

## Story
**Bố nói:** “Mỗi bạn không chỉ có 1 điểm — có cả bảng điểm. Hộp nhãn ‘Ada’ chứa một hàng cốc. Đó là dữ liệu lồng nhau.”

## Ask
- Điểm thứ 2 của Ada lấy thế nào?
- Đọc từ ngoài vào trong hay trong ra ngoài?
- Thêm điểm mới cho Nam?

## Unplugged
Con mở hộp “Ada” → thấy hàng cốc → lấy cốc số 1 (Python index 1 = thứ 2).
Đọc to đường đi: `scores["Ada"][1]`.

## Explain
Đọc từ trái sang phải: `scores["Ada"]` là list → `[1]` là phần tử thứ 2.
Thêm: `scores["Nam"].append(9)`.
Lặp lồng: for trong for.

## Build
```python
scores = {"Ada": [10, 8], "Nam": [7, 9, 6]}
print(scores["Ada"][1])
scores["Nam"].append(10)
for name in scores:
    total = sum(scores[name])
    print(name, scores[name], "total", total)
```

## Practice
Điểm trung bình mỗi người (L49): `sum / len`.

## Challenge
List các dict: `[{"name": "Ada", "age": 9}, …]` — in tên người lớn tuổi nhất.

## Mistakes
`scores["Ada"[1]]` — đặt ngoặc sai. Bố: “Mở hộp trước, lấy cốc sau.”
Index 2 khi list có 2 phần tử. Bố: “Đếm từ 0.”

## Check
1. `scores["Ada"][0]` = ?
2. Thêm điểm cho Nam viết thế nào?
3. Ai có tổng cao nhất?

## Homework
- [ ] Ghi điểm 3 môn của con trong 2 tuần thành dict lồng list, tính trung bình.

## Pass
In điểm thứ 2 của Ada đúng.

## Next
L95 Functions — hàm có return.

---

# L95 — Functions

## Objective
Con viết hàm có tham số và `return`. Chia chương trình dài thành nhiều hàm nhỏ.

## Parent prep
Máy xay sinh tố (hoặc hình): bỏ trái cây vào → ra nước ép. Thonny.

## Story
**Bố nói:** “Máy xay: bỏ chuối vào, ra sinh tố chuối. Hàm có return cũng vậy: đưa đầu vào (tham số), nhận lại kết quả (return).”

## Ask
- `print` trong hàm và `return` khác nhau thế nào?
- `add(2, 3)` trả về mấy?
- Vì sao chia nhỏ hàm?

## Unplugged
Bố là “máy cộng”: con đưa 2 thẻ số, bố đưa lại thẻ tổng. Con dùng thẻ tổng để làm tiếp (nhân 2).
So với bố chỉ **nói** tổng (print) — con không cầm được để dùng.

## Explain
`def add(a, b): return a + b`.
`return` gửi kết quả về chỗ gọi — dùng tiếp được.
Mỗi hàm làm **một việc**, tên nói việc đó.

## Build
```python
def add(a, b):
    return a + b

def average(nums):
    return sum(nums) / len(nums)

def is_even(n):
    return n % 2 == 0

print(add(2, 3))
x = add(10, add(1, 2))
print(x)
print(average([2, 4, 6]))
print(is_even(7))
```

## Practice
Hàm `max_of(nums)` tự viết (L44). Hàm `greet(name)` trả về chuỗi.

## Challenge
Viết lại Guess the Number (L84) với 2 hàm: `get_guess()` và `hint(guess, secret)`.

## Mistakes
Dùng print thay return → `x = add(2,3)` là None. Bố: “Hàm có đưa lại thẻ không?”
Code sau return không chạy. Bố: “Return là ra khỏi hàm.”

## Check
1. return làm gì?
2. `add(add(1,1), 3)` = ?
3. Vì sao nhiều hàm nhỏ tốt hơn một hàm dài?

## Homework
- [ ] Viết 3 hàm nhỏ: đổi phút → giờ, tính chu vi hình vuông, kiểm tra số chẵn.

## Pass
`add(2, 3)` → 5, con giải thích return.

## Next
L96 Quiz Game — checkpoint Level 7.

---

# L96 — Quiz Game

Project: Quiz Game

## Objective
Con làm Quiz Game 5 câu: list câu hỏi + đáp án, vòng lặp, input, chấm điểm. Checkpoint Level 7.

## Parent prep
Con chuẩn bị trước 5 câu đố (toán, khoa học, gia đình). Giấy 4 ô. Coding Passport mở.

## Story
**Bố nói:** “Hôm nay con làm chương trình đố vui cho cả nhà chơi. Con ra đề, máy chấm điểm.”

## Ask
- Câu hỏi và đáp án lưu ở đâu? (2 list hoặc list tuple / dict)
- Mỗi câu chạy những bước nào?
- Gõ hoa thường có tính đúng không?

## Spec [4]
1. 5 câu hỏi trong list.
2. Hỏi lần lượt bằng for.
3. So đáp án sau `strip().lower()`.
4. Đúng +1. Cuối in “Score: x/5” và lời khen theo điểm.

## Build [25]
Con tự viết. Gợi ý cấu trúc khi kẹt:

```python
questions = ["2 + 2 = ?", "Capital of Vietnam?", "Cats say?", "5 * 3 = ?", "Color of sky?"]
answers = ["4", "hanoi", "meow", "15", "blue"]
score = 0
for i in range(len(questions)):
    reply = input(questions[i] + " ").strip().lower()
    if reply == answers[i]:
        print("Correct!")
        score = score + 1
    else:
        print("Answer:", answers[i])
print("Score:", score, "/", len(questions))
```

## Test [8]
Chơi: đúng hết, sai hết, gõ hoa có dấu cách. Cho mẹ chơi.

## Mistakes
2 list lệch số lượng → IndexError. Bố: “Đếm len 2 list.”
So không lower → “Hanoi” sai. Bố: “Nhớ L87.”

## Check
1. Vòng lặp chạy mấy lần?
2. Biến nào cộng dồn?
3. Thêm câu thứ 6 sửa mấy chỗ?

## Homework
- [ ] Cả nhà chơi Quiz, ghi bảng điểm.

## Pass
5 câu, in score đúng → tick **Python Coder**.

## Next
L97 Array/List — Level 8 Data Structures.
