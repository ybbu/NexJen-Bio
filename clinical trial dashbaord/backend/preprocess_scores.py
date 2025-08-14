#!/usr/bin/env python3
"""
Pre-process Quality Scores for Clinical Trials
Calculates and stores quality scores for all trials to avoid API calls during runtime
"""

import pandas as pd
import json
import sys
import os
from datetime import datetime
import time

# Add parent directory to path for clinical_trial_score_calculator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from clinical_trial_score_calculator import ClinicalTrialScorer

def preprocess_quality_scores():
    """Pre-calculate quality scores for all trials"""
    
    print("🚀 Starting quality score pre-processing...")
    
    # Load CSV data
    print("📊 Loading clinical trials data...")
    try:
        df = pd.read_csv("../data/parkinson_trials_2010.csv")
        print(f"✅ Loaded {len(df)} trials")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return
    
    # Filter for interventional trials only
    interventional_trials = df[df['studyType'] == 'INTERVENTIONAL'].copy()
    print(f"📈 Found {len(interventional_trials)} interventional trials")
    
    # Initialize scorer
    print("🔧 Initializing quality scorer...")
    scorer = ClinicalTrialScorer()
    
    # Store results
    quality_scores = {}
    failed_trials = []
    
    # Process each trial
    total_trials = len(interventional_trials)
    for idx, (_, trial) in enumerate(interventional_trials.iterrows(), 1):
        nct_id = trial['nctId']
        
        print(f"📋 Processing {idx}/{total_trials}: {nct_id}")
        
        try:
            # Calculate quality score
            score_result = scorer.calculate_trial_score(nct_id)
            
            if score_result:
                score = score_result
                
                # Format for storage
                quality_scores[nct_id] = {
                    "score": f"{score.total_score:.2f}",
                    "breakdown": f"Outcome Evidence: {score.outcome_evidence:.2f}\n"
                                f"Phase Prior: {score.phase_prior:.2f}\n"
                                f"Sponsor Quality: {score.sponsor_track_record:.2f}\n"
                                f"Study Design: {score.study_design_integrity:.2f}\n"
                                f"Enrollment: {score.enrollment_fulfillment:.2f}\n"
                                f"Eligibility: {score.eligibility_external_validity:.2f}\n"
                                f"Final Score: {score.total_score:.2f}/5.0",
                    "final_score": score.total_score,
                    "interpretation": get_interpretation(score.total_score),
                    "components": {
                        "outcome_evidence": score.outcome_evidence,
                        "phase_prior": score.phase_prior,
                        "sponsor_track_record": score.sponsor_track_record,
                        "study_design_integrity": score.study_design_integrity,
                        "enrollment_fulfillment": score.enrollment_fulfillment,
                        "eligibility_external_validity": score.eligibility_external_validity,
                        "regulatory_approval_bonus": score.regulatory_approval_bonus,
                        "high_impact_publication_bonus": score.high_impact_publication_bonus,
                        "termination_penalty": score.termination_penalty
                    }
                }
                print(f"✅ {nct_id}: {quality_scores[nct_id]['score']} ({quality_scores[nct_id]['interpretation']})")
            else:
                failed_trials.append(nct_id)
                print(f"❌ {nct_id}: Score calculation failed")
                
        except Exception as e:
            failed_trials.append(nct_id)
            print(f"❌ {nct_id}: Error - {str(e)}")
        
        # Add small delay to avoid overwhelming APIs
        time.sleep(0.5)
    
    # Save results
    print("\n💾 Saving results...")
    
    # Save quality scores
    with open("../data/quality_scores.json", "w") as f:
        json.dump(quality_scores, f, indent=2)
    
    # Save failed trials list
    with open("../data/failed_trials.json", "w") as f:
        json.dump(failed_trials, f, indent=2)
    
    # Print summary
    print(f"\n🎉 Pre-processing complete!")
    print(f"✅ Successfully processed: {len(quality_scores)} trials")
    print(f"❌ Failed to process: {len(failed_trials)} trials")
    print(f"📁 Results saved to: ../data/quality_scores.json")
    print(f"📁 Failed trials saved to: ../data/failed_trials.json")
    
    # Print some statistics
    if quality_scores:
        scores = [data['final_score'] for data in quality_scores.values()]
        print(f"\n📊 Score Statistics:")
        print(f"   Average Score: {sum(scores)/len(scores):.2f}")
        print(f"   Highest Score: {max(scores):.2f}")
        print(f"   Lowest Score: {min(scores):.2f}")
        
        # Count by interpretation
        interpretations = [data['interpretation'] for data in quality_scores.values()]
        from collections import Counter
        interpretation_counts = Counter(interpretations)
        print(f"\n📈 Score Distribution:")
        for interpretation, count in interpretation_counts.most_common():
            print(f"   {interpretation}: {count} trials")

def get_interpretation(score):
    """Get interpretation based on score"""
    if score >= 4.0:
        return "EXCELLENT"
    elif score >= 3.0:
        return "GOOD"
    elif score >= 2.4:
        return "FAIR"
    elif score >= 1.2:
        return "POOR"
    else:
        return "VERY POOR"

if __name__ == "__main__":
    preprocess_quality_scores() 