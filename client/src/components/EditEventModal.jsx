import { useState, useRef, useEffect } from 'react';

const EditEventModal = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: event?.type || 'EXTRA_PAYMENT',
    date: event?.date ? event.date.split('T')[0] : '',
    amount: event?.amount || '',
    newAnnualInterestRate: event?.newAnnualInterestRate || '',
    note: event?.note || '',
  });

  const typeMenuRef = useRef(null);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target)) {
        setTypeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className="dropdown" ref={typeMenuRef}>
              <button
                type="button"
                className="dropdown-trigger"
                onClick={() => setTypeMenuOpen((open) => !open)}
                aria-expanded={typeMenuOpen}
              >
                <span>
                  {formData.type === 'EXTRA_PAYMENT' ? 'Extra Payment' : 'Rate Change'}
                </span>
                <span className="dropdown-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              {typeMenuOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-label">Event Type</div>
                  <button
                    type="button"
                    className={`dropdown-item${formData.type === 'EXTRA_PAYMENT' ? ' dropdown-item-active' : ''}`}
                    style={{ '--item-index': 0 }}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, type: 'EXTRA_PAYMENT' }));
                      setTypeMenuOpen(false);
                    }}
                  >
                    <div className="dropdown-item-main">Extra Payment</div>
                  </button>
                  <button
                    type="button"
                    className={`dropdown-item${formData.type === 'RATE_CHANGE' ? ' dropdown-item-active' : ''}`}
                    style={{ '--item-index': 1 }}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, type: 'RATE_CHANGE' }));
                      setTypeMenuOpen(false);
                    }}
                  >
                    <div className="dropdown-item-main">Rate Change</div>
                  </button>
                </div>
              )}
            </div>
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
