import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List
from datetime import datetime, timedelta

def calculate_change_metrics(current_data: pd.DataFrame, baseline_data: pd.DataFrame, metric: str, quality_scores_cache: Dict = None) -> Dict:
    """
    Calculate change metrics between current and baseline periods.
    Updated to use median enrollment with outlier filtering.
    """
    try:
        if metric == "total_trials":
            # Total trials is the count of all trials in the current period (stock metric)
            current_value = len(current_data)
            baseline_value = len(baseline_data)
        elif metric == "trial_starts":
            # Trial starts is the count of trials that started in the current period (flow metric)
            # This should be the same as current_data since we're already filtering by start date
            current_value = len(current_data)
            baseline_value = len(baseline_data)
        elif metric == "enrollment":
            # Use median enrollment with outlier filtering
            current_value = calculate_robust_enrollment_median(current_data)
            baseline_value = calculate_robust_enrollment_median(baseline_data)
        elif metric == "quality_score":
            if quality_scores_cache:
                current_value = calculate_quality_score(current_data, quality_scores_cache)
                baseline_value = calculate_quality_score(baseline_data, quality_scores_cache)
            else:
                current_value = 0
                baseline_value = 0
        else:
            current_value = 0
            baseline_value = 0

        # Calculate percentage change
        if baseline_value > 0:
            delta_pct = ((current_value - baseline_value) / baseline_value) * 100
        else:
            delta_pct = 0 if current_value == 0 else 100

        # Calculate p-value for statistical significance
        try:
            p_value = 1.0  # Initialize p_value
            if metric == "trial_starts" or metric == "total_trials":
                # Poisson test for count data
                if baseline_value > 0 and current_value > 0:
                    p_value = stats.poisson.cdf(current_value, baseline_value)
                else:
                    p_value = 1.0
            elif metric == "enrollment":
                # T-test for continuous data (enrollment)
                if len(current_data) > 0 and len(baseline_data) > 0:
                    current_enrollments = current_data['enrollmentCount'].dropna()
                    baseline_enrollments = baseline_data['enrollmentCount'].dropna()
                    if len(current_enrollments) > 0 and len(baseline_enrollments) > 0:
                        # Apply outlier filtering
                        current_filtered = filter_enrollment_outliers(current_enrollments)
                        baseline_filtered = filter_enrollment_outliers(baseline_enrollments)
                        if len(current_filtered) > 0 and len(baseline_filtered) > 0:
                            t_stat, p_value = stats.ttest_ind(current_filtered, baseline_filtered)
                        else:
                            p_value = 1.0
                    else:
                        p_value = 1.0
                else:
                    p_value = 1.0
            else:
                p_value = 1.0
        except:
            p_value = 1.0

        # Calculate confidence based on p-value
        confidence = "High confidence" if p_value < 0.05 else "Moderate confidence"

        return {
            "current_value": current_value,
            "baseline_value": baseline_value,
            "delta_pct": delta_pct,
            "p_value": p_value,
            "confidence": confidence
        }
    except Exception as e:
        print(f"Error calculating {metric} metrics: {e}")
        return {
            "current_value": 0,
            "baseline_value": 0,
            "delta_pct": 0,
            "p_value": 1.0,
            "confidence": "Moderate confidence"
        }

def calculate_quality_score(data: pd.DataFrame, quality_scores_cache: Dict) -> float:
    """
    Calculate average quality score for the given data using the quality scores cache.
    """
    if data.empty:
        return 0
    
    # First try to get scores from the quality_scores_cache
    if quality_scores_cache:
        scores = []
        for _, row in data.iterrows():
            nct_id = str(row['nctId'])
            if nct_id in quality_scores_cache:
                score = quality_scores_cache[nct_id].get('total_score', 0)
                if score > 0:  # Only include valid scores
                    scores.append(score)
        
        if scores:
            return sum(scores) / len(scores)
    
    # Fallback: try to get scores directly from the dataframe columns
    if 'total_quality_score' in data.columns:
        valid_scores = data['total_quality_score'].dropna()
        if len(valid_scores) > 0:
            return valid_scores.mean()
    
    if 'quality_score' in data.columns:
        valid_scores = data['quality_score'].dropna()
        if len(valid_scores) > 0:
            return valid_scores.mean()
    
    return 0

def calculate_robust_enrollment_median(data: pd.DataFrame) -> float:
    """
    Calculate median enrollment excluding top 5% outliers.
    """
    if data.empty or 'enrollmentCount' not in data.columns:
        return 0
    
    # Filter out NaN values
    enrollments = data['enrollmentCount'].dropna()
    if len(enrollments) == 0:
        return 0
    
    # Remove top 5% outliers
    outlier_threshold = enrollments.quantile(0.95)
    filtered_enrollments = enrollments[enrollments <= outlier_threshold]
    
    if len(filtered_enrollments) == 0:
        return 0
    
    return filtered_enrollments.median()

def filter_enrollment_outliers(enrollments: pd.Series) -> pd.Series:
    """
    Filter out top 5% enrollment outliers.
    """
    if len(enrollments) == 0:
        return enrollments
    
    outlier_threshold = enrollments.quantile(0.95)
    return enrollments[enrollments <= outlier_threshold]

def get_enrollment_segmentation(data: pd.DataFrame) -> Dict:
    """
    Get enrollment metrics segmented by phase and therapeutic area.
    """
    if data.empty:
        return {}
    
    segments = {}
    
    # Segment by phase
    for phase in ['Phase I', 'Phase II', 'Phase III', 'Phase IV']:
        phase_data = data[data['phase'].str.contains(phase, case=False, na=False)]
        if len(phase_data) > 0:
            segments[f'{phase}_enrollment'] = calculate_robust_enrollment_median(phase_data)
            segments[f'{phase}_trials'] = len(phase_data)
    
    # Segment by therapeutic area (using condition)
    top_conditions = data['condition'].value_counts().head(5)
    for condition, count in top_conditions.items():
        if count >= 5:  # Only include if ≥5 trials
            condition_data = data[data['condition'] == condition]
            segments[f'{condition}_enrollment'] = calculate_robust_enrollment_median(condition_data)
            segments[f'{condition}_trials'] = len(condition_data)
    
    return segments

def get_time_window_days(window: str) -> int:
    """Get number of days for a given time window"""
    window_days = {
        "6m": 180,
        "1y": 365,
        "2y": 730,
        "5y": 1825
    }
    return window_days.get(window, 180)

def split_data_by_period(df: pd.DataFrame, window: str) -> tuple:
    """Split data into current and baseline periods"""
    # Filter out rows with invalid dates and convert to datetime
    df_copy = df.copy()
    
    # Convert startDate to datetime if it's not already
    if 'startDate' in df_copy.columns:
        df_copy['startDate'] = pd.to_datetime(df_copy['startDate'], errors='coerce')
    
    # Convert completionDate to datetime if it's not already
    if 'completionDate' in df_copy.columns:
        df_copy['completionDate'] = pd.to_datetime(df_copy['completionDate'], errors='coerce')
    
    valid_dates_df = df_copy[df_copy['startDate'].notna()]
    
    if len(valid_dates_df) == 0:
        # If no valid dates, use all data
        return df, df, datetime.now(), datetime.now()
    
    # Calculate time windows based on available data
    window_days_count = get_time_window_days(window)
    
    # Use current date as reference point
    current_date = datetime.now()
    
    # Current period: from 6 months ago to now (including future studies)
    current_start = current_date - timedelta(days=window_days_count)
    
    # Baseline period: from 12 months ago to 6 months ago
    baseline_start = current_start - timedelta(days=window_days_count)
    
    # Split data into current and baseline periods for trial starts (flow metric)
    current_trial_starts = valid_dates_df[
        (valid_dates_df['startDate'] >= current_start)
    ]
    
    baseline_trial_starts = valid_dates_df[
        (valid_dates_df['startDate'] >= baseline_start) & 
        (valid_dates_df['startDate'] < current_start)
    ]
    
    # For total trials (stock metric), include all trials that are active in the current period
    # This means trials that started before the current period but are still ongoing
    # For simplicity, we'll use the same data but this could be enhanced to check completion dates
    current_total_trials = valid_dates_df[
        (valid_dates_df['startDate'] >= current_start) | 
        ((valid_dates_df['startDate'] < current_start) & 
         ((valid_dates_df['completionDate'].isna()) | 
          (valid_dates_df['completionDate'] >= current_start)))
    ]
    
    baseline_total_trials = valid_dates_df[
        (valid_dates_df['startDate'] >= baseline_start) | 
        ((valid_dates_df['startDate'] < baseline_start) & 
         ((valid_dates_df['completionDate'].isna()) | 
          (valid_dates_df['completionDate'] >= baseline_start)))
    ]
    
    return current_trial_starts, baseline_trial_starts, current_start, baseline_start
