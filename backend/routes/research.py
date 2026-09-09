import json
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.database.database import get_db
from backend.models.models import User, ResearchProject, ResearchTask, Source, Claim, Evidence, Conflict, Report
from backend.models.schemas import (
    ResearchCreate, ResearchStatusResponse, ResearchDetailResponse, ExportRequest
)
from backend.services.auth import get_current_user_optional
from backend.services.export_service import ExportService
from agents.pipeline import ResearchPipeline

router = APIRouter(tags=["Research"])

# Simple memory cache for websocket streaming triggers
active_websockets = {}

async def run_pipeline_task(research_id: str, question: str, db_factory):
    pipeline = ResearchPipeline()

    async def broadcast_ws(payload: dict):
        if research_id in active_websockets:
            for ws in list(active_websockets[research_id]):
                try:
                    await ws.send_text(json.dumps(payload))
                except Exception:
                    pass

    try:
        # Execute agent graph
        state = await pipeline.execute(research_id, question, broadcast_fn=broadcast_ws)

        # Persist state into Database
        async with db_factory() as db:
            result = await db.execute(select(ResearchProject).where(ResearchProject.id == research_id))
            project = result.scalars().first()
            if project:
                project.status = state.get("status", "completed")
                project.token_count = state.get("token_count", 15000)
                project.cost_estimate = state.get("cost_estimate", 0.03)

                # Save Tasks
                for t in state.get("tasks", []):
                    task_obj = ResearchTask(
                        id=t.get("id"),
                        research_id=research_id,
                        description=t["description"],
                        status="completed",
                        order_index=t.get("order_index", 1)
                    )
                    db.add(task_obj)

                # Save Sources
                for s in state.get("sources", []):
                    src_obj = Source(
                        id=s["id"],
                        research_id=research_id,
                        title=s["title"],
                        url=s["url"],
                        publisher=s.get("publisher"),
                        content=s.get("content"),
                        date=s.get("date"),
                        reliability_score=s.get("reliability_score", 0.8)
                    )
                    db.add(src_obj)

                # Save Claims
                for c in state.get("claims", []):
                    claim_obj = Claim(
                        id=c["id"],
                        research_id=research_id,
                        claim_text=c.get("claim_text_cited", c["claim_text"]),
                        confidence_score=c["confidence_score"],
                        verification_method=c["verification_method"],
                        status=c["status"]
                    )
                    db.add(claim_obj)

                # Save Conflicts
                for conf in state.get("conflicts", []):
                    conf_obj = Conflict(
                        id=conf["id"],
                        research_id=research_id,
                        claim_a_id=conf["claim_a_id"],
                        claim_b_id=conf["claim_b_id"],
                        reason=conf["reason"],
                        resolution_note=conf.get("resolution_note")
                    )
                    db.add(conf_obj)

                # Save Final Report
                report_obj = Report(
                    research_id=research_id,
                    content=json.dumps(state.get("report", {})),
                    format="json"
                )
                db.add(report_obj)

                await db.commit()
    except Exception as e:
        async with db_factory() as db:
            result = await db.execute(select(ResearchProject).where(ResearchProject.id == research_id))
            project = result.scalars().first()
            if project:
                project.status = "failed"
                await db.commit()


@router.post("/research", response_model=ResearchStatusResponse)
async def create_research(
    payload: ResearchCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    project = ResearchProject(
        user_id=current_user.id if current_user else None,
        question=payload.question,
        status="running"
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)

    # Launch pipeline background execution
    from backend.database.database import AsyncSessionLocal
    background_tasks.add_task(run_pipeline_task, project.id, payload.question, AsyncSessionLocal)

    return ResearchStatusResponse(
        id=project.id,
        question=project.question,
        status=project.status,
        token_count=0,
        cost_estimate=0.0,
        created_at=project.created_at,
        tasks=[],
        sources_count=0,
        claims_count=0,
        verified_claims_count=0,
        conflicts_count=0
    )

@router.get("/research", response_model=List[ResearchStatusResponse])
async def list_research(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = select(ResearchProject).options(
        selectinload(ResearchProject.tasks),
        selectinload(ResearchProject.sources),
        selectinload(ResearchProject.claims),
        selectinload(ResearchProject.conflicts)
    ).order_by(ResearchProject.created_at.desc())

    if current_user:
        query = query.where(ResearchProject.user_id == current_user.id)

    result = await db.execute(query)
    projects = result.scalars().all()

    response = []
    for p in projects:
        verified_count = sum(1 for c in p.claims if c.status == "verified")
        response.append(ResearchStatusResponse(
            id=p.id,
            question=p.question,
            status=p.status,
            token_count=p.token_count,
            cost_estimate=p.cost_estimate,
            created_at=p.created_at,
            tasks=[t for t in p.tasks],
            sources_count=len(p.sources),
            claims_count=len(p.claims),
            verified_claims_count=verified_count,
            conflicts_count=len(p.conflicts)
        ))
    return response

@router.get("/research/{id}", response_model=ResearchDetailResponse)
async def get_research_status(id: str, db: AsyncSession = Depends(get_db)):
    query = select(ResearchProject).options(
        selectinload(ResearchProject.tasks),
        selectinload(ResearchProject.sources),
        selectinload(ResearchProject.claims),
        selectinload(ResearchProject.conflicts)
    ).where(ResearchProject.id == id)

    result = await db.execute(query)
    p = result.scalars().first()

    if not p:
        raise HTTPException(status_code=404, detail="Research project not found")

    verified_count = sum(1 for c in p.claims if c.status == "verified")
    return ResearchDetailResponse(
        id=p.id,
        question=p.question,
        status=p.status,
        token_count=p.token_count,
        cost_estimate=p.cost_estimate,
        created_at=p.created_at,
        tasks=[t for t in p.tasks],
        sources_count=len(p.sources),
        claims_count=len(p.claims),
        verified_claims_count=verified_count,
        conflicts_count=len(p.conflicts),
        sources=[s for s in p.sources],
        claims=[c for c in p.claims],
        conflicts=[conf for conf in p.conflicts]
    )

@router.get("/report/{id}")
async def get_report(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.research_id == id))
    report = result.scalars().first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not ready or not found")

    try:
        report_data = json.loads(report.content)
        return report_data
    except Exception:
        return {"content": report.content, "format": report.format}

@router.post("/export")
async def export_report(payload: ExportRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.research_id == payload.research_id))
    report = result.scalars().first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report_data = json.loads(report.content)
    fmt = payload.format.lower()

    if fmt == "pdf":
        pdf_bytes = ExportService.export_pdf(report_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=researchmind_report_{payload.research_id[:8]}.pdf"}
        )
    elif fmt == "docx":
        docx_bytes = ExportService.export_docx(report_data)
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=researchmind_report_{payload.research_id[:8]}.docx"}
        )
    else:  # Markdown
        md_text = ExportService.export_markdown(report_data)
        return Response(
            content=md_text,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=researchmind_report_{payload.research_id[:8]}.md"}
        )
