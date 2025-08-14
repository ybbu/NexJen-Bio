import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TrialExplorer from './components/TrialExplorer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CollaborationNetwork from './components/CollaborationNetwork';
import ResearchInsights from './components/ResearchInsights';
import TrialDatabase from './components/TrialDatabase';
import Reports from './components/Reports';

import './App.css';

function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [activeSection, setActiveSection] = useState('explorer');
  const [trackerActiveTab, setTrackerActiveTab] = useState('overview');

  // Handle section changes from TrialExplorer buttons
  useEffect(() => {
    const handleSectionChange = (event) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('changeSection', handleSectionChange);
    return () => window.removeEventListener('changeSection', handleSectionChange);
  }, []);

  // Configure axios base URL
  axios.defaults.baseURL = 'http://localhost:8000';

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Trial Tracker page component
  const TrialTrackerPage = () => {
    const [selectedTrial, setSelectedTrial] = useState(null);
    const [trialDetailTab, setTrialDetailTab] = useState('timeline');

    // Sample trial data
    const trials = [
      {
        id: 'NCT04567823',
        title: 'Phase 2 Study of Novel Gene Therapy for Parkinson\'s Disease',
        phase: 'Phase 2',
        condition: 'Parkinson\'s Disease',
        status: 'Recruiting',
        currentEnrollment: 85,
        targetEnrollment: 120,
        startDate: '2023-01-15',
        expectedCompletion: '2024-12-30',
        sponsor: 'Neurogen Therapeutics'
      },
      {
        id: 'NCT05678912',
        title: 'Multicenter Trial of Stem Cell Therapy in Advanced Parkinson\'s',
        phase: 'Phase 1/2',
        condition: 'Parkinson\'s Disease',
        status: 'Active, not recruiting',
        currentEnrollment: 45,
        targetEnrollment: 60,
        startDate: '2022-09-10',
        expectedCompletion: '2024-06-15',
        sponsor: 'Advanced Cell Technologies'
      },
      {
        id: 'NCT06789012',
        title: 'Deep Brain Stimulation Optimization Study',
        phase: 'Phase 3',
        condition: 'Parkinson\'s Disease',
        status: 'Completed',
        currentEnrollment: 200,
        targetEnrollment: 200,
        startDate: '2021-03-20',
        expectedCompletion: '2023-11-30',
        sponsor: 'Medtronic Inc.'
      }
    ];

    const renderOverview = () => (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card text-card-foreground rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">Active Trials</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <h3 className="text-base font-medium text-green-800 dark:text-green-200">Recruiting</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">Phase 2 Study</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">156</div>
                  <div className="text-sm text-green-500">trials</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <h3 className="text-base font-medium text-blue-800 dark:text-blue-200">Active</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Not recruiting</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">89</div>
                  <div className="text-sm text-blue-500">trials</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div>
                  <h3 className="text-base font-medium text-purple-800 dark:text-purple-200">Completed</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Results pending</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">67</div>
                  <div className="text-sm text-purple-500">trials</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trial Progress */}
          <div className="bg-card text-card-foreground rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">Phase Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Phase 1</span>
                  <span>23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Phase 2</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Phase 3</span>
                  <span>28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Phase 4</span>
                  <span>4%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '4%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-card text-card-foreground rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <h3 className="font-medium text-sm">NCT04567823</h3>
                  <p className="text-xs text-muted-foreground">Phase 2 completed</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <h3 className="font-medium text-sm">NCT05678912</h3>
                  <p className="text-xs text-muted-foreground">Enrollment milestone reached</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                <div>
                  <h3 className="font-medium text-sm">NCT06789012</h3>
                  <p className="text-xs text-muted-foreground">Protocol amendment submitted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trial List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">All Studies</h3>
          <div className="space-y-3">
            {trials.map((trial) => (
              <div 
                key={trial.id}
                onClick={() => setSelectedTrial(trial)}
                className="p-4 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium">{trial.title}</h4>
                    <p className="text-base text-muted-foreground">{trial.id} • {trial.phase} • {trial.condition}</p>
                    <p className="text-sm text-muted-foreground mt-1">Click to view details and analytics</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trial.status === 'Recruiting' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      trial.status === 'Active, not recruiting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {trial.status}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{trial.currentEnrollment}/{trial.targetEnrollment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const renderTrialDetail = (trial) => {
      const tabs = [
        { id: 'timeline', label: 'Trial Timeline' },
        { id: 'design', label: 'Design & Optimization' },
        { id: 'implementation', label: 'Implementation & Risk' },
        { id: 'monitoring', label: 'Monitoring & Success' }
      ];

      return (
        <div className="space-y-6">
          {/* Trial Header */}
          <div className="flex items-center justify-between">
            <div>
              <button 
                onClick={() => setSelectedTrial(null)}
                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
              >
                ← Back to All Studies
              </button>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{trial.title}</h2>
              <p className="text-muted-foreground">{trial.id} • {trial.sponsor}</p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                trial.status === 'Recruiting' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                trial.status === 'Active, not recruiting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
              }`}>
                {trial.status}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTrialDetailTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    trialDetailTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {trialDetailTab === 'timeline' && renderTimeline(trial)}
          {trialDetailTab === 'design' && renderDesign(trial)}
          {trialDetailTab === 'implementation' && renderImplementation(trial)}
          {trialDetailTab === 'monitoring' && renderMonitoring(trial)}
        </div>
      );
    };

    const renderTimeline = (trial) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Trial Timeline</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Trial Initiation</h3>
                <p className="text-sm text-muted-foreground">First patient enrolled</p>
                <span className="text-xs text-muted-foreground">{trial.startDate}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Current Phase: {trial.phase}</h3>
                <p className="text-sm text-muted-foreground">Enrollment: {trial.currentEnrollment}/{trial.targetEnrollment}</p>
                <span className="text-xs text-muted-foreground">Status: {trial.status}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Expected Completion</h3>
                <p className="text-sm text-muted-foreground">Results and next phase planning</p>
                <span className="text-xs text-muted-foreground">{trial.expectedCompletion}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const renderDesign = (trial) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Design Phase - Optimization & Risk Assessment</h2>
        
        {/* Design Red Flags */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Design Red Flags Detection</h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">✗</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-red-800 dark:text-red-200">
                    Small Sample Size
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                    Current n={trial.targetEnrollment} may be insufficient for 90% power. Consider increasing to n={Math.round(trial.targetEnrollment * 1.33)}.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">⚠</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    High Dropout Risk
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Complex dosing schedule may lead to 15-20% dropout. Consider simplified regimen.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Optimization Recommendations</h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">🎯</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Implement Adaptive Randomization
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Use response-adaptive randomization to allocate more patients to promising treatment arms.
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    <strong>Expected Impact:</strong> +8% PoS, +12% enrollment efficiency
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const renderImplementation = (trial) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Implementation Phase - Enrollment Risk Forecast</h2>
        
        {/* Enrollment Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">On Track</div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {Math.round((trial.currentEnrollment / trial.targetEnrollment) * 100)}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⚠</span>
              </div>
              <div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">At Risk</div>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">24%</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✗</span>
              </div>
              <div>
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">Critical</div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">8%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Risk Factors & Early Warnings</h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">⚠</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Site Performance Variance
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    3 sites enrolling 40% below target. Consider additional recruitment support.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const renderMonitoring = (trial) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Monitoring Phase - Success Prediction</h2>
        
        {/* Key Success Drivers */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Key Success Drivers</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Trial Size (n={trial.targetEnrollment})</span>
              </div>
              <div className="text-sm font-medium text-green-600">+15% PoS</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Sponsor Track Record</span>
              </div>
              <div className="text-sm font-medium text-blue-600">+12% PoS</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">MoA Novelty</span>
              </div>
              <div className="text-sm font-medium text-yellow-600">-8% PoS</div>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Success Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Phase 2 → Phase 3</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">78%</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">High confidence</div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">Phase 3 → Approval</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">65%</div>
              <div className="text-xs text-green-600 dark:text-green-400">Medium confidence</div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Overall PoS</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">51%</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Combined probability</div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trial Tracker</h1>
            <p className="text-base text-muted-foreground">
              Track and monitor clinical trials in real-time with predictive analytics
            </p>
          </div>
        </div>

        {/* Content */}
        {selectedTrial ? renderTrialDetail(selectedTrial) : renderOverview()}
      </div>
    );
  };

  // Research Insights page component
  const ResearchInsightsPage = () => (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Research Insights</h1>
          <p className="text-base text-muted-foreground">
            Advanced research insights and trial tracking analytics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Research Trends */}
        <div className="bg-card text-card-foreground rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Research Trends</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <h3 className="text-base font-medium">Parkinson's Disease Trials</h3>
                <p className="text-sm text-muted-foreground">Active research focus</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">+23%</div>
                <div className="text-sm text-muted-foreground">vs last year</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <h3 className="text-base font-medium">Novel Interventions</h3>
                <p className="text-sm text-muted-foreground">Emerging treatments</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">+15</div>
                <div className="text-sm text-muted-foreground">new this quarter</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <h3 className="text-base font-medium">Success Rate</h3>
                <p className="text-sm text-muted-foreground">Phase 2 to Phase 3</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">68%</div>
                <div className="text-sm text-muted-foreground">industry average</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Status Overview */}
        <div className="bg-card text-card-foreground rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Trial Status Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">Recruiting</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-base font-medium">45%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">Active, not recruiting</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <span className="text-base font-medium">30%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">Completed</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <span className="text-base font-medium">20%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">Terminated</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
                <span className="text-base font-medium">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="text-base font-medium">Growing Interest</h3>
            </div>
            <p className="text-base text-muted-foreground">
              Parkinson's disease research has seen a 23% increase in new trials compared to last year, 
              indicating growing pharmaceutical interest in this therapeutic area.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="text-base font-medium">Innovation Focus</h3>
            </div>
            <p className="text-base text-muted-foreground">
              15 new novel interventions entered clinical trials this quarter, 
              with a focus on gene therapy and stem cell treatments.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <h3 className="text-base font-medium">Success Metrics</h3>
            </div>
            <p className="text-base text-muted-foreground">
              The transition rate from Phase 2 to Phase 3 trials is 68%, 
              above the industry average of 60%, indicating strong trial design.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Publications */}
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Publications</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
            <div className="flex-1">
              <h3 className="text-base font-medium">Advances in Parkinson's Disease Treatment</h3>
              <p className="text-base text-muted-foreground mt-1">
                Recent developments in levodopa therapy and novel drug delivery systems show promising results 
                in improving motor symptoms and reducing side effects.
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Nature Medicine • 2024</span>
                <span>Impact Factor: 87.2</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
            <div className="flex-1">
              <h3 className="text-base font-medium">Gene Therapy Approaches in Movement Disorders</h3>
              <p className="text-base text-muted-foreground mt-1">
                Comprehensive review of current gene therapy clinical trials targeting Parkinson's disease 
                and other movement disorders, highlighting safety and efficacy data.
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Cell • 2024</span>
                <span>Impact Factor: 66.8</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div className="flex-1">
              <h3 className="text-base font-medium">Biomarkers in Clinical Trial Design</h3>
              <p className="text-base text-muted-foreground mt-1">
                Analysis of biomarker utilization in Parkinson's disease clinical trials, 
                demonstrating improved patient stratification and trial efficiency.
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Lancet Neurology • 2024</span>
                <span>Impact Factor: 59.9</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // About page component
  const AboutPage = () => (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">About</h1>
          <p className="text-base text-muted-foreground">
            Learn more about the Clinical Study Research Platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card text-card-foreground rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
          <p className="text-base text-muted-foreground mb-4">
            The Clinical Study Research Platform is an AI-powered platform designed to help researchers, 
            clinicians, and pharmaceutical companies discover and analyze clinical trials worldwide.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-base">Advanced search and filtering</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-base">Real-time analytics and insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-base">AI-powered trend analysis</span>
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Technology Stack</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium mb-2">Frontend</h3>
              <div className="text-base text-muted-foreground space-y-1">
                <div>• React 18 with Hooks</div>
                <div>• Tailwind CSS for styling</div>
                <div>• React Router for navigation</div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-medium mb-2">Backend</h3>
              <div className="text-base text-muted-foreground space-y-1">
                <div>• FastAPI (Python)</div>
                <div>• Pandas for data processing</div>
                <div>• ClinicalTrials.gov API</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // API Docs page component
  const ApiDocsPage = () => (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
          <p className="text-base text-muted-foreground">
            Programmatic access to clinical trial data and analytics
          </p>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-4">Base URL</h2>
        <div className="bg-muted rounded-lg p-4 mb-6">
          <code className="text-base">http://localhost:8000</code>
        </div>

        <h2 className="text-xl font-semibold mb-4">Endpoints</h2>
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-base font-semibold mb-2">POST /trials</h3>
            <p className="text-base text-muted-foreground mb-4">
              Retrieve filtered clinical trials with metrics
            </p>
            <div className="bg-muted rounded p-3">
              <pre className="text-base overflow-x-auto">
{`{
  "condition": "Parkinson's Disease",
  "phase": "PHASE2",
  "intervention": "rotigotine",
  "studyType": "INTERVENTIONAL"
}`}
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-base font-semibold mb-2">GET /trends</h3>
            <p className="text-base text-muted-foreground">
              Get trend analysis and research insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'explorer':
        return <TrialExplorer />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'collaboration':
        return <CollaborationNetwork />;
      case 'insights':
        return <ResearchInsights />;
      case 'tracker':
        return <TrialTrackerPage />;
      case 'about':
        return <AboutPage />;
      case 'api':
        return <ApiDocsPage />;
      case 'database':
        return <TrialDatabase />;
      case 'reports':
        return <Reports />;
      default:
        return <TrialExplorer />;
    }
  };

  return (
    <Router>
      <div className="flex h-screen bg-background">
        {/* Offline Notice */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center">
            <svg className="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            You are currently offline. Some features may not work properly.
          </div>
        )}
        
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </Router>
  );
}

export default App;