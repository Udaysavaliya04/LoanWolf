const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    principal: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true }, // percentage, e.g. 10.5
    termMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', LoanSchema);

