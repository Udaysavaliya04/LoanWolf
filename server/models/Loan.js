const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    principal: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true }, 
    termMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', LoanSchema);

