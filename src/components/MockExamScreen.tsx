import { useState } from 'react';
import { type Question, topicLabel } from '../data/questions';

interface MockExamScreenProps {
  questions: Question[];
  onComplete: (answers: (number | null)[]) => void;
  onHome: () => void;
}

export function MockExamScreen({ questions, onComplete, onHome }: MockExamScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    new Array(questions.length).fill(null)
  );

  const question = questions[currentIndex];
  const selected = answers[currentIndex];
  const answered = selected !== null;
  const isLast = currentIndex + 1 >= questions.length;
  const progressPct = Math.round((currentIndex / questions.length) * 100);

  function handleSelect(i: number) {
    if (answered) return;
    const next = [...answers];
    next[currentIndex] = i;
    setAnswers(next);
  }

  function handleNext() {
    if (isLast) {
      onComplete(answers);
    } else {
      setCurrentIndex(i => i + 1);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => {
            if (window.confirm('Prüfung abbrechen? Your progress will not be saved.')) {
              onHome();
            }
          }}
          className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium"
        >
          ✕ Exit
        </button>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Mock Exam</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 dark:bg-gray-700">
        <div
          className="h-1 bg-blue-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
            {topicLabel(question.topic)}
          </span>
          {question.berlin && (
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full">
              Berlin
            </span>
          )}
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 italic">No feedback in exam mode</span>
        </div>

        {/* Question */}
        <p className="text-[18px] font-semibold text-gray-900 dark:text-white leading-snug mb-6">{question.de}</p>

        {/* Options */}
        <div className="space-y-2.5">
          {question.opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`w-full text-left border-2 rounded-2xl px-4 py-3 min-h-[52px] transition-colors ${
                answered && i === selected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium'
                  : answered
                  ? 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-default'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer'
              }`}
            >
              <span className="text-base">{opt.de}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Next / Submit */}
      {answered && (
        <div className="px-4 pb-8 max-w-2xl mx-auto w-full">
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            {isLast ? 'Submit exam' : 'Next question'}
          </button>
        </div>
      )}
    </div>
  );
}
