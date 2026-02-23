const Loan = require('../models/Loan');
const LoanEvent = require('../models/LoanEvent');
const { buildSchedule } = require('./amortizationService');

function fmtINR(num) {
  if (num == null || !Number.isFinite(num)) return 'N/A';
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

function fmtDate(d) {
  if (!d) return 'N/A';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN');
}

async function getDashboardMetrics(userId) {
  const loans = await Loan.find({ ownerId: userId });
  if (loans.length === 0) {
    return { totalDebt: 0, blendedInterestRate: 0, debtFreeDate: null, loanCount: 0 };
  }

  let totalDebt = 0;
  let weightedRateSum = 0;
  let maxPayoffDate = null;

  for (const loan of loans) {
    const data = await buildSchedule(loan._id);
    const currentEntry = data.schedule.find((row) => row.tranType === 'Proj');
    const currentBalance = currentEntry
      ? currentEntry.openingBalance
      : data.schedule.length > 0
        ? data.schedule[data.schedule.length - 1].closingBalance
        : 0;

    totalDebt += currentBalance;
    weightedRateSum += currentBalance * loan.annualInterestRate;
    if (data.summary.payoffDate) {
      const d = new Date(data.summary.payoffDate);
      if (!maxPayoffDate || d > maxPayoffDate) maxPayoffDate = d;
    }
  }

  const blendedInterestRate = totalDebt > 0 ? weightedRateSum / totalDebt : 0;
  return {
    totalDebt,
    blendedInterestRate,
    debtFreeDate: maxPayoffDate,
    loanCount: loans.length,
  };
}

function scheduleToTable(schedule, maxRows = 600) {
  const rows = schedule.slice(0, maxRows);
  const header = 'Period | Type | From | To | Opening Bal | Interest | Principal | Extra | Total | Closing Bal';
  const lines = rows.map((r) =>
    [
      r.period,
      r.tranType,
      fmtDate(r.fromDate),
      fmtDate(r.toDate),
      Math.round(r.openingBalance),
      Math.round(r.interest),
      Math.round(r.principalComponent),
      Math.round(r.extraPayment || 0),
      Math.round(r.totalPayment),
      Math.round(r.closingBalance),
    ].join(' | ')
  );
  return [header, ...lines].join('\n');
}

async function buildFullAdvisorContext(userId, options = {}) {
  const { activeLoanId = null, clientContextData = null } = options;

  const loans = await Loan.find({ ownerId: userId }).sort({ createdAt: -1 });
  const dashboard = await getDashboardMetrics(userId);

  let context = '';

  // —— PORTFOLIO OVERVIEW ——
  context += '## PORTFOLIO OVERVIEW\n';
  context += `- Total outstanding debt: ${fmtINR(dashboard.totalDebt)}\n`;
  context += `- Blended interest rate: ${dashboard.blendedInterestRate.toFixed(2)}%\n`;
  context += `- Projected debt-free date: ${fmtDate(dashboard.debtFreeDate)}\n`;
  context += `- Number of loans: ${dashboard.loanCount}\n\n`;

  if (loans.length === 0) {
    context += 'User has no loans in the system.\n';
    return { context, dashboard, loans: [] };
  }

  // —— PER-LOAN: full schedule inputs + events + comparison ——
  for (const loan of loans) {
    const events = await LoanEvent.find({ loanId: loan._id }).sort({ date: 1 }).lean();
    const fullData = await buildSchedule(loan._id);
    const { schedule, summary, baselineSummary, comparison } = fullData;
    const currentRow = schedule.find((r) => r.tranType === 'Proj');
    const isActive = activeLoanId && loan._id.toString() === activeLoanId.toString();

    context += `---\n## LOAN: ${loan.name}${isActive ? ' (CURRENTLY VIEWED BY USER)' : ''}\n\n`;

    // Loan inputs (schedule inputs / source data)
    context += '### Loan inputs\n';
    context += `- Principal: ${fmtINR(loan.principal)}\n`;
    context += `- Annual interest rate: ${loan.annualInterestRate}%\n`;
    context += `- Term: ${loan.termMonths} months\n`;
    context += `- Start date: ${fmtDate(loan.startDate)}\n\n`;

    // Events (extra payments, rate changes)
    context += '### Events (extra payments & rate changes)\n';
    if (events.length === 0) {
      context += 'None.\n\n';
    } else {
      events.forEach((e) => {
        if (e.type === 'EXTRA_PAYMENT') {
          context += `- ${fmtDate(e.date)}: Extra payment ${fmtINR(e.amount)}${e.note ? ` — ${e.note}` : ''}\n`;
        } else {
          context += `- ${fmtDate(e.date)}: Rate change to ${e.newAnnualInterestRate}%${e.note ? ` — ${e.note}` : ''}\n`;
        }
      });
      context += '\n';
    }

    // Summary (current run)
    context += '### Schedule summary (with events applied)\n';
    context += `- Total interest (lifetime): ${fmtINR(summary.totalInterest)}\n`;
    context += `- Total principal paid: ${fmtINR(summary.totalPrincipalPaid)}\n`;
    context += `- Total extra payments: ${fmtINR(summary.totalExtraPayments)}\n`;
    context += `- Total amount paid: ${fmtINR(summary.totalPaid)}\n`;
    context += `- Remaining balance: ${fmtINR(summary.remainingBalance)}\n`;
    context += `- Payoff date: ${fmtDate(summary.payoffDate)}\n\n`;

    // Baseline comparison (vs no extra payments / no rate changes)
    if (baselineSummary && comparison) {
      context += '### Comparison vs original schedule (no prepayments)\n';
      context += `- Original total interest: ${fmtINR(comparison.interestOriginal)}\n`;
      context += `- Current total interest: ${fmtINR(comparison.interestWithEvents)}\n`;
      context += `- Interest saved: ${fmtINR(comparison.interestSaved)}\n`;
      context += `- Total paid saved: ${fmtINR(comparison.totalPaidSaved)}\n`;
      context += `- EMIs saved: ${comparison.monthsSaved} months\n\n`;
    }

    // Full amortization schedule (every row) so AI can analyze by period
    context += '### Full amortization schedule (period-by-period)\n';
    context += scheduleToTable(schedule) + '\n\n';
  }

  // —— CLIENT-SIDE CONTEXT (what user is looking at right now) ——
  if (clientContextData && clientContextData.currentLoan) {
    context += '---\n## ACTIVE VIEW (user is currently on this loan in the UI)\n';
    context += `- Loan name: ${clientContextData.currentLoan.name}\n`;
    if (clientContextData.scheduleSummary) {
      context += `- Summary from UI: Total interest ${fmtINR(clientContextData.scheduleSummary.totalInterest)}, Payoff ${fmtDate(clientContextData.scheduleSummary.payoffDate)}\n`;
    }
    if (clientContextData.scheduleComparison) {
      context += `- Interest saved vs baseline: ${fmtINR(clientContextData.scheduleComparison.interestSaved)}, EMIs saved: ${clientContextData.scheduleComparison.monthsSaved}\n`;
    }
    if (clientContextData.events && clientContextData.events.length > 0) {
      context += '- Recent events from UI:\n';
      clientContextData.events.forEach((e) => {
        context += `  - ${fmtDate(e.date)}: ${e.type === 'EXTRA_PAYMENT' ? `Extra payment ${fmtINR(e.amount)}` : `Rate change ${e.newAnnualInterestRate}%`}\n`;
      });
    }
    if (clientContextData.dashboard) {
      context += `- Dashboard: Total debt ${fmtINR(clientContextData.dashboard.totalDebt)}, Debt-free date ${fmtDate(clientContextData.dashboard.debtFreeDate)}\n`;
    }
    context += '\n';
  }

  return { context, dashboard, loans };
}

module.exports = {
  buildFullAdvisorContext,
  getDashboardMetrics,
  scheduleToTable,
};
