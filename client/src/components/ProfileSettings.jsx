import { useState, useRef, useEffect } from 'react';

const ProfileSettings = ({ user, onUpdateProfile, onBack, dashboardData }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    currency: user.currency || 'INR',
    password: '',
  });
  const [status, setStatus] = useState(''); // 'saving', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [milestonesData, setMilestonesData] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const currencyRef = useRef(null);
  
  // Custom fetch to get the schedule for each loan to extract milestones
  useEffect(() => {
    let isMounted = true;
    const fetchMilestones = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${API_BASE}/api/loans`, { credentials: 'include' });
        const loans = await res.json();
        
        const allMilestones = [];
        for (const loan of loans) {
            const scheduleRes = await fetch(`${API_BASE}/api/loans/${loan._id}/schedule`, { credentials: 'include' });
            if (scheduleRes.ok) {
               const scheduleData = await scheduleRes.json();
               if (scheduleData.milestones && scheduleData.milestones.length > 0) {
                 allMilestones.push({ loanName: loan.name, milestones: scheduleData.milestones });
               }
            }
        }
        
        if (isMounted) {
            setMilestonesData(allMilestones);
            setLoadingMilestones(false);
        }
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
        if (isMounted) setLoadingMilestones(false);
      }
    };
    
    fetchMilestones();
    return () => { isMounted = false; };
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
      setFormData((prev) => ({ ...prev, password: '' })); // Clear password on success
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
  ];

  const currentCurrency = currencies.find(c => c.code === formData.currency) || currencies[0];

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: formData.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="panel profile-panel animate-blur-in">
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Profile/Settings</h2>
        <button type="button" className="secondary-btn" onClick={onBack}>
          Close
        </button>
      </div>

      {dashboardData && (
        <div className="dashboard-summary glass-panel animate-fade-in-up dashboard-full-width" style={{ marginBottom: '2rem' }}>
          <div className="dashboard-metric">
            <div className="metric-label">Total Outstanding</div>
            <div className="metric-value">{formatMoney(dashboardData.totalDebt)}</div>
          </div>
          <div className="metric-divider"></div>
          <div className="dashboard-metric">
            <div className="metric-label">Blended Rate</div>
            <div className="metric-value">{dashboardData.blendedInterestRate.toFixed(2)}%</div>
          </div>
          <div className="metric-divider"></div>
          <div className="dashboard-metric">
            <div className="metric-label">Debt Free By</div>
            <div className="metric-value ">
              {dashboardData.debtFreeDate ? new Date(dashboardData.debtFreeDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '-'}
            </div>
          </div>
        </div>
      )}

      {/* Gamification Section */}
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
                    <div key={m.id} className="f-card animate-blur-in" style={{ padding: '1.5rem', animationDelay: `${mIdx * 0.1}s` }}>
                      <div className="f-icon-box" style={{ marginBottom: '1rem', fontSize: '1.5rem', width: '40px', height: '40px' }}>
                        {m.icon}
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
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span>{currentCurrency.label}</span>
              <span className="dropdown-icon" aria-hidden="true">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 -4 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d='m6 9 6 6 6-6' />
                </svg>
              </span>
            </button>
            {currencyOpen && (
              <div className="dropdown-menu" style={{ width: '100%' }}>
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    className={`dropdown-item${c.code === formData.currency ? ' dropdown-item-active' : ''}`}
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
          <label>New Password (leave blank to keep current)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New Password..."
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
