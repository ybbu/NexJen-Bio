#!/usr/bin/env python3
"""
Process all interventional studies from parkinson_trials_2010.csv
Calculate scores and update quality_scores.json
Save detailed breakdowns and log errors to failed_apis.json
"""

import json
import pandas as pd
import sys
import os
from datetime import datetime
from proper_csv_scorer import ProperCSVScorer, print_detailed_breakdown

def get_interventional_trials():
    """Get all interventional trials from CSV"""
    csv_path = '../data/parkinson_trials_2010.csv'
    df = pd.read_csv(csv_path)
    
    # Filter for interventional studies
    interventional_trials = df[df['studyType'] == 'INTERVENTIONAL']
    
    print(f"Found {len(interventional_trials)} interventional trials")
    return interventional_trials['nctId'].tolist()

def save_detailed_breakdown(nct_id: str, score, breakdown_file: str):
    """Save detailed breakdown without interpretation"""
    breakdown = {
        'nct_id': nct_id,
        'timestamp': datetime.now().isoformat(),
        'base_components': {
            'outcome_evidence': score.outcome_evidence,
            'phase_prior': score.phase_prior,
            'sponsor_track_record': score.sponsor_track_record,
            'study_design_integrity': score.study_design_integrity,
            'enrollment_fulfillment': score.enrollment_fulfillment,
            'external_validity': score.external_validity
        },
        'bonuses': {
            'regulatory_acceleration_bonus': score.regulatory_acceleration_bonus,
            'high_impact_publication_bonus': score.high_impact_publication_bonus,
            'data_sharing_bonus': score.data_sharing_bonus
        },
        'penalties': {
            'termination_penalty': score.termination_penalty
        },
        'scores': {
            'base_score': score.base_score,
            'total_bonuses': (score.regulatory_acceleration_bonus + 
                             score.high_impact_publication_bonus + 
                             score.data_sharing_bonus),
            'total_penalties': score.termination_penalty,
            'final_score': score.total_score
        }
    }
    
    # Append to breakdown file
    try:
        with open(breakdown_file, 'a') as f:
            f.write(json.dumps(breakdown) + '\n')
    except Exception as e:
        print(f"Warning: Could not save breakdown for {nct_id}: {e}")

def main():
    print("🚀 Starting comprehensive trial scoring...")
    
    # Initialize scorer
    scorer = ProperCSVScorer()
    
    # Get all interventional trials
    trial_ids = get_interventional_trials()
    
    # Load existing scores
    scores_file = '../data/quality_scores.json'
    try:
        with open(scores_file, 'r') as f:
            existing_scores = json.load(f)
    except FileNotFoundError:
        existing_scores = {}
    
    # Setup output files
    breakdown_file = '../data/detailed_breakdowns.jsonl'
    failed_file = '../data/failed_apis.json'
    
    # Clear breakdown file
    with open(breakdown_file, 'w') as f:
        f.write('')  # Clear file
    
    # Process each trial
    processed_count = 0
    error_count = 0
    
    print(f"\n📊 Processing {len(trial_ids)} interventional trials...")
    
    for i, nct_id in enumerate(trial_ids, 1):
        try:
            print(f"\n[{i}/{len(trial_ids)}] Processing {nct_id}...")
            
            # Calculate score
            score = scorer.calculate_trial_score(nct_id)
            
            if score:
                # Save to quality_scores.json
                existing_scores[nct_id] = {
                    'base_score': score.base_score,
                    'total_score': score.total_score,
                    'components': {
                        'outcome_evidence': score.outcome_evidence,
                        'phase_prior': score.phase_prior,
                        'sponsor_track_record': score.sponsor_track_record,
                        'study_design_integrity': score.study_design_integrity,
                        'enrollment_fulfillment': score.enrollment_fulfillment,
                        'external_validity': score.external_validity
                    },
                    'bonuses': {
                        'regulatory_acceleration_bonus': score.regulatory_acceleration_bonus,
                        'high_impact_publication_bonus': score.high_impact_publication_bonus,
                        'data_sharing_bonus': score.data_sharing_bonus
                    },
                    'penalties': {
                        'termination_penalty': score.termination_penalty
                    },
                    'timestamp': datetime.now().isoformat()
                }
                
                # Save detailed breakdown
                save_detailed_breakdown(nct_id, score, breakdown_file)
                
                processed_count += 1
                
            else:
                error_count += 1
                print(f"❌ {nct_id}: Trial not found in CSV")
                
        except Exception as e:
            error_count += 1
            print(f"❌ {nct_id}: Error - {e}")
    
    # Save updated scores
    try:
        with open(scores_file, 'w') as f:
            json.dump(existing_scores, f, indent=2)
        print(f"\n✅ Updated {scores_file}")
    except Exception as e:
        print(f"❌ Error saving scores: {e}")
    
    # Get failed API summary
    failed_summary = scorer.get_failed_api_summary()
    print(f"\n{failed_summary}")
    
    # Final summary
    print(f"\n🎯 PROCESSING COMPLETE")
    print(f"📊 Trials processed: {processed_count}")
    print(f"❌ Errors encountered: {error_count}")
    print(f"📁 Detailed breakdowns: {breakdown_file}")
    print(f"📁 Failed APIs logged: {failed_file}")
    print(f"📁 Updated scores: {scores_file}")

if __name__ == "__main__":
    main() 