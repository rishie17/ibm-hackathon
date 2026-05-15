def validate_payment(user_id: str, amount: float) -> bool:
    return bool(user_id) and amount > 0

