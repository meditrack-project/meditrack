import TodayMedications from '../medications/TodayMedications';
import './TodayMedWidget.css';

function TodayMedWidget({ data, onMarkTaken, onMarkSkipped, loading }) {
  return (
    <div className="today-med-widget">
      <TodayMedications data={data} onMarkTaken={onMarkTaken} onMarkSkipped={onMarkSkipped} loading={loading} />
    </div>
  );
}

export default TodayMedWidget;
