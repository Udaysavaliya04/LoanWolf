import React from 'react';

function HomePage({ onLoginClick, onSignupClick }) {
  return (
    <div className="home-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand">
            <div className="site-logo-mark">LW</div>
            <div className="site-brand-text">
              <span className="site-brand-title">Loanwolf</span>
              <span className="site-brand-sub">Loan payoff cockpit</span>
            </div>
          </div>
          <nav className="site-nav">
          </nav>
          <div className="site-header-auth">
            <button type="button" className="secondary-btn site-header-logout" onClick={onLoginClick}>
              Log in
            </button>
            <button type="button" className="primary-btn site-header-get-started" onClick={onSignupClick}>
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        <section className="app-header home-hero" id="top">
          <div className="hero-grid">
            <div className="hero-main">
              <div className="hero-pill">INDIA • LOAN STRATEGY STUDIO</div>
              <h1 className="hero-title">LOANWOLF</h1>
              <p className="hero-subtitle">
                A calm cockpit to watch your floating home loan, experiment with prepayments and get a
                plan to finish years earlier.
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="primary-btn hero-primary-cta"
                  onClick={onSignupClick}
                >
                  Create free account
                </button>
                <button
                  type="button"
                  className="secondary-btn hero-secondary-cta"
                  onClick={onLoginClick}
                >
                  I already have an account
                </button>
              </div>
            </div>
            <div className="hero-side">
              <div className="hero-card">
                <div className="hero-card-label">Bank‑grade amortization</div>
                <div className="hero-card-value">EMI schedule</div>
                <p className="hero-card-copy">
                  Fixed EMI with floating term, rate changes and prepayments so your sheet matches the
                  bank&apos;s.
                </p>
              </div>
              <div className="hero-card">
                <div className="hero-card-label">What‑if lab</div>
                <div className="hero-card-value">Scenarios &amp; comparisons</div>
                <p className="hero-card-copy">
                  Try bonuses, RBI hikes and rate resets on a sandbox before you touch the real loan.
                </p>
              </div>
              <div className="hero-card">
                <div className="hero-card-label">Advisor mode</div>
                <div className="hero-card-value">Extra EMI strategies</div>
                <p className="hero-card-copy">
                  Tell Loanwolf your surplus or target date, get a precise plan and interest saved.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- LUXURY BENTO GRID SECTION --- */}
        <section className="bento-section">
          <div className="bento-header">
            <h2>Everything tuned for <span className="text-highlight">Indian home loans</span></h2>
            <p>
              Indian currency, floating rates, and output aligned with real bank statements.
            </p>
          </div>

          <div className="features-grid">
            
            {/* 1. Amortization (Wide Card) */}
            <div className="f-card glass-panel wide">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
              </div>
              <div className="f-content">
                <h3>Live Amortization Table</h3>
                <p>Full EMI breakdown without pagination. Every month shows opening balance, interest, principal, and prepayments in a single view.</p>
              </div>
              <div className="f-visual-table">
                <div className="row head"><span>Month</span><span>Interest</span><span>Principal</span></div>
                <div className="row"><span>Apr</span><span>₹24,103</span><span>₹8,342</span></div>
                <div className="row"><span>May</span><span>₹23,980</span><span>₹8,465</span></div>
                <div className="row active"><span>Jun</span><span>₹23,810</span><span>₹58,635</span></div>
              </div>
            </div>

            {/* 2. Charts (Square Card) */}
            <div className="f-card glass-panel">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
              </div>
              <div className="f-content">
                <h3>Minimal Charts</h3>
                <p>Track remaining principal vs time and yearly interest vs principal with clean, hoverable charts.</p>
              </div>
            </div>

            {/* 3. Scenarios (Square Card) */}
            <div className="f-card glass-panel">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div className="f-content">
                <h3>Scenario Studio</h3>
                <p>Compare multiple what‑if plans to see months and interest saved versus your original bank schedule.</p>
              </div>
            </div>

            {/* 4. Advisor (Wide Card) */}
            <div className="f-card glass-panel wide">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <div className="f-content">
                <h3>Advisor Guidance</h3>
                <p>Plain‑English suggestions on how much to overpay and when, so you are never guessing your strategy.</p>
              </div>
            </div>

            {/* 5. Workflow (Full Width Strip) */}
            <div className="f-card glass-panel full-width workflow-strip">
              <div className="workflow-header">
                <h3>How Loanwolf fits into your month</h3>
              </div>
              <div className="workflow-steps">
                <div className="step">
                  <div className="step-num">1</div>
                  <span>Check Statement</span>
                </div>
                <div className="step-arrow">→</div>
                <div className="step">
                  <div className="step-num">2</div>
                  <span>Update Events</span>
                </div>
                <div className="step-arrow">→</div>
                <div className="step">
                  <div className="step-num">3</div>
                  <span>Run Advisor</span>
                </div>
                <div className="step-arrow">→</div>
                <div className="step">
                  <div className="step-num highlight">4</div>
                  <span className="text-highlight">Execute Plan</span>
                </div>
              </div>
            </div>

          </div>
        </section>

       <footer className="luxury-footer">
          <div className="footer-glass glass-panel">
            <div className="footer-left">
              <div className="footer-logo-box">LW</div>
              <span className="footer-copy">
                &copy; 2026 Loanwolf. Crafted with ❤️ by <span className="text-white">Uday Savaliya</span>.
              </span>
            </div>
            
            <div className="footer-right">
              <a href="#" className="footer-link">Twitter</a>
              <span className="footer-sep">•</span>
              <a href="#" className="footer-link">GitHub</a>
              <span className="footer-sep">•</span>
              <a href="#" className="footer-link">LinkedIn</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default HomePage;

