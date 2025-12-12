"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Coffee,
  Loader,
  Brain,
  Lightbulb,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

// Helper util to format mm:ss
const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const moodsConfig = [
  {
    id: "energized",
    label: "Energized",
    emoji: "⚡",
    color: "bg-yellow-100 border-yellow-300",
  },
  {
    id: "focused",
    label: "Focused",
    emoji: "🎯",
    color: "bg-blue-100 border-blue-300",
  },
  {
    id: "stressed",
    label: "Stressed",
    emoji: "😰",
    color: "bg-red-100 border-red-300",
  },
  {
    id: "calm",
    label: "Calm",
    emoji: "😌",
    color: "bg-green-100 border-green-300",
  },
  {
    id: "tired",
    label: "Tired",
    emoji: "😴",
    color: "bg-purple-100 border-purple-300",
  },
  {
    id: "motivated",
    label: "Motivated",
    emoji: "🔥",
    color: "bg-orange-100 border-orange-300",
  },
] as const;

type Mood = (typeof moodsConfig)[number];

globalThis.requestAnimationFrame ??= (cb: FrameRequestCallback) =>
  setTimeout(() => cb(Date.now()), 16) as unknown as number; // fallback for SSR

globalThis.cancelAnimationFrame ??= (id: number) => clearTimeout(id);

export default function MainPage() {
  /* --------------------------- General State --------------------------- */
  const [currentView, setCurrentView] = useState<
    "timer" | "profile" | "ai-coach"
  >("timer");
  const [customMinutes, setCustomMinutes] = useState(25);
  const [time, setTime] = useState(customMinutes * 60); // seconds remaining
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"focus" | "break">(
    "focus",
  );

  // Notes
  const [sessionNotes, setSessionNotes] = useState("");

  /* ------------------------- User & Session Stats ------------------------- */
  const [userStats, setUserStats] = useState({
    points: 0,
    streak: 0,
    level: 1,
    xp: 0,
    totalSessions: 0,
    totalFocusHours: 0,
  });
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);

  /* -------------------------- AI Coach State -------------------------- */
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [showAiCoach] = useState(false); // reserved for future toggling

  /* ---------------------------- Mood State ---------------------------- */
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  /* ----------------------- Refs for RAF timer ----------------------- */
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  /* --------------------------- Timer Logic --------------------------- */
  useEffect(() => {
    if (isRunning && time > 0) {
      const animate = (now: number) => {
        if (previousTimeRef.current != null) {
          const deltaInSeconds = (now - previousTimeRef.current) / 1000;
          setTime((prev) => {
            const next = Math.max(prev - deltaInSeconds, 0);
            if (next === 0) {
              setIsRunning(false);
              setShowMoodSelector(true);
            }
            return next;
          });
        }
        previousTimeRef.current = now;
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        previousTimeRef.current = null;
      };
    }
  }, [isRunning]);

  /* -------------------------- Load user data -------------------------- */
  useEffect(() => {
    loadUserData();
  }, []);

  function loadUserData() {
    // TODO: Replace with actual API/service call (e.g., sessionService.loadHistory())
    const mockSessions = [
      {
        id: 1,
        type: "focus",
        duration: 25,
        mood: "focused",
        timestamp: Date.now() - 86400000 * 2,
        productivity: 8,
      },
      {
        id: 2,
        type: "focus",
        duration: 25,
        mood: "energized",
        timestamp: Date.now() - 86400000 * 2,
        productivity: 9,
      },
      {
        id: 3,
        type: "break",
        duration: 5,
        mood: "calm",
        timestamp: Date.now() - 86400000 * 1,
        productivity: 7,
      },
      {
        id: 4,
        type: "focus",
        duration: 25,
        mood: "stressed",
        timestamp: Date.now() - 86400000 * 1,
        productivity: 5,
      },
      {
        id: 5,
        type: "focus",
        duration: 25,
        mood: "focused",
        timestamp: Date.now() - 3600000,
        productivity: 8,
      },
    ];

    setSessionHistory(mockSessions);
    setUserStats({
      points: 1250,
      streak: 5,
      level: 3,
      xp: 450,
      totalSessions: 42,
      totalFocusHours: 17.5,
    });
  }

  /* --------------------------- Timer Handlers --------------------------- */
  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(customMinutes * 60);
  };

  /* --------------------------- Mood Handling --------------------------- */
  const handleMoodSelection = (mood: Mood) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);

    const newMoodEntry = {
      mood: mood.id,
      timestamp: Date.now(),
      sessionType,
    };
    setMoodHistory((prev) => [...prev, newMoodEntry]);

    const newSession = {
      id: Date.now(),
      type: sessionType,
      duration: customMinutes,
      mood: mood.id,
      timestamp: Date.now(),
      productivity: Math.floor(Math.random() * 5) + 5, // Mock productivity
      notes: sessionNotes.trim() || undefined,
    };
    setSessionHistory((prev) => [...prev, newSession]);
    setSessionNotes("");

    resetTimer();
  };

  /* ------------------------ AI Insight Generation ------------------------ */
  function generateAIInsights() {
    setIsGeneratingInsights(true);
    // open AI Coach tab automatically
    setCurrentView("ai-coach");

    setTimeout(() => {
      const insights = analyzeUserPatterns();
      setAiInsights(insights);
      setIsGeneratingInsights(false);
    }, 2000);
  }

  /* --------------------- AI Analysis Helpers (mock) --------------------- */
  function analyzeUserPatterns() {
    const recentSessions = sessionHistory.slice(-10);
    const moodCounts: Record<string, number> = {};
    const hourlyPatterns: Record<string, number> = {};
    let totalProductivity = 0;

    recentSessions.forEach((session) => {
      moodCounts[session.mood] = (moodCounts[session.mood] || 0) + 1;
      totalProductivity += session.productivity || 0;
      const hour = new Date(session.timestamp).getHours();
      hourlyPatterns[hour] = (hourlyPatterns[hour] || 0) + 1;
    });

    const avgProductivity = totalProductivity / recentSessions.length || 0;
    const dominantMood = Object.keys(moodCounts).length
      ? Object.keys(moodCounts).reduce((a, b) =>
          (moodCounts[a] ?? 0) > (moodCounts[b] ?? 0) ? a : b,
        )
      : "neutral";
    const peakHour = Object.keys(hourlyPatterns).length
      ? Object.keys(hourlyPatterns).reduce((a, b) =>
          (hourlyPatterns[a] ?? 0) > (hourlyPatterns[b] ?? 0) ? a : b,
        )
      : "0";

    return {
      summary: generateSummary(dominantMood, avgProductivity, userStats.streak),
      recommendations: generateRecommendations(dominantMood, avgProductivity, +peakHour),
      patterns: {
        dominantMood,
        avgProductivity: avgProductivity.toFixed(1),
        peakHour: +peakHour,
        streakStatus:
          userStats.streak >= 7
            ? "excellent"
            : userStats.streak >= 3
            ? "good"
            : "building",
      },
      predictions: generatePredictions(recentSessions, +peakHour),
      motivationalQuote: getMotivationalQuote(dominantMood),
    };
  }

  function generateSummary(mood: string, productivity: number, streak: number) {
    if (productivity >= 8) {
      return `Excellent work! You're in a highly productive flow state. Your ${streak}-day streak shows remarkable consistency. Keep leveraging your peak performance patterns.`;
    } else if (productivity >= 6) {
      return `You're maintaining good productivity levels. Your recent ${mood} mood suggests you're finding your rhythm. A few optimizations could elevate your performance further.`;
    } else {
      return `I notice you've been experiencing some challenges. Your recent sessions show potential for improvement. Let's work together to identify what's holding you back and create a better routine.`;
    }
  }

  function generateRecommendations(
    mood: string,
    productivity: number,
    peakHour: number,
  ) {
    const recs: Array<{
      icon: string;
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
    }> = [];

    if (mood === "stressed") {
      recs.push({
        icon: "🧘",
        title: "Stress Management",
        description:
          "Your recent sessions show elevated stress. Try 5-minute breathing exercises before focus sessions.",
        priority: "high",
      });
    } else if (mood === "tired") {
      recs.push({
        icon: "💤",
        title: "Energy Optimization",
        description:
          "Consider shorter 15-minute sessions with more frequent breaks to maintain energy levels.",
        priority: "high",
      });
    }

    if (productivity < 6) {
      recs.push({
        icon: "🎯",
        title: "Focus Enhancement",
        description:
          "Try the \"2-minute rule\": Start with just 2 minutes of work to overcome resistance.",
        priority: "medium",
      });
    }

    recs.push({
      icon: "⏰",
      title: "Optimal Timing",
      description: `Your peak productivity is around ${peakHour}:00. Schedule your most important tasks during this window.`,
      priority: "medium",
    });

    if (userStats.streak >= 7) {
      recs.push({
        icon: "🏆",
        title: "Streak Master",
        description:
          "Amazing streak! Consider setting a new challenge: increase session duration by 5 minutes.",
        priority: "low",
      });
    }

    recs.push({
      icon: "💧",
      title: "Hydration Reminder",
      description: "Stay hydrated! Drink water during breaks to maintain cognitive performance.",
      priority: "low",
    });

    return recs;
  }

  function generatePredictions(sessions: any[], peakHour: number) {
    const currentHour = new Date().getHours();
    const preds: string[] = [];

    if (currentHour < peakHour) {
      preds.push(
        `You typically perform best in ${peakHour - currentHour} hours. Consider warming up with lighter tasks now.`,
      );
    } else if (currentHour === peakHour) {
      preds.push(
        "This is your peak performance window! Tackle your most challenging work now.",
      );
    } else {
      preds.push(
        "You're past your peak hour. Focus on completion tasks and planning for tomorrow.",
      );
    }

    if (userStats.streak > 0) {
      preds.push(
        `Based on your ${userStats.streak}-day streak, you're 85% likely to complete today's session successfully.`,
      );
    }

    return preds;
  }

  function getMotivationalQuote(mood: string) {
    const quotes: Record<string, string> = {
      stressed:
        "Pressure creates diamonds. You're being shaped into something brilliant.",
      tired: "Rest is not idleness. It's the foundation of your next breakthrough.",
      focused: "You're in the zone. This is where magic happens.",
      energized: "Channel this energy wisely. You're unstoppable right now.",
      calm: "Peace of mind is your superpower. Use it to create something meaningful.",
      motivated: "Motivation got you started. Discipline will keep you going.",
    };
    return quotes[mood] || "Every session is a step toward mastery.";
  }

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PauseQuest
            </h1>
          </div>

          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentView("timer")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === "timer"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-indigo-200 hover:text-indigo-800"
              }`}
            >
              Timer
            </button>
            <button
              onClick={() => setCurrentView("profile")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === "profile"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-indigo-200 hover:text-indigo-800"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => {
                setCurrentView("ai-coach");
                if (!aiInsights) generateAIInsights();
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                currentView === "ai-coach"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Coach
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === "timer" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Timer Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Focus Timer
                  </h2>
                  <p className="text-gray-600">
                    Stay focused, take breaks, achieve more
                  </p>
                </div>

                {/* Timer Display */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <svg className="w-64 h-64 transform -rotate-90">
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 120}`}
                        strokeDashoffset={`${2 * Math.PI * 120 * (1 - time / (customMinutes * 60))}`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-800">
                          {formatTime(time)}
                        </div>
                        <div className="text-sm text-gray-500 mt-2 capitalize">
                          {sessionType} Session
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-6">
                  {!isRunning ? (
                    <button
                      onClick={startTimer}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all flex items-center gap-2"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </button>
                  )}
                  <button
                    onClick={resetTimer}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </button>
                </div>

                {/* Session Type & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Type
                    </label>
                    <select
                      value={sessionType}
                      onChange={(e) =>
                        setSessionType(e.target.value as "focus" | "break")
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={isRunning}
                    >
                      <option value="focus">Focus</option>
                      <option value="break">Break</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={customMinutes}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value) || 1);
                        setCustomMinutes(val);
                        if (!isRunning) setTime(val * 60);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={isRunning}
                      min={1}
                      max={120}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              {/* Gamification Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Your Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-700">Points</span>
                    </div>
                    <span className="font-bold text-indigo-600">
                      {userStats.points}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-700">Streak</span>
                    </div>
                    <span className="font-bold text-orange-600">
                      {userStats.streak} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-700">Level</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {userStats.level}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>XP Progress</span>
                      <span>{userStats.xp}/500</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${(userStats.xp / 500) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Input */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" /> Session Notes
                </h3>
                <textarea
                  rows={3}
                  placeholder="Optional notes about this session..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    /* simple feedback interaction */
                    alert("Notes saved locally for this session ✨");
                  }}
                  disabled={!sessionNotes.trim()}
                  className="mt-3 w-full px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium disabled:opacity-60 hover:bg-indigo-600 transition-colors"
                >
                  Check In
                </button>
              </div>

              {/* AI Quick Insight */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-bold">AI Quick Tip</h3>
                </div>
                <p className="text-sm text-indigo-100 mb-4">
                  Your productivity peaks around mid-morning. Schedule important tasks accordingly!
                </p>
                <button
                  onClick={() => {
                    setCurrentView("ai-coach");
                    if (!aiInsights) generateAIInsights();
                  }}
                  className="w-full px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-all"
                >
                  View Full Insights
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {currentView === "profile" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Your Profile
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Total Focus Time
                    </h3>
                  </div>
                  <p className="text-4xl font-bold text-indigo-600">
                    {userStats.totalFocusHours}h
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Highest Streak
                    </h3>
                  </div>
                  <p className="text-4xl font-bold text-orange-600">
                    {userStats.streak} days
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Total Sessions
                    </h3>
                  </div>
                  <p className="text-4xl font-bold text-purple-600">
                    {userStats.totalSessions}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Current Level
                    </h3>
                  </div>
                  <p className="text-4xl font-bold text-green-600">
                    Level {userStats.level}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {sessionHistory.slice(-5).reverse().map((session, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            session.type === "focus"
                              ? "bg-indigo-100"
                              : "bg-green-100"
                          }`}
                        >
                          {session.type === "focus" ? (
                            <Target className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Coffee className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 capitalize">
                            {session.type} Session
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.duration} minutes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700 capitalize">
                          {session.mood}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Coach View */}
        {currentView === "ai-coach" && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                <h2 className="text-3xl font-bold text-gray-800">
                  AI Wellness Coach
                </h2>
              </div>

              {isGeneratingInsights ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                  <p className="text-gray-600 text-lg">
                    Analyzing your patterns and generating insights...
                  </p>
                </div>
              ) : aiInsights ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-indigo-600" /> Your Wellness
                      Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {aiInsights.summary}
                    </p>
                  </div>

                  {/* Key Patterns */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Dominant Mood</p>
                      <p className="text-2xl font-bold text-blue-600 capitalize">
                        {aiInsights.patterns.dominantMood}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Avg Productivity</p>
                      <p className="text-2xl font-bold text-green-600">
                        {aiInsights.patterns.avgProductivity}/10
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Peak Hour</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {aiInsights.patterns.peakHour}:00
                      </p>
                    </div>
                  </div>

                  {/* Personalized Recommendations */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6 text-yellow-500" /> Personalized
                      Recommendations
                    </h3>
                    <div className="space-y-3">
                      {aiInsights.recommendations.map((rec: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border-2 ${
                            rec.priority === "high"
                              ? "bg-red-50 border-red-200"
                              : rec.priority === "medium"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-green-50 border-green-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-3xl">{rec.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-800">
                                  {rec.title}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    rec.priority === "high"
                                      ? "bg-red-200 text-red-800"
                                      : rec.priority === "medium"
                                      ? "bg-yellow-200 text-yellow-800"
                                      : "bg-green-200 text-green-800"
                                  }`}
                                >
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-gray-700">{rec.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Predictions */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-purple-600" /> AI
                      Predictions
                    </h3>
                    <ul className="space-y-2">
                      {aiInsights.predictions.map((pred: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                          <span className="text-gray-700">{pred}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
                    <p className="text-xl italic mb-2">
                      "{aiInsights.motivationalQuote}"
                    </p>
                    <p className="text-sm text-indigo-200">— Your AI Wellness Coach</p>
                  </div>

                  <button
                    onClick={generateAIInsights}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" /> Refresh Insights
                  </button>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Get Your Personalized Insights
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Let AI analyze your patterns and provide actionable coaching
                  </p>
                  <button
                    onClick={generateAIInsights}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
                  >
                    Generate Insights
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mood Selector */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              How are you feeling?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              This helps us provide better insights
            </p>
            <div className="grid grid-cols-2 gap-3">
              {moodsConfig.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMoodSelection(m)}
                  className={`p-4 rounded-xl border-2 ${m.color} hover:scale-105 transition-transform`}
                >
                  <div className="text-4xl mb-2 text-center">{m.emoji}</div>
                  <div className="text-center font-medium text-gray-700">
                    {m.label}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
