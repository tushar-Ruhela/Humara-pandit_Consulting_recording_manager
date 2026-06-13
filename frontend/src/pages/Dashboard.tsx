import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Recording {
  id: string;
  title: string;
  description?: string;
  cloudinaryUrl: string;
  duration?: number;
  createdAt: string;
}

const NAV = [
  { label: 'Dashboard', icon: DashIcon, key: 'dashboard' },
  { label: 'Recordings', icon: MicIcon, key: 'recordings' },
  { label: 'Settings', icon: SettingsIcon, key: 'settings' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const modalFileRef = useRef<HTMLInputElement>(null);

  // Player modal
  const [playingRecording, setPlayingRecording] = useState<Recording | null>(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const fetchRecordings = useCallback(async () => {
    try {
      setLoadingRecordings(true);
      const res = await api.get('/recordings');
      setRecordings(res.data.recordings ?? []);
    } catch {
      setRecordings([]);
    } finally {
      setLoadingRecordings(false);
    }
  }, []);

  useEffect(() => { fetchRecordings(); }, [fetchRecordings]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── File selected inside modal ──────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ── Upload confirm ──────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle.trim());
      await api.post('/recordings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToast({ type: 'success', msg: `"${uploadTitle}" uploaded successfully.` });
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadTitle('');
      await fetchRecordings();
    } catch (err: any) {
      setToast({ type: 'error', msg: err.response?.data?.message || 'Upload failed. Try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const headerText: Record<string, { title: string; sub: string }> = {
    dashboard: { title: `Hey there, ${user?.name?.split(' ')[0]}!`, sub: "Here's what's happening in your account today." },
    recordings: { title: 'Recordings', sub: 'All your consultation recordings in one place.' },
    settings: { title: 'Settings', sub: 'Manage your account and preferences.' },
  };

  return (
    <div className="dash-shell">

      {/* ── Upload Modal ─────────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,15,60,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowUploadModal(false); setSelectedFile(null); } }}
        >
          <div style={{ background: 'white', borderRadius: 20, padding: '36px', width: 460, boxShadow: '0 32px 80px rgba(26,15,60,0.25)', position: 'relative' }}>
            <button
              onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20, lineHeight: 1 }}
            >✕</button>

            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#1a0f3c' }}>Upload recording</h3>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#9ca3af' }}>Select a file and give it a name before uploading.</p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => modalFileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#1a0f3c' : selectedFile ? '#f5c518' : '#e5e7eb'}`,
                borderRadius: 12,
                padding: '28px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? '#f8f7ff' : selectedFile ? '#fffbf0' : '#fafafa',
                transition: 'all 0.2s',
                marginBottom: 20,
              }}
            >
              <input ref={modalFileRef} type="file" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              {selectedFile ? (
                <>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🎙️</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a0f3c', wordBreak: 'break-all' }}>{selectedFile.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Click to change file</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a0f3c' }}>Click to select a file</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>or drag and drop here</div>
                  <div style={{ fontSize: 11, color: '#c4c4c4', marginTop: 6 }}>Audio or video files supported</div>
                </>
              )}
            </div>

            {/* Title input */}
            <div className="form-field" style={{ marginBottom: 24 }}>
              <label className="form-label">Recording title *</label>
              <input
                className="form-input"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpload()}
                placeholder="e.g. Patient Follow-up – Dr. Mehta"
                autoFocus={!!selectedFile}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, opacity: (!selectedFile || !uploadTitle.trim() || uploading) ? 0.5 : 1 }}
                onClick={handleUpload}
                disabled={!selectedFile || !uploadTitle.trim() || uploading}
              >
                {uploading ? 'Uploading…' : 'Upload recording'}
              </button>
              <button
                onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}
                style={{ flex: 1, padding: '11px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#6b7280', fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Player Modal ─────────────────────────────────────────────────────── */}
      {playingRecording && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,15,60,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setPlayingRecording(null); }}
        >
          <div style={{ background: 'white', borderRadius: 20, padding: '36px', width: 480, boxShadow: '0 32px 80px rgba(26,15,60,0.25)', position: 'relative' }}>
            <button
              onClick={() => setPlayingRecording(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20 }}
            >✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, background: '#fef3c7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MicIcon size={22} color="#d97706" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a0f3c' }}>{playingRecording.title}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{formatDate(playingRecording.createdAt)}</div>
              </div>
            </div>
            <audio
              controls
              autoPlay
              style={{ width: '100%', borderRadius: 8, outline: 'none', accentColor: '#f5c518' }}
              src={playingRecording.cloudinaryUrl}
            >
              Your browser does not support the audio element.
            </audio>
            <a
              href={playingRecording.cloudinaryUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: '#1a0f3c', fontWeight: 600 }}
            >
              Open in new tab ↗
            </a>
          </div>
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark"><MicIcon size={20} color="#1a0f3c" /></div>
          <h1>ConsultRM</h1>
          <p>Recording Manager</p>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ label, icon: Icon, key }) => (
            <a key={key} href="#"
              onClick={(e) => { e.preventDefault(); setActiveNav(key); setToast(null); }}
              className={`nav-item ${activeNav === key ? 'active' : ''}`}
            >
              <Icon size={17} /><span>{label}</span>
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
            <LogoutIcon size={14} /><span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="dash-main">
        <header className="dash-header">
          <div className="dash-header-text">
            <h2>{headerText[activeNav]?.title}</h2>
            <p>{headerText[activeNav]?.sub}</p>
          </div>
          {activeNav !== 'settings' && (
            <button id="upload-btn" className="btn-upload" onClick={() => setShowUploadModal(true)}>
              <UploadIcon size={15} /> Upload recording
            </button>
          )}
        </header>

        <div className="dash-content">
          {toast && (
            <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
              {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
            </div>
          )}

          {/* Dashboard view */}
          {activeNav === 'dashboard' && (
            <>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-card-label">Total recordings</div>
                  <div className="stat-card-value">{recordings.length}</div>
                  <div className="stat-card-sub">{recordings.length === 0 ? 'Upload your first one' : 'in your account'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">This month</div>
                  <div className="stat-card-value">{recordings.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length}</div>
                  <div className="stat-card-sub">recordings uploaded</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Latest upload</div>
                  <div className="stat-card-value" style={{ fontSize: 18 }}>{recordings[0] ? formatDate(recordings[0].createdAt) : '—'}</div>
                  <div className="stat-card-sub">{recordings[0]?.title ?? 'No uploads yet'}</div>
                </div>
              </div>
              <div className="table-card">
                <div className="table-card-header">
                  <h3>Recent consultations</h3>
                  <button style={{ fontSize: 12, color: '#1a0f3c', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setActiveNav('recordings')}>View all →</button>
                </div>
                {loadingRecordings
                  ? <LoadingRow />
                  : recordings.length === 0
                    ? <EmptyState onUpload={() => setShowUploadModal(true)} />
                    : recordings.slice(0, 5).map(r => (
                        <RecordingRow key={r.id} recording={r} formatDate={formatDate}
                          onPlay={() => setPlayingRecording(r)}
                          onView={() => setActiveNav('recordings')} />
                      ))}
              </div>
            </>
          )}

          {/* Recordings view */}
          {activeNav === 'recordings' && (
            <div className="table-card">
              <div className="table-card-header">
                <h3>All recordings</h3>
                <span>{recordings.length} {recordings.length === 1 ? 'file' : 'files'}</span>
              </div>
              {loadingRecordings
                ? <LoadingRow />
                : recordings.length === 0
                  ? <EmptyState onUpload={() => setShowUploadModal(true)} />
                  : recordings.map(r => (
                      <RecordingRow key={r.id} recording={r} formatDate={formatDate}
                        showDelete
                        onPlay={() => setPlayingRecording(r)}
                        onDelete={async () => {
                          if (!confirm(`Delete "${r.title}"?`)) return;
                          try {
                            await api.delete(`/recordings/${r.id}`);
                            await fetchRecordings();
                            setToast({ type: 'success', msg: `"${r.title}" deleted.` });
                          } catch {
                            setToast({ type: 'error', msg: 'Delete failed. Try again.' });
                          }
                        }} />
                    ))}
            </div>
          )}

          {/* Settings view */}
          {activeNav === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="table-card">
                <div className="table-card-header"><h3>Profile</h3></div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div className="user-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{initials}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#1a0f3c' }}>{user?.name}</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>{user?.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-field"><label className="form-label">Full name</label><input className="form-input" defaultValue={user?.name} /></div>
                    <div className="form-field"><label className="form-label">Email</label><input className="form-input" defaultValue={user?.email} disabled style={{ background: '#f9fafb', cursor: 'not-allowed' }} /></div>
                  </div>
                  <button className="btn-primary" style={{ width: 'auto', marginTop: 16, padding: '9px 24px' }}>Save changes</button>
                </div>
              </div>
              <div className="table-card">
                <div className="table-card-header"><h3>Change password</h3></div>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                  <div className="form-field"><label className="form-label">Current password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
                  <div className="form-field"><label className="form-label">New password</label><input className="form-input" type="password" placeholder="Min. 6 characters" /></div>
                  <button className="btn-primary" style={{ width: 'auto', padding: '9px 24px' }}>Update password</button>
                </div>
              </div>
              <div className="table-card" style={{ border: '1px solid #fecaca' }}>
                <div className="table-card-header" style={{ borderBottom: '1px solid #fee2e2' }}><h3 style={{ color: '#b91c1c' }}>Danger zone</h3></div>
                <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1a0f3c' }}>Sign out of all devices</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Invalidates your current session.</div>
                  </div>
                  <button onClick={handleLogout} style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Sign out everywhere
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function RecordingRow({ recording, formatDate, showDelete = false, onPlay, onView, onDelete }: {
  recording: Recording; formatDate: (d: string) => string;
  showDelete?: boolean; onPlay?: () => void; onView?: () => void; onDelete?: () => void;
}) {
  return (
    <div className="table-row">
      <div className="table-row-left">
        <div className="row-icon"><MicIcon size={16} color="#d97706" /></div>
        <div>
          <div className="row-title">{recording.title}</div>
          <div className="row-meta">{formatDate(recording.createdAt)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn-view" onClick={onPlay} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          ▶ Play
        </button>
        {!showDelete && <button className="btn-view" onClick={onView}>View all</button>}
        {showDelete && onDelete && (
          <button className="btn-view" onClick={onDelete} style={{ color: '#ef4444', borderColor: '#fecaca' }}>Delete</button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <MicIcon size={36} color="#d1d5db" />
      <p style={{ marginTop: 12, fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>No recordings yet</p>
      <p style={{ fontSize: 13, color: '#c4c4c4', marginTop: 4 }}>Upload your first consultation recording to get started.</p>
      <button className="btn-upload" style={{ marginTop: 16, display: 'inline-flex' }} onClick={onUpload}>
        <UploadIcon size={14} /> Upload recording
      </button>
    </div>
  );
}

function LoadingRow() {
  return <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading…</div>;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function DashIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
}
function MicIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
}
function SettingsIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function UploadIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
}
function LogoutIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
}
