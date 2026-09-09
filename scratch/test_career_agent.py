import asyncio
from backend.database.database import init_db
from agents.career_agent import CareerAgent

async def main():
    print("=== Testing Real-Time Dynamic Company Tech Stack Scraper ===")
    await init_db()
    agent = CareerAgent()

    github_octocat = await agent.fetch_github_profile("octocat")
    print(f"Candidate GitHub: {github_octocat['username']} | Languages: {github_octocat['primary_languages']}")

    companies = [
        ("Adobe", "Software Engineer"),
        ("Salesforce", "Full Stack Engineer"),
        ("Nvidia", "Systems Engineer"),
        ("Capgemini", "Enterprise Developer"),
        ("Google", "Backend Engineer")
    ]

    scores = []
    for comp_name, role in companies:
        comp_info = await agent.fetch_company_intelligence(comp_name, role)
        res = await agent.generate_career_analysis(github_octocat, comp_info)
        summary = res.get("tech_overlap_summary", {})
        score = res['match_score']
        scores.append(score)
        print(f"\n---> Company: {comp_name} ({role})")
        print(f"     Match Score: {score}%")
        print(f"     Required Tech: {comp_info.get('required_tech_keywords')}")
        print(f"     Matched Tech: {summary.get('matched_tech')}")
        print(f"     Missing Tech: {summary.get('missing_tech')}")

    print("\nScore Summary Across 5 Companies:", scores)
    if len(set(scores)) > 1:
        print(" SUCCESS: Match scores vary dynamically for each company!")
    else:
        print(" FAILURE: All scores are identical!")

if __name__ == "__main__":
    asyncio.run(main())
