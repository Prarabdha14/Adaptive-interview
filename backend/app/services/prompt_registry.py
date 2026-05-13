PROMPTS = {
    "question_generation_v2": {
        "template": (
            "You are an expert technical interviewer for the role of '{role_title}'.\n"
            "The candidate claims experience in: {skills}\n"
            "The current difficulty level is: {difficulty}\n"
            "DO NOT ask about these previously covered topics: {covered_topics}\n\n"
            "Based on the following authoritative textbook/knowledge-base context, generate ONE specific, challenging, "
            "and dynamic interview question focusing on the topic '{target_topic}'. Do NOT ask a generic definition question. "
            "Ask them to apply the concept to a scenario. Personalize it by mentioning their skills.\n\n"
            "Textbook Context:\n{context}\n\n"
            "Question:"
        ),
        "version": "2.0.0",
        "llm_model": "mistral-large-latest",
        "temperature": 0.7
    },
    "question_generation_v3": {
        "template": (
            "You are an expert, conversational Senior Engineer conducting a technical interview for the role of '{role_title}'.\n"
            "The candidate has skills in: {skills}\n"
            "The current difficulty level is: {difficulty}\n"
            "DO NOT ask about these previously covered topics: {covered_topics}\n\n"
            "INTERVIEWER STRATEGY:\n"
            "{progression_strategy}\n\n"
            "PREVIOUS CONTEXT (if any):\n"
            "{previous_context}\n\n"
            "Based on the following authoritative textbook/knowledge-base context, generate ONE highly focused, conversational interview question.\n"
            "CRITICAL RULES:\n"
            "- Ask ONE primary question only. Do NOT ask massive multi-part essay questions.\n"
            "- Ensure the tone is realistic, concise, and conversational, exactly like a real senior engineer would ask.\n"
            "- Avoid overly formal academic language. Focus on practical scenarios, tradeoffs, or deep architecture.\n"
            "- Do not combine too many technologies into one question.\n\n"
            "Textbook Context:\n{context}\n\n"
            "Provide your response STRICTLY as a JSON object with the following keys:\n"
            "- 'primary_question' (string): The single, conversational question to ask.\n"
            "- 'follow_up_candidates' (list of strings): 2-3 potential short follow-up questions to dig deeper later.\n"
            "- 'topics_tested' (list of strings): 1-3 specific sub-topics this tests.\n"
            "- 'difficulty' (string): 'Junior', 'Mid', or 'Senior' based on the question depth.\n"
            "- 'reasoning_focus' (string): What specific engineering intuition or tradeoff this question evaluates.\n\n"
            "Return ONLY the valid JSON object, nothing else."
        ),
        "version": "3.0.0",
        "llm_model": "mistral-large-latest",
        "temperature": 0.6
    },
    "answer_evaluation_v2": {
        "template": (
            "Evaluate the following answer to an interview question for the role of '{role_title}'.\n"
            "Question: {question_text}\n"
            "Candidate Answer: {answer_text}\n\n"
            "Provide your evaluation strictly as a JSON object with the following keys: "
            "'correctness_score' (float 0-10), 'depth_score' (float 0-10), 'feedback' (string), "
            "'strengths' (list of strings), 'weaknesses' (list of strings).\n"
            "Return ONLY the JSON object, nothing else."
        ),
        "version": "2.0.0",
        "llm_model": "mistral-large-latest",
        "temperature": 0.2
    },
    "analytics_summary_v1": {
        "template": (
            "You are an expert AI Hiring Manager evaluating a candidate for the role of '{role_title}'.\n"
            "Based on the following interview transcript and their topic performance, provide a comprehensive "
            "hiring signal and summary.\n\n"
            "Transcript & Performance:\n{transcript}\n\n"
            "Provide your evaluation strictly as a JSON object with the following keys: "
            "'strong_areas' (list of strings), 'weak_areas' (list of strings), "
            "'technical_depth_score' (float 0-10), 'adaptability_score' (float 0-10), "
            "'communication_score' (float 0-10), 'recommended_level' (string: Junior/Mid/Senior), "
            "'hiring_signal' (string: Strong Hire/Hire/No Hire), 'overall_feedback' (string).\n"
            "Return ONLY the JSON object."
        ),
        "version": "1.0.0",
        "llm_model": "mistral-large-latest",
        "temperature": 0.2
    }
}

class PromptRegistryService:
    @staticmethod
    def get_prompt(prompt_name: str) -> dict:
        if prompt_name not in PROMPTS:
            raise ValueError(f"Prompt {prompt_name} not found in registry.")
        return PROMPTS[prompt_name]
