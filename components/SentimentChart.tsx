import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { StockSentiment } from '../types';

interface SentimentChartProps {
  stock: StockSentiment;
  className?: string;
}

const SentimentChart: React.FC<SentimentChartProps> = ({ stock, className }) => {
  const data = useMemo(() => {
    return stock.history.map((score, index) => ({
      day: index - stock.history.length + 1, // -90 to 0
      score: score,
    }));
  }, [stock.history]);

  const isPositive = stock.currentScore >= 0;
  const color = isPositive ? "#10b981" : "#ef4444"; // Tailwind green-500 : red-500
  const gradientId = `colorSentiment-${stock.symbol}`;

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="day" 
            hide={true} 
            type="number" 
            domain={['dataMin', 'dataMax']} 
          />
          <YAxis 
            domain={[-100, 100]} 
            hide={false} 
            tick={{fontSize: 10, fill: '#9ca3af'}} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            itemStyle={{ color: '#f3f4f6' }}
            labelFormatter={(label) => `Day ${label}`}
            formatter={(value: number) => [value, 'Score']}
          />
          <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke={color} 
            fillOpacity={1} 
            fill={`url(#${gradientId})`} 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentChart;
