from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timedelta
from models.schemas import TrialQuery, SummaryRequest
from services.data_service import DataService
from utils.data_processing import extract_summary
import pandas as pd

router = APIRouter(prefix="/trials", tags=["trials"])

# Initialize services
data_service = DataService()

@router.post("/")
async def get_trials(query: TrialQuery):
    """Get filtered trials with metrics"""
    print("=" * 50)
    print("TRIALS ENDPOINT CALLED")
    print(f"DEBUG: Received request with study_type: {query.study_type}")
    print("=" * 50)
    try:
        # Choose the appropriate dataset based on study type
        if query.study_type == 'INTERVENTIONAL' and data_service.optimized_interventional_df is not None:
            # Use optimized interventional dataset for better performance
            print("Using optimized interventional dataset")
            filtered_df = data_service.optimized_interventional_df.copy()
            quality_scores_cache = data_service.optimized_quality_scores_cache
        else:
            # Use full dataset for observational, combined, or when optimized data not available
            print("Using full dataset")
            filtered_df = data_service.df.copy()
            quality_scores_cache = data_service.quality_scores_cache
        
        # Add some basic metrics without heavy computation
        print(f"Processing query: {query.study_type} trials")
        
        # Filter by condition - only if condition is provided and not empty
        if query.condition and query.condition.strip():
            filtered_df = filtered_df[filtered_df['conditions'].fillna('').str.contains(query.condition, case=False, na=False)]
        
        # Filter by phase
        if query.phase:
            filtered_df = filtered_df[filtered_df['phases'].fillna('').str.contains(query.phase, case=False, na=False)]
        
        # Filter by intervention
        if query.intervention:
            filtered_df = filtered_df[filtered_df['interventions'].fillna('').str.contains(query.intervention, case=False, na=False)]
        
        # Filter by study type
        if query.study_type:
            if query.study_type == 'BOTH':
                # Include both interventional and observational studies
                filtered_df = filtered_df[
                    (filtered_df['studyType'] == 'INTERVENTIONAL') | 
                    (filtered_df['studyType'] == 'OBSERVATIONAL')
                ]
            elif query.study_type == 'INTERVENTIONAL':
                # For interventional, we already have the optimized dataset
                # No additional filtering needed since we're using the optimized interventional dataset
                pass
            else:
                # For OBSERVATIONAL, filter the full dataset
                filtered_df = filtered_df[filtered_df['studyType'] == query.study_type]
        
        # Filter by date range
        if query.date_range and len(query.date_range) == 2:
            start_date = pd.to_datetime(query.date_range[0])
            end_date = pd.to_datetime(query.date_range[1])
            filtered_df = filtered_df[
                (pd.to_datetime(filtered_df['startDate'], errors='coerce') >= start_date) &
                (pd.to_datetime(filtered_df['startDate'], errors='coerce') <= end_date)
            ]
        
        # Calculate metrics (handle NaN values) - use ALL filtered data for metrics
        enrollment_counts = filtered_df['enrollmentCount'].fillna(0)
        completion_status = filtered_df['overallStatus'].fillna('UNKNOWN')
        
        # Calculate active trials (recruiting status)
        active_trials = len(filtered_df[filtered_df['overallStatus'].fillna('').str.contains('RECRUITING', case=False, na=False)])
        
        # Calculate recent trials (started within last 30 days)
        now = datetime.now()
        recent_cutoff = now - timedelta(days=30)
        recent_trials = len(filtered_df[
            pd.to_datetime(filtered_df['startDate'], errors='coerce') >= recent_cutoff
        ])
        
        # Calculate average score for interventional trials only (separate from metrics)
        avg_score = 'N/A'
        if query.study_type == 'INTERVENTIONAL':
            interventional_trials = filtered_df[filtered_df['studyType'] == 'INTERVENTIONAL'] if 'studyType' in filtered_df.columns else filtered_df
            if len(interventional_trials) > 0:
                available_scores = []
                for _, trial in interventional_trials.iterrows():
                    nct_id = str(trial['nctId']).strip()
                    if nct_id in quality_scores_cache:
                        score = quality_scores_cache[nct_id].get('total_score', 0)
                        available_scores.append(score)
                
                if available_scores:
                    avg_score = round(sum(available_scores) / len(available_scores), 2)
        
        # Calculate metrics from ALL filtered trials (not limited by quality scores)
        metrics = {
            "trial_count": len(filtered_df),  # Total count of ALL filtered trials
            "total_enrollment": int(enrollment_counts.sum()),
            "avg_enrollment": float(enrollment_counts.mean()) if len(enrollment_counts) > 0 else 0.0,
            "completion_rate": float(len(completion_status[completion_status == 'COMPLETED']) / len(completion_status) * 100) if len(completion_status) > 0 else 0.0,
            "active_trials": active_trials,
            "recent_trials": recent_trials,
            "avg_score": avg_score,  # Only calculated from trials with quality scores
            "phase_breakdown": filtered_df['phases'].fillna('N/A').value_counts().to_dict(),
            "sponsor_breakdown": filtered_df['leadSponsor'].fillna('Unknown').value_counts().head(10).to_dict(),
            "geographic_spread": filtered_df['locations'].fillna('Unknown').value_counts().head(10).to_dict()
        }
        
        # Sort by start date and get the 15 most recent trials
        display_trials = filtered_df.sort_values('startDate', ascending=False).head(15)
        trials_data = []
        
        for _, trial in display_trials.iterrows():
            nct_id = trial['nctId']
            
            # Simple summary (handle NaN)
            summary = str(trial.get('briefSummary', ''))
            if pd.isna(summary) or summary == 'nan':
                summary = "No summary available"
            else:
                summary = summary[:200] + "..." if len(summary) > 200 else summary
            
            # Get quality score from the appropriate cache
            if nct_id in quality_scores_cache:
                quality_score = quality_scores_cache[nct_id]
            else:
                quality_score = data_service.get_quality_score(nct_id)
            
            # Handle NaN values in trial data
            trial_data = {
                "nctId": nct_id,
                "briefTitle": str(trial.get('briefTitle', ''))[:100] + "..." if len(str(trial.get('briefTitle', ''))) > 100 else str(trial.get('briefTitle', '')),
                "phase": str(trial.get('phases', 'N/A')),
                "enrollmentCount": int(trial.get('enrollmentCount', 0)) if pd.notna(trial.get('enrollmentCount')) else 0,
                "studyType": str(trial.get('studyType', '')),
                "overallStatus": str(trial.get('overallStatus', '')),
                "startDate": str(trial.get('startDate', '')) if pd.notna(trial.get('startDate')) else '',
                "completionDate": str(trial.get('completionDate', '')) if pd.notna(trial.get('completionDate')) else '',
                "locations": str(trial.get('locations', '')),
                "leadSponsor": str(trial.get('leadSponsor', '')),
                "interventions": str(trial.get('interventions', '')),
                "qualityScore": quality_score,
                "summary": summary
            }
            trials_data.append(trial_data)
        
        return {
            "trials": trials_data,
            "metrics": metrics,
            "total_trials": len(filtered_df)
        }
        
    except Exception as e:
        print(f"Error in trials endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@router.post("/summary")
async def get_trial_summaries(request: SummaryRequest):
    """Get summaries for specific trials"""
    try:
        summaries = []
        for nct_id in request.nct_ids:
            trial = data_service.get_trial_by_nct_id(nct_id)
            if trial:
                summary = extract_summary(trial.get('briefSummary', ''))
                summaries.append({
                    "nctId": nct_id,
                    "summary": summary
                })
        
        return {"summaries": summaries}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting summaries: {str(e)}")
