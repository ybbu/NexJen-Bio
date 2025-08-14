#!/usr/bin/env python3
"""
Test scoring for a few studies to analyze score breakdowns
"""

import sys
import os

# Add parent directory to path for clinical_trial_score_calculator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from clinical_trial_score_calculator import ClinicalTrialScorer

def test_studies():
    """Test a few studies and analyze their scores"""
    
    # Test NCT IDs
    test_nct_ids = [
        "NCT02452723",  # From the output we saw
        "NCT03011723", 
        "NCT01280123",  # This one got 3.35 (GOOD)
        "NCT03958708",
        "NCT05795023"
    ]
    
    scorer = ClinicalTrialScorer()
    
    print("🔍 Analyzing score breakdowns for test studies...\n")
    
    for nct_id in test_nct_ids:
        print(f"📊 Analyzing {nct_id}...")
        
        try:
            score = scorer.calculate_trial_score(nct_id)
            if score:
                print(f"✅ {nct_id} Final Score: {score.total_score:.2f}")
                print(f"   Outcome Evidence: {score.outcome_evidence:.2f}")
                print(f"   Phase Prior: {score.phase_prior:.2f}")
                print(f"   Sponsor Quality: {score.sponsor_track_record:.2f}")
                print(f"   Study Design: {score.study_design_integrity:.2f}")
                print(f"   Enrollment: {score.enrollment_fulfillment:.2f}")
                print(f"   Eligibility: {score.eligibility_external_validity:.2f}")
                print(f"   FDA Bonus: {score.regulatory_approval_bonus:.2f}")
                print(f"   Publication Bonus: {score.high_impact_publication_bonus:.2f}")
                print(f"   Termination Penalty: {score.termination_penalty:.2f}")
                print(f"   Base Score: {score.base_score:.2f}")
                print()
            else:
                print(f"❌ {nct_id}: Failed to calculate score")
                print()
        except Exception as e:
            print(f"❌ {nct_id}: Error - {str(e)}")
            print()

if __name__ == "__main__":
    test_studies() 