import { useState } from 'react';
import './VisitCard.css';

function VisitCard({ visit, onView, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const d = new Date(visit.visit_date);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();

  return (
    <div className="visit-card">
      <div className="visit-date-box">
        <div className="visit-date-month">{month}</div>
        <div className="visit-date-day">{day}</div>
        <div className="visit-date-year">{year}</div>
      </div>
      <div className="visit-info">
        <div className="visit-doctor">{visit.doctor_name}</div>
        {visit.specialty && <span className="badge badge-primary">{visit.specialty}</span>}
        {visit.reason && <div className="visit-detail" style={{ marginTop: '6px' }}>Reason: {visit.reason}</div>}
        {visit.diagnosis && <div className="visit-detail">Diagnosis: {visit.diagnosis}</div>}
        {visit.follow_up && <div className="visit-detail">Follow-up: {visit.follow_up}</div>}
        <div className="visit-card-actions">
          <button className="med-edit-btn" onClick={() => onView(visit)}>View</button>
          <button className="med-edit-btn" onClick={() => onEdit(visit)}>Edit</button>
          {confirmDelete ? (
            <>
              <button className="med-delete-btn" onClick={() => { onDelete(visit.id); setConfirmDelete(false); }}>Confirm</button>
              <button className="med-edit-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </>
          ) : (
            <button className="med-delete-btn" onClick={() => setConfirmDelete(true)}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisitCard;
