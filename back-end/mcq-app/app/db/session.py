from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.engine.url import make_url
from typing import Optional

from app.core.config import settings

def _parse_search_path_from_options(options_value: str) -> Optional[str]:
    # Common psycopg2-style: "-csearch_path=mcq,public"
    # Sometimes: "-c search_path=mcq,public"
    v = options_value.strip()
    if "search_path" not in v:
        return None

    v = v.replace("-c ", "-c")
    if "-csearch_path=" in v:
        return v.split("-csearch_path=", 1)[1].strip() or None
    if "-csearch_path" in v:
        # Fallback for odd formatting; best-effort parse.
        parts = v.split("search_path", 1)
        if len(parts) == 2 and "=" in parts[1]:
            return parts[1].split("=", 1)[1].strip() or None
    return None


_url = make_url(settings.DATABASE_URL)
_search_path = settings.DB_SEARCH_PATH

# If someone configured psycopg2-style `?options=-csearch_path=...` in the URL,
# strip it (asyncpg doesn't support it) and translate to asyncpg server_settings.
if _search_path is None and "options" in (_url.query or {}):
    _search_path = _parse_search_path_from_options(_url.query.get("options", ""))
    _url = _url.set(query={k: v for k, v in _url.query.items() if k != "options"})

connect_args = {}
if _search_path:
    connect_args = {"server_settings": {"search_path": _search_path}}

engine = create_async_engine(_url, echo=True, connect_args=connect_args)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session