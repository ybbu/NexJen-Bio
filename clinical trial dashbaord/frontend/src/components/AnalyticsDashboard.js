import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target, 
  Globe,
  BarChart3,
  PieChart,
  MapPin,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ArrowLeft
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [filters, setFilters] = useState({
    phases: [],
    statuses: [],
    countries: [],
    therapeutic_areas: [],
    date_range: null,
    window: "6m"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Therapeutic area options with parent -> child structure
  const therapeuticAreaOptions = [
    {
      label: 'Neurology',
      options: [
        { value: "Parkinson's Disease", label: "Parkinson's Disease" },
        { value: "Alzheimer's Disease", label: "Alzheimer's Disease" },
        { value: "Multiple Sclerosis", label: "Multiple Sclerosis" },
        { value: "Epilepsy", label: "Epilepsy" },
        { value: "Huntington's Disease", label: "Huntington's Disease" },
        { value: "Amyotrophic Lateral Sclerosis", label: "Amyotrophic Lateral Sclerosis" },
        { value: "Migraine", label: "Migraine" },
        { value: "Stroke", label: "Stroke" }
      ]
    },
    {
      label: 'Oncology',
      options: [
        { value: "Breast Cancer", label: "Breast Cancer" },
        { value: "Lung Cancer", label: "Lung Cancer" },
        { value: "Prostate Cancer", label: "Prostate Cancer" },
        { value: "Colorectal Cancer", label: "Colorectal Cancer" },
        { value: "Melanoma", label: "Melanoma" },
        { value: "Lymphoma", label: "Lymphoma" },
        { value: "Leukemia", label: "Leukemia" }
      ]
    },
    {
      label: 'Cardiology',
      options: [
        { value: "Heart Failure", label: "Heart Failure" },
        { value: "Coronary Artery Disease", label: "Coronary Artery Disease" },
        { value: "Hypertension", label: "Hypertension" },
        { value: "Atrial Fibrillation", label: "Atrial Fibrillation" },
        { value: "Myocardial Infarction", label: "Myocardial Infarction" }
      ]
    },
    {
      label: 'Endocrinology',
      options: [
        { value: "Type 1 Diabetes", label: "Type 1 Diabetes" },
        { value: "Type 2 Diabetes", label: "Type 2 Diabetes" },
        { value: "Obesity", label: "Obesity" },
        { value: "Thyroid Disorders", label: "Thyroid Disorders" }
      ]
    },
    {
      label: 'Immunology',
      options: [
        { value: "Rheumatoid Arthritis", label: "Rheumatoid Arthritis" },
        { value: "Lupus", label: "Lupus" },
        { value: "Crohn's Disease", label: "Crohn's Disease" },
        { value: "Ulcerative Colitis", label: "Ulcerative Colitis" },
        { value: "Psoriasis", label: "Psoriasis" }
      ]
    }
  ];

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:8000/analytics', {
        params: filters
      });
      console.log('Analytics data received:', response.data);
      console.log('Top sponsors:', response.data.top_sponsors);
      console.log('Top conditions:', response.data.top_conditions);
      setAnalyticsData(response.data);
      
      // Fetch AI annotations
      const annotationsResponse = await axios.get('http://localhost:8000/analytics/annotations', {
        params: filters
      });
      setAnnotations(annotationsResponse.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleAnnotationClick = (annotation) => {
    // Handle annotation click - could open detailed view
    console.log('Annotation clicked:', annotation);
  };

  const getChangeColor = (deltaPct) => {
    if (deltaPct > 0) return 'text-[#2CA58D] dark:text-[#2CA58D]';
    if (deltaPct < 0) return 'text-[#E57373] dark:text-[#E57373]';
    return 'text-[#90A4AE] dark:text-[#90A4AE]';
  };

  const getChangeIcon = (deltaPct) => {
    if (deltaPct > 0) return <TrendingUp className="w-4 h-4 text-[#2CA58D]" />;
    if (deltaPct < 0) return <TrendingDown className="w-4 h-4 text-[#E57373]" />;
    return <Activity className="w-4 h-4 text-[#90A4AE]" />;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  const getDynamicXAxisInterval = (dataLength) => {
    if (dataLength <= 6) return 1; // Show every label if 6 or fewer
    if (dataLength <= 12) return 2; // Show every 2nd label if 7-12
    if (dataLength <= 24) return 4; // Show every 4th label if 13-24
    return 6; // Show every 6th label if more than 24
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time insights into clinical trial landscape and trends
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalyticsData}
            className="p-2 rounded-lg border hover:bg-muted"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card text-card-foreground rounded-xl border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Filters:</span>
          
          {/* Time Window Filter */}
          <select
            value={filters.window}
            onChange={(e) => handleFilterChange({ window: e.target.value })}
            className="px-3 py-1 border rounded-lg text-sm min-w-[140px]"
          >
            <option value="6m">Last 6 months</option>
            <option value="1y">Last 1 year</option>
            <option value="2y">Last 2 years</option>
            <option value="5y">Last 5 years</option>
          </select>

          {/* Therapeutic Areas Filter */}
          <select
            value={filters.therapeutic_areas.length > 0 ? filters.therapeutic_areas[0] : ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                handleFilterChange({ therapeutic_areas: [value] });
              } else {
                handleFilterChange({ therapeutic_areas: [] });
              }
            }}
            className="px-3 py-1 border rounded-lg text-sm min-w-[200px]"
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

          {/* Phase Filter */}
          <select
            value={filters.phases.length > 0 ? filters.phases[0] : ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                handleFilterChange({ phases: [value] });
              } else {
                handleFilterChange({ phases: [] });
              }
            }}
            className="px-3 py-1 border rounded-lg text-sm min-w-[140px]"
          >
            <option value="">All Phases</option>
            <option value="PHASE1">Phase 1</option>
            <option value="PHASE2">Phase 2</option>
            <option value="PHASE3">Phase 3</option>
            <option value="PHASE4">Phase 4</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.statuses.length > 0 ? filters.statuses[0] : ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                handleFilterChange({ statuses: [value] });
              } else {
                handleFilterChange({ statuses: [] });
              }
            }}
            className="px-3 py-1 border rounded-lg text-sm min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="Recruiting">Recruiting</option>
            <option value="Active, not recruiting">Active, not recruiting</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
            <option value="Suspended">Suspended</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Row 1: Portfolio KPIs */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Trials KPI */}
          <div className="bg-card text-card-foreground rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Trials</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">
                    {formatNumber(analyticsData.metrics?.total_trials?.current_value || 0)}
                  </p>
                  {getChangeIcon(analyticsData.metrics?.total_trials?.delta_pct || 0)}
                </div>
                <p className={`text-sm ${getChangeColor(analyticsData.metrics?.total_trials?.delta_pct || 0)}`}>
                  {analyticsData.metrics?.total_trials?.delta_pct?.toFixed(1) || 0}% vs baseline
                </p>
              </div>
              <div className="w-12 h-12 bg-[#90A4AE]/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#90A4AE]" />
              </div>
            </div>
          </div>

          {/* New Trial Starts KPI */}
          <div className="bg-card text-card-foreground rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Trial Starts</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">
                    {analyticsData.metrics?.trial_starts?.current_value?.toFixed(0) || 0}
                  </p>
                  {getChangeIcon(analyticsData.metrics?.trial_starts?.delta_pct || 0)}
                </div>
                <p className={`text-sm ${getChangeColor(analyticsData.metrics?.trial_starts?.delta_pct || 0)}`}>
                  {analyticsData.metrics?.trial_starts?.delta_pct?.toFixed(1) || 0}% vs baseline
                </p>
              </div>
              <div className="w-12 h-12 bg-[#90A4AE]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#90A4AE]" />
              </div>
            </div>
          </div>

          {/* Avg Quality Score KPI */}
          <div className="bg-card text-card-foreground rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Quality Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">
                    {analyticsData.metrics?.quality_score?.current_value?.toFixed(2) || 0}
                  </p>
                  {getChangeIcon(analyticsData.metrics?.quality_score?.delta_pct || 0)}
                </div>
                <p className={`text-sm ${getChangeColor(analyticsData.metrics?.quality_score?.delta_pct || 0)}`}>
                  {analyticsData.metrics?.quality_score?.delta_pct?.toFixed(1) || 0}% vs baseline
                </p>
              </div>
              <div className="w-12 h-12 bg-[#90A4AE]/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-[#90A4AE]" />
              </div>
            </div>
          </div>

          {/* Avg Enrollment KPI */}
          <div className="bg-card text-card-foreground rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Enrollment</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">
                    {formatNumber(analyticsData.metrics?.enrollment?.current_value?.toFixed(0) || 0)}
                  </p>
                  {getChangeIcon(analyticsData.metrics?.enrollment?.delta_pct || 0)}
                </div>
                <p className={`text-sm ${getChangeColor(analyticsData.metrics?.enrollment?.delta_pct || 0)}`}>
                  {analyticsData.metrics?.enrollment?.delta_pct?.toFixed(1) || 0}% vs baseline
                </p>
              </div>
              <div className="w-12 h-12 bg-[#90A4AE]/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#90A4AE]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: AI Headlines Strip (Full Width) */}
      {/* AI Insights Section */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Insights</h3>
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">Live</span>
        </div>
        
        <div className="space-y-4">
          {analyticsData && annotations?.annotations ? (
            annotations.annotations.slice(0, 3).map((annotation, index) => (
              <div 
                key={index}
                onClick={() => handleAnnotationClick(annotation)}
                className="p-4 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              >
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-relaxed">
                  {annotation.headline || annotation.text.split(' — ')[0]}
                </p>
                <div className="flex justify-between items-start">
                  <p className="text-base text-gray-900 dark:text-gray-100 mb-0 leading-relaxed flex-1">
                    {annotation.context || annotation.text.split(' — ')[1] || annotation.text}
                  </p>
                  <span className="text-sm text-blue-600 dark:text-blue-300 font-medium ml-4 flex-shrink-0">
                    {annotation.confidence || 'Moderate confidence'}
                  </span>
                </div>
              </div>
            ))
          ) : analyticsData ? (
            // Fallback to template insights if no AI annotations
            [
              {
                text: `Trial starts increased by ${analyticsData.metrics?.trial_starts?.delta_pct?.toFixed(1) || 0}% compared to baseline period, showing strong momentum in clinical research activity.`,
                data: { delta_pct: analyticsData.metrics?.trial_starts?.delta_pct || 0 }
              },
              {
                text: `Average enrollment per trial ${analyticsData.metrics?.enrollment?.delta_pct > 0 ? 'increased' : 'decreased'} by ${Math.abs(analyticsData.metrics?.enrollment?.delta_pct || 0).toFixed(1)}%, suggesting ${analyticsData.metrics?.enrollment?.delta_pct > 0 ? 'larger' : 'smaller'} study sizes.`,
                data: { delta_pct: analyticsData.metrics?.enrollment?.delta_pct || 0 }
              },
              {
                text: `Quality scores show ${analyticsData.metrics?.quality_score?.delta_pct?.toFixed(1) || 0}% change, with ${Object.keys(analyticsData.top_conditions || {}).length} different conditions being studied.`,
                data: { delta_pct: analyticsData.metrics?.quality_score?.delta_pct || 0 }
              }
            ].map((annotation, index) => (
              <div 
                key={index}
                onClick={() => handleAnnotationClick(annotation)}
                className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <p className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2 leading-relaxed">
                  {annotation.text}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 dark:text-blue-300">
                    {Math.abs(annotation.data.delta_pct).toFixed(1)}% change
                  </span>
                  <span className="text-sm text-blue-500 dark:text-blue-400">
                    Template insight
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-blue-700 dark:text-blue-300">AI analysis in progress...</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Split Layout 40/60 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left (40%): Momentum Movers Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 Sponsors with largest recent activity increase */}
          <div className="bg-card text-card-foreground rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">Top Sponsors (Recent Growth)</h3>
            <div className="space-y-3">
              {analyticsData?.top_sponsors ? (
                Object.entries(analyticsData.top_sponsors).slice(0, 3).map(([sponsor, count], index) => (
                  <div key={sponsor} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium truncate">{sponsor}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#2CA58D]" />
                    </div>
                    <span className="text-base font-bold text-[#2CA58D]">{count} trials</span>
                  </div>
                ))
              ) : analyticsData ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No sponsor data available</p>
                  <p className="text-xs text-gray-400 mt-1">Debug: {JSON.stringify(analyticsData.top_sponsors)}</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Loading sponsor data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Top 3 Therapeutic Areas gaining traction */}
          <div className="bg-card text-card-foreground rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">Top Therapeutic Areas</h3>
            <div className="space-y-3">
              {analyticsData?.top_conditions ? (
                Object.entries(analyticsData.top_conditions).slice(0, 3).map(([condition, count], index) => (
                  <div key={condition} className="flex items-center justify-between p-3">
                    <span className="text-base font-medium truncate">{condition}</span>
                    <span className="text-base font-bold text-[#4A90E2]">{count} trials</span>
                  </div>
                ))
              ) : analyticsData ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No therapeutic area data available</p>
                  <p className="text-xs text-gray-400 mt-1">Debug: {JSON.stringify(analyticsData.top_conditions)}</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Loading therapeutic area data...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right (60%): R&D Trendlines */}
        <div className="lg:col-span-3 bg-card text-card-foreground rounded-xl border p-6">
          <h3 className="text-xl font-semibold mb-4">R&D Trendlines</h3>
          <div className="space-y-6">
            {/* Trial Starts Timeline */}
            <div>
              <h4 className="text-base font-medium text-muted-foreground mb-2">Trial Starts Timeline</h4>
              <div className="h-32">
                {analyticsData?.monthly_starts?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.monthly_starts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 14, fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                        interval={getDynamicXAxisInterval(analyticsData.monthly_starts.length)}
                      />
                      <YAxis 
                        tick={{ fontSize: 14, fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => value.toString()}
                      />
                      <Tooltip 
                        formatter={(value) => [value, '']}
                        labelStyle={{ display: 'none' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#4A90E2" 
                        strokeWidth={2}
                        name="Trial Starts"
                        dot={{ fill: '#4A90E2', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#4A90E2', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-muted/20 rounded flex items-center justify-center">
                    <div className="text-xs text-muted-foreground">No data</div>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment Rate Trend */}
            <div>
              <h4 className="text-base font-medium text-muted-foreground mb-2">Enrollment Rate Trend</h4>
              <div className="h-32">
                {analyticsData?.monthly_starts?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.monthly_starts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 14, fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                        hide={true}
                        interval={getDynamicXAxisInterval(analyticsData.monthly_starts.length)}
                      />
                      <YAxis 
                        tick={{ fontSize: 14, fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => value.toString()}
                      />
                      <Tooltip 
                        formatter={(value) => [value, '']}
                        labelStyle={{ display: 'none' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avg_enrollment" 
                        stroke="#26A69A" 
                        strokeWidth={2}
                        name="Avg Enrollment"
                        dot={{ fill: '#26A69A', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#26A69A', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-muted/20 rounded flex items-center justify-center">
                    <div className="text-xs text-muted-foreground">No data</div>
                  </div>
                )}
              </div>
            </div>

            {/* Late-stage Trial Count */}
            <div>
              <h4 className="text-base font-medium text-muted-foreground mb-2">Late-stage Trial Count (Phase II/III)</h4>
              <div className="h-32">
                {analyticsData?.monthly_starts?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.monthly_starts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 14, fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                        hide={true}
                        interval={getDynamicXAxisInterval(analyticsData.monthly_starts.length)}
                      />
                      <YAxis 
                        tick={{ fontSize: 14, fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => value.toString()}
                      />
                      <Tooltip 
                        formatter={(value) => [value, '']}
                        labelStyle={{ display: 'none' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="late_stage_count" 
                        stroke="#5C6BC0" 
                        strokeWidth={2}
                        name="Late-stage Trials"
                        dot={{ fill: '#5C6BC0', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#5C6BC0', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-muted/20 rounded flex items-center justify-center">
                    <div className="text-xs text-muted-foreground">No data</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Distribution Snapshot (Single Bar with 3 Sections) */}
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <h3 className="text-xl font-semibold mb-4">Distribution Snapshot</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="h-48">
            <h4 className="text-base font-medium text-muted-foreground mb-2">Status</h4>
            {analyticsData?.status_transitions ? (
              <div className="flex">
                <div className="w-2/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={Object.entries(analyticsData.status_transitions).map(([status, count]) => ({
                          name: status,
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        label={false}
                      >
                        {Object.entries(analyticsData.status_transitions).map((entry, index) => {
                          const status = entry[0];
                          let color = '#90A4AE'; // neutral gray default
                          
                          if (status === 'Recruiting') color = '#26A69A'; // teal
                          else if (status === 'Completed') color = '#4A90E2'; // blue
                          else if (status === 'Withdrawn') color = '#E57373'; // red
                          else if (status === 'Terminated') color = '#E57373'; // red
                          else if (status === 'Active, not recruiting') color = '#5C6BC0'; // indigo
                          else if (status === 'Suspended') color = '#FF9800'; // orange
                          
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-3/5 pl-6 overflow-x-auto">
                  <div className="space-y-3 text-sm min-w-max">
                    {Object.entries(analyticsData.status_transitions).map(([status, count], index) => {
                      let color = '#90A4AE'; // neutral gray default
                      
                      if (status === 'Recruiting') color = '#26A69A'; // teal
                      else if (status === 'Completed') color = '#4A90E2'; // blue
                      else if (status === 'Withdrawn') color = '#E57373'; // red
                      else if (status === 'Terminated') color = '#E57373'; // red
                      else if (status === 'Active, not recruiting') color = '#5C6BC0'; // indigo
                      else if (status === 'Suspended') color = '#FF9800'; // orange
                      
                      const percentage = ((count / Object.values(analyticsData.status_transitions).reduce((a, b) => a + b, 0)) * 100).toFixed(0);
                      
                      // Shorten long status names for better readability
                      let displayStatus = status;
                      if (status === 'ENROLLING_BY_INVITATION') displayStatus = 'Enrolling by Invitation';
                      if (status === 'Active, not recruiting') displayStatus = 'Active (Not Recruiting)';
                      
                      return (
                        <div key={status} className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="font-semibold text-sm flex-1">{displayStatus}</span>
                          <span className="text-sm text-muted-foreground font-medium min-w-[30px] text-right">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-muted/20 rounded flex items-center justify-center">
                <div className="text-xs text-muted-foreground">No data</div>
              </div>
            )}
          </div>

          {/* Phase Distribution */}
          <div className="h-48">
            <h4 className="text-base font-medium text-muted-foreground mb-2">Phase</h4>
            {analyticsData?.phase_timeline ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.phase_timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phases" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4A90E2">
                    {analyticsData.phase_timeline.map((entry, index) => {
                      const phase = entry.phases;
                      let color = '#4A90E2'; // default blue
                      
                      if (phase === 'Phase 1') color = '#E3F2FD'; // light blue
                      else if (phase === 'Phase 2') color = '#BBDEFB'; // lighter blue
                      else if (phase === 'Phase 3') color = '#90CAF9'; // medium blue
                      else if (phase === 'Phase 4') color = '#64B5F6'; // darker blue
                      else if (phase === 'N/A') color = '#90A4AE'; // neutral gray
                      
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-muted/20 rounded flex items-center justify-center">
                <div className="text-xs text-muted-foreground">No data</div>
              </div>
            )}
          </div>

                    {/* Top Treatment Categories */}
          <div className="h-48">
            <h4 className="text-base font-medium text-muted-foreground mb-2">Treatment Categories</h4>
            {analyticsData?.top_treatment_categories ? (
              <div className="space-y-2 overflow-y-auto h-36 pr-2">
                {Object.entries(analyticsData.top_treatment_categories)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([category, count], index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium truncate flex-1">
                        {category}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#90A4AE] rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(analyticsData.top_treatment_categories))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-[#90A4AE] min-w-[20px] text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-full bg-muted/20 rounded flex items-center justify-center">
                <div className="text-xs text-muted-foreground">No data</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 5: Geographic Landscape (Full Width) */}
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Geographic Landscape</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-muted-foreground mb-2">Coming Soon</h4>
            <p className="text-muted-foreground">Geographic analysis and mapping features will be available in the next update.</p>
          </div>
        </div>
      </div>

      {/* Row 6: Live Intelligence Feed (Footer) */}
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Live Intelligence Feed</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Live Updates</span>
        </div>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {analyticsData?.monthly_starts?.slice(0, 8).map((update, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Trial Activity: {update.month}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {update.count} trials started, {update.avg_enrollment?.toFixed(0) || 0} avg enrollment
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">{update.month}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Trial Data</span>
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Live updates will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
