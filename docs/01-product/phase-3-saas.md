# Phase 3 — SaaS

Chỉ mở khi Phase 2 đạt success (team 3–10 dùng được tuần).

Đây là **khung bán**. Không lock vendor, giá, hay marketing site chi tiết — chốt model để khỏi thiết kế lệch khi đến lúc.

---

## 1. Làm gì

| Mục | Ý |
|---|---|
| Plans | Free Personal · Paid Team |
| Billing | Owner trả. Stripe (hoặc tương đương). Không tự build payment |
| Workspace seats | Paid tính theo member active (không Guest) |
| Admin | Owner: plan, invoices, xóa workspace, transfer owner |
| Public API | Token per workspace, REST đọc/ghi task/project |
| Analytics | Owner: tasks created/done/week, active members. Không vanity dashboard |
| Landing | Marketing ngoài app. App vẫn login-first |
| Legal | Terms, Privacy — trang tĩnh |

---

## 2. Plan — lock hướng

| | Free Personal | Team |
|---|---|---|
| Workspace | 1 | Nhiều |
| Members | 1 | 3–15 chỗ ngồi (chốt số khi bán) |
| Notes / events / files | Có, hạn mức file GB nhỏ | Có |
| Public API | Không | Có |
| Guest | Không | Có |
| Support | Không cam kết | Email |

User Free vẫn dùng hết Phase 1 trên 1 workspace.  
Mời member thứ 2 → gate: upgrade. Copy:

> Invite your team on the Team plan.

Không paywall Focus / Inbox / Review của một người.

---

## 3. Billing luật

- Chỉ Owner thấy Billing.
- Subscribe / cancel / update card trên Stripe portal.
- Cancel: dùng đến hết kỳ. Không xóa data.
- Quá seats: không mời thêm. Không khóa workspace đang dùng.
- Fail payment: grace 7 ngày, rồi disable **invite + API**, không disable daily loop Owner.

Bảng tối thiểu:

```
plans, workspace_subscriptions, billing_customers
```

Không spec cột đến khi chọn Stripe.

---

## 4. Public API

- `Authorization: Bearer <token>`
- Scope: workspace của token.
- Resource Phase 3: tasks, projects, comments. Chưa notes/events nếu chưa cần.
- Rate limit: 60 req/phút / token.
- Token tạo ở Settings → API. Hiện một lần. Revoke được.

Không GraphQL. Không webhooks Phase 3 đầu (webhooks = Phase 3.1).

---

## 5. Admin trong app

Settings thêm:

- Plan + portal
- Members (đã có) + seats used
- API tokens
- Transfer ownership
- Delete workspace (đã có, thêm nhắc billing)

Không admin site nội bộ (impersonate) cho đến khi có khách trả tiền và bạn cần support.

---

## 6. Analytics

Owner-only, tuần:

- Completed, created, overdue còn lại
- Active members (có activity_log trong 7 ngày)

Không heatmap, không funnel marketing trong app.

---

## 7. Không làm Phase 3

- Marketplace, 20 integration
- Enterprise SSO / SCIM
- Reseller, invoice thủ công phức tạp
- Multi-region
- White-label
- Mobile app

---

## 8. Success Phase 3

1. Một người dùng free hàng ngày không bị paywall.
2. Team trả tiền, mời được, billing không gãy daily loop khi thẻ fail 1 lần.
3. Có khách lạ (không phải bạn) trả tiền và không cần Slack riêng để làm việc.

Chưa có (3): không Phase 4 AI như feature bán.

---

*SaaS khung. Khi đến phase này: viết STRIPE.md + giá, không viết lại sản phẩm.*
