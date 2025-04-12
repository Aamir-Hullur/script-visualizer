import logging
import sys
from pathlib import Path
from app.core.config import get_settings

settings = get_settings()

def setup_logging():
    # Create logs directory if it doesn't exist
    settings.LOGS_DIR.mkdir(exist_ok=True)
    
    # Configure logging
    log_file = settings.LOGS_DIR / "app.log"
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL),
        format=settings.LOG_FORMAT,
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Create and configure application logger
    logger = logging.getLogger("visualization-api")
    logger.setLevel(getattr(logging, settings.LOG_LEVEL))
    
    return logger

# Initialize logger
logger = setup_logging()
logger.info("Logging configured successfully")
