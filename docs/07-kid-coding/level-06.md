# L6 — Scratch → Python

Câu mở đầu mọi bài: “Làm lại điều con đã làm trên Scratch.”
Công cụ: **Thonny**. Font 16. Chạy F5. Không VS Code.
Badge Python Beginner sau L84.

---

# L73 — Python Hello

## Objective
Con chạy chương trình Python đầu tiên: `print("Hello")`. Con biết print = khối `say`.

## Parent prep
Cài Thonny từ trước (không cài lúc 09:00). Tools → Options → Font 16. Tạo thư mục `kid-coding/python`. Thẻ giấy: SAY = PRINT.

## Story
**Bố nói:** “Scratch là lego. Python là **viết chữ** cho máy đọc. Lập trình viên thật viết chữ. Nhưng tin vui: mọi thứ con biết ở Scratch đều có trong Python — chỉ đổi cách viết.”

## Ask
- Khối nào trong Scratch làm mèo nói?
- Viết chữ khác kéo khối ở chỗ nào? (phải đúng từng ký tự)
- Máy có hiểu nếu viết sai một dấu không?

## Unplugged
Bố viết lên giấy: `print("Hello")`. **Con** chỉ 4 phần: tên lệnh `print` · ngoặc `( )` · dấu nháy `" "` · chữ bên trong.
Bố viết sai 3 kiểu: `Print("Hello")`, `print(Hello)`, `print("Hello"`. Con bắt lỗi.

## Explain
`print( )` = say. Chữ phải nằm trong `" "`.
Python phân biệt hoa thường: `print` ≠ `Print`.
F5 = cờ xanh.

## Build
1. Mở Thonny, File → New. Gõ:

```python
print("Hello")
print("My name is Nam")
print("I am 10")
```

2. Lưu `l73_hello.py`. Bấm F5.
3. Đọc kết quả ở ô Shell bên dưới.

## Practice
In 3 dòng về con vật con thích. In một hình bằng ký tự:

```python
print(" /\\_/\\ ")
print("( o.o )")
print(" > ^ < ")
```

## Challenge
`print("Ha" * 5)` — đoán trước rồi chạy.

## Mistakes
Thiếu dấu nháy → `NameError`. Bố: “Đọc dòng đỏ: máy nói gì?”
Thiếu ngoặc → `SyntaxError`. Bố: “Đếm ngoặc mở và đóng.”
Gõ dấu nháy kiểu Word “ ” — Python không hiểu. Bố: “Dùng phím nháy trên bàn phím.”

## Check
1. `print` giống khối nào?
2. Chữ phải đặt trong gì?
3. Đọc một lỗi đỏ và nói lỗi gì.

## Homework
- [ ] Viết chương trình in 5 dòng giới thiệu gia đình, chạy cho mẹ xem.

## Pass
Chạy ra Hello, và con sửa được một lỗi đỏ.

## Next
L74 Variable — hộp có tên, viết bằng chữ.

---

# L74 — Variable

## Objective
Con tạo biến bằng `=`: `score = 0`, đổi giá trị, in ra.

## Parent prep
Hộp giày `score` từ L33. Thonny mở file mới.

## Story
**Bố nói:** “Ở Scratch con bấm ‘Make a Variable’. Ở Python chỉ cần viết tên, dấu bằng, giá trị. Dấu `=` ở đây nghĩa là **cất vào hộp**, không phải ‘bằng nhau’.”

## Ask
- `score = 7` nghĩa là gì?
- Khối Scratch nào giống `score = score + 1`?
- Tên biến có được có dấu cách không?

## Unplugged
Bố đọc `score = 0` — con bỏ giấy 0 vào hộp. `score = 7` — đổi giấy. `score = score + 1` — lấy ra, cộng 1, cất.
Con trace trên giấy:

```
score = 0     → 0
score = 7     → 7
score = score + 1 → 8
```

## Explain
`=` là cất (gán), đọc từ **phải sang trái**.
Tên biến: chữ thường, dùng `_` thay dấu cách: `high_score`.
`print(score)` in giá trị, `print("score")` in chữ “score”.

## Build
```python
score = 0
print(score)
score = 7
print(score)
score = score + 1
print("Score:", score)
```

## Practice
Biến `name`, `age`. In “Nam is 10”. Tăng age thêm 1, in lại.

## Challenge
Đổi chỗ 2 biến a, b (nhớ L55 swap) — rồi thử cách Python: `a, b = b, a`.

## Mistakes
`print("score")` in chữ thay vì số. Bố: “Có nháy là chữ, không nháy là hộp.”
Tên có dấu cách `high score`. Bố: “Python nghĩ đó là 2 tên.”
Dùng biến chưa tạo → `NameError`. Bố: “Hộp này đã có chưa?”

## Check
1. `=` trong Python nghĩa là gì?
2. Sau `x = 5; x = x + 2`, x = ?
3. `print(x)` và `print("x")` khác gì?

## Homework
- [ ] Viết chương trình 3 biến (tên, tuổi, món thích) và in một câu.

## Pass
In ra 7, rồi 8. Con giải thích “cất vào hộp”.

## Next
L75 Input — Python biết hỏi.

---

# L75 — Input

Project: Mini Chatbot (Python)

## Objective
Con dùng `input()` để hỏi và lưu câu trả lời vào biến. Làm lại Mini Chatbot L13.

## Parent prep
Mở project Scratch L13 để so sánh. Thonny file mới.

## Story
**Bố nói:** “Nhớ mèo hỏi tên con không? Python cũng hỏi được — bằng `input`. Câu trả lời cất vào biến luôn, không cần hộp `answer` riêng.”

## Ask
- Ở Scratch, câu trả lời nằm ở đâu?
- Python cất câu trả lời vào đâu?
- Hỏi 2 câu thì cần mấy biến?

## Unplugged
Con đóng vai `input`: bố đưa tờ “Name: ”, con viết tên, bố cất vào hộp `name`.
So sánh 2 cột trên giấy: Scratch `ask … and wait` + `answer` ↔ Python `name = input("Name: ")`.

## Explain
`input("câu hỏi")` = hỏi và chờ.
Kết quả luôn là **chữ** (string), kể cả khi gõ số.
`print("Hello", name)` — dấu phẩy tự thêm khoảng trắng.

## Build
```python
name = input("What's your name? ")
print("Hello", name)
color = input("Favorite color? ")
print(color, "is a nice color!")
```

## Practice
Chatbot 3 câu: tên, món ăn, con vật. Cuối cùng in một câu chứa cả 3.

## Challenge
`age = input("Age? ")` rồi `print(age + 1)` — đọc lỗi. Sửa bằng `int(age) + 1`.

## Mistakes
Quên lưu vào biến: `input("Name")` rồi không dùng được. Bố: “Câu trả lời đi đâu?”
Cộng chữ với số → `TypeError`. Bố: “input trả về chữ hay số?”

## Check
1. input trả về kiểu gì?
2. Biến nào giữ câu trả lời?
3. `int("5")` làm gì?

## Homework
- [ ] Chatbot hỏi bố mẹ 3 câu, in câu trả lời thành một đoạn văn.

## Pass
Gõ tên, máy chào đúng tên.

## Next
L76 Operators — máy tính biết làm toán.

---

# L76 — Operators

## Objective
Con dùng `+ - * / // %`. Hiểu `%` = phần dư qua bài chia kẹo.

## Parent prep
10 viên kẹo, 3 cái đĩa. Thonny mở chế độ Shell (gõ trực tiếp).

## Story
**Bố nói:** “10 viên kẹo chia đều cho 3 bạn. Mỗi bạn mấy viên? Còn dư mấy viên? Python có 2 phép riêng cho câu hỏi này.”

## Ask
- 10 chia 3 mỗi bạn được mấy viên?
- Dư mấy viên?
- Số chẵn chia 2 dư mấy?

## Unplugged
Con chia 10 kẹo vào 3 đĩa: mỗi đĩa 3, dư 1.
Bố viết: `10 // 3 = 3` (mỗi bạn), `10 % 3 = 1` (dư).
Thử 7 kẹo 2 bạn: `7 // 2`, `7 % 2`.

## Explain
`+ - *` như toán. `/` chia ra số thập phân (3.33).
`//` chia lấy phần nguyên. `%` lấy phần dư.
`n % 2 == 0` → n chẵn.

## Build
Gõ trong Shell từng dòng, đoán trước kết quả:

```python
7 + 5
10 - 4
6 * 7
10 / 3
10 // 3
10 % 3
```

Rồi viết file:

```python
candies = int(input("Candies: "))
kids = int(input("Kids: "))
print("Each kid gets", candies // kids)
print("Left over", candies % kids)
```

## Practice
Kiểm tra chẵn lẻ: in `n % 2` cho 4, 7, 10.
Đổi phút ra giờ: 135 phút = `135 // 60` giờ `135 % 60` phút.

## Challenge
Máy tính bỏ túi: hỏi 2 số, in tổng, hiệu, tích, thương.

## Mistakes
Dùng `/` khi muốn số nguyên — ra 3.333. Bố: “Chia kẹo có ra 3.33 viên không?”
Chia cho 0 → `ZeroDivisionError`. Bố: “0 bạn thì chia thế nào?”

## Check
1. `10 % 3` = ?
2. `//` khác `/` thế nào?
3. Làm sao biết số chẵn?

## Homework
- [ ] Chia đồ ăn vặt trong nhà cho mọi người bằng `//` và `%`, viết kết quả.

## Pass
`10 % 3` → 1, `7 + 5` → 12, con giải thích bằng kẹo.

## Next
L77 IF — Python biết chọn.

---

# L77 — IF

## Objective
Con viết `if` trong Python, hiểu **dấu hai chấm** và **thụt lề**.

## Parent prep
Project Scratch L19 (if) mở để so sánh. Thonny bật “Show indent guides”.

## Story
**Bố nói:** “Scratch dùng hộp hình chữ C để ôm khối bên trong if. Python không có hộp — nó dùng **thụt lề**: dòng nào thụt vào thì nằm trong if.”

## Ask
- If ở Scratch nhìn thế nào?
- Python biết dòng nào thuộc if bằng cách nào?
- `==` khác `=` ra sao?

## Unplugged
Bố viết 2 đoạn trên giấy, một thụt lề đúng, một sai. Con dùng bút vẽ “hộp chữ C” quanh các dòng thụt vào.
Con đọc to: “Nếu n lớn hơn 10 **thì** (thụt vào) in LỚN.”

## Explain
`if điều_kiện:` — nhớ dấu `:`.
Dòng bên trong thụt vào 4 dấu cách (Tab trong Thonny).
`==` so sánh bằng, `=` là cất vào hộp.

## Build
```python
n = int(input("Number: "))
if n > 10:
    print("BIG")
    print("Wow!")
print("Done")
```

Test: 15 (in BIG, Wow!, Done), 3 (chỉ Done).

## Practice
`if n == 7: print("Lucky!")`. `if n % 2 == 0: print("Even")`.

## Challenge
Hỏi mật khẩu: `if password == "cat123": print("Welcome")`.

## Mistakes
Quên `:` → SyntaxError. Bố: “Cuối dòng if có gì?”
Không thụt lề → IndentationError. Bố: “Dòng nào nằm trong if?”
Viết `if n = 10` → lỗi. Bố: “So sánh dùng mấy dấu bằng?”

## Check
1. Dấu `:` để làm gì?
2. Dòng nào chạy khi n = 3?
3. `==` khác `=`?

## Homework
- [ ] Viết 3 câu if bằng tiếng Việt trên giấy, rồi viết lại bằng Python (không cần chạy).

## Pass
Test 15 và 3 đều đúng.

## Next
L78 IF / ELSE — hai đường, ba đường.

---

# L78 — IF / ELSE

## Objective
Con viết `if / elif / else`: lớn hơn, bằng, nhỏ hơn — 3 nhánh.

## Parent prep
Project Scratch L20 để so. Ba thẻ: LỚN · BẰNG · NHỎ.

## Story
**Bố nói:** “Ở ngã ba con chọn 1 trong 2 đường. Có khi là ngã tư — 3 đường. Python có `elif` = ‘còn nếu’.”

## Ask
- Else chạy khi nào?
- Có thể có 2 elif không?
- Bao nhiêu nhánh chạy trong một lần?

## Unplugged
Bố đọc số. Con nhảy vào ô LỚN / BẰNG / NHỎ (so với 10).
Con vẽ sơ đồ cây: n > 10? → có: LỚN; không: n == 10? → có: BẰNG; không: NHỎ.

## Explain
Python kiểm tra **từ trên xuống**, gặp nhánh đúng đầu tiên thì chạy và bỏ qua phần còn lại.
`else` không có điều kiện — “mọi trường hợp còn lại”.

## Build
```python
n = int(input("Number: "))
if n > 10:
    print("BIG")
elif n == 10:
    print("EQUAL")
else:
    print("SMALL")
```

## Practice
Test 3 số: 15, 10, 3. Chấm điểm: ≥ 9 Giỏi, ≥ 7 Khá, ≥ 5 Trung bình, còn lại Cố lên.

## Challenge
Đảo thứ tự nhánh chấm điểm (≥ 5 trước) — test 9 điểm. Vì sao sai?

## Mistakes
Dùng nhiều `if` thay vì `elif` — in 2 dòng. Bố: “Mấy nhánh nên chạy?”
Thứ tự điều kiện sai. Bố: “Python đọc từ trên xuống.”

## Check
1. elif nghĩa là gì?
2. n = 10 in gì?
3. Vì sao thứ tự nhánh quan trọng?

## Homework
- [ ] Viết chương trình hỏi nhiệt độ: > 30 Nóng, > 20 Mát, còn lại Lạnh.

## Pass
3 test (15, 10, 3) đúng.

## Next
L79 FOR — repeat của Python.

---

# L79 — FOR

## Objective
Con dùng `for i in range(...)` = khối `repeat`. In 0..9 và 1..5.

## Parent prep
Project Scratch L17 (repeat). Thẻ số 0–9.

## Story
**Bố nói:** “Repeat 10 trong Scratch không cho con biết đang ở lần thứ mấy. `for` trong Python có biến `i` đếm hộ — như người gác cửa vừa mở cửa vừa đếm.”

## Ask
- Repeat 10 lặp mấy lần?
- `range(10)` bắt đầu từ mấy?
- Muốn bắt đầu từ 1 thì sao?

## Unplugged
Con xếp thẻ 0–9. Bố đọc “for i in range(10)”: con chỉ từng thẻ, hô số.
Hỏi: “Có thẻ 10 không?” (không — range dừng **trước** 10).
`range(1, 6)` → thẻ 1, 2, 3, 4, 5.

## Explain
`range(n)` = 0, 1, …, n−1 (đủ n số).
`range(a, b)` = a … b−1.
Code trong for phải thụt lề.

## Build
```python
for i in range(10):
    print(i)

for i in range(1, 6):
    print("Lap", i)

for i in range(3):
    print("Hip hip hooray!")
```

## Practice
Bảng cửu chương 7: `print(7, "x", i, "=", 7 * i)` với i từ 1 đến 10.
Tổng 1..10 bằng accumulator (L35).

## Challenge
`range(10, 0, -1)` — đếm ngược. In “Liftoff!” sau cùng.

## Mistakes
Nghĩ range(10) có số 10. Bố: “Đếm số dòng in ra.”
Print ngoài for (không thụt) — chỉ in một lần. Bố: “Dòng này trong hay ngoài?”

## Check
1. `range(5)` cho số nào?
2. Biến i dùng để làm gì?
3. For giống khối nào trong Scratch?

## Homework
- [ ] In bảng cửu chương con thích nhất bằng for.

## Pass
In 0..9 và 1..5 đúng.

## Next
L80 WHILE — lặp khi điều kiện còn đúng.

---

# L80 — WHILE

## Objective
Con dùng `while`: lặp **khi** điều kiện còn đúng. Hiểu loop vô hạn và cách dừng.

## Parent prep
3 trái tim giấy (lives L29). Biết nút Stop đỏ của Thonny (Ctrl+F2).

## Story
**Bố nói:** “For lặp một số lần biết trước. While lặp **chừng nào còn** — chừng nào còn mạng thì còn chơi. Không biết trước bao nhiêu lần.”

## Ask
- Lives = 3, mỗi lần mất 1, lặp mấy lần?
- Nếu quên trừ lives thì sao?
- Khối Scratch nào giống while? (repeat until — ngược điều kiện)

## Unplugged
Con giữ 3 tim. Bố hỏi: “Còn tim không?” Còn → con đưa 1 tim, nói số. Hết → dừng.
Lần 2: bố quên lấy tim — vòng lặp không bao giờ dừng. Hai bố con cười, gọi đó là **loop vô hạn**.

## Explain
`while điều_kiện:` — kiểm tra trước mỗi vòng.
Trong vòng lặp **phải** có dòng làm điều kiện thay đổi.
Loop vô hạn → bấm Stop.

## Build
```python
lives = 3
while lives > 0:
    print("Lives:", lives)
    lives = lives - 1
print("Game over")
```

## Practice
Hỏi mật khẩu tới khi đúng:

```python
password = ""
while password != "cat":
    password = input("Password: ")
print("Welcome!")
```

## Challenge
Đếm số lần đoán mật khẩu.

## Mistakes
Quên `lives = lives - 1` → loop vô hạn. Bố bấm Stop: “Điều kiện có bao giờ sai không?”
Dùng `while lives = 0` → lỗi. Bố: “So sánh dùng gì?”

## Check
1. While khác for thế nào?
2. Loop vô hạn là gì, dừng ra sao?
3. Dòng nào làm vòng lặp dừng?

## Homework
- [ ] Viết bằng lời 2 việc “lặp khi còn…” (ăn khi còn đói…).

## Pass
In 3 2 1 rồi Game over. Con giải thích loop vô hạn.

## Next
L81 Function — khối tự đặt tên.

---

# L81 — Function

## Objective
Con định nghĩa hàm với `def` và gọi nhiều lần. Hàm = khối tự làm (My Blocks).

## Parent prep
Scratch: chỉ cho con nhóm **My Blocks** (khối hồng). Thẻ giấy ghi “JUMP = nhún + nhảy + đáp”.

## Story
**Bố nói:** “Huấn luyện chó: con dạy nó ‘ngồi’ một lần. Sau đó chỉ cần nói ‘ngồi’ là nó làm cả chuỗi động tác. Hàm là dạy máy một từ mới.”

## Ask
- Con hay làm việc gì lặp lại nhiều bước? (đánh răng)
- Đặt tên cho chuỗi đó thì lợi gì?
- Dạy một lần, gọi mấy lần?

## Unplugged
Con dạy bố từ mới “JUMP” = nhún, nhảy, đáp. Rồi con chỉ cần hô “JUMP!” 3 lần.
Bố viết: định nghĩa (dạy) và gọi (hô) — hai việc khác nhau.

## Explain
`def ten():` = định nghĩa (dạy). Chưa chạy gì.
`ten()` = gọi (hô). Mỗi lần gọi chạy hết các dòng bên trong.
Hàm có thể nhận tham số: `def greet(name):`.

## Build
```python
def jump():
    print("crouch")
    print("JUMP!")
    print("land")

jump()
jump()

def greet(name):
    print("Hello", name)

greet("Nam")
greet("Mom")
```

## Practice
Hàm `square()` in hình vuông bằng `*`. Hàm `cheer(team)`.

## Challenge
`def stars(n): print("*" * n)` — gọi với 1, 3, 5.

## Mistakes
Định nghĩa mà không gọi — không thấy gì. Bố: “Đã hô tên chưa?”
Gọi trước khi định nghĩa → NameError. Bố: “Dạy trước, hô sau.”
Quên `()` khi gọi. Bố: “Thiếu ngoặc là chưa gọi.”

## Check
1. `def` làm gì?
2. Gọi hàm viết thế nào?
3. Tham số là gì?

## Homework
- [ ] Viết hàm `morning()` in 4 việc buổi sáng của con, gọi 2 lần.

## Pass
Định nghĩa 1 hàm, gọi 2 lần chạy đúng.

## Next
L82 List — list trong Python, đếm từ 0.

---

# L82 — List

## Objective
Con tạo list Python `[1, 2, 3, 4]`, lấy phần tử bằng **index bắt đầu từ 0**.

## Parent prep
4 cốc đánh số **0, 1, 2, 3** (khác Scratch đánh từ 1). Thẻ nhắc: “Python đếm từ 0”.

## Story
**Bố nói:** “Thang máy ở nhiều nước có tầng 0 (tầng trệt) rồi mới tới tầng 1. Python cũng vậy: ô đầu tiên là ô số 0.”

## Ask
- Scratch item đầu số mấy?
- Python ô đầu số mấy?
- List 4 phần tử, ô cuối số mấy?

## Unplugged
Con bỏ 10, 20, 30, 40 vào cốc 0–3. Bố hỏi: “numbers[0]?” (10) “numbers[3]?” (40) “numbers[4]?” (không có!).
Con viết: `numbers[-1]` = ô cuối (Python cho đếm ngược).

## Explain
`numbers = [10, 20, 30, 40]`.
`numbers[0]` = đầu. `numbers[-1]` = cuối. `len(numbers)` = 4.
Index ngoài phạm vi → IndexError.

## Build
```python
numbers = [10, 20, 30, 40]
print(numbers[0])
print(numbers[3])
print(numbers[-1])
print(len(numbers))
fruits = ["apple", "banana", "orange"]
print(fruits[1])
```

## Practice
In phần tử giữa. Đổi `numbers[1] = 99`, in cả list.

## Challenge
In hết list bằng for: `for x in numbers: print(x)`.

## Mistakes
`numbers[4]` → IndexError. Bố: “List có mấy ô? Ô cuối số mấy?”
Nhầm với Scratch đếm từ 1. Bố: “Python tầng trệt là 0.”

## Check
1. Ô đầu tiên index mấy?
2. List 5 phần tử ô cuối index?
3. `[-1]` là gì?

## Homework
- [ ] Viết list 5 người trong nhà, in người thứ 1 và người cuối.

## Pass
In 1 và 4 từ `[1, 2, 3, 4]`.

## Next
L83 Random — xúc xắc Python.

---

# L83 — Random

## Objective
Con dùng `import random` và `random.randint`, `random.choice`.

## Parent prep
Xúc xắc thật. Thonny file mới.

## Story
**Bố nói:** “Ở Scratch có `pick random`. Python cất xúc xắc trong một **hộp đồ nghề** tên là `random`. Muốn dùng phải mở hộp: `import random`.”

## Ask
- `pick random 1 to 6` viết Python thế nào?
- Vì sao phải import?
- Chạy 3 lần có ra số giống nhau không?

## Unplugged
Con tung xúc xắc 3 lần, ghi số. Bố giải thích: `import` = lấy hộp đồ nghề ra khỏi tủ.
Bốc thăm tên từ cái mũ = `random.choice`.

## Explain
`import random` ở đầu file.
`random.randint(1, 6)` → 1..6 (có cả 6).
`random.choice(list)` → chọn 1 phần tử.

## Build
```python
import random

dice = random.randint(1, 6)
print("Dice:", dice)

fruits = ["apple", "banana", "orange"]
print("Today's fruit:", random.choice(fruits))
```

## Practice
Tung 2 xúc xắc, in tổng. Chạy 5 lần.
Bốc thăm ai rửa bát: `random.choice(["Bố", "Mẹ", "Nam"])`.

## Challenge
Tung xúc xắc 100 lần, đếm số lần ra 6 (for + counter).

## Mistakes
Quên import → NameError. Bố: “Hộp đồ nghề đã mở chưa?”
Viết `random.randint(6)` → lỗi. Bố: “Cần mấy số?”

## Check
1. import để làm gì?
2. `randint(1, 20)` ra được 20 không?
3. choice dùng với gì?

## Homework
- [ ] Viết chương trình chọn ngẫu nhiên món ăn tối từ list 5 món.

## Pass
3 lần chạy ra 3 số (thường khác nhau).

## Next
L84 Guess the Number — mini project Python.

---

# L84 — Guess the Number

Project: Guess the Number (Python)

## Objective
Con làm lại Guess the Number (L37) bằng Python: random, while, if/elif/else, đếm lượt. Checkpoint Level 6.

## Parent prep
Project Scratch L37 mở để so. Giấy 4 ô. Coding Passport mở.

## Story
**Bố nói:** “Con đã làm game này bằng khối. Hôm nay làm bằng chữ — mọi mảnh con đều đã học: biến, input, int, random, while, if.”

## Ask
- Cần những biến nào?
- Vòng lặp dừng khi nào?
- Gợi ý dùng mấy nhánh if?

## Spec [4]
1. Máy chọn số 1–20.
2. Con đoán (input + int).
3. Gợi ý “Higher” / “Lower”.
4. Đúng → in số lượt, dừng.

## Build [25]
Con tự viết từ giấy. Bố chỉ hỏi.

```python
import random

secret = random.randint(1, 20)
tries = 0
while True:
    guess = int(input("Guess 1-20: "))
    tries = tries + 1
    if guess < secret:
        print("Higher!")
    elif guess > secret:
        print("Lower!")
    else:
        print("You got it in", tries, "tries")
        break
```

(Bố giữ mẫu, chỉ cho xem sau khi con xong.)

## Test [8]
Chơi 3 ván. Ván 1 đoán 10 trước. Gõ chữ “abc” — đọc lỗi, nói vì sao.

## Mistakes
Random trong while — số đổi mỗi lần. Bố: “Máy nghĩ số mấy lần?”
Quên break — đúng rồi vẫn hỏi. Bố: “Cái gì làm vòng dừng?”

## Check
1. `while True` + `break` làm gì?
2. Chỉ dòng if và giải thích.
3. So với Scratch: cái nào ngắn hơn?

## Homework
- [ ] Cho mẹ chơi, ghi số lượt của mẹ.

## Pass
Chơi được 1 ván, con giải thích if → tick **Python Beginner**.

## Next
L85 Strings — Level 7 Python Foundation.
