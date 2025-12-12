import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Settings from './Settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const {
    timerVisualization,
    setTimerVisualization,
    theme,
    setTheme,
    showMoodAvatars,
    toggleMoodAvatars,
    enableVisualEffects,
    toggleVisualEffects,
    notifications,
    updateNotificationPreference,
  } = useSettings();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Settings
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4">
                  <Settings
                    settings={{
                    theme,
                    timerVisualization,
                    showMoodAvatars,
                    enableVisualEffects,
                    notifications: Boolean(notifications),
                    soundEnabled: true,  
                    soundVolume: 0.7,    
                    timerPreset: 'pomodoro', 
                    customWorkDuration: 1500, 
                    customBreakDuration: 300  
                    }}
                    onSettingsChange={(newSettings) => {
                      if (newSettings.theme !== undefined) {
                        setTheme(newSettings.theme);
                      }
                      if (newSettings.timerVisualization !== undefined) {
                        setTimerVisualization(newSettings.timerVisualization);
                      }
                    }}
                    onClose={onClose}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SettingsModal;
