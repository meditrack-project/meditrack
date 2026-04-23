import './EnergySlider.css';
function EnergySlider({ value, onChange }) {
  return (
    <div className="energy-slider slider-group">
      <div className="slider-label"><span>Energy ⚡</span><span className="slider-value">{value}/10</span></div>
      <input type="range" className="slider-input" min="1" max="10" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
export default EnergySlider;
