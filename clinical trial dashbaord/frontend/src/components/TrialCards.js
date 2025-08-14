import React from 'react';
import { MapPin, Calendar, Users, Building2, ExternalLink } from 'lucide-react';
import TrialMap from './TrialMap';

const TrialCards = ({ trials, viewMode = 'cards', getScoreBadge, activeTab }) => {
  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'PHASE1': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'PHASE2': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PHASE3': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PHASE4': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'recruiting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'active, not recruiting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'terminated': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'suspended': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStudyTypeColor = (studyType) => {
    switch (studyType?.toUpperCase()) {
      case 'INTERVENTIONAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'OBSERVATIONAL': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trials.map((trial) => (
        <div
          key={trial.nctId}
          className="bg-card text-card-foreground rounded-xl border hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
        >
          <div className="p-6">
            {/* Header with Trial ID and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <a
                  href={`https://clinicaltrials.gov/ct2/show/${trial.nctId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-primary hover:text-primary/80 transition-colors"
                >
                  {trial.nctId}
                </a>
                {trial.overallStatus && (
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trial.overallStatus)}`}>
                      {trial.overallStatus}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end space-y-2">
                {/* Success Score Badge */}
                {getScoreBadge && getScoreBadge(trial.nctId)}
                
                {/* Phase Tag */}
                {trial.phase !== 'N/A' && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPhaseColor(trial.phase)}`}>
                    {trial.phase.replace('PHASE', 'Phase ')}
                  </span>
                )}
                
                {/* Study Type Tag */}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStudyTypeColor(trial.studyType)}`}>
                  {trial.studyType}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-card-foreground mb-3 line-clamp-2 leading-tight">
              {trial.briefTitle}
            </h3>

            {/* Summary */}
            {trial.summary && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                {trial.summary}
              </p>
            )}

            {/* Trial Details Grid */}
            <div className="space-y-3 mb-4">
              {/* Enrollment */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {trial.enrollmentCount ? `${trial.enrollmentCount.toLocaleString()} participants` : 'Enrollment not specified'}
                </span>
              </div>
              
              {/* Sponsor */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {trial.leadSponsor || 'Sponsor not specified'}
                </span>
              </div>

              {/* Start Date */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Started: {formatDate(trial.startDate)}</span>
              </div>

              {/* Completion Date */}
              {trial.completionDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Completed: {formatDate(trial.completionDate)}</span>
                </div>
              )}
            </div>

            {/* Intervention Tags */}
            {trial.interventions && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Interventions:</p>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    // Handle interventions - could be string or array
                    let interventions = [];
                    if (typeof trial.interventions === 'string') {
                      // Split by common delimiters if it's a string
                      interventions = trial.interventions.split(/[,;|]/).map(i => i.trim()).filter(i => i);
                    } else if (Array.isArray(trial.interventions)) {
                      interventions = trial.interventions;
                    }
                    
                    return (
                      <>
                        {interventions.slice(0, 3).map((intervention, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded"
                          >
                            {intervention}
                          </span>
                        ))}
                        {interventions.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                            +{interventions.length - 3} more
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* View Details Button */}
            <div className="mt-4 pt-4 border-t border-border">
              <a
                href={`https://clinicaltrials.gov/ct2/show/${trial.nctId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 transition-colors"
              >
                View Details
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {trials.map((trial) => (
        <div
          key={trial.nctId}
          className="bg-card text-card-foreground rounded-lg border p-4 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <a
                  href={`https://clinicaltrials.gov/ct2/show/${trial.nctId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-primary hover:text-primary/80 transition-colors"
                >
                  {trial.nctId}
                </a>
                {getScoreBadge && getScoreBadge(trial.nctId)}
                {trial.phase !== 'N/A' && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPhaseColor(trial.phase)}`}>
                    {trial.phase.replace('PHASE', 'Phase ')}
                  </span>
                )}
                {trial.overallStatus && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trial.overallStatus)}`}>
                    {trial.overallStatus}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{trial.briefTitle}</h3>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{trial.enrollmentCount ? `${trial.enrollmentCount.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span className="truncate max-w-32">{trial.leadSponsor || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(trial.startDate)}</span>
                </div>
              </div>
            </div>
            <a
              href={`https://clinicaltrials.gov/ct2/show/${trial.nctId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMapView = () => (
    <TrialMap trials={trials} getScoreBadge={getScoreBadge} activeTab={activeTab} />
  );

  // Render based on view mode
  switch (viewMode) {
    case 'list':
      return renderListView();
    case 'map':
      return renderMapView();
    default:
      return renderCardView();
  }
};

export default TrialCards; 