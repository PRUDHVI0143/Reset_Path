# ResearchMind AI — Architecture Decisions & Design Rationale

This document logs key design choices, architectural trade-offs, confidence scoring formulas, conflict detection logic, and agent orchestration patterns used in **ResearchMind AI**.

---

## 1. Agent Orchestration: LangGraph & Custom State Machines

### Choice: LangGraph (with custom state machine backup)
- **Why LangGraph?**
  LangGraph provides cyclic state graph modeling ideal for multi-agent loops (e.g., Fact-Checker conditional loop returning to Research Agent when claim confidence < 80%). It manages persistent task state, fan-out parallel execution (up to 3 concurrent tasks), and conditional routing.
- **State Structure**:
  ```python
  class ResearchState(TypedDict):
      research_id: str
      question: str
      tasks: List[Task]
      sources: List[Source]
      data_points: List[DataPoint]
      claims: List[Claim]
      conflicts: List[Conflict]
      token_count: int
      cost_estimate: float
      retry_counts: Dict[str, int]
      report: Dict[str, Any]
      status: str
  ```

---

## 2. Confidence Scoring Method

### Exact Formula:
$$\text{Confidence Score} = \min\left(1.0, w_1 \cdot \frac{N_{\text{supports}}}{N_{\text{supports}} + N_{\text{contradicts}}} + w_2 \cdot S_{\text{reliability}} + w_3 \cdot S_{\text{llm\_judge}}\right)$$

Where:
- $N_{\text{supports}}$: Count of independent sources supporting the claim.
- $N_{\text{contradicts}}$: Count of independent sources contradicting the claim.
- $S_{\text{reliability}}$: Weighted average domain/publisher reliability score (0.0 to 1.0).
- $S_{\text{llm\_judge}}$: LLM-as-judge evaluation score (0.0 to 1.0) assessing factual context and semantic alignment.
- Weights: $w_1 = 0.50$, $w_2 = 0.25$, $w_3 = 0.25$.

### Threshold Policy:
- **Confidence > 80% (0.80)**: Claim marked `verified` and passed to Writer Agent.
- **Confidence ≤ 80% (0.80)**: Triggers retry loop (max 2 retries). If still unverified after 2 retries, claim is flagged as `unverified` and highlighted under the report's *Unverified & Disputed Claims* section.

---

## 3. Conflict Threshold Logic

### Rule:
1. **Numeric Claims**: Any quantitative value difference **> 15%** between two independent sources triggers a conflict flag.
   $$\text{Variance} = \frac{|V_1 - V_2|}{\text{mean}(V_1, V_2)} > 0.15$$
2. **Categorical / Qualitative Discrepancy**: Direct stance contradictions (e.g., Source A states "Government banned X", Source B states "Government promoted X") flag a conflict regardless of numeric threshold.

---

## 4. Search Strategy: Live Search vs. RAG Retrieval

- **Live Web Search**: Executed once per task during the Research Agent phase using DuckDuckGo / Tavily APIs. Search results and full text snippets are stored in the database and embedded in `pgvector` (or in-memory vector store).
- **RAG Retrieval**: Fact Checker and Writer agents query stored embeddings locally using similarity search ($k=5$), avoiding repetitive external API calls and keeping request latency and token usage minimal.

---

## 5. Token Budget & Cost Policy

- **Token Cap**: 50,000 tokens per research project request.
- **Over-Budget Behavior**: If token count reaches 50,000, remaining evidence sources are automatically summarized into compact bullet points before synthesis rather than aborting. The report explicitly adds a *Limitations & Token Budget Note* notifying the user.

---

## 6. Export Pipeline

- **PDF Export**: Built with `reportlab` producing clean, styled document layouts with titles, executive summaries, table data, and references.
- **DOCX Export**: Built with `python-docx` generating structured Word documents.
- **Markdown Export**: Direct raw markdown format with embedded JSON chart specs for external tools.
