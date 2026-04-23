import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { medicalApi } from '../../lib/axios';
import LoadingSpinner from '../shared/LoadingSpinner';
import './AdherenceChart.css';

function AdherenceChart() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdherence = async () => {
      setLoading(true);
      try {
        const res = await medicalApi.get(`/api/medications/adherence?days=${days}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch adherence:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdherence();
  }, [days]);

  if (loading) return <LoadingSpinner />;
  if (!data || !data.per_medication || data.per_medication.length === 0) {
    return (
      <div className="adherence-chart-section">
        <h3>Adherence</h3>
        <p style={{ color: 'var(--color-muted)', padding: '20px 0' }}>No adherence data yet. Start taking your medications!</p>
      </div>
    );
  }

  const chartData = data.per_medication.map((m) => ({
    name: m.name.length > 12 ? m.name.substring(0, 12) + '...' : m.name,
    percent: m.percent,
  }));

  return (
    <div className="adherence-chart-section">
      <div className="adherence-header">
        <h3>Adherence</h3>
        <select className="adherence-select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      <div className="adherence-chart-wrapper">
        <div className="adherence-stats">
          <div className="adherence-stat">
            <div className="adherence-stat-value">{data.overall_avg}%</div>
            <div className="adherence-stat-label">Overall</div>
          </div>
          <div className="adherence-stat">
            <div className="adherence-stat-value" style={{ color: 'var(--color-success)' }}>{data.best?.percent || 0}%</div>
            <div className="adherence-stat-label">Best: {data.best?.name || 'N/A'}</div>
          </div>
          <div className="adherence-stat">
            <div className="adherence-stat-value" style={{ color: 'var(--color-danger)' }}>{data.worst?.percent || 0}%</div>
            <div className="adherence-stat-label">Worst: {data.worst?.name || 'N/A'}</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
            <Tooltip formatter={(value) => [`${value}%`, 'Adherence']} />
            <Bar dataKey="percent" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdherenceChart;
