import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef } from 'react';
import api from '../api';

const NAV = [
  { label: 'Dashboard', icon: DashIcon, key: 'dashboard' },
  { label: 'Recordings', icon: MicIcon, key: 'recordings' },
  { label: 'Settings', icon: SettingsIcon, key: 'settings' },
];

const RECORDINGS = [
  { title: 'Patient Follow-up', time: '2 days ago', duration: '45 min', tag: 'Follow-up' },
  { title: 'Initial Consultation', time: '3 days ago', duration: '60 min', tag: 'New Patient' },
  { title: 'Post-Op Review', time: '5 days ago', duration: '30 min', tag: 'Review' },
  { title: 'Therapy Session #4', time: '6 days ago', duration: '50 min', tag: 'Therapy' },
  { title: 'Annual Checkup', time: '1 week ago', duration: '25 min', tag: 'Routine' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setToast(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/recordings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setToast({ type: 'success', msg: 'Recording uploaded successfully.' });
    } catch (err: any) {
      setToast({ type: 'error', msg: err.response?.data?.message || 'Upload failed. Try again.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a0f3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </div>
          <h1>ConsultRM</h1>
          <p>Recording Manager</p>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ label, icon: Icon, key }) => (
            <a
              key={key}
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveNav(key); }}
              className={`nav-item ${activeNav === key ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-avatar-name">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button id="logout-btn" className="btn-logout" onClick={handleLogout}>
            <LogoutIcon size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dash-main">
        <header className="dash-header">
          <div className="dash-header-text">
            <h2>Hey there, {user?.name?.split(' ')[0]}!</h2>
            <p>Here's what's happening in your account today.</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              accept="audio/*,video/*"
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
            <button
              id="upload-btn"
              className="btn-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <UploadIcon size={15} />
              {uploading ? 'Uploading…' : 'Upload recording'}
            </button>
          </div>
        </header>

        <div className="dash-content">
          {toast && (
            <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
              {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
            </div>
          )}

          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-label">Total recordings</div>
              <div className="stat-card-value">24</div>
              <div className="stat-card-sub positive">↑ 4 this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Storage used</div>
              <div className="stat-card-value">4.2 GB</div>
              <div className="stat-card-sub">of 10 GB free tier</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Recent uploads</div>
              <div className="stat-card-value">12</div>
              <div className="stat-card-sub">Last 30 days</div>
            </div>
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="table-card-header">
              <h3>Recent consultations</h3>
              <span>Last 5 recordings</span>
            </div>
            {RECORDINGS.map((item, i) => (
              <div key={i} className="table-row">
                <div className="table-row-left">
                  <div className="row-icon">
                    <MicIcon size={16} color="#d97706" />
                  </div>
                  <div>
                    <div className="row-title">{item.title}</div>
                    <div className="row-meta">{item.time} · {item.duration}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="row-tag">{item.tag}</span>
                  <button className="btn-view">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline SVG icon components ───
function DashIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  );
}

function MicIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  );
}

function SettingsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function UploadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
  );
}

function LogoutIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  );
}

// Need React for JSX
import React from 'react';
