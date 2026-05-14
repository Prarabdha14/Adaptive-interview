import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ScoreRadarProps {
  data: {
    technical_depth_score: number;
    adaptability_score: number;
    communication_score: number;
    average_score: number;
    confidence_score: number;
  };
}

export const ScoreRadar: React.FC<ScoreRadarProps> = ({ data }) => {
  const radarData = [
    { subject: 'Depth', A: data.technical_depth_score, fullMark: 10 },
    { subject: 'Adaptability', A: data.adaptability_score, fullMark: 10 },
    { subject: 'Communication', A: data.communication_score, fullMark: 10 },
    { subject: 'Average', A: data.average_score, fullMark: 10 },
    { subject: 'Confidence', A: data.confidence_score, fullMark: 10 },
  ];

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]} 
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickCount={6}
            stroke="#374151"
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }}
            itemStyle={{ color: '#60a5fa' }}
          />
          <Radar 
            name="Candidate Score" 
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
