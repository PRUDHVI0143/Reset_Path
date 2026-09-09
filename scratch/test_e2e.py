import asyncio
import json
from backend.database.database import init_db, AsyncSessionLocal
from agents.pipeline import ResearchPipeline
from backend.services.export_service import ExportService

async def main():
    print("=== Initializing Database ===")
    await init_db()
    
    print("\n=== Launching Pipeline ===")
    pipeline = ResearchPipeline()
    research_id = "test-e2e-001"
    question = "Compare electric vehicles and petrol vehicles in India"
    
    state = await pipeline.execute(research_id, question)
    print("Status:", state["status"])
    print("Token Count:", state["token_count"])
    print("Cost Estimate: $", state["cost_estimate"])
    print("Tasks count:", len(state["tasks"]))
    print("Sources count:", len(state["sources"]))
    print("Claims count:", len(state["claims"]))
    print("Conflicts count:", len(state["conflicts"]))
    print("Charts count:", len(state["charts_data"].get("charts", [])))
    
    report = state["report"]
    print("\n=== Report Details ===")
    print("Title:", report.get("title"))
    print("Confidence Score:", report.get("confidence_score"))
    print("Executive Summary:", report.get("executive_summary")[:120], "...")
    print("Key Findings count:", len(report.get("key_findings", [])))
    
    print("\n=== Testing Export Service ===")
    md_text = ExportService.export_markdown(report)
    print("Markdown Export length:", len(md_text))
    
    pdf_bytes = ExportService.export_pdf(report)
    print("PDF Export size:", len(pdf_bytes), "bytes")
    
    docx_bytes = ExportService.export_docx(report)
    print("DOCX Export size:", len(docx_bytes), "bytes")
    
    print("\n=== ALL E2E TESTS PASSED ===")

if __name__ == "__main__":
    asyncio.run(main())
