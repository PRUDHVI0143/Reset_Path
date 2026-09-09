import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./researchmind.db")

# Adjust engine kwargs for SQLite vs PostgreSQL
engine_kwargs = {}
if "sqlite" in DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

try:
    engine = create_async_engine(DATABASE_URL, echo=False, **engine_kwargs)
except Exception:
    # Fallback to standard sqlite if aiosqlite is missing
    fallback_url = "sqlite+aiosqlite:///./researchmind.db"
    engine = create_async_engine(fallback_url, echo=False, connect_args={"check_same_thread": False})

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

