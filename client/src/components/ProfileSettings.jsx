import { useState, useRef, useEffect } from 'react';

const ProfileSettings = ({ user, onUpdateProfile, onBack }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    currency: user.currency || 'INR',
    password: '',
  });
  const [status, setStatus] = useState(''); // 'saving', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef(null);

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

  return (
    <div className="panel profile-panel">
      <div className="panel-header">
        <h2>Profile & Settings</h2>
        <button type="button" className="secondary-btn" onClick={onBack}>
          Back
        </button>
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
            placeholder="********"
            minLength="6"
          />
        </div>

        {status === 'error' && <div className="error-banner">{errorMsg}</div>}
        {status === 'success' && (
          <div className="success-banner" style={{ color: '#22c55e', marginBottom: '1rem' }}>
            Profile updated successfully!
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="primary-btn" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
