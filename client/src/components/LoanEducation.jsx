import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const moneyFlow = [
  { label: 'Early EMI', interest: 82, principal: 18, note: 'Mostly interest' },
  { label: 'Middle EMI', interest: 51, principal: 49, note: 'Turning point' },
  { label: 'Late EMI', interest: 14, principal: 86, note: 'Principal finally wins' },
];

const loanMap = [
  { year: 'Year 1', balance: '98%', tone: 'danger', label: 'Slow start' },
  { year: 'Year 5', balance: '82%', tone: 'warn', label: 'Interest heavy' },
  { year: 'Year 10', balance: '57%', tone: 'steady', label: 'Momentum begins' },
  { year: 'Year 15', balance: '28%', tone: 'good', label: 'Principal accelerates' },
  { year: 'Year 20', balance: '0%', tone: 'done', label: 'Closed' },
];

const trapCards = [
  { title: 'Rate increase', visual: '+0.5%', result: 'Check whether your tenure increased after the rate changed.', color: '#f97316' },
  { title: 'Payment split', visual: 'P + I', result: 'See how much of each EMI reduces the balance.', color: '#60a5fa' },
  { title: 'Rate comparison', visual: '0.4%', result: 'A small rate gap can become a large interest difference.', color: '#e879f9' },
  { title: 'Added charges', visual: '+EMI', result: 'Know what was added to the loan before interest starts.', color: '#ef4444' },
];

const escapeMoves = [
  { title: 'Prepay earlier', stat: 'Earlier payments save more', text: 'Extra principal reduces the balance used to calculate future interest.' },
  { title: 'Try one extra EMI', stat: 'Compare payoff dates', text: 'A yearly extra payment can show a clear change in term and interest.' },
  { title: 'Review after rate hikes', stat: 'Protect the timeline', text: 'If rates rise, compare the new schedule before accepting a longer tenure.' },
];

const myths = [
  { myth: 'Every EMI reduces the loan equally.', truth: 'Early payments usually contain more interest and less principal.' },
  { myth: 'A small rate change barely matters.', truth: 'Even a small increase can change total interest or extend tenure.' },
  { myth: 'Extra payment always lowers next month’s EMI.', truth: 'It often shortens the loan instead, unless the loan is recast.' },
];

function SplitBar({ interest, principal }) {
  return (
    <div className="edu-split-bar" aria-label={`Interest ${interest} percent and principal ${principal} percent`}>
      <span className="edu-interest" style={{ width: `${interest}%` }} />
      <span className="edu-principal" style={{ width: `${principal}%` }} />
    </div>
  );
}

function LoanEducation() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.scroll-reveal');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => hiddenElements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="home-shell loan-education-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="site-brand-text">
              <img src="/logo main.png" alt="Loanwolf" className="site-brand-logo" />
            </div>
          </div>
          <div className="site-header-auth">
            <button type="button" className="secondary-btn site-header-logout" onClick={() => navigate('/login')}>
              Log In
            </button>
            <button type="button" className="primary-btn site-header-get-started" onClick={() => navigate('/register')}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="home-main edu-main">
        <section className="edu-hero">
          <div className="edu-hero-copy animate-blur-in">
            <span className="edu-kicker">Understand your repayment</span>
            <h1>
              Know what your <span className="text-gold">EMI</span> is paying for.
            </h1>
            <p>
              Track principal, interest, extra payments, and payoff dates before making a decision.
            </p>
            <button type="button" className="primary-btn edu-hero-btn" onClick={() => navigate('/register')}>
              Simulate my loan
            </button>
          </div>

          <div className="edu-hero-visual animate-blur-in delay-200">
            <div className="edu-mini-card">
              <span>Loan amount</span>
              <strong>Rs 50L</strong>
            </div>
            <div className="edu-mini-card">
              <span>Total paid</span>
              <strong>~Rs 1Cr</strong>
            </div>
            <div className="edu-payoff-ring">
              <div>
                <strong>2x</strong>
                <span>total repayment</span>
              </div>
            </div>
          </div>
        </section>

        <section className="edu-section scroll-reveal">
          <div className="bento-header edu-section-header">
            <h2>EMI Split</h2>
            <p>Your monthly payment stays steady, but the interest and principal split changes over time.</p>
          </div>

          <div className="edu-split-grid">
            {moneyFlow.map((item) => (
              <article className="f-card glass-panel edu-split-card" key={item.label}>
                <div className="edu-card-topline">
                  <span>{item.label}</span>
                  <strong>{item.note}</strong>
                </div>
                <SplitBar interest={item.interest} principal={item.principal} />
                <div className="edu-split-legend">
                  <span><i className="edu-dot interest" />{item.interest}% interest</span>
                  <span><i className="edu-dot principal" />{item.principal}% principal</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="edu-section scroll-reveal">
          <div className="bento-header edu-section-header">
            <h2>The Amortization Curve</h2>
            <p>The beginning feels stuck. The end moves fast.</p>
          </div>

          <div className="f-card glass-panel edu-timeline-card full-width">
            <div className="edu-balance-line">
              {loanMap.map((point) => (
                <div className={`edu-balance-point ${point.tone}`} key={point.year}>
                  <div className="edu-balance-pill">{point.balance}</div>
                  <span>{point.year}</span>
                  <small>{point.label}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="edu-section scroll-reveal">
          <div className="bento-header edu-section-header">
            <h2>What To Check</h2>
            <p>The numbers that usually decide total interest and payoff time.</p>
          </div>

          <div className="features-grid edu-trap-grid">
            {trapCards.map((card) => (
              <article className="f-card glass-panel edu-trap-card" key={card.title}>
                <div className="edu-trap-visual" style={{ color: card.color }}>{card.visual}</div>
                <h3>{card.title}</h3>
                <p>{card.result}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="edu-section scroll-reveal">
          <div className="bento-header edu-section-header">
            <h2>Ways To Pay Smarter</h2>
            <p>Use the schedule to compare options before you change your payment plan.</p>
          </div>

          <div className="edu-move-board">
            {escapeMoves.map((move, index) => (
              <article className="edu-move-card" key={move.title}>
                <span className="edu-move-number">0{index + 1}</span>
                <h3>{move.title}</h3>
                <strong>{move.stat}</strong>
                <p>{move.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="edu-section edu-myth-section scroll-reveal">
          <div className="bento-header edu-section-header">
            <h2>Common Misreads</h2>
            <p>A few loan assumptions worth checking before you act.</p>
          </div>

          <div className="edu-myth-grid">
            {myths.map((item) => (
              <article className="edu-myth-card" key={item.myth}>
                <div>
                  <span>Myth</span>
                  <p>{item.myth}</p>
                </div>
                <div>
                  <span>Fact</span>
                  <p>{item.truth}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="site-footer scroll-reveal">
          <div className="footer-glass glass-panel">
            <div className="footer-left">
              <span className="footer-copy">
                &copy; 2026 Loanwolf. All rights reserved.
              </span>
            </div>
            <div className="footer-center">
              <span className="footer-copy">
                Crafted with <svg className="footer-heart" xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 2805.26 2354.44" viewBox="0 0 2805.26 2354.44"><g><polygon fill="#effaf4" points="2805.26 236.26 2686.59 236.26 2686.59 97.3 2488.4 97.3 2488.4 0 1731.69 0 1731.69 97.3 1591.16 97.3 1591.16 200.41 1505.22 200.41 1505.22 358.12 1318.94 358.12 1318.94 200.41 1214.11 200.41 1214.11 97.3 1073.57 97.3 1073.57 0 316.86 0 316.86 97.3 118.68 97.3 118.68 236.26 0 236.26 0 1107.43 135.33 1107.43 135.33 1303.43 294 1303.43 294 1467.82 497.03 1467.82 497.03 1632.22 670.95 1632.22 670.95 1846.94 875.39 1846.94 875.39 2035.08 1073.57 2035.08 1073.57 2234.95 1216.83 2234.95 1216.83 2354.44 1554.99 2354.44 1554.99 2234.95 1731.69 2234.95 1731.69 2035.08 1929.88 2035.08 1929.88 1846.94 2134.31 1846.94 2134.31 1632.22 2308.23 1632.22 2308.23 1467.82 2511.27 1467.82 2511.27 1303.43 2669.93 1303.43 2669.93 1107.43 2805.26 1107.43"/><g><polygon fill="#ff0900" points="2653.62 337.99 2547.77 337.99 2547.77 214.05 2371.01 214.05 2371.01 127.27 1696.12 127.27 1696.12 214.05 1570.78 214.05 1570.78 306.02 1494.13 306.02 1494.13 446.68 1327.99 446.68 1327.99 306.02 1234.49 306.02 1234.49 214.05 1109.15 214.05 1109.15 127.27 434.25 127.27 434.25 214.05 257.49 214.05 257.49 337.99 151.65 337.99 151.65 1114.97 272.35 1114.97 272.35 1289.78 413.86 1289.78 413.86 1436.4 594.94 1436.4 594.94 1583.03 750.06 1583.03 750.06 1774.53 932.39 1774.53 932.39 1942.33 1109.15 1942.33 1109.15 2120.59 1236.91 2120.59 1236.91 2227.16 1538.52 2227.16 1538.52 2120.59 1696.12 2120.59 1696.12 1942.33 1872.87 1942.33 1872.87 1774.53 2055.21 1774.53 2055.21 1583.03 2210.32 1583.03 2210.32 1436.4 2391.41 1436.4 2391.41 1289.78 2532.92 1289.78 2532.92 1114.97 2653.62 1114.97"/><rect width="173.49" height="152.5" x="2065.15" y="311.19" fill="#effaf4"/><rect width="24" height="24" x="2065.15" y="872.22" fill="#effaf4"/><rect width="24" height="24" x="1891.67" y="1024.72" fill="#effaf4"/><rect width="173.49" height="405.73" x="2238.64" y="456.69" fill="#effaf4"/></g></g></svg> by <span className="text-white">Uday Savaliya.</span>
              </span>
            </div>
            <div className="footer-right">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/support'); }} className="footer-link">Buy me a coffee</a>
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

export default LoanEducation;
