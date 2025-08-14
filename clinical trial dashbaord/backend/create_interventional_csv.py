#!/usr/bin/env python3
"""
Script to create a new CSV with only interventional studies and quality scores
"""

import pandas as pd
import json
import os

def create_interventional_csv():
    """Create a new CSV with only interventional studies and quality scores"""
    
    print("Loading data...")
    
    # Load the cleaned CSV
    df = pd.read_csv("../data/parkinson_trials_2010_cleaned.csv", low_memory=False)
    print(f"Loaded {len(df)} total trials")
    
    # Filter for interventional studies only
    interventional_df = df[df['studyType'] == 'INTERVENTIONAL'].copy()
    print(f"Found {len(interventional_df)} interventional trials")
    
    # Select only essential columns (skip heavy text fields)
    essential_columns = [
        'nctId', 'briefTitle', 'officialTitle', 'overallStatus', 'phases',
        'studyType', 'conditions', 'interventions', 'enrollmentCount',
        'startDate', 'completionDate', 'locations', 'leadSponsor'
    ]
    
    # Keep only essential columns
    interventional_df = interventional_df[essential_columns].copy()
    print(f"Kept {len(essential_columns)} essential columns")
    
    # Load quality scores
    print("Loading quality scores...")
    try:
        with open("../data/quality_scores.json", "r") as f:
            quality_scores = json.load(f)
        print(f"Loaded {len(quality_scores)} quality scores")
    except FileNotFoundError:
        print("No quality scores found, creating empty scores")
        quality_scores = {}
    
    # Add quality score column
    print("Adding quality scores...")
    quality_score_list = []
    total_score_list = []
    
    for _, trial in interventional_df.iterrows():
        nct_id = str(trial['nctId']).strip()
        
        if nct_id in quality_scores:
            score_data = quality_scores[nct_id]
            quality_score_list.append(score_data.get('base_score', 0))
            total_score_list.append(score_data.get('total_score', 0))
        else:
            quality_score_list.append(0)
            total_score_list.append(0)
    
    # Add the columns
    interventional_df['quality_score'] = quality_score_list
    interventional_df['total_quality_score'] = total_score_list
    
    # Save the new CSV
    output_path = "../data/interventional_trials_with_scores.csv"
    interventional_df.to_csv(output_path, index=False)
    
    print(f"✅ Saved {len(interventional_df)} interventional trials to {output_path}")
    print(f"Quality scores available for {sum(1 for score in total_score_list if score > 0)} trials")
    
    # Print some statistics
    print("\n📊 Statistics:")
    print(f"Total interventional trials: {len(interventional_df)}")
    print(f"Trials with quality scores: {sum(1 for score in total_score_list if score > 0)}")
    print(f"Average quality score: {sum(total_score_list) / len(total_score_list):.2f}")
    print(f"Max quality score: {max(total_score_list):.2f}")
    print(f"Min quality score: {min(total_score_list):.2f}")
    
    # Phase breakdown
    print("\n📈 Phase Breakdown:")
    phase_counts = interventional_df['phases'].value_counts()
    for phase, count in phase_counts.head(10).items():
        print(f"  {phase}: {count}")
    
    # Status breakdown
    print("\n📊 Status Breakdown:")
    status_counts = interventional_df['overallStatus'].value_counts()
    for status, count in status_counts.head(10).items():
        print(f"  {status}: {count}")
    
    return output_path

if __name__ == "__main__":
    create_interventional_csv()
