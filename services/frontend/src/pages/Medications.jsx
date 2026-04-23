import { useState, useEffect } from 'react';
import Sidebar from '../components/shared/Sidebar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Modal from '../components/shared/Modal';
import MedicationCard from '../components/medications/MedicationCard';
import MedicationForm from '../components/medications/MedicationForm';
import TodayMedications from '../components/medications/TodayMedications';
import AdherenceChart from '../components/medications/AdherenceChart';
import { medicalApi } from '../lib/axios';
import './Medications.css';

function Medications() {
  const [medications, setMedications] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [medsRes, todayRes] = await Promise.all([
        medicalApi.get('/api/medications'),
        medicalApi.get('/api/medications/logs/today'),
      ]);
      if (medsRes.data.success) setMedications(medsRes.data.data);
      if (todayRes.data.success) setTodayData(todayRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editMed) { await medicalApi.put(`/api/medications/${editMed.id}`, data); }
      else { await medicalApi.post('/api/medications', data); }
      setModalOpen(false); setEditMed(null); await fetchAll();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await medicalApi.delete(`/api/medications/${id}`); await fetchAll(); }
    catch (err) { console.error(err); }
  };

  const handleEdit = (med) => { setEditMed(med); setModalOpen(true); };

  const handleMarkTaken = async (logId) => {
    setActionLoading(true);
    try { await medicalApi.put(`/api/medications/logs/${logId}/taken`); await fetchAll(); }
    catch (err) { console.error(err); } finally { setActionLoading(false); }
  };

  const handleMarkSkipped = async (logId) => {
    setActionLoading(true);
    try { await medicalApi.put(`/api/medications/logs/${logId}/skipped`); await fetchAll(); }
    catch (err) { console.error(err); } finally { setActionLoading(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>My Medications</h1>
          <button className="btn-primary" onClick={() => { setEditMed(null); setModalOpen(true); }}>+ Add Medication</button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="medications-page">
            <TodayMedications data={todayData} onMarkTaken={handleMarkTaken} onMarkSkipped={handleMarkSkipped} loading={actionLoading} />

            {medications.length > 0 ? (
              <div className="med-grid">
                {medications.map((med) => (
                  <MedicationCard key={med.id} medication={med} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="med-empty"><p>No medications yet. Add your first one!</p><button className="btn-primary" onClick={() => setModalOpen(true)}>+ Add Medication</button></div>
            )}

            <AdherenceChart />
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditMed(null); }} title={editMed ? 'Edit Medication' : 'Add Medication'}>
          <MedicationForm medication={editMed} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditMed(null); }} loading={saving} />
        </Modal>
      </main>
    </div>
  );
}

export default Medications;
