import React from 'react';
import { StockSentiment } from '../types';
import SentimentChart from './SentimentChart';
import { Activity, MessageSquare, TrendingUp, Calendar, AlertCircle, ExternalLink, Newspaper, Twitter, MessageCircle } from 'lucide-react';

interface DetailPanelProps {
  stock: StockSentiment | null;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ stock }) => {
  if (!stock) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-800 rounded-xl border border-gray-700 p-8">
        <Activity size={48} className="mb-4 opacity-20" />
        <p className="text-lg">Select a stock to view detailed analysis</p>
      </div>
    );
  }

  const isPositive = stock.currentScore >= 0;
  const sentimentColor = isPositive ? 'text-green-400' : 'text-red-400';

  const PlatformBar: React.FC<{ label: string; score: number; icon: React.ReactNode; color: string }> = ({ label, score, icon, color }) => {
    // Convert -100/100 to 0/100 for bar width
    const percentage = Math.abs(score); 
    const isPos = score >= 0;
    const barColor = isPos ? 'bg-green-500' : 'bg-red-500';
    
    return (
      <div className="flex items-center gap-4 py-2">
        <div className={`p-2 rounded-lg bg-gray-800 border border-gray-700 ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <span className={`text-sm font-mono font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
              {isPos ? '+' : ''}{score}
            </span>
          </div>
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden flex relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-700 z-10"></div>
            {/* If positive, margin left is 50%, width is score/2. If negative, right is 50%... simplified: */}
             <div 
               className={`h-full ${barColor} rounded-full transition-all duration-500`}
               style={{ 
                 width: `${percentage / 2}%`,
                 marginLeft: isPos ? '50%' : `calc(50% - ${percentage / 2}%)`
               }}
             ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-xl overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">{stock.symbol}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-bold bg-gray-700 text-gray-300 border border-gray-600`}>
              NASDAQ
            </span>
          </div>
          <h2 className="text-gray-400 text-lg">{stock.name}</h2>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-mono font-bold ${sentimentColor}`}>
            {stock.currentScore > 0 ? '+' : ''}{stock.currentScore}
          </div>
          <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold mt-1">Sentiment Score</div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 shrink-0">
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
            <TrendingUp size={14} /> 90 Day Change
          </div>
          <div className={`text-xl font-mono font-bold ${stock.change90d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stock.change90d > 0 ? '+' : ''}{stock.change90d}
          </div>
        </div>
        
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
            <MessageSquare size={14} /> Social Volume
          </div>
          <div className="text-xl font-mono font-bold text-white">
            {stock.volume.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
            <Calendar size={14} /> Streak
          </div>
          <div className="text-xl font-mono font-bold text-blue-400">
             Active
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      {stock.platformBreakdown && (
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50 shrink-0">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Sentiment by Platform</h3>
          <div className="flex flex-col gap-1">
            <PlatformBar 
              label="Twitter / X" 
              score={stock.platformBreakdown.twitter} 
              icon={<Twitter size={18} />} 
              color="text-blue-400"
            />
            <PlatformBar 
              label="Reddit" 
              score={stock.platformBreakdown.reddit} 
              icon={<MessageCircle size={18} />} 
              color="text-orange-500"
            />
            <PlatformBar 
              label="News Media" 
              score={stock.platformBreakdown.news} 
              icon={<Newspaper size={18} />} 
              color="text-gray-300"
            />
          </div>
        </div>
      )}

      {/* Driver Description */}
      <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700/50 flex gap-3 shrink-0">
        <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
        <div>
           <h3 className="text-sm font-bold text-gray-200 mb-1">Primary Sentiment Driver</h3>
           <p className="text-gray-300 leading-relaxed">{stock.description}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 min-h-[300px] flex flex-col shrink-0">
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
          <Activity size={16} /> 90-Day Sentiment Trend
        </h3>
        <div className="flex-1 bg-gray-900/50 rounded-lg border border-gray-700/50 p-4 relative overflow-hidden h-[250px]">
           <SentimentChart stock={stock} />
        </div>
      </div>

      {/* Sources Section */}
      {stock.sources && stock.sources.length > 0 && (
        <div className="shrink-0 pt-2 pb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <Newspaper size={16} /> Verified Sources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stock.sources.map((source, idx) => (
              <a 
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/40 border border-gray-700/50 hover:bg-gray-700/40 hover:border-gray-600 transition-all group"
              >
                <div className="mt-1 p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:text-blue-300">
                  <ExternalLink size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 font-medium truncate group-hover:text-blue-200 transition-colors">
                    {source.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">
                    {source.domain || new URL(source.url).hostname.replace('www.', '')}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPanel;