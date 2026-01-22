import React from 'react';
import { MarketAnalysis, StockSentiment } from '../types';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, MoveUp, MoveDown, Minus } from 'lucide-react';

interface LeaderboardViewProps {
  data: MarketAnalysis;
}

const SentimentTable: React.FC<{ 
  title: string; 
  stocks: StockSentiment[]; 
  type: 'positive' | 'negative'; 
}> = ({ title, stocks, type }) => {
  const isPositive = type === 'positive';
  const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
  const bgHeader = isPositive ? 'bg-green-900/20' : 'bg-red-900/20';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col h-full shadow-lg">
      <div className={`p-5 border-b border-gray-700 flex justify-between items-center ${bgHeader}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <Icon size={24} className={colorClass} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${colorClass}`}>{title}</h2>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-mono mt-0.5">Sentiment Ranking</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900/50 text-xs uppercase text-gray-500 sticky top-0 backdrop-blur-sm z-10">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider w-12 text-center">Rank</th>
              <th className="px-4 py-4 font-semibold tracking-wider w-20 text-center">Trend</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Symbol</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Score</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">90d Change</th>
              <th className="px-6 py-4 font-semibold tracking-wider hidden md:table-cell">Primary Driver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50 text-sm">
            {stocks.map((stock, index) => (
              <tr key={stock.symbol} className="hover:bg-gray-700/30 transition-colors group">
                <td className="px-6 py-4 text-gray-500 font-mono font-medium text-center">#{index + 1}</td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {stock.rankChange > 0 ? (
                      <span className="flex items-center text-green-500 text-xs font-bold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                        <MoveUp size={12} className="mr-0.5" /> {stock.rankChange}
                      </span>
                    ) : stock.rankChange < 0 ? (
                      <span className="flex items-center text-red-500 text-xs font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                        <MoveDown size={12} className="mr-0.5" /> {Math.abs(stock.rankChange)}
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-600">
                        <Minus size={12} />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-base font-mono group-hover:text-blue-400 transition-colors">{stock.symbol}</span>
                    <span className="text-xs text-gray-500">{stock.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded border ${stock.currentScore >= 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} font-mono font-bold text-base`}>
                    {stock.currentScore > 0 ? '+' : ''}{stock.currentScore}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`flex items-center justify-end gap-1 font-medium text-sm ${stock.change90d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change90d > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span className="font-mono">{Math.abs(stock.change90d)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                   <span className="text-gray-400 italic truncate max-w-[200px] block" title={stock.description}>
                     "{stock.description}"
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
      <SentimentTable title="Top 10 Bullish" stocks={data.topPositive} type="positive" />
      <SentimentTable title="Top 10 Bearish" stocks={data.topNegative} type="negative" />
    </div>
  );
};

export default LeaderboardView;