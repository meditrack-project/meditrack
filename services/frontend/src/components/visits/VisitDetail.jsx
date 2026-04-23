import './VisitDetail.css';

function VisitDetail({ visit, onEdit, onClose }) {
  if (!visit) return null;
  const fields = [
    ['Doctor', visit.doctor_name], ['Specialty', visit.specialty], ['Visit Date', visit.visit_date],
    ['Reason', visit.reason], ['Diagnosis', visit.diagnosis], ['Prescription', visit.prescription],
    ['Follow-up', visit.follow_up], ['Notes', visit.notes],
  ];
  return (
    <div className="visit-detail-grid">
      {fields.map(([label, value]) => value ? (
        <div key={label} className="visit-detail-row">
          <div className="visit-detail-label">{label}</div>
          <div className="visit-detail-value">{value}</div>
        </div>
      ) : null)}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button className="btn-primary" onClick={() => onEdit(visit)}>Edit</button>
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default VisitDetail;
