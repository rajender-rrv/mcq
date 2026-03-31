import re
from typing import Dict, Iterable, List, Sequence, Tuple

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import QuestionTag, Tag


def slugify_label(label: str) -> str:
    s = label.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[-\s]+", "-", s)
    s = s.strip("-")
    return s or "tag"


class TagRepository:

    @staticmethod
    async def list_all(db: AsyncSession) -> Sequence[Tag]:
        result = await db.execute(select(Tag).order_by(Tag.slug))
        return result.scalars().all()

    @staticmethod
    async def get_or_create_for_labels(db: AsyncSession, labels: Iterable[str]) -> List[Tag]:
        items: List[Tuple[str, str]] = []
        seen: set[str] = set()
        for raw in labels:
            name = raw.strip()
            if not name:
                continue
            slug = slugify_label(name)
            if slug in seen:
                continue
            seen.add(slug)
            items.append((slug, name))
        if not items:
            return []

        slugs = [s for s, _ in items]
        existing_result = await db.execute(select(Tag).where(Tag.slug.in_(slugs)))
        by_slug: Dict[str, Tag] = {t.slug: t for t in existing_result.scalars().all()}

        for slug, name in items:
            if slug not in by_slug:
                tag = Tag(slug=slug, name=name)
                db.add(tag)
                by_slug[slug] = tag

        await db.flush()

        return [by_slug[s] for s in slugs]

    @staticmethod
    async def replace_question_tags(
        db: AsyncSession, question_id: int, tag_ids: Sequence[int]
    ) -> None:
        await db.execute(delete(QuestionTag).where(QuestionTag.question_id == question_id))
        await db.flush()
        for tid in tag_ids:
            db.add(QuestionTag(question_id=question_id, tag_id=tid))

    @staticmethod
    async def tags_by_question_ids(
        db: AsyncSession, question_ids: Sequence[int]
    ) -> Dict[int, List[Tag]]:
        if not question_ids:
            return {}
        result = await db.execute(
            select(QuestionTag, Tag)
            .join(Tag, Tag.id == QuestionTag.tag_id)
            .where(QuestionTag.question_id.in_(question_ids))
            .order_by(QuestionTag.question_id, Tag.slug)
        )
        out: Dict[int, List[Tag]] = {qid: [] for qid in question_ids}
        for qt, tag in result.all():
            out[qt.question_id].append(tag)
        return out
