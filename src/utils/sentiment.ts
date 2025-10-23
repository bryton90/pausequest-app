// Helper function to translate sentiment score to a message
export const getSentimentMessage = (score: number): string => {
  if (score >= 0.05) {
    return "You're feeling pretty positive! Keep up the good work.";
  } else if (score <= -0.05) {
    return "You seem a little negative. Remember to take a mindful break.";
  } else {
    return "You're feeling quite neutral. A little refresh might help!";
  }
};

// Interface for break log data
export interface BreakLogData {
  breakType: string;
  mood: string;
}

// Interface for the API response
export interface ApiResponse {
  sentiment_score: number;
  // Add other fields
}
