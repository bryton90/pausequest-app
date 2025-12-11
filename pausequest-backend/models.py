from datetime import datetime, timedelta

import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app

from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship: one-to-many with sessions (defined in app.py)
    sessions = db.relationship("Session", backref="user", lazy=True, cascade="all, delete-orphan")

    # Password helpers -----------------------------------------------------
    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    # JWT helpers ----------------------------------------------------------
    def generate_auth_token(self, expires_in: int = 3600) -> str:
        """Return a signed JWT containing the user's ID."""
        payload = {"user_id": self.id, "exp": datetime.utcnow() + timedelta(seconds=expires_in)}
        return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

    @staticmethod
    def verify_auth_token(token: str):
        """Return a `User` instance if the token is valid, else None."""
        try:
            data = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            return User.query.get(data["user_id"])
        except Exception:  # noqa: broad-except
            return None
