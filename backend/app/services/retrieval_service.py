from app.services.llm_service import get_vectorstore
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document

class RetrievalService:
    def __init__(self):
        self.vectorstore = get_vectorstore()
        self._bm25_retriever = None
        self._init_bm25()

    def _init_bm25(self):
        # Fetch all documents from Chroma to initialize BM25
        # In a real distributed system, we'd use Elasticsearch for BM25.
        try:
            db_data = self.vectorstore.get()
            docs = []
            if db_data and 'documents' in db_data and db_data['documents']:
                for i in range(len(db_data['documents'])):
                    meta = db_data['metadatas'][i] if 'metadatas' in db_data else {}
                    docs.append(Document(page_content=db_data['documents'][i], metadata=meta))
                
            if docs:
                self._bm25_retriever = BM25Retriever.from_documents(docs)
                self._bm25_retriever.k = 3
        except Exception as e:
            print(f"Error initializing BM25: {e}")

    def hybrid_search(self, query: str, filters: dict = None, k: int = 3):
        # 1. Vector Search
        vector_results = self.vectorstore.similarity_search_with_score(query, k=k, filter=filters)
        vector_docs = [res[0] for res in vector_results]
        vector_scores = {res[0].page_content: float(res[1]) for res in vector_results}

        # 2. BM25 Keyword Search
        bm25_docs = []
        if self._bm25_retriever:
            # BM25 doesn't natively support chroma metadata filters easily in LangChain without custom logic,
            # so we fetch and then filter manually if needed, or rely on ensemble.
            bm25_raw = self._bm25_retriever.invoke(query)
            if filters:
                for doc in bm25_raw:
                    match = True
                    for k_f, v_f in filters.items():
                        if doc.metadata.get(k_f) != v_f:
                            match = False
                    if match:
                        bm25_docs.append(doc)
            else:
                bm25_docs = bm25_raw
            bm25_docs = bm25_docs[:k]

        # 3. Ensemble Fusion (Reciprocal Rank Fusion logic simplified)
        # Combine docs and rank
        all_docs_map = {}
        for i, doc in enumerate(vector_docs):
            rank = i + 1
            all_docs_map[doc.page_content] = {"doc": doc, "v_rank": rank, "b_rank": 999, "v_score": vector_scores.get(doc.page_content, 0)}
            
        for i, doc in enumerate(bm25_docs):
            rank = i + 1
            if doc.page_content in all_docs_map:
                all_docs_map[doc.page_content]["b_rank"] = rank
            else:
                all_docs_map[doc.page_content] = {"doc": doc, "v_rank": 999, "b_rank": rank, "v_score": 0}
                
        # RRF formula: score = 1 / (k + rank)
        rrf_k = 60
        final_results = []
        for content, data in all_docs_map.items():
            v_rrf = 1.0 / (rrf_k + data["v_rank"]) if data["v_rank"] != 999 else 0
            b_rrf = 1.0 / (rrf_k + data["b_rank"]) if data["b_rank"] != 999 else 0
            
            # Weighted: 70% Vector, 30% BM25
            final_score = (0.7 * v_rrf) + (0.3 * b_rrf)
            data["final_score"] = final_score
            final_results.append(data)
            
        # Sort by final score descending
        final_results.sort(key=lambda x: x["final_score"], reverse=True)
        top_results = final_results[:k]
        
        # Return cleanly
        context_texts = [res["doc"].page_content for res in top_results]
        chunk_metadata = [res["doc"].metadata for res in top_results]
        v_scores = [res["v_score"] for res in top_results]
        b_scores = [res["b_rank"] for res in top_results] # Storing rank as score for simplicity
        f_scores = [res["final_score"] for res in top_results]
        
        return context_texts, chunk_metadata, v_scores, b_scores, f_scores
