-- ========================================
-- PauseQuest Supabase Database Schema
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Users Table
-- ========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE
);

-- ========================================
-- User Preferences Table
-- ========================================
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  work_duration INTEGER DEFAULT 25, -- minutes
  break_duration INTEGER DEFAULT 5, -- minutes
  long_break_duration INTEGER DEFAULT 15, -- minutes
  sessions_until_long_break INTEGER DEFAULT 4,
  auto_start_breaks BOOLEAN DEFAULT FALSE,
  auto_start_work BOOLEAN DEFAULT FALSE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  theme VARCHAR(20) DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ========================================
-- Pomodoro Sessions Table
-- ========================================
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('work', 'break', 'long_break')),
  planned_duration INTEGER NOT NULL, -- minutes
  actual_duration INTEGER, -- minutes (null if session is ongoing)
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  was_successful BOOLEAN DEFAULT FALSE, -- was the session completed successfully
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  distractions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- User Stats Table
-- ========================================
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_focus_time INTEGER DEFAULT 0, -- minutes
  focus_points INTEGER DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ========================================
-- Achievements Table
-- ========================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL, -- 'sessions', 'streak', 'focus_time', etc.
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- User Achievements Table
-- ========================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ========================================
-- Wellness Insights Table
-- ========================================
CREATE TABLE wellness_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- 'productivity', 'mood', 'energy', 'pattern'
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  data JSONB, -- flexible storage for insight-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- ========================================
-- Insert Default Achievements
-- ========================================
INSERT INTO achievements (title, description, icon, requirement_type, requirement_value, points) VALUES
('First Steps', 'Complete your first focus session', '🎯', 'sessions', 1, 10),
('Getting Started', 'Maintain a 3-day streak', '🔥', 'streak', 3, 25),
('Week Warrior', 'Maintain a 7-day streak', '⚡', 'streak', 7, 50),
('Monthly Master', 'Maintain a 30-day streak', '👑', 'streak', 30, 100),
('Dedicated', 'Complete 10 focus sessions', '💪', 'sessions', 10, 30),
('Committed', 'Complete 50 focus sessions', '🌟', 'sessions', 50, 75),
('Centurion', 'Complete 100 focus sessions', '🏆', 'sessions', 100, 150),
('Time Keeper', 'Accumulate 10 hours of focus time', '⏰', 'focus_time', 600, 40),
('Focus Master', 'Accumulate 50 hours of focus time', '🧘', 'focus_time', 3000, 200),
('Productivity Powerhouse', 'Accumulate 100 hours of focus time', '💎', 'focus_time', 6000, 300);

-- ========================================
-- Enable Row Level Security (RLS)
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_insights ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS Policies
-- ========================================

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- User preferences
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Pomodoro sessions
CREATE POLICY "Users can view own sessions" ON pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON pomodoro_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON pomodoro_sessions FOR DELETE USING (auth.uid() = user_id);

-- User stats
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- User achievements
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wellness insights
CREATE POLICY "Users can view own insights" ON wellness_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON wellness_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON wellness_insights FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- Functions and Triggers
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pomodoro_sessions_updated_at BEFORE UPDATE ON pomodoro_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user stats when user is created
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id, total_sessions, current_streak, longest_streak, total_focus_time, focus_points)
    VALUES (NEW.id, 0, 0, 0, 0, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create user stats
CREATE TRIGGER create_user_stats_trigger AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- Function to create user preferences when user is created
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create user preferences
CREATE TRIGGER create_user_preferences_trigger AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION create_user_preferences();

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_started_at ON pomodoro_sessions(started_at);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_wellness_insights_user_id ON wellness_insights(user_id);
CREATE INDEX idx_wellness_insights_created_at ON wellness_insights(created_at);

-- ========================================
-- Views for Common Queries
-- ========================================

-- View for user sessions with stats
CREATE VIEW user_session_stats AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(ps.id) as total_sessions,
    COUNT(CASE WHEN ps.type = 'work' THEN 1 END) as work_sessions,
    COUNT(CASE WHEN ps.type IN ('break', 'long_break') THEN 1 END) as break_sessions,
    SUM(CASE WHEN ps.type = 'work' THEN COALESCE(ps.actual_duration, ps.planned_duration) ELSE 0 END) as total_work_minutes,
    AVG(CASE WHEN ps.type = 'work' THEN COALESCE(ps.actual_duration, ps.planned_duration) ELSE NULL END) as avg_work_session_length,
    MAX(ps.started_at) as last_session_at
FROM users u
LEFT JOIN pomodoro_sessions ps ON u.id = ps.user_id
GROUP BY u.id, u.email;

-- View for user achievements with details
CREATE VIEW user_achievement_details AS
SELECT 
    ua.user_id,
    a.title,
    a.description,
    a.icon,
    a.points,
    ua.unlocked_at
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
ORDER BY ua.unlocked_at DESC;
