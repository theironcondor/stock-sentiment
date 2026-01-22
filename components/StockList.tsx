import React from 'react';
import { StockSentiment } from '../types';
import { TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';

interface StockListProps {
  title: string;
  stocks: StockSentiment[];
  onSelect: (stock: StockSentiment) => void;
  selectedSymbol?: string;
  type: 'positive' | 'negative';
}

const StockList: React.FC<StockListProps> = ({ title, stocks, onSelect, selectedSymbol, type }) => {
  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
      <div className={`p-4 border-b border-gray-700 flex justify-between items-center ${type === 'positive' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${type === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
          {type === 'positive' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          {title}
        </h2>
        <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Top 10</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-800/50 text-xs uppercase sticky top-0 backdrop-blur-sm z-10">
            <tr>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium text-right">Score</th>
              <th className="px-4 py-3 font-medium text-right">90d Δ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {stocks.map((stock) => (
              <tr 
                key={stock.symbol}
                onClick={() => onSelect(stock)}
                className={`
                  cursor-pointer transition-colors hover:bg-gray-700/50 
                  ${selectedSymbol === stock.symbol ? 'bg-gray-700 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
                `}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-white font-mono">{stock.symbol}</span>
                    <span className="text-xs text-gray-500 truncate max-w-[120px]">{stock.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-mono font-bold ${stock.currentScore > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.currentScore > 0 ? '+' : ''}{stock.currentScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-xs ${stock.change90d > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change90d > 0 ? '▲' : '▼'} {Math.abs(stock.change90d)}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-gray-600 mt-1">
                    <MessageSquare size={10} />
                    {(stock.volume / 1000).toFixed(1)}k
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockList;
