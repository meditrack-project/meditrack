import { useState, useEffect } from 'react';
import './MedicationForm.css';

const FREQUENCIES = [
  'once daily', 'twice daily', 'three times daily',
  'every 6 hours', 'every 8 hours', 'weekly', 'as needed',
];
const TIMES = ['morning', 'afternoon', 'evening', 'night', 'multiple'];

function MedicationForm({ medication, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: 'once daily', time_of_day: '',
    start_date: new Date().toISOString().split('T')[0], end_date: '', notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (medication) {
      setForm({
        name: medication.name || '',
        dosage: medication.dosage || '',
        frequency: medication.frequency || 'once daily',
        time_of_day: medication.time_of_day || '',
        start_date: medication.start_date || '',
        end_date: medication.end_date || '',
        notes: medication.notes || '',
      });
    }
  }, [medication]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.start_date) {
      setError('Name, dosage, and start date are required');
      return;
    }
    const data = { ...form };
    if (!data.time_of_day) delete data.time_of_day;
    if (!data.end_date) delete data.end_date;
    if (!data.notes) delete data.notes;
    onSubmit(data);
  };

  return (
    <form className="med-form" onSubmit={handleSubmit}>
      {error && <div className="error-box">{error}</div>}
      <div className="form-group">
        <label>Medication Name *</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Aspirin" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Dosage *</label>
          <input name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 100mg" />
        </div>
        <div className="form-group">
          <label>Frequency *</label>
          <select name="frequency" value={form.frequency} onChange={handleChange}>
            {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Time of Day</label>
          <select name="time_of_day" value={form.time_of_day} onChange={handleChange}>
            <option value="">Select...</option>
            {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Start Date *</label>
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
        </div>
      </div>
      <div className="form-group">
        <label>End Date</label>
        <input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes..." />
      </div>
      <div className="med-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (medication ? 'Update' : 'Add Medication')}
        </button>
      </div>
    </form>
  );
}

export default MedicationForm;
