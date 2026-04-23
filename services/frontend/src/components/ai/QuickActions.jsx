import LoadingSpinner from '../shared/LoadingSpinner';
import './QuickActions.css';

const actions = [
  { id: 'weekly', label: 'Weekly Report', icon: '📊' },
  { id: 'medication', label: 'Medication Check', icon: '💊' },
  { id: 'symptom', label: 'Symptom Analysis', icon: '🩺' },
  { id: 'summary', label: 'Last 7 Days', icon: '📅' },
];

function QuickActions({ onAction, loading, activeAction }) {
  return (
    <div className="quick-actions">
      {actions.map((a) => (
        <button key={a.id} className="quick-action-btn" onClick={() => onAction(a.id)} disabled={loading}>
          <span className="qa-icon">{a.icon}</span>
          {loading && activeAction === a.id ? <LoadingSpinner small /> : a.label}
        </button>
      ))}
    </div>
  );
}

export default QuickActions;
