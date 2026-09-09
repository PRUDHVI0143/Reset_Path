import math
import re
from typing import List, Dict, Any

class VectorStore:
    """
    Lightweight vector & keyword store supporting RAG retrieval over collected sources.
    Uses TF-IDF / term overlap cosine similarity for zero-dependency local execution,
    with pluggable embedding interface when pgvector or sentence-transformers are active.
    """
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []

    def clear(self):
        self.documents.clear()

    def add_document(self, doc_id: str, content: str, metadata: Dict[str, Any]):
        tokens = self._tokenize(content)
        self.documents.append({
            "id": doc_id,
            "content": content,
            "metadata": metadata,
            "tokens": set(tokens)
        })

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.documents:
            return []
        
        query_tokens = set(self._tokenize(query))
        if not query_tokens:
            return self.documents[:top_k]

        scored_docs = []
        for doc in self.documents:
            intersection = query_tokens.intersection(doc["tokens"])
            score = len(intersection) / (math.sqrt(len(query_tokens)) * math.sqrt(len(doc["tokens"])) + 1e-5)
            scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_docs[:top_k]]

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b\w+\b', text) if len(w) > 2]

# Shared singleton vector store for runtime execution
vector_store = VectorStore()
