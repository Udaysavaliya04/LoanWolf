const mongoose = require('mongoose');

const LoanEventSchema = new mongoose.Schema(
  {
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ['EXTRA_PAYMENT', 'RATE_CHANGE'],
      required: true,
    },
    amount: { type: Number }, 
    newAnnualInterestRate: { type: Number }, 
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoanEvent', LoanEventSchema);

