#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, Session
from datetime import date, datetime, timedelta

def create_sample_data():
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Check if sessions table exists and has data
        try:
            session_count = Session.query.count()
            print(f"Current session count: {session_count}")
            
            if session_count == 0:
                # Create sample sessions
                sample_sessions = [
                    Session(
                        user_id=1,
                        date=date.today() - timedelta(days=2),
                        focus_duration=1500,  # 25 minutes in seconds
                        break_duration=300,   # 5 minutes in seconds
                        mood_emoji="😊",
                        notes="Great focus session!",
                        timestamp=datetime.now() - timedelta(days=2)
                    ),
                    Session(
                        user_id=1,
                        date=date.today() - timedelta(days=1),
                        focus_duration=1800,  # 30 minutes
                        break_duration=600,   # 10 minutes
                        mood_emoji="🎯",
                        notes="Very productive",
                        timestamp=datetime.now() - timedelta(days=1)
                    ),
                    Session(
                        user_id=1,
                        date=date.today(),
                        focus_duration=1200,  # 20 minutes
                        break_duration=300,   # 5 minutes
                        mood_emoji="💪",
                        notes="Quick but effective",
                        timestamp=datetime.now()
                    )
                ]
                
                for session in sample_sessions:
                    db.session.add(session)
                
                db.session.commit()
                print(f"Created {len(sample_sessions)} sample sessions")
            else:
                print("Sessions already exist")
                
        except Exception as e:
            print(f"Error: {e}")
            # Create tables if they don't exist
            db.create_all()
            print("Created database tables")

if __name__ == "__main__":
    create_sample_data()
