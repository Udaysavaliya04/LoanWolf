import React from 'react';

function AuthLayout({ mode, onModeChange, children, error, onBackHome }) {
  return (
    <div className="auth-shell">
      {onBackHome && (
        <button type="button" className="auth-back-home" onClick={onBackHome}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 1 }}><path fill="none" d="M5 12h14M5 12l6 6m-6-6l6-6"/></svg>
           Return to home
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

