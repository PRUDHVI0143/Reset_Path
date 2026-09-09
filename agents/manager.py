import re
from typing import List, Dict, Any

class ManagerAgent:
    """
    Decomposes user research questions into subtasks and checks for prompt-injection attacks.
    """
    PROMPT_INJECTION_PATTERNS = [
        r"ignore previous instructions",
        r"ignore all instructions",
        r"system prompt",
        r"you are now a",
        r"bypass security",
        r"drop database",
        r"eval\(",
        r"<script>",
    ]

    def sanitize_question(self, question: str) -> str:
        cleaned = question.strip()
        for pattern in self.PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, cleaned, re.IGNORECASE):
                raise ValueError("Potential prompt injection or invalid input pattern detected.")
        return cleaned

    async def decompose_question(self, question: str) -> List[Dict[str, Any]]:
        clean_q = self.sanitize_question(question)
        
        # Determine question intent
        is_comparison = any(kw in clean_q.lower() for kw in ["compare", "vs", "versus", "difference", "between"])
        
        tasks = []
        if is_comparison:
            tasks.append({
                "id": "task-1",
                "description": f"Gather primary factual statistics, market data, and specifications for overall topic: '{clean_q}'",
                "order_index": 1
            })
            tasks.append({
                "id": "task-2",
                "description": f"Identify performance, economic cost, efficiency, and infrastructure metrics related to: '{clean_q}'",
                "order_index": 2
            })
            tasks.append({
                "id": "task-3",
                "description": f"Extract policy impact, consumer adoption statistics, environmental considerations, and expert findings for: '{clean_q}'",
                "order_index": 3
            })
        else:
            tasks.append({
                "id": "task-1",
                "description": f"Search and collect background context, baseline definitions, and current state for: '{clean_q}'",
                "order_index": 1
            })
            tasks.append({
                "id": "task-2",
                "description": f"Extract key numeric data points, statistical metrics, and empirical evidence regarding: '{clean_q}'",
                "order_index": 2
            })
            tasks.append({
                "id": "task-3",
                "description": f"Identify conflicting views, policy impacts, and key findings for: '{clean_q}'",
                "order_index": 3
            })
            
        return tasks
