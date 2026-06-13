import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign-in failed. Check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left panel */}
      <div className="auth-panel-left">
        <Link to="/" className="auth-back-btn">← Back to home</Link>

        <div className="testimonial-card">
          <blockquote>
            "The cleanest way to manage consultation recordings I've ever used."
          </blockquote>
          <div className="testimonial-author">
            <div className="testimonial-avatar">DR</div>
            <div className="testimonial-author-info">
              <strong>Dr. Rahul Mehta</strong>
              <span>Senior Consultant, Apollo Health</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a0f3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your ConsultRM account to manage your recordings.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              required
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="auth-divider"><span>or</span></div>

          <div className="auth-link-row">
            New to ConsultRM?{' '}
            <Link to="/register">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
