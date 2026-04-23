import { Link } from 'react-router-dom';
import './UpcomingFollowups.css';

function UpcomingFollowups({ visits }) {
  const upcoming = (visits || []).slice(0, 3);

  const getDaysClass = (followUp) => {
    const d = Math.max(0, Math.ceil((new Date(followUp) - new Date()) / 86400000));
    if (d < 3) return 'days-red';
    if (d <= 7) return 'days-amber';
    return 'days-green';
  };

  return (
    <div className="upcoming-followups">
      <h3>Upcoming Follow-ups</h3>
      {upcoming.length > 0 ? (
        <>
          <div className="upcoming-list">
            {upcoming.map((v) => {
              const daysUntil = Math.max(0, Math.ceil((new Date(v.follow_up) - new Date()) / 86400000));
              return (
                <div key={v.id} className="upcoming-card">
                  <div className="upcoming-info">
                    <div>
                      <div className="upcoming-doctor">{v.doctor_name}</div>
                      {v.specialty && <span className="badge badge-primary">{v.specialty}</span>}
                    </div>
                  </div>
                  <span className={`upcoming-days ${getDaysClass(v.follow_up)}`}>in {daysUntil} days</span>
                </div>
              );
            })}
          </div>
          <Link to="/visits" className="upcoming-link">View All Visits →</Link>
        </>
      ) : (
        <div className="upcoming-empty">No upcoming follow-ups 🎉</div>
      )}
    </div>
  );
}

export default UpcomingFollowups;
