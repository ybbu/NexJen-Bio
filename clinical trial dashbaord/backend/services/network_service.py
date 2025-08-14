import pandas as pd
import json
import re
from typing import Dict, List, Set, Tuple, Optional
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import numpy as np
from difflib import SequenceMatcher

class NetworkService:
    """Service for building and managing collaboration networks from clinical trial data"""
    
    def __init__(self):
        self.canonical_aliases = self._load_canonical_aliases()
        self.entity_cache = {}
        self.graph_cache = {}
        self.normalize_cache = {}
        
    def _load_canonical_aliases(self) -> Dict[str, str]:
        """Load canonical organization aliases"""
        return {
            # Universities
            'ucsf': 'University of California, San Francisco',
            'univ. calif. san fran': 'University of California, San Francisco',
            'uc san francisco': 'University of California, San Francisco',
            'harvard': 'Harvard University',
            'stanford': 'Stanford University',
            'yale': 'Yale University',
            'upenn': 'University of Pennsylvania',
            'univ. of pennsylvania': 'University of Pennsylvania',
            'columbia': 'Columbia University',
            'uoft': 'University of Toronto',
            'univ. of toronto': 'University of Toronto',
            'univ. of melbourne': 'University of Melbourne',
            'univ. of sydney': 'University of Sydney',
            'ucl': 'University College London',
            'univ. college london': 'University College London',
            'imperial': 'Imperial College London',
            'imperial college': 'Imperial College London',
            'oxford university': 'University of Oxford',
            'cambridge university': 'University of Cambridge',
            'sjtu': 'Shanghai Jiao Tong University',
            'pku': 'Peking University',
            'beijing university': 'Peking University',
            'thu': 'Tsinghua University',
            'tsinghua': 'Tsinghua University',
            'sysu': 'Sun Yat-sen University',
            'sun yat sen univ': 'Sun Yat-sen University',
            'snu': 'Seoul National University',
            'utokyo': 'University of Tokyo',
            'kyoto univ': 'Kyoto University',
            'nus': 'National University of Singapore',
            'ubc': 'University of British Columbia',
            
            # Hospitals and Medical Centers
            'mgh': 'Massachusetts General Hospital',
            'mass general hospital': 'Massachusetts General Hospital',
            'mayo': 'Mayo Clinic',
            'mayo foundation': 'Mayo Clinic',
            'cleveland clinic foundation': 'Cleveland Clinic',
            'fred hutch': 'Fred Hutchinson Cancer Research Center',
            'dana farber': 'Dana-Farber Cancer Institute',
            'mskcc': 'Memorial Sloan Kettering Cancer Center',
            'sloan kettering': 'Memorial Sloan Kettering Cancer Center',
            'charite': 'Charité - Universitätsmedizin Berlin',
            'charite berlin': 'Charité - Universitätsmedizin Berlin',
            
            # Government/Research Institutes
            'nci': 'National Cancer Institute (NCI)',
            'nih nci': 'National Cancer Institute (NCI)',
            'natl cancer institute': 'National Cancer Institute (NCI)',
            'nih': 'National Institutes of Health (NIH)',
            'u.s. nih': 'National Institutes of Health (NIH)',
            'inserm': 'Institut National de la Santé et de la Recherche Médicale',
            'karolinska institute': 'Karolinska Institutet',
            
            # Pharmaceutical Companies
            'roche': 'F. Hoffmann-La Roche AG',
            'hoffmann-la roche': 'F. Hoffmann-La Roche AG',
            'roche ag': 'F. Hoffmann-La Roche AG',
            'novartis': 'Novartis AG',
            'novartis pharmaceuticals': 'Novartis AG',
            'pfizer': 'Pfizer Inc.',
            'pfizer incorporated': 'Pfizer Inc.',
            'gsk': 'GlaxoSmithKline plc',
            'glaxo': 'GlaxoSmithKline plc',
            'glaxosmithkline': 'GlaxoSmithKline plc',
            'glaxo smith kline': 'GlaxoSmithKline plc',
            'astrazeneca': 'AstraZeneca plc',
            'astra zeneca': 'AstraZeneca plc',
            'sanofi-aventis': 'Sanofi',
            'aventis': 'Sanofi',
            'merck': 'Merck & Co., Inc.',
            'msd': 'Merck & Co., Inc.',
            'merck sharp & dohme': 'Merck & Co., Inc.',
            'j&j': 'Johnson & Johnson',
            'janssen': 'Johnson & Johnson',
            'janssen pharmaceuticals': 'Johnson & Johnson',
            'lilly': 'Eli Lilly and Company',
            'eli lilly': 'Eli Lilly and Company',
            
            # Common NIH institutes
            'national institutes of health (nih)': 'National Institutes of Health (NIH)',
            'national institute of neurological disorders and stroke (ninds)': 'National Institute of Neurological Disorders and Stroke (NINDS)',
            'national institute on aging (nia)': 'National Institute on Aging (NIA)',
            'national institute of diabetes and digestive and kidney diseases (niddk)': 'National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)',
            'national institute of allergy and infectious diseases (niaid)': 'National Institute of Allergy and Infectious Diseases (NIAID)',
            'national center for advancing translational sciences (ncats)': 'National Center for Advancing Translational Sciences (NCATS)',
            'national institute for biomedical imaging and bioengineering (nibib)': 'National Institute for Biomedical Imaging and Bioengineering (NIBIB)',
            'eunice kennedy shriver national institute of child health and human development (nichd)': 'Eunice Kennedy Shriver National Institute of Child Health and Human Development (NICHD)',
            'national institute on deafness and other communication disorders (nidcd)': 'National Institute on Deafness and Other Communication Disorders (NIDCD)',
            
            # Parkinson's organizations
            "michael j. fox foundation for parkinson's research": "Michael J. Fox Foundation for Parkinson's Research",
            "parkinson's uk": "Parkinson's UK",
            'parkinson society canada': 'Parkinson Society Canada',
            'the parkinson study group': 'The Parkinson Study Group',
            
            # Major universities
            'university of california, los angeles': 'University of California, Los Angeles',
            'university of california, san francisco': 'University of California, San Francisco',
            'university of california, san diego': 'University of California, San Diego',
            'duke university': 'Duke University',
            'stanford university': 'Stanford University',
            'harvard medical school (hms and hsdm)': 'Harvard Medical School',
            'yale university': 'Yale University',
            'northwestern university': 'Northwestern University',
            'university of chicago': 'University of Chicago',
            'university of michigan': 'University of Michigan',
            'university of minnesota': 'University of Minnesota',
            'emory university': 'Emory University',
            'university of pittsburgh': 'University of Pittsburgh',
            'washington university school of medicine': 'Washington University School of Medicine',
            'rush university medical center': 'Rush University Medical Center',
            'rush university': 'Rush University',
            'case western reserve university': 'Case Western Reserve University',
            'purdue university': 'Purdue University',
            'university of cincinnati': 'University of Cincinnati',
            'university of utah': 'University of Utah',
            'university of florida': 'University of Florida',
            'university of alabama at birmingham': 'University of Alabama at Birmingham',
            'university of kentucky': 'University of Kentucky',
            'university of tennessee, knoxville': 'The University of Tennessee, Knoxville',
            'university of idaho': 'University of Idaho',
            'university of rochester': 'University of Rochester',
            'university of castilla-la mancha': 'University of Castilla-La Mancha',
            'university of milano bicocca': 'University of Milano Bicocca',
            'university of bologna': 'University of Bologna',
            'universidad autonoma de san luis potosí': 'Universidad Autonoma de San Luis Potosí',
            'mcgill university': 'McGill University',
            'ottawa hospital research institute': 'Ottawa Hospital Research Institute',
            'university of south florida': 'University of South Florida',
            'university of illinois at chicago': 'University of Illinois at Chicago',
            'university at buffalo': 'University at Buffalo',
            'oregon health and science university': 'Oregon Health and Science University',
            'cedars-sinai medical center': 'Cedars-Sinai Medical Center',
            'arizona state university': 'Arizona State University',
            'augusta university': 'Augusta University',
            'albany medical college': 'Albany Medical College',
            'beth israel deaconess medical center': 'Beth Israel Deaconess Medical Center',
            'johns hopkins university': 'Johns Hopkins University',
            'wake forest university': 'Wake Forest University',
            'centre for addiction and mental health': 'Centre for Addiction and Mental Health',
            'banner health': 'Banner Health',
            'massachusetts general hospital': 'Massachusetts General Hospital',
            'mayo clinic': 'Mayo Clinic',
            
            # Pharmaceutical companies
            'sanofi': 'Sanofi',
            'medtronic': 'Medtronic',
            'boston scientific corporation': 'Boston Scientific Corporation',
            'highland instruments, inc.': 'Highland Instruments, Inc.',
            'oryon cell therapies': 'Oryon Cell Therapies',
            'nebraska neuroscience alliance': 'Nebraska Neuroscience Alliance',
            'sage bionetworks': 'Sage Bionetworks',
            'tfs trial form support': 'TFS Trial Form Support',
            'shanghai icell biotechnology co., ltd, shanghai, china': 'Shanghai iCELL Biotechnology Co., Ltd',
            'gateway institute for brain research': 'Gateway Institute for Brain Research',
            'nova southeastern university': 'Nova Southeastern University',
            'colorado state university': 'Colorado State University',
            'region stockholm': 'Region Stockholm',
            'teachers college, columbia university': 'Teachers College, Columbia University',
            'drug safety and effectiveness network, canada': 'Drug Safety and Effectiveness Network, Canada',
            'canadian institutes of health research (cihr)': 'Canadian Institutes of Health Research (CIHR)',
            'marie curie hospice, belfast': 'Marie Curie Hospice, Belfast',
            'nks olaviken alderspsykiatriske sykehus': 'NKS Olaviken Alderspsykiatriske sykehus',
            'university hospital, caen': 'University Hospital, Caen',
            'university hospital, grenoble': 'University Hospital, Grenoble',
            'taipei medical university shuang ho hospital': 'Taipei Medical University Shuang Ho Hospital',
            'st. joseph\'s hospital and medical center, phoenix': "St. Joseph's Hospital and Medical Center, Phoenix",
            'spectrum dynamics': 'Spectrum Dynamics',
            'new york institute of technology': 'New York Institute of Technology',
            'university of delaware': 'University of Delaware',
            'cyto therapeutics pty limited': 'Cyto Therapeutics Pty Limited',
            'university of bergen': 'University of Bergen',
            'neuralight': 'NeuraLight',
            'zeng changhao': 'Zeng Changhao',
            'abbvie': 'AbbVie Inc.',
            'abbott laboratories': 'AbbVie Inc.',
            'bayer': 'Bayer AG',
            'bayer healthcare': 'Bayer AG',
            'amgen': 'Amgen Inc.',
            'bms': 'Bristol Myers Squibb',
            'bristol-myers squibb': 'Bristol Myers Squibb',
            'bristol myers': 'Bristol Myers Squibb',
            'genentech': 'Genentech, Inc.',
            'genentech usa': 'Genentech, Inc.',
        }
    
    def normalize_entity_name(self, name: str) -> str:
        """Normalize entity name for matching"""
        if pd.isna(name) or not name:
            return ""
        
        # Check cache first
        if name in self.normalize_cache:
            return self.normalize_cache[name]
        
        # Convert to lowercase and strip whitespace
        normalized = str(name).lower().strip()
        
        # Check canonical aliases first
        if normalized in self.canonical_aliases:
            result = self.canonical_aliases[normalized]
            self.normalize_cache[name] = result
            return result
        
        # Also check if the original name (proper case) is in canonical aliases
        original_name = str(name).strip()
        if original_name in self.canonical_aliases:
            result = self.canonical_aliases[original_name]
            self.normalize_cache[name] = result
            return result
        
        # Apply fuzzy matching for non-canonical names
        result = self._fuzzy_match_name(normalized)
        self.normalize_cache[name] = result
        return result
    
    def _fuzzy_match_name(self, name: str) -> str:
        """Apply fuzzy matching to find similar names"""
        if not name:
            return ""
        
        # Check for exact matches in canonical aliases
        for alias, canonical in self.canonical_aliases.items():
            if name == alias:
                return canonical
        
        # Apply Jaro-Winkler similarity for fuzzy matching
        best_match = None
        best_score = 0
        
        for alias, canonical in self.canonical_aliases.items():
            score = self._jaro_winkler_similarity(name, alias)
            if score >= 0.93 and score > best_score:
                best_match = canonical
                best_score = score
        
        return best_match if best_match else name.title()
    
    def _jaro_winkler_similarity(self, s1: str, s2: str) -> float:
        """Calculate Jaro-Winkler similarity between two strings"""
        if not s1 or not s2:
            return 0.0
        
        # Jaro distance
        match_distance = max(len(s1), len(s2)) // 2 - 1
        if match_distance < 0:
            match_distance = 0
        
        s1_matches = []
        s2_matches = []
        
        for i, char in enumerate(s1):
            start = max(0, i - match_distance)
            end = min(len(s2), i + match_distance + 1)
            
            for j in range(start, end):
                if j not in s2_matches and s2[j] == char:
                    s1_matches.append(char)
                    s2_matches.append(j)
                    break
        
        if not s1_matches:
            return 0.0
        
        # Count transpositions
        transpositions = 0
        for i in range(len(s1_matches)):
            if s1_matches[i] != s2[s2_matches[i]]:
                transpositions += 1
        
        # Jaro distance
        m = len(s1_matches)
        t = transpositions // 2
        jaro = (m / len(s1) + m / len(s2) + (m - t) / m) / 3
        
        # Winkler modification
        prefix = 0
        for i in range(min(4, len(s1), len(s2))):
            if s1[i] == s2[i]:
                prefix += 1
            else:
                break
        
        return jaro + 0.1 * prefix * (1 - jaro)
    
    def parse_collaborators(self, collaborators_str: str) -> List[str]:
        """Parse collaborators string into list of organizations"""
        if pd.isna(collaborators_str) or not collaborators_str:
            return []
        
        # Split on common delimiters
        collaborators = re.split(r'[,;|]', str(collaborators_str))
        
        # Clean and normalize each collaborator
        normalized = []
        for collab in collaborators:
            collab = collab.strip()
            if collab:
                normalized_name = self.normalize_entity_name(collab)
                if normalized_name:
                    normalized.append(normalized_name)
        
        return list(set(normalized))  # Remove duplicates
    
    def parse_officials(self, officials_str: str) -> List[Dict]:
        """Parse officials string into list of investigator dictionaries"""
        if pd.isna(officials_str) or not officials_str:
            return []
        
        officials = []
        
        # Split on common delimiters
        official_entries = re.split(r'[,;]', str(officials_str))
        
        for entry in official_entries:
            entry = entry.strip()
            if not entry:
                continue
            
            # Try to parse "Name | Role | Affiliation" format
            parts = entry.split('|')
            if len(parts) >= 3:
                name = parts[0].strip()
                role = parts[1].strip()
                affiliation = parts[2].strip()
            elif len(parts) == 2:
                name = parts[0].strip()
                role = ""
                affiliation = parts[1].strip()
            else:
                name = entry
                role = ""
                affiliation = ""
            
            if name:
                officials.append({
                    'name': name.title(),
                    'role': role,
                    'affiliation': self.normalize_entity_name(affiliation) if affiliation else ""
                })
        
        return officials
    
    def build_network_graph(self, df: pd.DataFrame, filters: Dict = None, weighting_mode: str = "established_network", top_k: int = None) -> Dict:
        """Build collaboration network graph from trial data"""
        
        # Create cache key
        cache_key = f"{hash(str(filters))}_{weighting_mode}_{top_k}_{len(df)}"
        if cache_key in self.graph_cache:
            return self.graph_cache[cache_key]
        
        # Apply filters if provided
        if filters:
            df = self._apply_filters(df, filters)
        
        # Initialize graph structure
        nodes = {}
        edges = {}
        
        # Process each trial
        for _, trial in df.iterrows():
            nct_id = str(trial['nctId'])
            lead_sponsor = self.normalize_entity_name(trial.get('leadSponsor', ''))
            collaborators = self.parse_collaborators(trial.get('collaborators', ''))
            officials = self.parse_officials(trial.get('officials', ''))
            start_date = pd.to_datetime(trial.get('startDate', ''), errors='coerce')
            phase = trial.get('phases', '')
            condition = trial.get('conditions', '')
            country = trial.get('country', 'Unknown')
            
            # Add sponsor node
            if lead_sponsor:
                if lead_sponsor not in nodes:
                    nodes[lead_sponsor] = {
                        'id': lead_sponsor,
                        'type': 'sponsor',
                        'name': lead_sponsor,
                        'canonical_name': lead_sponsor,
                        'aliases': [],
                        'metrics': {
                            'degree': 0,
                            'weighted_degree': 0,
                            'recent_activity': 0
                        },
                        'trials': []
                    }
                
                nodes[lead_sponsor]['trials'].append({
                    'nctId': nct_id,
                    'title': trial.get('briefTitle', ''),
                    'phase': phase,
                    'status': trial.get('overallStatus', ''),
                    'startDate': str(start_date) if pd.notna(start_date) else '',
                    'condition': condition,
                    'country': country
                })
            
            # Add collaborator nodes and edges
            for collaborator in collaborators:
                if collaborator and collaborator != lead_sponsor:
                    if collaborator not in nodes:
                        nodes[collaborator] = {
                            'id': collaborator,
                            'type': 'institution',
                            'name': collaborator,
                            'canonical_name': collaborator,
                            'aliases': [],
                            'metrics': {
                                'degree': 0,
                                'weighted_degree': 0,
                                'recent_activity': 0
                            },
                            'trials': []
                        }
                    
                    # Add edge between sponsor and collaborator
                    if lead_sponsor:
                        edge_id = f"{lead_sponsor}__{collaborator}"
                        if edge_id not in edges:
                            edges[edge_id] = {
                                'id': edge_id,
                                'source': lead_sponsor,
                                'target': collaborator,
                                'weight': 0,
                                'meta': {
                                    'nctIds': [],
                                    'firstSeen': str(start_date) if pd.notna(start_date) else '',
                                    'lastSeen': str(start_date) if pd.notna(start_date) else '',
                                    'phases': [],
                                    'conditions': [],
                                    'countries': []
                                }
                            }
                        
                        # Update edge metadata
                        edges[edge_id]['meta']['nctIds'].append(nct_id)
                        if phase:
                            edges[edge_id]['meta']['phases'].append(phase)
                        if condition:
                            edges[edge_id]['meta']['conditions'].append(condition)
                        if country:
                            edges[edge_id]['meta']['countries'].append(country)
                        
                        # Update first/last seen dates
                        if pd.notna(start_date):
                            if not edges[edge_id]['meta']['firstSeen'] or start_date < pd.to_datetime(edges[edge_id]['meta']['firstSeen']):
                                edges[edge_id]['meta']['firstSeen'] = str(start_date)
                            if not edges[edge_id]['meta']['lastSeen'] or start_date > pd.to_datetime(edges[edge_id]['meta']['lastSeen']):
                                edges[edge_id]['meta']['lastSeen'] = str(start_date)
            
            # Note: Investigator nodes removed since they're not present in the data
            # If you have officials data in the future, you can uncomment this section
        
        # Calculate edge weights and node metrics
        self._calculate_edge_weights(edges, weighting_mode)
        self._calculate_node_metrics(nodes, edges)
        
        # Filter to top K strongest connections per node if specified
        if top_k and top_k > 0:
            edges = self._filter_top_k_connections(nodes, edges, top_k)
        
        result = {
            'nodes': list(nodes.values()),
            'edges': list(edges.values())
        }
        
        # Cache the result (limit cache size to prevent memory issues)
        if len(self.graph_cache) > 50:
            # Clear oldest entries
            oldest_keys = list(self.graph_cache.keys())[:10]
            for key in oldest_keys:
                del self.graph_cache[key]
        
        self.graph_cache[cache_key] = result
        
        # Clear cache for debugging
        self.graph_cache.clear()
        
        return result
    
    def _apply_filters(self, df: pd.DataFrame, filters: Dict) -> pd.DataFrame:
        """Apply filters to the dataframe"""
        filtered_df = df.copy()
        
        # Filter by therapeutic area
        if filters.get('therapeutic_area'):
            filtered_df = filtered_df[
                filtered_df['conditions'].fillna('').str.contains(filters['therapeutic_area'], case=False, na=False)
            ]
        
        # Filter by phase
        if filters.get('phase'):
            filtered_df = filtered_df[
                filtered_df['phases'].fillna('').str.contains(filters['phase'], case=False, na=False)
            ]
        
        # Filter by country
        if filters.get('country'):
            filtered_df = filtered_df[
                filtered_df['country'].fillna('').str.contains(filters['country'], case=False, na=False)
            ]
        
        # Filter by date range
        if filters.get('timeframe'):
            now = datetime.now()
            if filters['timeframe'] == '1y':
                cutoff = now - timedelta(days=365)
            elif filters['timeframe'] == '5y':
                cutoff = now - timedelta(days=1825)  # 5 years
            elif filters['timeframe'] == 'all':
                cutoff = None  # No date filter
            else:
                cutoff = now - timedelta(days=365)  # Default to 1 year
            
            if cutoff:
                filtered_df = filtered_df[
                    pd.to_datetime(filtered_df['startDate'], errors='coerce') >= cutoff
                ]
        
        return filtered_df
    
    def _calculate_edge_weights(self, edges: Dict, weighting_mode: str = "established_network"):
        """Calculate edge weights using different weighting modes"""
        now = datetime.now()
        
        # Define weighting mode parameters
        weighting_configs = {
            "fresh_collaborations": {
                "decay_rate": 0.99,
                "recency_boost_factor": 1.0,
                "boost_cutoff_months": 6,
                "min_edge_weight_to_show": 1.4
            },
            "established_network": {
                "decay_rate": 0.985,
                "recency_boost_factor": 0.4,
                "boost_cutoff_months": 3,
                "min_edge_weight_to_show": 1.0
            },
            "only_recent": {
                "decay_rate": 0.97,
                "recency_boost_factor": 1.2,
                "boost_cutoff_months": 12,  # Default to 12 months
                "min_edge_weight_to_show": 1.6
            }
        }
        
        config = weighting_configs.get(weighting_mode, weighting_configs["established_network"])
        
        # Calculate raw weights first
        raw_weights = []
        for edge in edges.values():
            weight = 0
            for nct_id in edge['meta']['nctIds']:
                # Find the trial start date
                start_date_str = edge['meta']['firstSeen']
                if start_date_str:
                    try:
                        start_date = pd.to_datetime(start_date_str)
                        months_since = (now - start_date).days / 30
                        
                        # Calculate trial weight based on weighting mode
                        if weighting_mode == "only_recent" and months_since > config["boost_cutoff_months"]:
                            # Drop trials outside the range entirely
                            trial_weight = 0
                        else:
                            base_weight = config["decay_rate"] ** max(0, months_since)
                            
                            if months_since <= config["boost_cutoff_months"]:
                                # Apply recency boost
                                trial_weight = base_weight * (1 + config["recency_boost_factor"])
                            else:
                                trial_weight = base_weight
                        
                        weight += trial_weight
                    except:
                        weight += 1  # Default weight for trials without valid dates
            
            raw_weights.append(weight)
            edge['weight'] = weight  # Store raw weight temporarily
        
        # Rescale weights to 0-10 range for better visualization
        if raw_weights:
            w_min = min(raw_weights)
            w_max = max(raw_weights)
            
            if w_max > w_min:  # Avoid division by zero
                for edge in edges.values():
                    # Rescale to 0-10 range with a floor of 0.5 for visibility
                    scaled_w = ((edge['weight'] - w_min) / (w_max - w_min)) * 10
                    edge['weight'] = max(0.5, round(scaled_w, 2))
            else:
                # If all weights are the same, set them to a middle value
                for edge in edges.values():
                    edge['weight'] = 5.0
    
    def _calculate_node_metrics(self, nodes: Dict, edges: Dict):
        """Calculate node metrics (degree, weighted degree, etc.)"""
        # Count connections for each node
        node_connections = defaultdict(list)
        
        for edge in edges.values():
            source = edge['source']
            target = edge['target']
            weight = edge['weight']
            
            node_connections[source].append((target, weight))
            node_connections[target].append((source, weight))
        
        # Calculate metrics for each node
        for node_id, node in nodes.items():
            connections = node_connections.get(node_id, [])
            
            # Degree (number of connections)
            node['metrics']['degree'] = len(connections)
            
            # Weighted degree (sum of edge weights)
            node['metrics']['weighted_degree'] = sum(weight for _, weight in connections)
            
            # Recent activity (edges updated in last 12 months)
            recent_count = 0
            for edge in edges.values():
                if edge['source'] == node_id or edge['target'] == node_id:
                    last_seen = edge['meta']['lastSeen']
                    if last_seen:
                        try:
                            last_date = pd.to_datetime(last_seen)
                            if (datetime.now() - last_date).days <= 365:
                                recent_count += 1
                        except:
                            pass
            
            node['metrics']['recent_activity'] = recent_count
    
    def get_investigator_rankings(self, df: pd.DataFrame, filters: Dict = None) -> List[Dict]:
        """Get ranked list of investigators by success score"""
        if filters:
            df = self._apply_filters(df, filters)
        
        investigators = {}
        
        for _, trial in df.iterrows():
            officials = self.parse_officials(trial.get('officials', ''))
            phase = trial.get('phases', '')
            start_date = pd.to_datetime(trial.get('startDate', ''), errors='coerce')
            
            for official in officials:
                if official['name'] and official['affiliation']:
                    investigator_id = f"investigator_{official['name']}_{official['affiliation']}"
                    
                    if investigator_id not in investigators:
                        investigators[investigator_id] = {
                            'name': official['name'],
                            'affiliation': official['affiliation'],
                            'role': official['role'],
                            'weighted_degree': 0,
                            'phase_iii_iv_count': 0,
                            'recent_trials': [],
                            'top_conditions': [],
                            'total_trials': 0
                        }
                    
                    # Count Phase III/IV trials
                    if 'III' in phase or 'IV' in phase:
                        investigators[investigator_id]['phase_iii_iv_count'] += 1
                    
                    # Add recent trial
                    if pd.notna(start_date):
                        investigators[investigator_id]['recent_trials'].append({
                            'nctId': str(trial['nctId']),
                            'title': trial.get('briefTitle', ''),
                            'phase': phase,
                            'startDate': str(start_date)
                        })
                    
                    investigators[investigator_id]['total_trials'] += 1
        
        # Calculate success scores and sort
        for investigator in investigators.values():
            # Simple success score: weighted_degree + 0.5 * phase_iii_iv_count
            investigator['success_score'] = investigator['weighted_degree'] + 0.5 * investigator['phase_iii_iv_count']
            
            # Keep only recent trials (last 5)
            investigator['recent_trials'] = sorted(
                investigator['recent_trials'], 
                key=lambda x: x['startDate'], 
                reverse=True
            )[:5]
        
        # Sort by success score and return top 20
        ranked_investigators = sorted(
            investigators.values(),
            key=lambda x: x['success_score'],
            reverse=True
        )[:20]
        
        return ranked_investigators
    
    def get_sponsor_profile(self, sponsor_name: str, df: pd.DataFrame) -> Dict:
        """Get detailed profile for a specific sponsor"""
        sponsor_trials = df[df['leadSponsor'].fillna('').str.contains(sponsor_name, case=False, na=False)]
        
        # Get active trials
        active_trials = sponsor_trials[
            sponsor_trials['overallStatus'].fillna('').str.contains('RECRUITING', case=False, na=False)
        ]
        
        # Get top collaborators
        collaborators = []
        for _, trial in sponsor_trials.iterrows():
            trial_collaborators = self.parse_collaborators(trial.get('collaborators', ''))
            collaborators.extend(trial_collaborators)
        
        collaborator_counts = Counter(collaborators)
        top_collaborators = [{'name': name, 'count': count} for name, count in collaborator_counts.most_common(10)]
        
        # Get top conditions
        conditions = []
        for _, trial in sponsor_trials.iterrows():
            if trial.get('conditions'):
                conditions.append(trial['conditions'])
        
        condition_counts = Counter(conditions)
        top_conditions = [{'condition': cond, 'count': count} for cond, count in condition_counts.most_common(5)]
        
        # Get top countries
        countries = sponsor_trials['country'].fillna('Unknown').value_counts()
        top_countries = [{'country': country, 'count': count} for country, count in countries.head(5).items()]
        
        return {
            'name': sponsor_name,
            'total_trials': len(sponsor_trials),
            'active_trials': len(active_trials),
            'top_collaborators': top_collaborators,
            'top_conditions': top_conditions,
            'top_countries': top_countries,
            'recent_trials': sponsor_trials.head(5)[['nctId', 'briefTitle', 'phases', 'overallStatus']].to_dict('records')
        }
    
    def _filter_top_k_connections(self, nodes: Dict, edges: Dict, top_k: int) -> Dict:
        """Filter edges to show only top K strongest connections per node"""
        # Group edges by source node
        node_connections = defaultdict(list)
        
        for edge in edges.values():
            source = edge['source']
            target = edge['target']
            weight = edge['weight']
            
            node_connections[source].append((edge['id'], weight))
            node_connections[target].append((edge['id'], weight))
        
        # Keep only top K edges per node
        edges_to_keep = set()
        
        for node_id, connections in node_connections.items():
            # Sort connections by weight (descending) and take top K
            sorted_connections = sorted(connections, key=lambda x: x[1], reverse=True)
            top_connections = sorted_connections[:top_k]
            
            # Add edge IDs to keep
            for edge_id, _ in top_connections:
                edges_to_keep.add(edge_id)
        
        # Filter edges
        filtered_edges = {edge_id: edge for edge_id, edge in edges.items() if edge_id in edges_to_keep}
        
        return filtered_edges
