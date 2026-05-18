import { useState, useMemo } from 'react';
import { vocabulary } from '../data/vocabulary';
import { loadVocabLearned, markVocabLearned, resetVocabProgress } from '../lib/vocabProgress';

interface Props {
  onHome: () => void;
}

export function VocabularyScreen({ onHome }: Props) {
  const [learned, setLearned] = useState<Set<number>>(loadVocabLearned);
  const [flipped, setFlipped] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [queuePos, setQueuePos] = useState(0);

  const queue = useMemo(
    () => vocabulary.map((_, i) => i).filter(i => !learned.has(i)),
    [learned]
  );

  const learnedCount = learned.size;
  const total = vocabulary.length;
  const learnedPct = total > 0 ? (learnedCount / total) * 100 : 0;

  function flipCard() {
    setAnimate(true);
    setFlipped(f => !f);
  }

  function handleGotIt() {
    const next = markVocabLearned(termIndex);
    setLearned(new Set(next));
    setAnimate(false);
    setFlipped(false);
    setQueuePos(p => Math.min(p, Math.max(0, queue.length - 2)));
  }

  function handleNext() {
    setAnimate(false);
    setFlipped(false);
    setQueuePos(p => (p + 1) % queue.length);
  }

  function handlePrev() {
    setAnimate(false);
    setFlipped(false);
    setQueuePos(p => (p - 1 + queue.length) % queue.length);
  }

  const topBar = (rightContent: React.ReactNode) => (
    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
      <button
        onClick={onHome}
        className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium"
      >
        ← Home
      </button>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">Vocabulary</span>
      {rightContent}
    </div>
  );

  if (queue.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
        {topBar(<span className="text-sm text-gray-500 dark:text-gray-400">{learnedCount} / {total}</span>)}
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <div className="h-1 bg-green-500" style={{ width: '100%' }} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All done!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            You have marked all {total} vocabulary terms as learned.
          </p>
          <button
            onClick={() => {
              resetVocabProgress();
              setLearned(new Set());
              setQueuePos(0);
              setFlipped(false);
              setAnimate(false);
            }}
            className="w-full max-w-xs border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-2xl py-4 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  const safePos = Math.min(queuePos, queue.length - 1);
  const termIndex = queue[safePos];
  const term = vocabulary[termIndex];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {topBar(<span className="text-sm text-gray-500 dark:text-gray-400">{learnedCount} / {total}</span>)}

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 dark:bg-gray-800">
        <div
          className="h-1 bg-green-500 transition-all duration-500"
          style={{ width: `${learnedPct}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {safePos + 1} of {queue.length} remaining
          </span>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            {learnedCount} learned
          </span>
        </div>

        {/* 3D flip card */}
        <div
          className="relative mb-5 cursor-pointer select-none"
          style={{ perspective: '1200px', height: '256px' }}
          onClick={flipCard}
        >
          <div
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transition: animate ? 'transform 0.4s ease-in-out' : 'none',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front face */}
            <div
              className="absolute inset-0 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center text-center px-6"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } as React.CSSProperties}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                German term
              </p>
              <p className="text-[26px] font-bold text-gray-900 dark:text-white leading-tight mb-6">
                {term.de}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Tap to reveal</p>
            </div>

            {/* Back face */}
            <div
              className="absolute inset-0 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center px-6"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              } as React.CSSProperties}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400 dark:text-blue-500 mb-2">
                Translation
              </p>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 text-center mb-4">
                {term.en}
              </p>
              <div className="bg-white dark:bg-gray-700 rounded-xl px-4 py-3 w-full text-left">
                <p className="text-sm text-gray-700 dark:text-gray-200 italic leading-relaxed">
                  {term.exampleDe}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed">
                  {term.exampleEn}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Got it — appears after flip, same pattern as PracticeScreen's Next */}
        {flipped && (
          <div className="mb-3">
            <button
              onClick={handleGotIt}
              className="w-full bg-green-600 text-white rounded-2xl py-4 text-lg font-semibold hover:bg-green-700 active:bg-green-800 transition-colors"
            >
              Got it
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePrev}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl py-3.5 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl py-3.5 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
