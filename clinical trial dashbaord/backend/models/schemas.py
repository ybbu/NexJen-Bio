from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class TrialQuery(BaseModel):
    condition: str = "Parkinson's Disease"
    phase: Optional[str] = None
    intervention: Optional[str] = None
    date_range: Optional[List[str]] = None
    study_type: str = "INTERVENTIONAL"
    _timestamp: Optional[int] = None

class SummaryRequest(BaseModel):
    nct_ids: List[str]

class AnalyticsFilters(BaseModel):
    phases: List[str] = []
    statuses: List[str] = []
    countries: List[str] = []
    therapeutic_areas: List[str] = []  # New therapeutic area filter
    study_type: str = "BOTH"  # INTERVENTIONAL, OBSERVATIONAL, BOTH
    date_range: Optional[List[str]] = None
    window: str = "6m"  # 3m, 6m, 1y, 2y

class ChangeMetrics(BaseModel):
    baseline_value: float
    current_value: float
    delta: float
    delta_pct: float
    p_value: float
    confidence: float

class AnalyticsMetrics(BaseModel):
    trial_starts: ChangeMetrics
    enrollment: ChangeMetrics
    quality_score: ChangeMetrics

class AnalyticsResponse(BaseModel):
    metrics: AnalyticsMetrics
    monthly_starts: List[Dict[str, Any]]
    status_transitions: Dict[str, int]
    geo_distribution: List[Dict[str, Any]]
    phase_timeline: List[Dict[str, Any]]
    top_conditions: Dict[str, int]
    top_interventions: Dict[str, int]
    current_period: Dict[str, str]
    baseline_period: Dict[str, str]

class AnnotationResponse(BaseModel):
    metric: str
    text: str
    data: ChangeMetrics
    chart_module: str

class AnnotationsResponse(BaseModel):
    annotations: List[AnnotationResponse]
    total_insights: int
