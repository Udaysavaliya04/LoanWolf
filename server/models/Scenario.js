const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema(
  {
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    lumpSumAmount: { type: Number, required: true },
    lumpSumDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scenario', ScenarioSchema);
