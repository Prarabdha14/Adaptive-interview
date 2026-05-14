"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { useStore } from "@/store/useStore"
import { Loader2, CheckCircle, RotateCcw, AlertTriangle, Briefcase, Activity, Hexagon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScoreRadar } from "@/components/analytics/ScoreRadar"
import { TraceabilityViewer } from "@/components/analytics/TraceabilityViewer"

interface Trace {
  generated_query: string
  retrieved_chunk_ids: string[]
  retrieved_scores: number[]
  source_documents: string[]
  retrieved_context: string
  prompt_used: string
}

interface QAPair {
  question_id: string
  question_text: string
  answer_text: string | null
  evaluation: {
    correctness_score: number
    depth_score: number
    feedback: string
    strengths: string[]
    weaknesses: string[]
  } | null
  trace: Trace | null
}

interface Analytics {
  strong_areas: string[]
  weak_areas: string[]
  topics_covered: string[]
  average_score: number
  confidence_score: number
  communication_score: number
  technical_depth_score: number
  adaptability_score: number
  recommended_level: string
  hiring_signal: string
  overall_feedback: string
}

interface SummaryData {
  session_id: string
  candidate_name: string
  role_title: string
  qa_pairs: QAPair[]
  analytics: Analytics
}

export default function SummaryPage() {
  const router = useRouter()
  const { sessionId, reset } = useStore()
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      router.push("/")
      return
    }

    const fetchSummary = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/interview/summary/${sessionId}`)
        setData(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [sessionId, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center text-blue-400 z-10"
        >
          <div className="relative">
            <Hexagon className="w-16 h-16 animate-pulse text-blue-500/50" />
            <Loader2 className="w-8 h-8 animate-spin absolute top-4 left-4" />
          </div>
          <p className="mt-6 font-mono text-sm uppercase tracking-widest text-gray-400">Synthesizing Hiring Intelligence...</p>
        </motion.div>
      </main>
    )
  }

  if (!data) return <div className="p-8 text-center text-red-500 bg-[#030712] min-h-screen">Failed to load summary.</div>

  const isStrong = data.analytics.hiring_signal.includes("Strong");
  const isNoHire = data.analytics.hiring_signal.includes("No");
  
  const signalTheme = {
    color: isStrong ? 'text-green-400' : isNoHire ? 'text-red-400' : 'text-blue-400',
    bg: isStrong ? 'bg-green-500/10' : isNoHire ? 'bg-red-500/10' : 'bg-blue-500/10',
    border: isStrong ? 'border-green-500/20' : isNoHire ? 'border-red-500/20' : 'border-blue-500/20',
    shadow: isStrong ? 'shadow-[0_0_30px_rgba(34,197,94,0.15)]' : isNoHire ? 'shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'shadow-[0_0_30px_rgba(59,130,246,0.15)]'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-[#030712] relative py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        className="max-w-6xl mx-auto space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className="glass border-b border-gray-800/60 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20 mb-3">
              <Activity className="h-3 w-3 text-blue-400 mr-1.5" />
              <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-widest">Hiring Intelligence Report</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{data.candidate_name}</h1>
            <p className="text-gray-400 mt-1 flex items-center text-sm">
              Target Role: <span className="font-medium text-gray-200 ml-1 bg-gray-800 px-2 py-0.5 rounded">{data.role_title}</span>
            </p>
          </div>
          <Button 
            variant="outline" 
            className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            onClick={() => { reset(); router.push("/"); }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> New Evaluation
          </Button>
        </motion.div>

        {/* Top Dashboard Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Hiring Signal Card */}
          <motion.div variants={itemVariants} className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-6 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-gray-400" /> Final Decision
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className={`w-full py-8 rounded-xl border flex items-center justify-center ${signalTheme.bg} ${signalTheme.border} ${signalTheme.shadow}`}
              >
                <h2 className={`text-3xl font-black uppercase tracking-widest ${signalTheme.color}`}>
                  {data.analytics.hiring_signal}
                </h2>
              </motion.div>
              
              <div className="mt-8 text-center">
                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Recommended Level</span>
                <span className="text-xl font-semibold text-gray-200">{data.analytics.recommended_level}</span>
              </div>
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div variants={itemVariants} className="md:col-span-8 glass-card rounded-2xl p-6">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4 flex items-center">
              <Hexagon className="w-4 h-4 mr-2 text-gray-400" /> Performance Breakdown
            </h3>
            <ScoreRadar data={data.analytics} />
          </motion.div>
        </div>

        {/* Feedback Section */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-white mb-4">Overall AI Synthesis</h3>
          <p className="text-gray-300 leading-relaxed font-light">{data.analytics.overall_feedback}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-green-500/5 p-5 rounded-xl border border-green-500/10">
              <h4 className="font-semibold text-green-400 flex items-center mb-4 text-sm uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 mr-2"/> Top Strengths
              </h4>
              <ul className="space-y-3">
                {data.analytics.strong_areas.map((area, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-3 shrink-0" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-500/5 p-5 rounded-xl border border-amber-500/10">
              <h4 className="font-semibold text-amber-400 flex items-center mb-4 text-sm uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 mr-2"/> Growth Areas
              </h4>
              <ul className="space-y-3">
                {data.analytics.weak_areas.map((area, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-3 shrink-0" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Detailed Q&A and Traceability */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold text-white mt-12 mb-6">Question Evaluation & Hybrid RAG Trace</h2>
          <div className="space-y-8">
            {data.qa_pairs.map((qa, i) => (
              <motion.div 
                key={qa.question_id} 
                className="glass-card rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="bg-gray-900/80 p-6 border-b border-gray-800">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 block">Question {i+1}</span>
                  <p className="text-lg font-medium text-gray-100">{qa.question_text}</p>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <span className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Candidate Response</span>
                    <p className="text-gray-300 font-light italic border-l-2 border-gray-700 pl-4 py-1">{qa.answer_text || "No response provided."}</p>
                  </div>

                  {qa.evaluation && (
                    <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700/50 mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-semibold text-gray-200">AI Evaluation</h4>
                        <div className="flex space-x-4">
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase block">Correctness</span>
                            <span className="font-mono text-green-400 font-bold">{qa.evaluation.correctness_score}/10</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase block">Depth</span>
                            <span className="font-mono text-green-400 font-bold">{qa.evaluation.depth_score}/10</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{qa.evaluation.feedback}</p>
                    </div>
                  )}
                  
                  {qa.trace && <TraceabilityViewer trace={qa.trace} />}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </main>
  )
}
