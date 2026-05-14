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

        <section className="edu-cta glass-panel scroll-reveal">
          <div>
            <span className="edu-kicker">Use your numbers</span>
            <h2>See your actual repayment path.</h2>
            <p>Enter your balance, rate, tenure, and extra payments to see the actual payoff path.</p>
          </div>
          <button type="button" className="primary-btn" onClick={() => navigate('/register')}>
            Start simulating
          </button>
        </section>

        <footer className="luxury-footer scroll-reveal">
          <div className="footer-glass glass-panel">
            <div className="footer-left">
              <span className="footer-copy">&copy; 2026 Loanwolf. All rights reserved.</span>
            </div>
            <div className="footer-center">
              <span className="footer-copy">Crafted by <span className="text-white">Uday Savaliya.</span></span>
            </div>
            <div className="footer-right">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/support'); }} className="footer-link">Buy me a coffee</a>
              <span className="footer-sep">-</span>
              <a href="https://x.com/Uday_Code" className="footer-link">Twitter</a>
              <span className="footer-sep">-</span>
              <a href="https://github.com/Udaysavaliya04" className="footer-link">GitHub</a>
              <span className="footer-sep">-</span>
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
