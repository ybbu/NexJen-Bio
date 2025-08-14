from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from services.data_service import DataService
from services.advanced_analytics_service import AdvancedAnalyticsService
import json
import os
import warnings

# Suppress pandas UserWarnings about regex patterns
warnings.filterwarnings('ignore', category=UserWarning, module='pandas')

router = APIRouter(prefix="/insights", tags=["insights"])

# Initialize services
data_service = DataService()
advanced_analytics_service = AdvancedAnalyticsService()

@router.get("/emerging")
async def get_emerging_technologies(
    condition: Optional[str] = Query(None, description="Filter by condition"),
    phase: Optional[str] = Query(None, description="Filter by phase"),
    country: Optional[str] = Query(None, description="Filter by country"),
    status: Optional[str] = Query(None, description="Filter by status"),
    timeframe: Optional[str] = Query("12m", description="Timeframe: 6m, 12m, 24m")
):
    """Get emerging drug technologies with composite scoring"""
    try:
        # Build filters
        filters = {}
        if condition:
            filters['condition'] = condition
        if phase:
            filters['phase'] = phase
        if country:
            filters['country'] = country
        if status:
            filters['status'] = status
        
        # Get data (use optimized interventional data for quality scores)
        df = data_service.optimized_interventional_df.copy() if data_service.optimized_interventional_df is not None else data_service.df.copy()
        
        # Apply filters
        if filters.get('condition'):
            df = df[df['conditions'].str.contains(filters['condition'], case=False, na=False)]
        if filters.get('phase'):
            df = df[df['phases'].str.contains(filters['phase'], case=False, na=False)]
        if filters.get('country'):
            df = df[df['country'].str.contains(filters['country'], case=False, na=False)]
        if filters.get('status'):
            df = df[df['overallStatus'].str.contains(filters['status'], case=False, na=False)]
        
        # Load MoA dictionary
        moa_dict = load_moa_dictionary()
        
        # Apply MoA tagging to the filtered dataset
        df = apply_moa_tagging(df, moa_dict)
        
        # Calculate emerging technologies with composite scoring
        emerging_data = calculate_emerging_technologies(df, timeframe)
        
        return {
            "emerging_technologies": emerging_data,
            "moa_breakdown": get_moa_breakdown(df),
            "filters_applied": filters
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting emerging technologies: {str(e)}")

@router.get("/opportunities")
async def get_therapeutic_opportunities(
    condition: Optional[str] = Query(None, description="Filter by condition"),
    phase: Optional[str] = Query(None, description="Filter by phase"),
    country: Optional[str] = Query(None, description="Filter by country"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get therapeutic opportunities and whitespace analysis"""
    try:
        # Build filters
        filters = {}
        if condition:
            filters['condition'] = condition
        if phase:
            filters['phase'] = phase
        if country:
            filters['country'] = country
        if status:
            filters['status'] = status
        
        # Get data (use optimized interventional data for quality scores)
        df = data_service.optimized_interventional_df.copy() if data_service.optimized_interventional_df is not None else data_service.df.copy()
        
        # Apply filters
        if filters.get('condition'):
            df = df[df['conditions'].str.contains(filters['condition'], case=False, na=False)]
        if filters.get('phase'):
            df = df[df['phases'].str.contains(filters['phase'], case=False, na=False)]
        if filters.get('country'):
            df = df[df['country'].str.contains(filters['country'], case=False, na=False)]
        if filters.get('status'):
            df = df[df['overallStatus'].str.contains(filters['status'], case=False, na=False)]
        
        # Apply MoA tagging before calculations
        moa_dict = load_moa_dictionary()
        print(f"MoA dictionary loaded with {len(moa_dict)} patterns")
        print(f"Sample interventions data: {df['interventions'].head(3).tolist()}")
        print(f"Interventions column data types: {df['interventions'].dtype}")
        print(f"Interventions column null count: {df['interventions'].isnull().sum()}")
        
        df = apply_moa_tagging(df, moa_dict)
        
        # Debug: Check if MoA tagging worked
        print(f"After MoA tagging - DataFrame shape: {df.shape}")
        print(f"After MoA tagging - Columns: {list(df.columns)}")
        if 'moa' in df.columns:
            print(f"MoA column unique values: {df['moa'].value_counts().head(10).to_dict()}")
        else:
            print("MoA column not found after tagging!")
        
        # Calculate whitespace scores (simplified for now)
        whitespace_data = calculate_whitespace_scores(df)
        
        # Calculate competitive density
        density_data = calculate_competitive_density(df)
        
        # Calculate enrollment feasibility
        feasibility_data = calculate_enrollment_feasibility(df)
        
        return {
            "whitespace": whitespace_data,
            "density": density_data,
            "feasibility": feasibility_data,
            "filters_applied": filters
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting therapeutic opportunities: {str(e)}")

@router.get("/competitive-density")
async def get_competitive_density(
    condition: Optional[str] = Query(None, description="Filter by condition"),
    phase: Optional[str] = Query(None, description="Filter by phase"),
    country: Optional[str] = Query(None, description="Filter by country"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get competitive density analysis with HHI scores"""
    try:
        # Build filters
        filters = {}
        if condition:
            filters['condition'] = condition
        if phase:
            filters['phase'] = phase
        if country:
            filters['country'] = country
        if status:
            filters['status'] = status
        
        # Get data (use optimized interventional data for quality scores)
        df = data_service.optimized_interventional_df.copy() if data_service.optimized_interventional_df is not None else data_service.df.copy()
        
        # Apply filters
        if filters.get('condition'):
            df = df[df['conditions'].str.contains(filters['condition'], case=False, na=False)]
        if filters.get('phase'):
            df = df[df['phases'].str.contains(filters['phase'], case=False, na=False)]
        if filters.get('country'):
            df = df[df['country'].str.contains(filters['country'], case=False, na=False)]
        if filters.get('status'):
            df = df[df['overallStatus'].str.contains(filters['status'], case=False, na=False)]
        
        # Apply MoA tagging before calculations
        moa_dict = load_moa_dictionary()
        df = apply_moa_tagging(df, moa_dict)
        
        # Calculate advanced competitive density
        density_data = advanced_analytics_service.calculate_advanced_competitive_density(df)
        
        return {
            "competitive_density": density_data,
            "filters_applied": filters
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting competitive density: {str(e)}")

@router.get("/strategy")
async def get_strategic_guidance(
    condition: Optional[str] = Query(None, description="Filter by condition"),
    phase: Optional[str] = Query(None, description="Filter by phase"),
    country: Optional[str] = Query(None, description="Filter by country"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get strategic guidance with Now/Next/Watch recommendations"""
    try:
        # Build filters
        filters = {}
        if condition:
            filters['condition'] = condition
        if phase:
            filters['phase'] = phase
        if country:
            filters['country'] = country
        if status:
            filters['status'] = status
        
        # Get data (use optimized interventional data for quality scores)
        df = data_service.optimized_interventional_df.copy() if data_service.optimized_interventional_df is not None else data_service.df.copy()
        
        # Apply filters
        if filters.get('condition'):
            df = df[df['conditions'].str.contains(filters['condition'], case=False, na=False)]
        if filters.get('phase'):
            df = df[df['phases'].str.contains(filters['phase'], case=False, na=False)]
        if filters.get('country'):
            df = df[df['country'].str.contains(filters['country'], case=False, na=False)]
        if filters.get('status'):
            df = df[df['overallStatus'].str.contains(filters['status'], case=False, na=False)]
        
        # Generate strategic recommendations (placeholder for now)
        strategy_data = generate_strategic_recommendations(df)
        
        return {
            "strategy": strategy_data,
            "filters_applied": filters
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting strategic guidance: {str(e)}")

@router.get("/moa-trials")
async def get_moa_trials(
    moa: str = Query(..., description="Mechanism of Action to filter by"),
    condition: Optional[str] = Query(None, description="Filter by condition"),
    phase: Optional[str] = Query(None, description="Filter by phase"),
    country: Optional[str] = Query(None, description="Filter by country"),
    status: Optional[str] = Query(None, description="Filter by status"),
    timeframe: Optional[str] = Query(None, description="Filter by timeframe")
):
    """Get individual trials for a specific MoA"""
    try:
        # Get data (use optimized interventional data for quality scores)
        df = data_service.optimized_interventional_df.copy() if data_service.optimized_interventional_df is not None else data_service.df.copy()
        
        if df.empty:
            return {"trials": []}
        
        # Apply filters
        if condition:
            df = df[df['conditions'].str.contains(condition, case=False, na=False)]
        if phase:
            df = df[df['phases'].str.contains(phase, case=False, na=False)]
        if country:
            df = df[df['country'].str.contains(country, case=False, na=False)]
        if status:
            df = df[df['overallStatus'].str.contains(status, case=False, na=False)]
        
        # Apply MoA tagging
        moa_dict = load_moa_dictionary()
        df = apply_moa_tagging(df, moa_dict)
        
        # Filter by the specific MoA
        moa_trials = df[df['moa'] == moa].copy()
        
        if moa_trials.empty:
            return {"trials": []}
        
        # Convert to list of trial objects
        trials = []
        for _, trial in moa_trials.iterrows():
            trial_data = {
                'nctId': str(trial['nctId']),
                'title': str(trial.get('briefTitle', 'N/A')),
                'condition': str(trial.get('conditions', 'N/A')),
                'phase': str(trial.get('phases', 'N/A')),
                'status': str(trial.get('overallStatus', 'N/A')),
                'startDate': str(trial.get('startDate', 'N/A')),
                'country': str(trial.get('country', 'N/A')),
                'leadSponsor': str(trial.get('leadSponsor', 'N/A')),
                'interventions': str(trial.get('interventions', 'N/A')),
                'modality': str(trial.get('modality', 'Unknown')),
                'target_hint': str(trial.get('target_hint', 'Unknown'))
            }
            
            # Add quality score if available
            if 'total_quality_score' in trial:
                trial_data['quality_score'] = float(trial['total_quality_score'])
            else:
                trial_data['quality_score'] = None
            
            trials.append(trial_data)
        
        # Sort by start date (most recent first)
        def sort_key(trial):
            start_date = trial['startDate']
            if start_date == 'N/A' or not start_date:
                return '1900-01-01'  # Put trials with no date at the end
            try:
                # Try to parse the date
                parsed_date = pd.to_datetime(start_date, errors='coerce')
                if pd.isna(parsed_date):
                    return '1900-01-01'
                return parsed_date.isoformat()
            except:
                return '1900-01-01'
        
        trials.sort(key=sort_key, reverse=True)
        
        # Limit to 10 most recent trials
        trials = trials[:10]
        
        return {"trials": trials}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching MoA trials: {str(e)}")

def load_moa_dictionary():
    """Load MoA dictionary from CSV or use default"""
    try:
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        moa_path = os.path.join(current_dir, "..", "..", "data", "dicts", "intervention_to_moa.csv")
        
        if os.path.exists(moa_path):
            df = pd.read_csv(moa_path)
            moa_dict = []
            for _, row in df.iterrows():
                moa_dict.append({
                    "pattern": row['pattern'],
                    "moa": row['moa'],
                    "modality": row['modality'],
                    "target_hint": row.get('target_hint', '')
                })
            return moa_dict
        else:
            # Return default comprehensive MoA dictionary
            return [
                # Existing patterns
                {"pattern": r"(?i)\b(?:lrrk2|dnl201|dnl151)\b", "moa": "LRRK2 Kinase Inhibition", "modality": "Small molecule", "target_hint": "LRRK2"},
                {"pattern": r"(?i)\b(?:dbs|deep brain stimulation|neurostimulation)\b", "moa": "Neuromodulation", "modality": "Device", "target_hint": "Brain"},
                {"pattern": r"(?i)\b(?:focused ultrasound|mrifus|insightec)\b", "moa": "Focused Ultrasound", "modality": "Device", "target_hint": "Brain"},
                {"pattern": r"(?i)\b(?:tms|transcranial magnetic stimulation)\b", "moa": "Transcranial Magnetic Stimulation", "modality": "Device", "target_hint": "Brain"},
                {"pattern": r"(?i)\b(?:spinal cord stimulation|scs)\b", "moa": "Spinal Cord Stimulation", "modality": "Device", "target_hint": "Spinal Cord"},
                {"pattern": r"(?i)\b(?:drug delivery device|implantable|pump)\b", "moa": "Drug Delivery Device", "modality": "Device", "target_hint": "Multiple"},
                {"pattern": r"(?i)\b(?:neuromodulation|neurostimulation|brain pacemaker)\b", "moa": "Neuromodulation", "modality": "Device", "target_hint": "Brain"},
                
                # NEW: Comprehensive Drug Classes
                {"pattern": r"(?i)\b(?:levodopa|ldopa|carbidopa|sinemet|madopar|stalevo)\b", "moa": "Dopamine Precursor Replenishment", "modality": "Small molecule", "target_hint": "Dopamine synthesis"},
                {"pattern": r"(?i)\b(?:pramipexole|ropinirole|rotigotine|apomorphine|bromocriptine|pergolide)\b", "moa": "Dopamine Receptor Agonism", "modality": "Small molecule", "target_hint": "D1/D2 receptors"},
                {"pattern": r"(?i)\b(?:selegiline|rasagiline|safinamide|zydis selegiline)\b", "moa": "MAO-B Inhibition", "modality": "Small molecule", "target_hint": "MAO-B"},
                {"pattern": r"(?i)\b(?:entacapone|tolcapone|opicapone)\b", "moa": "COMT Inhibition", "modality": "Small molecule", "target_hint": "COMT"},
                {"pattern": r"(?i)\b(?:amantadine|memantine|riluzole)\b", "moa": "NMDA Antagonism", "modality": "Small molecule", "target_hint": "NMDA receptor"},
                {"pattern": r"(?i)\b(?:donepezil|rivastigmine|galantamine|tacrine)\b", "moa": "Acetylcholinesterase Inhibition", "modality": "Small molecule", "target_hint": "AChE"},
                
                # NEW: Advanced Drug Classes
                {"pattern": r"(?i)\b(?:kinase inhibitor|tyrosine kinase|serine threonine kinase)\b", "moa": "Kinase Inhibition", "modality": "Small molecule", "target_hint": "Multiple kinases"},
                {"pattern": r"(?i)\b(?:antibody|mab|monoclonal|immunoglobulin)\b", "moa": "Monoclonal Antibody", "modality": "Biologic", "target_hint": "Specific antigens"},
                {"pattern": r"(?i)\b(?:gene therapy|gene transfer|viral vector|lentivirus|adenovirus)\b", "moa": "Gene Therapy", "modality": "Gene therapy", "target_hint": "DNA/RNA delivery"},
                {"pattern": r"(?i)\b(?:cell therapy|stem cell|mesenchymal|neural progenitor)\b", "moa": "Cell Therapy", "modality": "Cell therapy", "target_hint": "Stem cells"},
                {"pattern": r"(?i)\b(?:protein|peptide|recombinant|growth factor)\b", "moa": "Protein Therapy", "modality": "Biologic", "target_hint": "Growth factors"},
                
                # NEW: Specific Target Classes
                {"pattern": r"(?i)\b(?:alpha synuclein|α-synuclein|synuclein|asyn)\b", "moa": "Alpha-Synuclein Targeting", "modality": "Multiple", "target_hint": "α-synuclein"},
                {"pattern": r"(?i)\b(?:tau|microtubule|neurofibrillary)\b", "moa": "Tau Protein Targeting", "modality": "Multiple", "target_hint": "Tau protein"},
                {"pattern": r"(?i)\b(?:gba|glucocerebrosidase|glucosylceramidase)\b", "moa": "GBA Enzyme Enhancement", "modality": "Multiple", "target_hint": "GBA"},
                {"pattern": r"(?i)\b(?:parkin|park2|ubiquitin ligase)\b", "moa": "Parkin Pathway", "modality": "Multiple", "target_hint": "Parkin"},
                {"pattern": r"(?i)\b(?:pink1|pten induced kinase)\b", "moa": "PINK1 Pathway", "modality": "Multiple", "target_hint": "PINK1"},
                
                # NEW: Anti-inflammatory & Neuroprotective
                {"pattern": r"(?i)\b(?:anti inflammatory|antiinflammatory|steroid|corticosteroid)\b", "moa": "Anti-inflammatory", "modality": "Multiple", "target_hint": "Inflammation"},
                {"pattern": r"(?i)\b(?:antioxidant|oxidative stress|free radical|ros)\b", "moa": "Antioxidant", "modality": "Multiple", "target_hint": "Oxidative stress"},
                {"pattern": r"(?i)\b(?:neuroprotective|neuroprotection|neurotrophic|bdnf|ngf)\b", "moa": "Neurotrophic Factor", "modality": "Multiple", "target_hint": "Growth factors"},
                
                # NEW: Receptor Modulators
                {"pattern": r"(?i)\b(?:adenosine|a2a receptor|istradefylline|preladenant)\b", "moa": "Adenosine Receptor Modulation", "modality": "Small molecule", "target_hint": "A2A receptor"},
                {"pattern": r"(?i)\b(?:glutamate|mglur|metabotropic glutamate|ampar)\b", "moa": "Glutamate Receptor Modulation", "modality": "Small molecule", "target_hint": "Glutamate receptors"},
                {"pattern": r"(?i)\b(?:serotonin|5-ht|5ht|ssri|sri)\b", "moa": "Serotonin Modulation", "modality": "Small molecule", "target_hint": "Serotonin"},
                
                # NEW: Ion Channel Modulators
                {"pattern": r"(?i)\b(?:calcium channel|ca2\\+|voltage gated|ion channel)\b", "moa": "Ion Channel Modulation", "modality": "Small molecule", "target_hint": "Ion channels"},
                {"pattern": r"(?i)\b(?:sodium channel|na\\+|nav|voltage dependent)\b", "moa": "Sodium Channel Modulation", "modality": "Small molecule", "target_hint": "Sodium channels"},
                {"pattern": r"(?i)\b(?:potassium channel|k\\+|kv|kca|atp sensitive)\b", "moa": "Potassium Channel Modulation", "modality": "Small molecule", "target_hint": "Potassium channels"},
                
                # NEW: Enzyme Inhibitors
                {"pattern": r"(?i)\b(?:protease inhibitor|protease|cathepsin|calpain)\b", "moa": "Protease Inhibition", "modality": "Small molecule", "target_hint": "Proteases"},
                {"pattern": r"(?i)\b(?:phosphodiesterase|pde inhibitor|pde4|pde5)\b", "moa": "Phosphodiesterase Inhibition", "modality": "Small molecule", "target_hint": "PDE enzymes"},
                {"pattern": r"(?i)\b(?:histone deacetylase|hdac inhibitor|hdac)\b", "moa": "HDAC Inhibition", "modality": "Small molecule", "target_hint": "HDAC"},
                
                # NEW: Common Generic Patterns
                {"pattern": r"(?i)\b(?:placebo|saline|vehicle|control)\b", "moa": "Control/Placebo", "modality": "Control", "target_hint": "No active drug"},
                {"pattern": r"(?i)\b(?:standard of care|soc|best supportive care|bsc)\b", "moa": "Standard of Care", "modality": "Standard", "target_hint": "Current treatment"},
                {"pattern": r"(?i)\b(?:investigational|experimental|novel|new)\b", "moa": "Investigational Drug", "modality": "Investigational", "target_hint": "Experimental"},
                
                # NEW: Device & Procedure Patterns
                {"pattern": r"(?i)\b(?:surgery|surgical|procedure|operation)\b", "moa": "Surgical Procedure", "modality": "Procedure", "target_hint": "Surgical intervention"},
                {"pattern": r"(?i)\b(?:exercise|physical therapy|rehabilitation|training)\b", "moa": "Physical Therapy", "modality": "Therapy", "target_hint": "Physical intervention"},
                {"pattern": r"(?i)\b(?:diet|nutrition|supplement|vitamin|mineral)\b", "moa": "Nutritional Intervention", "modality": "Nutritional", "target_hint": "Dietary"},
                
                # NEW: Behavioral & Psychological
                {"pattern": r"(?i)\b(?:cognitive therapy|cbt|psychotherapy|counseling)\b", "moa": "Behavioral Therapy", "modality": "Therapy", "target_hint": "Mind-body"},
                {"pattern": r"(?i)\b(?:meditation|mindfulness|yoga|relaxation)\b", "moa": "Mind-Body Therapy", "modality": "Therapy", "target_hint": "Mind-body"},
                
                # NEW: Diagnostic & Imaging
                {"pattern": r"(?i)\b(?:imaging|mri|pet|spect|ct scan|ultrasound)\b", "moa": "Diagnostic Imaging", "modality": "Diagnostic", "target_hint": "Imaging"},
                {"pattern": r"(?i)\b(?:biomarker|blood test|urine test|spinal tap)\b", "moa": "Biomarker Assessment", "modality": "Diagnostic", "target_hint": "Biomarkers"},
                
                # NEW: More Specific Drug Patterns
                {"pattern": r"(?i)\b(?:dnl|denali|lrrk2 inhibitor)\b", "moa": "LRRK2 Kinase Inhibition", "modality": "Small molecule", "target_hint": "LRRK2"},
                {"pattern": r"(?i)\b(?:bii|biib|biogen|bms|bristol|merck|pfizer|roche|novartis|astrazeneca|gsk|glaxo|sanofi|takeda|daiichi|bayer|boehringer|eli lilly|johnson|janssen)\b", "moa": "Pharmaceutical Drug", "modality": "Small molecule", "target_hint": "Pharma pipeline"},
                {"pattern": r"(?i)\b(?:vaccine|immunization|immunotherapy)\b", "moa": "Immunotherapy", "modality": "Biologic", "target_hint": "Immune system"},
                {"pattern": r"(?i)\b(?:hormone|endocrine|thyroid|insulin|glucagon)\b", "moa": "Hormone Therapy", "modality": "Hormone", "target_hint": "Endocrine system"},
                {"pattern": r"(?i)\b(?:vitamin|mineral|nutrient|amino acid|fatty acid)\b", "moa": "Nutritional Supplement", "modality": "Supplement", "target_hint": "Nutrition"},
                {"pattern": r"(?i)\b(?:herb|botanical|plant|natural|traditional)\b", "moa": "Botanical Medicine", "modality": "Natural product", "target_hint": "Plant extracts"},
                {"pattern": r"(?i)\b(?:probiotic|microbiome|gut|intestinal)\b", "moa": "Microbiome Therapy", "modality": "Biological", "target_hint": "Gut bacteria"},
                {"pattern": r"(?i)\b(?:crispr|cas9|gene editing|genome editing)\b", "moa": "Gene Editing", "modality": "Gene editing", "target_hint": "DNA modification"},
                {"pattern": r"(?i)\b(?:rna|sirna|mirna|antisense|oligonucleotide)\b", "moa": "RNA Therapy", "modality": "RNA", "target_hint": "RNA molecules"},
                {"pattern": r"(?i)\b(?:nanoparticle|nano|micelle|liposome|polymer)\b", "moa": "Nanoparticle Delivery", "modality": "Nanotechnology", "target_hint": "Drug delivery"},
                {"pattern": r"(?i)\b(?:photodynamic|light therapy|laser|irradiation)\b", "moa": "Photodynamic Therapy", "modality": "Light-based", "target_hint": "Light activation"},
                {"pattern": r"(?i)\b(?:thermal|heat|hyperthermia|cryotherapy)\b", "moa": "Thermal Therapy", "modality": "Temperature-based", "target_hint": "Temperature control"},
                {"pattern": r"(?i)\b(?:electromagnetic|emf|radiofrequency|microwave)\b", "moa": "Electromagnetic Therapy", "modality": "EM field", "target_hint": "EM radiation"},
                {"pattern": r"(?i)\b(?:acoustic|sound|ultrasound|sonoporation)\b", "moa": "Acoustic Therapy", "modality": "Sound-based", "target_hint": "Sound waves"},
                {"pattern": r"(?i)\b(?:magnetic|magnet|magnetic field|magnetic resonance)\b", "moa": "Magnetic Therapy", "modality": "Magnetic", "target_hint": "Magnetic fields"},
                {"pattern": r"(?i)\b(?:electrical|current|voltage|electrode|stimulation)\b", "moa": "Electrical Stimulation", "modality": "Electrical", "target_hint": "Electrical current"},
                {"pattern": r"(?i)\b(?:mechanical|pressure|force|compression|tension)\b", "moa": "Mechanical Therapy", "modality": "Mechanical", "target_hint": "Physical forces"},
                {"pattern": r"(?i)\b(?:chemical|reaction|catalyst|enzyme|substrate)\b", "moa": "Chemical Reaction", "modality": "Chemical", "target_hint": "Chemical processes"},
                {"pattern": r"(?i)\b(?:biological|organism|cell|tissue|organ)\b", "moa": "Biological Therapy", "modality": "Biological", "target_hint": "Living systems"},
                {"pattern": r"(?i)\b(?:psychological|mental|cognitive|behavioral|emotional)\b", "moa": "Psychological Therapy", "modality": "Psychological", "target_hint": "Mental processes"},
                {"pattern": r"(?i)\b(?:social|community|group|family|relationship)\b", "moa": "Social Therapy", "modality": "Social", "target_hint": "Social interactions"},
                {"pattern": r"(?i)\b(?:environmental|ecological|natural|outdoor|wilderness)\b", "moa": "Environmental Therapy", "modality": "Environmental", "target_hint": "Natural environment"},
                {"pattern": r"(?i)\b(?:spiritual|religious|faith|meditation|mindfulness)\b", "moa": "Spiritual Therapy", "modality": "Spiritual", "target_hint": "Spiritual practices"},
                {"pattern": r"(?i)\b(?:art|music|dance|drama|creative)\b", "moa": "Creative Arts Therapy", "modality": "Creative", "target_hint": "Artistic expression"},
                {"pattern": r"(?i)\b(?:animal|pet|equine|canine|feline)\b", "moa": "Animal-Assisted Therapy", "modality": "Animal", "target_hint": "Animal interaction"},
                {"pattern": r"(?i)\b(?:water|aquatic|hydrotherapy|swimming|pool)\b", "moa": "Aquatic Therapy", "modality": "Aquatic", "target_hint": "Water-based"},
                {"pattern": r"(?i)\b(?:air|oxygen|ozone|aerosol|inhalation)\b", "moa": "Respiratory Therapy", "modality": "Respiratory", "target_hint": "Air/oxygen"},
                {"pattern": r"(?i)\b(?:food|diet|nutrition|meal|feeding)\b", "moa": "Nutritional Therapy", "modality": "Nutritional", "target_hint": "Food/nutrition"},
                {"pattern": r"(?i)\b(?:sleep|rest|relaxation|recovery|regeneration)\b", "moa": "Restorative Therapy", "modality": "Restorative", "target_hint": "Rest/recovery"},
                {"pattern": r"(?i)\b(?:movement|motion|exercise|activity|fitness)\b", "moa": "Movement Therapy", "modality": "Movement", "target_hint": "Physical activity"},
                {"pattern": r"(?i)\b(?:touch|massage|manipulation|adjustment|alignment)\b", "moa": "Manual Therapy", "modality": "Manual", "target_hint": "Physical touch"},
                {"pattern": r"(?i)\b(?:vision|visual|eye|sight|optical)\b", "moa": "Visual Therapy", "modality": "Visual", "target_hint": "Vision/eyes"},
                {"pattern": r"(?i)\b(?:hearing|auditory|ear|sound|acoustic)\b", "moa": "Auditory Therapy", "modality": "Auditory", "target_hint": "Hearing/ears"},
                {"pattern": r"(?i)\b(?:smell|olfactory|nose|scent|aroma)\b", "moa": "Olfactory Therapy", "modality": "Olfactory", "target_hint": "Smell/nose"},
                {"pattern": r"(?i)\b(?:taste|gustatory|tongue|flavor|palate)\b", "moa": "Gustatory Therapy", "modality": "Gustatory", "target_hint": "Taste/tongue"},
                {"pattern": r"(?i)\b(?:balance|equilibrium|vestibular|coordination|proprioception)\b", "moa": "Balance Therapy", "modality": "Balance", "target_hint": "Balance/coordination"}
            ]
    except Exception as e:
        print(f"Error loading MoA dictionary: {e}")
        return []

def apply_moa_tagging(df, moa_dict):
    """Apply MoA tagging to the dataframe using multiple data sources"""
    # Create new columns
    df['moa'] = 'Unknown'
    df['modality'] = 'Unknown'
    df['target_hint'] = 'Unknown'
    
    # First pass: Direct intervention matching with priority ordering
    # Sort patterns by specificity (more specific patterns first)
    sorted_patterns = sorted(moa_dict, key=lambda x: len(x['pattern']), reverse=True)
    
    for pattern_info in sorted_patterns:
        pattern = pattern_info['pattern']
        try:
            # Only apply if the trial doesn't already have a MoA assigned
            mask = (df['interventions'].str.contains(pattern, regex=True, case=False, na=False) & 
                   (df['moa'] == 'Unknown'))
            
            if mask.any():
                df.loc[mask, 'moa'] = pattern_info['moa']
                df.loc[mask, 'modality'] = pattern_info['modality']
                df.loc[mask, 'target_hint'] = pattern_info['target_hint']
        except Exception as e:
            print(f"Error applying pattern {pattern}: {e}")
    
    # Second pass: Use trial descriptions and context for inference
    df = infer_moa_from_context(df)
    
    # Third pass: Clean up any remaining generic or misleading labels
    # Replace any overly broad labels with "Unknown" to maintain quality
    generic_labels = [
        'Parkinson\'s Disease Therapy', 'Advanced Phase Therapy', 'US-Regulated Therapy',
        'Active Recruitment Therapy', 'Phase 2+ targets', 'Currently recruiting'
    ]
    
    for label in generic_labels:
        df.loc[df['moa'] == label, 'moa'] = 'Unknown'
        df.loc[df['moa'] == label, 'modality'] = 'Unknown'
        df.loc[df['moa'] == label, 'target_hint'] = 'Unknown'
    
    return df

def infer_moa_from_context(df):
    """Infer MoA from trial context when direct matching fails - smarter approach"""
    
    # Only create labels when we can reasonably infer the actual mechanism
    
    # 1. Infer from trial descriptions when interventions are vague
    for idx, row in df.iterrows():
        if row['moa'] == 'Unknown':
            title_a = str(row.get('briefTitle') or '')
            title_b = str(row.get('officialTitle') or '')
            description = (title_a + ' ' + title_b).lower()
            interventions = str(row.get('interventions', '') or '').lower()
            
            # Look for specific mechanistic clues in descriptions
            if any(word in description for word in ['kinase', 'inhibitor', 'blocker']):
                if 'tyrosine' in description or 'tyk' in description:
                    df.loc[idx, 'moa'] = 'Tyrosine Kinase Inhibition'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'Tyrosine kinases'
                elif 'serine' in description or 'ser' in description:
                    df.loc[idx, 'moa'] = 'Serine/Threonine Kinase Inhibition'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'Ser/Thr kinases'
                else:
                    df.loc[idx, 'moa'] = 'Kinase Inhibition'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'Multiple kinases'
            
            elif any(word in description for word in ['antibody', 'mab', 'monoclonal']):
                df.loc[idx, 'moa'] = 'Monoclonal Antibody'
                df.loc[idx, 'modality'] = 'Biologic'
                df.loc[idx, 'target_hint'] = 'Specific antigens'
            
            elif any(word in description for word in ['gene', 'dna', 'rna', 'vector']):
                df.loc[idx, 'moa'] = 'Gene Therapy'
                df.loc[idx, 'modality'] = 'Gene therapy'
                df.loc[idx, 'target_hint'] = 'DNA/RNA delivery'
            
            elif any(word in description for word in ['stem cell', 'mesenchymal', 'neural']):
                df.loc[idx, 'moa'] = 'Cell Therapy'
                df.loc[idx, 'modality'] = 'Cell therapy'
                df.loc[idx, 'target_hint'] = 'Stem cells'
            
            elif any(word in description for word in ['protein', 'peptide', 'growth factor']):
                df.loc[idx, 'moa'] = 'Protein Therapy'
                df.loc[idx, 'modality'] = 'Biologic'
                df.loc[idx, 'target_hint'] = 'Growth factors'
            
            elif any(word in description for word in ['receptor', 'agonist', 'antagonist']):
                if 'dopamine' in description:
                    df.loc[idx, 'moa'] = 'Dopamine Receptor Modulation'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'D1/D2 receptors'
                elif 'serotonin' in description or '5-ht' in description:
                    df.loc[idx, 'moa'] = 'Serotonin Receptor Modulation'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = '5-HT receptors'
                elif 'glutamate' in description:
                    df.loc[idx, 'moa'] = 'Glutamate Receptor Modulation'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'Glutamate receptors'
                else:
                    df.loc[idx, 'moa'] = 'Receptor Modulation'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'Multiple receptors'
            
            elif any(word in description for word in ['enzyme', 'inhibitor', 'blocker']):
                if 'mao' in description or 'monoamine oxidase' in description:
                    df.loc[idx, 'moa'] = 'MAO Inhibition'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'MAO enzymes'
                elif 'comt' in description or 'catechol' in description:
                    df.loc[idx, 'moa'] = 'COMT Inhibition'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'COMT enzyme'
                elif 'acetylcholinesterase' in description or 'ache' in description:
                    df.loc[idx, 'moa'] = 'Acetylcholinesterase Inhibition'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'AChE enzyme'
                else:
                    df.loc[idx, 'moa'] = 'Enzyme Inhibition'
                    df.loc[idx, 'modality'] = 'Small molecule'
                    df.loc[idx, 'target_hint'] = 'Multiple enzymes'
            
            elif any(word in description for word in ['ion channel', 'calcium', 'sodium', 'potassium']):
                df.loc[idx, 'moa'] = 'Ion Channel Modulation'
                df.loc[idx, 'modality'] = 'Small molecule'
                df.loc[idx, 'target_hint'] = 'Ion channels'
            
            elif any(word in description for word in ['anti-inflammatory', 'steroid', 'corticosteroid']):
                df.loc[idx, 'moa'] = 'Anti-inflammatory'
                df.loc[idx, 'modality'] = 'Multiple'
                df.loc[idx, 'target_hint'] = 'Inflammation'
            
            elif any(word in description for word in ['antioxidant', 'oxidative', 'free radical']):
                df.loc[idx, 'moa'] = 'Antioxidant'
                df.loc[idx, 'modality'] = 'Multiple'
                df.loc[idx, 'target_hint'] = 'Oxidative stress'
            
            elif any(word in description for word in ['neuroprotective', 'neurotrophic', 'bdnf', 'ngf']):
                df.loc[idx, 'moa'] = 'Neurotrophic Factor'
                df.loc[idx, 'modality'] = 'Multiple'
                df.loc[idx, 'target_hint'] = 'Growth factors'
    
    # 2. Infer from sponsor types only for academic research (keep this one)
    academic_mask = df['leadSponsor'].str.contains('university|college|institute|medical center|hospital', case=False, na=False)
    df.loc[academic_mask & (df['moa'] == 'Unknown'), 'moa'] = 'Academic Research'
    df.loc[academic_mask & (df['moa'] == 'Unknown'), 'modality'] = 'Research'
    df.loc[academic_mask & (df['moa'] == 'Unknown'), 'target_hint'] = 'Academic research'
    
    # 3. Look for device patterns in descriptions
    for idx, row in df.iterrows():
        if row['moa'] == 'Unknown':
            title_a = str(row.get('briefTitle') or '')
            title_b = str(row.get('officialTitle') or '')
            description = (title_a + ' ' + title_b).lower()
            
            if any(word in description for word in ['stimulation', 'stimulator', 'pacemaker']):
                if 'brain' in description or 'deep brain' in description:
                    df.loc[idx, 'moa'] = 'Deep Brain Stimulation'
                    df.loc[idx, 'modality'] = 'Device'
                    df.loc[idx, 'target_hint'] = 'Brain'
                elif 'spinal' in description or 'cord' in description:
                    df.loc[idx, 'moa'] = 'Spinal Cord Stimulation'
                    df.loc[idx, 'modality'] = 'Device'
                    df.loc[idx, 'target_hint'] = 'Spinal cord'
                else:
                    df.loc[idx, 'moa'] = 'Neuromodulation'
                    df.loc[idx, 'modality'] = 'Device'
                    df.loc[idx, 'target_hint'] = 'Nervous system'
            
            elif any(word in description for word in ['ultrasound', 'mrifus', 'insightec']):
                df.loc[idx, 'moa'] = 'Focused Ultrasound'
                df.loc[idx, 'modality'] = 'Device'
                df.loc[idx, 'target_hint'] = 'Brain'
            
            elif any(word in description for word in ['magnetic', 'tms', 'transcranial']):
                df.loc[idx, 'moa'] = 'Transcranial Magnetic Stimulation'
                df.loc[idx, 'modality'] = 'Device'
                df.loc[idx, 'target_hint'] = 'Brain'
    
    return df

def calculate_emerging_technologies(df, timeframe):
    """Calculate emerging technologies with composite scoring"""
    try:
        # Check if MoA columns exist
        if 'moa' not in df.columns:
            return []
        
        # Convert dates
        df['startDate'] = pd.to_datetime(df['startDate'], errors='coerce')
        
        # Filter for active trials only (exclude terminated/suspended/withdrawn)
        active_statuses = ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'NOT_YET_RECRUITING', 'ENROLLING_BY_INVITATION']
        df_filtered = df[df['overallStatus'].isin(active_statuses)].copy()
        
        # Group by quarter and MoA for momentum calculation
        df_filtered['quarter'] = df_filtered['startDate'].dt.to_period('Q')
        
        # Calculate emerging technologies for each MoA
        emerging_data = []
        
        for moa in df_filtered['moa'].unique():
            if moa == 'Unknown':
                continue
                
            moa_data = df_filtered[df_filtered['moa'] == moa]
            
            # Skip if not enough trials
            if len(moa_data) < 1:  # Reduced from 2 to 1
                continue
            
            # Calculate momentum metrics
            quarterly_counts = moa_data.groupby('quarter').size().reset_index(name='trial_count')
            
            if len(quarterly_counts) < 1:  # Reduced from 2 to 1
                continue
                
            recent_count = int(quarterly_counts.iloc[-1]['trial_count'])
            previous_count = int(quarterly_counts.iloc[-2]['trial_count']) if len(quarterly_counts) >= 2 else recent_count
            delta_3m = recent_count - previous_count
            
            # Calculate CAGR if we have enough data
            cagr_12m = None
            if len(quarterly_counts) >= 4:
                first_count = int(quarterly_counts.iloc[0]['trial_count'])
                periods = len(quarterly_counts)
                if first_count >= 2:
                    cagr_12m = ((recent_count / first_count) ** (1/periods) - 1) * 100
            
            # Calculate quality metrics
            quality_column = 'total_quality_score' if 'total_quality_score' in moa_data.columns else 'nctId'
            if quality_column == 'total_quality_score':
                median_quality_score = float(moa_data[quality_column].median())
                avg_quality_score = float(moa_data[quality_column].mean())
            else:
                median_quality_score = 3.0  # Default quality for trials without scores
                avg_quality_score = 3.0
            
            # Calculate novelty score (placeholder - would integrate with patent data)
            # For now, use a simple heuristic based on trial recency and diversity
            recent_trials = moa_data[moa_data['startDate'] >= (datetime.now() - timedelta(days=365))]
            novelty_score = min(1.0, len(recent_trials) / max(1, len(moa_data)) * 2)  # 0-1 scale
            
            # Calculate phase weighting - more sophisticated scoring
            phase_weighted_momentum = 1.0
            if 'phases' in moa_data.columns:
                # Count trials by phase
                phase_counts = {}
                for phase in ['1', '2', '3', '4']:
                    phase_mask = moa_data['phases'].str.contains(phase, regex=True, na=False)
                    phase_counts[f'phase_{phase}'] = int(phase_mask.sum())
                
                # Calculate phase-weighted score
                # Phase 1: weight 1.0, Phase 2: weight 1.2, Phase 3: weight 1.5, Phase 4: weight 1.8
                phase_weights = {'phase_1': 1.0, 'phase_2': 1.2, 'phase_3': 1.5, 'phase_4': 1.8}
                weighted_trials = sum(phase_counts.get(phase, 0) * weight for phase, weight in phase_weights.items())
                total_trials = sum(phase_counts.values())
                
                if total_trials > 0:
                    phase_weighted_momentum = weighted_trials / total_trials
            
            # Calculate composite Emerging Score
            # Normalize momentum (0-1 scale)
            max_delta = max(abs(delta_3m), 10)  # Normalize to reasonable range
            normalized_momentum = min(1.0, (delta_3m + max_delta) / (2 * max_delta))
            
            # Normalize quality (0-1 scale)
            normalized_quality = min(1.0, median_quality_score / 5.0)
            
            # Emerging Score calculation
            emerging_score = (
                0.4 * normalized_momentum +
                0.3 * normalized_quality +
                0.3 * novelty_score
            ) * phase_weighted_momentum
            
            # Only include if meets quality and growth criteria
            if (median_quality_score >= 1.5 and  # Reduced from 2.0 to 1.5
                (delta_3m > -5 or (cagr_12m is not None and cagr_12m > -20))):  # Allow more negative growth
                
                # Get leading target genes (placeholder)
                target_genes = "LRRK2, GBA, SNCA" if "kinase" in moa.lower() else "Multiple targets"
                
                # Convert quarterly trend data
                quarterly_trend = []
                for _, q_row in quarterly_counts.iterrows():
                    quarterly_trend.append({
                        'quarter': str(q_row['quarter']),
                        'trial_count': int(q_row['trial_count'])
                    })
                
                emerging_data.append({
                    'moa': str(moa),
                    'modality': str(moa_data['modality'].iloc[0]),
                    'emerging_score': round(float(emerging_score), 3),
                    'delta_3m': delta_3m,
                    'cagr_12m': float(cagr_12m) if cagr_12m is not None else None,
                    'median_quality_score': round(median_quality_score, 2),
                    'novelty_score': round(novelty_score, 2),
                    'trial_count': len(moa_data),
                    'target_genes': target_genes,
                    'quarterly_trend': quarterly_trend,
                    'phase_weighted_momentum': round(phase_weighted_momentum, 2)
                })
        
        # Sort by emerging score (highest first)
        emerging_data.sort(key=lambda x: x['emerging_score'], reverse=True)
        
        return emerging_data
        
    except Exception as e:
        print(f"Error calculating emerging technologies: {e}")
        return []

def get_moa_breakdown(df):
    """Get breakdown of trials by MoA and modality"""
    try:
        # Check if MoA columns exist
        if 'moa' not in df.columns:
            print("MoA columns not found, returning empty breakdown")
            return []
        
        # Check if total_quality_score column exists, use alternative if not
        quality_column = 'total_quality_score' if 'total_quality_score' in df.columns else 'nctId'
        
        moa_breakdown = df.groupby(['moa', 'modality']).agg({
            'nctId': 'count',
            quality_column: 'mean' if quality_column == 'total_quality_score' else 'count'
        }).reset_index()
        
        moa_breakdown.columns = ['moa', 'modality', 'trial_count', 'avg_quality_score']
        
        # Convert numpy types to Python native types for JSON serialization
        moa_breakdown['trial_count'] = moa_breakdown['trial_count'].astype(int)
        if quality_column == 'total_quality_score':
            moa_breakdown['avg_quality_score'] = moa_breakdown['avg_quality_score'].astype(float)
        else:
            moa_breakdown['avg_quality_score'] = moa_breakdown['avg_quality_score'].astype(int)
        
        # Sort by trial count descending, but put Unknown at the bottom
        moa_breakdown['is_unknown'] = moa_breakdown['moa'] == 'Unknown'
        moa_breakdown = moa_breakdown.sort_values(['is_unknown', 'trial_count'], ascending=[True, False])
        
        # Convert to list of dictionaries with native Python types
        result = []
        for _, row in moa_breakdown.iterrows():
            result.append({
                'moa': str(row['moa']),
                'modality': str(row['modality']),
                'trial_count': int(row['trial_count']),
                'avg_quality_score': float(row['avg_quality_score']) if not pd.isna(row['avg_quality_score']) else 0.0
            })
        
        return result
        
    except Exception as e:
        print(f"Error getting MoA breakdown: {e}")
        return []

def calculate_whitespace_scores(df):
    """Calculate whitespace scores based on burden vs activity"""
    try:
        # Group by condition and country
        activity_data = df.groupby(['conditions', 'country']).agg({
            'nctId': 'count',
            'total_quality_score': 'mean' if 'total_quality_score' in df.columns else 'count'
        }).reset_index()
        
        activity_data.columns = ['condition', 'country', 'trial_count', 'avg_quality_score']
        
        # Enhanced burden data with population estimates
        burden_data = {
            "Parkinson's Disease": {
                "United States": {"prevalence": 0.3, "daly": 0.8, "population_100k": 3300},
                "Europe": {"prevalence": 0.25, "daly": 0.7, "population_100k": 4500},
                "Asia": {"prevalence": 0.2, "daly": 0.6, "population_100k": 12000},
                "Canada": {"prevalence": 0.28, "daly": 0.75, "population_100k": 380},
                "Australia": {"prevalence": 0.22, "daly": 0.65, "population_100k": 250},
                "United Kingdom": {"prevalence": 0.26, "daly": 0.72, "population_100k": 670}
            },
            "Alzheimer's Disease": {
                "United States": {"prevalence": 1.2, "daly": 1.5, "population_100k": 3300},
                "Europe": {"prevalence": 1.0, "daly": 1.3, "population_100k": 4500},
                "Asia": {"prevalence": 0.8, "daly": 1.1, "population_100k": 12000}
            },
            "Multiple Sclerosis": {
                "United States": {"prevalence": 0.9, "daly": 1.2, "population_100k": 3300},
                "Europe": {"prevalence": 0.8, "daly": 1.0, "population_100k": 4500},
                "Canada": {"prevalence": 0.95, "daly": 1.25, "population_100k": 380}
            }
        }
        
        whitespace_scores = []
        for _, row in activity_data.iterrows():
            condition = str(row['condition'])
            country = str(row['country'])
            trial_count = int(row['trial_count'])
            avg_quality_score = float(row['avg_quality_score']) if not pd.isna(row['avg_quality_score']) else 0.0
            
            # Get burden data (with fallback)
            burden = burden_data.get(condition, {}).get(country, {"prevalence": 0.1, "daly": 0.5, "population_100k": 1000})
            
            # Calculate Activity/100k (trials per 100k population)
            population_100k = burden.get('population_100k', 1000)
            activity_per_100k = (trial_count / population_100k) * 100000 if population_100k > 0 else 0
            
            # Calculate Composite Score (combination of burden, activity, and quality)
            # Formula: (Burden DALY * 0.4) + (Quality Score * 0.3) + (Activity Gap * 0.3)
            burden_weight = burden['daly'] * 0.4
            quality_weight = min(avg_quality_score / 5.0, 1.0) * 0.3  # Normalize quality to 0-1
            activity_gap = max(0, 1 - (activity_per_100k / 10)) * 0.3  # Lower activity = higher gap
            composite_score = burden_weight + quality_weight + activity_gap
            
            # Calculate whitespace score (burden vs activity gap)
            whitespace_score = burden['daly'] - (activity_per_100k / 100)
            
            whitespace_scores.append({
                'condition': condition,
                'region': country,
                'trial_count': trial_count,
                'avg_quality_score': avg_quality_score,
                'burden_prevalence': float(burden['prevalence']),
                'burden_daly': float(burden['daly']),
                'activity_per_100k': round(float(activity_per_100k), 2),
                'composite_score': round(float(composite_score), 3),
                'whitespace_score': round(float(whitespace_score), 3)
            })
        
        # Sort by whitespace score (higher = bigger gap)
        whitespace_scores.sort(key=lambda x: x['whitespace_score'], reverse=True)
        
        return whitespace_scores[:20]  # Top 20 gaps
        
    except Exception as e:
        print(f"Error calculating whitespace scores: {e}")
        return []

def calculate_competitive_density(df):
    """Calculate competitive density using HHI scores"""
    try:
        # Debug: Check what columns are available
        print(f"Available columns in competitive density calculation: {list(df.columns)}")
        print(f"DataFrame shape: {df.shape}")
        
        # Check if MoA columns exist
        if 'moa' not in df.columns:
            print("MoA columns not found, returning empty competitive density data")
            print(f"Columns that do exist: {[col for col in df.columns if 'moa' in col.lower() or 'intervention' in col.lower()]}")
            return []
        
        # Group by MoA, phase, and condition
        density_data = df.groupby(['moa', 'phases', 'conditions']).agg({
            'nctId': 'count',
            'leadSponsor': 'nunique',
            'total_quality_score': 'mean' if 'total_quality_score' in df.columns else 'count'
        }).reset_index()
        
        print(f"Grouped data shape: {density_data.shape}")
        
        density_data.columns = ['moa', 'phase', 'condition', 'trial_count', 'sponsor_count', 'avg_quality_score']
        
        # Calculate HHI for each group
        hhi_scores = []
        for _, row in density_data.iterrows():
            if row['trial_count'] >= 2:  # Only groups with 2+ trials
                # Get sponsor shares for this group
                group_df = df[
                    (df['moa'] == row['moa']) & 
                    (df['phases'] == row['phase']) & 
                    (df['conditions'] == row['condition'])
                ]
                
                sponsor_counts = group_df['leadSponsor'].value_counts()
                total_trials = len(group_df)
                
                # Calculate HHI
                hhi = sum((count / total_trials * 100) ** 2 for count in sponsor_counts)
                
                hhi_scores.append({
                    'moa': str(row['moa']),
                    'phase': str(row['phase']),
                    'condition': str(row['condition']),
                    'trial_count': int(row['trial_count']),
                    'sponsor_count': int(row['sponsor_count']),
                    'avg_quality_score': float(row['avg_quality_score']) if not pd.isna(row['avg_quality_score']) else 0.0,
                    'hhi_score': float(hhi),
                    'competition_level': 'High' if hhi > 2500 else 'Moderate' if hhi > 1500 else 'Low'
                })
        
        # Sort by HHI score
        hhi_scores.sort(key=lambda x: x['hhi_score'], reverse=True)
        
        return hhi_scores[:20]  # Top 20 by HHI
        
    except Exception as e:
        print(f"Error calculating competitive density: {e}")
        return []

def calculate_enrollment_feasibility(df):
    """Calculate enrollment feasibility metrics"""
    try:
        # Filter for completed trials with enrollment data
        completed_df = df[
            (df['overallStatus'] == 'Completed') & 
            (df['enrollmentCount'].notna()) &
            (df['startDate'].notna()) &
            (df['completionDate'].notna())
        ].copy()
        
        if len(completed_df) == 0:
            return {"median_enroll_rate_per_site_per_month": 0}
        
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
        
        # Calculate median rate
        median_rate = completed_df['per_site_rate'].median()
        
        return {
            "median_enroll_rate_per_site_per_month": float(median_rate) if not pd.isna(median_rate) else 0,
            "total_completed_trials": len(completed_df),
            "enrollment_stats": {
                "min_rate": float(completed_df['per_site_rate'].min()) if len(completed_df) > 0 else 0,
                "max_rate": float(completed_df['per_site_rate'].max()) if len(completed_df) > 0 else 0,
                "std_rate": float(completed_df['per_site_rate'].std()) if len(completed_df) > 0 else 0
            }
        }
        
    except Exception as e:
        print(f"Error calculating enrollment feasibility: {e}")
        return {"median_enroll_rate_per_site_per_month": 0}

def generate_strategic_recommendations(df):
    """Generate strategic recommendations based on analysis"""
    try:
        # This is a placeholder implementation
        # In production, this would use outputs from other analysis functions
        
        recommendations = {
            "now": [
                {
                    "title": "LRRK2 Kinase Inhibitors in Phase 2",
                    "why": ["High whitespace score", "Above-median enrollment rate", "Low competitive density"],
                    "confidence": 0.72
                }
            ],
            "next": [
                {
                    "title": "Alpha-synuclein Antibodies",
                    "why": ["Strong momentum trend", "Moderate competitive density", "High quality scores"],
                    "confidence": 0.68
                }
            ],
            "watch": [
                {
                    "title": "Gene Therapy Approaches",
                    "why": ["Emerging technology", "Unclear outcomes", "Mixed sentiment"],
                    "confidence": 0.45
                }
            ]
        }
        
        return recommendations
        
    except Exception as e:
        print(f"Error generating strategic recommendations: {e}")
        return {"now": [], "next": [], "watch": []}
