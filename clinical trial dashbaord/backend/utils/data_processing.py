import pandas as pd
import numpy as np
from typing import Dict, List

def extract_country(location_str: str) -> str:
    """Extract country from location string"""
    if pd.isna(location_str) or location_str == 'Unknown':
        return 'Unknown'
    
    # Common country patterns
    countries = [
        'United States', 'USA', 'US', 'Canada', 'United Kingdom', 'UK', 'Germany',
        'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Sweden', 'Norway',
        'Denmark', 'Finland', 'Australia', 'Japan', 'China', 'India', 'Brazil',
        'Mexico', 'Argentina', 'South Africa', 'Russia', 'Poland', 'Czech Republic',
        'Austria', 'Belgium', 'Portugal', 'Greece', 'Hungary', 'Romania', 'Bulgaria',
        'Croatia', 'Slovenia', 'Slovakia', 'Estonia', 'Latvia', 'Lithuania'
    ]
    
    location_lower = location_str.lower()
    for country in countries:
        if country.lower() in location_lower:
            return country
    
    return 'Other'

def standardize_phase(phase: str) -> str:
    """Standardize phase values"""
    if pd.isna(phase):
        return 'N/A'
    
    phase_lower = str(phase).lower()
    if 'phase 1' in phase_lower or 'phase1' in phase_lower:
        return 'Phase 1'
    elif 'phase 2' in phase_lower or 'phase2' in phase_lower:
        return 'Phase 2'
    elif 'phase 3' in phase_lower or 'phase3' in phase_lower:
        return 'Phase 3'
    elif 'phase 4' in phase_lower or 'phase4' in phase_lower:
        return 'Phase 4'
    elif 'early' in phase_lower:
        return 'Early Phase'
    else:
        return phase

def standardize_status(status: str) -> str:
    """Standardize status values"""
    if pd.isna(status):
        return 'Unknown'
    
    status_lower = str(status).lower()
    if 'recruiting' in status_lower:
        return 'Recruiting'
    elif 'completed' in status_lower:
        return 'Completed'
    elif 'terminated' in status_lower:
        return 'Terminated'
    elif 'suspended' in status_lower:
        return 'Suspended'
    elif 'withdrawn' in status_lower:
        return 'Withdrawn'
    elif 'not yet recruiting' in status_lower:
        return 'Not Yet Recruiting'
    elif 'active' in status_lower:
        return 'Active'
    else:
        return status

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess the clinical trials data"""
    # Fill missing enrollment counts with median
    median_enrollment = df['enrollmentCount'].median()
    df['enrollmentCount'] = df['enrollmentCount'].fillna(median_enrollment)
    
    # Convert dates - handle data quality issues
    def safe_date_parse(date_str):
        if pd.isna(date_str):
            return pd.NaT
        try:
            # Try to parse as datetime
            parsed = pd.to_datetime(date_str, errors='coerce')
            if pd.isna(parsed):
                return pd.NaT
            return parsed
        except:
            return pd.NaT
    
    df['startDate'] = df['startDate'].apply(safe_date_parse)
    df['completionDate'] = df['completionDate'].apply(safe_date_parse)
    
    # Clean phases
    df['phases'] = df['phases'].fillna('N/A')
    
    # Clean locations
    df['locations'] = df['locations'].fillna('Unknown')
    
    # Extract country from locations
    df['country'] = df['locations'].apply(lambda x: extract_country(str(x)))
    
    # Standardize phases
    df['phases'] = df['phases'].apply(standardize_phase)
    
    # Standardize status
    df['overallStatus'] = df['overallStatus'].apply(standardize_status)
    
    return df

def extract_summary(text: str, max_sentences: int = 2) -> str:
    """Extract key sentences from trial summary"""
    if not text or pd.isna(text):
        return "No summary available"
    
    # Clean the text
    text = str(text).strip()
    if len(text) < 50:
        return text
    
    # Fallback: simple sentence extraction
    import re
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    if sentences:
        return ". ".join(sentences[:max_sentences]) + "."
    
    return text[:200] + "..." if len(text) > 200 else text
