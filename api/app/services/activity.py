from uuid import UUID

from sqlalchemy.orm import Session

from app.models.phase2 import ActivityLog


def log_activity(
    db: Session,
    workspace_id: UUID,
    actor_id: UUID,
    verb: str,
    summary: str,
    task_id: UUID | None = None,
    project_id: UUID | None = None,
    note_id: UUID | None = None,
    commit: bool = False,
) -> None:
    db.add(
        ActivityLog(
            workspace_id=workspace_id,
            actor_id=actor_id,
            verb=verb,
            summary=summary,
            task_id=task_id,
            project_id=project_id,
            note_id=note_id,
        )
    )
    if commit:
        db.commit()
