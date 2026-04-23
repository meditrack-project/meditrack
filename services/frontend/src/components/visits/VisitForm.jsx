import { useState, useEffect } from 'react';
import './VisitForm.css';

const SPECIALTIES = ['General Physician','Cardiologist','Endocrinologist','Neurologist','Orthopedic','Dermatologist','Psychiatrist','Other'];

function VisitForm({ visit, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    doctor_name: '', specialty: '', visit_date: new Date().toISOString().split('T')[0],
    reason: '', diagnosis: '', prescription: '', follow_up: '', notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (visit) setForm({
      doctor_name: visit.doctor_name || '', specialty: visit.specialty || '',
      visit_date: visit.visit_date || '', reason: visit.reason || '',
      diagnosis: visit.diagnosis || '', prescription: visit.prescription || '',
      follow_up: visit.follow_up || '', notes: visit.notes || '',
    });
  }, [visit]);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.doctor_name || !form.visit_date) { setError('Doctor name and visit date are required'); return; }
    const data = { ...form };
    Object.keys(data).forEach((k) => { if (!data[k]) delete data[k]; });
    onSubmit(data);
  };

  return (
    <form className="visit-form" onSubmit={handleSubmit}>
      {error && <div className="error-box">{error}</div>}
      <div className="form-row">
        <div className="form-group"><label>Doctor Name *</label><input name="doctor_name" value={form.doctor_name} onChange={handleChange} /></div>
        <div className="form-group"><label>Specialty</label>
          <select name="specialty" value={form.specialty} onChange={handleChange}>
            <option value="">Select...</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Visit Date *</label><input type="date" name="visit_date" value={form.visit_date} onChange={handleChange} /></div>
        <div className="form-group"><label>Follow-up Date</label><input type="date" name="follow_up" value={form.follow_up} onChange={handleChange} /></div>
      </div>
      <div className="form-group"><label>Reason</label><textarea name="reason" value={form.reason} onChange={handleChange} /></div>
      <div className="form-group"><label>Diagnosis</label><textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} /></div>
      <div className="form-group"><label>Prescription</label><textarea name="prescription" value={form.prescription} onChange={handleChange} /></div>
      <div className="form-group"><label>Notes</label><textarea name="notes" value={form.notes} onChange={handleChange} /></div>
      <div className="visit-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : (visit ? 'Update' : 'Add Visit')}</button>
      </div>
    </form>
  );
}

export default VisitForm;
