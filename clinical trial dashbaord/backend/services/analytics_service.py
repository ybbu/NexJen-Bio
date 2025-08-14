import pandas as pd
import numpy as np
from typing import Dict, List
from datetime import datetime, timedelta
from utils.statistics import calculate_change_metrics, split_data_by_period, get_time_window_days
from utils.ai_annotations import create_annotation_object
from models.schemas import AnalyticsFilters

class AnalyticsService:
    """Service for handling analytics calculations and data aggregation"""
    
    def __init__(self, data_service):
        self.data_service = data_service
    
    def clean_conditions(self, conditions_series: pd.Series) -> pd.Series:
        """Clean and consolidate condition names, especially Parkinson variations"""
        def clean_condition(condition):
            if pd.isna(condition):
                return condition
            
            condition_str = str(condition).lower()
            
            # Consolidate Parkinson variations
            if 'parkinson' in condition_str:
                if 'parkinson\'s disease' in condition_str or 'parkinson disease' in condition_str:
                    return 'Parkinson Disease'
                elif 'parkinson disease, idiopathic' in condition_str:
                    return 'Parkinson Disease'
                else:
                    return 'Parkinson Disease'
            
            return condition
        
        return conditions_series.apply(clean_condition)
    
    def clean_sponsors(self, sponsors_series: pd.Series) -> pd.Series:
        """Clean sponsor names by removing common prefixes and suffixes"""
        def clean_sponsor(sponsor):
            if pd.isna(sponsor):
                return sponsor
            
            sponsor_str = str(sponsor).strip()
            
            # Remove common suffixes
            suffixes_to_remove = [
                ' Limited', ' Ltd', ' Inc', ' Corporation', ' Corp', 
                ' Company', ' Co', ' LLC', ' L.L.C.', ' LLP', ' L.P.',
                ' University', ' Univ', ' Medical Center', ' Medical Centre',
                ' Hospital', ' Foundation', ' Institute', ' Institutes'
            ]
            
            for suffix in suffixes_to_remove:
                if sponsor_str.endswith(suffix):
                    sponsor_str = sponsor_str[:-len(suffix)].strip()
            
            return sponsor_str
        
        return sponsors_series.apply(clean_sponsor)
    
    def filter_data_by_cohort(self, filters: AnalyticsFilters) -> pd.DataFrame:
        """Filter data based on analytics filters"""
        # Use optimized interventional data if available, otherwise fall back to full dataset
        if hasattr(self.data_service, 'optimized_interventional_df') and self.data_service.optimized_interventional_df is not None:
            filtered_df = self.data_service.optimized_interventional_df.copy()
        else:
            filtered_df = self.data_service.df.copy()
        
        # Convert date columns to datetime
        if 'startDate' in filtered_df.columns:
            filtered_df['startDate'] = pd.to_datetime(filtered_df['startDate'], errors='coerce')
        if 'completionDate' in filtered_df.columns:
            filtered_df['completionDate'] = pd.to_datetime(filtered_df['completionDate'], errors='coerce')
        
        # Filter by phases
        if filters.phases:
            filtered_df = filtered_df[filtered_df['phases'].isin(filters.phases)]
        
        # Filter by statuses
        if filters.statuses:
            filtered_df = filtered_df[filtered_df['overallStatus'].isin(filters.statuses)]
        
        # Filter by countries
        if filters.countries:
            filtered_df = filtered_df[filtered_df['country'].isin(filters.countries)]
        
        # Filter by therapeutic areas/conditions
        if filters.therapeutic_areas:
            condition_mask = filtered_df['conditions'].fillna('').str.contains('|'.join(filters.therapeutic_areas), case=False, na=False)
            filtered_df = filtered_df[condition_mask]
        
        # Filter by date range
        if filters.date_range and len(filters.date_range) == 2:
            start_date = pd.to_datetime(filters.date_range[0])
            end_date = pd.to_datetime(filters.date_range[1])
            filtered_df = filtered_df[
                (filtered_df['startDate'] >= start_date) &
                (filtered_df['startDate'] <= end_date)
            ]
        
        return filtered_df
    
    def aggregate_analytics_data(self, filters: AnalyticsFilters) -> Dict:
        """Aggregate analytics data based on filters"""
        # Filter data
        filtered_df = self.filter_data_by_cohort(filters)
        print(f"Filtered data: {len(filtered_df)} rows")
        
        # Split data into current and baseline periods
        current_data, baseline_data, current_start, baseline_start = split_data_by_period(filtered_df, filters.window)
        print(f"Current data: {len(current_data)} rows, Baseline data: {len(baseline_data)} rows")
        
        # Calculate metrics
        metrics = {}
        
        # Total trials: count of trials in the past 5 years (consistent baseline metric)
        # This will be the same regardless of the selected time window
        current_date = datetime.now()
        five_years_ago = current_date - timedelta(days=5*365)  # 5 years ago
        ten_years_ago = current_date - timedelta(days=10*365)  # 10 years ago (baseline)
        
        # Filter to only include trials with valid start dates
        valid_dates_df = filtered_df[filtered_df['startDate'].notna()].copy()
        
        # Current period: trials in the past 5 years (simplified logic)
        current_total_trials = valid_dates_df[valid_dates_df['startDate'] >= five_years_ago]
        
        # Baseline period: trials from 10 years ago to 5 years ago (simplified logic)
        baseline_total_trials = valid_dates_df[
            (valid_dates_df['startDate'] >= ten_years_ago) & 
            (valid_dates_df['startDate'] < five_years_ago)
        ]
        
        total_trials_metric = {
            "current_value": len(current_total_trials),
            "baseline_value": len(baseline_total_trials),
            "delta_pct": ((len(current_total_trials) - len(baseline_total_trials)) / len(baseline_total_trials) * 100) if len(baseline_total_trials) > 0 else 0,
            "p_value": 1.0,
            "confidence": "Moderate confidence"
        }
        metrics["total_trials"] = total_trials_metric
        
        # Trial starts: count of trials that started in current period (flow metric)
        trial_starts_metric = calculate_change_metrics(
            current_data, 
            baseline_data, 
            "trial_starts", 
            self.data_service.optimized_quality_scores_cache
        )
        metrics["trial_starts"] = trial_starts_metric
        
        # Enrollment and quality score metrics
        for metric in ["enrollment", "quality_score"]:
            metrics[metric] = calculate_change_metrics(
                current_data, 
                baseline_data, 
                metric, 
                self.data_service.optimized_quality_scores_cache
            )
        
        # Debug quality scores
        print(f"Quality scores cache size: {len(self.data_service.optimized_quality_scores_cache)}")
        print(f"Filtered data size: {len(filtered_df)}")
        print(f"Valid dates in filtered data: {filtered_df['startDate'].notna().sum()}")
        print(f"Total trials (past 5 years): {len(current_total_trials)}")
        print(f"Baseline trials (5-10 years ago): {len(baseline_total_trials)}")
        print(f"Current data size: {len(current_data)}")
        print(f"Five years ago date: {five_years_ago}")
        print(f"Ten years ago date: {ten_years_ago}")
        if len(current_data) > 0:
            sample_nct = current_data.iloc[0]['nctId']
            print(f"Sample NCT ID: {sample_nct}")
            print(f"Quality score for sample: {self.data_service.optimized_quality_scores_cache.get(str(sample_nct), 'Not found')}")
            if 'total_quality_score' in current_data.columns:
                print(f"Direct quality score from CSV: {current_data.iloc[0]['total_quality_score']}")
        
        # Monthly trial starts with enrollment data
        monthly_data = current_data.groupby(
            current_data['startDate'].dt.to_period('M')
        ).agg({
            'nctId': 'count',
            'enrollmentCount': ['mean', 'sum']
        }).reset_index()
        monthly_data.columns = ['startDate', 'count', 'avg_enrollment', 'total_enrollment']
        
        # Format months as DD/MM
        monthly_data['month'] = monthly_data['startDate'].dt.strftime('%y/%m')
        
        # Add late-stage trial count (Phase II/III)
        late_stage_data = current_data[current_data['phases'].str.contains('PHASE2|PHASE3|Phase 2|Phase 3', case=False, na=False)]
        late_stage_monthly = late_stage_data.groupby(
            late_stage_data['startDate'].dt.to_period('M')
        ).size().reset_index(name='late_stage_count')
        late_stage_monthly['month'] = late_stage_monthly['startDate'].dt.strftime('%y/%m')
        
        # Merge late-stage data with monthly data
        monthly_starts = monthly_data.merge(
            late_stage_monthly[['month', 'late_stage_count']], 
            on='month', 
            how='left'
        ).fillna(0)
        
        monthly_starts = monthly_starts[['month', 'count', 'avg_enrollment', 'total_enrollment', 'late_stage_count']]
        
        # Status transitions
        status_transitions = current_data.groupby('overallStatus').size().to_dict()
        
        # Geographic distribution - handle missing quality score column
        geo_distribution = current_data.groupby('country').agg({
            'nctId': 'count',
            'enrollmentCount': 'mean'
        }).reset_index()
        geo_distribution.columns = ['country', 'trial_count', 'avg_enrollment']
        
        # Add quality score if column exists
        if 'total_quality_score' in current_data.columns:
            geo_distribution['avg_quality'] = current_data.groupby('country')['total_quality_score'].mean().values
        else:
            geo_distribution['avg_quality'] = 0
        
        # Phase distribution
        phase_timeline = current_data.groupby('phases').size().reset_index(name='count')
        phase_timeline = phase_timeline[phase_timeline['phases'].notna()]
        
        # Clean conditions and sponsors
        current_data = current_data.copy()
        current_data['conditions_cleaned'] = self.clean_conditions(current_data['conditions'])
        current_data['sponsors_cleaned'] = self.clean_sponsors(current_data['leadSponsor'])
        
        # Top conditions, sponsors, and treatments
        top_conditions = current_data['conditions_cleaned'].value_counts().head(10).to_dict()
        top_sponsors = current_data['sponsors_cleaned'].value_counts().head(10).to_dict()
        top_treatments = current_data['interventions'].value_counts().head(10).to_dict()
        top_treatment_categories = self.group_treatments_by_category(top_treatments)
        
        return {
            "metrics": metrics,
            "monthly_starts": monthly_starts.to_dict('records'),
            "status_transitions": status_transitions,
            "geo_distribution": geo_distribution.to_dict('records'),
            "phase_timeline": phase_timeline.to_dict('records'),
            "top_conditions": top_conditions,
            "top_sponsors": top_sponsors,
            "top_treatments": top_treatments,
            "top_treatment_categories": top_treatment_categories,
            "current_period": {
                "start": current_start.isoformat(),
                "end": datetime.now().isoformat()
            },
            "baseline_period": {
                "start": baseline_start.isoformat(),
                "end": current_start.isoformat()
            }
        }
    
    def generate_annotations(self, filters: AnalyticsFilters, limit: int = 5) -> List[Dict]:
        """Generate AI annotations for analytics insights"""
        # Get aggregated data
        analytics_data = self.aggregate_analytics_data(filters)
        
        # Generate biotech-focused insights
        from utils.ai_annotations import generate_biotech_insights, create_biotech_insight_object
        
        insights = generate_biotech_insights(analytics_data, filters.window)
        annotations = []
        
        for insight in insights:
            annotation = create_biotech_insight_object(insight, filters.window)
            annotations.append(annotation)
        
        return annotations[:limit]

    def categorize_treatment(self, treatment: str) -> str:
        """Categorize treatment into meaningful groups"""
        treatment_lower = treatment.lower()
        
        # Device/Technology categories
        if any(word in treatment_lower for word in ['electrode', 'brain', 'pet', 'mri', 'ct', 'imaging', 'detection']):
            return 'Device/Technology'
        elif any(word in treatment_lower for word in ['shoe', 'cane', 'assistive']):
            return 'Assistive Devices'
        
        # Therapy categories
        elif any(word in treatment_lower for word in ['physiotherapy', 'rehabilitation', 'stretching', 'exercise']):
            return 'Physical Therapy'
        elif any(word in treatment_lower for word in ['tDCS', 'stimulation', 'neurostimulation']):
            return 'Neuromodulation'
        
        # Pharmaceutical categories
        elif any(word in treatment_lower for word in ['ly03017', 'hydroxychloroquine', 'hcq', 'drug', 'medication', 'pill']):
            return 'Pharmaceutical'
        
        # Lifestyle/Diet categories
        elif any(word in treatment_lower for word in ['diet', 'plant-based', 'nutrition', 'lifestyle']):
            return 'Lifestyle/Diet'
        
        # Placebo/Control categories
        elif any(word in treatment_lower for word in ['sham', 'placebo', 'control']):
            return 'Control/Placebo'
        
        # Default category
        else:
            return 'Other'
    
    def group_treatments_by_category(self, treatments_dict: dict) -> dict:
        """Group treatments by category and sum their counts"""
        categories = {}
        
        for treatment, count in treatments_dict.items():
            category = self.categorize_treatment(treatment)
            if category not in categories:
                categories[category] = 0
            categories[category] += count
        
        return categories
