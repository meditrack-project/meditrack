import { GiMedicines } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import './TodayMedications.css';

function TodayMedications({ data, onMarkTaken, onMarkSkipped, loading }) {
  if (!data) return null;

  const { total, taken_count, adherence_today, logs } = data;

  return (
    <div className="today-meds">
      <div className="today-meds-header">
        <h3>Today&apos;s Medications</h3>
        <div className="today-progress">
          <div className="today-progress-bar">
            <div className="today-progress-fill" style={{ width: `${adherence_today}%` }} />
          </div>
          <span>{taken_count}/{total}</span>
        </div>
      </div>

      {logs && logs.length > 0 ? (
        <div className="today-med-list">
          {logs.map((log) => (
            <div key={log.log_id} className={`today-med-item ${log.taken ? 'taken' : ''}`}>
              <div className="today-med-info">
                <div className="today-med-icon">
                  <GiMedicines size={18} />
                </div>
                <div>
                  <div className="today-med-name">{log.medication.name}</div>
                  <div className="today-med-dosage">
                    {log.medication.dosage}
                    {log.medication.time_of_day && ` · ${log.medication.time_of_day}`}
                  </div>
                </div>
              </div>
              <button
                className={`today-med-take-btn ${log.taken ? 'taken-btn' : 'take-btn'}`}
                onClick={() => log.taken ? onMarkSkipped(log.log_id) : onMarkTaken(log.log_id)}
                disabled={loading}
              >
                {log.taken ? '✅ Taken' : 'Mark Taken'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="today-empty">
          No medications for today. <Link to="/medications">Add one</Link>
        </div>
      )}
    </div>
  );
}

export default TodayMedications;
