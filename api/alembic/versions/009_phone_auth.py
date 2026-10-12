"""mandatory phone verification

Revision ID: 009_phone_auth
Revises: 008_platform_admin
Create Date: 2026-10-12
"""

from alembic import op

revision = "009_phone_auth"
down_revision = "008_platform_admin"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone CITEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_otp_hash text;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_otp_expires_at timestamptz;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_otp_sent_at timestamptz;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_otp_attempts integer NOT NULL DEFAULT 0;
        CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone ON users (phone) WHERE phone IS NOT NULL;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP INDEX IF EXISTS uq_users_phone;
        ALTER TABLE users DROP COLUMN IF EXISTS phone_otp_attempts;
        ALTER TABLE users DROP COLUMN IF EXISTS phone_otp_sent_at;
        ALTER TABLE users DROP COLUMN IF EXISTS phone_otp_expires_at;
        ALTER TABLE users DROP COLUMN IF EXISTS phone_otp_hash;
        ALTER TABLE users DROP COLUMN IF EXISTS phone_verified_at;
        ALTER TABLE users DROP COLUMN IF EXISTS phone;
        """
    )
