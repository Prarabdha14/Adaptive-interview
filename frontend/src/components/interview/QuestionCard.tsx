import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface QuestionCardProps {
  questionText: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ questionText }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    
    // Smooth typewriter effect
    const timer = setInterval(() => {
      setDisplayedText((prev) => {
        const nextContent = questionText.slice(0, i + 1);
        if (nextContent === questionText) {
          setIsTyping(false);
          clearInterval(timer);
        }
        return nextContent;
      });
      i++;
    }, 20); // 20ms per character

    return () => clearInterval(timer);
  }, [questionText]);

  return (
    <div className="relative min-h-[160px]">
      <motion.p 
        className="text-xl md:text-2xl leading-relaxed text-gray-100 font-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {displayedText}
        {isTyping && (
          <motion.span 
            className="inline-block w-2 h-6 ml-1 bg-blue-500 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}
      </motion.p>
    </div>
  );
};
