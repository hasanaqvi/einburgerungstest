import { useState } from 'react';
import { questions, topicLabel } from '../data/questions';
import { type Progress, isMastered, type QuestionProgress } from '../lib/progress';

interface BrowseScreenProps {
  progress: Progress;
  onHome: () => void;
}

type MasteryFilter = 'all' | 'unseen' | 'inprogress' | 'mastered';
type TopicFilter = 'all' | '0' | '1' | '2' | 'berlin';

function confidenceBadge(p: QuestionProgress | undefined): { label: string; cls: string } {
  if (!p || p.attempts === 0) return { label: 'Not seen', cls: 'bg-red-100 text-red-600' };
  if (isMastered(p)) return { label: 'Mastered', cls: 'bg-green-100 text-green-700' };
  if (p.confidence < 0.5) return { label: 'Low', cls: 'bg-red-100 text-red-600' };
  return { label: 'In progress', cls: 'bg-amber-100 text-amber-600' };
}

const TOPIC_FILTERS: { value: TopicFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '0', label: 'Demokratie' },
  { value: '1', label: 'Geschichte' },
  { value: '2', label: 'Menschen' },
  { value: 'berlin', label: 'Berlin' },
];

const MASTERY_FILTERS: { value: MasteryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unseen', label: 'Not seen' },
  { value: 'inprogress', label: 'In progress' },
  { value: 'mastered', label: 'Mastered' },
];

export function BrowseScreen({ progress, onHome }: BrowseScreenProps) {
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');
  const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = questions.filter(q => {
    if (topicFilter !== 'all' && String(q.topic) !== topicFilter) return false;

    const p = progress[q.id];
    if (masteryFilter === 'unseen' && p && p.attempts > 0) return false;
    if (masteryFilter === 'inprogress') {
      if (!p || p.attempts === 0) return false;
      if (isMastered(p)) return false;
    }
    if (masteryFilter === 'mastered' && (!p || !isMastered(p))) return false;

    if (search.trim()) {
      const term = search.toLowerCase();
      return q.de.toLowerCase().includes(term) || q.en.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onHome} className="text-sm text-gray-400 hover:text-gray-600 font-medium">
            ← Home
          </button>
          <h1 className="text-lg font-bold text-gray-900">Browse questions</h1>
          <span className="ml-auto text-sm text-gray-400">{filtered.length} shown</span>
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />

        {/* Topic filter */}
        <div className="flex gap-1.5 flex-wrap mb-2">
          {TOPIC_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTopicFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                topicFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Mastery filter */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {MASTERY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setMasteryFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                masteryFilter === f.value
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Question list */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No questions match your filters.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(q => {
              const p = progress[q.id];
              const badge = confidenceBadge(p);
              const expanded = expandedId === q.id;
              return (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expanded ? null : q.id)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">#{q.id}</span>
                        {q.berlin && (
                          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full">
                            Berlin
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{q.de}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{topicLabel(q.topic)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                      {p && p.attempts > 0 && (
                        <span className="text-xs text-gray-400">
                          {Math.round(p.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-400 italic mb-3">{q.en}</p>
                      <div className="space-y-1.5">
                        {q.opts.map((opt, i) => (
                          <div
                            key={i}
                            className={`text-sm px-3 py-2 rounded-xl ${
                              i === q.ans
                                ? 'bg-green-50 text-green-800 font-medium border border-green-200'
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            {i === q.ans && (
                              <span className="text-green-600 mr-1.5">✓</span>
                            )}
                            {opt.de}
                            {i === q.ans && (
                              <span className="text-xs text-green-600 ml-1">— {opt.en}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {p && p.attempts > 0 && (
                        <p className="text-xs text-gray-400 mt-3">
                          {p.attempts} attempt{p.attempts !== 1 ? 's' : ''} ·{' '}
                          {p.correct} correct ·{' '}
                          confidence {Math.round(p.confidence * 100)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
