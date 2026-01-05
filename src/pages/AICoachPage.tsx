import React, { useState, useEffect, useRef } from 'react';
import { Brain, MessageCircle, Sparkles, TrendingUp, Target, Zap, Trophy, Flame, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { getInitialStats, UserStats } from '../utils/gamification';
import { mlPatternAnalysisService, UserBehaviorProfile, MLInsight } from '../services/mlPatternAnalysisService';
import { nlpService, QueryAnalysis, ConversationContext } from '../services/nlpService';
import { adaptiveLearningService, RecommendationScore } from '../services/adaptiveLearningService';
import { Session } from '../api/breakService';

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
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserBehaviorProfile | null>(null);
  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: '1',
      type: 'coach',
      content: "🧠 **Welcome to your AI-Powered Focus Mastery Hub!**\n\nI'm using machine learning to analyze your patterns and provide personalized insights. Here's what I can help you with:\n\n• **Productivity Analysis**: Identify your unique work style and patterns\n• **Focus Optimization**: Data-driven strategies for better concentration\n• **Wellness Insights**: Balance productivity with mental health\n• **Personalized Recommendations**: Custom tips based on your behavior\n\nReady to discover your productivity archetype?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<QueryAnalysis[]>([]);
  const [currentMood, setCurrentMood] = useState<string>('');
  const [isMLLoading, setIsMLLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load real user stats and initialize ML analysis
  useEffect(() => {
    const userStats = getInitialStats();
    setStats(userStats);
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Initialize ML analysis with mock session data
    initializeMLAnalysis();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Initialize ML analysis
  const initializeMLAnalysis = async () => {
    setIsMLLoading(true);
    
    try {
      
      const mockSessions = generateMockSessions(stats);
      
      // Analyze user behavior patterns
      const profile = mlPatternAnalysisService.analyzeUserBehavior(mockSessions, 'user-1');
      setUserProfile(profile);
      
      // Add ML insights to conversation
      if (profile.insights.length > 0) {
        const insightMessage: AICoachMessage = {
          id: 'ml-insights',
          type: 'coach',
          content: `🤖 **ML Analysis Complete!**\n\nI've analyzed your patterns and identified you as a **${profile.archetype.name}**.\n\n**Key Insights:**\n${profile.insights.slice(0, 2).map(insight => `• ${insight.title}: ${insight.description}`).join('\n')}\n\n**What I can help you with:**\n• Personalized productivity strategies\n• Focus optimization techniques\n• Wellness and balance recommendations\n• Performance pattern analysis\n\nAsk me anything about your productivity patterns!`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, insightMessage]);
      }
    } catch (error) {
      console.error('ML Analysis failed:', error);
    } finally {
      setIsMLLoading(false);
    }
  };

  // Generate mock session data based on stats
  const generateMockSessions = (userStats: UserStats | null): Session[] => {
    if (!userStats || userStats.totalSessions === 0) return [];
    
    const sessions: Session[] = [];
    const now = new Date();
    
    for (let i = 0; i < Math.min(userStats.totalSessions, 50); i++) {
      const sessionDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Past sessions
      const focusDuration = 25 * 60 + Math.random() * 20 * 60; // 25-45 minutes
      const breakDuration = 5 * 60 + Math.random() * 10 * 60; // 5-15 minutes
      
      sessions.push({
        id: i,
        userId: 'demo-user',
        date: sessionDate.toISOString(),
        focus_duration: focusDuration,
        break_duration: breakDuration,
        notes: '',
        timestamp: sessionDate.toISOString(),
        streakCount: Math.floor(Math.random() * 10) + 1,
        totalPoints: Math.floor(Math.random() * 100) + 10,
        sentiment_score: Math.random() * 0.4 + 0.6 // 0.6-1.0
      });
    }
    
    return sessions;
  };

  // Generate personalized insights based on real stats
  const generatePersonalizedInsights = (): AIInsight[] => {
    if (!stats) return [];

    const insights: AIInsight[] = [];
    
    // Focus time insight
    if (stats.totalFocusTime > 0) {
      const hours = Math.floor(stats.totalFocusTime / 60);
      const minutes = stats.totalFocusTime % 60;
      insights.push({
        id: 'focus-time',
        title: '🔥 Focus Warrior',
        description: `You've accumulated ${hours}h ${minutes}min of deep focus! ${hours >= 10 ? "That's serious dedication!" : "Keep building this momentum!"}`,
        icon: <Clock className="w-5 h-5" />,
        type: 'focus'
      });
    }

    // Streak insight
    if (stats.currentStreak > 0) {
      let streakMessage = "";
      if (stats.currentStreak >= 7) {
        streakMessage = "Incredible! You're on a week-long streak!";
      } else if (stats.currentStreak >= 3) {
        streakMessage = "Great momentum! Keep this streak going!";
      } else {
        streakMessage = "Nice start! Let's build this into a habit.";
      }
      insights.push({
        id: 'streak',
        title: '🔥 Streak Master',
        description: `${stats.currentStreak} day streak! ${streakMessage}`,
        icon: <Flame className="w-5 h-5" />,
        type: 'achievement'
      });
    }

    // Session consistency insight
    if (stats.totalSessions >= 5) {
      const avgSessionLength = Math.round(stats.totalFocusTime / stats.totalSessions);
      insights.push({
        id: 'consistency',
        title: '⚡ Consistency King',
        description: `${stats.totalSessions} sessions completed! Your average session is ${avgSessionLength} minutes. ${avgSessionLength >= 20 ? "Perfect for deep work!" : "Try longer sessions for better flow states."}`,
        icon: <Trophy className="w-5 h-5" />,
        type: 'productivity'
      });
    }

    // Productivity pattern insight
    if (stats.focusPoints > 0) {
      insights.push({
        id: 'points',
        title: '💎 Point Collector',
        description: `${stats.focusPoints} productivity points earned! ${stats.focusPoints >= 100 ? "You're in the top tier of focus masters!" : "Every point counts toward your mastery journey!"}`,
        icon: <Sparkles className="w-5 h-5" />,
        type: 'achievement'
      });
    }

    // Wellness insight (if they've been working a lot)
    if (stats.totalFocusTime > 120) { // More than 2 hours
      insights.push({
        id: 'wellness',
        title: '🧘 Wellness Alert',
        description: "You've been crushing it! Remember to take breaks and stay hydrated. Your brain needs rest to perform at its best.",
        icon: <Brain className="w-5 h-5" />,
        type: 'wellness'
      });
    }

    return insights;
  };

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

    // Analyze user query with NLP
    const queryAnalysis = nlpService.analyzeQuery(inputMessage, {
      previousQueries: conversationHistory,
      userProfile: userProfile || undefined,
      currentMood: currentMood || undefined
    } as ConversationContext);

    // Update conversation history
    setConversationHistory(prev => [...prev, queryAnalysis]);

    // Generate ML-enhanced response
    setTimeout(() => {
      const coachResponse: AICoachMessage = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: generateMLEnhancedResponse(queryAnalysis),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, coachResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Generate ML-enhanced response
  const generateMLEnhancedResponse = (queryAnalysis: QueryAnalysis): string => {
    if (!userProfile) {
      return "🧠 **Welcome to your AI Coach!**\n\nI'm here to help you master your productivity. Here's what I can do:\n\n• **Pattern Analysis**: Identify your unique productivity archetype\n• **Personalized Recommendations**: Custom strategies based on your work style\n• **Focus Optimization**: Data-driven tips for better concentration\n• **Wellness Insights**: Balance productivity with well-being\n\nStart a few focus sessions and I'll provide personalized insights!";
    }

    const { intent } = queryAnalysis;
    const sentiment = queryAnalysis.intent.sentiment;
    const entities = queryAnalysis.intent.entities;
    let response = '';

    // Use ML insights to generate response
    const relevantInsights = userProfile.insights.filter(insight => 
      insight.type === 'recommendation' || 
      (insight.type === 'pattern' && intent.confidence > 0.7)
    );

    // Generate response based on intent and ML insights
    switch (intent.type) {
      case 'productivity':
        response = `📈 **Productivity Analysis**\n\n**Your Profile**: ${userProfile.archetype.name}\n${userProfile.archetype.description}\n\n**Personalized Recommendations:**`;
        
        userProfile.archetype.recommendations.slice(0, 3).forEach(rec => {
          response += `\n• ${rec}`;
        });
        
        if (relevantInsights.length > 0 && relevantInsights[0]) {
          response += `\n\n**Recent Insights:**\n• ${relevantInsights[0].description}`;
        }
        break;

      case 'wellness':
        response = `🧘 **Wellness Intelligence**\n\n**Your Wellness Status**: ${userProfile.insights.filter(i => i.type === 'anomaly').length > 0 ? 'Some areas need attention' : 'Your patterns look healthy!'}\n\n**For your ${userProfile.archetype.name} style:**`;
        
        // Add wellness-specific recommendations
        if (sentiment.label === 'negative') {
          response += '\n• Consider taking a recovery break\n• Your current patterns suggest high stress\n• Try a 10-minute meditation session';
        } else {
          response += '\n• Maintain your current routine\n• Your wellness indicators are positive\n• Keep up the great work!';
        }
        break;

      case 'focus':
        response = `🎯 **Focus Optimization**\n\n**Your Focus Style**: As a ${userProfile.archetype.name}, your patterns show: ${userProfile.patterns.filter(p => p.type === 'session-based').length > 0 ? 'Strong session consistency' : 'Room for improvement'}\n\n**ML-Recommended Strategies:**`;
        
        // Add focus-specific insights
        const focusInsights = userProfile.insights.filter(i => i.type === 'pattern' && i.title.toLowerCase().includes('focus'));
        if (focusInsights.length > 0 && focusInsights[0]) {
          response += `\n• Focus pattern detected: ${focusInsights[0].title}\n• Recommendation: ${focusInsights[0].description}`;
        }
        
        response += '\n\n**Quick Focus Tips:**\n• Use the Pomodoro Technique (25min focus, 5min break)\n• Eliminate distractions before starting\n• Set clear intentions for each session';
        break;

      case 'help':
        response = `🤖 **AI Coach Capabilities**\n\nI can provide:\n\n• **Pattern Analysis**: Your productivity archetype and behavioral patterns\n• **Predictive Insights**: When you'll be most productive\n• **Personalized Recommendations**: Based on your unique work style\n• **Real-time Guidance**: Context-aware suggestions\n\n**Your Current Stats:**\n• Profile: ${userProfile.archetype.name}\n• Confidence Level: ${Math.round(userProfile.insights.reduce((acc, i) => acc + i.confidence, 0) / userProfile.insights.length * 100)}%\n• Patterns Identified: ${userProfile.patterns.length}\n\nWhat would you like to explore?`;
        break;

      default:
        response = `🧠 **Intelligent Analysis**\n\nI understand you're interested in ${intent.type}. Based on your ${userProfile.archetype.name} profile:\n\n**Key Metrics:**\n• Pattern Confidence: ${Math.round(userProfile.insights.reduce((acc, i) => acc + i.confidence, 0) / userProfile.insights.length * 100)}%\n• Identified Patterns: ${userProfile.patterns.length}\n• Active Recommendations: ${userProfile.insights.filter(i => i.actionable).length}\n\n**Ask me about:**\n• Productivity strategies\n• Focus optimization\n• Wellness recommendations\n• Performance insights`;
    }

    // Add sentiment-aware closing
    if (sentiment.label === 'negative') {
      response += '\n\n**💙 Support Note:** I notice you might be feeling frustrated. I\'m here to help you turn things around with data-driven strategies.';
    } else if (sentiment.label === 'positive') {
      response += '\n\n**🚀 Momentum Builder:** Great attitude! Let\'s build on this positive momentum.';
    }

    // Add entity-specific information
    if (entities.length > 0) {
      response += '\n\n**Context:** I detected ' + entities.map((e: any) => `${e.type}: ${e.value}`).join(', ');
    }

    return response;
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'productivity': return 'from-blue-500 to-cyan-500';
      case 'wellness': return 'from-green-500 to-emerald-500';
      case 'focus': return 'from-green-500 to-emerald-500';
      case 'achievement': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'productivity-report':
        // Scroll to top before navigating
        window.scrollTo(0, 0);
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
          content: `🚀 Here are your personalized power tips:\n\n${stats ? 
            `Based on your ${stats.totalSessions} completed sessions:\n` + 
            (stats.totalFocusTime > 60 ? 
              `🔥 You're a focus warrior! Keep up those ${Math.floor(stats.totalFocusTime / 60)}h+ sessions!\n` : 
              `💪 Great start! Every session builds your focus muscle.\n`) +
            (stats.currentStreak > 0 ? 
              `⚡ Your ${stats.currentStreak}-day streak is building momentum!\n` : 
              `🎯 Let's build your first streak starting today!\n`)
          : 
            "🎯 Start your focus journey with these tips:\n"
          }\n\n💎 **Pro Strategies:**\n1. 🍅 Pomodoro Power: 25min focus, 5min break\n2. 📱 Phone Detox: Put it in another room\n3. 🎵 Focus Sounds: Instrumental music or white noise\n4. 💧 Fuel Up: Water and healthy snacks ready\n5. 🌿 Active Breaks: Stretch or walk between sessions.\n\nWhich tip will you master first?`,
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
        : 'from-green-50 via-white to-green-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white">
              <Brain className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            🚀 Focus Mastery Hub
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Level up your productivity with AI-powered insights</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-3xl shadow-xl border overflow-hidden ${
              isDarkMode ? 'border-white/10' : 'border-white/20'
            }`}>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6" />
                  <h2 className="text-lg font-semibold">⚡ Strategy Chat</h2>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
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
                <div ref={messagesEndRef} />
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
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                🎯 Your Performance Insights
              </h3>
              <div className="space-y-3">
                {generatePersonalizedInsights().length > 0 ? (
                  generatePersonalizedInsights().map((insight) => (
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
                  ))
                ) : (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Start some focus sessions to unlock personalized insights!</p>
                    <p className="text-xs mt-1">I'll analyze your patterns and give you custom strategies.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-3xl shadow-xl border p-6 ${
              isDarkMode ? 'border-white/10' : 'border-white/20'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                ⚡ Power Actions
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
                  📊 Check Your Stats
                </button>
                <button 
                  onClick={() => handleQuickAction('optimize-schedule')}
                  className={`w-full px-4 py-3 rounded-xl hover:transition-colors text-left font-medium ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  🎯 Start Focus Session
                </button>
                <button 
                  onClick={() => handleQuickAction('focus-tips')}
                  className={`w-full px-4 py-3 rounded-xl hover:transition-colors text-left font-medium ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  💡 Get Pro Tips
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
