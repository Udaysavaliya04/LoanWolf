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

  const maxMonths = termMonths * 2 || 600; 

  const today = new Date();
  const recurringExtra = options.extraPerMonth
    ? new Decimal(options.extraPerMonth)
    : new Decimal(0);

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

    let extraPayment = recurringExtra;
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

  const calculateMilestones = () => {
    const achieved = [];
    const p100 = loan.principal;

    const currentEntry = schedule.find(row => row.tranType === 'Proj');
    let currentBalance = 0;
    if (currentEntry) {
      currentBalance = currentEntry.openingBalance;
    } else if (schedule.length > 0) {
         const last = schedule[schedule.length - 1];
         currentBalance = last.closingBalance;
    }
    
    const currentPrincipalPaid = p100 - currentBalance;
    
    // 1. Halfway mark
    if (currentPrincipalPaid >= p100 / 2 && p100 > 0) {
      achieved.push({ 
        id: 'halfway', 
        title: 'Halfway There!', 
        description: 'You have paid off 50% of your principal.',
        icon: '🎯' 
      });
    }

    if (currentBalance <= 1000000 && p100 > 1000000) {
      achieved.push({ id: 'under10l', title: 'Under ₹10L', description: 'Principal is now under ₹10 Lakhs.', icon: '📉' });
    }
    if (currentBalance <= 500000 && p100 > 500000) {
      achieved.push({ id: 'under5l', title: 'Under ₹5L', description: 'Principal is now under ₹5 Lakhs.', icon: '📉' });
    }
    if (currentBalance <= 100000 && p100 > 100000) {
      achieved.push({ id: 'under1l', title: 'Home Run Stretch', description: 'Principal is under ₹1 Lakh!', icon: '🔥' });
    }

    const yearsSaved = Math.floor(comparison.monthsSaved / 12);
    if (yearsSaved >= 1) {
      achieved.push({ 
        id: `years_saved_${yearsSaved}`, 
        title: `${yearsSaved} ${yearsSaved === 1 ? 'Year' : 'Years'} Saved!`, 
        description: `You knocked ${yearsSaved} ${yearsSaved === 1 ? 'year' : 'years'} off your loan!`,
        icon: '<svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:svg="http://www.w3.org/2000/svg" id="svg2706" viewBox="0 0 223.24 294.42" version="1.0" fill="red" width="24" height="24"><g id="layer1" transform="translate(-260.22 -345.13)"><path id="path4352" d="m434.08 345.13c-0.97 0-6.14 7.04-11.47 15.62-14.36 23.1-38.51 54.1-43.69 56.09-2.49 0.96-7.43 2.01-10.97 2.32-6.51 0.57-14.52 7.47-32.31 27.81-7.69 8.79-12.88 12.1-26.1 16.66-10.16 3.49-19.04 8.38-23.09 12.71-6.03 6.45-6.31 7.48-3.37 12.41 1.76 2.96 8.93 8.5 15.93 12.28l12.72 6.88-3.19 11.28c-1.76 6.21-3.23 14.68-3.25 18.81-0.01 4.13-2.4 12.33-5.31 18.19-5.61 11.3-13.59 41.66-14.75 56.12-0.41 5.07-20.6 27.24-25.01 27.24h195.33c-0.03-7.72-1.92-18.71-2.94-19.39-2.81-1.86 0.03-30.73 3.62-36.88 4.77-8.14 3.78-22.99-2.5-37.4-4.66-10.7-5.67-16.68-5.69-34.29-0.01-13.62 1.15-23.69 3.19-27.9 1.76-3.63 4.3-13.01 5.66-20.85 2.6-15.02 11.05-32.97 18.03-38.25 7-5.28 10.65-19.47 7.25-28.25-4.01-10.34-8.31-13.84-12.47-10.15-2.41 2.14-4.45 2.19-7.91 0.22-4.08-2.34-4.6-2.02-4.12 2.59 0.3 2.89-0.81 5.8-2.5 6.44-2.39 0.9-2.78-1.05-1.78-8.72 0.71-5.43 0.15-13.45-1.22-17.84-2.42-7.78-14.58-23.75-18.09-23.75z"/></svg>'
      });
    }
    
    if (currentBalance <= 0.01 && schedule.length > 0) {
       achieved.push({
         id: 'debt_free',
         title: 'Debt Free!',
         description: 'You have completely paid off this loan.',
         icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="26" height="26" viewBox="0 0 4990.73 3989.89"><path fill-rule="nonzero" fill="url(#radial-pattern-0)" d="M 994.984375 3175.878906 L 994.984375 3502.410156 L 4097.988281 3502.410156 L 4097.988281 3175.878906 Z M 994.984375 3175.878906 "/><path fill-rule="nonzero" fill="white" fill-opacity="1" d="M 3305.121094 2304.988281 C 3248.441406 2304.988281 3202.328125 2360.121094 3202.328125 2427.890625 C 3202.328125 2438.859375 3203.660156 2449.449219 3205.929688 2459.578125 C 3276.980469 2446.789062 3344.351562 2432.078125 3407.378906 2415.660156 C 3402.21875 2353.621094 3358.328125 2304.988281 3305.121094 2304.988281 Z M 2936.378906 2372.039062 C 2905.578125 2372.039062 2880.519531 2397.089844 2880.519531 2427.890625 C 2880.519531 2458.679688 2905.578125 2483.738281 2936.378906 2483.738281 C 2967.171875 2483.738281 2992.230469 2458.679688 2992.230469 2427.890625 C 2992.230469 2397.089844 2967.171875 2372.039062 2936.378906 2372.039062 Z M 2093.859375 1806.351562 C 2242.5 1806.351562 2367.808594 1711.558594 2404.601562 1583.101562 C 2188.859375 1588.640625 1986.570312 1609.828125 1808.351562 1643.21875 C 1862.929688 1742.160156 1972.390625 1806.351562 2093.859375 1806.351562 Z M 3701.609375 1932.660156 C 3758.878906 1932.660156 3812.921875 1915.96875 3857.878906 1886.238281 C 3769.640625 1808.710938 3620.449219 1740.910156 3429.289062 1689.070312 C 3435.511719 1824.371094 3555.261719 1932.660156 3701.609375 1932.660156 Z M 2547.519531 2291.578125 C 2479.75 2291.578125 2424.628906 2346.710938 2424.628906 2414.480469 C 2424.628906 2457.351562 2446.730469 2495.109375 2480.101562 2517.109375 C 2492.609375 2517.21875 2505.160156 2517.28125 2517.738281 2517.28125 C 2550.941406 2517.28125 2583.839844 2516.878906 2616.46875 2516.148438 C 2649 2494.011719 2670.421875 2456.699219 2670.421875 2414.480469 C 2670.421875 2346.710938 2615.289062 2291.578125 2547.519531 2291.578125 Z M 1601.859375 1690.269531 C 1411.609375 1742.269531 1263.28125 1810.128906 1175.929688 1887.671875 C 1220.53125 1916.480469 1273.71875 1932.660156 1329.558594 1932.660156 C 1475.488281 1932.660156 1594.988281 1825.011719 1601.859375 1690.269531 Z M 2937.320312 1806.351562 C 3058.488281 1806.351562 3168.371094 1740.890625 3222.71875 1642.410156 C 3044.359375 1609.269531 2842.121094 1588.300781 2626.511719 1582.988281 C 2663.199219 1711.441406 2788.578125 1806.351562 2937.320312 1806.351562 Z M 2189.960938 2358.628906 C 2159.160156 2358.628906 2134.101562 2383.679688 2134.101562 2414.480469 C 2134.101562 2445.28125 2159.160156 2470.328125 2189.960938 2470.328125 C 2220.761719 2470.328125 2245.808594 2445.28125 2245.808594 2414.480469 C 2245.808594 2383.679688 2220.761719 2358.628906 2189.960938 2358.628906 Z M 1754.171875 2300.519531 C 1698.011719 2300.519531 1652.289062 2354.691406 1651.46875 2421.609375 C 1714.191406 2437.269531 1780.988281 2451.261719 1851.261719 2463.410156 C 1854.890625 2450.851562 1856.960938 2437.429688 1856.960938 2423.421875 C 1856.960938 2355.648438 1810.851562 2300.519531 1754.171875 2300.519531 Z M 4339.191406 1023.460938 L 4120.070312 1301.050781 C 4105.238281 1319.839844 4090.378906 1348.519531 4080.011719 1376.558594 C 4078.039062 1356.988281 4073.128906 1338.859375 4065.839844 1327.980469 L 3944.609375 1146.980469 C 3931.621094 1127.570312 3916.328125 1138.429688 3910.5 1171.21875 L 3856.019531 1477 C 3850.171875 1509.808594 3855.960938 1552.128906 3868.980469 1571.53125 L 3963.429688 1712.589844 C 3937.929688 1707.671875 3911.929688 1721.828125 3902.859375 1747.050781 C 3892.839844 1774.921875 3907.300781 1805.640625 3935.179688 1815.671875 L 3967.769531 1827.390625 C 3912.851562 1909.851562 3815.558594 1964.710938 3704.601562 1964.710938 C 3533.050781 1964.710938 3393.960938 1833.691406 3393.960938 1672.058594 C 3393.960938 1652.390625 3396.101562 1633.210938 3400.039062 1614.640625 L 3417.808594 1617.339844 C 3451.96875 1622.539062 3483.871094 1599.039062 3489.070312 1564.878906 C 3493.871094 1533.320312 3474.160156 1503.730469 3444.199219 1495.308594 C 3500.691406 1474.140625 3544.398438 1423.910156 3554.109375 1360.03125 C 3568.390625 1266.070312 3503.800781 1178.328125 3409.839844 1164.050781 C 3315.878906 1149.761719 3228.140625 1214.351562 3213.859375 1308.308594 C 3204.148438 1372.191406 3230.960938 1433.148438 3278.609375 1470.140625 C 3247.5 1469.289062 3219.910156 1491.679688 3215.101562 1523.238281 C 3209.910156 1557.410156 3233.390625 1589.320312 3267.558594 1594.5 L 3284.75 1597.121094 C 3240.230469 1736.671875 3102.941406 1838.378906 2940.300781 1838.378906 C 2741.601562 1838.378906 2580.5 1686.628906 2580.5 1499.421875 C 2580.5 1498.511719 2580.550781 1497.621094 2580.558594 1496.71875 L 2595.199219 1496.71875 C 2629.761719 1496.71875 2657.78125 1468.710938 2657.78125 1434.148438 C 2657.78125 1408.578125 2642.421875 1386.628906 2620.449219 1376.921875 L 2846.960938 1288.53125 C 2875.210938 1277.5 2907.058594 1245.648438 2918.089844 1217.398438 L 3020.898438 953.910156 C 3031.929688 925.660156 3017.949219 911.679688 2989.710938 922.710938 L 2726.230469 1025.539062 C 2712.199219 1031 2697.300781 1041.621094 2684.480469 1054.371094 C 2685.980469 1029.839844 2682.730469 1004.078125 2674.449219 985.210938 L 2543.78125 687.289062 C 2529.769531 655.339844 2507.03125 655.339844 2493.03125 687.289062 L 2362.371094 985.210938 C 2353.519531 1005.390625 2350.289062 1033.46875 2352.621094 1059.480469 C 2338.808594 1044.519531 2321.980469 1031.710938 2306.140625 1025.53125 L 2042.640625 922.710938 C 2014.398438 911.691406 2000.421875 925.671875 2011.449219 953.910156 L 2114.269531 1217.378906 C 2125.300781 1245.648438 2157.140625 1277.5 2185.410156 1288.53125 L 2415.269531 1378.238281 C 2394.769531 1388.5 2380.660156 1409.648438 2380.660156 1434.148438 C 2380.660156 1468.710938 2408.679688 1496.71875 2443.238281 1496.71875 L 2456.589844 1496.71875 C 2456.589844 1497.621094 2456.648438 1498.511719 2456.648438 1499.421875 C 2456.648438 1686.628906 2295.550781 1838.378906 2096.851562 1838.378906 C 1939.648438 1838.378906 1806.128906 1743.359375 1757.171875 1610.980469 L 1777.390625 1607.910156 C 1811.558594 1602.730469 1835.050781 1570.820312 1829.851562 1536.648438 C 1825.050781 1505.089844 1797.460938 1482.691406 1766.339844 1483.550781 C 1814 1446.550781 1840.808594 1385.601562 1831.101562 1321.71875 C 1816.820312 1227.761719 1729.078125 1163.171875 1635.109375 1177.449219 C 1541.148438 1191.738281 1476.558594 1279.480469 1490.839844 1373.429688 C 1500.550781 1437.320312 1544.261719 1487.550781 1600.75 1508.71875 C 1570.789062 1517.140625 1551.089844 1546.730469 1555.890625 1578.28125 C 1561.078125 1612.449219 1592.980469 1635.941406 1627.148438 1630.75 L 1639.730469 1628.839844 C 1641.960938 1642.941406 1643.179688 1657.371094 1643.179688 1672.058594 C 1643.179688 1833.691406 1504.101562 1964.710938 1332.550781 1964.710938 C 1224.859375 1964.710938 1130.210938 1912.929688 1074.5 1834.519531 L 1126.890625 1815.671875 C 1154.761719 1805.640625 1169.230469 1774.921875 1159.210938 1747.050781 C 1149.179688 1719.171875 1118.449219 1704.710938 1090.578125 1714.738281 L 1060.019531 1725.738281 L 1166.269531 1567.050781 C 1179.28125 1547.660156 1185.070312 1505.328125 1179.230469 1472.519531 L 1124.75 1166.75 C 1118.921875 1133.960938 1103.628906 1123.101562 1090.628906 1142.511719 L 969.40625 1323.511719 C 962.117188 1334.398438 957.210938 1352.519531 955.238281 1372.089844 C 944.867188 1344.050781 930.007812 1315.371094 915.179688 1296.578125 L 696.054688 1018.988281 C 672.554688 989.230469 658.054688 995.511719 663.675781 1033.011719 L 679.1875 1136.589844 C 738.253906 1272.429688 835.414062 1481.558594 989.675781 1780.96875 L 989.335938 1781.078125 L 1113.769531 2211.789062 C 1347.289062 2070.230469 2320.671875 2074.75 2522.210938 2077.238281 C 2722 2074.769531 3680.378906 2070.308594 3924.429688 2208.160156 L 4047.820312 1781.078125 C 4200.769531 1484 4297.28125 1276.238281 4356.058594 1141.058594 L 4371.570312 1037.480469 C 4377.191406 999.980469 4362.691406 993.699219 4339.191406 1023.460938 Z M 2523.691406 2801.910156 C 1765.871094 2801.910156 1151.53125 2843.929688 1151.53125 2895.769531 C 1151.53125 2947.609375 1765.871094 2989.628906 2523.691406 2989.628906 C 3281.519531 2989.628906 3895.851562 2947.609375 3895.851562 2895.769531 C 3895.851562 2843.929688 3281.519531 2801.910156 2523.691406 2801.910156 Z M 3643.640625 2551.539062 C 3610.140625 2551.539062 3582.980469 2513.519531 3582.980469 2466.621094 C 3582.980469 2419.71875 3610.140625 2381.699219 3643.640625 2381.699219 C 3677.140625 2381.699219 3704.289062 2419.71875 3704.289062 2466.621094 C 3704.289062 2513.519531 3677.140625 2551.539062 3643.640625 2551.539062 Z M 3308.101562 2582.828125 C 3230.339844 2582.828125 3167.308594 2510.789062 3167.308594 2421.921875 C 3167.308594 2333.058594 3230.339844 2261.019531 3308.101562 2261.019531 C 3385.859375 2261.019531 3448.890625 2333.058594 3448.890625 2421.921875 C 3448.890625 2510.789062 3385.859375 2582.828125 3308.101562 2582.828125 Z M 2939.359375 2515.789062 C 2887.519531 2515.789062 2845.5 2473.761719 2845.5 2421.921875 C 2845.5 2370.089844 2887.519531 2328.058594 2939.359375 2328.058594 C 2991.199219 2328.058594 3033.21875 2370.089844 3033.21875 2421.921875 C 3033.21875 2473.761719 2991.199219 2515.789062 2939.359375 2515.789062 Z M 2550.511719 2569.421875 C 2461.640625 2569.421875 2389.601562 2497.378906 2389.601562 2408.519531 C 2389.601562 2319.648438 2461.640625 2247.609375 2550.511719 2247.609375 C 2639.378906 2247.609375 2711.410156 2319.648438 2711.410156 2408.519531 C 2711.410156 2497.378906 2639.378906 2569.421875 2550.511719 2569.421875 Z M 2192.941406 2502.378906 C 2141.109375 2502.378906 2099.078125 2460.351562 2099.078125 2408.519531 C 2099.078125 2356.679688 2141.109375 2314.660156 2192.941406 2314.660156 C 2244.78125 2314.660156 2286.800781 2356.679688 2286.800781 2408.519531 C 2286.800781 2460.351562 2244.78125 2502.378906 2192.941406 2502.378906 Z M 1757.160156 2578.359375 C 1679.398438 2578.359375 1616.371094 2506.320312 1616.371094 2417.460938 C 1616.371094 2328.589844 1679.398438 2256.550781 1757.160156 2256.550781 C 1834.921875 2256.550781 1897.949219 2328.589844 1897.949219 2417.460938 C 1897.949219 2506.320312 1834.921875 2578.359375 1757.160156 2578.359375 Z M 1453.550781 2524.71875 C 1420.050781 2524.71875 1392.890625 2486.699219 1392.890625 2439.800781 C 1392.890625 2392.910156 1420.050781 2354.878906 1453.550781 2354.878906 C 1487.050781 2354.878906 1514.210938 2392.910156 1514.210938 2439.800781 C 1514.210938 2486.699219 1487.050781 2524.71875 1453.550781 2524.71875 Z M 2517.738281 2144.339844 C 2293.800781 2141.558594 1093.429688 2136.199219 1093.429688 2341.539062 C 1093.429688 2341.539062 1093.648438 2351.300781 1093.988281 2368.871094 C 1102.398438 2365.699219 1111.171875 2363.820312 1120.238281 2363.820312 C 1179.488281 2363.820312 1227.519531 2435.859375 1227.519531 2524.71875 C 1227.519531 2613.589844 1179.488281 2685.628906 1120.238281 2685.628906 C 1112.769531 2685.628906 1105.488281 2684.46875 1098.449219 2682.289062 C 1099.011719 2745.210938 1099.390625 2811.921875 1099.390625 2877.890625 C 1099.390625 2738.570312 2189.5 2746.679688 2481.980469 2751.371094 L 2481.980469 2752.738281 C 2481.980469 2752.738281 2494.691406 2752.429688 2517.738281 2751.988281 C 2540.78125 2752.429688 2553.488281 2752.738281 2553.488281 2752.738281 L 2553.488281 2751.371094 C 2845.96875 2746.679688 3936.078125 2738.570312 3936.078125 2877.890625 C 3936.078125 2808.171875 3936.511719 2737.648438 3937.121094 2671.628906 C 3881.578125 2665.539062 3837.75 2596.191406 3837.75 2511.320312 C 3837.75 2424.039062 3884.078125 2353.179688 3941.851562 2350.648438 C 3941.980469 2344.808594 3942.050781 2341.539062 3942.050781 2341.539062 C 3942.050781 2136.199219 2741.679688 2141.558594 2517.738281 2144.339844 "/></svg>'
       });
    }

    return achieved;
  };

  const milestones = calculateMilestones();

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
    milestones,
  };
}

module.exports = {
  buildSchedule,
};

