import './MoodSlider.css';
const getMoodEmoji = (val) => { if (val <= 2) return '😞'; if (val <= 4) return '😕'; if (val <= 6) return '😐'; if (val <= 8) return '🙂'; return '😊'; };
function MoodSlider({ value, onChange }) {
  return (
    <div className="mood-slider slider-group">
      <div className="slider-label"><span>Mood {getMoodEmoji(value)}</span><span className="slider-value">{value}/10</span></div>
      <input type="range" className="slider-input" min="1" max="10" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
export default MoodSlider;
