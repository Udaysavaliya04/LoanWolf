import React, { useState } from 'react';

function HomePage({ onLoginClick, onSignupClick }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleFaqClick = (index) => {
    setOpenFaqIndex(prevIndex => (prevIndex === index ? null : index));
  };

  return (
    <div className="home-shell">
      <header className="site-header">
        <div className="site-header-inner">
            <div className="site-brand">
            <div className="site-brand-text">
              <span className="site-brand-title">Loanwolf</span>
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
        <div className="titan-text-container">
          <h1 className="titan-text">
            Master your <br />
            <span className="titan-highlight">financial destiny.</span>
          </h1>
        </div>
        
        <section className="bento-section">
          <div className="features-grid">
            
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

            <div className="f-card glass-panel">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
              </div>
              <div className="f-content">
                <h3>Minimal Charts</h3>
                <p>Track remaining principal vs time and yearly interest vs principal with clean, hoverable charts.</p>
              </div>
            </div>

            <div className="f-card glass-panel">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div className="f-content">
                <h3>Scenario Studio</h3>
                <p>Compare multiple what‑if plans to see months and interest saved versus your original bank schedule.</p>
              </div>
            </div>

            <div className="f-card glass-panel wide">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <div className="f-content">
                <h3>Advisor Guidance</h3>
                <p>Plain‑English suggestions on how much to overpay and when, so you are never guessing your strategy.</p>
              </div>
            </div>

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

        <section className="faq-section">
          <div className="faq-header">
            <h2>Common <span className="text-gradient-silver">Questions</span></h2>
          </div>

          <div className="faq-grid">
            <FaqItem 
              question="Is my financial data safe?" 
              answer="Absolutely. We don't ask for your bank login credentials. You only input the loan numbers (principal, interest rate, tenure) manually. Your data remains private and secure."
              isOpen={openFaqIndex === 0}
              onClick={() => handleFaqClick(0)}
            />
            <FaqItem 
              question="Does this work for HDFC, SBI, or ICICI loans?" 
              answer="Yes. Loanwolf works with the standard reducing balance method used by 99% of Indian banks (SBI, HDFC, ICICI, Axis, Kotak). If your bank adjusts interest monthly, this calculator is accurate for you."
              isOpen={openFaqIndex === 1}
              onClick={() => handleFaqClick(1)}
            />
            <FaqItem 
              question="How exactly does prepayment save money?" 
              answer="When you prepay, the entire amount goes towards reducing your Principal. Since interest is calculated on the remaining Principal, a smaller Principal means significantly lower interest for the rest of the loan tenure."
              isOpen={openFaqIndex === 2}
              onClick={() => handleFaqClick(2)}
            />
            <FaqItem 
              question="Can I simulate a rate hike by RBI?" 
              answer="Yes. Use the 'What-if Lab' to increase your current interest rate by 0.25% or 0.50% and see how much your tenure increases immediately."
              isOpen={openFaqIndex === 3}
              onClick={() => handleFaqClick(3)}
            />
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

const FaqItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div 
      className={`faq-item glass-panel ${isOpen ? 'open' : ''}`} 
      onClick={onClick}
    >
      <div className="faq-question">
        <span>{question}</span>
        <div className="faq-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14" className="vertical-line" />
            <path d="M5 12h14" />
          </svg>
        </div>
      </div>
      <div className="faq-answer">
        <p>{answer}</p>
      </div>
    </div>
  );
};

export default HomePage;

