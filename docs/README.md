# Docs

Six design groups. Read **01 → 06** for Phase 1.

```
docs/
├── 01-product/          Why it exists, roadmap, status
├── 02-ux/               Screens, flows, visual system
├── 03-domain/           Business rules (Phase 1 + 2)
├── 04-architecture/     System, layers, deploy
├── 05-data/             Schema, API list, DB operations
├── 06-acceptance/       Expected results / done criteria
└── 07-kid-coding/       Giáo trình 144 bài — bố dạy con 9 tuổi
```

| # | Group | Question | Phase 1 start |
|---|---|---|---|
| 01 | [product](./01-product/) | What are we building and when? | `vision.md` |
| 02 | [ux](./02-ux/) | What does the user see? | `screens-and-flows.md` + `visual-system.md` |
| 03 | [domain](./03-domain/) | What are the rules? | `phase-1-rules.md` + `phase-1-edges.md` |
| 04 | [architecture](./04-architecture/) | How do the parts connect? | `system.md` (current) · [`my-work-os-v1.md`](./04-architecture/my-work-os-v1.md) (AppFlowy + Gitea target) |
| 05 | [data](./05-data/) | What is stored and migrated? | `schema.md` |
| 06 | [acceptance](./06-acceptance/) | When is a screen done? | `phase-1.md` |
| 07 | [kid-coding](./07-kid-coding/) | Dạy con coding 9 tuổi | `README.md` + L0 tuần này |

**Conflict:** domain lock > ux mock > this index.  
**Code:** `web/`, `api/` at repo root.

Target platform V1 (AppFlowy + Work OS + Gitea, no AI agents): [`04-architecture/my-work-os-v1.md`](./04-architecture/my-work-os-v1.md) · [database](./04-architecture/my-work-os-v1-database.md) · [API](./04-architecture/my-work-os-v1-api.md). It does not override Phase 1 locks until domain files are updated.

Do not put product rules in architecture. Do not treat vision ASCII in `vision.md` as Phase 1 UI.
