import { useState } from 'react';
import { questions, topicLabel } from '../data/questions';
import { contexts } from '../data/contexts';
import { type Progress, isMastered, type QuestionProgress } from '../lib/progress';

interface BookmarksScreenProps {
  bookmarks: Set<number>;
  progress: Progress;
  onToggleBookmark: (id: number) => void;
  onPracticeBookmarks: () => void;
  onHome: () => void;
}

function confidenceBadge(p: QuestionProgress | undefined): { label: string; cls: string } {
  if (!p || p.attempts === 0) return { label: 'Not seen', cls: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' };
  if (isMastered(p)) return { label: 'Mastered', cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' };
  if (p.confidence < 0.5) return { label: 'Low', cls: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' };
  return { label: 'In progress', cls: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' };
}

function BookmarkFilledIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M5 3a2 2 0 00-2 2v16l7-3.5L17 21V5a2 2 0 00-2-2H5z" />
    </svg>
  );
}

export function BookmarksScreen({ bookmarks, progress, onToggleBookmark, onPracticeBookmarks, onHome }: BookmarksScreenProps) {
  const [search, setSearch] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());
  const [qTransOn, setQTransOn] = useState<Set<number>>(new Set());
  const [aTransOn, setATransOn] = useState<Set<number>>(new Set());

  function toggleCollapsed(id: number) {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleQTrans(id: number) {
    setQTransOn(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleATrans(id: number) {
    setATransOn(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const bookmarkedQuestions = questions.filter(q => bookmarks.has(q.id));

  const filtered = bookmarkedQuestions.filter(q => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return q.de.toLowerCase().includes(term) || q.en.toLowerCase().includes(term);
  });

  if (bookmarks.size === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
          <button onClick={onHome} className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium">
            ← Home
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Bookmarks</span>
          <span className="text-sm text-gray-400 dark:text-gray-500">0 saved</span>
        </div>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="text-gray-300 dark:text-gray-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 00-2 2v16l7-3.5L17 21V5a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">No bookmarks yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tap the bookmark icon on any question while practising to save it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <button onClick={onHome} className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium">
          ← Home
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Bookmarks</span>
        <span className="text-sm text-gray-400 dark:text-gray-500">{filtered.length} / {bookmarks.size}</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-8">
        <button
          onClick={onPracticeBookmarks}
          className="w-full bg-amber-500 text-white rounded-2xl py-3.5 text-base font-semibold hover:bg-amber-600 active:bg-amber-700 transition-colors mb-5"
        >
          Practice {bookmarks.size} bookmarked question{bookmarks.size !== 1 ? 's' : ''}
        </button>

        {/* Search */}
        <input
          type="search"
          placeholder="Search bookmarked questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-12">No bookmarks match your search.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(q => {
              const p = progress[q.id];
              const badge = confidenceBadge(p);
              const collapsed = collapsedIds.has(q.id);
              const showQ = qTransOn.has(q.id);
              const showA = aTransOn.has(q.id);
              return (
                <div
                  key={q.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
                >
                  {/* Card header */}
                  <div className="px-4 pt-3 pb-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500">#{q.id}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                            {topicLabel(q.topic)}
                          </span>
                          {q.berlin && (
                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-full">
                              Berlin
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{q.de}</p>
                        {showQ && q.en && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1">{q.en}</p>
                        )}
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
                    </div>

                    {/* Per-card controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => toggleQTrans(q.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          showQ
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                        }`}
                      >
                        Q EN
                      </button>
                      <button
                        onClick={() => toggleATrans(q.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          showA
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                        }`}
                      >
                        A EN
                      </button>
                      <button
                        onClick={() => onToggleBookmark(q.id)}
                        className="ml-auto text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                        aria-label="Remove bookmark"
                      >
                        <BookmarkFilledIcon />
                      </button>
                      <button
                        onClick={() => toggleCollapsed(q.id)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        aria-label={collapsed ? 'Expand' : 'Collapse'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`}>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {!collapsed && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
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
                            {showA && opt.en && (
                              <span className={`block text-xs mt-0.5 ${i === q.ans ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                {opt.en}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {contexts[q.id] && (
                        <div className="mt-3 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Context</p>
                          <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">{contexts[q.id]}</p>
                        </div>
                      )}

                      {p && p.attempts > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                          {p.attempts} attempt{p.attempts !== 1 ? 's' : ''} · {p.correct} correct · confidence {Math.round(p.confidence * 100)}%
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
