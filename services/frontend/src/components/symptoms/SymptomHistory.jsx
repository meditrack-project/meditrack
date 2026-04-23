import { useState } from 'react';
import TrendChart from './TrendChart';
import './SymptomHistory.css';

function SymptomHistory({ symptoms, onEdit, onDelete }) {
  const [tab, setTab] = useState('week');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);

  const weekLogs = symptoms.filter((s) => new Date(s.date) >= weekAgo);
  const monthLogs = symptoms.slice(0, 30);

  const totalPages = Math.ceil(symptoms.length / perPage);
  const paginatedLogs = symptoms.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="symptom-history">
      <div className="history-tabs">
        <button className={`history-tab ${tab === 'week' ? 'active' : ''}`} onClick={() => setTab('week')}>This Week</button>
        <button className={`history-tab ${tab === 'month' ? 'active' : ''}`} onClick={() => setTab('month')}>Last 30 Days</button>
        <button className={`history-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All History</button>
      </div>

      {tab === 'week' && (
        <div className="history-cards">
          {weekLogs.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', padding: '20px 0' }}>No logs this week.</p>
          ) : weekLogs.map((log) => (
            <div key={log.id} className="history-card">
              <div className="history-card-date">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              <div className="history-card-symptoms">
                {log.symptoms.map((s) => <span key={s} className="badge badge-primary">{s}</span>)}
              </div>
              <div className="history-card-scores">
                <span>😊 Mood: {log.mood || '-'}/10</span>
                <span>⚡ Energy: {log.energy || '-'}/10</span>
                <span>🔥 Severity: {log.severity || '-'}/10</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'month' && <TrendChart />}

      {tab === 'all' && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th><th>Symptoms</th><th>Mood</th><th>Energy</th><th>Severity</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td>{log.symptoms.join(', ')}</td>
                    <td>{log.mood || '-'}</td>
                    <td>{log.energy || '-'}</td>
                    <td>{log.severity || '-'}</td>
                    <td>
                      <div className="history-actions">
                        <button className="med-edit-btn" onClick={() => onEdit(log)}>Edit</button>
                        <button className="med-delete-btn" onClick={() => onDelete(log.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SymptomHistory;
