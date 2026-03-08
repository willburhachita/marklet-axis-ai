import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AuthGuard from './components/AuthGuard';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import Overview from './pages/Overview';
import Strategy from './pages/Strategy';
import ContentStudio from './pages/ContentStudio';
import LaunchKit from './pages/LaunchKit';
import Codebase from './pages/Codebase';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import ProjectHub from './pages/ProjectHub';
import Wizard from './pages/Wizard';
import IntegrationsCallback from './pages/IntegrationsCallback';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/integrations/callback" element={<IntegrationsCallback />} />

        {/* Protected dashboard — AuthGuard checks session + profile */}
        <Route
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          {/* Hub */}
          <Route path="overview" element={<ProjectHub />} />

          {/* Project-specific Dashboard Hub */}
          <Route path="project/:projectId/wizard" element={<Wizard />} />
          <Route path="project/:projectId/overview" element={<Overview />} />
          <Route path="project/:projectId/strategy" element={<Strategy />} />
          <Route path="project/:projectId/content" element={<ContentStudio />} />
          <Route path="project/:projectId/launch" element={<LaunchKit />} />
          <Route path="project/:projectId/codebase" element={<Codebase />} />
          <Route path="project/:projectId/resources" element={<Resources />} />
          <Route path="project/:projectId/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
