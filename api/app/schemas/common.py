from __future__ import annotations

from datetime import date as Date
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8)
    timezone: str = "Asia/Seoul"
    phone: str = Field(min_length=8, max_length=20)


class PhoneSendIn(BaseModel):
    phone: str | None = Field(default=None, max_length=20)


class PhoneVerifyIn(BaseModel):
    code: str = Field(min_length=4, max_length=8)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class MePatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    timezone: str | None = None
    ai_enabled: bool | None = None


class AdminUserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8)
    timezone: str = "Asia/Seoul"
    is_admin: bool = False
    phone: str = Field(min_length=8, max_length=20)


class AdminUserPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    timezone: str | None = None
    is_admin: bool | None = None
    disabled: bool | None = None


class WorkspacePatch(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class TaskCreate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    project_id: UUID | None = None
    parent_id: UUID | None = None
    start_date: Date | None = None
    due_date: Date | None = None
    priority: str = "medium"
    assignee_id: UUID | None = None


class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    start_date: Date | None = None
    due_date: Date | None = None
    project_id: UUID | None = None
    blocked_reason: str | None = Field(default=None, max_length=200)
    assignee_id: UUID | None = None
    tags: list[str] | None = None
    parent_id: UUID | None = None
    clear_start: bool = False
    clear_due: bool = False
    clear_project: bool = False
    clear_parent: bool = False


class ChecklistCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class ChecklistPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    is_done: bool | None = None
    position: int | None = None


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    parent_id: UUID | None = None
    start_date: Date | None = None
    due_date: Date | None = None


class ProjectPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    parent_id: UUID | None = None
    start_date: Date | None = None
    due_date: Date | None = None
    clear_start: bool = False
    clear_due: bool = False
    clear_parent: bool = False


class HolidayIn(BaseModel):
    day: Date
    name: str = ""


class HolidaySettingsIn(BaseModel):
    country: str | None = None
    country2: str | None = None
    skip: Date | None = None
    unskip: Date | None = None


class LinkIn(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    url: str = Field(min_length=1, max_length=2000)


class LinkPatch(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    url: str | None = Field(default=None, max_length=2000)


class ProjectDeleteIn(BaseModel):
    task_action: str = "my_tasks"


class FocusPut(BaseModel):
    date: Date | None = None
    task_ids: list[UUID] = Field(default_factory=list)


class ReviewReschedule(BaseModel):
    task_id: UUID
    due_date: Date


class ReviewTaskId(BaseModel):
    task_id: UUID


class WeekFocusPut(BaseModel):
    week_start: Date
    task_ids: list[UUID] = Field(default_factory=list)


class InviteIn(BaseModel):
    email: EmailStr
    role: str = "member"
    project_ids: list[UUID] = Field(default_factory=list)


class RoleIn(BaseModel):
    role: str


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class WorkspaceDeleteIn(BaseModel):
    confirm_name: str


class TransferIn(BaseModel):
    user_id: UUID


class CommentIn(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class NoteIn(BaseModel):
    title: str | None = None
    body: str | None = None
    kind: str | None = None
    project_id: UUID | None = None
    task_id: UUID | None = None
    tags: list[str] | None = None
    clear_task: bool = False
    clear_project: bool = False


class NoteFlagIn(BaseModel):
    pinned: bool | None = None
    starred: bool | None = None
    archived: bool | None = None


class EventIn(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    event_date: Date
    start_time: str | None = None
    end_time: str | None = None
    all_day: bool = False
    project_id: UUID | None = None
    task_id: UUID | None = None


class TagIn(BaseModel):
    name: str


class TokenIn(BaseModel):
    name: str = "API token"


class AiApplyIn(BaseModel):
    kind: str
    payload: dict = Field(default_factory=dict)
