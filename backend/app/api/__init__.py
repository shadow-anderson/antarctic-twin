# app/api/__init__.py
from .stations import router as stations_router

__all__ = ["stations_router"]
