-- ResearchMind AI Database Schema
-- Supports PostgreSQL (with pgvector) and SQLite compatibility

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS research_projects (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
    token_count INT DEFAULT 0,
    cost_estimate FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS research_tasks (
    id VARCHAR(36) PRIMARY KEY,
    research_id VARCHAR(36) NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, inconclusive, failed
    order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sources (
    id VARCHAR(36) PRIMARY KEY,
    research_id VARCHAR(36) NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    url VARCHAR(2000) NOT NULL,
    publisher VARCHAR(255),
    content TEXT,
    date VARCHAR(100),
    reliability_score FLOAT DEFAULT 0.8
);

CREATE TABLE IF NOT EXISTS claims (
    id VARCHAR(36) PRIMARY KEY,
    research_id VARCHAR(36) NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    confidence_score FLOAT DEFAULT 0.0,
    verification_method VARCHAR(255) DEFAULT 'agreement_count_llm_judge',
    status VARCHAR(50) DEFAULT 'unverified' -- verified, unverified, disputed
);

CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(36) PRIMARY KEY,
    claim_id VARCHAR(36) NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    source_id VARCHAR(36) NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    stance VARCHAR(50) NOT NULL -- supports, contradicts, neutral
);

CREATE TABLE IF NOT EXISTS conflicts (
    id VARCHAR(36) PRIMARY KEY,
    research_id VARCHAR(36) NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    claim_a_id VARCHAR(36) NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    claim_b_id VARCHAR(36) NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    resolution_note TEXT
);

CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) PRIMARY KEY,
    research_id VARCHAR(36) UNIQUE NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- JSON string or Markdown containing report sections, charts, metrics
    format VARCHAR(50) DEFAULT 'markdown',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_projects_user ON research_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_research ON research_tasks(research_id);
CREATE INDEX IF NOT EXISTS idx_sources_research ON sources(research_id);
CREATE INDEX IF NOT EXISTS idx_claims_research ON claims(research_id);
CREATE INDEX IF NOT EXISTS idx_evidence_claim ON evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_research ON conflicts(research_id);
