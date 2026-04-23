import { useState, useEffect } from 'react';
import Sidebar from '../components/shared/Sidebar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Modal from '../components/shared/Modal';
import VisitCard from '../components/visits/VisitCard';
import VisitForm from '../components/visits/VisitForm';
import VisitDetail from '../components/visits/VisitDetail';
import { healthApi } from '../lib/axios';
import './Visits.css';

function Visits() {
  const [visits, setVisits] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editVisit, setEditVisit] = useState(null);
  const [viewVisit, setViewVisit] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const [visitsRes, upcomingRes] = await Promise.all([
        healthApi.get('/api/visits'),
        healthApi.get('/api/visits/upcoming'),
      ]);
      if (visitsRes.data.success) setVisits(visitsRes.data.data);
      if (upcomingRes.data.success) setUpcoming(upcomingRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editVisit) { await healthApi.put(`/api/visits/${editVisit.id}`, data); }
      else { await healthApi.post('/api/visits', data); }
      setFormModalOpen(false); setEditVisit(null); await fetchAll();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await healthApi.delete(`/api/visits/${id}`); await fetchAll(); }
    catch (err) { console.error(err); }
  };

  const handleView = (v) => { setViewVisit(v); setDetailModalOpen(true); };
  const handleEdit = (v) => { setEditVisit(v); setFormModalOpen(true); setDetailModalOpen(false); };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Doctor Visits</h1>
          <button className="btn-primary" onClick={() => { setEditVisit(null); setFormModalOpen(true); }}>+ Add Visit</button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="visits-page">
            <div className="visits-section">
              <h2>Upcoming Follow-ups</h2>
              {upcoming.length > 0 ? (
                <div className="visits-list">
                  {upcoming.map((v) => {
                    const daysUntil = Math.max(0, Math.ceil((new Date(v.follow_up) - new Date()) / 86400000));
                    const daysClass = daysUntil < 3 ? 'badge-danger' : daysUntil <= 7 ? 'badge-warning' : 'badge-success';
                    return (
                      <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <strong>{v.doctor_name}</strong>
                          {v.specialty && <span className="badge badge-primary" style={{ marginLeft: '8px' }}>{v.specialty}</span>}
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>{v.follow_up}</div>
                        </div>
                        <span className={`badge ${daysClass}`}>in {daysUntil} days</span>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="visits-empty">No upcoming follow-ups 🎉</div>}
            </div>

            <div className="visits-section">
              <h2>Visit History</h2>
              {visits.length > 0 ? (
                <div className="visits-list">
                  {visits.map((v) => <VisitCard key={v.id} visit={v} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />)}
                </div>
              ) : <div className="visits-empty">No visits recorded yet.</div>}
            </div>
          </div>
        )}

        <Modal isOpen={formModalOpen} onClose={() => { setFormModalOpen(false); setEditVisit(null); }} title={editVisit ? 'Edit Visit' : 'Add Visit'}>
          <VisitForm visit={editVisit} onSubmit={handleSubmit} onCancel={() => { setFormModalOpen(false); setEditVisit(null); }} loading={saving} />
        </Modal>

        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Visit Details">
          <VisitDetail visit={viewVisit} onEdit={handleEdit} onClose={() => setDetailModalOpen(false)} />
        </Modal>
      </main>
    </div>
  );
}

export default Visits;
