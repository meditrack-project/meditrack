import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { healthApi } from '../../lib/axios';
import LoadingSpinner from '../shared/LoadingSpinner';
import './TrendChart.css';

function TrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await healthApi.get('/api/symptoms/trends');
        if (res.data.success) setData(res.data.data);
      } catch (err) { console.error('Failed to fetch trends:', err); }
      finally { setLoading(false); }
    };
    fetchTrends();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (data.length === 0) return <p style={{ color: 'var(--color-muted)', padding: '20px 0' }}>No trend data yet.</p>;

  const avgMood = data.filter(d => d.avg_mood).reduce((s, d) => s + d.avg_mood, 0) / (data.filter(d => d.avg_mood).length || 1);
  const avgEnergy = data.filter(d => d.avg_energy).reduce((s, d) => s + d.avg_energy, 0) / (data.filter(d => d.avg_energy).length || 1);

  return (
    <div className="trend-chart-wrapper">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={(v) => v.slice(5)} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avg_mood" stroke="var(--color-primary)" name="Mood" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="avg_energy" stroke="var(--color-warning)" name="Energy" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="avg_severity" stroke="var(--color-danger)" name="Severity" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="trend-stats">
        <div className="trend-stat"><div className="trend-stat-value">{avgMood.toFixed(1)}</div><div className="trend-stat-label">Avg Mood</div></div>
        <div className="trend-stat"><div className="trend-stat-value">{avgEnergy.toFixed(1)}</div><div className="trend-stat-label">Avg Energy</div></div>
        <div className="trend-stat"><div className="trend-stat-value">{data.length}</div><div className="trend-stat-label">Entries</div></div>
      </div>
    </div>
  );
}

export default TrendChart;
