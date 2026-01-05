import React, { useState, useEffect } from 'react';
import { getSessionHistory, Session } from '@/api/breakService';
import { useSettings } from '../contexts/SettingsContext';

const HistoryPage: React.FC = () => {
  const { isDarkMode } = useSettings();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionHistory = async () => {
      try {
        setLoading(true);
        const response = await getSessionHistory(50); // Fetch last 50 sessions
        setSessions(response.sessions);
      } catch (err) {
        console.error('Failed to fetch session history:', err);
        setError('Begin your session so you can see your history');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Transform session data to match the display format
  const transformSession = (session: Session) => {
    // Use focus_duration as primary, fallback to break_duration
    const duration = session.focus_duration || session.break_duration || 0;
    const type = session.focus_duration > 0 ? 'focus' : 'break';
    
    return {
      ...session,
      duration,
      type,
      completed: true, // Assuming all fetched sessions are completed
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Session History</h1>
        <div className={`shadow overflow-hidden sm:rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading session history...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Session History</h1>
        <div className={`shadow overflow-hidden sm:rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-4 py-8 text-center text-red-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Session History</h1>
      <div className={`shadow overflow-hidden sm:rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <ul className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {sessions.length > 0 ? (
            sessions.map((session) => {
              const transformedSession = transformSession(session);
              return (
                <li key={session.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {transformedSession.type === 'focus' ? 'Focus Session' : 'Break'}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                          {transformedSession.completed ? 'Completed' : 'Incomplete'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <svg
                            className={`flex-shrink-0 mr-1.5 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formatDate(session.timestamp || session.date || session.created_at || '')}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p>
                          {transformedSession.duration} min
                        </p>
                      </div>
                    </div>
                    {session.mood_emoji && (
                      <div className={`mt-2 flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="mr-2">Mood:</span>
                        <span className="text-lg">{session.mood_emoji}</span>
                      </div>
                    )}
                    {session.notes && (
                      <div className={`mt-2 p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Notes:</span> {session.notes}
                      </div>
                    )}
                  </div>
                </li>
              );
            })
          ) : (
            <li className={`px-4 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No sessions found. Start focusing to see your history here!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default HistoryPage;
