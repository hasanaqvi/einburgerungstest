import { useState } from 'react';
import { questions, topicLabel } from '../data/questions';
import { contexts } from '../data/contexts';
import { type Progress, isMastered, type QuestionProgress } from '../lib/progress';

interface BrowseScreenProps {
  progress: Progress;
  onHome: () => void;
}

type MasteryFilter = 'all' | 'unseen' | 'inprogress' | 'mastered';
type TopicFilter = 'all' | '0' | '1' | '2' | 'berlin';

function confidenceBadge(p: QuestionProgress | undefined): { label: string; cls: string } {
  if (!p || p.attempts === 0) return { label: 'Not seen', cls: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' };
  if (isMastered(p)) return { label: 'Mastered', cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' };
  if (p.confidence < 0.5) return { label: 'Low', cls: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' };
  return { label: 'In progress', cls: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' };
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <button onClick={onHome} className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium">
          ← Home
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Browse questions</span>
        <span className="text-sm text-gray-400 dark:text-gray-500">{filtered.length} shown</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-8">
        {/* Search */}
        <input
          type="search"
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
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
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                  ? 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Question list */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-12">No questions match your filters.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(q => {
              const p = progress[q.id];
              const badge = confidenceBadge(p);
              const expanded = expandedId === q.id;
              return (
                <div
                  key={q.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expanded ? null : q.id)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 dark:text-gray-500">#{q.id}</span>
                        {q.berlin && (
                          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-full">
                            Berlin
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2">{q.de}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{topicLabel(q.topic)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                      {p && p.attempts > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {Math.round(p.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-3">{q.en}</p>
                      <div className="space-y-1.5">
                        {q.opts.map((opt, i) => (
                          <div
                            key={i}
                            className={`text-sm px-3 py-2 rounded-xl ${
                              i === q.ans
                                ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium border border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {i === q.ans && (
                              <span className="text-green-600 dark:text-green-400 mr-1.5">✓</span>
                            )}
                            {opt.de}
                            <span className={`text-xs ml-1 ${i === q.ans ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>— {opt.en}</span>
                          </div>
                        ))}
                      </div>
                      {contexts[q.id] && (
                        <div className="mt-3 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">{contexts[q.id]}</p>
                        </div>
                      )}
                      {p && p.attempts > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
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
