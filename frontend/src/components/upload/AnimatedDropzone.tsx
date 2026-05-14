import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

interface AnimatedDropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export const AnimatedDropzone: React.FC<AnimatedDropzoneProps> = ({ onFileSelect, selectedFile }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full">
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer overflow-hidden ${
          isHovered ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700 bg-gray-900/40'
        }`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input 
          type="file" 
          accept=".pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={e => onFileSelect(e.target.files?.[0] || null)}
          onDragEnter={() => setIsHovered(true)}
          onDragLeave={() => setIsHovered(false)}
          onDrop={() => setIsHovered(false)}
        />
        
        <motion.div
          animate={{ y: isHovered ? -5 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {selectedFile ? (
            <FileText className="h-10 w-10 mb-3 text-blue-400" />
          ) : (
            <UploadCloud className={`h-10 w-10 mb-3 ${isHovered ? 'text-blue-400' : 'text-gray-500'}`} />
          )}
        </motion.div>

        {selectedFile ? (
          <div className="text-center">
            <span className="text-sm font-medium text-gray-200 block truncate max-w-[200px]">{selectedFile.name}</span>
            <span className="text-xs flex items-center justify-center text-green-400 mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
            </span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-sm font-medium text-gray-300 block">Click or drag PDF here</span>
            <span className="text-xs text-gray-500 mt-1 block">Maximum file size 10MB</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
