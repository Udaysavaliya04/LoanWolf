import React, { useEffect } from 'react';

function LoanEducation({ onLoginClick, onSignupClick, onBackHome }) {
  useEffect(() => {
    // Scroll reveal logic matching HomePage
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

  return (
    <div className="home-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand" onClick={onBackHome} style={{ cursor: 'pointer' }}>
            <div className="site-brand-text">
              <img src="/logo main.png" alt="Loanwolf" className="site-brand-logo" />
            </div>
          </div>
          <div className="site-header-auth">
            <button type="button" className="secondary-btn site-header-logout" onClick={onLoginClick}>
              Log In
            </button>
            <button type="button" className="primary-btn site-header-get-started" onClick={onSignupClick}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="home-main" style={{ paddingTop: '120px' }}>
        <div className="titan-text-container" style={{ marginBottom: '4rem' }}>
          <h1 className="titan-text animate-blur-in">
            Mastering The <br />
            <span className="text-gold">Debt Matrix.</span>
          </h1>
          <p className="titan-subtitle animate-blur-in delay-200">
            Banks profit from your lack of optimization. <br />
            Learn the dark patterns of interest, the geometry of amortization, and the raw mathematics of early payoff.
          </p>
        </div>

        <section className="bento-section" style={{paddingTop: '8rem'}}>
          <div className="bento-header scroll-reveal">
            <h2 style={{fontFamily: 'Bricolage Grotesque', paddingTop: '6rem'}}>The <span className="text-gradient-gold">Amortization</span> Trap</h2>
            <p style={{fontFamily: 'Bricolage Grotesque', letterSpacing: '-0.02em', fontSize: '1rem'}}>Your EMI is a fixed amount, but where that money goes changes every single month. By design, the bank front-loads their profits.</p>
          </div>
          
          <div className="features-grid" style={{ marginBottom: '6rem' }}>
            <div className="f-card glass-panel wide scroll-reveal">
              <div className="f-icon-box" style={{ color: '#ef4444' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div className="f-content">
                <h3>Interest Front-Loading</h3>
                <p>In the first few years of a 20-year mortgage, <b>up to 80% to 90%</b> of your monthly EMI goes directly to the bank as pure interest. You are barely making a dent in the actual principal you borrowed. The bank ensures they get paid their massive profits before you build any equity.</p>
              </div>
            </div>

            <div className="f-card glass-panel scroll-reveal delay-100">
              <div className="f-icon-box" style={{ color: '#ffd700' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18M18 17V9a4 4 0 0 0-4-4H9"/></svg>
              </div>
              <div className="f-content">
                <h3>The Curve</h3>
                <p>Amortization is not linear; it is an exponential curve. It takes years to reach the tipping point where more money starts going to principal than interest.</p>
              </div>
            </div>
            
            <div className="f-card glass-panel scroll-reveal delay-200">
              <div className="f-icon-box" style={{ color: '#10b981' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div className="f-content">
                <h3>The True Cost</h3>
                <p>On a ₹50L loan at 8.5% over 20 years, your total payback isn't ₹50L. It's nearly <b>₹1 Crore</b>. You end up paying back double what you borrowed.</p>
              </div>
            </div>

            <div className="f-card glass-panel wide scroll-reveal delay-100">
              <div className="f-icon-box" style={{ color: '#3b82f6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </div>
              <div className="f-content">
                <h3>The Hidden Ledger</h3>
                <p>Banks intentionally provide you with simple summary PDFs. They <b>rarely</b> provide you with a month-by-month interactive amortization schedule, because seeing the 300 rows of massive interest payments makes customers actively want to find ways to escape the trap.</p>
              </div>
            </div>
          </div>

          <div className="bento-header scroll-reveal">
            <h2>The Mathematics of <span className="text-gradient-gold">Escape</span></h2>
            <p style={{fontFamily: 'Bricolage Grotesque',letterSpacing: '-0.02em', fontSize: '1rem'}}>Every single penny you prepay bypasses the interest check completely and acts as a direct strike against your principal balance.</p>
          </div>

          <div className="features-grid" style={{ marginBottom: '6rem' }}>
             <div className="f-card glass-panel full-width workflow-strip scroll-reveal">
              <div className="workflow-header">
                <h3>The Prepayment Multiplier Effect</h3>
                <p style={{ color: '#a1a1aa', marginTop: '0.5rem', fontSize: '0.95rem' }}>Because interest is calculated <i>daily</i> or <i>monthly</i> on your remaining principal, an extra payment made in Year 1 destroys the principal that was generating interest for the next 19 years.</p>
              </div>
              
              <div className="math-grid">
                <div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem', fontFamily: 'Bricolage Grotesque' }}>1 Extra EMI</div>
                   <div style={{ color: '#a1a1aa', fontSize: '1rem' }}>Paid each year can shave off</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: '500', color: '#fff', marginTop: '0.5rem' }}>4 Years of Debt</div>
                </div>
                <div className="math-divider">
                   <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem', fontFamily: 'Bricolage Grotesque' }}>5% Increase</div>
                   <div style={{ color: '#a1a1aa', fontSize: '1rem' }}>In your monthly EMI knocks off</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: '500', color: '#fff', marginTop: '0.5rem' }}>3 Years & ₹5L+ Interest</div>
                </div>
                <div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffd700', marginBottom: '0.5rem', fontFamily: 'Bricolage Grotesque' }}>Early Action</div>
                   <div style={{ color: '#a1a1aa', fontSize: '1rem' }}>₹10,000 paid in Year 1 saves more than</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: '500', color: '#fff', marginTop: '0.5rem' }}>₹30,000 paid in Year 15</div>
                </div>
              </div>
            </div>
            
            <div className="f-card glass-panel wide scroll-reveal delay-100">
               <div className="f-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
               </div>
               <div className="f-content">
                 <h3>Rate Hikes & Floating Interest</h3>
                 <p>When the Reserve Bank hikes interest rates, banks <b>do not increase your EMI</b>. Instead, they quietly extend your loan tenure in the background. A seemingly small 0.5% rate hike can add literally <i>years</i> of extra payments to the end of your loan without you ever noticing until it's too late. The only defense is manually increasing your EMI.</p>
               </div>
            </div>
            
            <div className="f-card glass-panel scroll-reveal delay-200" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
               <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', fontFamily: 'Bricolage Grotesque' }}>Take Back Control</h3>
               <button onClick={onSignupClick} className="primary-btn" style={{ width: '100%', maxWidth: '200px' }}>Start Simulating</button>
            </div>

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

export default LoanEducation;
