const express = require('express');
const Loan = require('../models/Loan');
const LoanEvent = require('../models/LoanEvent');
const { buildSchedule } = require('../services/amortizationService');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, principal, annualInterestRate, termMonths, startDate } = req.body;
    const loan = await Loan.create({
      name,
      principal,
      annualInterestRate,
      termMonths,
      startDate,
    });
    res.status(201).json(loan);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create loan', error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list loans', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
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
    const loan = await Loan.findById(loanId);
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

module.exports = router;

