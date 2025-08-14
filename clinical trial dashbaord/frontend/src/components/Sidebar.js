import React from 'react';
import { 
  Search, 
  BarChart3, 
  Network,
  FileText, 
  Info,
  Database,
  TrendingUp,
  Activity,
  Lightbulb,
  Target
} from 'lucide-react';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'explorer', label: 'Trial Explorer', icon: Search, primary: true },
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
    { id: 'collaboration', label: 'Collaboration Network', icon: Network },
    { id: 'insights', label: 'Research Insights', icon: Lightbulb },
    { id: 'tracker', label: 'Trial Tracker', icon: Target },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'api', label: 'API', icon: Info },
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">Clinical Study Research Platform</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Trial Analytics</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  } ${item.primary && isActive ? 'ring-2 ring-primary/20' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.primary && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>


    </div>
  );
};

export default Sidebar; 