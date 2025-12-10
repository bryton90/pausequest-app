import { Tab } from '@headlessui/react';
import React, { Fragment } from 'react';
import UpcomingBreaks from './UpcomingBreaks';
import { MoodTracker } from './MoodTracker/MoodTracker';

interface TimerPageTabsProps {
  /**
   * Whether to include the Mood tracker as a separate tab.
   * On mobile (<md) we include it; on desktop we omit it.
   */
  includeMoodTracker?: boolean;
  selectedMood: string | null;
  onMoodChange: (mood: string, emoji: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  onSaveNotes: () => void;
  renderExtraAfterMood?: React.ReactNode;
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const TimerPageTabs: React.FC<TimerPageTabsProps> = ({
  includeMoodTracker = true,
  selectedMood,
  onMoodChange,
  notes,
  onNotesChange,
  onSaveNotes,
  renderExtraAfterMood,
}) => {
  const tabs = [
    ...(includeMoodTracker ? ['Mood'] as const : []),
    'Notes' as const,
    'Breaks' as const,
  ];

  return (
    <Tab.Group as={Fragment}>
      <Tab.List className="flex space-x-1 rounded-xl bg-gray-200/70 p-1 dark:bg-gray-700/40">
        {tabs.map((tab) => (
          <Tab
            key={tab}
            className={({ selected }) =>
              classNames(
                'w-full py-2.5 text-sm font-medium leading-5 text-gray-700 dark:text-gray-200',
                'rounded-lg',
                'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60',
                selected
                  ? 'bg-white shadow dark:bg-gray-800'
                  : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-900'
              )
            }
          >
            {tab}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-2">
        {tabs.map((tab) => (
          <Tab.Panel
            key={tab}
            className="rounded-xl bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60"
          >
            {tab === 'Mood' && (
              <>
                <MoodTracker
                  selectedMood={selectedMood}
                  onMoodChange={onMoodChange}
                  notes={notes}
                  onNotesChange={onNotesChange}
                  showNotes={false}
                />
                {renderExtraAfterMood}
              </>
            )}

            {tab === 'Notes' && (
              <div>
                <textarea
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Add notes about your focus session..."
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                />
                <button
                  onClick={onSaveNotes}
                  disabled={!notes.trim()}
                  className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-colors ${
                    notes.trim()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  }`}
                >
                  Save Notes
                </button>
              </div>
            )}

            {tab === 'Breaks' && <UpcomingBreaks />}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default TimerPageTabs;
