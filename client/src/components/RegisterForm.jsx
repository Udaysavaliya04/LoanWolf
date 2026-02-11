import React from 'react';

function RegisterForm({ values, onChange, onSubmit }) {
  return (
    <form className="form auth-form" onSubmit={onSubmit}>
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
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
        />
      </div>
      <button type="submit" className="primary-btn auth-primary-btn">
        Sign up
      </button>
    </form>
  );
}

export default RegisterForm;

