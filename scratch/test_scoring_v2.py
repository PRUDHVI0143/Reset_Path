import asyncio
from agents.career_agent import CareerAgent

async def test():
    agent = CareerAgent()
    
    # Test with Python/JS/SQL user
    github_python = {
        'username': 'pythonuser',
        'primary_languages': ['python', 'javascript', 'typescript', 'sql'],
        'public_repos': 15,
        'top_projects': [
            {'name': 'django-api', 'description': 'REST API with Django and PostgreSQL', 'language': 'Python', 'stars': 8},
            {'name': 'react-app', 'description': 'React TypeScript web application', 'language': 'TypeScript', 'stars': 4},
            {'name': 'data-pipeline', 'description': 'Data ETL pipeline with pandas', 'language': 'Python', 'stars': 2},
        ]
    }
    
    companies = [
        ('Nvidia', 'Systems Engineer'),
        ('Salesforce', 'Full Stack Engineer'),
        ('Google', 'Backend Engineer'),
        ('Capgemini', 'Enterprise Developer'),
        ('Razorpay', 'Backend Engineer'),
        ('Adobe', 'Software Engineer'),
    ]
    
    scores = []
    print("=" * 70)
    print("Company-Specific Dynamic Score Test")
    print("=" * 70)
    for company, role in companies:
        company_info = await agent.fetch_company_intelligence(company, role)
        result = await agent.generate_career_analysis(github_python, company_info)
        score = result['match_score']
        scores.append(score)
        overlap = result['tech_overlap_summary']
        matched = overlap.get('critical_matched', [])
        missing = overlap.get('critical_missing', [])
        print(f"\n{company} ({role}): {score}%")
        print(f"  Must-Have Matched: {matched}")
        print(f"  Must-Have Missing: {missing}")
        print(f"  Verdict: {result['verdict_badge'].encode('ascii', 'replace').decode()}")
    
    print("\n" + "=" * 70)
    print(f"Scores: {scores}")
    print(f"Unique scores: {len(set(scores))}/{len(scores)}")
    print(f"Score range: {min(scores)}% - {max(scores)}%")
    
    if len(set(scores)) > len(scores) * 0.5:
        print("SUCCESS: Scores vary significantly per company!")
    else:
        print("PARTIAL: Some scores may still be similar")

asyncio.run(test())
