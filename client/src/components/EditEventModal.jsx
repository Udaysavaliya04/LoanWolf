import { useState } from 'react';

const EditEventModal = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: event?.type || 'EXTRA_PAYMENT',
    date: event?.date ? event.date.split('T')[0] : '',
    amount: event?.amount || '',
    newAnnualInterestRate: event?.newAnnualInterestRate || '',
    note: event?.note || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, _id: event._id });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content panel">
        <div className="panel-header">
          <h2>Edit Event</h2>
          <button type="button" className="close-btn" onClick={onCancel}>
            &times;
          </button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="select-input">
              <option value="EXTRA_PAYMENT">Extra Payment</option>
              <option value="RATE_CHANGE">Rate Change</option>
            </select>
          </div>

          {formData.type === 'EXTRA_PAYMENT' && (
            <div className="form-row">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
          )}

          {formData.type === 'RATE_CHANGE' && (
            <div className="form-row">
              <label>New Rate (%)</label>
              <input
                type="number"
                name="newAnnualInterestRate"
                value={formData.newAnnualInterestRate}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>
          )}
           
           <div className="form-row">
             <label>Note (Optional)</label>
             <input
               type="text"
               name="note"
               value={formData.note}
               onChange={handleChange}
               placeholder="Description..."
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

export default EditEventModal;
