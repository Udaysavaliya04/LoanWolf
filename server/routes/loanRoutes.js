const express = require('express');
const Loan = require('../models/Loan');
const LoanEvent = require('../models/LoanEvent');
const { buildSchedule } = require('../services/amortizationService');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
const LOAN_TYPES = ['HOME', 'PERSONAL', 'AUTO', 'EDUCATION', 'BUSINESS', 'OTHER'];

function normalizeLoanType(value) {
  if (value == null || value === '') return 'HOME';
  const code = String(value).toUpperCase();
  return LOAN_TYPES.includes(code) ? code : 'OTHER';
}

router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    const { name, loanType, principal, annualInterestRate, termMonths, startDate } = req.body;
    const loan = await Loan.create({
      name,
      loanType: normalizeLoanType(loanType),
      principal,
      annualInterestRate,
      termMonths,
      startDate,
      ownerId: req.user.id,
    });
    res.status(201).json(loan);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create loan', error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list loans', error: err.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const loans = await Loan.find({ ownerId: req.user.id });
    let totalDebt = 0;
    let weightedRateSum = 0;
    let maxPayoffDate = null;
    const now = new Date();

    const results = await Promise.all(
      loans.map(async (loan) => {
        const data = await buildSchedule(loan._id);
        const rows = data.schedule || [];

        let currentBalance = 0;
        let currentRate = Number(loan.annualInterestRate || 0);

        if (rows.length > 0) {
          const activeRow = rows.find((row) => {
            const from = new Date(row.fromDate);
            const to = new Date(row.toDate);
            return from <= now && to > now;
          });

          if (activeRow) {
            currentBalance = Number(activeRow.openingBalance || 0);
            currentRate = Number(activeRow.rateAnnualPct || currentRate);
          } else {
            const pastRows = rows.filter((row) => new Date(row.toDate) <= now);
            if (pastRows.length > 0) {
              const lastPast = pastRows[pastRows.length - 1];
              currentBalance = Number(lastPast.closingBalance || 0);
              currentRate = Number(lastPast.rateAnnualPct || currentRate);
            } else {
              const firstRow = rows[0];
              currentBalance = Number(firstRow.openingBalance || loan.principal || 0);
              currentRate = Number(firstRow.rateAnnualPct || currentRate);
            }
          }
        }

        return { summary: data.summary, currentBalance, currentRate };
      })
    );

    results.forEach(({ summary, currentBalance, currentRate }) => {
      totalDebt += currentBalance;
      weightedRateSum += currentBalance * currentRate;

      if (summary.payoffDate) {
        const date = new Date(summary.payoffDate);
        if (!maxPayoffDate || date > maxPayoffDate) {
          maxPayoffDate = date;
        }
      }
    });

    const blendedRate = totalDebt > 0 ? weightedRateSum / totalDebt : 0;

    res.json({
      totalDebt,
      blendedInterestRate: blendedRate,
      debtFreeDate: maxPayoffDate,
      loanCount: loans.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to build dashboard', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    const events = await LoanEvent.find({ loanId: loan._id }).sort({ date: 1 });
    res.json({ loan, events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get loan', error: err.message });
  }
});

router.post('/:id/events', async (req, res) => {
  try {
    const { type, date, amount, newAnnualInterestRate, note } = req.body;
    const loanId = req.params.id;
    const loan = await Loan.findOne({ _id: loanId, ownerId: req.user.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const event = await LoanEvent.create({
      loanId,
      type,
      date,
      amount,
      newAnnualInterestRate,
      note,
    });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to add event', error: err.message });
  }
});

// Update a loan
router.put('/:id', async (req, res) => {
  try {
    const { name, loanType, principal, annualInterestRate, termMonths, startDate } = req.body;
    const loan = await Loan.findOne({ _id: req.params.id, ownerId: req.user.id });

    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    if (name !== undefined) loan.name = name;
    if (loanType !== undefined) loan.loanType = normalizeLoanType(loanType);
    if (principal !== undefined) loan.principal = principal;
    if (annualInterestRate !== undefined) loan.annualInterestRate = annualInterestRate;
    if (termMonths !== undefined) loan.termMonths = termMonths;
    if (startDate !== undefined) loan.startDate = startDate;

    await loan.save();
    res.json(loan);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update loan', error: err.message });
  }
});

// Delete a loan
router.delete('/:id', async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    await LoanEvent.deleteMany({ loanId: loan._id });
    await Loan.deleteOne({ _id: loan._id });

    res.json({ message: 'Loan deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete loan', error: err.message });
  }
});

// Update an event
router.put('/:id/events/:eventId', async (req, res) => {
  try {
    const { type, date, amount, newAnnualInterestRate, note } = req.body;
    const loan = await Loan.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const event = await LoanEvent.findOne({ _id: req.params.eventId, loanId: loan._id });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.type = type || event.type;
    event.date = date || event.date;
    // Allow setting to null/undefined if explicitly passed? For now just simple update
    if (amount !== undefined) event.amount = amount;
    if (newAnnualInterestRate !== undefined) event.newAnnualInterestRate = newAnnualInterestRate;
    event.note = note !== undefined ? note : event.note;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to update event', error: err.message });
  }
});

// Delete an event
router.delete('/:id/events/:eventId', async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const result = await LoanEvent.deleteOne({ _id: req.params.eventId, loanId: loan._id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Event not found' });

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete event', error: err.message });
  }
});

router.get('/:id/schedule', async (req, res) => {
  try {
    const data = await buildSchedule(req.params.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to build schedule', error: err.message });
  }
});

router.post('/:id/simulate', async (req, res) => {
  try {
    const { scenarios = [] } = req.body || {};
    if (!Array.isArray(scenarios) || scenarios.length === 0) {
      return res.status(400).json({ message: 'No scenarios provided' });
    }

    const loanId = req.params.id;

    const results = await Promise.all(
      scenarios.map(async (sc, index) => {
        const extraEvents = [];
        if (sc.extraLumpSumAmount && sc.extraLumpSumDate) {
          extraEvents.push({
            loanId,
            type: 'EXTRA_PAYMENT',
            date: sc.extraLumpSumDate,
            amount: sc.extraLumpSumAmount,
          });
        }
        if (sc.newAnnualInterestRate && sc.newRateFromDate) {
          extraEvents.push({
            loanId,
            type: 'RATE_CHANGE',
            date: sc.newRateFromDate,
            newAnnualInterestRate: sc.newAnnualInterestRate,
          });
        }

        const data = await buildSchedule(loanId, { extraEvents });
        return {
          id: sc.id || String(index),
          name: sc.name || `Scenario ${String.fromCharCode(65 + index)}`,
          summary: data.summary,
          comparison: data.comparison,
        };
      })
    );

    res.json({ scenarios: results });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to run scenarios', error: err.message });
  }
});

router.post('/:id/advice', async (req, res) => {
  try {
    const { targetPayoffDate, extraPerMonth } = req.body || {};
    const loanId = req.params.id;

    if (!targetPayoffDate && !extraPerMonth) {
      return res.status(400).json({
        message: 'Provide either targetPayoffDate or extraPerMonth',
      });
    }

    const base = await buildSchedule(loanId);

    if (extraPerMonth) {
      const extra = Number(extraPerMonth);
      if (!Number.isFinite(extra) || extra <= 0) {
        return res.status(400).json({ message: 'extraPerMonth must be positive number' });
      }
      const withExtra = await buildSchedule(loanId, { extraPerMonth: extra });

      const tips = [];
      const savedInterest = withExtra.comparison.interestSaved;
      const monthsSaved = withExtra.comparison.monthsSaved;

      tips.push(
        `If you add ₹${Math.round(extra).toLocaleString('en-IN')} every month as extra principal, ` +
          `you can save about ₹${Math.round(savedInterest).toLocaleString(
            'en-IN'
          )} in interest and close roughly ${monthsSaved} EMIs earlier (vs staying on the current track).`
      );

      if (monthsSaved > 0 && base.summary.payoffDate && withExtra.summary.payoffDate) {
        tips.push(
          `Your payoff date would move from ${new Date(
            base.summary.payoffDate
          ).toLocaleDateString()} to about ${new Date(
            withExtra.summary.payoffDate
          ).toLocaleDateString()}.`
        );
      }

      return res.json({
        mode: 'extraPerMonth',
        input: { extraPerMonth: extra },
        baseSummary: base.summary,
        baseComparison: base.comparison,
        withExtraSummary: withExtra.summary,
        withExtraComparison: withExtra.comparison,
        tips,
      });
    }

    const target = new Date(targetPayoffDate);
    if (Number.isNaN(target.getTime())) {
      return res.status(400).json({ message: 'Invalid targetPayoffDate' });
    }
    if (!base.summary.payoffDate) {
      return res.status(400).json({ message: 'Base schedule has no payoff date' });
    }

    const basePayoff = new Date(base.summary.payoffDate);
    if (basePayoff <= target) {
      return res.json({
        mode: 'targetPayoffDate',
        input: { targetPayoffDate },
        baseSummary: base.summary,
        baseComparison: base.comparison,
        recommendedExtraPerMonth: 0,
        summaryWithExtra: base.summary,
        comparisonWithExtra: base.comparison,
        tips: [
          'Your current plan already pays off on or before your target date. You do not need extra EMI to hit this goal.',
        ],
      });
    }

    let low = 500; // ₹500 minimum step
    let high = base.loan.principal || 1_00_000;
    high = Math.max(high, 10_000);

    let best = null;

    for (let i = 0; i < 18; i++) {
      const mid = (low + high) / 2;
      const sim = await buildSchedule(loanId, { extraPerMonth: mid });
      const simPayoff = sim.summary.payoffDate ? new Date(sim.summary.payoffDate) : null;

      if (simPayoff && simPayoff <= target && sim.summary.remainingBalance <= 1) {
        best = { extra: mid, data: sim };
        high = mid;
      } else {
        low = mid;
      }
    }

    if (!best) {
      return res.json({
        mode: 'targetPayoffDate',
        input: { targetPayoffDate },
        baseSummary: base.summary,
        baseComparison: base.comparison,
        recommendedExtraPerMonth: null,
        summaryWithExtra: null,
        comparisonWithExtra: null,
        tips: [
          'Even with very aggressive extra EMIs, this target date is hard to reach. Consider moving the target out or planning one-time lump sum pre-payments instead.',
        ],
      });
    }

    const roundedExtra = Math.round(best.extra / 100) * 100;
    const withExtra = await buildSchedule(loanId, { extraPerMonth: roundedExtra });

    const tips = [];
    tips.push(
      `To finish around your target date, plan an extra EMI of about ₹${roundedExtra.toLocaleString(
        'en-IN'
      )} every month as pure principal.`
    );
    tips.push(
      `This would save roughly ₹${Math.round(
        withExtra.comparison.interestSaved
      ).toLocaleString('en-IN')} in interest and cut about ${
        withExtra.comparison.monthsSaved
      } EMIs compared to staying on your current track.`
    );

    return res.json({
      mode: 'targetPayoffDate',
      input: { targetPayoffDate },
      baseSummary: base.summary,
      baseComparison: base.comparison,
      recommendedExtraPerMonth: roundedExtra,
      summaryWithExtra: withExtra.summary,
      comparisonWithExtra: withExtra.comparison,
      tips,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to generate advice', error: err.message });
  }
});

module.exports = router;
