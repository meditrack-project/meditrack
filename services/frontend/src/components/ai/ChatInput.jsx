import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import './ChatInput.css';

function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('');
  const [days, setDays] = useState(7);

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSend(text.trim(), days);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="chat-input-area">
      <textarea className="chat-text-input" placeholder="Ask about your health..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} rows={1} />
      <select className="chat-days-select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
        <option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option>
      </select>
      <button className="chat-send-btn" onClick={handleSend} disabled={!text.trim() || loading}><FiSend size={16} /></button>
    </div>
  );
}

export default ChatInput;
