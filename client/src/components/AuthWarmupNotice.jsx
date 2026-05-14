import React from 'react';

const waitCopy = {
  quiet: {
    title: 'Securing your session',
    detail: 'This usually only takes a moment.',
  },
  settling: {
    title: 'Still with you',
    detail: 'The secure server may be waking from its free preview nap.',
  },
  wakeup: {
    title: 'First visit can take about a minute',
    detail: 'Keep this tab open. Once it wakes, LoanWolf moves normally.',
  },
};

function AuthWarmupNotice({ level = 'quiet' }) {
  const copy = waitCopy[level] || waitCopy.quiet;

  return (
    <div className={`auth-warmup-notice auth-warmup-${level}`} role="status" aria-live="polite">
      <div className="auth-warmup-pulse" aria-hidden="true">
        <span />
      </div>
      <div>
        <div className="auth-warmup-title">{copy.title}</div>
        <div className="auth-warmup-detail">{copy.detail}</div>
      </div>
    </div>
  );
}

export default AuthWarmupNotice;
