import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import './ChatWindow.css';

function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="chat-window">
        <div className="chat-empty">
          <div className="chat-empty-icon">🤖</div>
          <h3>Hi! I&apos;m your MediTrack AI assistant.</h3>
          <p>I analyze your real health data to give personalized insights. Try a quick action above or ask me anything below!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.map((msg, i) => <ChatBubble key={i} message={msg} />)}
      {loading && <ChatBubble message={{ type: 'loading' }} />}
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;
