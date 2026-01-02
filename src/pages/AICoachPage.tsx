import React, { useState } from 'react';
import { Brain, MessageCircle, Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

interface AICoachMessage {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'productivity' | 'wellness' | 'focus' | 'achievement';
}

const AICoachPage: React.FC = () => {
  const { isDarkMode } = useSettings();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: '1',
      type: 'coach',
      content: "Hi! I'm your AI productivity coach. I can help you optimize your focus sessions, analyze your patterns, and provide personalized recommendations. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      title: 'Peak Performance Time',
      description: 'Your most productive hours are 9-11 AM. Schedule important focus sessions during this time.',
      icon: <TrendingUp className="w-5 h-5" />,
      type: 'productivity'
    },
    {
      id: '2',
      title: 'Focus Pattern Detected',
      description: 'You maintain focus better with 25-minute sessions. Consider sticking to Pomodoro technique.',
      icon: <Target className="w-5 h-5" />,
      type: 'focus'
    },
    {
      id: '3',
      title: 'Wellness Reminder',
      description: 'You\'ve been working for 2 hours. Time for a longer break to recharge.',
      icon: <Brain className="w-5 h-5" />,
      type: 'wellness'
    },
    {
      id: '4',
      title: 'Achievement Unlocked',
      description: 'You\'ve completed 10 focus sessions this week! Keep up the great momentum.',
      icon: <Sparkles className="w-5 h-5" />,
      type: 'achievement'
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AICoachMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const coachResponse: AICoachMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, coachResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('focus') || input.includes('concentrate')) {
      return "Based on your patterns, I recommend using the Pomodoro technique with 25-minute focus sessions. Make sure to eliminate distractions by putting your phone on silent and closing unnecessary tabs. Would you like specific tips for your work environment?";
    }
    
    if (input.includes('break') || input.includes('rest')) {
      return "Breaks are crucial for maintaining productivity! I've noticed you work well with 5-minute breaks between sessions. Try stretching, walking around, or doing some quick breathing exercises during these breaks. How does your current break routine feel?";
    }
    
    if (input.includes('productivity') || input.includes('efficient')) {
      return "Your productivity has increased by 15% this week! You're doing great. To continue this trend, consider scheduling your most important tasks during your peak hours (9-11 AM). What specific aspect of productivity would you like to improve?";
    }
    
    if (input.includes('tired') || input.includes('fatigue')) {
      return "It sounds like you might be experiencing some fatigue. This is completely normal! Consider taking a longer break (15-20 minutes) and ensure you're staying hydrated. I've also noticed that sessions after 3 PM tend to be less productive for you. How are you feeling right now?";
    }
    
    return "That's a great question! Based on your focus session data, I can provide personalized advice. Could you tell me more about what specific challenge or goal you're working on? I'm here to help you optimize your productivity and well-being.";
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'productivity': return 'from-blue-500 to-cyan-500';
      case 'wellness': return 'from-green-500 to-emerald-500';
      case 'focus': return 'from-purple-500 to-pink-500';
      case 'achievement': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'productivity-report':
        navigate('/stats');
        break;
      case 'optimize-schedule':
        navigate('/');
        // Could also open a modal or scroll to schedule section
        break;
      case 'focus-tips':
        // Add a focus tip message to the chat
        const tipMessage: AICoachMessage = {
          id: Date.now().toString(),
          type: 'coach',
          content: "Here are my top focus tips for you:\n\n1. 🎯 Use the Pomodoro Technique (25min focus, 5min break)\n2. 📱 Put your phone in another room\n3. 🎵 Use instrumental music or white noise\n4. 💧 Stay hydrated and keep snacks nearby\n5. 🌿 Take short walks between sessions\n\nWhich tip would you like to explore further?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, tipMessage]);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br p-6 ${
      isDarkMode 
        ? 'from-gray-900 via-gray-800 to-gray-900' 
        : 'from-indigo-50 via-white to-purple-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white">
              <Brain className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Productivity Coach
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Your personal assistant for optimal focus and well-being</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-3xl shadow-xl border overflow-hidden ${
              isDarkMode ? 'border-white/10' : 'border-white/20'
            }`}>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6" />
                  <h2 className="text-lg font-semibold">Coach Conversation</h2>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                          : isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`px-4 py-3 rounded-2xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex space-x-2">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0.1s' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me about your productivity, focus, or well-being..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-bg-color text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Insights Sidebar */}
          <div className="space-y-6">
            <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-3xl shadow-xl border p-6 ${
              isDarkMode ? 'border-white/10' : 'border-white/20'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                Personalized Insights
              </h3>
              <div className="space-y-3">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getInsightColor(insight.type)} text-white`}>
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{insight.title}</h4>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-3xl shadow-xl border p-6 ${
              isDarkMode ? 'border-white/10' : 'border-white/20'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleQuickAction('productivity-report')}
                  className={`w-full px-4 py-3 rounded-xl hover:transition-colors text-left font-medium ${
                    isDarkMode 
                      ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900/70'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  📊 View Productivity Report
                </button>
                <button 
                  onClick={() => handleQuickAction('optimize-schedule')}
                  className={`w-full px-4 py-3 rounded-xl hover:transition-colors text-left font-medium ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  🎯 Optimize Session Schedule
                </button>
                <button 
                  onClick={() => handleQuickAction('focus-tips')}
                  className={`w-full px-4 py-3 rounded-xl hover:transition-colors text-left font-medium ${
                    isDarkMode 
                      ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900/70'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  💡 Get Focus Tips
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoachPage;
