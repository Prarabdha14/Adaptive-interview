import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Zap, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EvaluationProps {
  evaluation: {
    correctness_score: number;
    depth_score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
  };
  onNext: () => void;
  isLastQuestion: boolean;
}

export const EvaluationToast: React.FC<EvaluationProps> = ({ evaluation, onNext, isLastQuestion }) => {
  const avgScore = (evaluation.correctness_score + evaluation.depth_score) / 2;
  const isGood = avgScore >= 7;

  return (
    <motion.div 
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${isGood ? 'bg-green-500' : 'bg-blue-500'}`} />
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Zap className={`w-5 h-5 mr-2 ${isGood ? 'text-green-400' : 'text-blue-400'}`} />
            Live AI Feedback
          </h3>
          <p className="text-sm text-gray-400 mt-1">Response evaluated in real-time</p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Correctness</span>
            <span className={`text-2xl font-bold ${evaluation.correctness_score >= 7 ? 'text-green-400' : 'text-blue-400'}`}>
              {evaluation.correctness_score}<span className="text-sm text-gray-600">/10</span>
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Depth</span>
            <span className={`text-2xl font-bold ${evaluation.depth_score >= 7 ? 'text-green-400' : 'text-blue-400'}`}>
              {evaluation.depth_score}<span className="text-sm text-gray-600">/10</span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
        <p className="text-gray-200 text-sm leading-relaxed">{evaluation.feedback}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-green-500 mb-3 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> Strengths
          </h4>
          <ul className="space-y-2">
            {evaluation.strengths.map((s, i) => (
              <motion.li 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="text-xs text-gray-300 flex items-start"
              >
                <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span>{s}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-3 flex items-center">
            <Target className="w-3 h-3 mr-1" /> Growth Areas
          </h4>
          <ul className="space-y-2">
            {evaluation.weaknesses.map((w, i) => (
              <motion.li 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="text-xs text-gray-300 flex items-start"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0 mt-1" />
                <span>{w}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <Button 
        onClick={onNext} 
        className="w-full h-12 bg-white text-black hover:bg-gray-200 font-medium transition-colors"
      >
        {isLastQuestion ? "Complete Interview & Generate Report" : "Proceed to Next Question"}
      </Button>

    </motion.div>
  );
};
