// Ginkgo Rebuild — Main App Root (Felt × CARTO × ArcGIS × Palantir)
// Cohesive Light-Theme Application Shell with TopNav, LeftNav, and 4 Main Views.

import { useState } from 'react';
import { TopNav } from './components/layout/TopNav';
import { LeftNav, type NavSection } from './components/layout/LeftNav';
import { OverviewPage } from './pages/OverviewPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportPage } from './pages/ReportPage';
import { SettingsModal } from './components/SettingsModal';
import { loadSampleTile, createAnalysisJob } from './services/api';
import type { AppState, AppData, AnalysisResult } from './types';

const INITIAL_DATA: AppData = {
  imageId: null,
  jobId: null,
  result: null,
  selectedAreaId: null,
  reportData: null,
};

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [state, setState] = useState<AppState>('upload');
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [targetSectionAfterLoad, setTargetSectionAfterLoad] = useState<NavSection | null>(null);

  const update = (partial: Partial<AppData>) =>
    setData(prev => ({ ...prev, ...partial }));

  const resetToHome = () => {
    setData(INITIAL_DATA);
    setState('upload');
    setActiveSection('overview');
  };

  const handleStartAnalysis = (incoming: Partial<AppData>, targetSec: NavSection = 'spatial') => {
    update(incoming);
    setState('processing');
    setTargetSectionAfterLoad(targetSec);
    setActiveSection(targetSec);
  };

  // Auto-launch sample dataset if user clicks spatial, flood, planning, or reports when no dataset is loaded
  const ensureDatasetLoaded = async (targetSec: NavSection) => {
    if (data.result) {
      if (targetSec === 'reports') {
        setState('report');
      } else {
        setState('dashboard');
      }
      setActiveSection(targetSec);
      return;
    }

    try {
      // Quick load the primary Sentinel-2 dataset
      const uploadRes = await loadSampleTile('tile_2_northeast_river');
      const jobRes = await createAnalysisJob(uploadRes.image_id);
      handleStartAnalysis({ imageId: uploadRes.image_id, jobId: jobRes.job_id }, targetSec);
    } catch (e) {
      console.error('Failed to auto-load sample dataset:', e);
    }
  };

  const handleNavSelect = (sec: NavSection) => {
    if (sec === 'settings') {
      setSettingsOpen(true);
      return;
    }

    setActiveSection(sec);

    if (sec === 'overview') {
      setState('upload');
    } else if (sec === 'projects') {
      // Show projects table
    } else if (sec === 'spatial' || sec === 'flood' || sec === 'planning') {
      ensureDatasetLoaded(sec);
    } else if (sec === 'reports') {
      if (data.result) {
        setState('report');
      } else {
        ensureDatasetLoaded('reports');
      }
    }
  };

  return (
    <div className="app-container">
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <TopNav
        currentSection={activeSection}
        appState={state}
        siteName={data.result ? 'Pahang Catchment (Track B)' : 'Pahang River Basin'}
        onNewAnalysis={resetToHome}
        onNavigateSection={(sec) => handleNavSelect(sec as NavSection)}
      />

      {/* ── Main Application Shell ──────────────────────────────────── */}
      <div className="main-shell">
        {/* Compact Vertical Navigation */}
        <LeftNav
          activeSection={activeSection}
          onSelectSection={handleNavSelect}
        />

        {/* Dynamic Content Router */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {activeSection === 'projects' ? (
            <ProjectsPage
              onSelectProject={() => {
                ensureDatasetLoaded('spatial');
              }}
              onNewProject={resetToHome}
            />
          ) : state === 'processing' && data.jobId && data.imageId ? (
            <ProcessingPage
              jobId={data.jobId}
              imageId={data.imageId}
              onComplete={(result: AnalysisResult) => {
                update({ result });
                if (targetSectionAfterLoad === 'reports') {
                  setState('report');
                  setActiveSection('reports');
                } else {
                  setState('dashboard');
                  setActiveSection(targetSectionAfterLoad || 'spatial');
                }
              }}
              onError={() => {
                setState('upload');
                setActiveSection('overview');
              }}
            />
          ) : state === 'report' || activeSection === 'reports' ? (
            data.result ? (
              <ReportPage
                result={data.result}
                onBackToWorkspace={() => {
                  setState('dashboard');
                  setActiveSection('spatial');
                }}
              />
            ) : (
              <OverviewPage
                onStartAnalysis={handleStartAnalysis}
                onNavigateSection={handleNavSelect}
              />
            )
          ) : (state === 'dashboard' || activeSection === 'spatial' || activeSection === 'flood' || activeSection === 'planning') && data.result ? (
            <DashboardPage
              result={data.result}
              activeSection={activeSection}
              onGenerateReport={() => {
                setState('report');
                setActiveSection('reports');
              }}
            />
          ) : (
            <OverviewPage
              onStartAnalysis={handleStartAnalysis}
              onNavigateSection={handleNavSelect}
            />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
