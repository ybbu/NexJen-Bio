import React from 'react';
import { Link } from 'react-router-dom';

const ScoringExplanation = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Clinical Trial Quality Scoring System
            </h1>
            <Link
              to="/"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← Back to Explorer
            </Link>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Overview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              This system evaluates clinical trials on a 0-5 scale to predict their likelihood of success. 
              The scoring eliminates inflated scores and ensures that only trials with real positive evidence 
              can achieve "GOOD" or better ratings.
            </p>
          </div>

          {/* Base Score Components */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Base Score Components (0-4.0 points)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Outcome Evidence (0-1.20 points)
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Largest driver - requires positive clinical evidence. Evaluates peer-reviewed publications, 
                    registry results, and interim analyses.
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Phase Prior (0-0.80 points)
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Historical base-rate of success by phase. Phase 4 gets highest score, Phase 1 gets lowest.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Sponsor Quality (0-0.70 points)
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Tier-based scoring: Top-tier sponsors (0.70), Mid-tier sponsors (0.35), Unknown sponsors (0.0).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Study Design Integrity (0-0.80 points)
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    RoB2 domains: randomization, blinding, allocation concealment, outcome assessment, missing data handling.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Enrollment Fulfillment (0-0.60 points)
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Actual vs planned enrollment ratio. ≥90% gets full points, &lt;60% gets minimal points.
                  </p>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                    Eligibility External Validity (0-0.30 points)
                  </h3>
                  <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    Age span, sex inclusion, comorbidity tolerance, biomarker gate restrictions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bonuses */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Bonuses (max +1.0 point)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Regulatory Approval Bonus (+0.70)
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  FDA-approved drug with positive evidence. Requires Tier A or B outcome evidence.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  High-Impact Publication (+0.30)
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Published in top-tier journals (IF ≥10) with positive findings.
                </p>
              </div>
            </div>
          </div>

          {/* Penalties */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Penalties
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-red-900 dark:text-red-100 w-32">Terminated (Safety/Futility):</span>
                  <span className="text-red-800 dark:text-red-200">-1.0</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-red-900 dark:text-red-100 w-32">Terminated (Unknown):</span>
                  <span className="text-red-800 dark:text-red-200">-0.8</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-red-900 dark:text-red-100 w-32">Withdrawn:</span>
                  <span className="text-red-800 dark:text-red-200">-0.8</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-red-900 dark:text-red-100 w-32">Suspended:</span>
                  <span className="text-red-800 dark:text-red-200">-0.5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Interpretation */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Score Interpretation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  ≥4.2 - EXCELLENT
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Excellent chance of success
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  3.3-4.1 - GOOD
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Good probability of success
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  2.4-3.2 - FAIR
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Fair - proceed with caution
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  1.5-2.3 - POOR
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Poor - significant concerns
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  <1.5 - VERY POOR
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Very poor/failed
                </p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Key Features
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✅</span>
                  <span>Eliminates score inflation - Base score capped at 4.0 points</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✅</span>
                  <span>No double-counting - Each component has defined ceiling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✅</span>
                  <span>"GOOD" requires positive evidence - Outcome Evidence is largest driver</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✅</span>
                  <span>Tier-based outcome scoring - A (1.20) to F (0.0) with registry-ID matching</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✅</span>
                  <span>RoB2 domains - 5 domains, 0.16 pts each for study design integrity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✅</span>
                  <span>Mandatory termination penalties - All terminated trials get significant penalties</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringExplanation; 