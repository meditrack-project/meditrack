import { useNavigate } from 'react-router-dom';
import './QuickActionsBar.css';

function QuickActionsBar() {
  const navigate = useNavigate();
  return (
    <div className="quick-actions-bar">
      <button className="qa-bar-btn" onClick={() => navigate('/medications')}>💊 Add Medication</button>
      <button className="qa-bar-btn" onClick={() => navigate('/symptoms')}>🩺 Log Symptoms</button>
      <button className="qa-bar-btn" onClick={() => navigate('/visits')}>🏥 Add Visit</button>
      <button className="qa-bar-btn" onClick={() => navigate('/ai')}>🤖 Ask AI</button>
    </div>
  );
}

export default QuickActionsBar;
