import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Code, ChevronDown, ChevronUp, Database } from 'lucide-react';

interface Trace {
  generated_query: string;
  retrieved_chunk_ids: string[];
  retrieved_scores: number[];
  source_documents: string[];
  retrieved_context: string;
  prompt_used: string;
}

export const TraceabilityViewer: React.FC<{ trace: Trace }> = ({ trace }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-800 transition-colors"
      >
        <span className="flex items-center text-sm font-semibold text-blue-400 uppercase tracking-wider">
          <Search className="w-4 h-4 mr-2" /> Hybrid Retrieval Trace (Observability)
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-800"
          >
            <div className="p-5 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">Generated Multi-Vector Query</span>
                    <div className="bg-gray-950 border border-gray-800 rounded p-3 text-xs text-pink-400 font-mono">
                      {trace.generated_query}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center">
                      <Database className="w-3 h-3 mr-1" /> Vector + BM25 Source Hits
                    </span>
                    <div className="bg-gray-950 border border-gray-800 rounded p-3">
                      {trace.source_documents?.length > 0 ? (
                        <ul className="space-y-2">
                          {trace.source_documents.map((src, idx) => (
                            <li key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-300 truncate max-w-[200px]" title={src}>{src}</span>
                              <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded font-mono">
                                Score: {trace.retrieved_scores?.[idx]?.toFixed(3)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-gray-600">No external documents retrieved.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">Injected Context Chunks</span>
                  <div className="bg-gray-950 border border-gray-800 rounded p-3 text-xs text-gray-400 h-48 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed custom-scrollbar">
                    {trace.retrieved_context}
                  </div>
                </div>
              </div>

              <div>
                <span className="flex items-center text-xs text-gray-500 uppercase font-semibold mb-1">
                  <Code className="w-3 h-3 mr-1" /> Interpolated System Prompt
                </span>
                <div className="bg-gray-950 border border-gray-800 rounded p-3 text-xs text-green-400/80 font-mono overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar">
                  {trace.prompt_used}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
