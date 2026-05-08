import { topicLabel, type Topic } from '../data/questions';
import type { SessionResult } from '../App';

interface ResultsScreenProps {
  result: SessionResult;
  onPracticeAgain: () => void;
  onHome: () => void;
}

export function ResultsScreen({ result, onPracticeAgain, onHome }: ResultsScreenProps) {
  const { questions, answers, isMock } = result;

  const correct = questions.filter((q, i) => answers[i] === q.ans).length;
  const total = questions.length;
  const pass = isMock && correct >= 17;
  const scorePct = Math.round((correct / total) * 100);

  const wrongQuestions = questions.filter((q, i) => answers[i] !== q.ans && answers[i] !== null);

  // Topic breakdown for mock
  const topicBreakdown = (() => {
    const topics: Topic[] = [0, 1, 2, 'berlin'];
    return topics.map(t => {
      const qs = questions.filter(q => q.topic === t);
      const c = qs.filter((q, _) => {
        const idx = questions.indexOf(q);
        return answers[idx] === q.ans;
      }).length;
      return { topic: t, correct: c, total: qs.length };
    }).filter(b => b.total > 0);
  })();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Score header */}
        <div className="text-center mb-8">
          {isMock ? (
            <>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${
                pass
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
              }`}>
                {pass ? '✓ Bestanden' : '✗ Nicht bestanden'}
              </div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1">{correct} / {total}</div>
              <p className="text-gray-500 dark:text-gray-400">
                {pass ? 'Passed' : 'Not passed'} · pass mark is 17 / 33
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1">{correct} / {total}</div>
              <p className="text-gray-500 dark:text-gray-400">{scorePct}% correct this session</p>
            </>
          )}
        </div>

        {/* Score bar */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Score</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{scorePct}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                scorePct >= 52 ? 'bg-green-500' : scorePct >= 40 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${scorePct}%` }}
            />
          </div>
        </div>

        {/* Topic breakdown (mock only) */}
        {isMock && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-5">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Breakdown by topic
            </h2>
            <div className="space-y-2">
              {topicBreakdown.map(b => (
                <div key={String(b.topic)} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-200">{topicLabel(b.topic)}</span>
                  <span className={`text-sm font-semibold ${
                    b.correct === b.total
                      ? 'text-green-600 dark:text-green-400'
                      : b.correct / b.total >= 0.5
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {b.correct} / {b.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wrong answers */}
        {wrongQuestions.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Incorrect answers ({wrongQuestions.length})
            </h2>
            <div className="space-y-3">
              {wrongQuestions.map(q => {
                const idx = questions.indexOf(q);
                const chosen = answers[idx];
                return (
                  <div key={q.id} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                        {topicLabel(q.topic)}
                      </span>
                      {q.berlin && (
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                          Berlin
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">{q.de}</p>
                    {chosen !== null && (
                      <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                        Your answer: {q.opts[chosen].de}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Correct: {q.opts[q.ans].de}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-2xl p-5 text-center mb-6">
            <div className="text-2xl mb-1">🎉</div>
            <p className="text-green-800 dark:text-green-300 font-semibold">Perfect score!</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onPracticeAgain}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Practice again
          </button>
          <button
            onClick={onHome}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl py-4 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
