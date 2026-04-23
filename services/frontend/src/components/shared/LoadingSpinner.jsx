import './LoadingSpinner.css';

function LoadingSpinner({ fullPage = false, small = false }) {
  return (
    <div className={`spinner-overlay ${fullPage ? 'full-page' : ''}`}>
      <div className={`spinner ${small ? 'small' : ''}`} />
    </div>
  );
}

export default LoadingSpinner;
