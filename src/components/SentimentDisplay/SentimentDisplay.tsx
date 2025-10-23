import React from 'react';

interface SentimentDisplayProps {
  sentimentMessage: string;
  onReset: () => void;
}

export const SentimentDisplay: React.FC<SentimentDisplayProps> = ({
  sentimentMessage,
  onReset,
}) => (
  <div className="sentiment-results">
    <h2>Your break analysis:</h2>
    <p className="sentiment-message">{sentimentMessage}</p>
    <button onClick={onReset}>Done</button>
  </div>
);

export default SentimentDisplay;
