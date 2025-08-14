import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ArrowLeft, RefreshCw, Filter, Search, X, Eye, ExternalLink, TrendingUp, Users, Building, Globe, Calendar } from 'lucide-react';

const CollaborationNetwork = () => {
  const [anchor, setAnchor] = useState(null);
  const [filters, setFilters] = useState({
    timeframe: '1y',
    therapeuticArea: '',
    phase: '',
    country: '',
    nodeTypes: ['sponsor', 'institution'],
    weightingMode: 'established_network'
  });
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [topK, setTopK] = useState(20);

  // Refs
  const searchRef = useRef();
  const egoGraphRef = useRef();
  const searchContainerRef = useRef();

  useEffect(() => {
    if (anchor) {
      loadPartners();
    }
  }, [anchor, filters]);

  const loadPartners = async () => {
    if (!anchor) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('anchor_id', anchor.id);
      if (filters.timeframe) params.append('timeframe', filters.timeframe);
      if (filters.therapeuticArea) params.append('therapeutic_area', filters.therapeuticArea);
      if (filters.phase) params.append('phase', filters.phase);
      if (filters.country) params.append('country', filters.country);
      if (filters.nodeTypes.length > 0) params.append('node_types', filters.nodeTypes.join(','));
      if (filters.weightingMode) params.append('weighting_mode', filters.weightingMode);


      const response = await fetch(`http://localhost:8000/network/partners?${params}`);
      const data = await response.json();

      if (data.error) {
        setError(data.message);
        setPartners([]);
      } else {
        setPartners(data.partners || []);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load partners');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchEntities = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      console.log('Searching for:', query);
      const response = await fetch(`http://localhost:8000/network/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      console.log('Search results:', data);
      setSearchResults(data.results || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    console.log('Search query changed:', query);
    
    if (query.length >= 2) {
      searchEntities(query);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleEntitySelect = (entity) => {
    console.log('Selected entity:', entity);
    setAnchor(entity);
    setSearchQuery(entity.name); // Auto-fill the search bar with selected entity name
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedPartner(null);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for collaboration search events from other components
  useEffect(() => {
    const handleCollaborationSearch = (event) => {
      const sponsorName = event.detail;
      console.log('Received collaboration search event for:', sponsorName);
      setSearchQuery(sponsorName);
      // Call searchEntities with a small delay to ensure state is updated
      setTimeout(() => {
        searchEntities(sponsorName);
      }, 50);
    };

    window.addEventListener('setCollaborationSearch', handleCollaborationSearch);
    return () => {
      window.removeEventListener('setCollaborationSearch', handleCollaborationSearch);
    };
  }, [searchEntities]);

  const handlePartnerClick = async (partner) => {
    try {
      const response = await fetch(`http://localhost:8000/network/partner/${partner.id}?anchor_id=${anchor.id}`);
      const data = await response.json();
      setSelectedPartner(data);
    } catch (err) {
      console.error('Error loading partner details:', err);
    }
  };

  const swapAnchor = async (newAnchor) => {
    setAnchor(newAnchor);
    setSearchQuery(newAnchor.name); // Auto-fill the search with new anchor
    setSelectedPartner(null);
    await loadPartners();
  };

  const clearAnchor = () => {
    setAnchor(null);
    setPartners([]);
    setSelectedPartner(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      timeframe: '1y',
      therapeuticArea: '',
      phase: '',
      country: '',
      nodeTypes: ['sponsor', 'institution'],
      weightingMode: 'established_network'
    });
  };

  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Pick an anchor to see partners</h3>
        <p className="text-muted-foreground">Search for a sponsor or institution to explore their collaboration network</p>
      </div>
    </div>
  );

  const renderPartnerTable = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Top Partners of {anchor.name}</h2>
        <div className="flex items-center gap-2">
          <select 
            value={topK} 
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-semibold">Partner</th>
              <th className="text-left p-4 font-semibold">Link Strength</th>
              <th className="text-left p-4 font-semibold">Shared Trials</th>
              <th className="text-left p-4 font-semibold">Recent Shared</th>
              <th className="text-left p-4 font-semibold">Top Phase</th>
              <th className="text-left p-4 font-semibold">Top Condition</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.slice(0, topK).map((partner, index) => (
              <tr key={partner.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => handlePartnerClick(partner)}>
                <td className="p-4">
                  <div>
                    <div className="font-semibold text-base">{partner.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        partner.type === 'sponsor' ? 'bg-blue-100 text-blue-800' :
                        partner.type === 'institution' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {partner.type}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-700 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, (partner.weight / 10) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{partner.weight.toFixed(1)}</span>
                  </div>
                </td>
                <td className="p-4 text-base">{partner.shared_trials}</td>
                <td className="p-4 text-base">{partner.recent_shared}</td>
                <td className="p-4 text-sm">{partner.top_phase}</td>
                <td className="p-4 text-sm">{partner.top_condition}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePartnerClick(partner);
                      }}
                      className="text-sm text-primary hover:text-blue-600 hover:font-semibold transition-colors duration-200 font-medium"
                    >
                      Details
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        swapAnchor(partner);
                      }}
                      className="text-sm text-primary hover:text-blue-600 hover:font-semibold transition-colors duration-200 font-medium"
                    >
                      Swap Anchor
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPartnerDetails = () => {
    if (!selectedPartner) return null;

    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-card text-card-foreground border-l p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedPartner(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">{selectedPartner.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedPartner.type === 'sponsor' ? 'bg-blue-100 text-blue-800' :
                selectedPartner.type === 'institution' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedPartner.type}
              </span>
            </div>
            <button
              onClick={() => swapAnchor(selectedPartner)}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
            >
              Swap Anchor with this Partner
            </button>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Ego Network</h4>
            <div className="border rounded-lg p-4 h-64 bg-muted/20">
              <div className="text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Ego network visualization</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Shared Trials</h4>
            <div className="space-y-3">
              {selectedPartner.shared_trials?.map((trial, index) => (
                <div key={index} className="bg-card text-card-foreground rounded-xl border hover:shadow-lg transition-all duration-200">
                  <div className="p-4">
                    {/* Header with Trial ID and Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <a
                          href={`https://clinicaltrials.gov/ct2/show/${trial.nctId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-primary hover:text-primary/80 transition-colors"
                        >
                          {trial.nctId}
                        </a>
                        {trial.status && (
                          <div className="mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              trial.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                              trial.status?.toLowerCase() === 'recruiting' ? 'bg-blue-100 text-blue-800' :
                              trial.status?.toLowerCase() === 'active, not recruiting' ? 'bg-yellow-100 text-yellow-800' :
                              trial.status?.toLowerCase() === 'terminated' ? 'bg-red-100 text-red-800' :
                              trial.status?.toLowerCase() === 'suspended' ? 'bg-orange-100 text-orange-800' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {trial.status}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {/* Phase Tag */}
                        {trial.phase && trial.phase !== 'N/A' && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            trial.phase === 'PHASE1' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            trial.phase === 'PHASE2' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            trial.phase === 'PHASE3' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            trial.phase === 'PHASE4' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {trial.phase.replace('PHASE', 'Phase ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-card-foreground mb-2 line-clamp-2 leading-tight">
                      {trial.title}
                    </h3>

                    {/* Start Date */}
                    {trial.startDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {trial.startDate.split(' ')[0]}</span>
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className="mt-3">
                      <a
                        href={`https://clinicaltrials.gov/ct2/show/${trial.nctId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Collaboration Trend</h4>
            <div className="border rounded-lg p-4 h-32 bg-muted/20">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Quarterly weight trend</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trial Explorer
          </button>
          <div className="w-px h-6 bg-border"></div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Collaboration Network</h1>
            <p className="text-muted-foreground">
              Discover research partnerships and collaboration opportunities
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadPartners}
            className="p-2 rounded-lg border hover:bg-muted"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Header - Anchor Search */}
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
              ref={searchRef}
                  type="text"
              placeholder="Set anchor..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchQuery.length >= 2 && searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((entity) => (
                  <div
                    key={entity.id}
                    onClick={() => handleEntitySelect(entity)}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{entity.name}</div>
                        <div className="text-sm text-muted-foreground">{entity.type}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entity.type === 'sponsor' ? 'bg-blue-100 text-blue-800' :
                        entity.type === 'institution' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entity.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
              </div>

          {anchor && (
            <button
              onClick={clearAnchor}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Clear anchor
            </button>
          )}
        </div>

        {/* Context Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
              <select
                value={filters.timeframe}
                onChange={(e) => handleFilterChange('timeframe', e.target.value)}
            className="px-3 py-2 border rounded-lg text-base"
          >
            <option value="1y">Last 1 year</option>
            <option value="5y">Last 5 years</option>
            <option value="all">All time</option>
          </select>
          
          <select
            value={filters.weightingMode}
            onChange={(e) => handleFilterChange('weightingMode', e.target.value)}
            className="px-3 py-2 border rounded-lg text-base"
          >
            <option value="fresh_collaborations">New Partnerships</option>
            <option value="established_network">Long-term Partners</option>
            <option value="only_recent">Only Recent</option>
              </select>

              <select
            value={filters.therapeuticArea}
            onChange={(e) => handleFilterChange('therapeuticArea', e.target.value)}
            className="px-3 py-2 border rounded-lg text-base"
          >
            <option value="">All Therapeutic Areas</option>
            <optgroup label="Neurology">
              <option value="Parkinson's Disease">Parkinson's Disease</option>
              <option value="Alzheimer's Disease">Alzheimer's Disease</option>
              <option value="Multiple Sclerosis">Multiple Sclerosis</option>
              <option value="Epilepsy">Epilepsy</option>
              <option value="Huntington's Disease">Huntington's Disease</option>
              <option value="Amyotrophic Lateral Sclerosis">Amyotrophic Lateral Sclerosis</option>
              <option value="Migraine">Migraine</option>
              <option value="Stroke">Stroke</option>
            </optgroup>
            <optgroup label="Oncology">
              <option value="Breast Cancer">Breast Cancer</option>
              <option value="Lung Cancer">Lung Cancer</option>
              <option value="Prostate Cancer">Prostate Cancer</option>
              <option value="Colorectal Cancer">Colorectal Cancer</option>
              <option value="Melanoma">Melanoma</option>
              <option value="Lymphoma">Lymphoma</option>
              <option value="Leukemia">Leukemia</option>
            </optgroup>
            <optgroup label="Cardiology">
              <option value="Heart Failure">Heart Failure</option>
              <option value="Coronary Artery Disease">Coronary Artery Disease</option>
              <option value="Hypertension">Hypertension</option>
              <option value="Atrial Fibrillation">Atrial Fibrillation</option>
              <option value="Myocardial Infarction">Myocardial Infarction</option>
            </optgroup>
            <optgroup label="Endocrinology">
              <option value="Type 1 Diabetes">Type 1 Diabetes</option>
              <option value="Type 2 Diabetes">Type 2 Diabetes</option>
              <option value="Obesity">Obesity</option>
              <option value="Thyroid Disorders">Thyroid Disorders</option>
            </optgroup>
            <optgroup label="Immunology">
              <option value="Rheumatoid Arthritis">Rheumatoid Arthritis</option>
              <option value="Lupus">Lupus</option>
              <option value="Crohn's Disease">Crohn's Disease</option>
              <option value="Ulcerative Colitis">Ulcerative Colitis</option>
              <option value="Psoriasis">Psoriasis</option>
            </optgroup>
              </select>

              <input
                type="text"
                placeholder="Country filter..."
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
            className="px-3 py-2 border rounded-lg text-base"
              />

              <button
                onClick={clearFilters}
            className="px-3 py-2 text-base text-muted-foreground hover:text-foreground"
              >
            Clear filters
              </button>
        </div>
            </div>

      {/* Main Content */}
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-lg font-medium">Loading partners...</div>
                </div>
              </div>
            )}

            {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600">Error: {error}</div>
              </div>
            )}

        {!loading && !error && !anchor && renderEmptyState()}
        
        {!loading && !error && anchor && renderPartnerTable()}
      </div>

      {/* Partner Details Drawer */}
      {renderPartnerDetails()}
    </div>
  );
};

export default CollaborationNetwork; 