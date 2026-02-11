import { useEffect, useState, useRef } from 'react';
import './App.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomePage from './components/HomePage';

const EMPTY_LOAN_FORM = {
  name: '',
  principal: '',
  annualInterestRate: '',
  termMonths: '',
  startDate: '',
};

const EMPTY_EVENT_FORM = {
  type: 'EXTRA_PAYMENT',
  date: '',
  amount: '',
  newAnnualInterestRate: '',
  note: '',
};

const formatINR = (value) => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const INITIAL_SCENARIOS = [
  { id: 'A', name: 'Scenario A', lumpSumAmount: '', lumpSumDate: '', newRatePct: '', newRateDate: '' },
  { id: 'B', name: 'Scenario B', lumpSumAmount: '', lumpSumDate: '', newRatePct: '', newRateDate: '' },
  { id: 'C', name: 'Scenario C', lumpSumAmount: '', lumpSumDate: '', newRatePct: '', newRateDate: '' },
];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [shellView, setShellView] = useState('home'); // 'home' | 'auth'
  const [loanForm, setLoanForm] = useState(EMPTY_LOAN_FORM);
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [scheduleData, setScheduleData] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState('');
  const scheduleRef = useRef(null);
  const loanMenuRef = useRef(null);
  const eventTypeMenuRef = useRef(null);
  const [loanMenuOpen, setLoanMenuOpen] = useState(false);
  const [eventTypeMenuOpen, setEventTypeMenuOpen] = useState(false);
  const [principalHover, setPrincipalHover] = useState(null);
  const [yearlyHover, setYearlyHover] = useState(null);
  const [scenarios, setScenarios] = useState(INITIAL_SCENARIOS);
  const [scenarioResults, setScenarioResults] = useState([]);
  const [runningScenarios, setRunningScenarios] = useState(false);
  const [advisorMode, setAdvisorMode] = useState('extra'); // 'extra' | 'target'
  const [advisorExtra, setAdvisorExtra] = useState('');
  const [advisorTargetDate, setAdvisorTargetDate] = useState('');
  const [advisorResult, setAdvisorResult] = useState(null);
  const [runningAdvice, setRunningAdvice] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  async function fetchLoans() {
    try {
      const res = await fetch('/api/loans');
      const data = await res.json();
      setLoans(data);
      if (!selectedLoanId && data.length > 0) {
        setSelectedLoanId(data[0]._id);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load loans');
    }
  }

  async function fetchLoanDetails(loanId) {
    if (!loanId) return;
    try {
      const res = await fetch(`/api/loans/${loanId}`);
      const data = await res.json();
      if (data.loan) {
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load loan details');
    }
  }

  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data && data.user) {
          setCurrentUser(data.user);
          await fetchLoans();
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error(e);
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    }
    initAuth();
  }, []);

  useEffect(() => {
    if (selectedLoanId) {
      fetchLoanDetails(selectedLoanId);
      setScheduleData(null);
    }
  }, [selectedLoanId]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (loanMenuRef.current && !loanMenuRef.current.contains(e.target)) {
        setLoanMenuOpen(false);
      }
      if (eventTypeMenuRef.current && !eventTypeMenuRef.current.contains(e.target)) {
        setEventTypeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoanInputChange = (e) => {
    const { name, value } = e.target;
    setLoanForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body =
        authMode === 'register'
          ? { name: authForm.name, email: authForm.email, password: authForm.password }
          : { email: authForm.email, password: authForm.password };
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Authentication failed');
      }
      const data = await res.json();
      setCurrentUser(data);
      setAuthForm({ name: '', email: '', password: '' });
      await fetchLoans();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const goToLogin = () => {
    setError('');
    setAuthMode('login');
    setShellView('auth');
  };

  const goToSignup = () => {
    setError('');
    setAuthMode('register');
    setShellView('auth');
  };

  const goToHome = () => {
    setError('');
    setShellView('home');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setLoans([]);
    setSelectedLoanId('');
    setEvents([]);
    setScheduleData(null);
  };

  const submitLoan = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: loanForm.name,
        principal: Number(loanForm.principal),
        annualInterestRate: Number(loanForm.annualInterestRate),
        termMonths: Number(loanForm.termMonths),
        startDate: loanForm.startDate,
      };
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create loan');
      }
      const loan = await res.json();
      setLoanForm(EMPTY_LOAN_FORM);
      await fetchLoans();
      setSelectedLoanId(loan._id);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    if (!selectedLoanId) {
      setError('Select a loan first');
      return;
    }
    setError('');
    try {
      const payload = {
        type: eventForm.type,
        date: eventForm.date,
        amount: eventForm.amount ? Number(eventForm.amount) : undefined,
        newAnnualInterestRate: eventForm.newAnnualInterestRate
          ? Number(eventForm.newAnnualInterestRate)
          : undefined,
        note: eventForm.note || undefined,
      };
      const res = await fetch(`/api/loans/${selectedLoanId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add event');
      }
      setEventForm(EMPTY_EVENT_FORM);
      await fetchLoanDetails(selectedLoanId);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const loadSchedule = async () => {
    if (!selectedLoanId) {
      setError('Select a loan first');
      return;
    }
    setError('');
    setLoadingSchedule(true);
    try {
      const res = await fetch(`/api/loans/${selectedLoanId}/schedule`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to build schedule');
      }
      const data = await res.json();
      setScheduleData(data);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const exportScheduleAsPdf = async () => {
    if (!scheduleData || !scheduleRef.current) return;
    try {
      const element = scheduleRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        windowWidth: document.documentElement.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('loan-amortization.pdf');
    } catch (err) {
      console.error('Failed to export schedule', err);
      setError('Failed to export schedule as PDF');
    }
  };

  const currentLoan = loans.find((l) => l._id === selectedLoanId) || null;

  const buildPrincipalSeries = () => {
    if (!scheduleData) return { current: [], baseline: [] };
    const current = scheduleData.schedule.map((row) => ({
      x: row.period,
      y: row.closingBalance,
    }));
    const baseline = (scheduleData.baselineSchedule || []).map((row) => ({
      x: row.period,
      y: row.closingBalance,
    }));
    return { current, baseline };
  };

  const buildYearlyBreakdown = () => {
    if (!scheduleData) return [];
    const byYear = new Map();
    scheduleData.schedule.forEach((row) => {
      const d = new Date(row.toDate || row.fromDate);
      const year = d.getFullYear();
      const existing = byYear.get(year) || { year, interest: 0, principal: 0 };
      existing.interest += row.interest;
      existing.principal += row.principalComponent;
      byYear.set(year, existing);
    });
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  };

  const renderPrincipalChart = () => {
    const { current, baseline } = buildPrincipalSeries();
    if (!current.length && !baseline.length) return null;
    const allPoints = [...current, ...baseline];
    if (!allPoints.length) return null;
    const minX = 1;
    const maxX = Math.max(...allPoints.map((p) => p.x));
    const minY = 0;
    const maxY = Math.max(...allPoints.map((p) => p.y)) || 1;
    const width = 100;
    const height = 40;
    const scaleX = (x) => ((x - minX) / (maxX - minX || 1)) * width;
    const scaleY = (y) => height - (y - minY) / (maxY - minY || 1) * height;

    const toPath = (series) =>
      series
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(2)} ${scaleY(p.y).toFixed(2)}`)
        .join(' ');

    const handleMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const relX = Math.max(0, Math.min(1, px / (rect.width || 1)));
      const targetX = minX + relX * (maxX - minX || 1);
      const pickNearest = (series) =>
        series.reduce(
          (best, p) => {
            const dist = Math.abs(p.x - targetX);
            return dist < best.dist ? { dist, point: p } : best;
          },
          { dist: Infinity, point: null }
        ).point;
      const curPoint = pickNearest(current);
      const basePoint = pickNearest(baseline);
      if (!curPoint && !basePoint) {
        setPrincipalHover(null);
        return;
      }
      setPrincipalHover({
        xPct: relX * 100,
        period: curPoint?.x || basePoint?.x,
        currentBalance: curPoint ? curPoint.y : null,
        originalBalance: basePoint ? basePoint.y : null,
      });
    };

    const handleLeave = () => {
      setPrincipalHover(null);
    };

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="chart-svg"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {baseline.length > 0 && (
          <path d={toPath(baseline)} fill="none" stroke="rgba(255, 0, 0, 0.9)" strokeWidth="1.2" />
        )}
        {current.length > 0 && (
          <path d={toPath(current)} fill="none" stroke="#22c55e" strokeWidth="1.5" />
        )}
      </svg>
    );
  };

  const renderYearlyChart = () => {
    const data = buildYearlyBreakdown();
    if (!data.length) return null;
    const maxTotal = Math.max(...data.map((d) => d.interest + d.principal)) || 1;
    const barWidth = 100 / Math.max(data.length * 1.4, 1);

    return (
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="chart-svg">
        {data.map((d, index) => {
          const x = index * barWidth * 1.4 + barWidth * 0.2;
          const principalHeight = (d.principal / maxTotal) * 36;
          const interestHeight = (d.interest / maxTotal) * 36;
          const principalY = 38 - principalHeight;
          const interestY = principalY - interestHeight;
          const centerPct = ((x + barWidth / 2) / 100) * 100;
          return (
            <g
              key={d.year}
              onMouseEnter={() =>
                setYearlyHover({
                  xPct: centerPct,
                  year: d.year,
                  interest: d.interest,
                  principal: d.principal,
                })
              }
              onMouseLeave={() => setYearlyHover(null)}
            >
              <rect
                x={x}
                y={principalY}
                width={barWidth}
                height={principalHeight}
                rx="0.8"
                ry="0.8"
                fill="#22c55e"
              />
              <rect
                x={x}
                y={interestY}
                width={barWidth}
                height={interestHeight}
                rx="0.8"
                ry="0.8"
                fill="rgba(255, 0, 0, 0.9)"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const updateScenarioField = (id, field, value) => {
    setScenarios((prev) =>
      prev.map((sc) => (sc.id === id ? { ...sc, [field]: value } : sc))
    );
  };

  const runScenarios = async () => {
    if (!selectedLoanId) {
      setError('Select a loan first to run scenarios');
      return;
    }
    const payloadScenarios = scenarios
      .map((sc) => ({
        id: sc.id,
        name: sc.name || `Scenario ${sc.id}`,
        extraLumpSumAmount: sc.lumpSumAmount ? Number(sc.lumpSumAmount) : undefined,
        extraLumpSumDate: sc.lumpSumDate || undefined,
        newAnnualInterestRate: sc.newRatePct ? Number(sc.newRatePct) : undefined,
        newRateFromDate: sc.newRateDate || undefined,
      }))
      .filter(
        (s) =>
          (s.extraLumpSumAmount && s.extraLumpSumDate) ||
          (s.newAnnualInterestRate && s.newRateFromDate)
      );

    if (payloadScenarios.length === 0) {
      setError('Add at least one scenario with a lump sum or rate change.');
      return;
    }

    setError('');
    setRunningScenarios(true);
    try {
      const res = await fetch(`/api/loans/${selectedLoanId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios: payloadScenarios }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to run scenarios');
      }
      const data = await res.json();
      setScenarioResults(data.scenarios || []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setRunningScenarios(false);
    }
  };

  const runAdvisor = async () => {
    if (!selectedLoanId) {
      setError('Select a loan first to get advice');
      return;
    }

    const body = {};
    if (advisorMode === 'extra') {
      const val = Number(advisorExtra);
      if (!Number.isFinite(val) || val <= 0) {
        setError('Enter a positive monthly extra amount.');
        return;
      }
      body.extraPerMonth = val;
    } else {
      if (!advisorTargetDate) {
        setError('Pick a target payoff date.');
        return;
      }
      body.targetPayoffDate = advisorTargetDate;
    }

    setError('');
    setRunningAdvice(true);
    try {
      const res = await fetch(`/api/loans/${selectedLoanId}/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate advice');
      }
      const data = await res.json();
      setAdvisorResult(data);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setRunningAdvice(false);
    }
  };

  if (authChecking) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="muted">Checking session…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (shellView === 'home') {
      return <HomePage onLoginClick={goToLogin} onSignupClick={goToSignup} />;
    }
    return (
      <AuthLayout
        mode={authMode}
        onModeChange={setAuthMode}
        error={error}
        onBackHome={goToHome}
      >
        {authMode === 'login' ? (
          <LoginForm values={authForm} onChange={handleAuthInputChange} onSubmit={submitAuth} />
        ) : (
          <RegisterForm values={authForm} onChange={handleAuthInputChange} onSubmit={submitAuth} />
        )}
      </AuthLayout>
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand">
            <div className="site-logo-mark">LW</div>
            <div className="site-brand-text">
              <span className="site-brand-title">LOANWOLF</span>
              <span className="site-brand-sub">Loan payoff cockpit</span>
            </div>
          </div>
          <nav className="site-nav">
            <a href="#dashboard" className="site-nav-link">
              Dashboard
            </a>
            <a href="#schedule" className="site-nav-link">
              Schedule
            </a>
            <a href="#scenarios" className="site-nav-link">
              Scenarios
            </a>
            <a href="#advisor" className="site-nav-link">
              Advisor
            </a>
          </nav>
          <div className="site-header-user">
            <span className="site-header-user-name">{currentUser.name}</span>
            <button type="button" className="secondary-btn site-header-logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="layout" id="dashboard">
        <section className="panel">
          <h2>Create Loan</h2>
          <form className="form" onSubmit={submitLoan}>
            <div className="form-row">
              <label>Loan name</label>
              <input
                name="name"
                value={loanForm.name}
                onChange={handleLoanInputChange}
                placeholder="e.g. Home loan"
                required
              />
            </div>
            <div className="form-row">
              <label>Loan Amount</label>
              <input
                type="number"
                name="principal"
                value={loanForm.principal}
                onChange={handleLoanInputChange}
                min="0"
                step="0.01"
                placeholder='e.g. 5,00,000'
                required
              />
            </div>
            <div className="form-row">
              <label>Annual interest Rate(%)</label>
              <input
                type="number"
                name="annualInterestRate"
                value={loanForm.annualInterestRate}
                onChange={handleLoanInputChange}
                min="0"
                step="0.01"
                placeholder='e.g. 7.5'
                required
              />
            </div>
            <div className="form-row">
              <label>Loan Term (months)</label>
              <input
                type="number"
                name="termMonths"
                value={loanForm.termMonths}
                onChange={handleLoanInputChange}
                min="1"
                step="1"
                placeholder='e.g. 180'
                required
              />
            </div>
            <div className="form-row">
              <label>Start date</label>
              <input
                type="date"
                name="startDate"
                value={loanForm.startDate}
                onChange={handleLoanInputChange}
                required
              />
            </div>
            <button type="submit" className="primary-btn">
              Save loan
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Loans</h2>
          {loans.length === 0 ? (
            <p className="muted">No loans yet. Create one on the left.</p>
          ) : (
            <>
              <div className="dropdown" ref={loanMenuRef}>
                <button
                  type="button"
                  className="dropdown-trigger"
                  onClick={() => setLoanMenuOpen((open) => !open)}
                >
                  <span>
                    {currentLoan
                      ? `${currentLoan.name} — ₹${formatINR(
                        currentLoan.principal
                      )} @ ${currentLoan.annualInterestRate}% (${currentLoan.termMonths}m)`
                      : 'Select a loan'}
                  </span>
                  <span className="dropdown-icon" aria-hidden="true">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 -4 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <path d='m6 9 6 6 6-6' />
                      </svg>
                  </span>
                </button>
                {loanMenuOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-label">Loans</div>
                    {loans.map((loan) => (
                      <button
                        key={loan._id}
                        type="button"
                        className={`dropdown-item${loan._id === selectedLoanId ? ' dropdown-item-active' : ''
                          }`}
                        onClick={() => {
                          setSelectedLoanId(loan._id);
                          setLoanMenuOpen(false);
                        }}
                      >
                        <div className="dropdown-item-main">{loan.name}</div>
                        <div className="dropdown-item-sub">
                          ₹{formatINR(loan.principal)} · {loan.annualInterestRate}% ·{' '}
                          {loan.termMonths}m
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {currentLoan && (
                <div className="loan-summary">
                  <p>
                    <strong>Principal:</strong> ₹{formatINR(currentLoan.principal)}
                  </p>
                  <p>
                    <strong>Rate:</strong> {currentLoan.annualInterestRate}% p.a.
                  </p>
                  <p>
                    <strong>Term:</strong> {currentLoan.termMonths} months
                  </p>
                  <p>
                    <strong>Start:</strong>{' '}
                    {formatDate(currentLoan.startDate)}
                  </p>
                </div>
              )}

              <h3>Add event</h3>
              <form className="form" onSubmit={submitEvent}>
                <div className="form-row">
                  <label>Type</label>
                  <div className="dropdown" ref={eventTypeMenuRef}>
                    <button
                      type="button"
                      className="dropdown-trigger"
                      onClick={() => setEventTypeMenuOpen((open) => !open)}
                    >
                      <span>
                        {eventForm.type === 'EXTRA_PAYMENT'
                          ? 'Extra principal payment'
                          : 'Interest rate change'}
                      </span>
                      <span className="dropdown-icon" aria-hidden="true">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 -4 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                              <path d='m6 9 6 6 6-6' />
                            </svg>
                      </span>
                    </button>
                    {eventTypeMenuOpen && (
                      <div className="dropdown-menu">
                        <div className="dropdown-label">Event type</div>
                        <button
                          type="button"
                          className={`dropdown-item${eventForm.type === 'EXTRA_PAYMENT' ? ' dropdown-item-active' : ''
                            }`}
                          onClick={() => {
                            setEventForm((prev) => ({ ...prev, type: 'EXTRA_PAYMENT' }));
                            setEventTypeMenuOpen(false);
                          }}
                        >
                          Extra principal payment
                        </button>
                        <button
                          type="button"
                          className={`dropdown-item${eventForm.type === 'RATE_CHANGE' ? ' dropdown-item-active' : ''
                            }`}
                          onClick={() => {
                            setEventForm((prev) => ({ ...prev, type: 'RATE_CHANGE' }));
                            setEventTypeMenuOpen(false);
                          }}
                        >
                          Interest rate change
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={eventForm.date}
                    onChange={handleEventInputChange}
                    required
                  />
                </div>
                {eventForm.type === 'EXTRA_PAYMENT' && (
                  <div className="form-row">
                    <label>Extra payment (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      value={eventForm.amount}
                      onChange={handleEventInputChange}
                      min="0"
                      step="0.01"
                      placeholder='e.g. 2,00,000'
                      required
                    />
                  </div>
                )}
                {eventForm.type === 'RATE_CHANGE' && (
                  <div className="form-row">
                    <label>New annual rate (%)</label>
                    <input
                      type="number"
                      name="newAnnualInterestRate"
                      value={eventForm.newAnnualInterestRate}
                      onChange={handleEventInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                )}
                <div className="form-row">
                  <label>Note (optional)</label>
                  <input
                    name="note"
                    value={eventForm.note}
                    onChange={handleEventInputChange}
                    placeholder="e.g. RBI rate hike, bonus prepayment"
                  />
                </div>
                <button type="submit" className="secondary-btn" style={{height:'35px', background:'rgb(229, 229, 229)'}}>
                  Save event
                </button>
              </form>

              <h3>Events</h3>
              {events.length === 0 ? (
                <p className="muted">No events for this loan yet.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount / Rate</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev._id}>
                        <td>{formatDate(ev.date)}</td>
                        <td>{ev.type === 'EXTRA_PAYMENT' ? 'Extra payment' : 'Rate change'}</td>
                        <td>
                          {ev.type === 'EXTRA_PAYMENT' && ev.amount != null
                            ? `₹${formatINR(ev.amount)}`
                            : ev.newAnnualInterestRate != null
                              ? `${ev.newAnnualInterestRate}%`
                              : '-'}
                        </td>
                        <td>{ev.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </section>
      </main>

      <section className="panel panel-full" id="schedule" ref={scheduleRef}>
        <div className="panel-header">
          <h2>Amortization schedule</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={loadSchedule} className="primary-btn" disabled={loadingSchedule}>
              {loadingSchedule ? 'Calculating…' : 'Generate schedule'}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={exportScheduleAsPdf}
              disabled={!scheduleData}
            >
              Export as PDF
            </button>
          </div>
        </div>
        {!scheduleData ? (
          <p className="muted">
            Select a loan and click &quot;Generate schedule&quot; to see detailed cashflows.
          </p>
        ) : (
          <>
            <div className="summary-grid">
              <div>
                <h4>Total interest</h4>
                <p>₹{formatINR(scheduleData.summary.totalInterest)}</p>
              </div>
              <div>
                <h4>Total principal</h4>
                <p>₹{formatINR(scheduleData.summary.totalPrincipalPaid)}</p>
              </div>
              <div>
                <h4>Pre payments</h4>
                <p>₹{formatINR(scheduleData.summary.totalExtraPayments)}</p>
              </div>
              <div>
                <h4>Total paid</h4>
                <p>₹{formatINR(scheduleData.summary.totalPaid)}</p>
              </div>
              <div>
                <h4>Remaining balance</h4>
                <p>₹{formatINR(scheduleData.summary.remainingBalance)}</p>
              </div>
              <div>
                <h4>Payoff date</h4>
                <p>
                  {scheduleData.summary.payoffDate
                    ? formatDate(scheduleData.summary.payoffDate)
                    : 'Not fully repaid in term'}
                </p>
              </div>
            </div>

            {scheduleData.baselineSummary && scheduleData.comparison && (
              <div className="summary-grid">
                <div>
                  <h4>Orig. total interest</h4>
                  <p>₹{formatINR(scheduleData.baselineSummary.totalInterest)}</p>
                </div>
                <div>
                  <h4>New total interest</h4>
                  <p>₹{formatINR(scheduleData.summary.totalInterest)}</p>
                </div>
                <div>
                  <h4>Interest saved</h4>
                  <p>
                    ₹{formatINR(Math.max(0, scheduleData.comparison.interestSaved))}
                  </p>
                </div>
                <div>
                  <h4>Orig. total paid</h4>
                  <p>₹{formatINR(scheduleData.baselineSummary.totalPaid)}</p>
                </div>
                <div>
                  <h4>New total paid</h4>
                  <p>₹{formatINR(scheduleData.summary.totalPaid)}</p>
                </div>
                <div>
                  <h4>EMIs saved</h4>
                  <p>
                    {Math.max(0, scheduleData.comparison.monthsSaved).toLocaleString()} months
                  </p>
                </div>
              </div>
            )}

            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Remaining principal over time</div>
                    <div className="chart-card-subtitle">
                      Original plan vs with your prepayments
                    </div>
                  </div>
                  <div className="chart-legend">
                    <span className="chart-legend-item">
                      <span
                        className="chart-legend-swatch"
                        style={{ backgroundColor: '#22c55e' }}
                      />
                      <span>With prepayments</span>
                    </span>
                    <span className="chart-legend-item">
                      <span
                        className="chart-legend-swatch"
                        style={{ backgroundColor: 'rgba(255, 0, 0, 0.9)' }}
                      />
                      <span>Original</span>
                    </span>
                  </div>
                </div>
                <div className="chart-card-body">
                  {renderPrincipalChart()}
                  {principalHover && (
                    <div
                      className="chart-tooltip"
                      style={{ left: `${principalHover.xPct}%` }}
                    >
                      <div className="chart-tooltip-title">
                        Month {principalHover.period}
                      </div>
                      {principalHover.currentBalance != null && (
                        <div className="chart-tooltip-row">
                          <span
                            className="chart-tooltip-dot"
                            style={{ backgroundColor: '#22c55e' }}
                          />
                          <span>With prepay: ₹{formatINR(principalHover.currentBalance)}</span>
                        </div>
                      )}
                      {principalHover.originalBalance != null && (
                        <div className="chart-tooltip-row">
                          <span
                            className="chart-tooltip-dot"
                            style={{ backgroundColor: 'rgba(255, 0, 0, 0.9)' }}
                          />
                          <span>Original: ₹{formatINR(principalHover.originalBalance)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Interest vs principal per year</div>
                    <div className="chart-card-subtitle">
                      See where interest dominates and where principal catches up
                    </div>
                  </div>
                  <div className="chart-legend">
                    <span className="chart-legend-item">
                      <span
                        className="chart-legend-swatch"
                        style={{ backgroundColor: 'rgba(255, 0, 0, 0.9)' }}
                      />
                      <span>Interest</span>
                    </span>
                    <span className="chart-legend-item">
                      <span
                        className="chart-legend-swatch"
                        style={{ backgroundColor: '#22c55e' }}
                      />
                      <span>Principal</span>
                    </span>
                  </div>
                </div>
                <div className="chart-card-body">
                  {renderYearlyChart()}
                  {yearlyHover && (
                    <div
                      className="chart-tooltip"
                      style={{ left: `${yearlyHover.xPct}%` }}
                    >
                      <div className="chart-tooltip-title">{yearlyHover.year}</div>
                      <div className="chart-tooltip-row">
                        <span
                          className="chart-tooltip-dot"
                          style={{ backgroundColor: 'rgba(255, 0, 0, 0.9)' }}
                        />
                        <span>Interest: ₹{formatINR(yearlyHover.interest)}</span>
                      </div>
                      <div className="chart-tooltip-row">
                        <span
                          className="chart-tooltip-dot"
                          style={{ backgroundColor: '#22c55e' }}
                        />
                        <span>Principal: ₹{formatINR(yearlyHover.principal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tran Type</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Opening Prin. Bal.</th>
                    <th>Prep/Adj/Disb</th>
                    <th>ROI (%)</th>
                    <th>EMI Recble</th>
                    <th>Int. Comp.</th>
                    <th>Prin. Comp.</th>
                    <th>Closing Prin.</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.schedule.map((row) => (
                    <tr key={row.period}>
                      <td>{row.period}</td>
                      <td>{row.tranType}</td>
                      <td>{formatDate(row.fromDate)}</td>
                      <td>{formatDate(row.toDate)}</td>
                      <td>₹{formatINR(row.openingBalance)}</td>
                      <td>₹{formatINR(row.extraPayment)}</td>
                      <td>{row.rateAnnualPct.toFixed(2)}%</td>
                      <td>₹{formatINR(row.emiFixed)}</td>
                      <td>₹{formatINR(row.interest)}</td>
                      <td>₹{formatINR(row.principalComponent)}</td>
                      <td>₹{formatINR(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="panel panel-full scenarios-panel" id="scenarios">
        <div className="scenarios-header">
          <div>
            <div className="scenarios-title">What-if scenarios</div>
            <div className="scenarios-subtitle">
              Simulate hypothetical lump sums and future rate changes without touching your real loan.
            </div>
          </div>
          <div className="scenario-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={runScenarios}
              disabled={!selectedLoanId || runningScenarios}
            >
              {runningScenarios ? 'Simulating…' : 'Run scenarios'}
            </button>
          </div>
        </div>

        {!selectedLoanId ? (
          <p className="muted">Select a loan above to configure scenarios.</p>
        ) : (
          <>
            <div className="scenarios-grid">
              {scenarios.map((sc) => (
                <div key={sc.id} className="scenario-card">
                  <h4>{sc.name}</h4>
                  <div className="form-row" style={{marginBottom: '0.9rem'}}>
                    <label>Scenario name</label>
                    <input
                      value={sc.name}
                      onChange={(e) => updateScenarioField(sc.id, 'name', e.target.value)}
                      placeholder={`Scenario ${sc.id}`}
                    />
                  </div>
                  <div className="form-row" style={{ marginBottom: '0.9rem' }}>
                    <label>Hypothetical lump sum (₹)</label>
                    <input
                      type="number"
                      value={sc.lumpSumAmount}
                      onChange={(e) => updateScenarioField(sc.id, 'lumpSumAmount', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="e.g. 2,00,000"
                    />
                  </div>
                  <div className="form-row" style={{ marginBottom: '0.9rem' }}>
                    <label>Lump sum date</label>
                    <input
                      type="date"
                      value={sc.lumpSumDate}
                      onChange={(e) => updateScenarioField(sc.id, 'lumpSumDate', e.target.value)}
                    />
                  </div>
                  <div className="form-row" style={{ marginBottom: '0.9rem' }}>
                    <label>Future rate (%)</label>
                    <input
                      type="number"
                      value={sc.newRatePct}
                      onChange={(e) => updateScenarioField(sc.id, 'newRatePct', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="e.g. 7.10"
                    />
                  </div>
                  <div className="form-row">
                    <label>Rate from date</label>
                    <input
                      type="date"
                      value={sc.newRateDate}
                      onChange={(e) => updateScenarioField(sc.id, 'newRateDate', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {scenarioResults && scenarioResults.length > 0 && (
              <div className="table-wrapper">
                <table className="scenarios-table">
                  <thead>
                    <tr>
                      <th>Scenario</th>
                      <th>Lump sum</th>
                      <th>Future rate</th>
                      <th>Total interest</th>
                      <th>Interest saved</th>
                      <th>Payoff date</th>
                      <th>EMIs saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioResults.map((sc) => (
                      <tr key={sc.id}>
                        <td>{sc.name}</td>
                        <td>
                          {(() => {
                            const base = scenarios.find((s) => s.id === sc.id);
                            if (!base || !base.lumpSumAmount || !base.lumpSumDate) return '-';
                            return `₹${formatINR(base.lumpSumAmount)} on ${formatDate(
                              base.lumpSumDate
                            )}`;
                          })()}
                        </td>
                        <td>
                          {(() => {
                            const base = scenarios.find((s) => s.id === sc.id);
                            if (!base || !base.newRatePct || !base.newRateDate) return '-';
                            return `${base.newRatePct}% from ${formatDate(base.newRateDate)}`;
                          })()}
                        </td>
                        <td>₹{formatINR(sc.summary.totalInterest)}</td>
                        <td>₹{formatINR(Math.max(0, sc.comparison.interestSaved))}</td>
                        <td>
                          {sc.summary.payoffDate
                            ? formatDate(sc.summary.payoffDate)
                            : 'Not fully repaid'}
                        </td>
                        <td>{Math.max(0, sc.comparison.monthsSaved).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <section className="panel panel-full advisor-panel" id="advisor">
        <div className="scenarios-header">
          <div>
            <div className="scenarios-title">Advisor</div>
            <div className="scenarios-subtitle">
              Get a recommended extra EMI plan to either use a fixed surplus or hit a target payoff date.
            </div>
          </div>
          <div className="advisor-mode-toggle">
            <button
              type="button"
              className={
                'advisor-mode-button' + (advisorMode === 'extra' ? ' advisor-mode-button-active' : '')
              }
              onClick={() => setAdvisorMode('extra')}
            >
              Monthly surplus
            </button>
            <button
              type="button"
              className={
                'advisor-mode-button' + (advisorMode === 'target' ? ' advisor-mode-button-active' : '')
              }
              onClick={() => setAdvisorMode('target')}
            >
              Target payoff date
            </button>
          </div>
        </div>

        {!selectedLoanId ? (
          <p className="muted">Select a loan above to get personalized advice.</p>
        ) : (
          <div className="advisor-grid">
            <div>
              {advisorMode === 'extra' ? (
                <div className="form">
                  <div className="form-row">
                    <label>I can spare (₹ per month)</label>
                    <input
                      type="number"
                      value={advisorExtra}
                      onChange={(e) => setAdvisorExtra(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="e.g. 5,000"
                    />
                  </div>
                </div>
              ) : (
                <div className="form">
                  <div className="form-row">
                    <label>Target payoff date</label>
                    <input
                      type="date"
                      value={advisorTargetDate}
                      onChange={(e) => setAdvisorTargetDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginTop: '0.6rem' }}>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={runAdvisor}
                  disabled={runningAdvice}
                >
                  {runningAdvice ? 'Calculating…' : 'Get advice'}
                </button>
              </div>
            </div>

            <div>
              {advisorResult ? (
                <div className="advisor-summary">
                  <h4>Suggested plan</h4>
                  {advisorResult.mode === 'extraPerMonth' && (
                    <p style={{ margin: 0, marginBottom: '0.4rem' }}>
                      Add roughly{' '}
                      <strong>
                        ₹{formatINR(advisorResult.input.extraPerMonth || 0)} per month
                      </strong>{' '}
                      as extra principal.
                    </p>
                  )}
                  {advisorResult.mode === 'targetPayoffDate' &&
                    advisorResult.recommendedExtraPerMonth != null && (
                      <p style={{ margin: 0, marginBottom: '0.4rem' }}>
                        To approach your target date, add about{' '}
                        <strong>
                          ₹{formatINR(advisorResult.recommendedExtraPerMonth || 0)} per month
                        </strong>{' '}
                        as extra principal.
                      </p>
                    )}

                  {advisorResult.summaryWithExtra && advisorResult.comparisonWithExtra && (
                    <div className="advisor-summary-grid">
                      <div>
                        <div className="chart-card-subtitle">Interest saved</div>
                        <div>
                          ₹
                          {formatINR(
                            Math.max(0, advisorResult.comparisonWithExtra.interestSaved || 0)
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="chart-card-subtitle">EMIs saved</div>
                        <div>
                          {Math.max(
                            0,
                            advisorResult.comparisonWithExtra.monthsSaved || 0
                          ).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="chart-card-subtitle">New payoff date</div>
                        <div>
                          {advisorResult.summaryWithExtra.payoffDate
                            ? formatDate(advisorResult.summaryWithExtra.payoffDate)
                            : 'Not fully repaid'}
                        </div>
                      </div>
                    </div>
                  )}

                  {Array.isArray(advisorResult.tips) && advisorResult.tips.length > 0 && (
                    <ul className="advisor-tip-list">
                      {advisorResult.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="muted">
                  Run the advisor to see recommended extra EMI and how much faster you can close this loan.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <footer className="footer">
        <span className="footer-text">Made with ❤️ by Uday Savaliya</span>
      </footer>

      {showScrollTop && (
        <button
          type="button"
          className="scroll-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default App;
