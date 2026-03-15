import { useState, useRef, useEffect } from 'react';

const ProfileSettings = ({ user, onUpdateProfile, onBack, dashboardData }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    currency: user.currency || 'INR',
    password: '',
  });
  const [status, setStatus] = useState(''); 
  const [errorMsg, setErrorMsg] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [milestonesData, setMilestonesData] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const [liveOverview, setLiveOverview] = useState(null);
  const currencyRef = useRef(null);
  
  // Fetch schedules for milestones + live profile overview derived from schedule rows.
  useEffect(() => {
    let isMounted = true;
    const fetchMilestones = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${API_BASE}/api/loans`, { credentials: 'include' });
        const loans = await res.json();
        
        const allMilestones = [];
        let totalDebt = 0;
        let weightedRateSum = 0;
        let maxPayoffDate = null;
        const now = new Date();

        for (const loan of loans) {
          try {
            const scheduleRes = await fetch(`${API_BASE}/api/loans/${loan._id}/schedule`, { credentials: 'include' });
            if (!scheduleRes.ok) continue;

            const scheduleData = await scheduleRes.json();
            if (scheduleData.milestones && scheduleData.milestones.length > 0) {
              allMilestones.push({ loanName: loan.name, milestones: scheduleData.milestones });
            }

            const rows = scheduleData.schedule || [];
            let currentBalance = 0;
            let currentRate = Number(loan.annualInterestRate || 0);

            if (rows.length > 0) {
              const activeRow = rows.find((row) => {
                const from = new Date(row.fromDate);
                const to = new Date(row.toDate);
                return from <= now && to > now;
              });

              if (activeRow) {
                currentBalance = Number(activeRow.openingBalance || 0);
                currentRate = Number(activeRow.rateAnnualPct || currentRate);
              } else {
                const pastRows = rows.filter((row) => new Date(row.toDate) <= now);
                if (pastRows.length > 0) {
                  const lastPast = pastRows[pastRows.length - 1];
                  currentBalance = Number(lastPast.closingBalance || 0);
                  currentRate = Number(lastPast.rateAnnualPct || currentRate);
                } else {
                  const firstRow = rows[0];
                  currentBalance = Number(firstRow.openingBalance || loan.principal || 0);
                  currentRate = Number(firstRow.rateAnnualPct || currentRate);
                }
              }
            }

            totalDebt += currentBalance;
            weightedRateSum += currentBalance * currentRate;

            if (scheduleData.summary?.payoffDate) {
              const payoff = new Date(scheduleData.summary.payoffDate);
              if (!Number.isNaN(payoff.getTime()) && (!maxPayoffDate || payoff > maxPayoffDate)) {
                maxPayoffDate = payoff;
              }
            }
          } catch (scheduleErr) {
            console.error('Failed to process loan schedule in profile overview', scheduleErr);
          }
        }
        
        if (isMounted) {
            setMilestonesData(allMilestones);
            setLiveOverview({
              totalDebt,
              blendedInterestRate: totalDebt > 0 ? weightedRateSum / totalDebt : 0,
              debtFreeDate: maxPayoffDate,
              loanCount: Array.isArray(loans) ? loans.length : 0,
            });
            setLoadingMilestones(false);
        }
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
        if (isMounted) {
          setLoadingMilestones(false);
          setLiveOverview(null);
        }
      }
    };
    
    fetchMilestones();
    const intervalId = window.setInterval(fetchMilestones, 30000);

    const onFocus = () => fetchMilestones();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchMilestones();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrencySelect = (code) => {
    setFormData((prev) => ({ ...prev, currency: code }));
    setCurrencyOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');

    try {
      await onUpdateProfile(formData);
      setStatus('success');
      setFormData((prev) => ({ ...prev, password: '' })); 
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'INR (₹)' },
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' }, 
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
    { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
    { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
    { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
    { code: 'CNY', symbol: '¥', label: 'CNY (¥)' },
    { code: 'NZD', symbol: 'NZ$', label: 'NZD (NZ$)' },
    { code: 'BRL', symbol: 'R$', label: 'BRL (R$)' },
    { code: 'RUB', symbol: '₽', label: 'RUB (₽)' },
    { code: 'HKD', symbol: 'HK$', label: 'HKD (HK$)' },
  ];

  const currentCurrency = currencies.find(c => c.code === formData.currency) || currencies[0];
  const overviewData = liveOverview;

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: formData.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

  const monthsUntilDebtFree = (() => {
    if (!dashboardData?.debtFreeDate) return null;
    const now = new Date();
    const end = new Date(dashboardData.debtFreeDate);
    if (Number.isNaN(end.getTime())) return null;
    const months =
      (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, months);
  })();

  const debtHealth = (() => {
    if (!dashboardData) return null;
    const totalDebt = Number(dashboardData.totalDebt || 0);
    const blendedRate = Number(dashboardData.blendedInterestRate || 0);
    const horizonMonths = monthsUntilDebtFree ?? 120;

    const debtLoadScore = clamp(100 - Math.log10(totalDebt + 1) * 18);
    const rateScore = clamp(100 - blendedRate * 7.5);
    const horizonScore = clamp(100 - horizonMonths * 0.8);
    const overall = clamp(debtLoadScore * 0.35 + rateScore * 0.35 + horizonScore * 0.3);

    const grade =
      overall >= 85 ? 'Excellent' : overall >= 70 ? 'Strong' : overall >= 55 ? 'Stable' : 'Needs Focus';

    return {
      overall: Math.round(overall),
      grade,
      metrics: [
        { key: 'debtLoad', label: 'Debt Load', score: Math.round(debtLoadScore) },
        { key: 'rate', label: 'Rate Quality', score: Math.round(rateScore) },
        { key: 'horizon', label: 'Payoff Horizon', score: Math.round(horizonScore) },
      ],
    };
  })();

  return (
    <div className="panel profile-panel animate-blur-in" style={{borderRadius:'16px'}}>
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Profile/Settings</h2>
        <button type="button" className="secondary-btn" style={{marginTop: '-1rem'}}onClick={onBack}>
          Close
        </button>
      </div>

      {overviewData && (
        <div className="dashboard-summary glass-panel animate-fade-in-up dashboard-full-width" style={{ marginBottom: '2rem',background: 'transparent', boxShadow:'8px 8px 20px rgba(54, 54, 54, 0.2) inset, 0 0 0 1px rgba(0, 0, 0, 0.5)', borderColor: 'var(--border)' }}>
          <div className="dashboard-metric">
            <div className="metric-label">Total Outstanding</div>
            <div className="metric-value">{formatMoney(overviewData.totalDebt)}</div>
          </div>
          <div className="metric-divider"></div>
          <div className="dashboard-metric">
            <div className="metric-label">Blended Rate</div>
            <div className="metric-value">{Number(overviewData.blendedInterestRate || 0).toFixed(2)}%</div>
          </div>
          <div className="metric-divider"></div>
          <div className="dashboard-metric">
            <div className="metric-label">Debt Free By</div>
            <div className="metric-value ">
              {overviewData.debtFreeDate ? new Date(overviewData.debtFreeDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '-'}
            </div>
          </div>
        </div>
      )}

      {debtHealth && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Debt Health Snapshot</h3>
          <div className="debt-health-overview-card" style={{background: 'transparent', boxShadow:'8px 8px 20px rgba(54, 54, 54, 0.2) inset, 0 0 0 1px rgba(0, 0, 0, 0.5)'}}>
            <div className="debt-health-overview-left">
              <div className="debt-health-ring">
                <div className="debt-health-ring-value">
                  {debtHealth.overall}
                  <span>/100</span>
                </div>
              </div>
              <div className="debt-health-grade" style={{ marginBottom: 0 }}>{debtHealth.grade}</div>
            </div>

            <div className="debt-health-overview-right">
              {debtHealth.metrics.map((metric) => (
                <div key={metric.key} className="debt-health-metric-card">
                  <div className="debt-health-metric-row">
                    <span>{metric.label}</span>
                    <strong>{metric.score}</strong>
                  </div>
                  <div className="debt-health-meter">
                    <span style={{ width: `${metric.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="milestone-section" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span>Your Achievements</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#ff8800ff" style={{ opacity: 1 }}><path  d="M12 11q.825 0 1.413-.587T14 9t-.587-1.412T12 7t-1.412.588T10 9t.588 1.413T12 11m-5-.2V7H5v1q0 .95.55 1.713T7 10.8m10 0q.9-.325 1.45-1.088T19 8V7h-2zM11 19v-3.1q-1.225-.275-2.187-1.037T7.4 12.95q-1.875-.225-3.137-1.637T3 8V7q0-.825.588-1.412T5 5h2q0-.825.588-1.412T9 3h6q.825 0 1.413.588T17 5h2q.825 0 1.413.588T21 7v1q0 1.9-1.263 3.313T16.6 12.95q-.45 1.15-1.412 1.913T13 15.9V19h3q.425 0 .713.288T17 20t-.288.713T16 21H8q-.425 0-.712-.288T7 20t.288-.712T8 19z"/></svg>
        </h3>
        
        {loadingMilestones ? (
          <p className="muted" style={{ fontSize: '0.9rem' }}>Loading your trophies...</p>
        ) : milestonesData.length === 0 ? (
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p className="muted" style={{ margin: 0 }}>Start making extra prepayments to unlock milestone badges!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {milestonesData.map((loanData, idx) => (
              <div key={idx}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {loanData.milestones.map((m, mIdx) => (
                    <div key={m.id} className="f-card animate-blur-in" style={{ padding: '1.5rem', animationDelay: `${mIdx * 0.1}s`, borderColor: 'var(--border)' }}>
                      <div className="f-icon-box" style={{ marginBottom: '1rem', fontSize: '1.5rem', width: '40px', height: '40px' }}>
                        {typeof m.icon === 'string' && m.icon.includes('<svg') ? (
                          <span dangerouslySetInnerHTML={{ __html: m.icon }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }} />
                        ) : (
                          m.icon
                        )}
                      </div>
                      <div className="f-content">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{m.title}</h3>
                        <p style={{ fontSize: '0.85rem' }}>{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Display Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
          />
        </div>

        <div className="form-row">
          <label>Default Currency</label>
          <div className="dropdown" ref={currencyRef}>
            <button
              type="button"
              className="dropdown-trigger"
              onClick={() => setCurrencyOpen(!currencyOpen)}
              aria-expanded={currencyOpen}
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span>{currentCurrency.label}</span>
              <span className="dropdown-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            {currencyOpen && (
              <div className="dropdown-menu" style={{ width: '100%', bottom: '100%', top: 'auto', marginBottom: '0.35rem', marginTop: 0, transformOrigin: 'bottom center' }}>
                {currencies.map((c, idx) => (
                  <button
                    key={c.code}
                    type="button"
                    className={`dropdown-item${c.code === formData.currency ? ' dropdown-item-active' : ''}`}
                    style={{ '--item-index': idx }}
                    onClick={() => handleCurrencySelect(c.code)}
                  >
                    <div className="dropdown-item-main">{c.label}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <label>Want to change your password?</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password..."
            minLength="6"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        {status === 'error' && <div className="error-banner">{errorMsg}</div>}
        {status === 'success' && (
          <div className="success-banner" style={{ color: '#22c55e', marginBottom: '1rem' }}>
            Profile updated successfully!
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="primary-btn" style={{ marginTop: '0.8rem', marginBottom: '0.8rem', width: '100%' }} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
