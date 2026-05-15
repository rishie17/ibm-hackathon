from billing import validate_payment
from users import load_user


def authenticate_user(user_id: str) -> bool:
    user = load_user(user_id)
    return user.get("active", False)


def checkout(user_id: str, amount: float) -> bool:
    if not authenticate_user(user_id):
        return False
    return validate_payment(user_id, amount)

