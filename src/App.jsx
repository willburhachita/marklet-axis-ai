import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Strategy from './pages/Strategy';
import ContentStudio from './pages/ContentStudio';
import LaunchKit from './pages/LaunchKit';
import Codebase from './pages/Codebase';
import Resources from './pages/Resources';
import Settings from './pages/Settings';

export default function App() {
  const [mode, setMode] = useState('assist');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout mode={mode} setMode={setMode} />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview mode={mode} />} />
          <Route path="strategy" element={<Strategy />} />
          <Route path="content" element={<ContentStudio mode={mode} />} />
          <Route path="launch" element={<LaunchKit />} />
          <Route path="codebase" element={<Codebase />} />
          <Route path="resources" element={<Resources />} />
          <Route path="settings" element={<Settings mode={mode} setMode={setMode} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
