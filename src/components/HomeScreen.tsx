import { questions, topicLabel, type Topic } from '../data/questions';
import { type Progress, isMastered } from '../lib/progress';

interface HomeScreenProps {
  progress: Progress;
  savedSession: { index: number; total: number } | null;
  onPractice: () => void;
  onPracticeByTopic: (topic: Topic) => void;
  onMockExam: () => void;
  onBrowse: () => void;
  onSettings: () => void;
}

const TOPICS: Topic[] = [0, 1, 2, 'berlin'];

function topicColor(t: Topic): string {
  const map: Record<string, string> = {
    '0': 'bg-blue-500',
    '1': 'bg-purple-500',
    '2': 'bg-teal-500',
    'berlin': 'bg-orange-500',
  };
  return map[String(t)] ?? 'bg-gray-400';
}

function topicChipColor(t: Topic): string {
  const map: Record<string, string> = {
    '0': 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40',
    '1': 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40',
    '2': 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40',
    'berlin': 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40',
  };
  return map[String(t)] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
}

export function HomeScreen({ progress, savedSession, onPractice, onPracticeByTopic, onMockExam, onBrowse, onSettings }: HomeScreenProps) {
  const total = questions.length;

  const mastered = questions.filter(q => {
    const p = progress[q.id];
    return p && isMastered(p);
  }).length;

  const inProgress = questions.filter(q => {
    const p = progress[q.id];
    return p && p.attempts > 0 && !isMastered(p);
  }).length;

  const notSeen = total - mastered - inProgress;
  const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Einbürgerungstest</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">German Citizenship Test — Berlin</p>
        </div>

        {/* Overall progress card */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Overall mastery</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{masteredPct}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-5 overflow-hidden">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${masteredPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{mastered}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Mastered</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-amber-500 dark:text-amber-400">{inProgress}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">In progress</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">{notSeen}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Not seen</div>
            </div>
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">By topic</h2>
          <div className="space-y-2">
            {TOPICS.map(t => {
              const qs = questions.filter(q => q.topic === t);
              const m = qs.filter(q => { const p = progress[q.id]; return p && isMastered(p); }).length;
              const pct = qs.length > 0 ? Math.round((m / qs.length) * 100) : 0;
              return (
                <div key={String(t)} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${topicColor(t)}`} />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{topicLabel(t)}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{m} / {qs.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={onPractice}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            {savedSession
              ? `Continue (${savedSession.index + 1} / ${savedSession.total})`
              : 'Practice all questions'}
          </button>

          {/* Topic chips */}
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.map(t => {
              const count = questions.filter(q => q.topic === t).length;
              return (
                <button
                  key={String(t)}
                  onClick={() => onPracticeByTopic(t)}
                  className={`rounded-xl py-2.5 px-3 text-sm font-medium transition-colors text-left ${topicChipColor(t)}`}
                >
                  <span>{topicLabel(t)}</span>
                  <span className="ml-1 opacity-60 text-xs">({count})</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onMockExam}
            className="w-full border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-2xl py-4 text-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 transition-colors bg-white dark:bg-transparent"
          >
            Mock exam (33 questions)
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onBrowse}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl py-3.5 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Browse all
            </button>
            <button
              onClick={onSettings}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl py-3.5 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">{total} questions · national + Berlin</p>
      </div>
    </div>
  );
}
