import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const WELCOME = { role: 'bot', content: "Hi! I'm **CampusBot** 👋\n\nI can help you with:\n• Certificate requirements\n• Processing times\n• Office hours\n• Any campus admin question\n\nWhat do you need help with?" };

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.filter(m => m.role !== 'bot' || m !== WELCOME).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      }));

      const { data } = await axios.post('/api/chat', { message: msg, history });
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: '⚠️ Sorry, I\'m having trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  const quickQuestions = [
    'Bonafide Certificate docs?',
    'How long for TC?',
    'Office hours?',
  ];

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-window" style={{ height: 430 }}>
          <div className="chat-header">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div className="chat-header-info">
              <h4>CampusBot</h4>
              <p>AI-powered campus assistant</p>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6,
                color: 'white', cursor: 'pointer', padding: '4px 8px', fontSize: 14 }}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role === 'bot' ? 'bot' : 'user'}`}>
                <div className="chat-msg-bubble"
                  dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <div className="chat-msg-bubble" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ animation: 'pulse 1s infinite', animationDelay: '0s' }}>●</span>
                  <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.2s' }}>●</span>
                  <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.4s' }}>●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {quickQuestions.map(q => (
                <button key={q} onClick={() => { setInput(q); }}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20,
                    border: '1px solid var(--border)', background: 'white', cursor: 'pointer',
                    color: 'var(--primary)', fontWeight: 500, transition: 'all 0.15s' }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={sendMessage} className="chat-input-area">
            <input
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about certificates, documents..."
              disabled={loading}
            />
            <button type="submit" className="chat-send" disabled={!input.trim() || loading}>
              ➤
            </button>
          </form>
        </div>
      )}
      <button className="chat-bubble" onClick={() => setOpen(!open)}>
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default ChatWidget;
