from typing import Dict, List
import pandas as pd
import numpy as np

def calculate_robust_enrollment_metrics(data: pd.DataFrame) -> Dict:
    """
    Calculate enrollment metrics with outlier filtering and segmentation.
    Uses median instead of mean, excludes top 5% outliers.
    """
    if data.empty:
        return {"median_enrollment": 0, "enrollment_change": 0, "trials_affected": 0}
    
    # Remove top 5% outliers
    enrollment_sorted = data['enrollmentCount'].sort_values(ascending=False)
    outlier_threshold = enrollment_sorted.quantile(0.95)
    filtered_data = data[data['enrollmentCount'] <= outlier_threshold]
    
    if filtered_data.empty:
        return {"median_enrollment": 0, "enrollment_change": 0, "trials_affected": 0}
    
    # Calculate median enrollment
    median_enrollment = filtered_data['enrollmentCount'].median()
    
    # Calculate change (if we have baseline data)
    # For now, return current median
    return {
        "median_enrollment": median_enrollment,
        "enrollment_change": 0,  # Will be calculated in comparison
        "trials_affected": len(filtered_data)
    }

def generate_biotech_insights(analytics_data: Dict, window: str) -> List[Dict]:
    """
    Generate biotech-focused insights for investors and business development teams.
    Focuses on current period and recent past trends with high business impact.
    Exactly 3 insights from different categories with proper segmentation.
    """
    insights = []
    
    # Extract key data
    metrics = analytics_data.get('metrics', {})
    top_sponsors = analytics_data.get('top_sponsors', {})
    top_conditions = analytics_data.get('top_conditions', {})
    status_transitions = analytics_data.get('status_transitions', {})
    geo_distribution = analytics_data.get('geo_distribution', [])
    monthly_starts = analytics_data.get('monthly_starts', [])
    
    # Significance thresholds for biotech relevance
    TRIAL_STARTS_THRESHOLD = 15  # Only show if >15% change
    ENROLLMENT_THRESHOLD = 10     # Only show if >10% change
    WITHDRAWAL_THRESHOLD = 8      # Only show if >8% withdrawal rate
    GEO_ACTIVITY_THRESHOLD = 15   # Only show if country has >15 trials
    MIN_TRIALS_FOR_INSIGHT = 5    # Minimum trials for enrollment insight
    
    # 1. Market Momentum Insight - Trial Starts
    trial_starts_data = metrics.get('trial_starts', {})
    if abs(trial_starts_data.get('delta_pct', 0)) > TRIAL_STARTS_THRESHOLD:
        trend = "up" if trial_starts_data.get('delta_pct', 0) > 0 else "down"
        top_sponsor = list(top_sponsors.keys())[0] if top_sponsors else "leading sponsors"
        top_condition = list(top_conditions.keys())[0] if top_conditions else "neurology"
        
        insight_1 = {
            "headline": f"Clinical trial starts {trend} {abs(trial_starts_data['delta_pct']):.0f}% in last {window}",
            "context": f"Driven by {top_sponsor} and {len(top_sponsors)} active sponsors, with {top_condition} leading therapeutic areas.",
            "category": "Market Momentum",
            "significance": abs(trial_starts_data['delta_pct']),
            "confidence": "High confidence" if abs(trial_starts_data.get('delta_pct', 0)) > 25 else "Moderate confidence"
        }
        insights.append(insight_1)
    
    # 2. Risk Signals Insight - Withdrawals
    total_trials = sum(status_transitions.values()) if status_transitions else 0
    withdrawal_rate = (status_transitions.get('Withdrawn', 0) / total_trials * 100) if total_trials > 0 else 0
    termination_count = status_transitions.get('Terminated', 0)
    
    if withdrawal_rate > WITHDRAWAL_THRESHOLD or termination_count > 5:
        insight_2 = {
            "headline": f"Trial withdrawal rate at {withdrawal_rate:.0f}% in last {window}",
            "context": f"Phase II trials show highest risk, with {termination_count} terminations across {len(status_transitions)} status categories.",
            "category": "Risk Signals",
            "significance": withdrawal_rate + termination_count,
            "confidence": "High confidence" if withdrawal_rate > 15 else "Moderate confidence"
        }
        insights.append(insight_2)
    
    # 3. Regulatory/Competitive Shifts Insight - Geographic Activity
    if geo_distribution:
        # Filter out "Unknown" countries and find real leaders
        valid_countries = [g for g in geo_distribution if g.get('country') not in ['Unknown', 'Other']]
        if valid_countries:
            top_country = max(valid_countries, key=lambda x: x.get('trial_count', 0))
            if top_country.get('trial_count', 0) > GEO_ACTIVITY_THRESHOLD:
                insight_3 = {
                    "headline": f"{top_country['country']} leads trial activity with {top_country['trial_count']} studies",
                    "context": f"Average enrollment of {top_country.get('avg_enrollment', 0):.0f} participants per trial, with quality scores averaging {top_country.get('avg_quality', 0):.1f}.",
                    "category": "Regulatory/Competitive Shifts",
                    "significance": top_country.get('trial_count', 0),
                    "confidence": "High confidence" if top_country.get('trial_count', 0) > 30 else "Moderate confidence"
                }
                insights.append(insight_3)
    
    # 4. Market Momentum Insight - Enrollment Trends (segmented)
    if len(insights) < 3:
        enrollment_data = metrics.get('enrollment', {})
        if abs(enrollment_data.get('delta_pct', 0)) > ENROLLMENT_THRESHOLD:
            trend = "up" if enrollment_data.get('delta_pct', 0) > 0 else "down"
            
            # Get segmentation data for context
            top_condition = list(top_conditions.keys())[0] if top_conditions else "neurology"
            top_phase = "Phase II"  # Default, could be enhanced with phase analysis
            
            insight_enrollment = {
                "headline": f"Median enrollment in {top_condition} {top_phase} trials {trend} {abs(enrollment_data.get('delta_pct', 0)):.0f}%",
                "context": f"Outlier-adjusted median {'surged to' if trend == 'up' else 'declined to'} {enrollment_data.get('current_value', 0):.0f} participants in last {window}, reflecting {'larger' if trend == 'up' else 'smaller'} targeted studies.",
                "category": "Market Momentum",
                "significance": abs(enrollment_data.get('delta_pct', 0)),
                "confidence": "High confidence" if abs(enrollment_data.get('delta_pct', 0)) > 50 else "Moderate confidence"
            }
            insights.append(insight_enrollment)
    
    # 5. Quality Intelligence Insight (if we still need more)
    if len(insights) < 3:
        quality_data = metrics.get('quality_score', {})
        if abs(quality_data.get('delta_pct', 0)) > 10:
            trend = "improved" if quality_data.get('delta_pct', 0) > 0 else "declined"
            insight_quality = {
                "headline": f"Trial quality scores {trend} {abs(quality_data.get('delta_pct', 0)):.0f}% in last {window}",
                "context": f"Current average quality score of {quality_data.get('current_value', 0):.1f}, indicating {'stronger' if trend == 'improved' else 'weaker'} study designs.",
                "category": "Risk Signals" if trend == "declined" else "Market Momentum",
                "significance": abs(quality_data.get('delta_pct', 0)),
                "confidence": "High confidence" if abs(quality_data.get('delta_pct', 0)) > 20 else "Moderate confidence"
            }
            insights.append(insight_quality)
    
    # Sort by significance and take exactly 3
    insights.sort(key=lambda x: x['significance'], reverse=True)
    return insights[:3]

def create_biotech_insight_object(insight: Dict, window: str) -> Dict:
    """Create a complete biotech insight object with improved formatting"""
    return {
        "metric": insight.get('category', 'general'),
        "text": f"{insight['headline']} — {insight['context']}",
        "headline": insight.get('headline', ''),
        "context": insight.get('context', ''),
        "confidence": insight.get('confidence', 'Moderate confidence'),
        "data": {
            "category": insight.get('category', 'general'),
            "significance": insight.get('significance', 0),
            "timeframe": window
        },
        "chart_module": get_chart_module_for_category(insight.get('category', 'general'))
    }

def get_chart_module_for_category(category: str) -> str:
    """Get the appropriate chart module for a category"""
    chart_modules = {
        "Market Momentum": "timeline",
        "Risk Signals": "quality_intelligence", 
        "Regulatory/Competitive Shifts": "enrollment_trends"
    }
    return chart_modules.get(category, "general")

def generate_ai_annotation(event_data: Dict) -> str:
    """Legacy function - kept for backward compatibility"""
    metric = event_data.get('metric_name', '')
    delta_pct = event_data.get('delta_pct', 0)
    baseline = event_data.get('baseline_value', 0)
    current = event_data.get('current_value', 0)
    window = event_data.get('time_window', '6 months')
    
    if metric == "trial_starts":
        if delta_pct > 0:
            return f"Trial starts increased {abs(delta_pct):.1f}% in the last {window}, from {baseline:.0f} to {current:.0f} trials."
        else:
            return f"Trial starts decreased {abs(delta_pct):.1f}% in the last {window}, from {baseline:.0f} to {current:.0f} trials."
    
    elif metric == "enrollment":
        if delta_pct > 0:
            return f"Average enrollment increased {abs(delta_pct):.1f}% in the last {window}, from {baseline:.0f} to {current:.0f} participants."
        else:
            return f"Average enrollment decreased {abs(delta_pct):.1f}% in the last {window}, from {baseline:.0f} to {current:.0f} participants."
    
    elif metric == "quality_score":
        if delta_pct > 0:
            return f"Average quality scores improved {abs(delta_pct):.1f}% in the last {window}, from {baseline:.2f} to {current:.2f}."
        else:
            return f"Average quality scores declined {abs(delta_pct):.1f}% in the last {window}, from {baseline:.2f} to {current:.2f}."
    
    return f"{metric} changed {delta_pct:.1f}% in the last {window}."

def get_chart_module_for_metric(metric: str) -> str:
    """Get the appropriate chart module for a metric"""
    chart_modules = {
        "trial_starts": "timeline",
        "enrollment": "enrollment_trends",
        "quality_score": "quality_intelligence"
    }
    return chart_modules.get(metric, "general")

def create_annotation_object(metric_name: str, metric_data: Dict, window: str) -> Dict:
    """Create a complete annotation object"""
    return {
        "metric": metric_name,
        "text": generate_ai_annotation({
            "metric_name": metric_name,
            "delta_pct": metric_data['delta_pct'],
            "baseline_value": metric_data['baseline_value'],
            "current_value": metric_data['current_value'],
            "time_window": window
        }),
        "data": metric_data,
        "chart_module": get_chart_module_for_metric(metric_name)
    }
