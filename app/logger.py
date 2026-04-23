import logging
import os

# Create logs folder if not exists
os.makedirs("logs", exist_ok=True)

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/app.log"),  # Save to file
        logging.StreamHandler()               # Show in terminal
    ]
)

logger = logging.getLogger(__name__)