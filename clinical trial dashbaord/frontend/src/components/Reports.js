import React from 'react';
import { FileText, Calendar, Download, Upload, BarChart3, Clock } from 'lucide-react';

const Reports = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Generate, schedule, and manage clinical study reports
          </p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-card text-card-foreground rounded-xl border p-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Reports Module Coming Soon</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            We're building a powerful reporting suite to help you create executive summaries, patient accrual reports,
            site performance overviews, and custom analytics—exportable to PDF, CSV, and more.
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Executive Dashboards</h3>
              <p className="text-sm text-muted-foreground">Auto-generated KPIs and visuals for stakeholders</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Scheduled Reports</h3>
              <p className="text-sm text-muted-foreground">Email delivery on a daily, weekly, or monthly cadence</p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Multiple Formats</h3>
              <p className="text-sm text-muted-foreground">Export to PDF, CSV, JSON, and shareable links</p>
            </div>
          </div>

          {/* Wireframe Preview */}
          <div className="mt-12 p-8 bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 rounded-md bg-muted" />
              <div className="h-24 rounded-md bg-muted" />
              <div className="h-24 rounded-md bg-muted" />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">Report cards and quick actions</p>
          </div>

          {/* Call to Action */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Get Notified
            </button>
            <button className="px-6 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Template
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="bg-card text-card-foreground rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm">Executive Summary - Q2</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Generated 2 days ago</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm">Site Performance Overview</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Generated 1 week ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;



