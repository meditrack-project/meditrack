import { useState, useEffect } from 'react';
import Sidebar from '../components/shared/Sidebar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import HealthSnapshot from '../components/dashboard/HealthSnapshot';
import TodayMedWidget from '../components/dashboard/TodayMedWidget';
import UpcomingFollowups from '../components/dashboard/UpcomingFollowups';
import QuickActionsBar from '../components/dashboard/QuickActionsBar';
import { medicalApi, healthApi } from '../lib/axios';
import './Dashboard.css';

function Dashboard() {
  const [todayMeds, setTodayMeds] = useState(null);
  const [todaySymptom, setTodaySymptom] = useState(null);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [medsRes, symptomRes, visitsRes] = await Promise.all([
        medicalApi.get('/api/medications/logs/today'),
        healthApi.get('/api/symptoms/today'),
        healthApi.get('/api/visits/upcoming'),
      ]);
      if (medsRes.data.success) setTodayMeds(medsRes.data.data);
      if (symptomRes.data.success) setTodaySymptom(symptomRes.data.data);
      if (visitsRes.data.success) setUpcomingVisits(visitsRes.data.data);
    } catch (err) { console.error('Dashboard fetch error:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMarkTaken = async (logId) => {
    setActionLoading(true);
    try { await medicalApi.put(`/api/medications/logs/${logId}/taken`); await fetchData(); }
    catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const handleMarkSkipped = async (logId) => {
    setActionLoading(true);
    try { await medicalApi.put(`/api/medications/logs/${logId}/skipped`); await fetchData(); }
    catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {loading ? <LoadingSpinner /> : (
          <div className="dashboard-page">
            <WelcomeBanner />
            <HealthSnapshot todaySymptom={todaySymptom} todayMeds={todayMeds} nextFollowup={upcomingVisits[0]} />
            <TodayMedWidget data={todayMeds} onMarkTaken={handleMarkTaken} onMarkSkipped={handleMarkSkipped} loading={actionLoading} />
            <UpcomingFollowups visits={upcomingVisits} />
            <QuickActionsBar />
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
