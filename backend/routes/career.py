import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.database.database import get_db
from backend.models.models import CareerAnalysis, User
from backend.models.schemas import (
    CareerCreateRequest, CareerAnalysisResponse, CareerListItemResponse
)
from backend.services.auth import get_current_user_optional
from agents.career_agent import CareerAgent

router = APIRouter(prefix="/career", tags=["Career & CV Intelligence"])

@router.post("/analyze", response_model=CareerAnalysisResponse)
async def analyze_career_profile(
    payload: CareerCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    agent = CareerAgent()

    # Step 1: Fetch GitHub Data
    github_data = await agent.fetch_github_profile(payload.github_username)

    # Step 2: Fetch Company Intelligence
    company_data = await agent.fetch_company_intelligence(payload.company_name, payload.job_role)

    # Step 3: Generate Analysis
    result = await agent.generate_career_analysis(
        github_info=github_data,
        company_info=company_data,
        job_description=payload.job_description
    )

    # Step 4: Persist in DB
    record = CareerAnalysis(
        user_id=current_user.id if current_user else None,
        github_username=github_data.get("username", payload.github_username),
        company_name=payload.company_name,
        job_role=payload.job_role,
        job_description=payload.job_description,
        match_score=result.get("match_score", 75),
        result_json=json.dumps(result)
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return CareerAnalysisResponse(
        id=record.id,
        github_username=record.github_username,
        company_name=record.company_name,
        job_role=record.job_role,
        job_description=record.job_description,
        match_score=record.match_score,
        result=result,
        created_at=record.created_at
    )

@router.get("/history", response_model=List[CareerListItemResponse])
async def get_career_history(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = select(CareerAnalysis).order_by(CareerAnalysis.created_at.desc())
    if current_user:
        query = query.where(CareerAnalysis.user_id == current_user.id)

    res = await db.execute(query.limit(20))
    items = res.scalars().all()

    return [
        CareerListItemResponse(
            id=item.id,
            github_username=item.github_username,
            company_name=item.company_name,
            job_role=item.job_role,
            match_score=item.match_score,
            created_at=item.created_at
        ) for item in items
    ]

@router.get("/{id}", response_model=CareerAnalysisResponse)
async def get_career_analysis_by_id(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(CareerAnalysis).where(CareerAnalysis.id == id))
    record = res.scalars().first()
    if not record:
        raise HTTPException(status_code=404, detail="Career analysis not found")

    try:
        parsed_result = json.loads(record.result_json)
    except Exception:
        parsed_result = {}

    return CareerAnalysisResponse(
        id=record.id,
        github_username=record.github_username,
        company_name=record.company_name,
        job_role=record.job_role,
        job_description=record.job_description,
        match_score=record.match_score,
        result=parsed_result,
        created_at=record.created_at
    )

@router.post("/{id}/export")
async def export_career_analysis(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(CareerAnalysis).where(CareerAnalysis.id == id))
    record = res.scalars().first()
    if not record:
        raise HTTPException(status_code=404, detail="Career analysis not found")

    parsed_result = json.loads(record.result_json)

    # Generate Markdown export content
    md = []
    md.append(f"# Career & CV Interview Intelligence Guide: {record.company_name} — {record.job_role}")
    md.append(f"**Candidate GitHub**: [{record.github_username}](https://github.com/{record.github_username})")
    md.append(f"**Compatibility Score**: {record.match_score}% ({parsed_result.get('verdict_badge', '')})")
    md.append(f"\n## Fit Verdict\n{parsed_result.get('fit_verdict', '')}\n")

    md.append("## Skill Ranking Matrix")
    for s in parsed_result.get("skill_matrix", []):
        md.append(f"- **{s.get('skill_name')}** ({s.get('category')}): {s.get('mastery_level')} | Status: {s.get('status')} | Action: {s.get('action')}")

    md.append("\n## Company Interview Rounds & Preparation Roadmap")
    for r in parsed_result.get("interview_rounds", []):
        md.append(f"### {r.get('title')} ({r.get('duration')})")
        md.append(f"- **Focus**: {r.get('focus')}")
        md.append(f"- **Key Topics**: {', '.join(r.get('key_topics', []))}")
        md.append(f"- **Tip**: {r.get('preparation_tips')}\n")

    md.append("## Recommended Projects to Add to CV")
    for p in parsed_result.get("project_recommendations", []):
        md.append(f"### {p.get('project_title')}")
        md.append(f"**Tech Stack**: {', '.join(p.get('tech_stack', []))}")
        md.append(f"**Architecture**: {p.get('architecture_overview')}\n")
        md.append("**CV Resume STAR Bullet Points:**")
        for b in p.get("cv_star_bullets", []):
            md.append(f"- {b}")
        md.append("\n**How to Explain in Technical Interviews:**")
        sc = p.get("interview_explanation_script", {})
        md.append(f"- *Elevator Pitch*: {sc.get('elevator_pitch')}")
        md.append(f"- *Key Technical Trade-off*: {sc.get('key_technical_tradeoff')}")
        md.append(f"- *Quantified Outcome*: {sc.get('quantified_result')}\n")

    content = "\n".join(md)
    return Response(
        content=content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=Interview_CV_Guide_{record.company_name}.md"}
    )
