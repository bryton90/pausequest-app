import React from 'react';
import { useBreakTypes } from '../../hooks/useBreakTypes';

interface BreakFormProps {
  breakType: string;
  mood: string;
  error: string;
  onBreakTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMoodChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const BreakForm: React.FC<BreakFormProps> = ({
  breakType,
  mood,
  error,
  onBreakTypeChange,
  onMoodChange,
  onSubmit,
}) => {
  const { options } = useBreakTypes();

  return (
    <div className="prompt-container">
      <h2>It's time for a break.</h2>
      <form id="breakForm" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="breakType">What kind of break was it?</label>
          <select
            id="breakType"
            value={breakType}
            onChange={onBreakTypeChange}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="mood">How are you feeling?</label>
          <textarea
            id="mood"
            rows={4}
            value={mood}
            onChange={onMoodChange}
            placeholder="I'm feeling... tired, energized, stressed, etc."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const form = document.getElementById('breakForm') as HTMLFormElement | null;
                form?.requestSubmit();
              }
            }}
          />
          <small>Press Enter to submit, Shift+Enter for a new line.</small>
          <div style={{ marginTop: 8 }}>
            <button type="submit">Save Note</button>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Log Break</button>
      </form>
    </div>
  );
};

export default BreakForm;
