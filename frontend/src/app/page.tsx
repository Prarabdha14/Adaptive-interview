"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Briefcase, ChevronRight, User, Terminal, CheckCircle2 } from "lucide-react"
import { AnimatedDropzone } from "@/components/upload/AnimatedDropzone"

export default function Home() {
  const router = useRouter()
  const { setCandidateData, setRoleData, setSessionId } = useStore()
  
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [jobProgress, setJobProgress] = useState(0)
  const [statusText, setStatusText] = useState("Uploading...")

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name) return
    
    setLoading(true)
    setJobProgress(0)
    setStatusText("Initializing AI Ingestion...")
    const formData = new FormData()
    formData.append("file", file)
    formData.append("candidate_name", name)

    try {
      const res = await axios.post("http://localhost:8000/api/v1/resume/upload", formData)
      const jobId = res.data.job_id
      
      setStatusText("Parsing PDF & Extracting Intelligence...")
      pollJobStatus(jobId)
    } catch (error) {
      console.error(error)
      alert("Error uploading resume. Check backend connection.")
      setLoading(false)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/resume/status/${jobId}`)
      const data = res.data
      setJobProgress(data.progress)
      
      if (data.status === "completed") {
        setCandidateData(data.candidate_id, data.resume_id)
        setStep(2)
        setLoading(false)
      } else if (data.status === "failed") {
        alert("Processing failed: " + data.error_message)
        setLoading(false)
      } else {
        setTimeout(() => pollJobStatus(jobId), 1000)
      }
    } catch (error) {
      console.error(error)
      alert("Error checking status.")
      setLoading(false)
    }
  }

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    
    setLoading(true)
    setRoleData(role)
    const { candidateId, resumeId } = useStore.getState()
    
    try {
      const res = await axios.post("http://localhost:8000/api/v1/interview/start", {
        candidate_id: candidateId,
        resume_id: resumeId,
        role_id: role
      })
      setSessionId(res.data.session_id)
      router.push("/interview")
    } catch (error) {
      console.error(error)
      alert("Error starting interview.")
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
      
      <motion.div 
        className="w-full max-w-lg z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={childVariants} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-blue-500/10 rounded-full mb-4 border border-blue-500/20">
            <Terminal className="h-4 w-4 text-blue-400 mr-2" />
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Adaptive AI Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 drop-shadow-sm">Adaptive Hiring</h1>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">Orchestrating intelligent, real-time technical interviews powered by Hybrid RAG.</p>
        </motion.div>

        <motion.div variants={childVariants} className="glass-card rounded-2xl p-8 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center">
                      <User className="h-3 w-3 mr-1" /> Candidate Identity
                    </label>
                    <Input 
                      placeholder="Jane Doe" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-600 h-12 focus-visible:ring-blue-500/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" /> Background Context
                    </label>
                    <AnimatedDropzone onFileSelect={setFile} selectedFile={file} />
                  </div>

                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      className="space-y-2 mt-2"
                    >
                      <div className="flex justify-between text-xs font-medium text-blue-300">
                        <span className="flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> {statusText}</span>
                        <span>{jobProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden border border-gray-700">
                        <motion.div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full shimmer-bg"
                          initial={{ width: 0 }}
                          animate={{ width: `${jobProgress}%` }}
                          transition={{ ease: "circOut" }}
                        />
                      </div>
                    </motion.div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-white text-black hover:bg-gray-200 transition-colors font-medium" 
                    disabled={loading || !file || !name}
                  >
                    {loading ? "Processing Context..." : "Initialize Session"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleStartInterview} className="space-y-6">
                  <div className="flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-2">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-400">Context Acquired</h3>
                      <p className="text-xs text-gray-400">Resume successfully vectorized & skills extracted.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Target Role Specification
                    </label>
                    <Input 
                      placeholder="e.g., Senior Distributed Systems Engineer" 
                      value={role} 
                      onChange={e => setRole(e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-600 h-12 focus-visible:ring-blue-500/50"
                      required
                    />
                    <p className="text-[11px] text-gray-500 pt-1">The orchestration engine will adapt queries based on this domain.</p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white transition-colors font-medium shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-500/50" 
                    disabled={loading || !role}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    ) : (
                      <span className="flex items-center">Orchestrate Interview <ChevronRight className="ml-1.5 h-4 w-4" /></span>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </main>
  )
}
