from fastapi import APIRouter, HTTPException, Query
from typing import List
from models.schemas import AnalyticsFilters, AnnotationsResponse
from services.analytics_service import AnalyticsService
from services.data_service import DataService

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Initialize services
data_service = DataService()
analytics_service = AnalyticsService(data_service)

@router.get("")
async def get_analytics_data(
    window: str = Query(default="6m"),
    therapeutic_areas: str = Query(default=""),
    phases: str = Query(default=""),
    statuses: str = Query(default="")
):
    """Get analytics data via GET request"""
    try:
        # Convert query parameters to filters
        filters = AnalyticsFilters(
            window=window,
            therapeutic_areas=therapeutic_areas.split(",") if therapeutic_areas else [],
            phases=phases.split(",") if phases else [],
            statuses=statuses.split(",") if statuses else []
        )
        
        return analytics_service.aggregate_analytics_data(filters)
    except Exception as e:
        print(f"Error in analytics GET: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing analytics: {str(e)}")

@router.get("/annotations")
async def get_analytics_annotations_get(
    window: str = Query(default="6m"),
    therapeutic_areas: str = Query(default=""),
    phases: str = Query(default=""),
    statuses: str = Query(default=""),
    limit: int = Query(default=5)
):
    """Get AI-generated annotations via GET request"""
    try:
        # Convert query parameters to filters
        filters = AnalyticsFilters(
            window=window,
            therapeutic_areas=therapeutic_areas.split(",") if therapeutic_areas else [],
            phases=phases.split(",") if phases else [],
            statuses=statuses.split(",") if statuses else []
        )
        
        annotations = analytics_service.generate_annotations(filters, limit)
        
        return {
            "annotations": annotations,
            "total_insights": len(annotations)
        }
        
    except Exception as e:
        print(f"Error in analytics annotations GET: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating annotations: {str(e)}")

@router.post("/aggregates")
async def get_analytics_aggregates(filters: AnalyticsFilters):
    """Get aggregated analytics data"""
    try:
        return analytics_service.aggregate_analytics_data(filters)
    except Exception as e:
        print(f"Error in analytics aggregates: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing analytics: {str(e)}")

@router.post("/annotations")
async def get_analytics_annotations(filters: AnalyticsFilters, limit: int = Query(default=5)):
    """Get AI-generated annotations for analytics insights"""
    try:
        annotations = analytics_service.generate_annotations(filters, limit)
        
        return {
            "annotations": annotations,
            "total_insights": len(annotations)
        }
        
    except Exception as e:
        print(f"Error in analytics annotations: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating annotations: {str(e)}")
