import './WelcomeBanner.css';
import { useAuth } from '../../hooks/useAuth';

function WelcomeBanner() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17 && hour < 22) greeting = 'Good evening';
  else greeting = 'Good night';

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="welcome-banner">
      <h1>{greeting}, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
      <p>{dateStr}</p>
    </div>
  );
}

export default WelcomeBanner;
