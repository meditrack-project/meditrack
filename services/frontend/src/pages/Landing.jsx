import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import './Landing.css';

function Landing() {
  return (
    <div className="landing">
      <Navbar />

      <section className="hero">
        <h1>Your Personal <span>Health Companion</span></h1>
        <p>Track medications, log symptoms, record doctor visits, and get AI-powered health insights — all in one place.</p>
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary hero-cta">Get Started Free</Link>
          <a href="#features" className="btn-secondary hero-cta">Learn More</a>
        </div>
      </section>

      <section className="features" id="features">
        <h2>Everything You Need</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3>Medication Tracking</h3>
            <p>Never miss a dose. Track all your medications, set schedules, and monitor adherence with detailed analytics.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🩺</div>
            <h3>Symptom Journal</h3>
            <p>Log daily symptoms, mood, and energy levels. Identify patterns and trends with interactive charts.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏥</div>
            <h3>Doctor Visit Records</h3>
            <p>Keep all your doctor visits organized. Track diagnoses, prescriptions, and upcoming follow-ups.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Health Insights</h3>
            <p>Get personalized health insights powered by advanced AI. Ask questions about your health data anytime.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up in seconds and set up your health profile.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Log Health Data</h3>
            <p>Track medications, symptoms, and doctor visits daily.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get AI Insights</h3>
            <p>Receive personalized recommendations based on your data.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} MediTrack. Your health, your data, your insights.
      </footer>
    </div>
  );
}

export default Landing;
