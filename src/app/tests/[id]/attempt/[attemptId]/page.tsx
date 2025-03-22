'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaTimesCircle, FaQuestion } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import useTests from '@/hooks/useTests';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Test, TestResult, Question, Answer } from '@/lib/supabase';

interface QuestionWithAnswers extends Question {
  answers: Answer[];
  userAnswer?: string;
  isCorrect?: boolean;
}

export default function TestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const testId = typeof params.id === 'string' ? params.id : '';
  const attemptId = typeof params.attemptId === 'string' ? params.attemptId : '';
  
  const { user } = useAuth();
  const { 
    getTestById, 
    getTestQuestions, 
    getQuestionAnswers,
    getTestResultById,
    loading: testsLoading 
  } = useTests();
  
  const [test, setTest] = useState<Test | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !testId || !attemptId) return;
      
      setLoading(true);
      try {
        // Получаем информацию о тесте
        const testData = await getTestById(testId);
        setTest(testData);
        
        // Получаем результат теста
        const resultData = await getTestResultById(attemptId);
        
        if (!resultData || resultData.user_id !== user.id) {
          // Если результат не принадлежит текущему пользователю, перенаправляем на страницу результатов
          router.push(`/tests/${testId}/results`);
          return;
        }
        
        setResult(resultData);
        
        // Получаем вопросы теста
        const questionsData = await getTestQuestions(testId);
        
        // Получаем ответы для каждого вопроса и добавляем информацию о том, какой ответ выбрал пользователь
        const userAnswers = resultData.answers ? JSON.parse(resultData.answers) : {};
        
        const questionsWithAnswers = await Promise.all(
          questionsData.map(async (question) => {
            const answers = await getQuestionAnswers(question.id);
            const userAnswer = userAnswers[question.id];
            
            const correctAnswer = answers.find(a => a.is_correct)?.id;
            const isCorrect = userAnswer === correctAnswer;
            
            return {
              ...question,
              answers,
              userAnswer,
              isCorrect
            };
          })
        );
        
        setQuestions(questionsWithAnswers);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, testId, attemptId, getTestById, getTestQuestions, getQuestionAnswers, getTestResultById, router]);
  
  if (!user) {
    return null; // Будет обработано ProtectedRoute
  }
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Функция для получения CSS класса в зависимости от балла
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Функция для определения оценки по баллам
  const getScoreText = (score: number) => {
    if (score >= 80) return 'Отлично';
    if (score >= 60) return 'Хорошо';
    return 'Нужно повторить';
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading || testsLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-primary-500 text-2xl mr-2" />
              <span className="text-neutral-600">Загрузка результатов...</span>
            </div>
          ) : !test || !result ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-xl text-neutral-600 mb-4">Информация о попытке не найдена</p>
              <Link
                href="/profile/results"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                <FaArrowLeft className="mr-2" /> Вернуться к результатам
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <Link 
                  href={`/tests/${testId}/results`} 
                  className="text-primary-600 hover:text-primary-700 inline-flex items-center mr-3"
                >
                  <FaArrowLeft className="mr-1" /> Назад к результатам
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900">
                  Попытка: {test.title}
                </h1>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="bg-neutral-50 px-4 py-5 border-b border-neutral-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">
                    Информация о попытке
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-neutral-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-neutral-500 truncate">
                          Дата прохождения
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-neutral-900">
                          {formatDate(result.created_at)}
                        </dd>
                      </div>
                    </div>
                    <div className="bg-neutral-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-neutral-500 truncate">
                          Результат
                        </dt>
                        <dd className={`mt-1 text-2xl font-semibold ${getScoreClass(result.score)}`}>
                          {result.score}%
                        </dd>
                      </div>
                    </div>
                    <div className="bg-neutral-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-neutral-500 truncate">
                          Оценка
                        </dt>
                        <dd className={`mt-1 text-lg font-semibold ${getScoreClass(result.score)}`}>
                          {getScoreText(result.score)}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-neutral-50 px-4 py-5 border-b border-neutral-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-neutral-900">
                    Ответы на вопросы
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Правильные ответы отмечены зеленым, неправильные - красным
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <dl className="space-y-8">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-2">
                            {question.isCorrect ? (
                              <FaCheckCircle className="h-5 w-5 text-green-500" />
                            ) : question.userAnswer ? (
                              <FaTimesCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <FaQuestion className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                          <div>
                            <dt className="text-lg font-medium text-neutral-900">
                              {index + 1}. {question.text}
                            </dt>
                            <dd className="mt-3">
                              <ul className="space-y-2">
                                {question.answers.map((answer) => {
                                  const isUserAnswer = answer.id === question.userAnswer;
                                  const isCorrect = answer.is_correct;
                                  
                                  let bgClass = "";
                                  if (isUserAnswer && isCorrect) {
                                    bgClass = "bg-green-50 border-green-200";
                                  } else if (isUserAnswer && !isCorrect) {
                                    bgClass = "bg-red-50 border-red-200";
                                  } else if (!isUserAnswer && isCorrect) {
                                    bgClass = "bg-yellow-50 border-yellow-200";
                                  }
                                  
                                  return (
                                    <li 
                                      key={answer.id} 
                                      className={`border rounded-md p-3 flex items-start ${bgClass}`}
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-neutral-900">
                                          {answer.text}
                                        </p>
                                        {isUserAnswer && !isCorrect && isCorrect !== undefined && (
                                          <p className="text-xs text-red-600 mt-1">
                                            Ваш ответ, но он неверный
                                          </p>
                                        )}
                                        {isUserAnswer && isCorrect && (
                                          <p className="text-xs text-green-600 mt-1">
                                            Ваш ответ верный
                                          </p>
                                        )}
                                        {!isUserAnswer && isCorrect && (
                                          <p className="text-xs text-yellow-600 mt-1">
                                            Правильный ответ
                                          </p>
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </dd>
                          </div>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Link 
                  href={`/tests/${testId}/results`} 
                  className="inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  <FaArrowLeft className="mr-2" /> Назад к результатам
                </Link>
                <Link 
                  href={`/tests/${testId}/start`} 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Пройти снова
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 