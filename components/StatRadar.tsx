import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { StatType } from '../types';

interface StatRadarProps {
  attributes: Record<StatType, number>;
}

const StatRadar: React.FC<StatRadarProps> = ({ attributes }) => {
  const data = [
    { subject: 'STR', A: attributes[StatType.STR], fullMark: 100 },
    { subject: 'INT', A: attributes[StatType.INT], fullMark: 100 },
    { subject: 'DEX', A: attributes[StatType.DEX], fullMark: 100 },
    { subject: 'CHA', A: attributes[StatType.CHA], fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
          <Radar
            name="Stats"
            dataKey="A"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatRadar;