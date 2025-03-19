'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaLightbulb } from 'react-icons/fa';

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type TestCardProps = {
  id: string;
  question: string;
  options: Option[];
  explanation: string;
};

export default function TestCard({ question, options, explanation }: TestCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const handleSelectOption = (optionId: string) => {
    if (selectedOption) return;
    setSelectedOption(optionId);
    setShowExplanation(true);
    
    // Вибрация при ответе
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch (error) {
      console.log('Haptic feedback not supported');
    }
  };
  
  return (
    <div className="app-container h-full flex flex-col justify-center">
      <div className="card">
        <h3 className="text-xl font-medium mb-4">{question}</h3>
        
        <div className="space-y-3 mb-5">
          {options.map((option) => (
            <button
              key={option.id}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                !selectedOption 
                  ? 'border border-neutral-200 bg-white hover:border-neutral-300' 
                  : option.isCorrect 
                    ? 'bg-green-50 border border-green-300' 
                    : option.id === selectedOption 
                      ? 'bg-red-50 border border-red-300' 
                      : 'border border-neutral-200 bg-white opacity-70'
              }`}
              onClick={() => handleSelectOption(option.id)}
              disabled={!!selectedOption}
            >
              <div className="flex items-center">
                <span className="flex-shrink-0 rounded-full w-6 h-6 flex items-center justify-center border border-neutral-300 text-sm font-medium mr-3">
                  {option.id.toUpperCase()}
                </span>
                
                <span>{option.text}</span>
                
                {selectedOption && (
                  <span className="ml-auto">
                    {option.isCorrect ? (
                      <FaCheck className="text-green-500" />
                    ) : option.id === selectedOption ? (
                      <FaTimes className="text-red-500" />
                    ) : null}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {showExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 p-4 rounded-lg border border-blue-100"
          >
            <div className="flex">
              <FaLightbulb className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Объяснение:</h4>
                <p className="text-sm text-neutral-700">{explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 