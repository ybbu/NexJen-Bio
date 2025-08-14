import pandas as pd
import json
import os
from typing import Dict, Optional
from utils.data_processing import preprocess_data

class DataService:
    """Singleton service for managing clinical trial data"""
    
    _instance = None
    _df = None
    _quality_scores_cache = {}
    _scores_data = []
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self._load_data()
            self._initialized = True
    
    def _load_data(self):
        """Load and preprocess all data"""
        print("Loading clinical trials data...")
        try:
            # Load the original CSV that contains both interventional and observational trials
            print("Loading original CSV with all trial types...")
            self._df = pd.read_csv("../data/parkinson_trials_2010_cleaned.csv", low_memory=False)
            print(f"Raw CSV loaded: {len(self._df)} rows, {len(self._df.columns)} columns")
            
            # Preprocess data once
            self._df = preprocess_data(self._df)
            print(f"Loaded and preprocessed {len(self._df)} trials")
            
            # Load pre-calculated quality scores
            print("Loading pre-calculated quality scores...")
            try:
                with open("../data/quality_scores.json", "r") as f:
                    self._quality_scores_cache = json.load(f)
                print(f"✅ Loaded {len(self._quality_scores_cache)} pre-calculated quality scores")
            except FileNotFoundError:
                print("⚠️  No pre-calculated scores found.")
                self._quality_scores_cache = {}
            except Exception as e:
                print(f"❌ Error loading quality scores: {e}")
                self._quality_scores_cache = {}
                
            # Load optimized interventional trials CSV
            try:
                self._optimized_interventional_df = pd.read_csv("../data/interventional_trials_with_scores_standardized.csv")
                print("✅ Loaded optimized interventional trials")
                
                # Create optimized quality scores cache for interventional trials
                self._optimized_quality_scores_cache = {}
                for _, row in self._optimized_interventional_df.iterrows():
                    nct_id = str(row['nctId'])
                    if pd.notna(row['total_quality_score']):
                        self._optimized_quality_scores_cache[nct_id] = {
                            'total_score': float(row['total_quality_score']),
                            'quality_score': float(row['quality_score']) if pd.notna(row['quality_score']) else 0.0
                        }
                print("✅ Created optimized quality scores cache for", len(self._optimized_quality_scores_cache), "trials")
            except FileNotFoundError:
                print("⚠️ Standardized interventional trials file not found, using original file")
                self._optimized_interventional_df = self._df[self._df['studyType'] == 'INTERVENTIONAL'].copy()
                self._optimized_quality_scores_cache = self._quality_scores_cache
                    
        except Exception as e:
            print(f"Error loading data: {e}")
            import traceback
            traceback.print_exc()
            self._df = pd.DataFrame()
        
        # Load detailed breakdowns for success scores
        print("Loading detailed breakdowns for success scores...")
        try:
            self._scores_data = []
            with open("../data/detailed_breakdowns.jsonl", "r") as f:
                for line in f:
                    self._scores_data.append(json.loads(line.strip()))
            print(f"✅ Loaded {len(self._scores_data)} detailed breakdowns")
        except FileNotFoundError:
            print("⚠️  No detailed breakdowns found.")
            self._scores_data = []
        except Exception as e:
            print(f"❌ Error loading detailed breakdowns: {e}")
            self._scores_data = []
    
    def _load_optimized_interventional_data(self):
        """Load optimized interventional trials data for faster queries"""
        try:
            optimized_path = "../data/interventional_trials_with_scores.csv"
            if os.path.exists(optimized_path):
                print("Loading optimized interventional trials CSV...")
                self._optimized_interventional_df = pd.read_csv(optimized_path, low_memory=False)
                self._optimized_interventional_df = preprocess_data(self._optimized_interventional_df)
                print(f"✅ Loaded {len(self._optimized_interventional_df)} optimized interventional trials")
                
                # Create optimized quality scores cache
                self._optimized_quality_scores_cache = {}
                for _, trial in self._optimized_interventional_df.iterrows():
                    nct_id = str(trial['nctId']).strip()
                    self._optimized_quality_scores_cache[nct_id] = {
                        'base_score': trial.get('quality_score', 0),
                        'total_score': trial.get('total_quality_score', 0)
                    }
                print(f"✅ Created optimized quality scores cache for {len(self._optimized_quality_scores_cache)} trials")
            else:
                print("⚠️  Optimized interventional CSV not found, will use full dataset for all queries")
                self._optimized_interventional_df = None
                self._optimized_quality_scores_cache = {}
        except Exception as e:
            print(f"❌ Error loading optimized interventional data: {e}")
            self._optimized_interventional_df = None
            self._optimized_quality_scores_cache = {}
    
    @property
    def df(self) -> pd.DataFrame:
        """Get the preprocessed dataframe"""
        return self._df
    
    @property
    def optimized_interventional_df(self) -> pd.DataFrame:
        """Get the optimized interventional dataframe"""
        return self._optimized_interventional_df
    
    @property
    def quality_scores_cache(self) -> Dict:
        """Get the quality scores cache"""
        return self._quality_scores_cache
    
    @property
    def optimized_quality_scores_cache(self) -> Dict:
        """Get the optimized quality scores cache"""
        return self._optimized_quality_scores_cache
    
    @property
    def scores_data(self) -> list:
        """Get the scores data"""
        return self._scores_data
    
    def get_trial_by_nct_id(self, nct_id: str) -> Optional[Dict]:
        """Get a specific trial by NCT ID"""
        trial = self._df[self._df['nctId'] == nct_id]
        if len(trial) > 0:
            return trial.iloc[0].to_dict()
        return None
    
    def get_quality_score(self, nct_id: str) -> Dict:
        """Get quality score for a specific trial"""
        nct_id_str = str(nct_id).strip()
        if nct_id_str in self._quality_scores_cache:
            return self._quality_scores_cache[nct_id_str]
        else:
            return {
                "score": "Not calculated",
                "breakdown": "Score not available",
                "final_score": 0.0,
                "interpretation": "N/A"
            }
    
    def refresh_data(self):
        """Reload all data (useful for development)"""
        self._load_data()
