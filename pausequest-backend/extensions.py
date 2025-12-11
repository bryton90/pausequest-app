from flask_sqlalchemy import SQLAlchemy

# Global SQLAlchemy instance to be shared across the backend
# Import this as `from extensions import db`
# and call `db.init_app(app)` inside your Flask application factory.

db = SQLAlchemy()
