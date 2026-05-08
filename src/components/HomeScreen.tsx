import { questions, topicLabel, type Topic } from '../data/questions';
import { type Progress, isMastered } from '../lib/progress';

interface HomeScreenProps {
  progress: Progress;
  onPractice: () => void;
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

export function HomeScreen({ progress, onPractice, onMockExam, onBrowse, onSettings }: HomeScreenProps) {
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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Einbürgerungstest</h1>
          <p className="text-gray-500 text-sm mt-1">German Citizenship Test — Berlin</p>
        </div>

        {/* Overall progress card */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Overall mastery</span>
            <span className="text-sm font-bold text-gray-900">{masteredPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-5 overflow-hidden">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${masteredPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{mastered}</div>
              <div className="text-xs text-gray-500 mt-0.5">Mastered</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-amber-500">{inProgress}</div>
              <div className="text-xs text-gray-500 mt-0.5">In progress</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-gray-400">{notSeen}</div>
              <div className="text-xs text-gray-500 mt-0.5">Not seen</div>
            </div>
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">By topic</h2>
          <div className="space-y-2">
            {TOPICS.map(t => {
              const qs = questions.filter(q => q.topic === t);
              const m = qs.filter(q => { const p = progress[q.id]; return p && isMastered(p); }).length;
              const pct = qs.length > 0 ? Math.round((m / qs.length) * 100) : 0;
              return (
                <div key={String(t)} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${topicColor(t)}`} />
                      <span className="text-sm text-gray-700">{topicLabel(t)}</span>
                    </div>
                    <span className="text-xs text-gray-500">{m} / {qs.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
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
            Practice
          </button>
          <button
            onClick={onMockExam}
            className="w-full border-2 border-blue-600 text-blue-600 rounded-2xl py-4 text-lg font-semibold hover:bg-blue-50 active:bg-blue-100 transition-colors bg-white"
          >
            Mock exam (33 questions)
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onBrowse}
              className="bg-gray-100 text-gray-700 rounded-2xl py-3.5 font-medium hover:bg-gray-200 transition-colors"
            >
              Browse all
            </button>
            <button
              onClick={onSettings}
              className="bg-gray-100 text-gray-700 rounded-2xl py-3.5 font-medium hover:bg-gray-200 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">{total} questions · national + Berlin</p>
      </div>
    </div>
  );
}
