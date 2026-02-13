import React from 'react';

function AuthLayout({ mode, onModeChange, children, error, onBackHome }) {
  return (
    <div className="auth-shell">
      {onBackHome && (
        <button type="button" className="auth-back-home" onClick={onBackHome}>
          ← Return to home
        </button>
      )}
      <div className="auth-card auth-card-gradient">
        <div className="auth-header">
          <img src="/logo main.png" alt="LOANWOLF" className="auth-logo-img animate-blur-in" />
          <p className="auth-subtitle animate-blur-in delay-100">
            Track shifting rates, simulate extra payments, and <br></br>escape loan debt faster.
          </p>
        </div>

        <div className={`auth-toggle auth-toggle-capsule animate-blur-in delay-200 ${mode}`}>
          <div className="auth-pill" />
          <button
            type="button"
            className={`auth-toggle-button ${mode === 'login' ? 'active' : ''}`}
            onClick={() => onModeChange('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-toggle-button ${mode === 'register' ? 'active' : ''}`}
            onClick={() => onModeChange('register')}
          >
            Sign up
          </button>
        </div>

        {error && <div className="error-banner auth-error-banner">{error}</div>}

        {children}
      </div>
    </div>
  );
}

export default AuthLayout;

