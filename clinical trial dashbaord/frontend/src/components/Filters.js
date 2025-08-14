import React, { useState } from 'react';

const Filters = ({ filters, onFilterChange, activeTab, showTitle = true }) => {
  const [isExpanded, setIsExpanded] = useState(!showTitle);

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const phases = [
    { value: '', label: 'All Phases' },
    { value: 'PHASE1', label: 'Phase 1' },
    { value: 'PHASE2', label: 'Phase 2' },
    { value: 'PHASE3', label: 'Phase 3' },
    { value: 'PHASE4', label: 'Phase 4' },
    { value: 'EARLY_PHASE1', label: 'Early Phase 1' },
    { value: 'NOT_APPLICABLE', label: 'Not Applicable' }
  ];

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'Recruiting', label: 'Recruiting' },
    { value: 'Active, not recruiting', label: 'Active, not recruiting' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Terminated', label: 'Terminated' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Withdrawn', label: 'Withdrawn' },
    { value: 'Unknown status', label: 'Unknown status' }
  ];

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Netherlands',
    'Belgium',
    'Switzerland',
    'Austria',
    'Sweden',
    'Norway',
    'Denmark',
    'Finland',
    'Australia',
    'Japan',
    'South Korea',
    'China',
    'India',
    'Brazil',
    'Mexico',
    'Argentina',
    'South Africa',
    'Israel'
  ];

  const commonInterventions = [
    'rotigotine', 'opicapone', 'rasagiline', 'levodopa', 'carbidopa',
    'pramipexole', 'ropinirole', 'apomorphine', 'amantadine', 'entacapone',
    'tolcapone', 'selegiline', 'bromocriptine', 'pergolide', 'cabergoline'
  ];

  const clearAllFilters = () => {
    onFilterChange({
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
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {showTitle && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Advanced Filters
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {(isExpanded || !showTitle) && (
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* What Phase? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What Phase?
                </label>
                <select
                  value={filters.phase || ''}
                  onChange={(e) => handleFilterChange('phase', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                >
                  {phases.map(phase => (
                    <option key={phase.value} value={phase.value}>
                      {phase.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* What Status? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What Status?
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Where? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Where?
                </label>
                <div className="space-y-3">
                  <select
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.nearMe || false}
                      onChange={(e) => handleFilterChange('nearMe', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Near me
                    </span>
                  </label>
                </div>
              </div>

              {/* What Intervention? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What Intervention?
                </label>
                <input
                  type="text"
                  value={filters.intervention || ''}
                  onChange={(e) => handleFilterChange('intervention', e.target.value)}
                  placeholder="Enter intervention name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {commonInterventions.slice(0, 8).map(intervention => (
                    <button
                      key={intervention}
                      onClick={() => handleFilterChange('intervention', intervention)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        filters.intervention === intervention
                          ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                    >
                      {intervention}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Clear All Filters Button */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearAllFilters}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters; 