import './ChatBubble.css';

function ChatBubble({ message }) {
  const { type, content, timestamp } = message;
  const time = timestamp ? new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

  if (type === 'loading') {
    return (
      <div className="chat-bubble ai">
        <div className="chat-avatar">🤖</div>
        <div className="chat-msg">
          <div className="chat-msg-label">MediTrack AI is thinking...</div>
          <div className="chat-msg-content"><div className="typing-dots"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div></div>
        </div>
      </div>
    );
  }

  if (type === 'user') {
    return (
      <div className="chat-bubble user">
        <div className="chat-msg">
          <div className="chat-msg-content">{content}</div>
          <div className="chat-time" style={{ textAlign: 'right' }}>{time}</div>
        </div>
      </div>
    );
  }

  const bubbleClass = type === 'error' ? 'error' : type === 'rate-limit' ? 'rate-limit' : '';

  return (
    <div className={`chat-bubble ai ${bubbleClass}`}>
      <div className="chat-avatar">🤖</div>
      <div className="chat-msg">
        <div className="chat-msg-label">MediTrack AI</div>
        <div className="chat-msg-content">{content}</div>
        <div className="chat-time">{time}</div>
      </div>
    </div>
  );
}

export default ChatBubble;
