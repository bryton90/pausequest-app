import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import Settings from './Settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const {
    timerSettings,
    setTimerVisualization,
    setTimerPreset,
    setCustomWorkDuration,
    setCustomBreakDuration,
    theme,
    setTheme,
    showMoodAvatars,
    toggleMoodAvatars,
    enableVisualEffects,
    toggleVisualEffects,
    soundSettings,
    setSoundEnabled,
    setSoundVolume,
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-bg-secondary/95 backdrop-blur-md p-8 text-left align-middle shadow-2xl border border-border-color transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h2"
                    className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                  >
                    ⚙️ Settings
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <Settings
                    settings={{
                      theme,
                      timerVisualization: timerSettings.visualization,
                      timerPreset: timerSettings.preset,
                      customWorkDuration: timerSettings.customWorkDuration,
                      customBreakDuration: timerSettings.customBreakDuration,
                      soundEnabled: soundSettings.enabled,
                      soundVolume: soundSettings.volume,
                      showMoodAvatars,
                      enableVisualEffects,
                      notifications: Boolean(notifications),
                    }}
                    onSettingsChange={(newSettings) => {
                      // Theme settings
                      if (newSettings.theme !== undefined) {
                        setTheme(newSettings.theme);
                      }
                      
                      // Timer settings
                      if (newSettings.timerVisualization !== undefined) {
                        setTimerVisualization(newSettings.timerVisualization);
                      }
                      if (newSettings.timerPreset !== undefined) {
                        setTimerPreset(newSettings.timerPreset);
                      }
                      if (newSettings.customWorkDuration !== undefined) {
                        setCustomWorkDuration(newSettings.customWorkDuration);
                      }
                      if (newSettings.customBreakDuration !== undefined) {
                        setCustomBreakDuration(newSettings.customBreakDuration);
                      }
                      
                      // Sound settings
                      if (newSettings.soundEnabled !== undefined) {
                        setSoundEnabled(newSettings.soundEnabled);
                      }
                      if (newSettings.soundVolume !== undefined) {
                        setSoundVolume(newSettings.soundVolume);
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
