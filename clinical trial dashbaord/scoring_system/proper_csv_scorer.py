import json
import requests
import time
import re
import pandas as pd
import random
from dataclasses import dataclass
from typing import Dict, Optional, List, Tuple
from datetime import datetime

@dataclass
class TrialScore:
    nct_id: str
    outcome_evidence: float
    phase_prior: float
    sponsor_track_record: float
    study_design_integrity: float
    enrollment_fulfillment: float
    external_validity: float
    regulatory_acceleration_bonus: float
    high_impact_publication_bonus: float
    data_sharing_bonus: float
    termination_penalty: float
    
    @property
    def base_score(self) -> float:
        """Calculate base score (max 5.0 points)"""
        base = (
            self.outcome_evidence +
            self.phase_prior +
            self.sponsor_track_record +
            self.study_design_integrity +
            self.enrollment_fulfillment +
            self.external_validity
        )
        return round(min(5.0, base), 2)
    
    @property
    def total_score(self) -> float:
        """Calculate total score with bonuses and penalties"""
        bonuses = (
            self.regulatory_acceleration_bonus +
            self.high_impact_publication_bonus +
            self.data_sharing_bonus
        )
        bonuses = min(1.0, bonuses)  # Cap bonuses at 1.0
        
        final = self.base_score + bonuses + self.termination_penalty
        return round(max(0.0, min(5.0, final)), 2)
    
    @property
    def interpretation(self) -> str:
        """Get interpretation"""
        if self.total_score >= 4.0:
            return "HIGHLY RELIABLE"
        elif self.total_score >= 3.0:
            return "RELIABLE"
        elif self.total_score >= 2.0:
            return "MODERATE"
        elif self.total_score >= 1.0:
            return "RISKY"
        else:
            return "HIGHLY RISKY"

class ProperCSVScorer:
    """Clinical trial scorer that uses CSV data to calculate all components"""
    
    def __init__(self):
        # Load CSV data
        self.csv_path = '../data/parkinson_trials_2010.csv'
        self.df = pd.read_csv(self.csv_path)
        
        # Initialize failed API tracking
        self.failed_apis = []
        self.failed_file = '../data/failed_apis.json'
        
        # High-impact journals with actual impact factors
        self.high_impact_journals = {
            'nature': 49.962,
            'science': 56.9,
            'cell': 66.85,
            'nature medicine': 87.241,
            'nature genetics': 41.307,
            'nature biotechnology': 68.164,
            'new england journal of medicine': 176.082,
            'lancet': 168.9,
            'lancet neurology': 48.0,  # Added Lancet Neurology
            'jama': 157.3,
            'journal of the american medical association': 157.3,
            'nature immunology': 31.25,
            'immunity': 43.474,
            'neuron': 16.2,
            'cancer cell': 50.3,
            'blood': 20.3,
            'circulation': 39.918,
            'gastroenterology': 33.883,
            'diabetes': 9.337,
            'brain': 15.255,
            'movement disorders': 9.698,
            'parkinsonism and related disorders': 4.432,
            'journal of neurology': 6.382,
            'neurology': 11.8,
            'annals of neurology': 11.2,
            'archives of neurology': 11.2,
            'neurobiology of disease': 5.2,
            'experimental neurology': 5.0,
            'journal of neuroscience': 6.709,
            'neuroscience': 3.708,
            'neurotherapeutics': 5.7,
            'parkinson\'s disease': 3.0,
            'npj parkinson\'s disease': 9.0
        }
        
        # Known non-high-impact journals
        self.non_high_impact_journals = {
            'stem cells and development': 3.0,
            'stem cells': 6.0,
            'development': 6.0,
            'plos one': 3.752,
            'bmc': 3.0,
            'scientific reports': 4.996,
            'frontiers': 5.0
        }
        
        # FDA-approved drugs
        self.fda_approved_drugs = [
            'levodopa', 'carbidopa', 'selegiline', 'rasagiline', 
            'pramipexole', 'ropinirole', 'rotigotine', 'apomorphine',
            'amantadine', 'trihexyphenidyl', 'benztropine', 
            'entacapone', 'tolcapone', 'istradefylline', 
            'safinamide', 'opicapone', 'duodopa', 'duopa',
            'xadago', 'northera', 'gocovri', 'ingrezza',
            'austedo', 'nuplazid', 'nuplazid', 'ingrezza'
        ]
        
        # Top-tier sponsors
        self.top_tier_sponsors = [
            "pfizer", "novartis", "roche", "johnson & johnson", "merck", 
            "sanofi", "astrazeneca", "bristol-myers squibb", "eli lilly",
            "biogen", "amgen", "gilead", "national institutes of health", 
            "nih", "mayo clinic", "stanford university", "harvard", "johns hopkins"
        ]
        
        self.mid_tier_sponsors = [
            "university of", "medical center", "hospital", "medical school",
            "research institute", "foundation", "association"
        ]

    def get_trial_data(self, nct_id: str) -> Optional[Dict]:
        """Get trial data from CSV"""
        trial = self.df[self.df['nctId'] == nct_id]
        if trial.empty:
            return None
        return trial.iloc[0].to_dict()

    def log_failed_api(self, nct_id: str, api_type: str, error: str, details: Dict = None):
        """Log failed API calls to failed_apis.json for later fixing"""
        failed_entry = {
            'nct_id': nct_id,
            'api_type': api_type,
            'error': str(error),
            'timestamp': datetime.now().isoformat(),
            'details': details or {}
        }
        
        self.failed_apis.append(failed_entry)
        
        # Save to file immediately
        try:
            with open(self.failed_file, 'w') as f:
                json.dump(self.failed_apis, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save failed API log: {e}")

    def calculate_outcome_evidence(self, trial_data: Dict) -> float:
        """Calculate outcome evidence score (0-1.2 pts)"""
        status = str(trial_data.get('overallStatus', '')).lower()
        
        if 'completed' in status and 'positive' in str(trial_data.get('primaryOutcomes', '')).lower():
            return 1.2  # Completed + Positive Results
        elif 'completed' in status:
            return 0.8  # Completed + No Results Posted
        elif any(word in status for word in ['recruiting', 'active', 'ongoing']):
            return 0.6  # Ongoing Trial
        elif 'terminated' in status and 'safety' not in status and 'futility' not in status:
            return 0.3  # Terminated (Other Reasons)
        elif any(word in status for word in ['withdrawn', 'suspended', 'safety', 'futility']):
            return 0.0  # Failed Trial
        else:
            return 0.3  # Default for unknown status

    def calculate_phase_prior(self, trial_data: Dict) -> float:
        """Calculate phase prior score (0-1.2 pts)"""
        phase = str(trial_data.get('phases', '')).upper()
        
        if 'PHASE4' in phase:
            return 1.2  # Phase 4 - Post-marketing
        elif 'PHASE3' in phase:
            return 0.9  # Phase 3 - Pivotal trial
        elif 'PHASE2' in phase:
            return 0.6  # Phase 2 - Efficacy trial
        elif 'PHASE1/2' in phase or 'PHASE12' in phase:
            return 0.3  # Phase 1/2 - Safety + early efficacy
        elif 'PHASE1' in phase:
            return 0.2  # Phase 1 - Safety trial only
        else:
            return 0.1  # Unknown phase

    def calculate_sponsor_track_record(self, trial_data: Dict) -> float:
        """Calculate sponsor track record score (0-0.8 pts)"""
        sponsor = str(trial_data.get('leadSponsor', '')).lower()
        
        # Top-Tier sponsors (0.8 pts)
        top_tier = [
            'pfizer', 'roche', 'novartis', 'merck', 'johnson & johnson', 
            'astrazeneca', 'sanofi', 'eli lilly', 'bristol-myers squibb', 
            'abbvie', 'gilead', 'amgen', 'biogen', 'nih', 'mayo clinic', 
            'stanford', 'harvard', 'johns hopkins'
        ]
        
        # Mid-Tier sponsors (0.5 pts)
        mid_tier_keywords = [
            'university of', 'medical center', 'hospital', 'medical school',
            'research institute', 'foundation', 'association'
        ]
        
        if any(top in sponsor for top in top_tier):
            return 0.8  # Top-Tier
        elif any(keyword in sponsor for keyword in mid_tier_keywords):
            return 0.5  # Mid-Tier
        else:
            return 0.2  # Unknown/New sponsor

    def calculate_study_design_integrity(self, trial_data: Dict) -> float:
        """Calculate study design integrity score (0-0.8 pts)"""
        allocation = str(trial_data.get('allocation', '')).lower()
        masking = str(trial_data.get('masking', '')).lower()
        primary_outcomes = str(trial_data.get('primaryOutcomes', '')).lower()
        
        score = 0.0
        
        # Allocation & Model (0-0.3 pts)
        if 'randomized' in allocation and 'parallel' in allocation:
            score += 0.3  # Randomized parallel design
        elif 'randomized' in allocation:
            score += 0.20  # Other randomized design
        else:
            score += 0.1  # Non-randomized
        
        # Blinding (0-0.2 pts)
        if 'double' in masking or 'triple' in masking:
            score += 0.2  # Double/Triple blinding
        elif 'single' in masking:
            score += 0.10  # Single blinding
        else:
            score += 0.05  # No blinding
        
        # Hard Endpoints (0-0.3 pts)
        hard_endpoints = ['survival', 'death', 'hospitalization', 'mortality']
        if any(endpoint in primary_outcomes for endpoint in hard_endpoints):
            score += 0.3  # Hard endpoints
        else:
            score += 0.1  # Other endpoints
        
        return round(score, 2)

    def calculate_enrollment_fulfillment(self, trial_data: Dict) -> float:
        """Calculate enrollment fulfillment score (0-0.6 pts)"""
        try:
            enrollment = trial_data.get('enrollmentCount', 0)
            if pd.isna(enrollment) or enrollment == 0:
                return 0.1  # Unknown enrollment
            
            enrollment = int(enrollment)
            phase = str(trial_data.get('phases', '')).upper()
            
            # Phase-adjusted minimum requirements
            if 'PHASE1' in phase:
                min_required = 20
            elif 'PHASE2' in phase:
                min_required = 100
            elif 'PHASE3' in phase:
                min_required = 300
            elif 'PHASE4' in phase:
                min_required = 500
            else:
                min_required = 100  # Default for unknown phase
            
            ratio = enrollment / min_required
            
            if ratio >= 1.00:
                return 0.6  # ≥100%
            elif ratio >= 0.75:
                return 0.4  # 75-99%
            elif ratio >= 0.50:
                return 0.2  # 50-74%
            else:
                return 0.1  # <50%
                
        except Exception as e:
            return 0.1  # Default for errors

    def calculate_external_validity(self, trial_data: Dict) -> float:
        """Calculate external validity score (0-0.4 pts)"""
        eligibility = str(trial_data.get('eligibilityCriteria', '')).lower()
        
        score = 0.0
        
        # Age span ≥30 years (0.1 pts)
        age_keywords = ['18-65', '18-75', '18-80', '21-65', '21-75', '21-80']
        if any(age_range in eligibility for age_range in age_keywords):
            score += 0.1
        
        # Both sexes included (0.15 pts)
        if 'both' in eligibility or 'male' in eligibility and 'female' in eligibility:
            score += 0.15
        
        # ≥3 countries/≥10 sites (0.1 pts)
        # Note: Site info not available in current CSV, default to 0
        # score += 0.1  # Would need additional data
        
        # No strict biomarker filter (0.05 pts)
        strict_filters = ['hla', 'genetic', 'biomarker', 'mutation']
        if not any(filter_term in eligibility for filter_term in strict_filters):
            score += 0.05
        
        return round(score, 2)

    def calculate_regulatory_acceleration_bonus(self, trial_data: Dict, outcome_score: float) -> float:
        """Calculate regulatory acceleration bonus (0-0.3 pts)"""
        # Check CSV data first
        interventions = str(trial_data.get('interventions', '')).lower()
        keywords = str(trial_data.get('keywords', '')).lower()
        brief_summary = str(trial_data.get('briefSummary', '')).lower()
        
        score = 0.0
        
        # Breakthrough/Fast-Track/RMAT (0.2 pts)
        breakthrough_keywords = ['breakthrough', 'fast-track', 'rmat', 'regenerative medicine']
        all_text = f"{interventions} {keywords} {brief_summary}"
        if any(keyword in all_text for keyword in breakthrough_keywords):
            score += 0.2
        
        # Orphan Drug (0.1 pts)
        orphan_keywords = ['orphan', 'rare disease', 'orphan drug', 'rare neurological', 'very rare']
        if any(keyword in all_text for keyword in orphan_keywords):
            score += 0.1
        
        return min(score, 0.3)  # Cap at 0.3

    def calculate_data_sharing_bonus(self, trial_data: Dict) -> float:
        """Calculate data sharing bonus (0-0.2 pts)"""
        ipd_sharing = str(trial_data.get('ipdSharing', '')).lower()
        ipd_description = str(trial_data.get('ipdDescription', '')).lower()
        
        # Check for IPD plan present
        if 'yes' in ipd_sharing or 'available' in ipd_sharing or 'plan' in ipd_description:
            return 0.2  # IPD plan present
        else:
            return 0.0  # No IPD plan



    def calculate_termination_penalty(self, trial_data: Dict) -> float:
        """Calculate termination penalty (-1.0 to 0.0) from CSV data"""
        try:
            overall_status = trial_data.get('overallStatus', '').upper()
            
            if overall_status == 'TERMINATED':
                # Check for safety or futility reasons
                trial_text = str(trial_data).lower()
                safety_keywords = ['safety', 'adverse events', 'toxicity', 'harm']
                futility_keywords = ['futility', 'lack of efficacy', 'ineffective']
                
                if any(keyword in trial_text for keyword in safety_keywords + futility_keywords):
                    return -1.0  # Safety or futility termination
                else:
                    return -0.8  # Unknown termination reason
            
            elif overall_status == 'WITHDRAWN':
                return -0.8
            
            elif overall_status == 'SUSPENDED':
                return -0.5
            
            else:
                return 0.0
                
        except Exception as e:
            print(f"Warning: Error calculating termination penalty: {e}")
            return 0.0

    def validate_journal_impact(self, journal_name: str) -> bool:
        """Validate if journal is high-impact"""
        if not journal_name:
            return False
        
        journal_lower = journal_name.lower().strip()
        
        # Check against known high-impact journals
        for high_impact_journal, impact_factor in self.high_impact_journals.items():
            if (high_impact_journal in journal_lower or 
                journal_lower in high_impact_journal or
                journal_lower == high_impact_journal):
                return True
        
        # Check against known non-high-impact journals
        for non_high_journal, impact_factor in self.non_high_impact_journals.items():
            if (non_high_journal in journal_lower or 
                journal_lower in non_high_journal or
                journal_lower == non_high_journal):
                return impact_factor >= 10.0  # Only return True if IF >= 10
        
        # For unknown journals, be conservative
        return False

    def fetch_clinicaltrials_publications(self, nct_id: str) -> List[str]:
        """Fetch publication information from ClinicalTrials.gov v2 API"""
        publications = []
        
        try:
            # ClinicalTrials.gov v2 API endpoint
            url = "https://clinicaltrials.gov/api/v2/studies"
            params = {
                'query.term': nct_id,
                'fields': 'protocolSection.referencesModule,hasResults',
                'format': 'json'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if 'studies' in data and data['studies']:
                study = data['studies'][0]
                
                # Extract publication information from references
                if 'protocolSection' in study and 'referencesModule' in study['protocolSection']:
                    references = study['protocolSection']['referencesModule'].get('references', [])
                    for ref in references:
                        if ref.get('citation'):
                            # Parse citation for journal name
                            journal_name = self.parse_publication_string(ref['citation'])
                            if journal_name:
                                publications.append(journal_name)
            
        except Exception as e:
            # Log the failed API call for later fixing
            self.log_failed_api(
                nct_id=nct_id,
                api_type='clinicaltrials_publications',
                error=str(e),
                details={'url': url, 'params': params}
            )
            print(f"Warning: Error fetching ClinicalTrials.gov data for {nct_id}: {e}")
        
        return publications

    def fetch_pubmed_publications(self, nct_id: str) -> List[str]:
        """Fetch publication information from PubMed"""
        publications = []
        
        try:
            # Add delay to respect PubMed API rate limits
            time.sleep(random.uniform(0.3, 0.5))  # 300-500ms delay
            
            # Search PubMed for publications related to this NCT ID
            url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
            params = {
                'db': 'pubmed',
                'term': f'"{nct_id}"[All Fields]',
                'retmode': 'json',
                'retmax': 10
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if 'esearchresult' in data and 'idlist' in data['esearchresult']:
                pmid_list = data['esearchresult']['idlist']
                
                # Fetch details for each publication
                for pmid in pmid_list[:5]:  # Limit to 5 publications
                    journal_name = self.fetch_pubmed_journal(pmid)
                    if journal_name:
                        publications.append(journal_name)
            
        except Exception as e:
            # Log the failed API call for later fixing
            self.log_failed_api(
                nct_id=nct_id,
                api_type='pubmed_publications',
                error=str(e),
                details={'url': url, 'params': params}
            )
            print(f"Warning: Error fetching PubMed data for {nct_id}: {e}")
        
        return publications

    def fetch_pubmed_journal(self, pmid: str) -> Optional[str]:
        """Fetch journal name from PubMed"""
        try:
            # Add delay to respect PubMed API rate limits
            time.sleep(random.uniform(0.3, 0.5))  # 300-500ms delay
            
            url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
            params = {
                'db': 'pubmed',
                'id': pmid,
                'retmode': 'xml'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            # Parse XML response to extract journal name
            content = response.text.lower()
            
            # Extract journal name
            journal_match = re.search(r'<journal-title>(.*?)</journal-title>', content)
            journal_name = journal_match.group(1) if journal_match else ""
            
            return journal_name if journal_name else None
            
        except Exception as e:
            # Log the failed API call for later fixing
            self.log_failed_api(
                nct_id=f"PMID_{pmid}",  # Use PMID as identifier
                api_type='pubmed_journal',
                error=str(e),
                details={'url': url, 'params': params, 'pmid': pmid}
            )
            print(f"Warning: Error fetching PubMed details for PMID {pmid}: {e}")
            return None

    def parse_publication_string(self, pub_string: str) -> Optional[str]:
        """Parse publication string from ClinicalTrials.gov"""
        try:
            # Skip if it's just a file format like "Epub"
            if pub_string.lower().strip() in ['epub', 'pdf', 'html']:
                return None
            
            # If the string looks like it's already a journal name (no year, no authors, etc.)
            if len(pub_string.split()) <= 5 and not re.search(r'\d{4}', pub_string):
                return pub_string.strip()
            
            # Look for journal name patterns in full citations
            journal_patterns = [
                r'([A-Z][a-z\s&]+)\.\s*\d{4}',  # Journal name followed by period and year (e.g., "Lancet Neurol. 2015")
                r'([A-Z][a-z\s&]+)\s+\d{4}',  # Journal name followed by year
                r'published in\s+([^,]+)',
                r'journal:\s*([^,]+)',
            ]
            
            for pattern in journal_patterns:
                match = re.search(pattern, pub_string, re.IGNORECASE)
                if match:
                    journal_name = match.group(1).strip()
                    # Clean up common suffixes
                    journal_name = re.sub(r'\s+et al\.?', '', journal_name)
                    journal_name = re.sub(r'\s+Epub.*', '', journal_name)
                    journal_name = re.sub(r'\s+doi.*', '', journal_name)
                    journal_name = re.sub(r'\s+\d{4}.*', '', journal_name)  # Remove year and everything after
                    return journal_name.strip()
            
        except Exception as e:
            print(f"Warning: Error parsing publication string: {e}")
        
        return None

    def calculate_high_impact_publication_bonus(self, trial_data: Dict, nct_id: str) -> float:
        """Calculate high-impact publication bonus (0-0.5 pts)"""
        try:
            # Fetch publications from ClinicalTrials.gov
            ct_publications = self.fetch_clinicaltrials_publications(nct_id)
            
            # Fetch publications from PubMed
            pubmed_publications = self.fetch_pubmed_publications(nct_id)
            
            # Combine all publications
            all_publications = ct_publications + pubmed_publications
            
            high_impact_count = 0
            
            for pub in all_publications:
                journal_name = self.parse_publication_string(pub)
                if journal_name and self.validate_journal_impact(journal_name):
                    high_impact_count += 1
            
            # Score based on number of high-impact publications
            if high_impact_count >= 2:
                return 0.5  # ≥2 high-impact publications
            elif high_impact_count == 1:
                return 0.3  # 1 high-impact publication
            else:
                return 0.0  # No high-impact publications
                
        except Exception as e:
            return 0.0  # Default for errors

    def calculate_trial_score(self, nct_id: str) -> Optional[TrialScore]:
        """Calculate complete trial score from CSV data"""
        print(f"Calculating score for {nct_id} from CSV data...")
        
        # Get trial data from CSV
        trial_data = self.get_trial_data(nct_id)
        if not trial_data:
            print(f"Trial {nct_id} not found in CSV data")
            return None
        
        # Calculate all components from CSV data
        outcome_evidence = self.calculate_outcome_evidence(trial_data)
        phase_prior = self.calculate_phase_prior(trial_data)
        sponsor_track_record = self.calculate_sponsor_track_record(trial_data)
        study_design_integrity = self.calculate_study_design_integrity(trial_data)
        enrollment_fulfillment = self.calculate_enrollment_fulfillment(trial_data)
        external_validity = self.calculate_external_validity(trial_data)
        
        # Calculate bonuses
        regulatory_acceleration_bonus = self.calculate_regulatory_acceleration_bonus(trial_data, outcome_evidence)
        high_impact_publication_bonus = self.calculate_high_impact_publication_bonus(trial_data, nct_id)
        data_sharing_bonus = self.calculate_data_sharing_bonus(trial_data)
        
        # Calculate penalty
        termination_penalty = self.calculate_termination_penalty(trial_data)
        
        return TrialScore(
            nct_id=nct_id,
            outcome_evidence=outcome_evidence,
            phase_prior=phase_prior,
            sponsor_track_record=sponsor_track_record,
            study_design_integrity=study_design_integrity,
            enrollment_fulfillment=enrollment_fulfillment,
            external_validity=external_validity,
            regulatory_acceleration_bonus=regulatory_acceleration_bonus,
            high_impact_publication_bonus=high_impact_publication_bonus,
            data_sharing_bonus=data_sharing_bonus,
            termination_penalty=termination_penalty
        )

    def get_failed_api_summary(self):
        """Get summary of failed API calls"""
        if not self.failed_apis:
            return "✅ No failed API calls"
        
        # Group by API type
        api_counts = {}
        for entry in self.failed_apis:
            api_type = entry['api_type']
            api_counts[api_type] = api_counts.get(api_type, 0) + 1
        
        summary = f"⚠️  Failed API calls: {len(self.failed_apis)} total\n"
        for api_type, count in api_counts.items():
            summary += f"  • {api_type}: {count} failures\n"
        
        summary += f"\n📁 Failed APIs saved to: {self.failed_file}"
        return summary

def print_detailed_breakdown(nct_id: str, score: TrialScore):
    """Print detailed breakdown of trial score"""
    print(f"\n{'='*60}")
    print(f"DETAILED BREAKDOWN: {nct_id}")
    print(f"{'='*60}")
    
    print(f"\n📊 BASE COMPONENTS:")
    print(f"  • Outcome Evidence: {score.outcome_evidence:.2f}/1.2")
    print(f"  • Phase Prior: {score.phase_prior:.2f}/1.2")
    print(f"  • Sponsor Track Record: {score.sponsor_track_record:.2f}/0.8")
    print(f"  • Study Design Integrity: {score.study_design_integrity:.2f}/0.8")
    print(f"  • Enrollment Fulfillment: {score.enrollment_fulfillment:.2f}/0.6")
    print(f"  • External Validity: {score.external_validity:.2f}/0.4")
    
    print(f"\n🎯 BONUSES:")
    print(f"  • Regulatory Acceleration: {score.regulatory_acceleration_bonus:.2f}/0.3")
    print(f"  • High-Impact Publication: {score.high_impact_publication_bonus:.2f}/0.5")
    print(f"  • Data Sharing: {score.data_sharing_bonus:.2f}/0.2")
    
    print(f"\n⚠️  PENALTIES:")
    print(f"  • Termination Penalty: {score.termination_penalty:.2f}")
    
    print(f"\n📈 SCORE CALCULATION:")
    print(f"  • Base Score: {score.base_score:.2f}/5.0")
    print(f"  • Total Bonuses: {score.regulatory_acceleration_bonus + score.high_impact_publication_bonus + score.data_sharing_bonus:.2f}")
    print(f"  • Final Score: {score.total_score:.2f}/5.0")
    print(f"  • Interpretation: {score.interpretation}")
    
    print(f"\n{'='*60}")

if __name__ == "__main__":
    scorer = ProperCSVScorer()
    
    # Test studies
    test_studies = [
        'NCT02452723',  # The problematic one
        'NCT01280123',  # Another study
        'NCT03011723',  # Another study
    ]
    
    for nct_id in test_studies:
        score = scorer.calculate_trial_score(nct_id)
        if score:
            print_detailed_breakdown(nct_id, score)
    
    # Show failed API summary
    print(f"\n{'='*60}")
    print("FAILED API SUMMARY")
    print(f"{'='*60}")
    print(scorer.get_failed_api_summary()) 