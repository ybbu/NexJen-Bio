import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { RefreshCw, ChevronDown, ChevronRight, Calendar, ExternalLink } from 'lucide-react';

const ResearchInsights = () => {
  const [activeTab, setActiveTab] = useState('emerging');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    timeframe: '1y',
    condition: '',
    phase: '',
    country: '',
    status: ''
  });
  const [showDescription, setShowDescription] = useState(false);
  const [selectedMoA, setSelectedMoA] = useState(null);
  const [moaTrials, setMoaTrials] = useState([]);
  const [loadingTrials, setLoadingTrials] = useState(false);
  const [showWhitespaceDescription, setShowWhitespaceDescription] = useState(false);
  const [showFeasibilityDescription, setShowFeasibilityDescription] = useState(false);
  const [showStrategyDescription, setShowStrategyDescription] = useState(false);
  const [showDensityDescription, setShowDensityDescription] = useState(false);

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const fetchInsightsData = async () => {
    setLoading(true);
    try {
      // Build query parameters from filters
      const params = {};
      if (filters.condition) params.condition = filters.condition;
      if (filters.phase) params.phase = filters.phase;
      if (filters.country) params.country = filters.country;
      if (filters.status) params.status = filters.status;
      if (filters.timeframe) params.timeframe = filters.timeframe;
      
      const response = await axios.get(`${config.apiBaseUrl}/insights/emerging`, { params });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching insights data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tabName) => {
    setLoading(true);
    try {
      // For therapeutic opportunities, use placeholder data instead of API
      if (tabName === 'opportunities') {
        console.log('Using placeholder data for therapeutic opportunities');
        setData({
          ...data, // Keep existing data for other tabs
          whitespace: [
            {
              condition: "Parkinson's Disease",
              region: "North America",
              whitespace_score: -0.45,
              trial_count: 12,
              avg_quality_score: 8.2,
              burden_prevalence: 1.2
            },
            {
              condition: "Alzheimer's Disease",
              region: "Europe",
              whitespace_score: -0.38,
              trial_count: 8,
              avg_quality_score: 7.8,
              burden_prevalence: 2.1
            },
            {
              condition: "Multiple Sclerosis",
              region: "Asia Pacific",
              whitespace_score: -0.52,
              trial_count: 15,
              avg_quality_score: 8.5,
              burden_prevalence: 0.8
            },
            {
              condition: "Huntington's Disease",
              region: "North America",
              whitespace_score: -0.67,
              trial_count: 6,
              avg_quality_score: 9.1,
              burden_prevalence: 0.3
            },
            {
              condition: "Amyotrophic Lateral Sclerosis",
              region: "Europe",
              whitespace_score: -0.41,
              trial_count: 9,
              avg_quality_score: 8.7,
              burden_prevalence: 0.5
            }
          ],
          density: [
            {
              moa: "Dopamine Agonists",
              condition: "Parkinson's Disease",
              phase: "Phase 2",
              hhi_score: 1850,
              trial_count: 18,
              sponsor_count: 12,
              avg_quality_score: 8.3
            },
            {
              moa: "Beta-Amyloid Inhibitors",
              condition: "Alzheimer's Disease",
              phase: "Phase 3",
              hhi_score: 3200,
              trial_count: 25,
              sponsor_count: 8,
              avg_quality_score: 7.9
            },
            {
              moa: "Immune Modulators",
              condition: "Multiple Sclerosis",
              phase: "Phase 2",
              hhi_score: 1450,
              trial_count: 22,
              sponsor_count: 15,
              avg_quality_score: 8.6
            },
            {
              moa: "Gene Therapy Vectors",
              condition: "Huntington's Disease",
              phase: "Phase 1",
              hhi_score: 2100,
              trial_count: 8,
              sponsor_count: 6,
              avg_quality_score: 9.2
            },
            {
              moa: "Stem Cell Therapies",
              condition: "Amyotrophic Lateral Sclerosis",
              phase: "Phase 1/2",
              hhi_score: 1680,
              trial_count: 14,
              sponsor_count: 11,
              avg_quality_score: 8.8
            }
          ],
          feasibility: {
            median_enroll_rate_per_site_per_month: 2.8,
            recruitment_context: "Strong enrollment momentum in neurology trials"
          }
        });
        setLoading(false);
        return;
      }

      // For other tabs, use API calls as normal
      const params = {};
      if (filters.condition) params.condition = filters.condition;
      if (filters.phase) params.phase = filters.phase;
      if (filters.country) params.country = filters.country;
      if (filters.status) params.status = filters.status;
      if (filters.timeframe) params.timeframe = filters.timeframe;
      
      let endpoint = '';
      switch (tabName) {
        case 'strategy':
          endpoint = '/insights/strategy';
          break;
        default:
          endpoint = '/insights/emerging';
      }
      
      const response = await axios.get(`${config.apiBaseUrl}${endpoint}`, { params });
      setData(response.data);
    } catch (error) {
      console.error(`Error fetching ${tabName} data:`, error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Fetch new data when filters change
    fetchTabData(activeTab);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    fetchTabData(tabName);
  };

  const handleTrialsClick = async (moa) => {
    setSelectedMoA(moa);
    setLoadingTrials(true);
    
    try {
      console.log('Fetching trials for MoA:', moa);
      // Build query parameters from filters
      const params = { moa };
      if (filters.condition) params.condition = filters.condition;
      if (filters.phase) params.phase = filters.phase;
      if (filters.country) params.country = filters.country;
      if (filters.status) params.status = filters.status;
      if (filters.timeframe) params.timeframe = filters.timeframe;
      
      console.log('Request params:', params);
      const response = await axios.get(`${config.apiBaseUrl}/insights/moa-trials`, { params });
      console.log('Response:', response.data);
      setMoaTrials(response.data.trials || []);
    } catch (error) {
      console.error('Error fetching MoA trials:', error);
      setMoaTrials([]);
    } finally {
      setLoadingTrials(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    } catch (error) {
      return 'N/A';
    }
  };

  const renderQualityScore = (score) => {
    if (!score) return <span className="text-gray-400">N/A</span>;
    
    let colorClass = '';
    if (score >= 4.0) colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    else if (score >= 3.0) colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    else if (score >= 2.0) colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    else if (score >= 1.0) colorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    else colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {score.toFixed(1)}
      </span>
    );
  };

  const renderEmergingTechnologies = () => {
    if (!data.emerging_technologies || data.emerging_technologies.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No emerging technologies data available
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Combined Header and Description */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Emerging Mechanisms</h3>
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showDescription ? (
                <>
                  Hide <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Explain <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          
          {showDescription && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This list highlights mechanisms and modalities that show clinical trial activity and meet quality thresholds for emerging potential. Selection criteria: Quality Score ≥ 1.5 • Growth trend (Δ3M &gt; -5 or CAGR &gt; -20%) • Phase 2+ weighting • Minimum 1 trial
              </p>
            </div>
          )}
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  MoA (Modality)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Emerging Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Δ3M
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CAGR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Quality Score
                    <span className="text-gray-400" title="Quality score based on trial design, phase, and sponsor quality">
                      ⓘ
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Novelty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Targets
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.emerging_technologies.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.moa}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.modality}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.emerging_score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.delta_3m}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.cagr_12m ? `${item.cagr_12m.toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderQualityScore(item.median_quality_score)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.novelty_score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <button
                      onClick={() => handleTrialsClick(item.moa)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline cursor-pointer"
                    >
                      {item.trial_count}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.target_genes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTherapeuticOpportunities = () => {
    console.log('Current data in renderTherapeuticOpportunities:', data);
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Whitespace Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Therapeutic Gaps
              </h3>
              <button
                onClick={() => setShowWhitespaceDescription(!showWhitespaceDescription)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showWhitespaceDescription ? (
                  <>
                    Hide <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Explain <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
            {showWhitespaceDescription && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Highlights under-served condition–region areas with high disease burden but low clinical trial activity.
                </p>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <p><strong>Score Guide:</strong> Negative scores indicate gaps (good opportunities), positive scores indicate saturation.</p>
                  <p><strong>Green:</strong> High opportunity (-0.3 or lower) | <strong>Yellow:</strong> Moderate (0 to -0.3) | <strong>Red:</strong> Saturated (above 0)</p>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : (data.whitespace && data.whitespace.length > 0) ? (
              <div className="space-y-3">
                {data.whitespace.slice(0, 5).map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div 
                          className="font-medium text-gray-900 dark:text-white cursor-help"
                          title={getConditionTooltip(item.condition)}
                        >
                          {formatCondition(item.condition)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{item.region}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(item.whitespace_score, 'whitespace')}`}>
                          {item.whitespace_score.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">gap score</div>
                      </div>
                    </div>
                    
                    {/* Additional metrics */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-gray-700 dark:text-gray-300">{item.trial_count}</div>
                        <div className="text-gray-500">trials</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-700 dark:text-gray-300">{item.avg_quality_score?.toFixed(1) || 'N/A'}</div>
                        <div className="text-gray-500">quality</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-700 dark:text-gray-300">{item.burden_prevalence?.toFixed(1) || 'N/A'}</div>
                        <div className="text-gray-500">burden</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No whitespace data available</div>
            )}
          </div>

          {/* Competitive Density */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Competitive Density
              </h3>
              <button
                onClick={() => setShowDensityDescription(!showDensityDescription)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showDensityDescription ? (
                  <>
                    Hide <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Explain <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
            {showDensityDescription && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Shows how concentrated trial activity is among a few sponsors for each therapeutic space.
                </p>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <p><strong>HHI Score Guide:</strong> Higher scores indicate more concentrated competition.</p>
                  <p><strong>Green:</strong> Low concentration (≤1500) | <strong>Yellow:</strong> Medium (1500-2500) | <strong>Red:</strong> High concentration (≥2500)</p>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : (data.density && data.density.length > 0) ? (
              <div className="space-y-3">
                {data.density.slice(0, 5).map((item, index) => {
                  const competition = getCompetitionLevel(item.hhi_score);
                  return (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{item.moa}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCondition(item.condition)} • {item.phase?.replace('_', ' ') || 'N/A'}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`px-2 py-1 text-xs font-medium rounded-full ${competition.color}`}>
                            {competition.level}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">HHI: {item.hhi_score?.toFixed(0) || 'N/A'}</div>
                        </div>
                      </div>
                      
                      {/* Additional metrics */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium text-gray-700 dark:text-gray-300">{item.trial_count}</div>
                          <div className="text-gray-500">trials</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-700 dark:text-gray-300">{item.sponsor_count}</div>
                          <div className="text-gray-500">sponsors</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-700 dark:text-gray-300">{item.avg_quality_score?.toFixed(1) || 'N/A'}</div>
                          <div className="text-gray-500">quality</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No competitive density data available</p>
                <p className="text-sm mt-2 text-gray-400">This section shows areas with high competition</p>
              </div>
            )}
          </div>
        </div>

        {/* Enrollment Feasibility */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Enrollment Feasibility
            </h3>
            <button
              onClick={() => setShowFeasibilityDescription(!showFeasibilityDescription)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showFeasibilityDescription ? (
                <>
                  Hide <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Explain <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          
          {showFeasibilityDescription && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Estimates how quickly and effectively trials in a given space can recruit participants per site.
              </p>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <p><strong>Benchmark:</strong> Typical enrollment rates vary by disease area and trial phase.</p>
                <p><strong>Higher rates</strong> indicate easier recruitment, <strong>lower rates</strong> suggest challenges.</p>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : data.feasibility ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Median Enrollment Rate</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatEnrollmentRate(data.feasibility.median_enroll_rate_per_site_per_month)}
                </div>
                <div className="text-xs text-gray-500">participants per site per month</div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Recruitment Context</div>
                <div className="text-sm text-gray-900 dark:text-white mt-2">
                  {data.feasibility.median_enroll_rate_per_site_per_month > 0 ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${
                          data.feasibility.median_enroll_rate_per_site_per_month >= 2 ? 'bg-green-500' :
                          data.feasibility.median_enroll_rate_per_site_per_month >= 1 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium">
                          {data.feasibility.median_enroll_rate_per_site_per_month >= 2 ? 'Good' :
                           data.feasibility.median_enroll_rate_per_site_per_month >= 1 ? 'Moderate' : 'Challenging'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {data.feasibility.median_enroll_rate_per_site_per_month >= 2 ? 'Recruitment should be manageable' :
                         data.feasibility.median_enroll_rate_per_site_per_month >= 1 ? 'May require additional sites or time' : 'Consider alternative recruitment strategies'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No enrollment data available</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No feasibility data available</div>
          )}
        </div>
      </div>
    );
  };

  const renderInvestmentActivity = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Investment Activity
          </h3>
          <button
            onClick={() => window.location.href = '/bd-ipo-scoring'}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View BD & IPO Scoring
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        
        {/* BD Activity Summary - Soft-tint panels with reduced saturation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(30, 100, 181, 0.1)' }}>
            <div className="text-sm font-medium" style={{ color: '#1E64B5' }}>Active Partnerships</div>
            <div className="text-2xl font-bold" style={{ color: '#1E64B5' }}>12</div>
            <div className="text-xs" style={{ color: '#1E64B5' }}>+3 this quarter</div>
          </div>
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(42, 143, 107, 0.1)' }}>
            <div className="text-sm font-medium" style={{ color: '#2A8F6B' }}>Deal Value</div>
            <div className="text-2xl font-bold" style={{ color: '#2A8F6B' }}>$2.4B</div>
            <div className="text-xs" style={{ color: '#2A8F6B' }}>+18% YoY</div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">IPO Readiness</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">78%</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Target: 85%</div>
          </div>
        </div>

        {/* Recent BD Activities */}
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Recent Business Development Activities</h4>
          
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Strategic Partnership with BioPharm Inc.</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Phase 2 Parkinson's therapy collaboration</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: '#2A8F6B' }}>$450M</div>
                  <div className="text-xs text-gray-500">Dec 2024</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Licensing Agreement - GeneTech Solutions</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CRISPR-based Huntington's treatment</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: '#1E64B5' }}>$320M</div>
                  <div className="text-xs text-gray-500">Nov 2024</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Acquisition - NeuroStem Therapeutics</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Stem cell platform technology</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: '#8B5CF6' }}>$180M</div>
                  <div className="text-xs text-gray-500">Oct 2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentPublications = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Publications
          </h3>
          <button
            onClick={() => window.location.href = '/literature-synthesizer'}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View Literature Synthesizer
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        
        {/* Publication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Publications</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">47</div>
            <div className="text-xs text-gray-500">Last 12 months</div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Impact Factor</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">8.7</div>
            <div className="text-xs text-gray-500">+0.3 vs last year</div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Citations</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1,240</div>
            <div className="text-xs text-gray-500">+15% YoY</div>
          </div>
        </div>

        {/* Recent Papers */}
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Latest Research Papers</h4>
          
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  Novel Therapeutic Approaches in Parkinson's Disease: A Meta-Analysis
                </h5>
                <span 
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{ color: '#2A8F6B', backgroundColor: '#E6F6EE' }}
                >
                  Impact: 9.2
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Comprehensive analysis of emerging treatment modalities and their clinical implications for Parkinson's disease management.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                  Parkinson's Disease
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                  Therapeutics
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                  Meta-Analysis
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Published in Nature Reviews Neurology • Dec 2024 • 15 citations
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  CRISPR-Cas9 Applications in Neurodegenerative Disorders
                </h5>
                <span 
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{ color: '#B45309', backgroundColor: '#FEF3C7' }}
                >
                  Impact: 8.8
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Exploration of gene editing technologies for treating Huntington's disease and other genetic neurological conditions.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                  CRISPR-Cas9
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                  Gene Therapy
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                  Huntington's
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Published in Cell • Nov 2024 • 23 citations
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  Stem Cell Therapies for Multiple Sclerosis: Clinical Trial Outcomes
                </h5>
                <span 
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{ color: '#2A8F6B', backgroundColor: '#E6F6EE' }}
                >
                  Impact: 9.1
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Analysis of phase 2 clinical trial results for mesenchymal stem cell transplantation in MS patients.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                  Stem Cells
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                  Multiple Sclerosis
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                  Clinical Trials
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Published in The Lancet Neurology • Oct 2024 • 31 citations
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategicGuidance = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Strategic Recommendations
          </h3>
          <button
            onClick={() => setShowStrategyDescription(!showStrategyDescription)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showStrategyDescription ? (
              <>
                Hide <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Explain <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        
        {showStrategyDescription && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Provides actionable insights and strategic direction based on comprehensive analysis of trial data, competitive landscape, and market opportunities.
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : data.strategy ? (
          <div className="space-y-6">
            {/* Now Section */}
            <div>
              <h4 className="text-md font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Act Now
              </h4>
              <div className="space-y-3">
                {data.strategy.now?.map((item, index) => (
                  <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{item.title}</h5>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="font-medium mb-1">Why:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {item.why.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Section */}
            <div>
              <h4 className="text-md font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Next Steps
              </h4>
              <div className="space-y-3">
                {data.strategy.next?.map((item, index) => (
                  <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{item.title}</h5>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="font-medium mb-1">Why:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {item.why.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Watch Section */}
            <div>
              <h4 className="text-md font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Watch & Monitor
              </h4>
              <div className="space-y-3">
                {data.strategy.watch?.map((item, index) => (
                  <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{item.title}</h5>
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="font-medium mb-1">Why:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {item.why.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No strategic guidance data available</div>
        )}
      </div>
    </div>
  );

  const renderMoABreakdown = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mechanism of Action Breakdown</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Show top 5 MoAs by trial count */}
        {data.moa_breakdown?.slice(0, 5).map((item, index) => (
          <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${
            item.moa === 'Unknown'
              ? 'bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500'
              : 'bg-gray-50 dark:bg-gray-700'
          }`}>
            <div>
              <div className={`font-medium ${item.moa === 'Unknown' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {item.moa === 'Unknown' ? 'Unclassified Interventions' : item.moa}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{item.modality}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900 dark:text-white">{item.trial_count}</div>
              <div className="text-xs text-gray-500">
                {item.trial_count === 1 ? 'trial' : 'trials'}
              </div>
            </div>
          </div>
        ))}
        
        {/* Always show Unclassified if it exists and isn't in top 5 */}
        {data.moa_breakdown?.find(item => item.moa === 'Unknown') && 
         !data.moa_breakdown?.slice(0, 5).find(item => item.moa === 'Unknown') && (
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500">
            <div>
              <div className="font-medium text-gray-500 dark:text-gray-400">Unclassified Interventions</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unknown</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900 dark:text-white">
                {data.moa_breakdown?.find(item => item.moa === 'Unknown')?.trial_count || 0}
              </div>
              <div className="text-xs text-gray-500">trials</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTrialsSidebar = () => {
    if (!selectedMoA) return null;

    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-card text-card-foreground border-l p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedMoA(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold">{selectedMoA}</h3>
            <p className="text-sm text-muted-foreground">Individual Trials</p>
          </div>

          {loadingTrials ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <div className="text-lg font-medium">Loading trials...</div>
              </div>
            </div>
          ) : moaTrials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No trials found for this mechanism of action.</p>
              <p className="text-sm mt-2">Try adjusting your filters or check the data source.</p>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p>Debug info:</p>
                <p>MoA: {selectedMoA}</p>
                <p>Filters: {JSON.stringify(filters)}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-3">
                Showing {moaTrials.length} most recent trials
              </div>
              {moaTrials.map((trial, index) => (
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
                    {trial.startDate && trial.startDate !== 'N/A' && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {formatDate(trial.startDate)}</span>
                      </div>
                    )}

                    {/* View Details Link */}
                    <div className="mt-3">
                      <a
                        href={`https://clinicaltrials.gov/ct2/show/${trial.nctId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'opportunities':
        return renderTherapeuticOpportunities();
      case 'investment':
        return renderInvestmentActivity();
      case 'publications':
        return renderRecentPublications();
      case 'strategy':
        return renderStrategicGuidance();
      default:
        return (
          <div className="space-y-6">
            {renderEmergingTechnologies()}
            {renderMoABreakdown()}
          </div>
        );
    }
  };

  const formatCondition = (conditionString) => {
    if (!conditionString || conditionString === 'N/A') return 'N/A';
    
    // Split by pipe and clean up
    const conditions = conditionString.split('|').map(c => c.trim()).filter(c => c);
    
    if (conditions.length === 1) return conditions[0];
    
    // If multiple conditions, show primary + count
    const primary = conditions[0];
    const additional = conditions.length - 1;
    return `${primary} +${additional} more`;
  };

  const getConditionTooltip = (conditionString) => {
    if (!conditionString || conditionString === 'N/A') return 'No condition data';
    
    const conditions = conditionString.split('|').map(c => c.trim()).filter(c => c);
    if (conditions.length === 1) return conditions[0];
    
    return conditions.map((c, i) => `${i + 1}. ${c}`).join('\n');
  };

  const getScoreColor = (score, type = 'whitespace') => {
    if (type === 'whitespace') {
      // Whitespace scores: negative is good (gap), positive is bad (saturated)
      if (score <= -0.3) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      if (score <= 0) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
    } else if (type === 'density') {
      // Density scores: higher = more concentrated
      if (score <= 1500) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      if (score <= 2500) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
    }
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatEnrollmentRate = (rate) => {
    if (!rate || rate === 0) return 'No data';
    return `${rate.toFixed(1)}`;
  };

  const getCompetitionLevel = (hhiScore) => {
    if (hhiScore === null || hhiScore === undefined) {
      return { level: 'N/A', color: 'bg-gray-100 dark:bg-gray-600 text-gray-500' };
    }
    if (hhiScore <= 1500) {
      return { level: 'Low Concentration', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    } else if (hhiScore <= 2500) {
      return { level: 'Medium Concentration', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    } else {
      return { level: 'High Concentration', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    }
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
            ← Back to Trial Explorer
          </button>
          <div className="w-px h-6 bg-border"></div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Research Insights</h1>
            <p className="text-muted-foreground">
              Identify gaps, opportunities, and emerging directions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchInsightsData}
            className="p-2 rounded-lg border hover:bg-muted"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.timeframe}
            onChange={(e) => handleFilterChange({ ...filters, timeframe: e.target.value })}
            className="px-3 py-2 border rounded-lg text-base"
          >
            <option value="1y">Last 1 year</option>
            <option value="5y">Last 5 years</option>
            <option value="10y">Last 10 years</option>
            <option value="all">All time</option>
          </select>
          
          <select
            value={filters.condition}
            onChange={(e) => handleFilterChange({ ...filters, condition: e.target.value })}
            className="px-3 py-2 border rounded-lg text-base"
          >
            <option value="">All Conditions</option>
            <option value="Parkinson's Disease">Parkinson's Disease</option>
            <option value="Alzheimer's Disease">Alzheimer's Disease</option>
            <option value="Multiple Sclerosis">Multiple Sclerosis</option>
          </select>
          
          <select
            value={filters.phase}
            onChange={(e) => handleFilterChange({ ...filters, phase: e.target.value })}
            className="px-3 py-2 border rounded-lg text-base"
          >
            <option value="">All Phases</option>
            <option value="1">Phase 1</option>
            <option value="2">Phase 2</option>
            <option value="3">Phase 3</option>
            <option value="4">Phase 4</option>
          </select>
          
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange({ ...filters, country: e.target.value })}
            className="px-3 py-2 border rounded-lg text-base"
          >
            <option value="">All Countries</option>
            <option value="United States">United States</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded-lg text-base"
          >
            <option value="">All Statuses</option>
            <option value="RECRUITING">Recruiting</option>
            <option value="ACTIVE_NOT_RECRUITING">Active, Not Recruiting</option>
            <option value="COMPLETED">Completed</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card text-card-foreground rounded-xl border">
        <div className="flex border-b">
          {[
            { key: 'emerging', label: 'Emerging Technologies' },
            { key: 'opportunities', label: 'Therapeutic Opportunities' },
            { key: 'investment', label: 'Investment Activity' },
            { key: 'publications', label: 'Recent Publications' },
            { key: 'strategy', label: 'Strategic Guidance' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <div className="text-lg font-medium">Loading insights...</div>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Trials Sidebar */}
      {renderTrialsSidebar()}
    </div>
  );
};

export default ResearchInsights;
