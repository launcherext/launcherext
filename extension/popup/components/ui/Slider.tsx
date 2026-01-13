import React from 'react';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  unit = '',
}) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
          <span className="text-sm font-semibold text-text-primary monospace">
            {value} {unit}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #00ff88 0%, #00ff88 ${
            ((value - min) / (max - min)) * 100
          }%, #2a2a2a ${((value - min) / (max - min)) * 100}%, #2a2a2a 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-text-muted mt-1">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

export default Slider;
