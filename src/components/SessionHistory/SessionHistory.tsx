import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSessionHistory, Session } from '@/api/breakService';

const COLORS = {
  focus: '#2563eb', // blue
  break: '#10b981', // green
};

interface SessionHistoryProps {
  refreshTrigger?: number;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ refreshTrigger }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalFocus, setTotalFocus] = useState<number>(0);
  const [totalBreak, setTotalBreak] = useState<number>(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getSessionHistory(10);
        setSessions(data.sessions);
        setTotalFocus(data.totals.focus_duration);
        setTotalBreak(data.totals.break_duration);
      } catch (error) {
        console.error('Failed to fetch session history:', error);
      }
    };

    fetchHistory();
  }, [refreshTrigger]);

  const donutData = [
    { name: 'Focus', value: totalFocus },
    { name: 'Break', value: totalBreak },
  ];

  // Format sessions for bar chart (convert seconds to minutes)
  const barData = sessions.slice().reverse().map((session, index) => ({
    name: session.date ? new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Session ${index + 1}`,
    focus: Math.round(session.focus_duration / 60),
    break: Math.round(session.break_duration / 60),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-foreground tracking-wider">
        SESSION HISTORY
      </h2>

      {/* Donut Chart */}
      {totalFocus > 0 || totalBreak > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          No session data yet
        </div>
      )}

      {/* Bar Chart */}
      {barData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="focus" fill={COLORS.focus} name="Focus (min)" />
            <Bar dataKey="break" fill={COLORS.break} name="Break (min)" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No session history yet
        </div>
      )}
    </div>
  );
};

