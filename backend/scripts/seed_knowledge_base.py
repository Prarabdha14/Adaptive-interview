import os
import sys

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", ".env"))

from langchain_core.documents import Document
from app.services.llm_service import get_vectorstore

KNOWLEDGE_BASE = [
    {
        "content": "In Python, the Global Interpreter Lock (GIL) is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once. This lock is necessary mainly because CPython's memory management is not thread-safe. As a result, multithreading in Python is not suitable for CPU-bound tasks, although it works well for I/O-bound tasks. For CPU-bound tasks, the multiprocessing module should be used instead.",
        "metadata": {"topic": "Concurrency", "role": "Backend Engineer", "difficulty": "Medium", "source": "Python Advanced Textbook", "chapter": "1. Threads"}
    },
    {
        "content": "React's Virtual DOM is a programming concept where an ideal, or 'virtual', representation of a UI is kept in memory and synced with the 'real' DOM by a library such as ReactDOM. This process is called reconciliation. When state changes, React creates a new Virtual DOM tree and compares it with the previous one (diffing). It then calculates the most efficient way to update the real DOM, minimizing expensive layout recalculations.",
        "metadata": {"topic": "React Virtual DOM", "role": "Frontend Engineer", "difficulty": "Medium", "source": "React Internals Guide"}
    },
    {
        "content": "In distributed systems, a load balancer sits in front of servers and routes client requests across all servers capable of fulfilling those requests in a manner that maximizes speed and capacity utilization. Advanced load balancing algorithms include Least Connections (sends traffic to the server with the fewest active connections) and Consistent Hashing (ensures requests from a specific client consistently map to the same server to utilize local caches).",
        "metadata": {"topic": "System Design", "role": "Backend Architect", "difficulty": "Hard", "source": "Designing Data-Intensive Applications"}
    },
    {
        "content": "A memory leak in JavaScript occurs when the application no longer needs memory but fails to return it to the operating system or pool of free memory. Common causes include unintended global variables, forgotten timers or callbacks, out of DOM references, and closures. Even though V8 has a garbage collector, it uses a mark-and-sweep algorithm which can only clear memory if it is completely unreachable from the root object.",
        "metadata": {"topic": "Memory Management", "role": "Frontend Engineer", "difficulty": "Hard", "source": "JavaScript Performance Tuning"}
    },
    {
        "content": "PostgreSQL uses Multi-Version Concurrency Control (MVCC) to ensure data consistency and high performance in concurrent environments. Instead of locking a row when reading, PostgreSQL maintains multiple versions of the row. When a transaction updates a row, a new version is created, and the old version is kept until no active transactions can see it. This means 'readers never block writers, and writers never block readers', but it requires periodic VACUUM processes to clean up dead tuples.",
        "metadata": {"topic": "Databases", "role": "Backend Engineer", "difficulty": "Hard", "source": "PostgreSQL Internals"}
    }
]

def seed_db():
    print("Initializing Vectorstore...")
    vectorstore = get_vectorstore()
    
    docs = []
    for item in KNOWLEDGE_BASE:
        doc = Document(
            page_content=item["content"],
            metadata={
                **item["metadata"],
                "doc_type": "textbook"
            }
        )
        docs.append(doc)
        
    print(f"Ingesting {len(docs)} textbook chunks...")
    vectorstore.add_documents(docs)
    vectorstore.persist()
    print("Knowledge base seeded successfully!")

if __name__ == "__main__":
    seed_db()
