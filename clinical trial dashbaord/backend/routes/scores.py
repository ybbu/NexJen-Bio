from fastapi import APIRouter, HTTPException
from services.data_service import DataService

router = APIRouter(prefix="/scores", tags=["scores"])

# Initialize services
data_service = DataService()

@router.get("/")
async def get_scores():
    """Get success scores for interventional trials"""
    try:
        return {
            "scores": data_service.scores_data,
            "total_scores": len(data_service.scores_data),
            "average_score": sum(score.get('total_score', 0) for score in data_service.scores_data) / len(data_service.scores_data) if data_service.scores_data else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading scores: {str(e)}")

@router.get("/{nct_id}")
async def get_score_by_nct(nct_id: str):
    """Get quality score for a specific trial"""
    try:
        score = data_service.get_quality_score(nct_id)
        return {
            "nct_id": nct_id,
            "score": score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading score: {str(e)}")
