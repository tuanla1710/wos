from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.phase2 import BillingCustomer, Plan, WorkspaceSubscription
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember


def plan_by_code(db: Session, code: str) -> Plan:
    plan = db.query(Plan).filter(Plan.code == code).first()
    if not plan:
        raise HTTPException(500, "Plans are not seeded.")
    return plan


def ensure_customer(db: Session, user: User) -> BillingCustomer:
    row = db.query(BillingCustomer).filter(BillingCustomer.user_id == user.id).first()
    if row:
        return row
    row = BillingCustomer(user_id=user.id, provider_ref="local")
    db.add(row)
    db.flush()
    return row


def ensure_subscription(db: Session, workspace: Workspace, code: str = "free") -> WorkspaceSubscription:
    row = db.query(WorkspaceSubscription).filter(WorkspaceSubscription.workspace_id == workspace.id).first()
    if row:
        return row
    row = WorkspaceSubscription(workspace_id=workspace.id, plan_id=plan_by_code(db, code).id, status="active")
    db.add(row)
    db.flush()
    return row


def current_plan(db: Session, workspace: Workspace) -> Plan:
    sub = ensure_subscription(db, workspace)
    plan = db.get(Plan, sub.plan_id)
    if not plan:
        raise HTTPException(500, "Plans are not seeded.")
    return plan


def paid_seats(db: Session, workspace: Workspace) -> int:
    return (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.role != "guest")
        .count()
    )


def assert_can_invite(db: Session, workspace: Workspace, role: str) -> None:
    plan = current_plan(db, workspace)
    sub = ensure_subscription(db, workspace)
    if sub.status == "past_due":
        raise HTTPException(402, "Payment failed. Invites are disabled until billing is updated.")
    if role == "guest" and not plan.guests:
        raise HTTPException(402, "Invite your team on the Team plan.")
    if role != "guest" and paid_seats(db, workspace) >= plan.max_seats:
        raise HTTPException(402, "Invite your team on the Team plan.")


def assert_can_create_workspace(db: Session, user: User) -> None:
    owned = db.query(Workspace).filter(Workspace.owner_id == user.id).all()
    team = False
    for ws in owned:
        if current_plan(db, ws).code == "team":
            team = True
            break
    if not team and owned:
        raise HTTPException(402, "Invite your team on the Team plan.")


def subscribe_team(db: Session, workspace: Workspace, user: User) -> WorkspaceSubscription:
    if workspace.owner_id != user.id:
        raise HTTPException(403, "Not allowed.")
    ensure_customer(db, user)
    sub = ensure_subscription(db, workspace)
    sub.plan_id = plan_by_code(db, "team").id
    sub.status = "active"
    sub.current_period_end = datetime.now(timezone.utc) + timedelta(days=30)
    db.commit()
    db.refresh(sub)
    return sub


def cancel_subscription(db: Session, workspace: Workspace, user: User) -> WorkspaceSubscription:
    if workspace.owner_id != user.id:
        raise HTTPException(403, "Not allowed.")
    sub = ensure_subscription(db, workspace)
    sub.status = "canceling"
    db.commit()
    db.refresh(sub)
    return sub


def fail_payment(db: Session, workspace: Workspace) -> WorkspaceSubscription:
    sub = ensure_subscription(db, workspace)
    sub.status = "past_due"
    db.commit()
    db.refresh(sub)
    return sub


def billing_out(db: Session, workspace: Workspace) -> dict:
    sub = ensure_subscription(db, workspace)
    plan = db.get(Plan, sub.plan_id)
    return {
        "plan": plan.code if plan else "free",
        "plan_name": plan.name if plan else "Free Personal",
        "status": sub.status,
        "seats_used": paid_seats(db, workspace),
        "seats_max": plan.max_seats if plan else 1,
        "public_api": bool(plan.public_api) if plan else False,
        "guests": bool(plan.guests) if plan else False,
        "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
    }
