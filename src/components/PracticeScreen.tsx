import { useState } from 'react';
import { type Question, topicLabel } from '../data/questions';
import type { Progress } from '../lib/progress';
import type { AppSettings } from '../App';

interface PracticeScreenProps {
  questions: Question[];
  progress: Progress;
  settings: AppSettings;
  onAnswer: (questionId: number, isCorrect: boolean) => void;
  onComplete: (answers: (number | null)[]) => void;
  onHome: () => void;
}

function confidenceDot(confidence: number, hasSeen: boolean): string {
  if (!hasSeen) return 'bg-gray-300 dark:bg-gray-600';
  if (confidence < 0.5) return 'bg-red-400';
  if (confidence < 0.8) return 'bg-amber-400';
  return 'bg-green-500';
}

export function PracticeScreen({
  questions,
  progress,
  settings,
  onAnswer,
  onComplete,
  onHome,
}: PracticeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    new Array(questions.length).fill(null)
  );
  const [showQTranslation, setShowQTranslation] = useState(settings.showQuestionTranslation);
  const [showATranslation, setShowATranslation] = useState(settings.showAnswerTranslation);

  const question = questions[currentIndex];
  const selected = answers[currentIndex];
  const answered = selected !== null;
  const isCorrect = answered && selected === question.ans;
  const p = progress[question.id];
  const confidence = p?.confidence ?? 0;
  const hasSeen = (p?.attempts ?? 0) > 0;
  const progressPct = Math.round((currentIndex / questions.length) * 100);

  function handleSelect(i: number) {
    if (answered) return;
    const next = [...answers];
    next[currentIndex] = i;
    setAnswers(next);
    onAnswer(question.id, i === question.ans);
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      onComplete(answers);
    } else {
      setCurrentIndex(i => i + 1);
    }
  }

  function optionClass(i: number): string {
    const base =
      'w-full text-left border-2 rounded-2xl px-4 py-3 min-h-[52px] transition-colors';
    if (!answered) {
      return `${base} border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 active:bg-blue-100 cursor-pointer`;
    }
    if (i === question.ans) return `${base} border-green-500 bg-green-50 dark:bg-green-900/30`;
    if (i === selected) return `${base} border-red-500 bg-red-50 dark:bg-red-900/30`;
    return `${base} border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800`;
  }

  function optionTextClass(i: number): string {
    if (!answered) return 'text-gray-800 dark:text-gray-100';
    if (i === question.ans) return 'text-green-800 dark:text-green-300 font-medium';
    if (i === selected) return 'text-red-700 dark:text-red-400';
    return 'text-gray-400 dark:text-gray-600';
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={onHome}
          className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium"
        >
          ← Home
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {currentIndex + 1} / {questions.length}
        </span>
        <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
        {/* Badges and confidence */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
            {topicLabel(question.topic)}
          </span>
          {question.berlin && (
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full">
              Berlin
            </span>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${confidenceDot(confidence, hasSeen)}`} />
            <span className="text-xs text-gray-400 dark:text-gray-500">{Math.round(confidence * 100)}%</span>
          </div>
        </div>

        {/* Question text */}
        <div className="mb-5">
          <p className="text-[18px] font-semibold text-gray-900 dark:text-white leading-snug">{question.de}</p>
          {showQTranslation && question.en && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic mt-2">{question.en}</p>
          )}
          <div className="flex gap-3 mt-1.5">
            {question.en && (
              <button
                onClick={() => setShowQTranslation(v => !v)}
                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {showQTranslation ? 'Hide question translation' : 'Show question translation'}
              </button>
            )}
            {question.opts.some(o => o.en) && (
              <button
                onClick={() => setShowATranslation(v => !v)}
                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {showATranslation ? 'Hide answer translations' : 'Show answer translations'}
              </button>
            )}
          </div>
        </div>

        {/* Answer options */}
        <div className="space-y-2.5">
          {question.opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={optionClass(i)}
            >
              <span className={`block text-base ${optionTextClass(i)}`}>{opt.de}</span>
              {showATranslation && opt.en && (
                <span className="block text-sm text-gray-400 dark:text-gray-500 mt-0.5">{opt.en}</span>
              )}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {answered && (
          <div
            className={`mt-5 p-4 rounded-xl text-base ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {isCorrect ? (
              <span className="font-semibold">Richtig!</span>
            ) : (
              <span>
                <span className="font-semibold">Falsch</span> — correct answer:{' '}
                <span className="font-medium">{question.opts[question.ans].de}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Next button */}
      {answered && (
        <div className="px-4 pb-8 max-w-2xl mx-auto w-full">
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            {currentIndex + 1 >= questions.length ? 'See results' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
