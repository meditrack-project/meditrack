import { useState } from 'react';
import Sidebar from '../components/shared/Sidebar';
import QuickActions from '../components/ai/QuickActions';
import ChatWindow from '../components/ai/ChatWindow';
import ChatInput from '../components/ai/ChatInput';
import { aiApi } from '../lib/axios';
import './AIInsights.css';

function AIInsights() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const addMessage = (msg) => setMessages((prev) => [...prev, { ...msg, timestamp: new Date().toISOString() }]);

  const handleAiRequest = async (endpoint, userLabel, body = {}) => {
    setLoading(true);
    addMessage({ type: 'user', content: userLabel });
    try {
      const res = await aiApi.post(endpoint, body);
      if (res.data.success) {
        addMessage({ type: 'ai', content: res.data.data.response });
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 429) {
        addMessage({ type: 'rate-limit', content: detail?.message || 'Rate limit exceeded.' });
      } else {
        addMessage({ type: 'error', content: detail?.message || 'Something went wrong.' });
      }
    } finally { setLoading(false); setActiveAction(null); }
  };

  const handleQuickAction = (id) => {
    setActiveAction(id);
    if (id === 'weekly') handleAiRequest('/api/ai/weekly-report', '📊 Weekly report');
    else if (id === 'medication') handleAiRequest('/api/ai/medication-summary', '💊 Medication check', { days: 30 });
    else if (id === 'symptom') handleAiRequest('/api/ai/symptom-analysis', '🩺 Symptom analysis', { days: 14 });
    else if (id === 'summary') handleAiRequest('/api/ai/insights', '📅 Last 7 days', { question: 'Summarize my health for last 7 days', days: 7 });
  };

  const handleSend = (text, days) => handleAiRequest('/api/ai/insights', text, { question: text, days });

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>AI Health Assistant 🤖</h1>
            <p className="ai-header-sub">Powered by Google Gemini · Analyzes your real health data</p>
          </div>
        </div>
        <div className="ai-page">
          <QuickActions onAction={handleQuickAction} loading={loading} activeAction={activeAction} />
          <ChatWindow messages={messages} loading={loading} />
          <ChatInput onSend={handleSend} loading={loading} />
        </div>
      </main>
    </div>
  );
}

export default AIInsights;
