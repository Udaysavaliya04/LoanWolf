import React, { useState, useEffect } from 'react';

function HomePage({ onLoginClick, onSignupClick }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.scroll-reveal');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => hiddenElements.forEach((el) => observer.unobserve(el));
  }, []);

  const handleFaqClick = (index) => {
    setOpenFaqIndex(prevIndex => (prevIndex === index ? null : index));
  };

  return (
    <div className="home-shell">
      <header className="site-header">
        <div className="site-header-inner">
            <div className="site-brand">
            <div className="site-brand-text">
              <img src="/logo main.png" alt="Loanwolf" className="site-brand-logo" />
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
          <a href="https://www.producthunt.com/products/loanwolf?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-loanwolf" target="_blank" rel="noopener noreferrer" className="ph-badge-wrapper animate-blur-in">
            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1077962&theme=dark" alt="LOANWOLF - Track shifting rates, extra payments, and escape debt faster | Product Hunt" className="ph-badge" width="250" height="54" />
          </a>
          <h1 className="titan-text animate-blur-in delay-100">
            Master your <br />
            <span className="titan-highlight">financial destiny.</span>
          </h1>
        </div>
        
        <section className="bento-section">
          <div className="features-grid">
            
            <div className="f-card glass-panel wide scroll-reveal">
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

            <div className="f-card glass-panel scroll-reveal delay-100">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
              </div>
              <div className="f-content">
                <h3>Minimal Charts</h3>
                <p>Track remaining principal vs time and yearly interest vs principal with clean, hoverable charts.</p>
              </div>
            </div>

            <div className="f-card glass-panel scroll-reveal delay-200">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div className="f-content">
                <h3>Scenario Studio</h3>
                <p>Compare multiple what‑if plans to see months and interest saved versus your original bank schedule.</p>
              </div>
            </div>

            <div className="f-card glass-panel wide scroll-reveal">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <div className="f-content">
                <h3>Advisor Guidance</h3>
                <p>Plain‑English suggestions on how much to overpay and when, so you are never guessing your strategy.</p>
              </div>
            </div>

            <div className="f-card glass-panel full-width workflow-strip scroll-reveal">
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

        <section className="faq-section scroll-reveal">
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

       <footer className="luxury-footer scroll-reveal">
          <div className="footer-glass glass-panel">
            <div className="footer-left">
              <span className="footer-copy">
                &copy; 2026 Loanwolf. 
              </span>
            </div>
            <div classname="footer-center">
              <span className="footer-copy">
                Crafted with <svg className="footer-heart" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 2805.26 2354.44" viewBox="0 0 2805.26 2354.44"><g><polygon fill="#effaf4" points="2805.26 236.26 2686.59 236.26 2686.59 97.3 2488.4 97.3 2488.4 0 1731.69 0 1731.69 97.3 1591.16 97.3 1591.16 200.41 1505.22 200.41 1505.22 358.12 1318.94 358.12 1318.94 200.41 1214.11 200.41 1214.11 97.3 1073.57 97.3 1073.57 0 316.86 0 316.86 97.3 118.68 97.3 118.68 236.26 0 236.26 0 1107.43 135.33 1107.43 135.33 1303.43 294 1303.43 294 1467.82 497.03 1467.82 497.03 1632.22 670.95 1632.22 670.95 1846.94 875.39 1846.94 875.39 2035.08 1073.57 2035.08 1073.57 2234.95 1216.83 2234.95 1216.83 2354.44 1554.99 2354.44 1554.99 2234.95 1731.69 2234.95 1731.69 2035.08 1929.88 2035.08 1929.88 1846.94 2134.31 1846.94 2134.31 1632.22 2308.23 1632.22 2308.23 1467.82 2511.27 1467.82 2511.27 1303.43 2669.93 1303.43 2669.93 1107.43 2805.26 1107.43"/><g><polygon fill="#ff0900" points="2653.62 337.99 2547.77 337.99 2547.77 214.05 2371.01 214.05 2371.01 127.27 1696.12 127.27 1696.12 214.05 1570.78 214.05 1570.78 306.02 1494.13 306.02 1494.13 446.68 1327.99 446.68 1327.99 306.02 1234.49 306.02 1234.49 214.05 1109.15 214.05 1109.15 127.27 434.25 127.27 434.25 214.05 257.49 214.05 257.49 337.99 151.65 337.99 151.65 1114.97 272.35 1114.97 272.35 1289.78 413.86 1289.78 413.86 1436.4 594.94 1436.4 594.94 1583.03 750.06 1583.03 750.06 1774.53 932.39 1774.53 932.39 1942.33 1109.15 1942.33 1109.15 2120.59 1236.91 2120.59 1236.91 2227.16 1538.52 2227.16 1538.52 2120.59 1696.12 2120.59 1696.12 1942.33 1872.87 1942.33 1872.87 1774.53 2055.21 1774.53 2055.21 1583.03 2210.32 1583.03 2210.32 1436.4 2391.41 1436.4 2391.41 1289.78 2532.92 1289.78 2532.92 1114.97 2653.62 1114.97"/><rect width="173.49" height="152.5" x="2065.15" y="311.19" fill="#effaf4"/><rect width="24" height="24" x="2065.15" y="872.22" fill="#effaf4"/><rect width="24" height="24" x="1891.67" y="1024.72" fill="#effaf4"/><rect width="173.49" height="405.73" x="2238.64" y="456.69" fill="#effaf4"/></g></g></svg> by <span className="text-white">Uday Savaliya</span>.
              </span>
            </div>
            <div className="footer-right">
              <a href="#" className="footer-link">Twitter</a>
              <span className="footer-sep">•</span>
              <a href="#" className="footer-link">GitHub</a>
            </div>
          </div>
          <div className="footer-big-text">LOANWOLF</div>
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

