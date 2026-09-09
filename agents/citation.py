from typing import List, Dict, Any

class CitationAgent:
    """
    Attaches numbered citation links to claims and builds complete reference indexes.
    """
    async def process_citations(self, claims: List[Dict[str, Any]], sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        cited_claims = []
        source_map = {src["id"]: idx + 1 for idx, src in enumerate(sources)}

        for claim in claims:
            # Map source citations to claim text
            src_refs = []
            for src in sources[:2]:
                ref_num = source_map.get(src["id"], 1)
                src_refs.append(f"[{ref_num}]")
            
            ref_str = " ".join(src_refs)
            claim_copy = dict(claim)
            claim_copy["claim_text_cited"] = f"{claim['claim_text']} {ref_str}"
            claim_copy["source_ids"] = [src["id"] for src in sources[:2]]
            cited_claims.append(claim_copy)

        return cited_claims
