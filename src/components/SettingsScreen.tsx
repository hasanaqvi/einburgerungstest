import { useRef, useState } from 'react';
import type { AppSettings } from '../App';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onResetProgress: () => void;
  onExportProgress: () => void;
  onImportProgress: (json: string) => void;
  onHome: () => void;
}

function Toggle({
  enabled,
  onToggle,
  label,
  description,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 text-left"
    >
      <div>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</div>
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${
          enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}

export function SettingsScreen({
  settings,
  onUpdateSettings,
  onResetProgress,
  onExportProgress,
  onImportProgress,
  onHome,
}: SettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        try {
          JSON.parse(text); // validate
          onImportProgress(text);
          setImportError(null);
        } catch {
          setImportError('Could not read file — make sure it is a valid progress export.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onHome} className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium">
            ← Home
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        {/* Display section */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
            Display
          </h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4">
            <Toggle
              enabled={settings.darkMode}
              onToggle={() => onUpdateSettings({ darkMode: !settings.darkMode })}
              label="Dark mode"
              description="Switch to a dark colour scheme"
            />
            <Toggle
              enabled={settings.showQuestionTranslation}
              onToggle={() =>
                onUpdateSettings({ showQuestionTranslation: !settings.showQuestionTranslation })
              }
              label="Show question translation by default"
              description="Show English translation of the question when a card loads"
            />
            <Toggle
              enabled={settings.showAnswerTranslation}
              onToggle={() =>
                onUpdateSettings({ showAnswerTranslation: !settings.showAnswerTranslation })
              }
              label="Show answer translations after answering"
              description="Reveal English translations of all options once you answer"
            />
          </div>
        </div>

        {/* Data section */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
            Progress data
          </h2>
          <div className="space-y-2">
            <button
              onClick={onExportProgress}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl py-3.5 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm border border-transparent dark:border-gray-700"
            >
              Export progress (JSON)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl py-3.5 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm border border-transparent dark:border-gray-700"
            >
              Import progress
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileImport}
            />

            {importError && (
              <p className="text-xs text-red-500 dark:text-red-400 px-1">{importError}</p>
            )}
          </div>
        </div>

        {/* Danger section */}
        <div>
          <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">
            Danger zone
          </h2>
          {showResetConfirm ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">Reset all progress?</p>
              <p className="text-xs text-red-500 dark:text-red-400 mb-4">
                This will permanently delete all your attempts, confidence scores, and mastery data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Yes, reset everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-2xl py-3.5 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
            >
              Reset all progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
