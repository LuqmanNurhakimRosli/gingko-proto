// Ginkgo Rebuild — Left Sidebar Navigation (Compact & Calm)
import type { FC } from 'react';

export type NavSection =
  | 'overview'
  | 'projects'
  | 'spatial'
  | 'flood'
  | 'planning'
  | 'reports'
  | 'settings';

interface LeftNavProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  expanded?: boolean;
}

const NAV_ITEMS: { id: NavSection; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '⌂' },
  { id: 'projects', label: 'Projects', icon: '◈' },
  { id: 'spatial', label: 'Spatial Analysis', icon: '▱' },
  { id: 'flood', label: 'Flood Intelligence', icon: '◉' },
  { id: 'planning', label: 'Planning Assessment', icon: '▦' },
  { id: 'reports', label: 'Reports', icon: '◌' },
];

export const LeftNav: FC<LeftNavProps> = ({
  activeSection,
  onSelectSection,
  expanded = false,
}) => {
  return (
    <aside className={`left-nav${expanded ? ' expanded' : ''}`}>
      {/* Top list */}
      <div className="left-nav-list">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              className={`left-nav-item${isActive ? ' active' : ''}`}
              onClick={() => onSelectSection(item.id)}
              title={item.label}
            >
              <span className="left-nav-icon">{item.icon}</span>
              {expanded && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom settings */}
      <div className="left-nav-list">
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 6px' }} />
        <button
          className={`left-nav-item${activeSection === 'settings' ? ' active' : ''}`}
          onClick={() => onSelectSection('settings')}
          title="Settings"
        >
          <span className="left-nav-icon">⚙</span>
          {expanded && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
};
