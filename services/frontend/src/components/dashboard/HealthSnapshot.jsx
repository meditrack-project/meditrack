import './HealthSnapshot.css';

const getMoodEmoji = (val) => { if (!val) return '—'; if (val <= 3) return '😞'; if (val <= 5) return '😕'; if (val <= 7) return '😐'; if (val <= 9) return '🙂'; return '😊'; };

function HealthSnapshot({ todaySymptom, todayMeds, nextFollowup }) {
  const mood = todaySymptom?.mood;
  const energy = todaySymptom?.energy;
  const taken = todayMeds?.taken_count || 0;
  const total = todayMeds?.total || 0;
  const adherence = todayMeds?.adherence_today || 0;

  return (
    <div className="health-snapshot">
      <div className="snapshot-card">
        <div className="snapshot-icon">{getMoodEmoji(mood)}</div>
        <div className="snapshot-value">{mood || '—'}</div>
        <div className="snapshot-label">Today&apos;s Mood</div>
        {!mood && <div className="snapshot-sub">Not logged today</div>}
      </div>

      <div className="snapshot-card">
        <div className="snapshot-icon">⚡</div>
        <div className="snapshot-value">{energy ? `${energy}/10` : '—'}</div>
        <div className="snapshot-label">Today&apos;s Energy</div>
        <div className="snapshot-progress">
          <div className="snapshot-progress-fill" style={{ width: `${(energy || 0) * 10}%` }} />
        </div>
      </div>

      <div className="snapshot-card">
        <div className="snapshot-circle" style={{ borderColor: adherence > 50 ? 'var(--color-success)' : 'var(--color-warning)' }}>
          <span className="snapshot-circle-value">{Math.round(adherence)}%</span>
        </div>
        <div className="snapshot-value">{taken}/{total}</div>
        <div className="snapshot-label">Medications Today</div>
      </div>

      <div className="snapshot-card">
        <div className="snapshot-icon">🏥</div>
        {nextFollowup ? (
          <>
            <div className="snapshot-value" style={{ fontSize: '1rem' }}>{nextFollowup.doctor_name}</div>
            <div className="snapshot-label">{nextFollowup.follow_up}</div>
            <div className="snapshot-sub">in {Math.max(0, Math.ceil((new Date(nextFollowup.follow_up) - new Date()) / 86400000))} days</div>
          </>
        ) : (
          <>
            <div className="snapshot-value">—</div>
            <div className="snapshot-sub">No upcoming</div>
          </>
        )}
      </div>
    </div>
  );
}

export default HealthSnapshot;
