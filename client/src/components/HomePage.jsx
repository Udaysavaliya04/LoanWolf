import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const navigate = useNavigate();

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
            <button type="button" className="secondary-btn site-header-logout" style={{height: '32px'}} onClick={() => navigate('/login')}>
              Log In
            </button>
            <button type="button" className="primary-btn site-header-get-started" onClick={() => navigate('/register')}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="titan-text-container">
          <a href="https://www.producthunt.com/products/loanwolf?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-loanwolf" target="_blank" rel="noopener noreferrer" className="ph-badge-wrapper animate-blur-in">
            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1077962&theme=dark" alt="LOANWOLF - Track shifting rates, extra payments, and escape debt faster | Product Hunt" className="ph-badge" width="250" height="54" />
          </a>

          <div className="animate-blur-in delay-100" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', marginTop: '0.75rem', width: '100%', padding: '0 1rem' }}>
            <button type="button" className="rotating-hero-btn" onClick={() => navigate('/learnloans')} style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem', maxWidth: '100%' }}>
              <span className="text-gold hide-on-mobile" style={{ fontWeight: 'bold' }}>Guide</span> 
              <span className="hide-on-mobile" style={{ margin: '0 8px', color: 'rgba(255,255,255,0.3)' }}>|</span> 
              Learn how banks trap you in debt 
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:1, marginLeft: '4px'}}><path fill="none" d="M5 12h14m-7-7l7 7l-7 7"/></svg>
            </button>
          </div>

          <h1 className="titan-text animate-blur-in delay-200">
            Architect your <br />
            <span className="text-gold">financial <span className="text-gold">freedom!</span></span>
          </h1>
          <p className="titan-subtitle animate-blur-in delay-300">
            Precision analytics for floating & Fixed -rate mortgages. <br></br>Simulate strategic prepayments, monitor interest drift, and accelerate your path to zero debt.
          </p>
          <div className="hero-cta-group animate-blur-in delay-400">
            <button type="button" className="secondary-btn hero-login-btn" style={{}} onClick={() => navigate('/login')}>
              Log In
            </button>
            <button type="button" className="primary-btn hero-get-started-btn" onClick={() => navigate('/register')}>
              Sign Up
            </button>
          </div>
        </div>
        
        <section className="bento-section">
          <div className="features-grid">
            
            <div className="f-card glass-panel wide scroll-reveal">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18"/></svg>
              </div>
              <div className="f-content">
                <h3>Live Amortization Table</h3>
                <p>Full EMI breakdown without pagination. Every month shows opening balance, interest, principal, and prepayments in a single view.</p>
              </div>
              <div className="f-visual-table">
                <div className="row head"><span>Month</span><span>Interest</span><span>Principal</span></div>
                <div className="row"><span>Apr</span><span>₹24,103</span><span>₹8,342</span></div>
                <div className="row"><span>May</span><span>₹23,980</span><span>₹8,465</span></div>
                <div className="row active"><span>Jun</span><span>₹23,810</span><span>₹8,635</span></div>
              </div>
            </div>

            <div className="f-card glass-panel scroll-reveal delay-100">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 21v-6m7 6V3m7 18V9"/></svg>
              </div>
              <div className="f-content">
                <h3>Minimal Charts</h3>
                <p>Track remaining principal vs time and yearly interest vs principal with clean, hoverable charts.</p>
              </div>
            </div>

            <div className="f-card glass-panel scroll-reveal delay-200">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5c1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5c.7.7 1.3 1.5 1.5 2.5m0 4h6m-5 4h4"/></svg>
              </div>
              <div className="f-content">
                <h3>Strategy Sandbox</h3>
                <p>Compare multiple what‑if plans to see months and interest saved versus your original bank schedule.</p>
              </div>
            </div>

            <div className="f-card glass-panel wide scroll-reveal">
              <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535zM8 15H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/></svg>              </div>
              <div className="f-content">
                <h3>Advisor Guidance</h3>
                <p>Algorithmic recommendations on optimal prepayment timing to maximize interest savings.</p>
              </div>
            </div>

            <div className="f-card glass-panel full-width workflow-strip scroll-reveal">
              <div className="workflow-header">
                <h3>The Monthly Optimization Cycle</h3>
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

        <section className="testimonials-section scroll-reveal">
          <div className="testimonials-header">
            <h2>Loved by <span className="text-gradient-gold">Early Adopters</span></h2>
          </div>
          
          <div className="marquee-container">
            <div className="marquee-track">
              {[
                { name: "Talwinder", tag: "Saved ₹12L", text: "I realized I was paying 40% more interest than I thought. The prepay simulator is a lifesaver." },
                { name: "Aditya", tag: "Debt-free in 7 yrs", text: "Standard bank calculators hide the truth. LoanWolf showed me exactly how to kill my loan fast." },
                { name: "Arijit", tag: "Saved ₹4.5L", text: "The 'What-if' lab is genius. I simulated a rate hike and adjusted my EMI immediately." },
                { name: "Michael", tag: "Peace of Mind", text: "Finally, a dashboard that speaks my language. No confusing bank jargon, just raw numbers." },
                { name: "Ranveer", tag: "Optimization Geek", text: "I track my loan like I track my stocks now. Seeing the principal drop is addictive." },
                { name: "Justin", tag: "Saved ₹12L", text: "I realized I was paying 40% more interest than I thought. The prepay simulator is a lifesaver." },
                { name: "Shreya", tag: "Debt-free in 3 yrs", text: "Standard bank calculators hide the truth. LoanWolf showed me exactly how to kill my loan fast." },
                { name: "Ricky", tag: "Saved lakhs", text: "The 'What-if' lab is genius. I simulated a rate hike and adjusted my EMI immediately." },
                { name: "Sneha", tag: "Crazy Savings", text: "Finally, a dashboard that speaks my language. No confusing bank jargon, just raw numbers." },
                { name: "Elvis", tag: "Optimization Geek", text: "I track my loan like I track my stocks now. Seeing the principal drop is addictive." },
              ].map((t, i) => (
                <div key={i} className="testimonial-card glass-panel">
                  <div className="t-header">
                    <div className="t-avatar">{t.name[0]}</div>
                    <div className="t-info">
                      <div className="t-name">{t.name}</div>
                      <div className="t-tag">{t.tag}</div>
                    </div>
                  </div>
                  <p className="t-text">“{t.text}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="faq-section scroll-reveal">
          <div className="faq-header" style={{ fontFamily: 'Bricolage Grotesque' }}>
            <h2>Frequently Asked <span className="text-gradient-gold">Questions</span></h2>
          </div>

          <div className="faq-grid">
            <FaqItem 
              question="Is my financial data safe?" 
              answer="Absolutely. We don't ask for your bank login credentials. You only input the loan numbers (principal, interest rate, tenure) manually. Your data remains private and secure."
              isOpen={openFaqIndex === 0}
              onClick={() => handleFaqClick(0)}
            />
            <FaqItem 
              question="Does this work for my bank loans?" 
              answer="Yes. Loanwolf works with the standard reducing balance method used by 99% of world banks. If your bank adjusts interest monthly, this calculator is very accurate for you."
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
              question="Can I simulate a rate hike by Reserve Bank?" 
              answer="Yes. Use the 'What-if Lab' to increase your current interest rate by 0.25% or 0.50% and see how much your tenure increases immediately."
              isOpen={openFaqIndex === 3}
              onClick={() => handleFaqClick(3)}
            />
            <FaqItem 
              question="How does the system handle floating interest rates?" 
              answer="Seamlessly. You can log historical and projected rate changes exactly when they occur. The engine instantaneously recalibrates the interest accrual from that specific month forward, ensuring your digital ledger matches reality."
              isOpen={openFaqIndex === 4}
              onClick={() => handleFaqClick(4)}
            />
            <FaqItem 
              question="Is LoanWolf free to use?" 
              answer="The core Amortization Engine and Strategy Sandbox are completely free. We built this platform to democratize the financial mathematics that banks use to maximize profits, putting the power of debt-reduction back in your hands."
              isOpen={openFaqIndex === 5}
              onClick={() => handleFaqClick(5)}
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
            <div className="footer-center">
              <span className="footer-copy">
                Crafted with <svg className="footer-heart" xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 2805.26 2354.44" viewBox="0 0 2805.26 2354.44"><g><polygon fill="#effaf4" points="2805.26 236.26 2686.59 236.26 2686.59 97.3 2488.4 97.3 2488.4 0 1731.69 0 1731.69 97.3 1591.16 97.3 1591.16 200.41 1505.22 200.41 1505.22 358.12 1318.94 358.12 1318.94 200.41 1214.11 200.41 1214.11 97.3 1073.57 97.3 1073.57 0 316.86 0 316.86 97.3 118.68 97.3 118.68 236.26 0 236.26 0 1107.43 135.33 1107.43 135.33 1303.43 294 1303.43 294 1467.82 497.03 1467.82 497.03 1632.22 670.95 1632.22 670.95 1846.94 875.39 1846.94 875.39 2035.08 1073.57 2035.08 1073.57 2234.95 1216.83 2234.95 1216.83 2354.44 1554.99 2354.44 1554.99 2234.95 1731.69 2234.95 1731.69 2035.08 1929.88 2035.08 1929.88 1846.94 2134.31 1846.94 2134.31 1632.22 2308.23 1632.22 2308.23 1467.82 2511.27 1467.82 2511.27 1303.43 2669.93 1303.43 2669.93 1107.43 2805.26 1107.43"/><g><polygon fill="#ff0900" points="2653.62 337.99 2547.77 337.99 2547.77 214.05 2371.01 214.05 2371.01 127.27 1696.12 127.27 1696.12 214.05 1570.78 214.05 1570.78 306.02 1494.13 306.02 1494.13 446.68 1327.99 446.68 1327.99 306.02 1234.49 306.02 1234.49 214.05 1109.15 214.05 1109.15 127.27 434.25 127.27 434.25 214.05 257.49 214.05 257.49 337.99 151.65 337.99 151.65 1114.97 272.35 1114.97 272.35 1289.78 413.86 1289.78 413.86 1436.4 594.94 1436.4 594.94 1583.03 750.06 1583.03 750.06 1774.53 932.39 1774.53 932.39 1942.33 1109.15 1942.33 1109.15 2120.59 1236.91 2120.59 1236.91 2227.16 1538.52 2227.16 1538.52 2120.59 1696.12 2120.59 1696.12 1942.33 1872.87 1942.33 1872.87 1774.53 2055.21 1774.53 2055.21 1583.03 2210.32 1583.03 2210.32 1436.4 2391.41 1436.4 2391.41 1289.78 2532.92 1289.78 2532.92 1114.97 2653.62 1114.97"/><rect width="173.49" height="152.5" x="2065.15" y="311.19" fill="#effaf4"/><rect width="24" height="24" x="2065.15" y="872.22" fill="#effaf4"/><rect width="24" height="24" x="1891.67" y="1024.72" fill="#effaf4"/><rect width="173.49" height="405.73" x="2238.64" y="456.69" fill="#effaf4"/></g></g></svg> by <span className="text-white">Uday Savaliya</span>.
              </span>
            </div>
            <div className="footer-right">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/support'); }} className="footer-link">Support me</a>
              <span className="footer-sep">•</span>
              <a href="https://x.com/Uday_Code" className="footer-link">Twitter</a>
              <span className="footer-sep">•</span>
              <a href="https://github.com/Udaysavaliya04" className="footer-link">GitHub</a>
              <span className="footer-sep">•</span>
              <a href="https://www.linkedin.com/in/uday-savaliya-b30bb7286" className="footer-link">LinkedIn</a>
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

