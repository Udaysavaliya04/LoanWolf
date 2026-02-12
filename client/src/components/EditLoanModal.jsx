import { useState } from 'react';

const EditLoanModal = ({ loan, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: loan?.name || '',
    principal: loan?.principal || '',
    annualInterestRate: loan?.annualInterestRate || '',
    termMonths: loan?.termMonths || '',
    startDate: loan?.startDate ? loan.startDate.split('T')[0] : '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, _id: loan._id });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content panel">
        <div className="panel-header">
          <h2>Edit Loan</h2>
          <button type="button" className="close-btn" onClick={onCancel}>
            &times;
          </button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Loan Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label>Principal Amount</label>
            <input
              type="number"
              name="principal"
              value={formData.principal}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          <div className="form-row">
            <label>Annual Interest Rate (%)</label>
            <input
              type="number"
              name="annualInterestRate"
              value={formData.annualInterestRate}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-row">
            <label>Term (Months)</label>
            <input
              type="number"
              name="termMonths"
              value={formData.termMonths}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          <div className="form-row">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="secondary-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLoanModal;
