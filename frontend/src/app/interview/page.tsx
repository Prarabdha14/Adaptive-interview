"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Loader2, Send, BrainCircuit, Activity, Clock, ShieldCheck } from "lucide-react"
import { QuestionCard } from "@/components/interview/QuestionCard"
import { EvaluationToast } from "@/components/interview/EvaluationToast"

interface Question {
  question_id: string
  question_text: string
}

export default function InterviewPage() {
  const router = useRouter()
  const { sessionId } = useStore()
  
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [questionCount, setQuestionCount] = useState(1)
  const [timer, setTimer] = useState(0)
  const MAX_QUESTIONS = 3

  useEffect(() => {
    if (!sessionId) {
      router.push("/")
      return
    }
    fetchNextQuestion()
  }, [sessionId, router])

  // Interview Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (question && !evaluation) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [question, evaluation]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const fetchNextQuestion = async () => {
    setLoading(true)
    setTimer(0)
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/interview/question/${sessionId}`)
      setQuestion(res.data)
      setAnswer("")
    } catch (error) {
      console.error(error)
      alert("Error fetching question.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !question) return
    
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:8000/api/v1/interview/answer", {
        session_id: sessionId,
        question_id: question.question_id,
        answer_text: answer
      })
      setEvaluation(res.data)
    } catch (error) {
      console.error(error)
      alert("Error submitting answer.")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    setEvaluation(null)
    if (questionCount >= MAX_QUESTIONS) {
      router.push("/summary")
    } else {
      setQuestionCount(prev => prev + 1)
      await fetchNextQuestion()
    }
  }

  if (!sessionId) return null

  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-gray-800/60 glass flex items-center justify-between px-6 z-10">
        <div className="flex items-center">
          <BrainCircuit className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-gray-200 font-semibold tracking-wide">Orchestration Engine</span>
        </div>
        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {formatTime(timer)}</div>
          <div className="flex items-center"><Activity className="w-4 h-4 mr-1.5 text-green-500" /> Live Connection</div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 z-10">
        
        {/* Left Panel: Status & Progress */}
        <div className="md:col-span-3 space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-semibold">Session Progress</h3>
            
            <div className="space-y-4">
              {[...Array(MAX_QUESTIONS)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${i + 1 < questionCount ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                      i + 1 === questionCount ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 
                      'bg-gray-800/50 text-gray-500 border border-gray-700/50'}`}
                  >
                    {i + 1 < questionCount ? <ShieldCheck className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className="ml-3">
                    <span className={`text-sm ${i + 1 === questionCount ? 'text-gray-200 font-medium' : 'text-gray-500'}`}>
                      Question {i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-semibold">AI Adaptive Logic</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Retrieval Pipeline</span>
                <span className="text-xs text-blue-400 font-medium flex items-center">
                  Hybrid (Vector + BM25) <span className="w-2 h-2 rounded-full bg-blue-500 ml-2 animate-pulse" />
                </span>
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">State Memory</span>
                <span className="text-xs text-green-400 font-medium flex items-center">
                  Active Tracking
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Panel: Interaction */}
        <div className="md:col-span-9 flex flex-col">
          
          <AnimatePresence mode="wait">
            {!evaluation ? (
              <motion.div 
                key="question-box"
                className="flex-1 flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Question Area */}
                <div className="glass-card rounded-2xl p-8 mb-6 border-blue-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
                    <span className="text-sm font-medium text-blue-400">AI Interviewer Generating...</span>
                  </div>
                  
                  {loading && !question ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                      <span className="text-sm">Synthesizing context & generating adaptive query...</span>
                    </div>
                  ) : (
                    question && <QuestionCard questionText={question.question_text} />
                  )}
                </div>

                {/* Answer Input Area */}
                <div className="relative flex-1 min-h-[200px]">
                  <textarea 
                    className="w-full h-full min-h-[200px] bg-gray-900/60 border border-gray-700/50 rounded-2xl p-6 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all glass placeholder:text-gray-600 font-light text-lg leading-relaxed shadow-inner"
                    placeholder="Construct your technical response here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={loading || !question}
                  />
                  <div className="absolute bottom-6 right-6 flex items-center">
                    <span className="text-xs text-gray-500 mr-4 hidden sm:inline-block">Cmd + Enter to submit</span>
                    <Button 
                      onClick={handleSubmitAnswer} 
                      disabled={loading || !answer.trim()}
                      className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all h-10 px-6 rounded-xl"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <><Send className="mr-2 h-4 w-4" /> Submit Response</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="evaluation-box"
                className="flex-1 flex flex-col justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <EvaluationToast 
                  evaluation={evaluation} 
                  onNext={handleNext} 
                  isLastQuestion={questionCount >= MAX_QUESTIONS} 
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </main>
  )
}
