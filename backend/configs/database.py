import os
from dotenv import load_dotenv

load_dotenv(override=False)  # Docker env vars take precedence


class DatabaseConfig:
    @classmethod
    def get_database_url(cls) -> str:
        uri = os.getenv("DATABASE_URL", "")
        if uri:
            return uri

        # fallback: construct from separate vars
        host = os.getenv("DB_HOST", "127.0.0.1")
        port = os.getenv("DB_PORT", "3306")
        user = os.getenv("DB_USER", "root")
        password = os.getenv("DB_PASSWORD", "")
        name = os.getenv("DB_NAME", "bagithr")
        return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"
