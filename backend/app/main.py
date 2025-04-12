from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import get_settings
from app.core.docker_utils import DockerManager
from app.routes.visualization import router as visualization_router
from app.models.schemas import HealthCheckResponse
from app.core.logging_config import logger

settings = get_settings()
docker_manager = DockerManager()

app = FastAPI(
    title="Script Visualizer API",
    description="Generate visualizations from Python and R scripts",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint to verify system status"""
    try:
        storage_check = all(
            directory.exists() 
            for directory in [
                settings.SCRIPTS_DIR, 
                settings.OUTPUTS_DIR, 
                settings.LOGS_DIR
            ]
        )
        docker_status = await docker_manager.check_health()
        
        return {
            "status": "success" if all([docker_status, storage_check]) else "error",
            "version": "1.0.0",
            "services": {
                "docker": docker_status,
                "storage": storage_check,
                "api": True
            },
            "environment": settings.ENVIRONMENT
        }
    except Exception as e:
        return {
            "status": "success",
            "version": "1.0.0",
            "services": {
                "docker": False,
                "storage": False,
                "api": True
            },
            "environment": settings.ENVIRONMENT,
            "error": str(e)
        }

# Ensure output directory exists
settings.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# Log the directory being mounted for static file serving
logger.info(f"Mounting output directory for static file serving: {settings.OUTPUTS_DIR.absolute()}")

# Mount static files directory for visualization outputs using the correct absolute path
app.mount("/outputs", StaticFiles(directory=str(settings.OUTPUTS_DIR.absolute())), name="outputs")
app.include_router(visualization_router, prefix=settings.API_V1_STR, tags=["visualization"])