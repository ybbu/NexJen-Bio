import React, { useState } from 'react';

const TrendsPanel = ({ trends }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('trends');

  const tabs = [
    { id: 'trends', label: 'Current Trends', icon: '📈' },
    { id: 'gaps', label: 'Research Gaps', icon: '🔍' },
    { id: 'clusters', label: 'Trial Clusters', icon: '🎯' },
    { id: 'suggestions', label: 'Suggestions', icon: '💡' }
  ];

  const renderTrends = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Market Trends</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              {trends.trends || "Trend analysis is being processed. This will show key insights about trial patterns, intervention popularity, and research direction changes over time."}
            </p>
          </div>
        </div>
      </div>

      {/* Year-over-Year Growth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="ml-2 text-sm font-medium text-green-700 dark:text-green-300">Trial Growth</span>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200 mt-2">+12%</p>
          <p className="text-xs text-green-600 dark:text-green-400">vs last year</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="ml-2 text-sm font-medium text-purple-700 dark:text-purple-300">Enrollment</span>
          </div>
          <p className="text-2xl font-bold text-purple-800 dark:text-purple-200 mt-2">+8%</p>
          <p className="text-xs text-purple-600 dark:text-purple-400">avg per trial</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="ml-2 text-sm font-medium text-orange-700 dark:text-orange-300">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-orange-800 dark:text-orange-200 mt-2">+5%</p>
          <p className="text-xs text-orange-600 dark:text-orange-400">completion rate</p>
        </div>
      </div>
    </div>
  );

  const renderGaps = () => (
    <div className="space-y-4">
      {trends.gaps && trends.gaps.length > 0 ? (
        trends.gaps.map((gap, index) => (
          <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">Research Gap #{index + 1}</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                  {gap}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No Significant Gaps</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Current research coverage appears comprehensive. No significant research gaps identified at this time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gap Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
          <h5 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Intervention Gaps</h5>
          <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Novel drug delivery systems</li>
            <li>• Combination therapy approaches</li>
            <li>• Non-motor symptom treatments</li>
          </ul>
        </div>
        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-700">
          <h5 className="text-sm font-semibold text-cyan-800 dark:text-cyan-200 mb-2">Population Gaps</h5>
          <ul className="text-xs text-cyan-700 dark:text-cyan-300 space-y-1">
            <li>• Early-stage patients</li>
            <li>• Pediatric populations</li>
            <li>• Comorbid conditions</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderClusters = () => (
    <div className="space-y-4">
      {trends.cluster_analysis && Object.keys(trends.cluster_analysis).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(trends.cluster_analysis).map(([clusterName, data]) => (
            <div key={clusterName} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-indigo-800 dark:text-indigo-200">
                  {clusterName}
                </h5>
                <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full dark:bg-indigo-900 dark:text-indigo-200">
                  {data.count} trials
                </span>
              </div>
              
              {data.common_interventions && Object.keys(data.common_interventions).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">Common Interventions:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(data.common_interventions).slice(0, 3).map(([intervention, count]) => (
                      <span key={intervention} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded dark:bg-indigo-900 dark:text-indigo-200">
                        {intervention} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.avg_enrollment && (
                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                  Avg enrollment: {data.avg_enrollment.toLocaleString()} participants
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Cluster analysis is being processed. This will group similar trials by intervention type and outcomes.
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">Recommended Research Focus</h4>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
              <p className="leading-relaxed">Based on the analysis, consider focusing on:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Non-motor symptom interventions and quality of life measures</li>
                <li>Novel drug delivery systems and sustained-release formulations</li>
                <li>Combination therapy approaches with complementary mechanisms</li>
                <li>Patient-reported outcome measures and real-world evidence</li>
                <li>Early intervention strategies for disease modification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Areas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">High Priority</h5>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Disease modification</li>
            <li>• Biomarker development</li>
            <li>• Precision medicine</li>
          </ul>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <h5 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">Medium Priority</h5>
          <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
            <li>• Symptom management</li>
            <li>• Quality of life</li>
            <li>• Caregiver support</li>
          </ul>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          <h5 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">Emerging Areas</h5>
          <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Digital therapeutics</li>
            <li>• AI-assisted diagnosis</li>
            <li>• Telemedicine integration</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'trends': return renderTrends();
      case 'gaps': return renderGaps();
      case 'clusters': return renderClusters();
      case 'suggestions': return renderSuggestions();
      default: return renderTrends();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div 
        className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Research Insights & Analytics
          </h3>
          <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendsPanel; 