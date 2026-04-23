import { useState } from 'react';
import './SymptomLogger.css';

const ALL_SYMPTOMS = [
  'headache', 'fatigue', 'nausea', 'dizziness', 'chest pain',
  'shortness of breath', 'back pain', 'joint pain', 'stomach pain',
  'fever', 'cough', 'rash', 'insomnia', 'loss of appetite',
  'anxiety', 'palpitations',
];

const getMoodEmoji = (val) => {
  if (val <= 2) return '😞';
  if (val <= 4) return '😕';
  if (val <= 6) return '😐';
  if (val <= 8) return '🙂';
  return '😊';
};

function SymptomLogger({ todayLog, onSubmit, onEdit, loading }) {
  const [symptoms, setSymptoms] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const toggleSymptom = (s) => {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSubmit = () => {
    if (symptoms.length === 0) {
      setError('Select at least one symptom');
      return;
    }
    setError('');
    onSubmit({
      date: new Date().toISOString().split('T')[0],
      symptoms, severity, mood, energy,
      notes: notes || undefined,
    });
  };

  if (todayLog) {
    return (
      <div className="today-summary">
        <h3>Today&apos;s Log ✅</h3>
        <div className="today-summary-symptoms">
          {todayLog.symptoms.map((s) => (
            <span key={s} className="symptom-chip selected">{s}</span>
          ))}
        </div>
        <div className="today-summary-scores">
          <div className="score-item">
            <div className="score-label">Mood</div>
            <div className="score-value">{getMoodEmoji(todayLog.mood)} {todayLog.mood}/10</div>
          </div>
          <div className="score-item">
            <div className="score-label">Energy</div>
            <div className="score-value">⚡ {todayLog.energy}/10</div>
          </div>
          <div className="score-item">
            <div className="score-label">Severity</div>
            <div className="score-value">🔥 {todayLog.severity}/10</div>
          </div>
        </div>
        {todayLog.notes && <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{todayLog.notes}</p>}
        <button className="btn-secondary" onClick={() => onEdit(todayLog)} style={{ marginTop: '12px' }}>Edit Today&apos;s Log</button>
      </div>
    );
  }

  return (
    <div className="symptom-logger">
      <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Log Today&apos;s Symptoms</h3>
      {error && <div className="error-box">{error}</div>}

      <div className="symptom-grid">
        {ALL_SYMPTOMS.map((s) => (
          <button key={s} className={`symptom-chip ${symptoms.includes(s) ? 'selected' : ''}`} onClick={() => toggleSymptom(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="slider-group">
        <div className="slider-label">
          <span>Severity</span>
          <span className="slider-value" style={{ color: severity <= 3 ? 'var(--color-success)' : severity <= 6 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
            {severity}/10
          </span>
        </div>
        <input type="range" className="slider-input" min="1" max="10" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
      </div>

      <div className="slider-group">
        <div className="slider-label">
          <span>Mood {getMoodEmoji(mood)}</span>
          <span className="slider-value">{mood}/10</span>
        </div>
        <input type="range" className="slider-input" min="1" max="10" value={mood} onChange={(e) => setMood(Number(e.target.value))} />
      </div>

      <div className="slider-group">
        <div className="slider-label">
          <span>Energy ⚡</span>
          <span className="slider-value">{energy}/10</span>
        </div>
        <input type="range" className="slider-input" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 1000))} placeholder="How are you feeling today?" />
        <div className="notes-counter">{notes.length}/1000</div>
      </div>

      <button className="btn-primary logger-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : "Save Today's Log"}
      </button>
    </div>
  );
}

export default SymptomLogger;
