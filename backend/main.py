import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from backend.database.database import init_db
from backend.routes.auth import router as auth_router
from backend.routes.research import router as research_router, active_websockets
from backend.routes.career import router as career_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on startup
    await init_db()
    yield

app = FastAPI(
    title="ResearchMind AI API",
    description="Multi-agent research platform API powered by LangGraph, FastAPI, and Pydantic",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(research_router)
app.include_router(career_router)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "ResearchMind AI API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.websocket("/research/{id}/stream")
async def websocket_research_stream(websocket: WebSocket, id: str):
    await websocket.accept()
    if id not in active_websockets:
        active_websockets[id] = set()
    active_websockets[id].add(websocket)

    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        if id in active_websockets and websocket in active_websockets[id]:
            active_websockets[id].remove(websocket)
            if not active_websockets[id]:
                del active_websockets[id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
