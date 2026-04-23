import { useState } from 'react';
import './MedicationCard.css';

function MedicationCard({ medication, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(medication.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="med-card">
      <div className="med-card-header">
        <span className="med-card-name">{medication.name}</span>
        {medication.time_of_day && (
          <span className="med-card-time">{medication.time_of_day}</span>
        )}
      </div>
      <div className="med-card-details">
        {medication.dosage} — {medication.frequency}
      </div>
      <div className="med-card-dates">
        {medication.start_date} / {medication.end_date || 'Ongoing'}
      </div>
      {medication.notes && (
        <div className="med-card-notes">{medication.notes}</div>
      )}
      <div className="med-card-actions">
        <button className="med-edit-btn" onClick={() => onEdit(medication)}>Edit</button>
        {confirmDelete ? (
          <div className="delete-confirm">
            <span>Sure?</span>
            <button className="med-delete-btn" onClick={handleDelete}>Yes</button>
            <button className="med-edit-btn" onClick={() => setConfirmDelete(false)}>No</button>
          </div>
        ) : (
          <button className="med-delete-btn" onClick={handleDelete}>Delete</button>
        )}
      </div>
    </div>
  );
}

export default MedicationCard;
