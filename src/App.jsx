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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected dashboard — AuthGuard checks session + profile */}
        <Route
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route path="overview" element={<Overview />} />
          <Route path="strategy" element={<Strategy />} />
          <Route path="content" element={<ContentStudio />} />
          <Route path="launch" element={<LaunchKit />} />
          <Route path="codebase" element={<Codebase />} />
          <Route path="resources" element={<Resources />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
