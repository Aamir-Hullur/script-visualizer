from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional

class Language(str, Enum):
    PYTHON = "python"
    R = "r"

class VisualizationRequest(BaseModel):
    code: str = Field(..., min_length=1, description="The code to generate visualization")
    language: Language = Field(..., description="Programming language of the code")
    visualization_type: Optional[str] = Field(
        default="static",
        description="Type of visualization (static/interactive/3d)"
    )

class VisualizationResponse(BaseModel):
    status: str
    output_url: Optional[str] = None
    logs: Optional[str] = None
    error: Optional[str] = None

class HealthCheckResponse(BaseModel):
    status: str
    version: str
    services: dict
    environment: str
    error: Optional[str] = None