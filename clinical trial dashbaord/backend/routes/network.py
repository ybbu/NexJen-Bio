from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from services.network_service import NetworkService
from services.data_service import DataService
import hashlib
import json
import pandas as pd

router = APIRouter(prefix="/network", tags=["network"])

# Initialize services
network_service = NetworkService()
data_service = DataService()

@router.get("/")
async def get_network_graph(
    condition: Optional[str] = Query(None, description="Filter by condition"),
    phase: Optional[str] = Query(None, description="Filter by phase"),
    country: Optional[str] = Query(None, description="Filter by country"),
    timeframe: Optional[str] = Query("12m", description="Timeframe: 6m, 12m, 24m"),
    min_weight: Optional[float] = Query(0.0, description="Minimum edge weight"),
    node_types: Optional[str] = Query(None, description="Comma-separated node types: sponsor,institution"),
    search: Optional[str] = Query(None, description="Search by entity name"),
    weighting_mode: Optional[str] = Query("established_network", description="Weighting mode: fresh_collaborations, established_network, only_recent"),
    top_k: Optional[int] = Query(None, description="Show only top K strongest connections per node")
):
    """Get collaboration network graph with filters"""
    try:
        # Build filters dict
        filters = {}
        if condition:
            filters['condition'] = condition
        if phase:
            filters['phase'] = phase
        if country:
            filters['country'] = country
        if timeframe:
            filters['timeframe'] = timeframe
        
        # Get data (use all studies - both interventional and observational)
        df = data_service.df
        print(f"DEBUG: Data service has {len(df)} trials")
        
        # Build network graph
        graph_data = network_service.build_network_graph(df, filters, weighting_mode, top_k)
        print(f"DEBUG: Network service returned {len(graph_data['nodes'])} nodes and {len(graph_data['edges'])} edges")
        
        # Apply minimum weight filter (disabled for now to show more connections)
        # if min_weight:
        #     graph_data['edges'] = [
        #         edge for edge in graph_data['edges'] 
        #         if edge['weight'] >= min_weight
        #     ]
        
        # Apply node type filter
        if node_types:
            allowed_types = [t.strip() for t in node_types.split(',')]
            graph_data['nodes'] = [
                node for node in graph_data['nodes'] 
                if node['type'] in allowed_types
            ]
        
        # Apply search filter
        if search:
            search_lower = search.lower()
            graph_data['nodes'] = [
                node for node in graph_data['nodes'] 
                if (search_lower in node['name'].lower() or 
                    any(search_lower in alias.lower() for alias in node.get('aliases', [])))
            ]
        
        # Limit to top 20 strongest connections for better performance
        if len(graph_data['edges']) > 20:
            # Sort edges by weight and take top 20
            sorted_edges = sorted(graph_data['edges'], key=lambda x: x['weight'], reverse=True)
            graph_data['edges'] = sorted_edges[:20]
            
            # Keep only nodes that are connected by these edges
            connected_nodes = set()
            for edge in graph_data['edges']:
                connected_nodes.add(edge['source'])
                connected_nodes.add(edge['target'])
            
            graph_data['nodes'] = [
                node for node in graph_data['nodes'] 
                if node['id'] in connected_nodes
            ]
        
        # Check render limits
        if len(graph_data['nodes']) > 3000 or len(graph_data['edges']) > 5000:
            return {
                "error": "Graph too large",
                "message": f"Graph has {len(graph_data['nodes'])} nodes and {len(graph_data['edges'])} edges. Please refine your filters.",
                "suggestions": [
                    "Increase minimum weight threshold",
                    "Add more specific condition filter",
                    "Reduce timeframe",
                    "Filter by specific country"
                ]
            }
        
        return {
            "nodes": graph_data['nodes'],
            "edges": graph_data['edges'],
            "metadata": {
                "total_nodes": len(graph_data['nodes']),
                "total_edges": len(graph_data['edges']),
                "filters_applied": filters
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error building network graph: {str(e)}")

@router.get("/entity/{entity_id}")
async def get_entity_details(entity_id: str):
    """Get detailed information about a specific entity"""
    try:
        # Get data
        df = data_service.df
        
        # Find the entity in the network
        graph_data = network_service.build_network_graph(df)
        
        # Find the node
        node = None
        for n in graph_data['nodes']:
            if n['id'] == entity_id:
                node = n
                break
        
        if not node:
            raise HTTPException(status_code=404, detail="Entity not found")
        
        # Get top partners
        top_partners = []
        for edge in graph_data['edges']:
            if edge['source'] == entity_id:
                target_node = next((n for n in graph_data['nodes'] if n['id'] == edge['target']), None)
                if target_node:
                    top_partners.append({
                        'name': target_node['name'],
                        'type': target_node['type'],
                        'weight': edge['weight']
                    })
            elif edge['target'] == entity_id:
                source_node = next((n for n in graph_data['nodes'] if n['id'] == edge['source']), None)
                if source_node:
                    top_partners.append({
                        'name': source_node['name'],
                        'type': source_node['type'],
                        'weight': edge['weight']
                    })
        
        # Sort by weight and take top 10
        top_partners = sorted(top_partners, key=lambda x: x['weight'], reverse=True)[:10]
        
        # Get recent trials for this entity
        recent_trials = []
        for _, trial in df.iterrows():
            lead_sponsor = network_service.normalize_entity_name(trial.get('leadSponsor', ''))
            collaborators = network_service.parse_collaborators(trial.get('collaborators', ''))
            
            if entity_id == lead_sponsor or entity_id in collaborators:
                recent_trials.append({
                    'nctId': str(trial['nctId']),
                    'title': trial.get('briefTitle', ''),
                    'phase': trial.get('phases', ''),
                    'status': trial.get('overallStatus', ''),
                    'startDate': trial.get('startDate', ''),
                    'condition': trial.get('conditions', '')
                })
        
        # Sort by start date and take recent 5
        recent_trials.sort(key=lambda x: x['startDate'], reverse=True)
        recent_trials = recent_trials[:5]
        
        return {
            'id': node['id'],
            'name': node['name'],
            'type': node['type'],
            'metrics': node['metrics'],
            'top_partners': top_partners,
            'recent_trials': recent_trials
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting entity details: {str(e)}")

@router.get("/edge/{edge_id}")
async def get_edge_details(edge_id: str):
    """Get shared trials for a specific edge"""
    try:
        # Get data
        df = data_service.df
        
        # Build network graph
        graph_data = network_service.build_network_graph(df)
        
        # Find the edge
        edge = None
        for e in graph_data['edges']:
            if e['id'] == edge_id:
                edge = e
                break
        
        if not edge:
            raise HTTPException(status_code=404, detail="Edge not found")
        
        # Get trial details for the shared trials
        trials = []
        for nct_id in edge['meta']['nctIds']:
            trial = df[df['nctId'] == nct_id]
            if not trial.empty:
                trial_row = trial.iloc[0]
                trials.append({
                    'nctId': str(trial_row['nctId']),
                    'title': trial_row.get('briefTitle', ''),
                    'phase': trial_row.get('phases', ''),
                    'status': trial_row.get('overallStatus', ''),
                    'startDate': str(trial_row.get('startDate', ''))
                })
        
        return {
            "source": edge['source'],
            "target": edge['target'],
            "weight": edge['weight'],
            "trials": trials
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting edge details: {str(e)}")

@router.get("/investigators")
async def get_investigator_rankings(
    condition: Optional[str] = Query(None, description="Filter by condition"),
    phase: Optional[str] = Query(None, description="Filter by phase"),
    country: Optional[str] = Query(None, description="Filter by country"),
    timeframe: Optional[str] = Query("12m", description="Timeframe: 6m, 12m, 24m"),
    limit: int = Query(20, description="Number of investigators to return")
):
    """Get ranked list of investigators by success score"""
    try:
        # Build filters dict
        filters = {}
        if condition:
            filters['condition'] = condition
        if phase:
            filters['phase'] = phase
        if country:
            filters['country'] = country
        if timeframe:
            filters['timeframe'] = timeframe
        
        # Get data
        df = data_service.df
        
        # Get investigator rankings
        investigators = network_service.get_investigator_rankings(df, filters)
        
        # Limit results
        investigators = investigators[:limit]
        
        return {
            "investigators": investigators,
            "metadata": {
                "total_found": len(investigators),
                "filters_applied": filters
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting investigator rankings: {str(e)}")

@router.get("/sponsors/{sponsor_id}/profile")
async def get_sponsor_profile(sponsor_id: str):
    """Get detailed profile for a specific sponsor"""
    try:
        # Get data
        df = data_service.df
        
        # Get sponsor profile
        profile = network_service.get_sponsor_profile(sponsor_id, df)
        
        if not profile:
            raise HTTPException(status_code=404, detail="Sponsor not found")
        
        return profile
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting sponsor profile: {str(e)}")

@router.get("/insights")
async def get_connection_insights(
    timeframe: Optional[str] = Query("12m", description="Timeframe for insights")
):
    """Get connection insights (new partnerships, frequent pairs, emerging hubs)"""
    try:
        # Get data
        df = data_service.df
        
        # Build network graph
        graph_data = network_service.build_network_graph(df)
        
        now = datetime.now()
        
        # Calculate timeframe cutoff
        if timeframe == "6m":
            cutoff = now - timedelta(days=180)
        elif timeframe == "24m":
            cutoff = now - timedelta(days=730)
        else:  # 12m default
            cutoff = now - timedelta(days=365)
        
        # Find new partnerships (edges where firstSeen is in the timeframe)
        new_partnerships = []
        for edge in graph_data['edges']:
            if edge['meta']['firstSeen']:
                try:
                    first_seen = pd.to_datetime(edge['meta']['firstSeen'])
                    if first_seen >= cutoff:
                        new_partnerships.append({
                            'source': edge['source'],
                            'target': edge['target'],
                            'weight': edge['weight'],
                            'firstSeen': edge['meta']['firstSeen']
                        })
                except:
                    pass
        
        # Sort by weight and take top 10
        new_partnerships = sorted(new_partnerships, key=lambda x: x['weight'], reverse=True)[:10]
        
        # Find most frequent collaborator pairs
        frequent_pairs = []
        for edge in graph_data['edges']:
            frequent_pairs.append({
                'source': edge['source'],
                'target': edge['target'],
                'weight': edge['weight'],
                'trial_count': len(edge['meta']['nctIds'])
            })
        
        # Sort by weight and take top 10
        frequent_pairs = sorted(frequent_pairs, key=lambda x: x['weight'], reverse=True)[:10]
        
        # Find emerging hubs (nodes with high recent activity)
        emerging_hubs = []
        for node in graph_data['nodes']:
            if node['metrics']['recent_activity'] > 0:
                emerging_hubs.append({
                    'id': node['id'],
                    'name': node['name'],
                    'type': node['type'],
                    'recent_activity': node['metrics']['recent_activity'],
                    'weighted_degree': node['metrics']['weighted_degree']
                })
        
        # Sort by recent activity and take top 10
        emerging_hubs = sorted(emerging_hubs, key=lambda x: x['recent_activity'], reverse=True)[:10]
        
        return {
            "new_partnerships": new_partnerships,
            "frequent_pairs": frequent_pairs,
            "emerging_hubs": emerging_hubs,
            "metadata": {
                "timeframe": timeframe,
                "cutoff_date": str(cutoff)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting connection insights: {str(e)}")

@router.get("/search")
async def search_entities(q: str = Query(..., description="Search query")):
    """Search for entities by name or alias"""
    try:
        df = data_service.df
        
        # Get all unique entities from the data
        entities = set()
        
        # Collect sponsors
        for _, trial in df.iterrows():
            lead_sponsor = network_service.normalize_entity_name(trial.get('leadSponsor', ''))
            if lead_sponsor:
                entities.add((lead_sponsor, 'sponsor'))
            
            # Collect collaborators
            collaborators = network_service.parse_collaborators(trial.get('collaborators', ''))
            for collab in collaborators:
                entities.add((collab, 'institution'))
        
        # Search and filter
        results = []
        query_lower = q.lower()
        
        for name, entity_type in entities:
            if query_lower in name.lower():
                results.append({
                    'id': name,
                    'name': name,
                    'type': entity_type
                })
        
        # Sort by relevance (exact matches first, then contains)
        results.sort(key=lambda x: (
            not x['name'].lower().startswith(query_lower),
            x['name']
        ))
        
        return {
            "results": results[:10]  # Limit to top 10
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching entities: {str(e)}")

@router.get("/partners")
async def get_anchor_partners(
    anchor_id: str = Query(..., description="Anchor entity ID"),
    timeframe: Optional[str] = Query("1y", description="Timeframe: 1y, 5y, all"),
    therapeutic_area: Optional[str] = Query(None, description="Filter by therapeutic area"),
    phase: Optional[str] = Query(None, description="Filter by phase"),
    country: Optional[str] = Query(None, description="Filter by country"),
    node_types: Optional[str] = Query(None, description="Comma-separated node types"),
    weighting_mode: Optional[str] = Query("established_network", description="Weighting mode"),
    min_weight: Optional[float] = Query(0.0, description="Minimum edge weight")
):
    """Get top partners for a specific anchor entity"""
    try:
        # Build filters
        filters = {}
        if therapeutic_area:
            filters['therapeutic_area'] = therapeutic_area
        if phase:
            filters['phase'] = phase
        if country:
            filters['country'] = country
        if timeframe:
            filters['timeframe'] = timeframe
        
        # Get data
        df = data_service.df
        
        # Build network graph
        graph_data = network_service.build_network_graph(df, filters, weighting_mode)
        
        # Find anchor entity (use normalized comparison)
        anchor_node = None
        normalized_anchor_id = network_service.normalize_entity_name(anchor_id)
        
        for node in graph_data['nodes']:
            if node['id'] == normalized_anchor_id:
                anchor_node = node
                break
        
        if not anchor_node:
            raise HTTPException(status_code=404, detail="Anchor entity not found")
        
        # Get direct partners (1-hop neighbors)
        partners = []
        for edge in graph_data['edges']:
            partner_node = None
            
            if edge['source'] == normalized_anchor_id:
                partner_node = next((n for n in graph_data['nodes'] if n['id'] == edge['target']), None)
            elif edge['target'] == normalized_anchor_id:
                partner_node = next((n for n in graph_data['nodes'] if n['id'] == edge['source']), None)
            
            if partner_node:
                partners.append({
                    'id': partner_node['id'],
                    'name': partner_node['name'],
                    'type': partner_node['type'],
                    'weight': edge['weight'],
                    'shared_trials': len(edge['meta']['nctIds']),
                    'recent_shared': len([nct for nct in edge['meta']['nctIds'] if nct]),  # Placeholder
                    'top_phase': 'Phase II',  # Placeholder
                    'top_condition': 'Parkinson\'s Disease'  # Placeholder
                })
        
        # Sort by weight and filter by min_weight
        partners = [p for p in partners if p['weight'] >= min_weight]
        partners.sort(key=lambda x: x['weight'], reverse=True)
        
        return {
            "anchor": anchor_node,
            "partners": partners[:20]  # Top 20 by default
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting anchor partners: {str(e)}")

@router.get("/partner/{partner_id}")
async def get_partner_details(
    partner_id: str,
    anchor_id: str = Query(..., description="Anchor entity ID")
):
    """Get detailed information about a partner"""
    try:
        df = data_service.df
        
        # Build network graph
        graph_data = network_service.build_network_graph(df)
        
        # Find partner node
        partner_node = None
        for node in graph_data['nodes']:
            if node['id'] == partner_id:
                partner_node = node
                break
        
        if not partner_node:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        # Get shared trials between anchor and partner
        shared_trials = []
        for edge in graph_data['edges']:
            if ((edge['source'] == anchor_id and edge['target'] == partner_id) or
                (edge['source'] == partner_id and edge['target'] == anchor_id)):
                
                # Get trial details
                for nct_id in edge['meta']['nctIds']:
                    trial = df[df['nctId'] == nct_id]
                    if not trial.empty:
                        trial_row = trial.iloc[0]
                        shared_trials.append({
                            'nctId': str(trial_row['nctId']),
                            'title': trial_row.get('briefTitle', ''),
                            'phase': trial_row.get('phases', ''),
                            'status': trial_row.get('overallStatus', ''),
                            'startDate': str(trial_row.get('startDate', ''))
                        })
        
        return {
            'id': partner_node['id'],
            'name': partner_node['name'],
            'type': partner_node['type'],
            'shared_trials': shared_trials[:5]  # Top 5 shared trials
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting partner details: {str(e)}")

@router.get("/similar/{entity_id}")
async def find_similar_networks(entity_id: str, k: int = Query(5, description="Number of similar entities to return")):
    """Find similar networks using Jaccard similarity of neighbor sets"""
    try:
        # Get data
        df = data_service.df
        
        # Build network graph
        graph_data = network_service.build_network_graph(df)
        
        # Find the target entity
        target_node = None
        for node in graph_data['nodes']:
            if node['id'] == entity_id:
                target_node = node
                break
        
        if not target_node:
            raise HTTPException(status_code=404, detail="Entity not found")
        
        # Get neighbors of target entity
        target_neighbors = set()
        for edge in graph_data['edges']:
            if edge['source'] == entity_id:
                target_neighbors.add(edge['target'])
            elif edge['target'] == entity_id:
                target_neighbors.add(edge['source'])
        
        # Calculate Jaccard similarity for all other entities
        similarities = []
        for node in graph_data['nodes']:
            if node['id'] == entity_id:
                continue
            
            # Get neighbors of this node
            node_neighbors = set()
            for edge in graph_data['edges']:
                if edge['source'] == node['id']:
                    node_neighbors.add(edge['target'])
                elif edge['target'] == node['id']:
                    node_neighbors.add(edge['source'])
            
            # Calculate Jaccard similarity
            if target_neighbors or node_neighbors:
                intersection = len(target_neighbors & node_neighbors)
                union = len(target_neighbors | node_neighbors)
                similarity = intersection / union if union > 0 else 0
                
                similarities.append({
                    'id': node['id'],
                    'name': node['name'],
                    'type': node['type'],
                    'similarity': similarity,
                    'neighbor_count': len(node_neighbors)
                })
        
        # Sort by similarity and take top k
        similarities = sorted(similarities, key=lambda x: x['similarity'], reverse=True)[:k]
        
        return {
            "target_entity": target_node,
            "similar_entities": similarities,
            "metadata": {
                "target_neighbor_count": len(target_neighbors),
                "k": k
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding similar networks: {str(e)}")
