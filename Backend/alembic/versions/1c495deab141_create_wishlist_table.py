"""create wishlist table

Revision ID: 1c495deab141
Revises: 15d1ae712b6c
Create Date: 2026-05-22 17:28:10.502037

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1c495deab141'
down_revision: Union[str, Sequence[str], None] = '15d1ae712b6c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(

        'wishlist',

        sa.Column(
            'id',
            sa.Integer(),
            primary_key=True
        ),

        sa.Column(
            'user_id',
            sa.Integer(),
            sa.ForeignKey('users.id')
        ),

        sa.Column(
            'product_id',
            sa.Integer(),
            sa.ForeignKey('products.id')
        )
    )


def downgrade() -> None:

    op.drop_table('wishlist')