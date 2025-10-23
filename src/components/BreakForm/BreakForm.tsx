import React from 'react';

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
}) => (
  <div className="prompt-container">
    <h2>It's time for a break.</h2>
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="breakType">What kind of break was it?</label>
        <select
          id="breakType"
          value={breakType}
          onChange={onBreakTypeChange}
        >
          <option value="lunch">Lunch 🍽️</option>
          <option value="snack">Snack 🍎</option>
          <option value="water">Water 💧</option>
          <option value="stretch">Stretch 🤸‍♂️</option>
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
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      <button type="submit">Log Break</button>
    </form>
  </div>
);

export default BreakForm;
