import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '10:00', value: 100 },
  { name: '10:05', value: 120 },
  { name: '10:10', value: 110 },
  { name: '10:15', value: 180 },
  { name: '10:20', value: 250 },
  { name: '10:25', value: 210 },
  { name: '10:30', value: 380 },
  { name: '10:35', value: 420 },
  { name: '10:40', value: 890 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-black border border-brand-green p-2 rounded shadow-lg">
        <p className="text-brand-green font-mono font-bold text-sm">{`$${payload[0].value} (ROI 8.9x)`}</p>
      </div>
    );
  }
  return null;
};

const ProfitChart: React.FC = () => {
  return (
    <div className="h-48 w-full mt-4 bg-brand-black/50 rounded-lg p-2 border border-brand-green/10">
      <div className="flex justify-between items-center px-2 mb-2">
        <span className="text-xs text-gray-400 font-mono">P/L Tracker</span>
        <span className="text-xs text-brand-green font-mono animate-pulse">+890%</span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#00ff88" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitChart;