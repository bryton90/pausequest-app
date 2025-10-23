# PauseQuest - Project Overview

## Project Description
PauseQuest is a full-stack productivity web application designed to help users manage their work sessions and take meaningful breaks. The application features a Pomodoro-style timer, break management, and mood tracking to promote work-life balance and productivity.

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Key Libraries**:
  - React DOM
  - TypeScript
  - ESLint

### Backend
- **Framework**: Python (Flask)
- **Database**: SQLite (stored in `instance/` directory)
- **Key Files**:
  - `app.py` - Main application logic
  - `requirements.txt` - Python dependencies

## Features

### Core Functionality
- **Pomodoro Timer**
  - 25-minute focused work sessions
  - Configurable break intervals
  - Session tracking

### Break Management
- Multiple break types:
  - Lunch
  - Snack
  - Water
  - Stretch
- Break prompts and logging
- Mood tracking after breaks

### User Experience
- Clean, intuitive interface
- Activity history
- Progress visualization
- Responsive design

## Project Structure
```
pausequest-app/
├── src/                  # Frontend source code
├── public/              # Static assets
├── pausequest-backend/  # Python backend
│   ├── app.py          # Main Flask application
│   ├── requirements.txt # Python dependencies
│   └── instance/       # Database and instance files
├── node_modules/        # Frontend dependencies
├── package.json         # Frontend dependencies and scripts
└── README.md           # Project documentation
```

## Development Setup

### Prerequisites
- Node.js (v16+)
- npm (v8+)
- Python (3.8+)
- pip (Python package manager)

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd pausequest-backend
   ```
2. Create and activate virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask development server:
   ```bash
   python app.py
   ```

## Development Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Future Enhancements
- User authentication
- Cloud synchronization
- Mobile application
- Advanced analytics
- Customizable timer settings
- Integration with productivity tools

---
*Last updated: *
