import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const SupportPage = () => {
  const [amount, setAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const upiId = "udaysavaliya2004@oksbi"; 
  const payeeName = "Uday Savaliya";
  
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR&am=${amount}`;

  const handlePresetClick = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^[0-9\b]+$/.test(val)) {
      setCustomAmount(val);
      setAmount(val || '0'); 
    }
  };

  return (
    <div className="auth-shell">
      <button type="button" className="support-back-home" onClick={() => { window.scrollTo(0, 0); navigate(-1); }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 1 }}><path fill="none" d="M5 12h14M5 12l6 6m-6-6l6-6"/></svg>
         Return to home
      </button>

      <div className="auth-card auth-card-gradient support-card animate-blur-in">
        <div className="support-content-grid">
          
          <div className="support-header-left">
            <h2 className="animate-blur-in delay-100" style={{ fontFamily: 'Bricolage Grotesque', fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Fuel this <span className="text-gradient-gold">platform</span>
            </h2>
            <p className="muted animate-blur-in delay-200 support-subtitle">
            My primary focus of building loanwolf was never to earn money through subscription, ads or any other means but to help people to take control of their debt and save their hard-earned money.<br></br><br></br> If this tool has helped you by any means consider buying me a coffee. <br></br><br></br>Your support means the world to me. Thank you for keeping this platform running.
          </p>

            <div className="support-presets-row animate-blur-in delay-300">
              {['50', '100', '200', '500'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`secondary-btn ${amount === preset && customAmount === '' ? 'glow-btn' : ''}`}
                  style={{padding: '0.6rem 1rem' }}
                  onClick={() => handlePresetClick(preset)}
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            <div className="auth-form support-form-wrapper animate-blur-in delay-400">
              <div className="form-row" style={{ marginBottom: 0 }}>
                <div style={{ position: 'relative' }}>
                  <span style={{  position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>₹</span>
                  <input 
                    type="text" 
                    placeholder="Custom Amount" 
                    value={customAmount}
                    onChange={handleCustomChange}
                    style={{ paddingLeft: '2rem', fontSize: '1.1rem', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel support-glass-panel animate-blur-in delay-500" style={{ padding: '2rem 1.5rem', borderRadius: '1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'inline-block' }}>
                <QRCodeSVG 
                  value={upiLink} 
                  size={180} 
                  bgColor={"#ffffff"} 
                  fgColor={"#000000ff"} 
                  level={"Q"} 
                  includeMargin={false}
                />
              </div>
              <p className="muted" style={{ fontWeight: '500', fontSize: '0.9rem', textAlign: 'center' }}>
                Scan with any UPI app to send me <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>₹{amount}</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SupportPage;
