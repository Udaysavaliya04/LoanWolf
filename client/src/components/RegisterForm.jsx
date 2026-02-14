import React, { useState } from 'react';

function RegisterForm({ values, onChange, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="form auth-form animate-blur-in delay-300" onSubmit={onSubmit}>
      <div className="form-row">
        <label>Name</label>
        <input
          name="name"
          value={values.name}
          onChange={onChange}
          placeholder="Your name"
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
          placeholder="you@gmail.com"
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
            placeholder="Create a strong password"
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
      <button type="submit" className="primary-btn auth-primary-btn">
        Sign up
      </button>
    </form>
  );
}

export default RegisterForm;