import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SUGGESTED_QUESTIONS = [
  "How can I be debt-free by 2030?",
  "Which loan should I pay off first?",
  "Analyze my current interest rates.",
  "What if I pay ₹5k extra monthly?"
];

export default function WolfAIChat({ currentUser, contextData }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hello **${currentUser?.name || 'there'}**! 🐺\nI'm WolfAI, your personal debt strategist.\n\nAsk me anything about your loans, payoff plans, or "what-if" scenarios.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const hasFetchedHistory = useRef(false);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only scroll if we have messages or just loaded history
    // Timeout ensures DOM update before scroll
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  // Load history on mount
  useEffect(() => {
    if (hasFetchedHistory.current) return;
    hasFetchedHistory.current = true;

    async function loadHistory() {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${API_BASE}/api/advisor/chat`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            // Map backend structure to frontend
            const formatted = data.messages.map(m => ({
              role: m.role,
              text: m.content
            }));
            setMessages(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    }
    loadHistory();
  }, []);

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${API_BASE}/api/advisor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          message: text,
          contextData // Pass the active view context
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to fetch response');

      const aiMsg = { role: 'assistant', text: data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `**Error**: ${err.message}. Please check your connection or API key.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wolf-chat-container">
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
            <div className="bubble-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble ai">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="suggestions-grid">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button key={i} className="suggestion-chip" onClick={() => handleSend(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-area">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="chat-form"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask WolfAI..."
            disabled={loading}
          />
          <button type="submit" className="primary-btn send-btn" disabled={loading || !input.trim()}>
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
