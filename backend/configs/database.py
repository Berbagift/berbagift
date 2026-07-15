import os
from dotenv import load_dotenv

load_dotenv()


class DatabaseConfig:
    @classmethod
    def get_database_url(cls) -> str:
        # 1. Full URI takes priority
        uri = os.getenv("DATABASE_URL", "")
        if uri:
            return uri

        # 2. Construct from parts
        host = os.getenv("DB_HOST", "db")
        port = os.getenv("DB_PORT", "5432")
        user = os.getenv("DB_USER", "postgres")
        password = os.getenv("DB_PASSWORD", "")
        name = os.getenv("DB_NAME", "bagithr")
        return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{name}"
