from fastapi import APIRouter, HTTPException
from app.models.schemas import VisualizationRequest, VisualizationResponse
from app.services.visualization import VisualizationService
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()
visualization_service = VisualizationService()

@router.post("/generate-visualization", response_model=VisualizationResponse)
async def generate_visualization(request: VisualizationRequest):
    try:
        # Validate language
        if request.language not in ["python", "r"]:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language: {request.language}"
            )

        success, logs = await visualization_service.generate_visualization(request)


        if not success:
            return VisualizationResponse(
                status="error",
                error="Visualization generation failed",
                logs=logs
            )

        return VisualizationResponse(
            status="success",
            output_url=f"/outputs/{visualization_service.get_output_filename()}",
            logs=logs
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported programming languages"""
    return {
        "languages": [
            {
                "id": "python",
                "name": "Python",
                "version": "3.11",
                "libraries": ["matplotlib", "plotly"]
            },
            {
                "id": "r",
                "name": "R",
                "version": "4.x",
                "libraries": ["ggplot2"]
            }
        ]
    }