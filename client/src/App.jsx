import { useEffect, useState, useRef } from 'react';
import './App.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomePage from './components/HomePage';
import ProfileSettings from './components/ProfileSettings';


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

const formatCurrency = (value, currency = 'INR') => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
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


// --- Luxury Modern Spinner ---
const LoadingSpinner = () => (
  <div className="spinner-wrapper">
    <div className="luxury-spinner">
      <svg className="spinner-svg" viewBox="25 25 50 50">
        <circle className="spinner-track" cx="50" cy="50" r="20" fill="none" />
        <circle className="spinner-head" cx="50" cy="50" r="20" fill="none" />
      </svg>
    </div>
    <div className="spinner-text">
       <img src="/logo main.png" alt="LOANWOLF" style={{ height: '40px' }} />
    </div>
  </div>
);

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

  // Edit States
  const [editingLoanId, setEditingLoanId] = useState(null); // ID of loan being edited (null = create mode)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const withBase = (path) => `${API_BASE}${path}`;

  // Helper for dynamic currency
  const formatMoney = (val) => formatCurrency(val, currentUser?.currency);

async function fetchLoans() {
    try {
      const res = await fetch(withBase('/api/loans'), { credentials: 'include' });
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
      const res = await fetch(withBase(`/api/loans/${loanId}`), { credentials: 'include' });
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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch(withBase('/api/auth/me'), { credentials: 'include' });
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
  }, [shellView, currentUser]); // Re-run when view or user changes (mounting dashboard)

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
      const res = await fetch(withBase(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Authentication failed');
      }
      const data = await res.json();
      setCurrentUser(data);
      setAuthForm({ name: '', email: '', password: '' });
      await fetchLoans();
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const goToLogin = () => {
    setError('');
    setAuthMode('login');
    setShellView('auth');
    window.scrollTo(0, 0);
  };

  const goToSignup = () => {
    setError('');
    setAuthMode('register');
    setShellView('auth');
    window.scrollTo(0, 0);
  };

  const goToHome = () => {
    setError('');
    setShellView('home');
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    try {
      await fetch(withBase('/api/auth/logout'), { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setLoans([]);
    setSelectedLoanId('');
    setEvents([]);
    setScheduleData(null);
    setEditingLoanId(null);
    setLoanForm(EMPTY_LOAN_FORM);
    window.scrollTo(0, 0);
  };

  const startEditLoan = (loan) => {
    setEditingLoanId(loan._id);
    setLoanForm({
      name: loan.name,
      principal: loan.principal,
      annualInterestRate: loan.annualInterestRate,
      termMonths: loan.termMonths,
      startDate: loan.startDate ? loan.startDate.split('T')[0] : '',
    });
    // Scroll to form (top/left)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditLoan = () => {
    setEditingLoanId(null);
    setLoanForm(EMPTY_LOAN_FORM);
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
      const res = await fetch(withBase('/api/loans'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create loan');
      }
      const loan = await res.json();
      setLoanForm(EMPTY_LOAN_FORM);
      await fetchLoans();
      setLoanForm(EMPTY_LOAN_FORM);
      await fetchLoans();
      setSelectedLoanId(loan._id);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const submitUpdateLoan = async (e) => {
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
      
      const res = await fetch(withBase(`/api/loans/${editingLoanId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update loan');
      
      const data = await res.json();
      setLoans((prev) => prev.map((l) => (l._id === data._id ? data : l)));
      if (selectedLoanId === data._id) {
        fetchLoanDetails(data._id);
      }
      // Reset to create mode
      setEditingLoanId(null);
      setLoanForm(EMPTY_LOAN_FORM);
    } catch (err) {
      console.error(err);
      setError(err.message);
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
      const res = await fetch(withBase(`/api/loans/${selectedLoanId}/events`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
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
      const res = await fetch(withBase(`/api/loans/${selectedLoanId}/schedule`), {
        credentials: 'include',
      });
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

  const handleUpdateProfile = async (data) => {
    try {
      const res = await fetch(withBase('/api/auth/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
      const updatedUser = await res.json();
      setCurrentUser(updatedUser);
      // Wait a moment then go back
      setTimeout(() => setShellView('home'), 1000);
    } catch (e) {
      throw e;
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
      const res = await fetch(withBase(`/api/loans/${selectedLoanId}/simulate`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios: payloadScenarios }),
        credentials: 'include',
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

  const handleDeleteLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to delete this loan? This action cannot be undone.')) return;
    try {
      const res = await fetch(withBase(`/api/loans/${loanId}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete loan');

      setLoans((prev) => prev.filter((l) => l._id !== loanId));
      if (selectedLoanId === loanId) {
        setSelectedLoanId(null);
        setCurrentLoan(null);
        setEvents([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };



  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(withBase(`/api/loans/${selectedLoanId}/events/${eventId}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete event');
      
      fetchLoanDetails(selectedLoanId); // Refresh data
    } catch (err) {
      console.error(err);
      setError(err.message);
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
      const res = await fetch(withBase(`/api/loans/${selectedLoanId}/advice`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
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
    return <LoadingSpinner />;
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

  if (shellView === 'profile') {
    return (
      <ProfileSettings
        user={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onBack={() => setShellView('home')}
      />
    );
  }

  return (
    <div className="app">
      <header className="site-header animate-blur-in">
        <div className="site-header-inner">
          <div className="site-brand">
            <img src="/logo main.png" alt="LOANWOLF" className="site-brand-logo" />
          </div>
          <div className="desktop-nav">
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
              <span className="site-header-user-name" onClick={() => setShellView('profile')} style={{ cursor: 'pointer' }}>
                {currentUser.name}
              </span>
              <button
                type="button"
                className="secondary-btn site-header-settings"
                onClick={() => setShellView('profile')}
                title="Settings"
                style={{ marginRight: '0.5rem', padding: '0.4rem' }}
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" id="setting">
              <g fill="none" fillRule="evenodd" stroke="#200E32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="translate(2.5 1.5)">
              <path d="M18.3066362,6.12356982 L17.6842106,5.04347829 C17.1576365,4.12955711 15.9906873,3.8142761 15.0755149,4.33867279 L15.0755149,4.33867279 C14.6398815,4.59529992 14.1200613,4.66810845 13.6306859,4.54104256 C13.1413105,4.41397667 12.7225749,4.09747295 12.4668193,3.66132725 C12.3022855,3.38410472 12.2138742,3.06835005 12.2105264,2.74599544 L12.2105264,2.74599544 C12.2253694,2.22917739 12.030389,1.72835784 11.6700024,1.3576252 C11.3096158,0.986892553 10.814514,0.777818938 10.2974829,0.778031878 L9.04347831,0.778031878 C8.53694532,0.778031878 8.05129106,0.97987004 7.69397811,1.33890085 C7.33666515,1.69793166 7.13715288,2.18454839 7.13958814,2.69107553 L7.13958814,2.69107553 C7.12457503,3.73688099 6.27245786,4.57676682 5.22654465,4.57665906 C4.90419003,4.57331126 4.58843537,4.48489995 4.31121284,4.32036615 L4.31121284,4.32036615 C3.39604054,3.79596946 2.22909131,4.11125048 1.70251717,5.02517165 L1.03432495,6.12356982 C0.508388616,7.03634945 0.819378585,8.20256183 1.72997713,8.73226549 L1.72997713,8.73226549 C2.32188101,9.07399614 2.68650982,9.70554694 2.68650982,10.3890161 C2.68650982,11.0724852 2.32188101,11.704036 1.72997713,12.0457667 L1.72997713,12.0457667 C0.820534984,12.5718952 0.509205679,13.7352837 1.03432495,14.645309 L1.03432495,14.645309 L1.6659039,15.7345539 C1.9126252,16.1797378 2.3265816,16.5082503 2.81617164,16.6473969 C3.30576167,16.7865435 3.83061824,16.7248517 4.27459956,16.4759726 L4.27459956,16.4759726 C4.71105863,16.2212969 5.23116727,16.1515203 5.71931837,16.2821523 C6.20746948,16.4127843 6.62321383,16.7330005 6.87414191,17.1716248 C7.03867571,17.4488473 7.12708702,17.764602 7.13043482,18.0869566 L7.13043482,18.0869566 C7.13043482,19.1435014 7.98693356,20.0000001 9.04347831,20.0000001 L10.2974829,20.0000001 C11.3504633,20.0000001 12.2054882,19.1490783 12.2105264,18.0961099 L12.2105264,18.0961099 C12.2080776,17.5879925 12.4088433,17.0999783 12.7681408,16.7406809 C13.1274382,16.3813834 13.6154524,16.1806176 14.1235699,16.1830664 C14.4451523,16.1916732 14.7596081,16.2797208 15.0389017,16.4393593 L15.0389017,16.4393593 C15.9516813,16.9652957 17.1178937,16.6543057 17.6475973,15.7437072 L17.6475973,15.7437072 L18.3066362,14.645309 C18.5617324,14.2074528 18.6317479,13.6859659 18.5011783,13.1963297 C18.3706086,12.7066935 18.0502282,12.2893121 17.6109841,12.0366133 L17.6109841,12.0366133 C17.17174,11.7839145 16.8513595,11.3665332 16.7207899,10.876897 C16.5902202,10.3872608 16.6602358,9.86577384 16.9153319,9.42791767 C17.0812195,9.13829096 17.3213574,8.89815312 17.6109841,8.73226549 L17.6109841,8.73226549 C18.5161253,8.20284891 18.8263873,7.04344892 18.3066362,6.13272314 L18.3066362,6.13272314 L18.3066362,6.12356982 Z"></path>
              <circle cx="9.675" cy="10.389" r="2.636"></circle></g></svg>              </button>
              <button type="button" className="secondary-btn site-header-logout" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>

          <div className="mobile-actions" style={{ gap: '0.2rem', alignItems: 'center' }}>
            <button
                type="button"
                className="secondary-btn site-header-settings mobile-settings-btn"
                onClick={() => {
                  setShellView('profile');
                  setMobileMenuOpen(false);
                }}
                title="Settings"
                style={{ padding: '0.4rem', background: 'transparent', border: 'none' }}
              >
             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" id="setting">
             <g fill="none" fillRule="evenodd" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="translate(2.5 1.5)" className="colorStroke200e32 svgStroke">
             <path d="M18.3066362,6.12356982 L17.6842106,5.04347829 C17.1576365,4.12955711 15.9906873,3.8142761 15.0755149,4.33867279 L15.0755149,4.33867279 C14.6398815,4.59529992 14.1200613,4.66810845 13.6306859,4.54104256 C13.1413105,4.41397667 12.7225749,4.09747295 12.4668193,3.66132725 C12.3022855,3.38410472 12.2138742,3.06835005 12.2105264,2.74599544 L12.2105264,2.74599544 C12.2253694,2.22917739 12.030389,1.72835784 11.6700024,1.3576252 C11.3096158,0.986892553 10.814514,0.777818938 10.2974829,0.778031878 L9.04347831,0.778031878 C8.53694532,0.778031878 8.05129106,0.97987004 7.69397811,1.33890085 C7.33666515,1.69793166 7.13715288,2.18454839 7.13958814,2.69107553 L7.13958814,2.69107553 C7.12457503,3.73688099 6.27245786,4.57676682 5.22654465,4.57665906 C4.90419003,4.57331126 4.58843537,4.48489995 4.31121284,4.32036615 L4.31121284,4.32036615 C3.39604054,3.79596946 2.22909131,4.11125048 1.70251717,5.02517165 L1.03432495,6.12356982 C0.508388616,7.03634945 0.819378585,8.20256183 1.72997713,8.73226549 L1.72997713,8.73226549 C2.32188101,9.07399614 2.68650982,9.70554694 2.68650982,10.3890161 C2.68650982,11.0724852 2.32188101,11.704036 1.72997713,12.0457667 L1.72997713,12.0457667 C0.820534984,12.5718952 0.509205679,13.7352837 1.03432495,14.645309 L1.03432495,14.645309 L1.6659039,15.7345539 C1.9126252,16.1797378 2.3265816,16.5082503 2.81617164,16.6473969 C3.30576167,16.7865435 3.83061824,16.7248517 4.27459956,16.4759726 L4.27459956,16.4759726 C4.71105863,16.2212969 5.23116727,16.1515203 5.71931837,16.2821523 C6.20746948,16.4127843 6.62321383,16.7330005 6.87414191,17.1716248 C7.03867571,17.4488473 7.12708702,17.764602 7.13043482,18.0869566 L7.13043482,18.0869566 C7.13043482,19.1435014 7.98693356,20.0000001 9.04347831,20.0000001 L10.2974829,20.0000001 C11.3504633,20.0000001 12.2054882,19.1490783 12.2105264,18.0961099 L12.2105264,18.0961099 C12.2080776,17.5879925 12.4088433,17.0999783 12.7681408,16.7406809 C13.1274382,16.3813834 13.6154524,16.1806176 14.1235699,16.1830664 C14.4451523,16.1916732 14.7596081,16.2797208 15.0389017,16.4393593 L15.0389017,16.4393593 C15.9516813,16.9652957 17.1178937,16.6543057 17.6475973,15.7437072 L17.6475973,15.7437072 L18.3066362,14.645309 C18.5617324,14.2074528 18.6317479,13.6859659 18.5011783,13.1963297 C18.3706086,12.7066935 18.0502282,12.2893121 17.6109841,12.0366133 L17.6109841,12.0366133 C17.17174,11.7839145 16.8513595,11.3665332 16.7207899,10.876897 C16.5902202,10.3872608 16.6602358,9.86577384 16.9153319,9.42791767 C17.0812195,9.13829096 17.3213574,8.89815312 17.6109841,8.73226549 L17.6109841,8.73226549 C18.5161253,8.20284891 18.8263873,7.04344892 18.3066362,6.13272314 L18.3066362,6.13272314 L18.3066362,6.12356982 Z" fill="#000000" className="color000000 svgShape"></path>
             <circle cx="9.675" cy="10.389" r="2.636" fill="#000000" className="color000000 svgShape"></circle></g></svg>
            </button>
            <div
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </div>
          </div>
        </div>

        <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="site-nav">
            <a href="#dashboard" className="site-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </a>
            <a href="#schedule" className="site-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Schedule
            </a>
            <a href="#scenarios" className="site-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Scenarios
            </a>
            <a href="#advisor" className="site-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Advisor
            </a>
          </nav>
          <div className="site-header-user">
            <span className="site-header-user-name">{currentUser.name}</span>
            <button
              type="button"
              className="secondary-btn site-header-logout"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="layout animate-blur-in delay-100" id="dashboard">
        <section className="panel">
          <h2>{editingLoanId ? 'Edit Loan' : 'Create Loan'}</h2>
          <form className="form" onSubmit={editingLoanId ? submitUpdateLoan : submitLoan}>
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
              <input 
                type="range" 
                name="termMonths"
                min="0" 
                max="360" 
                value={loanForm.termMonths || 0} 
                onChange={handleLoanInputChange}
                className="slider-range"
                style={{ '--range-progress': `${((loanForm.termMonths || 0) / 360) * 100}%` }}
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="primary-btn">
                {editingLoanId ? 'Update loan' : 'Save loan'}
              </button>
              {editingLoanId && (
                <button type="button" className="secondary-btn" onClick={cancelEditLoan}>
                  Cancel
                </button>
              )}
            </div>
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
                      ? `${currentLoan.name} — ${formatMoney(
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
                          {formatMoney(loan.principal)} · {loan.annualInterestRate}% ·{' '}
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
                    <strong>Principal:</strong> {formatMoney(currentLoan.principal)}
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
                  <div className="loan-actions" style={{ gridColumn: 'span 2', justifyContent: 'flex-start' }}>
                     <button className="action-btn" onClick={() => startEditLoan(currentLoan)} title="Edit Loan">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                       Edit Loan
                     </button>
                     <button className="action-btn delete" onClick={() => handleDeleteLoan(currentLoan._id)} title="Delete Loan">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                       Delete Loan
                     </button>
                  </div>
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
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount / Rate</th>
                        <th>Note</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => (
                        <tr key={ev._id}>
                          <td>{formatDate(ev.date)}</td>
                          <td>{ev.type === 'EXTRA_PAYMENT' ? 'Extra payment' : 'Rate change'}</td>
                          <td>
                            {ev.type === 'EXTRA_PAYMENT' && ev.amount != null
                              ? `${formatMoney(ev.amount)}`
                              : ev.newAnnualInterestRate != null
                                ? `${ev.newAnnualInterestRate}%`
                                : '-'}
                          </td>
                          <td>{ev.note || '-'}</td>
                          <td>
                            <div className="action-btn-group">
                              <button className="action-btn delete" onClick={() => handleDeleteEvent(ev._id)} title="Delete Event">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <section className="panel panel-full scroll-reveal" id="schedule" ref={scheduleRef}>
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
                <p>{formatMoney(scheduleData.summary.totalInterest)}</p>
              </div>
              <div>
                <h4>Total principal</h4>
                <p>{formatMoney(scheduleData.summary.totalPrincipalPaid)}</p>
              </div>
              <div>
                <h4>Pre payments</h4>
                <p>{formatMoney(scheduleData.summary.totalExtraPayments)}</p>
              </div>
              <div>
                <h4>Total paid</h4>
                <p>{formatMoney(scheduleData.summary.totalPaid)}</p>
              </div>
              <div>
                <h4>Remaining balance</h4>
                <p>{formatMoney(scheduleData.summary.remainingBalance)}</p>
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
                  <p>{formatMoney(scheduleData.baselineSummary.totalInterest)}</p>
                </div>
                <div>
                  <h4>New total interest</h4>
                  <p>{formatMoney(scheduleData.summary.totalInterest)}</p>
                </div>
                <div>
                  <h4>Interest saved</h4>
                  <p>
                    {formatMoney(Math.max(0, scheduleData.comparison.interestSaved))}
                  </p>
                </div>
                <div>
                  <h4>Orig. total paid</h4>
                  <p>{formatMoney(scheduleData.baselineSummary.totalPaid)}</p>
                </div>
                <div>
                  <h4>New total paid</h4>
                  <p>{formatMoney(scheduleData.summary.totalPaid)}</p>
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
                          <span>With prepay: {formatMoney(principalHover.currentBalance)}</span>
                        </div>
                      )}
                      {principalHover.originalBalance != null && (
                        <div className="chart-tooltip-row">
                          <span
                            className="chart-tooltip-dot"
                            style={{ backgroundColor: 'rgba(255, 0, 0, 0.9)' }}
                          />
                          <span>Original: {formatMoney(principalHover.originalBalance)}</span>
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
                        <span>Interest: {formatMoney(yearlyHover.interest)}</span>
                      </div>
                      <div className="chart-tooltip-row">
                        <span
                          className="chart-tooltip-dot"
                          style={{ backgroundColor: '#22c55e' }}
                        />
                        <span>Principal: {formatMoney(yearlyHover.principal)}</span>
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
                      <td>{formatMoney(row.openingBalance)}</td>
                      <td>{formatMoney(row.extraPayment)}</td>
                      <td>{row.rateAnnualPct.toFixed(2)}%</td>
                      <td>{formatMoney(row.emiFixed)}</td>
                      <td>{formatMoney(row.interest)}</td>
                      <td>{formatMoney(row.principalComponent)}</td>
                      <td>{formatMoney(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="panel panel-full scenarios-panel scroll-reveal" id="scenarios">
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
                            return `${formatMoney(base.lumpSumAmount)} on ${formatDate(
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
                        <td>{formatMoney(sc.summary.totalInterest)}</td>
                        <td>{formatMoney(Math.max(0, sc.comparison.interestSaved))}</td>
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

      <section className="panel panel-full advisor-panel scroll-reveal" id="advisor">
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
                        {formatMoney(advisorResult.input.extraPerMonth || 0)} per month
                      </strong>{' '}
                      as extra principal.
                    </p>
                  )}
                  {advisorResult.mode === 'targetPayoffDate' &&
                    advisorResult.recommendedExtraPerMonth != null && (
                      <p style={{ margin: 0, marginBottom: '0.4rem' }}>
                        To approach your target date, add about{' '}
                        <strong>
                          {formatMoney(advisorResult.recommendedExtraPerMonth || 0)} per month
                        </strong>{' '}
                        as extra principal.
                      </p>
                    )}

                  {advisorResult.summaryWithExtra && advisorResult.comparisonWithExtra && (
                    <div className="advisor-summary-grid">
                      <div>
                        <div className="chart-card-subtitle">Interest saved</div>
                        <div>
                          {formatMoney(
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
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <footer className="footer scroll-reveal">
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
