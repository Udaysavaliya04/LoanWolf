import React from 'react';

function AuthLayout({ mode, onModeChange, children, error, onBackHome }) {
  return (
    <div className="auth-shell">
      {onBackHome && (
        <button type="button" className="auth-back-home" onClick={onBackHome}>
          Back to home
        </button>
      )}
      <div className="auth-card auth-card-gradient">
        <div className="auth-header">
          <h1 className="auth-logo">LOANWOLF</h1>
          <p className="auth-subtitle">
            Track shifting rates, simulate extra payments, and escape debt faster.
          </p>
        </div>

        <div className="auth-toggle auth-toggle-capsule">
          <button
            type="button"
            className={
              'auth-toggle-button' + (mode === 'login' ? ' auth-toggle-button-active' : '')
            }
            onClick={() => onModeChange('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={
              'auth-toggle-button' + (mode === 'register' ? ' auth-toggle-button-active' : '')
            }
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

