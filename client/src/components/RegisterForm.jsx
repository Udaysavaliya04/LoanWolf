import React, { useState, useRef, useEffect } from 'react';

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

function RegisterForm({ values, onChange, onSubmit, onCurrencyChange }) {
  const [showPassword, setShowPassword] = useState(false);
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

  const handleCurrencySelect = (code) => {
    onCurrencyChange(code);
    setCurrencyOpen(false);
  };

  const currentCurrency = currencies.find(c => c.code === values.currency) || currencies[0];

  return (
    <form className="form auth-form animate-blur-in delay-300" onSubmit={onSubmit}>
      <div className="form-row">
        <label>Name</label>
        <input
          name="name"
          value={values.name}
          onChange={onChange}
          placeholder="Full Name"
          autoComplete="name"
          required
        />
      </div>
      <div className="form-row">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={onChange}
          placeholder="name@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="form-row">
        <label>Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={onChange}
            placeholder="Enter a strong password..."
            autoComplete="new-password"
            required
            className="password-input"
          />
           <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      <div className="form-row">
        <label>Preferred Currency</label>
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
            <div className="dropdown-menu" style={{ width: '100%', bottom: '100%', top: 'auto', marginBottom: '0.35rem', marginTop: 0, background: '#000' }}>
              {currencies.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className={`dropdown-item${c.code === values.currency ? ' dropdown-item-active' : ''}`}
                  onClick={() => handleCurrencySelect(c.code)}
                >
                  <div className="dropdown-item-main">{c.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="primary-btn auth-primary-btn">
        Sign up
      </button>
    </form>
  );
}

export default RegisterForm;