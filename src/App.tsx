import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Button } from './components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import GlobalSearch from './components/GlobalSearch';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Building2, 
  DollarSign, 
  ClipboardList, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  Briefcase
} from 'lucide-react';

// Import core business modules only
import Dashboard from './components/Dashboard';
import CandidatesModule from './components/CandidatesModule';
import AgentsModule from './components/AgentsModule';
import EmployersModule from './components/EmployersModule';
import FinancialsModule from './components/FinancialsModule';
import ProcessModule from './components/ProcessModule';
import DocumentsModule from './components/DocumentsModule';
import AIInsightsModule from './components/AIInsightsModule';
import JobAnalyticsModule from './components/JobAnalyticsModule';
import ReportsModule from './components/ReportsModule';
import SettingsModule from './components/SettingsModule';
import JobsModule from './components/JobsModule';
import SmartTableDemo from './components/SmartTableDemo';
import SQLResultsDemo from './components/SQLResultsDemo';

// Core business navigation - clean and focused
const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Employers', path: '/employers', icon: Building2 },
  { name: 'Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Agents', path: '/agents', icon: UserCheck },
  { name: 'Candidates', path: '/candidates', icon: Users },
  { name: 'Process Tracking', path: '/process', icon: ClipboardList },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Financials', path: '/financials', icon: DollarSign },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Table Demo', path: '/demo', icon: FileText },
  { name: 'SQL Results', path: '/sql-demo', icon: LayoutDashboard },
];

function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-3" />
      Logout
    </Button>
  );
}

function AppSidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className={`bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground rounded-lg p-2 flex-shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-semibold text-sidebar-foreground">Jawal International</h1>
              <p className="text-xs text-muted-foreground">Staff Portal</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            
            // Hide Table Demo and SQL Results for non-admin users
            if ((item.name === 'Table Demo' || item.name === 'SQL Results') && user?.role !== 'admin') {
              return null;
            }
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <LogoutButton />
        </div>
      )}
    </div>
  );
}

function AppHeader({ onSidebarToggle }) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-background border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onSidebarToggle}
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <GlobalSearch />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </Button>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.email || 'Admin User'}</p>
            <p className="text-xs text-muted-foreground">Jawal International - {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}</p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/api/placeholder/32/32" alt="Admin" />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'AU'}</AvatarFallback>
          </Avatar>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function AppContent({ onSidebarToggle }) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AppHeader onSidebarToggle={onSidebarToggle} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/candidates" element={<CandidatesModule />} />
            <Route path="/agents" element={<AgentsModule />} />
            <Route path="/employers" element={<EmployersModule />} />
            <Route path="/jobs" element={<JobsModule />} />
            <Route path="/financials" element={<FinancialsModule />} />
            <Route path="/process" element={<ProcessModule />} />
            <Route path="/documents" element={<DocumentsModule />} />
            <Route path="/reports" element={<ReportsModule />} />
            <Route path="/analytics" element={<JobAnalyticsModule />} />
            <Route path="/settings" element={<SettingsModule />} />
            <Route path="/demo" element={<SmartTableDemo />} />
            <Route path="/sql-demo" element={<SQLResultsDemo />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex h-screen">
                <AppSidebar 
                  isCollapsed={sidebarCollapsed} 
                  onToggle={toggleSidebar}
                />
                <AppContent onSidebarToggle={toggleSidebar} />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}