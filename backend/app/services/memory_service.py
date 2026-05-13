from app.models.all import InterviewSession

class MemoryService:
    @staticmethod
    def update_memory(session: InterviewSession, question_text: str, topic: str, correctness: float):
        # Initialize if empty
        if not session.topic_frequency_map:
            session.topic_frequency_map = {}
        if not session.covered_topics:
            session.covered_topics = []
        if not session.weak_topics:
            session.weak_topics = []
        if not session.strong_topics:
            session.strong_topics = []

        # Update frequency
        freq = session.topic_frequency_map.get(topic, 0)
        session.topic_frequency_map[topic] = freq + 1
        
        if topic not in session.covered_topics:
            session.covered_topics.append(topic)
            
        # Update strength/weakness
        if correctness >= 8.0:
            if topic not in session.strong_topics:
                session.strong_topics.append(topic)
            if topic in session.weak_topics:
                session.weak_topics.remove(topic)
        elif correctness <= 5.0:
            if topic not in session.weak_topics:
                session.weak_topics.append(topic)
            if topic in session.strong_topics:
                session.strong_topics.remove(topic)

    @staticmethod
    def get_memory_directive(session: InterviewSession) -> dict:
        covered = ", ".join(session.covered_topics) if session.covered_topics else "None"
        weak = ", ".join(session.weak_topics) if session.weak_topics else "None"
        
        return {
            "covered_topics": covered,
            "weak_topics": weak
        }
