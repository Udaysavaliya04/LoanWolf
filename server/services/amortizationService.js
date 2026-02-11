const Decimal = require('decimal.js');
const Loan = require('../models/Loan');
const LoanEvent = require('../models/LoanEvent');

function calculateMonthlyPayment(principal, annualRatePct, termMonths) {
  if (termMonths <= 0) return new Decimal(0);
  const rate = new Decimal(annualRatePct).div(100).div(12);
  if (rate.equals(0)) {
    return new Decimal(principal).div(termMonths);
  }
  const P = new Decimal(principal);
  const onePlusRPowerN = rate.plus(1).pow(termMonths);
  return P.times(rate).times(onePlusRPowerN).div(onePlusRPowerN.minus(1));
}

function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
}

function buildBaselineScheduleForLoan(loan) {
  let balance = new Decimal(loan.principal);
  const startDate = loan.startDate;
  const termMonths = loan.termMonths;
  const currentAnnualRate = new Decimal(loan.annualInterestRate);

  const fixedMonthlyPayment = calculateMonthlyPayment(balance, currentAnnualRate, termMonths);

  const schedule = [];
  let totalInterest = new Decimal(0);
  let totalPrincipalPaid = new Decimal(0);
  const maxMonths = termMonths * 2 || 600;
  const today = new Date();

  for (let i = 1; i <= maxMonths && balance.gt(0.01); i++) {
    const periodStartBalance = balance;
    const fromDate = addMonths(startDate, i - 1);
    const toDate = addMonths(startDate, i);

    const monthlyRate = currentAnnualRate.div(100).div(12);
    const interest = periodStartBalance.times(monthlyRate).toDecimalPlaces(
      2,
      Decimal.ROUND_HALF_UP
    );

    let principalComponent = fixedMonthlyPayment.minus(interest);
    if (principalComponent.lt(0)) {
      principalComponent = new Decimal(0);
    }

    // Ensure we never pay more principal than remaining balance.
    if (principalComponent.gt(periodStartBalance)) {
      principalComponent = periodStartBalance;
    }

    const totalPaymentThisPeriod = principalComponent.plus(interest);

    balance = periodStartBalance.minus(principalComponent);
    balance = balance.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    if (balance.lt(0)) balance = new Decimal(0);

    totalInterest = totalInterest.plus(interest);
    totalPrincipalPaid = totalPrincipalPaid.plus(principalComponent);

    const tranType = toDate <= today ? 'Amrt' : 'Proj';

    schedule.push({
      period: i,
      tranType,
      fromDate,
      toDate,
      rateAnnualPct: currentAnnualRate.toNumber(),
      openingBalance: periodStartBalance.toNumber(),
      interest: interest.toNumber(),
      principalComponent: principalComponent.toNumber(),
      extraPayment: 0,
      emiFixed: fixedMonthlyPayment.toNumber(),
      totalPayment: totalPaymentThisPeriod.toNumber(),
      closingBalance: balance.toNumber(),
    });
  }

  const summary = {
    totalInterest: totalInterest.toNumber(),
    totalPrincipalPaid: totalPrincipalPaid.toNumber(),
    totalExtraPayments: 0,
    totalPaid: totalPrincipalPaid.plus(totalInterest).toNumber(),
    remainingBalance: balance.toNumber(),
    payoffDate:
      balance.lte(0.01) && schedule.length > 0 ? schedule[schedule.length - 1].toDate : null,
  };

  return { schedule, summary };
}

async function buildSchedule(loanId, options = {}) {
  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new Error('Loan not found');
  }

  const dbEvents = await LoanEvent.find({ loanId }).sort({ date: 1 }).lean();
  const extraEvents = Array.isArray(options.extraEvents) ? options.extraEvents : [];
  const events = [...dbEvents, ...extraEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let balance = new Decimal(loan.principal);
  let currentAnnualRate = new Decimal(loan.annualInterestRate);
  const startDate = loan.startDate;
  const termMonths = loan.termMonths;

  // Calculate an initial fixed EMI based on original terms.
  const fixedMonthlyPayment = calculateMonthlyPayment(balance, currentAnnualRate, termMonths);

  const schedule = [];
  let totalInterest = new Decimal(0);
  let totalPrincipalPaid = new Decimal(0);
  let totalExtraPayments = new Decimal(0);

  const maxMonths = termMonths * 2 || 600; // safety cap so we don't loop forever

  const today = new Date();

  for (let i = 1; i <= maxMonths && balance.gt(0.01); i++) {
    const periodStartBalance = balance;
    const fromDate = addMonths(startDate, i - 1);
    const toDate = addMonths(startDate, i);
    const paymentDate = toDate;

    const eventsThisPeriod = events.filter(
      (e) =>
        new Date(e.date) >= addMonths(startDate, i - 1) &&
        new Date(e.date) < addMonths(startDate, i)
    );

    for (const ev of eventsThisPeriod.filter((e) => e.type === 'RATE_CHANGE')) {
      if (typeof ev.newAnnualInterestRate === 'number') {
        currentAnnualRate = new Decimal(ev.newAnnualInterestRate);
      }
    }

    const monthlyRate = currentAnnualRate.div(100).div(12);
    const interest = periodStartBalance.times(monthlyRate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    // Keep EMI fixed like bank schedules (e.g. 24,400), let term float.
    let principalComponent = fixedMonthlyPayment.minus(interest);
    if (principalComponent.lt(0)) {
      principalComponent = new Decimal(0);
    }

    let extraPayment = new Decimal(0);
    for (const ev of eventsThisPeriod.filter((e) => e.type === 'EXTRA_PAYMENT')) {
      if (typeof ev.amount === 'number') {
        extraPayment = extraPayment.plus(ev.amount);
      }
    }

    let totalPaymentThisPeriod = principalComponent.plus(interest).plus(extraPayment);

    if (principalComponent.plus(extraPayment).gt(periodStartBalance)) {
      const newPrincipalComponent = periodStartBalance.minus(extraPayment);
      if (newPrincipalComponent.lt(0)) {
        extraPayment = periodStartBalance;
        principalComponent = new Decimal(0);
      } else {
        principalComponent = newPrincipalComponent;
      }
      totalPaymentThisPeriod = principalComponent.plus(interest).plus(extraPayment);
    }

    balance = periodStartBalance.minus(principalComponent).minus(extraPayment);
    balance = balance.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    if (balance.lt(0)) balance = new Decimal(0);

    totalInterest = totalInterest.plus(interest);
    totalPrincipalPaid = totalPrincipalPaid.plus(principalComponent);
    totalExtraPayments = totalExtraPayments.plus(extraPayment);

    const tranType = toDate <= today ? 'Amrt' : 'Proj';

    schedule.push({
      period: i,
      tranType,
      fromDate,
      toDate,
      rateAnnualPct: currentAnnualRate.toNumber(),
      openingBalance: periodStartBalance.toNumber(),
      interest: interest.toNumber(),
      principalComponent: principalComponent.toNumber(),
      extraPayment: extraPayment.toNumber(),
      emiFixed: fixedMonthlyPayment.toNumber(),
      totalPayment: totalPaymentThisPeriod.toNumber(),
      closingBalance: balance.toNumber(),
    });
  }

  const summary = {
    totalInterest: totalInterest.toNumber(),
    totalPrincipalPaid: totalPrincipalPaid.toNumber(),
    totalExtraPayments: totalExtraPayments.toNumber(),
    totalPaid: totalPrincipalPaid.plus(totalInterest).plus(totalExtraPayments).toNumber(),
    remainingBalance: balance.toNumber(),
    payoffDate:
      balance.lte(0.01) && schedule.length > 0 ? schedule[schedule.length - 1].toDate : null,
  };

  const baseline = buildBaselineScheduleForLoan(loan);

  const comparison = (() => {
    const interestOriginal = baseline.summary.totalInterest;
    const interestWithEvents = summary.totalInterest;
    const totalPaidOriginal = baseline.summary.totalPaid;
    const totalPaidWithEvents = summary.totalPaid;

    return {
      interestOriginal,
      interestWithEvents,
      interestSaved: interestOriginal - interestWithEvents,
      totalPaidOriginal,
      totalPaidWithEvents,
      totalPaidSaved: totalPaidOriginal - totalPaidWithEvents,
      monthsOriginal: baseline.schedule.length,
      monthsWithEvents: schedule.length,
      monthsSaved: baseline.schedule.length - schedule.length,
    };
  })();

  return {
    loan: {
      id: loan._id,
      name: loan.name,
      principal: loan.principal,
      annualInterestRate: loan.annualInterestRate,
      termMonths: loan.termMonths,
      startDate: loan.startDate,
    },
    schedule,
    summary,
    baselineSummary: baseline.summary,
    baselineSchedule: baseline.schedule,
    comparison,
  };
}

module.exports = {
  buildSchedule,
};

