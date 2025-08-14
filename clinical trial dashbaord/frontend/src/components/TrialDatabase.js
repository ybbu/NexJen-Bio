import React from 'react';
import { Database, Search, Filter, Download, Upload } from 'lucide-react';

const TrialDatabase = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Database</h1>
          <p className="text-muted-foreground">
            Comprehensive database of clinical trials with advanced search and export capabilities
          </p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-card text-card-foreground rounded-xl border p-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="w-12 h-12 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            We're building a comprehensive trial database with advanced search capabilities, 
            data export features, and bulk operations to help you manage and analyze clinical trial data efficiently.
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Advanced Search</h3>
              <p className="text-sm text-muted-foreground">
                Multi-criteria search with filters for phase, status, location, and more
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Data Export</h3>
              <p className="text-sm text-muted-foreground">
                Export trial data in CSV, JSON, or Excel formats for further analysis
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Filter className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Bulk Operations</h3>
              <p className="text-sm text-muted-foreground">
                Perform operations on multiple trials simultaneously
              </p>
            </div>
          </div>

          {/* Wireframe Preview */}
          <div className="mt-12 p-8 bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/30">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-4 h-4 bg-primary rounded-full"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground font-medium">Database Interface Wireframe</p>
              <p className="text-sm text-muted-foreground mt-2">
                Advanced search interface with filters and data management tools
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Get Notified When Available
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialDatabase; 