import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Filters from './Filters';
import TrialCards from './TrialCards';
import { MapPin, List, Grid, BarChart3, Search, RefreshCw } from 'lucide-react';

const TrialExplorer = () => {
  const [trials, setTrials] = useState([]);
  const [scores, setScores] = useState({});
  const [metrics, setMetrics] = useState({
    trial_count: 0,
    total_enrollment: 0,
    avg_enrollment: 0,
    completion_rate: 0
  });
  const [filters, setFilters] = useState({
    condition: '',
    phase: '',
    intervention: '',
    study_type: 'INTERVENTIONAL',
    status: '',
    sponsor: '',
    enrollmentMin: '',
    enrollmentMax: '',
    location: '',
    nearMe: false
  });
  const [activeTab, setActiveTab] = useState('interventional');
  const [viewMode, setViewMode] = useState('cards'); // cards, map, list
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchRef = useRef(null);

  // Smart suggestions for Parkinson's disease related terms
  const smartSuggestions = [
    "Parkinson's Disease",
    "Parkinson Disease", 
    "Parkinsonism",
    "Lewy Body Disease",
    "Multiple System Atrophy",
    "Progressive Supranuclear Palsy",
    "Corticobasal Degeneration",
    "Essential Tremor",
    "Dystonia",
    "Huntington's Disease",
    "Alzheimer's Disease",
    "Dementia",
    "Movement Disorders",
    "Neurological Disorders",
    "rotigotine",
    "opicapone", 
    "rasagiline",
    "levodopa",
    "carbidopa",
    "pramipexole",
    "ropinirole",
    "apomorphine",
    "amantadine",
    "entacapone",
    "tolcapone",
    "selegiline",
    "bromocriptine",
    "pergolide",
    "cabergoline",
    "deep brain stimulation",
    "DBS",
    "stem cell therapy",
    "gene therapy",
    "immunotherapy",
    "biomarkers",
    "clinical trial",
    "phase 1",
    "phase 2", 
    "phase 3",
    "phase 4",
    "recruiting",
    "active",
    "completed",
    "terminated"
  ];

  // Filter suggestions based on input
  const getFilteredSuggestions = (query) => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return smartSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(lowerQuery)
    ).slice(0, 8); // Limit to 8 suggestions
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      const filtered = getFilteredSuggestions(value);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch trials data
  const fetchTrials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/trials', {
        ...filters,
        _timestamp: Date.now() // Add timestamp to prevent caching
      });
      setTrials(response.data.trials);
      setMetrics(response.data.metrics); // Store the metrics from backend
      

    } catch (err) {
      setError('Failed to fetch trials data');
      console.error('Error fetching trials:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch success scores
  const fetchScores = useCallback(async () => {
    try {
      const response = await axios.get('/scores');
      const scoresData = response.data.scores || [];
      const scoresMap = {};
      scoresData.forEach(score => {
        scoresMap[score.nct_id] = score;
      });
      setScores(scoresMap);
    } catch (err) {
      console.error('Error fetching scores:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrials();
    fetchScores();
  }, [filters]); // Changed back to filters dependency

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    let studyType = '';
    if (tab === 'interventional') {
      studyType = 'INTERVENTIONAL';
    } else if (tab === 'observational') {
      studyType = 'OBSERVATIONAL';
    } else if (tab === 'combined') {
      studyType = 'BOTH'; // This will be handled specially in the backend
    }
    
    // Update filters immediately to trigger the API call
    const newFilters = {
      ...filters,
      study_type: studyType,
      condition: '' // Keep condition empty to show all trials
    };
    setFilters(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Update filters with search query
    setFilters(prev => ({
      ...prev,
      intervention: searchQuery
    }));
  };

  const handleRefresh = () => {
    // Refresh the current data by refetching trials
    fetchTrials();
  };

  const getScoreBadge = (nctId) => {
    const score = scores[nctId];
    if (!score || (activeTab !== 'interventional' && activeTab !== 'combined')) return null;

    const finalScore = score.scores?.final_score || 0;
    let color = 'bg-gray-100 text-gray-700';
    let quality = 'Low';

    // Updated score interpretation based on your requirements
    if (finalScore > 4.0) {
      color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      quality = 'Highly Reliable';
    } else if (finalScore >= 3.0 && finalScore <= 4.0) {
      color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      quality = 'Reliable';
    } else if (finalScore >= 1.6 && finalScore < 3.0) {
      color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      quality = 'Moderate';
    } else if (finalScore >= 0.8 && finalScore < 1.6) {
      color = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      quality = 'Risky';
    } else if (finalScore >= 0.0 && finalScore < 0.8) {
      color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      quality = 'Highly Risky';
    }

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <span className="w-2 h-2 rounded-full bg-current"></span>
        {quality} ({finalScore.toFixed(1)})
      </div>
    );
  };

  // Navigation function to go to collaboration network with sponsor
  const handleNavigateToCollaboration = (sponsorName) => {
    // Dispatch custom event to change section to collaboration
    const event = new CustomEvent('changeSection', { detail: 'collaboration' });
    window.dispatchEvent(event);
    
    // Dispatch event to set the search query in collaboration network after a small delay
    setTimeout(() => {
      const searchEvent = new CustomEvent('setCollaborationSearch', { detail: sponsorName });
      window.dispatchEvent(searchEvent);
      console.log('Dispatched search event for:', sponsorName);
    }, 100);
  };

  // Calculate metrics for Quick Metrics Bar - Use backend metrics instead of calculating from displayed trials
  const activeTrials = metrics.active_trials || 0;
  const recentTrials = metrics.recent_trials || 0;
  const avgScore = metrics.avg_score || 'N/A';

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trial Explorer</h1>
          <p className="text-muted-foreground">
            Discover and analyze clinical trials worldwide with AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg border hover:bg-muted"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative" ref={searchRef}>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search by condition, disease, intervention, or keyword..."
              className="w-full pl-16 pr-4 py-6 text-lg bg-card border-2 border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-lg"
            />
          </div>
        </form>
        
        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-6 py-3 text-left text-base hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                  index === selectedSuggestionIndex 
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Study Type Tabs */}
      <div className="flex justify-center">
        <div className="bg-muted/20 border rounded-lg p-1 shadow-sm">
          <button
            onClick={() => handleTabChange('interventional')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'interventional'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            Interventional
          </button>
          <button
            onClick={() => handleTabChange('observational')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'observational'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            Observational
          </button>
          <button
            onClick={() => handleTabChange('combined')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'combined'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            Combined
          </button>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-sm font-medium">Advanced Filters</span>
          <svg 
            className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showAdvancedFilters && (
          <div className="mt-4">
            <Filters 
              filters={filters} 
              onFilterChange={handleFilterChange}
              activeTab={activeTab}
              showTitle={false}
            />
          </div>
        )}
      </div>

      {/* Snapshot Block - Merged Metrics and Top Sponsors */}
      <div className="bg-card border rounded-lg p-6">
        {/* Top Row: Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-muted-foreground" />
            <div>
              <div className="text-3xl font-bold text-foreground">{metrics.trial_count}</div>
              <div className="text-sm text-muted-foreground">Total Trials</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <div>
              <div className="text-3xl font-bold text-foreground">{activeTrials}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <div>
              <div className="text-3xl font-bold text-foreground">{recentTrials}</div>
              <div className="text-sm text-muted-foreground">Recent</div>
            </div>
          </div>
          {(activeTab === 'interventional') && (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <div>
                <div className="text-3xl font-bold text-foreground">{avgScore}</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Row: Top Sponsors */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-4">Top Sponsors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              // Use backend sponsor breakdown if available, otherwise fallback to displayed trials
              const sponsorCounts = metrics.sponsor_breakdown || {};
              
              if (Object.keys(sponsorCounts).length === 0) {
                // Fallback to calculating from displayed trials
                trials.forEach(trial => {
                  const sponsor = trial.leadSponsor || 'Unknown';
                  sponsorCounts[sponsor] = (sponsorCounts[sponsor] || 0) + 1;
                });
              }
              
              const topSponsors = Object.entries(sponsorCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6);
              
              return topSponsors.map(([sponsor, count]) => (
                <div key={sponsor} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#f4f6f8' }}>
                  <button
                    onClick={() => handleNavigateToCollaboration(sponsor)}
                    className="text-base font-medium truncate text-black hover:text-blue-600 hover:font-semibold transition-colors duration-200 cursor-pointer"
                  >
                    {sponsor}
                  </button>
                  <span className="text-base font-bold text-primary">{count} trials</span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Next Steps */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('changeSection', { detail: 'analytics' }))}
              className="flex items-center gap-3 px-4 py-2 text-white bg-gray-600 hover:bg-white hover:text-gray-600 rounded-lg transition-all duration-200 font-medium border-2 border-gray-600 hover:border-gray-300 shadow-sm"
            >
              <div className="text-xl">🔍</div>
              <div className="text-left">
                <div className="font-bold text-base">Discover Patterns</div>
              </div>
            </button>
            
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('changeSection', { detail: 'collaboration' }))}
              className="flex items-center gap-3 px-4 py-2 text-white bg-gray-600 hover:bg-white hover:text-gray-600 rounded-lg transition-all duration-200 font-medium border-2 border-gray-600 hover:border-gray-300 shadow-sm"
            >
              <div className="text-xl">👥</div>
              <div className="text-left">
                <div className="font-bold text-base">Find Collaborators</div>
              </div>
            </button>
            
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('changeSection', { detail: 'insights' }))}
              className="flex items-center gap-3 px-4 py-2 text-white bg-gray-600 hover:bg-white hover:text-gray-600 rounded-lg transition-all duration-200 font-medium border-2 border-gray-600 hover:border-gray-300 shadow-sm"
            >
              <div className="text-xl">💡</div>
              <div className="text-left">
                <div className="font-bold text-base">Uncover Opportunities</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading trials...</p>
          <p className="text-muted-foreground text-sm mt-2">This may take a few moments</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-destructive mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-destructive">Error Loading Data</h3>
              <p className="text-destructive/80 mt-1">{error}</p>
              <button
                onClick={fetchTrials}
                className="mt-3 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="space-y-6">

          {/* Trials Section */}
          <div className="bg-card text-card-foreground rounded-xl border">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    Clinical Trial Examples
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Displaying {trials.length} most recent trials
                    {filters.intervention && ` for "${filters.intervention}"`}
                    {filters.phase && ` in ${filters.phase.replace('PHASE', 'Phase ')}`}
                    {(activeTab === 'interventional' || activeTab === 'combined') && Object.values(scores).length > 0 && (
                      <span className="ml-2">
                        • Quality scores only available for interventional studies
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* View Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'cards' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'map' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6" style={{ backgroundColor: '#F7F9FA' }}>
              {trials.length > 0 ? (
                <TrialCards 
                  trials={trials} 
                  viewMode={viewMode}
                  getScoreBadge={getScoreBadge}
                  activeTab={activeTab}
                />
              ) : (
                <div className="text-center py-16">
                  <svg className="mx-auto h-16 w-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-foreground mb-2">No trials found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Try adjusting your filters to see more results. You can search by intervention, phase, status, or date range.
                  </p>
                  <button
                    onClick={() => {
                      setFilters({
                        condition: '',
                        phase: '',
                        intervention: '',
                        study_type: activeTab === 'interventional' ? 'INTERVENTIONAL' : 'OBSERVATIONAL',
                        status: '',
                        sponsor: '',
                        enrollmentMin: '',
                        enrollmentMax: '',
                        location: '',
                        nearMe: false
                      });
                    }}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialExplorer; 