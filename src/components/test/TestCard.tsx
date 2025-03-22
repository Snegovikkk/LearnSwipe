'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaLightbulb, FaArrowRight } from 'react-icons/fa';

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
  onNextQuestion?: () => void;
  isLastQuestion?: boolean;
};

export default function TestCard({ 
  question, 
  options, 
  explanation, 
  onNextQuestion, 
  isLastQuestion = false 
}: TestCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);
  
  // Добавляем анимацию кнопки "Следующий вопрос" через некоторое время после ответа
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (selectedOption) {
      timeout = setTimeout(() => {
        setAnimateButton(true);
      }, 1000);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [selectedOption]);
  
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
  
  // Функция для определения правильности ответа
  const isCorrectAnswer = () => {
    if (!selectedOption) return false;
    return options.find(option => option.id === selectedOption)?.isCorrect ?? false;
  };
  
  // Определяем класс для фона карточки в зависимости от ответа
  const getCardBackgroundClass = () => {
    if (!selectedOption) return 'bg-white';
    return isCorrectAnswer() ? 'bg-green-50' : 'bg-red-50';
  };
  
  return (
    <motion.div 
      className={`app-container h-full flex flex-col justify-center`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`card ${selectedOption ? getCardBackgroundClass() : ''} transition-colors duration-500`}>
        <motion.h3 
          className="text-xl font-medium mb-6"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {question}
        </motion.h3>
        
        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  !selectedOption 
                    ? 'border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm' 
                    : option.isCorrect 
                      ? 'bg-green-50 border border-green-300' 
                      : option.id === selectedOption 
                        ? 'bg-red-50 border border-red-300' 
                        : 'border border-neutral-200 bg-white opacity-70'
                }`}
                onClick={() => handleSelectOption(option.id)}
                disabled={!!selectedOption}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <div className="flex items-center">
                  <span className={`flex-shrink-0 rounded-full w-6 h-6 flex items-center justify-center border text-sm font-medium mr-3 ${
                    selectedOption && option.isCorrect 
                      ? 'border-green-500 bg-green-100 text-green-700' 
                      : selectedOption && option.id === selectedOption && !option.isCorrect
                      ? 'border-red-500 bg-red-100 text-red-700'
                      : 'border-neutral-300 text-neutral-600'
                  }`}>
                    {option.id.toUpperCase()}
                  </span>
                  
                  <span className={
                    selectedOption && option.isCorrect 
                      ? 'text-green-700 font-medium' 
                      : selectedOption && option.id === selectedOption && !option.isCorrect
                      ? 'text-red-700'
                      : ''
                  }>{option.text}</span>
                  
                  {selectedOption && (
                    <motion.span 
                      className="ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      {option.isCorrect ? (
                        <FaCheck className="text-green-500" />
                      ) : option.id === selectedOption ? (
                        <FaTimes className="text-red-500" />
                      ) : null}
                    </motion.span>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          {showExplanation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4"
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
          
          {selectedOption && onNextQuestion && (
            <motion.button
              onClick={onNextQuestion}
              className="w-full py-3 mt-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: animateButton ? [1, 1.03, 1] : 1 
              }}
              transition={{ 
                delay: 0.5,
                scale: { 
                  repeat: animateButton ? Infinity : 0, 
                  repeatType: "reverse", 
                  duration: 1.5 
                } 
              }}
            >
              {isLastQuestion ? 'Завершить тест' : 'Следующий вопрос'}
              <FaArrowRight className="ml-2" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 