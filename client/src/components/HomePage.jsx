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

        <section id="features" className="home-section">
          <div className="home-section-header">
            <h2>Everything tuned for Indian home loans</h2>
            <p>
              Indian currency, floating rates, and output aligned with real bank
              statements.
            </p>
          </div>
          <div className="home-features-grid">
            <div className="home-feature-card">
              <h3>Live amortization table</h3>
              <p>
                Full EMI breakdown without pagination. Every month shows opening balance, interest,
                principal and prepayments.
              </p>
            </div>
            <div className="home-feature-card">
              <h3>Minimal charts</h3>
              <p>
                Track remaining principal vs time and yearly interest vs principal with clean, hoverable
                charts.
              </p>
            </div>
            <div className="home-feature-card">
              <h3>Scenario studio</h3>
              <p>
                Compare multiple what‑if plans to see months and interest saved versus your original bank
                schedule.
              </p>
            </div>
            <div className="home-feature-card">
              <h3>Advisor guidance</h3>
              <p>
                Plain‑English suggestions on how much to overpay and when, so you are never guessing your
                strategy.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="home-section home-section-muted">
          <div className="home-section-header">
            <h2>How Loanwolf fits into your month</h2>
            <p>
              Check bank statement → update events → run advisor → follow the extra EMI plan for the next
              few months.
            </p>
          </div>
        </section>

        <footer className="footer">
          <span className="footer-text">Made with ❤️ by Uday Savaliya</span>
        </footer>
      </main>
    </div>
  );
}

export default HomePage;

