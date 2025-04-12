from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path
from functools import lru_cache

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Script Visualizer API"
    ENVIRONMENT: str = "development"

    # Logging (from .env)
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Docker Configuration
    DOCKER_CONTAINER_TIMEOUT: int = 300
    DOCKER_MEMORY_LIMIT: str = "512m"
    DOCKER_CPU_LIMIT: float = 0.5
    DOCKER_TIMEOUT: int = 30
    DOCKER_NETWORK_ACCESS: bool = False

    # Script Configuration
    MAX_CODE_LENGTH: int = 50000
    SUPPORTED_LANGUAGES: List[str] = ["python", "r"]

    # Security
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]

    # Storage Configuration
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    print(f"Base Directory: {BASE_DIR}")
    
    # Ensure all directories are under app/ as per project guidelines
    SCRIPTS_DIR: Path = BASE_DIR / "scripts"
    OUTPUTS_DIR: Path = BASE_DIR / "outputs"
    LOGS_DIR: Path = BASE_DIR / "logs"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def initialize(self):
        """Create required directories"""
        for directory in [self.SCRIPTS_DIR, self.OUTPUTS_DIR, self.LOGS_DIR]:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"Ensuring directory exists: {directory}")


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    settings.initialize()
    return settings
