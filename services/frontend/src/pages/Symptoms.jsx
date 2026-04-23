import { useState, useEffect } from 'react';
import Sidebar from '../components/shared/Sidebar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import SymptomLogger from '../components/symptoms/SymptomLogger';
import SymptomHistory from '../components/symptoms/SymptomHistory';
import Modal from '../components/shared/Modal';
import { healthApi } from '../lib/axios';
import './Symptoms.css';

function Symptoms() {
  const [todayLog, setTodayLog] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchAll = async () => {
    try {
      const [todayRes, allRes] = await Promise.all([
        healthApi.get('/api/symptoms/today'),
        healthApi.get('/api/symptoms?days=365'),
      ]);
      if (todayRes.data.success) setTodayLog(todayRes.data.data);
      if (allRes.data.success) setSymptoms(allRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (data) => {
    setSaving(true);
    try { await healthApi.post('/api/symptoms', data); await fetchAll(); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleEdit = (log) => { setEditLog(log); setEditModalOpen(true); };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editLog) return;
    setSaving(true);
    try {
      await healthApi.put(`/api/symptoms/${editLog.id}`, {
        symptoms: editLog.symptoms, severity: editLog.severity,
        mood: editLog.mood, energy: editLog.energy, notes: editLog.notes,
      });
      setEditModalOpen(false); setEditLog(null); await fetchAll();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await healthApi.delete(`/api/symptoms/${id}`); await fetchAll(); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header"><h1>Symptom Journal</h1></div>
        {loading ? <LoadingSpinner /> : (
          <div className="symptoms-page">
            <SymptomLogger todayLog={todayLog} onSubmit={handleSubmit} onEdit={handleEdit} loading={saving} />
            <SymptomHistory symptoms={symptoms} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}

        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Symptom Log">
          {editLog && (
            <form onSubmit={handleEditSubmit}>
              <div className="form-group"><label>Mood (1-10)</label>
                <input type="number" min="1" max="10" value={editLog.mood || ''} onChange={(e) => setEditLog({ ...editLog, mood: Number(e.target.value) })} />
              </div>
              <div className="form-group"><label>Energy (1-10)</label>
                <input type="number" min="1" max="10" value={editLog.energy || ''} onChange={(e) => setEditLog({ ...editLog, energy: Number(e.target.value) })} />
              </div>
              <div className="form-group"><label>Severity (1-10)</label>
                <input type="number" min="1" max="10" value={editLog.severity || ''} onChange={(e) => setEditLog({ ...editLog, severity: Number(e.target.value) })} />
              </div>
              <div className="form-group"><label>Notes</label>
                <textarea value={editLog.notes || ''} onChange={(e) => setEditLog({ ...editLog, notes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
              </div>
            </form>
          )}
        </Modal>
      </main>
    </div>
  );
}

export default Symptoms;
