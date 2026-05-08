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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Score header */}
        <div className="text-center mb-8">
          {isMock ? (
            <>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${
                pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {pass ? '✓ Bestanden' : '✗ Nicht bestanden'}
              </div>
              <div className="text-5xl font-bold text-gray-900 mb-1">{correct} / {total}</div>
              <p className="text-gray-500">
                {pass ? 'Passed' : 'Not passed'} · pass mark is 17 / 33
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl font-bold text-gray-900 mb-1">{correct} / {total}</div>
              <p className="text-gray-500">{scorePct}% correct this session</p>
            </>
          )}
        </div>

        {/* Score ring (simple bar) */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Score</span>
            <span className="text-sm font-semibold text-gray-900">{scorePct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
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
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Breakdown by topic
            </h2>
            <div className="space-y-2">
              {topicBreakdown.map(b => (
                <div key={String(b.topic)} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{topicLabel(b.topic)}</span>
                  <span className={`text-sm font-semibold ${
                    b.correct === b.total ? 'text-green-600' : b.correct / b.total >= 0.5 ? 'text-amber-600' : 'text-red-600'
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
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Incorrect answers ({wrongQuestions.length})
            </h2>
            <div className="space-y-3">
              {wrongQuestions.map(q => {
                const idx = questions.indexOf(q);
                const chosen = answers[idx];
                return (
                  <div key={q.id} className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {topicLabel(q.topic)}
                      </span>
                      {q.berlin && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Berlin
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-2">{q.de}</p>
                    {chosen !== null && (
                      <p className="text-sm text-red-600 mb-1">
                        Your answer: {q.opts[chosen].de}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-green-700">
                      Correct: {q.opts[q.ans].de}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center mb-6">
            <div className="text-2xl mb-1">🎉</div>
            <p className="text-green-800 font-semibold">Perfect score!</p>
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
            className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 font-medium hover:bg-gray-200 transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
