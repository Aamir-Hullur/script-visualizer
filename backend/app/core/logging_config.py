import logging
import sys
from pathlib import Path
from app.core.config import get_settings

def setup_logging():
    # Get application settings
    settings = get_settings()
    
    # Create logs directory if it doesn't exist
    log_dir = settings.LOGS_DIR
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Create absolute log file path
    log_file_path = log_dir / "app.log"
    print(f"Setting up logging to: {log_file_path.absolute()}")
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file_path),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Create logger
    logger = logging.getLogger("visualization-api")
    logger.info(f"Logging initialized. Log file: {log_file_path.absolute()}")
    return logger

logger = setup_logging()