"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function TestAnswersPage() {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedResultsJson = localStorage.getItem("lastTestResults");
      if (!savedResultsJson) {
        setError("Нет данных о прохождении теста.");
        setLoading(false);
        return;
      }
      const savedResults = JSON.parse(savedResultsJson);
      if (savedResults.testId !== params.id) {
        setError("Нет данных о прохождении этого теста.");
        setLoading(false);
        return;
      }
      setQuestions(savedResults.results?.questions || []);
      setUserAnswers(savedResults.answers || []);
      setLoading(false);
    } catch (e) {
      setError("Ошибка при загрузке данных.");
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => router.back()} className="btn">Назад</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="app-container max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="mr-3 text-neutral-600" aria-label="Назад">
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">Мои ответы и разбор</h1>
        </div>
        <div className="space-y-6">
          {questions.length === 0 ? (
            <p className="text-neutral-500">Нет данных о вопросах теста.</p>
          ) : (
            questions.map((q, idx) => {
              const userAnswer = userAnswers.find(a => a.questionId === q.id);
              const correctOption = q.options?.find(o => o.isCorrect);
              const userOption = q.options?.find(o => o.id === userAnswer?.answerId);
              return (
                <div key={q.id} className="border rounded-lg p-4 bg-neutral-50">
                  <div className="mb-2 text-sm text-neutral-500 font-medium">Вопрос {idx + 1}</div>
                  <div className="font-semibold mb-2">{q.question}</div>
                  <div className="mb-2">
                    <span className="font-medium">Ваш ответ: </span>
                    <span className={userOption?.id === correctOption?.id ? 'text-green-600' : 'text-red-600'}>
                      {userOption ? userOption.text : '—'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Правильный ответ: </span>
                    <span className="text-green-700">{correctOption ? correctOption.text : '—'}</span>
                  </div>
                  {q.explanation && (
                    <div className="bg-blue-50 border border-blue-100 rounded p-3 mt-2 text-sm">
                      <span className="font-medium text-blue-700">Объяснение: </span>{q.explanation}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <Link href={`/tests/${params.id}`} className="block mt-8">
          <button className="btn w-full">Вернуться к результатам</button>
        </Link>
      </div>
    </div>
  );
} 