// Ginkgo Rebuild — Projects Page (Data-table first)
import { useState, type FC } from 'react';

const PROJECTS_DATA = [
  { id: 'prj-1', name: 'Pahang River Basin (Track B Masterplan)', location: 'Pekan / Kuantan, Pahang', area: '450.0 ha', floodRisk: 'High (65/100)', riskType: 'high', suitability: '72/100', status: 'In Review', updated: 'Today, 10:24 AM' },
  { id: 'prj-2', name: 'Temerloh North Mixed Industrial Park', location: 'Temerloh, Pahang', area: '128.4 ha', floodRisk: 'Moderate (48/100)', riskType: 'mod', suitability: '64/100', status: 'Conditional MSMA', updated: 'Yesterday' },
  { id: 'prj-3', name: 'Jerantut Central Residential Expansion', location: 'Jerantut, Pahang', area: '85.2 ha', floodRisk: 'Low (24/100)', riskType: 'low', suitability: '88/100', status: 'DO Approved', updated: 'Aug 18, 2026' },
  { id: 'prj-4', name: 'Bentong Forest Eco-Buffer & Hillside', location: 'Bentong, Pahang', area: '310.5 ha', floodRisk: 'Low (18/100)', riskType: 'low', suitability: '92/100', status: 'Gazetted GI', updated: 'Aug 17, 2026' },
  { id: 'prj-5', name: 'Kuantan Coastal Stormwater Attenuation', location: 'Kuantan, Pahang', area: '210.0 ha', floodRisk: 'Moderate (52/100)', riskType: 'mod', suitability: '58/100', status: 'EIA Screening', updated: 'Aug 14, 2026' },
];

interface ProjectsPageProps {
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
}

export const ProjectsPage: FC<ProjectsPageProps> = ({ onSelectProject, onNewProject }) => {
  const [search, setSearch] = useState('');

  const filtered = PROJECTS_DATA.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="scroll-y" style={{ flex: 1, padding: '28px 36px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 2 }}>
            Planning Projects & Workspaces
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Manage site dossiers, boundary coordinates, and statutory approval submissions under Akta 172.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onNewProject}>
          + New Project
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Filter by project name, district, or river catchment…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, maxWidth: 400, padding: '7px 12px', fontSize: 12,
            background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 6,
            outline: 'none',
          }}
        />
        <button className="btn btn-secondary btn-sm">All Districts</button>
        <button className="btn btn-secondary btn-sm">All Risk Levels</button>
      </div>

      {/* Clean Data Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Project Name</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Study Area</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Flood Risk</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Suitability</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Planning Status</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background var(--t-fast)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {p.name}
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{p.location}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{p.area}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span className={p.riskType === 'high' ? 'badge badge-high' : p.riskType === 'mod' ? 'badge badge-mod' : 'badge badge-low'}>
                    {p.floodRisk}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--brand-green)', fontFamily: 'var(--font-mono)' }}>{p.suitability}</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{p.status}</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{p.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
