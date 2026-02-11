import React from 'react';

function LoginForm({ values, onChange, onSubmit }) {
  return (
    <form className="form auth-form" onSubmit={onSubmit}>
      <div className="form-row">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={onChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="form-row">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={onChange}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>
      <button type="submit" className="primary-btn auth-primary-btn">
        Log in
      </button>
    </form>
  );
}

export default LoginForm;

