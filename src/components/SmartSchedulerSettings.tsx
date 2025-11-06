import React, { useState, useEffect } from 'react';
import { useSmartScheduler } from '../contexts/SmartSchedulerContext';

const SmartSchedulerSettings: React.FC = () => {
  const { preferences, updatePreferences } = useSmartScheduler();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  
  // Add type for the enabled parameter
  const handleToggle = (field: keyof typeof localPrefs, enabled: boolean) => {
    handleChange(field, enabled);
  };

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleChange = (field: keyof typeof localPrefs, value: any) => {
    const updated = { ...localPrefs, [field]: value };
    setLocalPrefs(updated);
    updatePreferences(updated);
  };

  const handleWorkingHoursChange = (field: 'start' | 'end', value: string) => {
    const updated = {
      ...localPrefs,
      workingHours: {
        ...localPrefs.workingHours,
        [field]: value,
      },
    };
    setLocalPrefs(updated);
    updatePreferences(updated);
  };

  const toggleWeekday = (day: number) => {
    const weekdays = [...localPrefs.workingHours.weekdays];
    const index = weekdays.indexOf(day);
    
    if (index === -1) {
      weekdays.push(day);
    } else {
      weekdays.splice(index, 1);
    }
    
    weekdays.sort();
    
    const updated = {
      ...localPrefs,
      workingHours: {
        ...localPrefs.workingHours,
        weekdays,
      },
    };
    
    setLocalPrefs(updated);
    updatePreferences(updated);
  };

  const weekDayLabels = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Smart Break Scheduling
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure how and when breaks are scheduled
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Enable Smart Scheduling
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Automatically schedule breaks based on your work patterns
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('enableSmartScheduling', !localPrefs.enableSmartScheduling)}
            className={`${
              localPrefs.enableSmartScheduling ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className="sr-only">Enable smart scheduling</span>
            <span
              className={`${
                localPrefs.enableSmartScheduling ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Work Session (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="120"
              value={localPrefs.workSessionDuration}
              onChange={(e) => handleChange('workSessionDuration', parseInt(e.target.value, 10))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Short Break (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={localPrefs.shortBreakDuration}
              onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value, 10))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Long Break (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={localPrefs.longBreakDuration}
              onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value, 10))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Working Hours
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="time"
              value={localPrefs.workingHours.start}
              onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <span className="text-gray-500">to</span>
            <input
              type="time"
              value={localPrefs.workingHours.end}
              onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Working Days
          </label>
          <div className="flex space-x-2">
            {weekDayLabels.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleWeekday(day.value)}
                className={`px-3 py-1 text-sm rounded-md ${
                  localPrefs.workingHours.weekdays.includes(day.value)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSchedulerSettings;
