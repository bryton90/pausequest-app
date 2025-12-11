from functools import wraps
from flask import request, jsonify

from models import User


def token_required(f):
    """Decorator that validates a JWT and injects the current user into the route."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Expect header: Authorization: Bearer <JWT>
        if "Authorization" in request.headers:
            value = request.headers.get("Authorization", "")
            if value.startswith("Bearer "):
                token = value.split(" ", 1)[1].strip()

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        user = User.verify_auth_token(token)
        if not user:
            return jsonify({"message": "Token is invalid or expired"}), 401

        # Inject the user into the route handler
        return f(user, *args, **kwargs)

    return decorated
