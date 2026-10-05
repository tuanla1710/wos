# Phase 4 — AI

AI **không** phải sản phẩm. AI bám vòng đã có:

```
Capture → Plan → Focus → Execute → Review
```

Không chatbot. Không “AI workspace”. Không auto-chạy việc người dùng không thấy.

Chỉ mở sau Phase 3 có người dùng thật (hoặc dogfood Phase 2 đủ data — vẫn không bán AI trước daily loop).

---

## 1. Việc được làm — đúng chỗ

| Feature | Chỗ cắm | Việc AI làm | Việc AI không làm |
|---|---|---|---|
| AI Weekly Review | Màn Review | Tóm tắt tuần, list gợi ý reschedule / drop / focus | Tự archive, tự đổi due |
| AI Priority | Task Detail / Inbox | Gợi ý High/Med/Low + 1 câu lý do | Tự set priority |
| AI Schedule | Calendar | Gợi ý due tuần tới cho task không due | Tự gán due hàng loạt |
| AI Focus | Home trống | 3 gợi ý (thay/ besides rule cứng) | Tự pin |
| AI Search | Search | Semantic, cùng nhóm kết quả | Che keyword search |
| AI Summary | Project Overview | 1 đoạn tiến độ | Báo cáo gửi mail tự động |
| NL Quick Add | Quick Add | Parse “tomorrow high” → field | Tạo nhiều task từ một đoạn văn dài |

Mọi gợi ý: **Apply / Dismiss**. Không silent write.

---

## 2. Luật an toàn sản phẩm

1. AI không xóa, archive, đổi assignee, invite, billing.
2. AI không đọc workspace khác.
3. Output hiện như suggestion, log `activity` verb `ai_suggest` nếu apply.
4. User tắt AI được ở Settings. Default **off** đến khi opt-in.
5. Không train marketing “Work OS is an AI company”.

---

## 3. Không làm

- Chat side-panel “Ask anything”
- Auto standup bot
- Voice
- Agent tự complete task
- Viết description thay user không hỏi
- Fine-tune private bắt buộc — dùng model API + context task/project tuần

---

## 4. Data đưa vào model

Chỉ workspace hiện tại, cửa sổ 14–30 ngày: title, status, due, blocked_reason, project name, review stats.

Không đưa: password, billing, file binary, comment cũ hơn cửa sổ trừ khi user mở “summarize this task”.

---

## 5. Success

AI thành công khi Review/Focus **nhanh hơn** chứ không khi “có model”.

Đo: % lần user bấm Apply gợi ý Review / Focus. < 20% sau 4 tuần → tắt default, đừng phình thêm skill.

---

*AI lock. Không mở file spec model cho đến khi có chỗ cắm và nút Apply.*
