from fastapi import APIRouter, HTTPException
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from services.data_service import DataService
import pandas as pd

router = APIRouter(prefix="/trends", tags=["trends"])

# Initialize services
data_service = DataService()

def analyze_trends(df):
    """Analyze trends and identify gaps using clustering"""
    try:
        # Prepare text data for clustering
        interventions = df['interventions'].fillna('').astype(str)
        outcomes = df['primaryOutcomes'].fillna('').astype(str)
        
        # Combine interventions and outcomes
        combined_text = interventions + " " + outcomes
        
        # Vectorize text
        vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        text_vectors = vectorizer.fit_transform(combined_text)
        
        # Apply K-means clustering
        kmeans = KMeans(n_clusters=5, random_state=42)
        clusters = kmeans.fit_predict(text_vectors)
        
        # Analyze clusters
        cluster_analysis = {}
        for i in range(5):
            cluster_trials = df[clusters == i]
            cluster_analysis[f"Cluster {i+1}"] = {
                "count": len(cluster_trials),
                "common_interventions": cluster_trials['interventions'].value_counts().head(3).to_dict(),
                "common_outcomes": cluster_trials['primaryOutcomes'].value_counts().head(3).to_dict()
            }
        
        # Identify gaps (small clusters)
        gaps = []
        for cluster_name, data in cluster_analysis.items():
            if data['count'] < len(df) * 0.1:  # Less than 10% of trials
                gaps.append(f"Underrepresented area: {cluster_name} ({data['count']} trials)")
        
        # Calculate year-over-year growth
        df['year'] = pd.to_datetime(df['startDate']).dt.year
        yearly_counts = df['year'].value_counts().sort_index()
        if len(yearly_counts) > 1:
            growth_rate = ((yearly_counts.iloc[-1] - yearly_counts.iloc[-2]) / yearly_counts.iloc[-2]) * 100
            trend = f"Trial growth: {growth_rate:.1f}% year-over-year"
        else:
            trend = "Insufficient data for trend analysis"
        
        return {
            "trends": trend,
            "gaps": gaps,
            "cluster_analysis": cluster_analysis
        }
        
    except Exception as e:
        print(f"Error in trend analysis: {e}")
        return {
            "trends": "Trend analysis unavailable",
            "gaps": ["Analysis failed"],
            "cluster_analysis": {}
        }

@router.get("/")
async def get_trends():
    """Get trend analysis and research gaps"""
    try:
        trends = analyze_trends(data_service.df)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing trends: {str(e)}")
