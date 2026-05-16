import sqlite3
from pathlib import Path


DB_PATH = Path("aegis.db")


def initialize_database(path: Path = DB_PATH) -> None:
    """Create the lightweight SQLite store used by future persisted analyses."""
    with sqlite3.connect(path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS analysis_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                repository_root TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

