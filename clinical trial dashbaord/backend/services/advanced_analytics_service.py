import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from services.external_data_service import ExternalDataService
import json

class AdvancedAnalyticsService:
    """Advanced analytics service for comprehensive insights analysis"""
    
    def __init__(self):
        self.external_data_service = ExternalDataService()
    
    def calculate_comprehensive_whitespace_scores(self, df: pd.DataFrame) -> List[Dict]:
        """Calculate comprehensive whitespace scores using real burden and population data"""
        try:
            # Group by condition and country
            activity_data = df.groupby(['conditions', 'country']).agg({
                'nctId': 'count',
                'total_quality_score': 'mean',
                'enrollmentCount': 'sum'
            }).reset_index()
            
            activity_data.columns = ['condition', 'country', 'trial_count', 'avg_quality_score', 'total_enrollment']
            
            # Get burden data for Parkinson's disease
            burden_data = self.external_data_service.get_combined_burden_data("Parkinson's disease")
            
            whitespace_scores = []
            for _, row in activity_data.iterrows():
                condition = row['condition']
                country = row['country']
                
                # Get burden data for this country
                country_burden = self.external_data_service.get_burden_by_country(country, condition)
                
                # Get population for this country
                population = self.external_data_service.get_population_by_country(country)
                
                # Calculate trial activity per 100k population
                trial_activity_per_100k = (row['trial_count'] / population) * 100000 if population > 0 else 0
                
                # Calculate normalized scores (z-scores)
                daly_score = country_burden['daly_per_100k']
                activity_score = trial_activity_per_100k
                
                # Calculate whitespace score: z(DALY) - z(Activity)
                # For now, use simple normalization, in production use proper z-score calculation
                whitespace_score = daly_score - (activity_score / 100)
                
                # Calculate additional metrics
                enrollment_feasibility = self._calculate_enrollment_feasibility_score(row['total_enrollment'], row['trial_count'])
                quality_score = row['avg_quality_score'] if pd.notna(row['avg_quality_score']) else 0
                
                whitespace_scores.append({
                    'condition': condition,
                    'country': country,
                    'region': country_burden['region'],
                    'trial_count': row['trial_count'],
                    'total_enrollment': row['total_enrollment'],
                    'avg_quality_score': quality_score,
                    'trial_activity_per_100k': trial_activity_per_100k,
                    'burden_daly_per_100k': country_burden['daly_per_100k'],
                    'burden_prevalence_per_100k': country_burden['prevalence_per_100k'],
                    'population': population,
                    'whitespace_score': whitespace_score,
                    'enrollment_feasibility_score': enrollment_feasibility,
                    'composite_score': (whitespace_score * 0.6) + (enrollment_feasibility * 0.3) + (quality_score * 0.1)
                })
            
            # Sort by composite score (higher = bigger opportunity)
            whitespace_scores.sort(key=lambda x: x['composite_score'], reverse=True)
            
            return whitespace_scores[:20]  # Top 20 opportunities
            
        except Exception as e:
            print(f"Error calculating comprehensive whitespace scores: {e}")
            return []
    
    def calculate_advanced_competitive_density(self, df: pd.DataFrame) -> List[Dict]:
        """Calculate advanced competitive density with market concentration analysis"""
        try:
            # Group by MoA, phase, and condition
            density_data = df.groupby(['moa', 'phases', 'conditions']).agg({
                'nctId': 'count',
                'leadSponsor': 'nunique',
                'total_quality_score': 'mean',
                'enrollmentCount': 'sum'
            }).reset_index()
            
            density_data.columns = ['moa', 'phase', 'condition', 'trial_count', 'sponsor_count', 'avg_quality_score', 'total_enrollment']
            
            # Calculate advanced metrics for each group
            advanced_density = []
            for _, row in density_data.iterrows():
                if row['trial_count'] >= 2:  # Only groups with 2+ trials
                    # Get detailed sponsor analysis for this group
                    group_df = df[
                        (df['moa'] == row['moa']) & 
                        (df['phases'] == row['phase']) & 
                        (df['conditions'] == row['condition'])
                    ]
                    
                    sponsor_counts = group_df['leadSponsor'].value_counts()
                    total_trials = len(group_df)
                    
                    # Calculate HHI
                    hhi = sum((count / total_trials * 100) ** 2 for count in sponsor_counts)
                    
                    # Calculate concentration ratio (top 4 sponsors)
                    top_4_concentration = sum(sponsor_counts.head(4)) / total_trials * 100
                    
                    # Calculate sponsor diversity index (1 - HHI/10000)
                    diversity_index = 1 - (hhi / 10000)
                    
                    # Calculate market maturity score
                    market_maturity = self._calculate_market_maturity_score(
                        row['trial_count'], 
                        row['sponsor_count'], 
                        row['avg_quality_score']
                    )
                    
                    advanced_density.append({
                        'moa': row['moa'],
                        'phase': row['phase'],
                        'condition': row['condition'],
                        'trial_count': row['trial_count'],
                        'sponsor_count': row['sponsor_count'],
                        'total_enrollment': row['total_enrollment'],
                        'avg_quality_score': row['avg_quality_score'],
                        'hhi_score': hhi,
                        'top_4_concentration': top_4_concentration,
                        'diversity_index': diversity_index,
                        'market_maturity': market_maturity,
                        'competition_level': self._classify_competition_level(hhi, diversity_index),
                        'opportunity_score': self._calculate_opportunity_score(hhi, diversity_index, market_maturity)
                    })
            
            # Sort by opportunity score (higher = better opportunity)
            advanced_density.sort(key=lambda x: x['opportunity_score'], reverse=True)
            
            return advanced_density[:20]  # Top 20 opportunities
            
        except Exception as e:
            print(f"Error calculating advanced competitive density: {e}")
            return []
    
    def calculate_comprehensive_enrollment_feasibility(self, df: pd.DataFrame) -> Dict:
        """Calculate comprehensive enrollment feasibility metrics"""
        try:
            # Filter for completed trials with enrollment data
            completed_df = df[
                (df['overallStatus'] == 'Completed') & 
                (df['enrollmentCount'].notna()) &
                (df['startDate'].notna()) &
                (df['completionDate'].notna())
            ].copy()
            
            if len(completed_df) == 0:
                return self._get_default_enrollment_metrics()
            
            # Calculate recruitment duration
            completed_df['startDate'] = pd.to_datetime(completed_df['startDate'])
            completed_df['completionDate'] = pd.to_datetime(completed_df['completionDate'])
            completed_df['recruitment_duration_months'] = (
                completed_df['completionDate'] - completed_df['startDate']
            ).dt.days / 30.44
            
            # Calculate monthly enrollment rate
            completed_df['monthly_enrollment'] = completed_df['enrollmentCount'] / completed_df['recruitment_duration_months']
            
            # Assume 1 site if not specified (simplified)
            completed_df['sites'] = 1
            completed_df['per_site_rate'] = completed_df['monthly_enrollment'] / completed_df['sites']
            
            # Calculate comprehensive metrics
            median_rate = completed_df['per_site_rate'].median()
            mean_rate = completed_df['per_site_rate'].mean()
            
            # Calculate by phase
            phase_metrics = {}
            for phase in completed_df['phases'].unique():
                phase_data = completed_df[completed_df['phases'] == phase]
                if len(phase_data) > 0:
                    phase_metrics[phase] = {
                        'median_rate': float(phase_data['per_site_rate'].median()),
                        'mean_rate': float(phase_data['per_site_rate'].mean()),
                        'trial_count': len(phase_data),
                        'avg_enrollment': float(phase_data['enrollmentCount'].mean())
                    }
            
            # Calculate by MoA (if available)
            moa_metrics = {}
            if 'moa' in completed_df.columns:
                for moa in completed_df['moa'].unique():
                    if moa != 'Unknown':
                        moa_data = completed_df[completed_df['moa'] == moa]
                        if len(moa_data) > 0:
                            moa_metrics[moa] = {
                                'median_rate': float(moa_data['per_site_rate'].median()),
                                'mean_rate': float(moa_data['per_site_rate'].mean()),
                                'trial_count': len(moa_data),
                                'avg_enrollment': float(moa_data['enrollmentCount'].mean())
                            }
            
            return {
                "median_enroll_rate_per_site_per_month": float(median_rate) if not pd.isna(median_rate) else 0,
                "mean_enroll_rate_per_site_per_month": float(mean_rate) if not pd.isna(mean_rate) else 0,
                "total_completed_trials": len(completed_df),
                "enrollment_stats": {
                    "min_rate": float(completed_df['per_site_rate'].min()) if len(completed_df) > 0 else 0,
                    "max_rate": float(completed_df['per_site_rate'].max()) if len(completed_df) > 0 else 0,
                    "std_rate": float(completed_df['per_site_rate'].std()) if len(completed_df) > 0 else 0,
                    "q25_rate": float(completed_df['per_site_rate'].quantile(0.25)) if len(completed_df) > 0 else 0,
                    "q75_rate": float(completed_df['per_site_rate'].quantile(0.75)) if len(completed_df) > 0 else 0
                },
                "phase_metrics": phase_metrics,
                "moa_metrics": moa_metrics,
                "recruitment_efficiency_score": self._calculate_recruitment_efficiency_score(completed_df)
            }
            
        except Exception as e:
            print(f"Error calculating comprehensive enrollment feasibility: {e}")
            return self._get_default_enrollment_metrics()
    
    def generate_advanced_strategic_recommendations(self, df: pd.DataFrame) -> Dict:
        """Generate advanced strategic recommendations based on comprehensive analysis"""
        try:
            # Get all the analysis data
            whitespace_data = self.calculate_comprehensive_whitespace_scores(df)
            density_data = self.calculate_advanced_competitive_density(df)
            feasibility_data = self.calculate_comprehensive_enrollment_feasibility(df)
            
            # Generate Now recommendations (immediate opportunities)
            now_recommendations = self._generate_now_recommendations(whitespace_data, density_data, feasibility_data)
            
            # Generate Next recommendations (medium-term opportunities)
            next_recommendations = self._generate_next_recommendations(whitespace_data, density_data, feasibility_data)
            
            # Generate Watch recommendations (long-term monitoring)
            watch_recommendations = self._generate_watch_recommendations(whitespace_data, density_data, feasibility_data)
            
            return {
                "now": now_recommendations,
                "next": next_recommendations,
                "watch": watch_recommendations,
                "analysis_metadata": {
                    "total_opportunities_analyzed": len(whitespace_data),
                    "total_market_segments": len(density_data),
                    "last_updated": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            print(f"Error generating advanced strategic recommendations: {e}")
            return {"now": [], "next": [], "watch": []}
    
    def _calculate_enrollment_feasibility_score(self, total_enrollment: int, trial_count: int) -> float:
        """Calculate enrollment feasibility score"""
        if trial_count == 0:
            return 0.0
        
        avg_enrollment_per_trial = total_enrollment / trial_count
        
        # Score based on average enrollment (higher = more feasible)
        if avg_enrollment_per_trial >= 1000:
            return 1.0
        elif avg_enrollment_per_trial >= 500:
            return 0.8
        elif avg_enrollment_per_trial >= 200:
            return 0.6
        elif avg_enrollment_per_trial >= 100:
            return 0.4
        else:
            return 0.2
    
    def _calculate_market_maturity_score(self, trial_count: int, sponsor_count: int, avg_quality: float) -> float:
        """Calculate market maturity score"""
        # Trial count score (0-0.4)
        trial_score = min(trial_count / 20, 1.0) * 0.4
        
        # Sponsor diversity score (0-0.3)
        diversity_score = min(sponsor_count / 10, 1.0) * 0.3
        
        # Quality score (0-0.3)
        quality_score = min(avg_quality / 10, 1.0) * 0.3 if pd.notna(avg_quality) else 0
        
        return trial_score + diversity_score + quality_score
    
    def _classify_competition_level(self, hhi: float, diversity_index: float) -> str:
        """Classify competition level based on HHI and diversity"""
        if hhi > 2500 or diversity_index < 0.25:
            return "High"
        elif hhi > 1500 or diversity_index < 0.5:
            return "Moderate"
        else:
            return "Low"
    
    def _calculate_opportunity_score(self, hhi: float, diversity_index: float, market_maturity: float) -> float:
        """Calculate opportunity score (higher = better opportunity)"""
        # Lower HHI = more opportunity
        hhi_score = max(0, 1 - (hhi / 10000))
        
        # Higher diversity = more opportunity
        diversity_score = diversity_index
        
        # Market maturity affects opportunity (too mature = less opportunity, too immature = risk)
        maturity_score = 1 - abs(market_maturity - 0.5) * 2
        
        # Weighted combination
        opportunity_score = (hhi_score * 0.4) + (diversity_score * 0.4) + (maturity_score * 0.2)
        
        return max(0, min(1, opportunity_score))
    
    def _calculate_recruitment_efficiency_score(self, completed_df: pd.DataFrame) -> float:
        """Calculate overall recruitment efficiency score"""
        if len(completed_df) == 0:
            return 0.0
        
        # Calculate efficiency based on completion rates and enrollment speed
        avg_duration = completed_df['recruitment_duration_months'].mean()
        avg_enrollment = completed_df['enrollmentCount'].mean()
        
        # Normalize and combine
        duration_score = max(0, 1 - (avg_duration / 24))  # 24 months = baseline
        enrollment_score = min(1, avg_enrollment / 1000)  # 1000 = baseline
        
        return (duration_score * 0.6) + (enrollment_score * 0.4)
    
    def _get_default_enrollment_metrics(self) -> Dict:
        """Get default enrollment metrics when no data is available"""
        return {
            "median_enroll_rate_per_site_per_month": 0,
            "mean_enroll_rate_per_site_per_month": 0,
            "total_completed_trials": 0,
            "enrollment_stats": {
                "min_rate": 0, "max_rate": 0, "std_rate": 0, "q25_rate": 0, "q75_rate": 0
            },
            "phase_metrics": {},
            "moa_metrics": {},
            "recruitment_efficiency_score": 0
        }
    
    def _generate_now_recommendations(self, whitespace_data: List, density_data: List, feasibility_data: Dict) -> List[Dict]:
        """Generate immediate action recommendations"""
        recommendations = []
        
        # High whitespace + low competition + good feasibility
        for item in whitespace_data[:5]:
            if item['composite_score'] > 0.5 and item['enrollment_feasibility_score'] > 0.6:
                recommendations.append({
                    "title": f"{item['condition']} in {item['country']}",
                    "why": [
                        f"High whitespace score: {item['whitespace_score']:.2f}",
                        f"Low trial activity: {item['trial_activity_per_100k']:.1f} per 100k",
                        f"Good enrollment feasibility: {item['enrollment_feasibility_score']:.1f}"
                    ],
                    "confidence": min(0.95, item['composite_score']),
                    "priority": "High",
                    "estimated_timeline": "6-12 months"
                })
        
        return recommendations[:3]  # Top 3
    
    def _generate_next_recommendations(self, whitespace_data: List, density_data: List, feasibility_data: Dict) -> List[Dict]:
        """Generate medium-term recommendations"""
        recommendations = []
        
        # Moderate whitespace + emerging markets
        for item in density_data[:5]:
            if item['opportunity_score'] > 0.6 and item['market_maturity'] < 0.7:
                recommendations.append({
                    "title": f"{item['moa']} in {item['phase']} for {item['condition']}",
                    "why": [
                        f"Emerging market: {item['market_maturity']:.1f} maturity",
                        f"Good opportunity score: {item['opportunity_score']:.1f}",
                        f"Moderate competition: {item['competition_level']}"
                    ],
                    "confidence": item['opportunity_score'],
                    "priority": "Medium",
                    "estimated_timeline": "12-24 months"
                })
        
        return recommendations[:3]  # Top 3
    
    def _generate_watch_recommendations(self, whitespace_data: List, density_data: List, feasibility_data: Dict) -> List[Dict]:
        """Generate long-term monitoring recommendations"""
        recommendations = []
        
        # High potential but high risk
        for item in density_data[5:10]:
            if item['opportunity_score'] > 0.4 and item['hhi_score'] > 2000:
                recommendations.append({
                    "title": f"Monitor {item['moa']} market consolidation",
                    "why": [
                        f"High concentration: HHI {item['hhi_score']:.0f}",
                        f"Potential disruption: {item['opportunity_score']:.1f} score",
                        f"Market evolution needed"
                    ],
                    "confidence": item['opportunity_score'] * 0.8,
                    "priority": "Monitor",
                    "estimated_timeline": "24+ months"
                })
        
        return recommendations[:3]  # Top 3
