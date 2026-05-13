from app.models.all import InterviewSession

class InterviewFlowPlannerService:
    @staticmethod
    def plan_next_step(session: InterviewSession) -> dict:
        """
        Analyzes the current session to determine if the next question should be 
        a primary topic introduction or a follow-up probe to the previous question.
        
        Progression Logic:
        - Question 1: Primary Scenario
        - Question 2: Follow-up Probe
        - Question 3: Deep Technical Dive
        - Question 4: New Primary Scenario
        ...
        """
        questions_asked = len(session.questions)
        
        # Determine the phase in the 3-question cycle
        cycle_position = questions_asked % 3
        
        is_follow_up = False
        progression_strategy = ""
        previous_context = ""
        
        if cycle_position == 0:
            is_follow_up = False
            progression_strategy = "Introduce a brand new, primary architecture or system design scenario based on the candidate's skills."
        elif cycle_position == 1:
            is_follow_up = True
            progression_strategy = "Probe deeper into the previous answer. Ask about a specific tradeoff, edge case, or performance implication."
        else:
            is_follow_up = True
            progression_strategy = "Push the candidate to their limit on this current topic. Introduce a scaling challenge, a failure state, or an advanced technical constraint."
            
        # Extract previous context if this is a follow-up
        if is_follow_up and questions_asked > 0:
            last_question = session.questions[-1]
            last_answer = last_question.answer.answer_text if last_question.answer else "Candidate did not answer."
            
            previous_context = (
                f"Previous Question: {last_question.question_text}\n"
                f"Candidate's Answer: {last_answer}"
            )
            
        return {
            "is_follow_up": is_follow_up,
            "progression_strategy": progression_strategy,
            "previous_context": previous_context
        }
