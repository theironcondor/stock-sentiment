import React, { useState, useEffect, useCallback } from 'react';
import { MarketAnalysis, StockSentiment } from './types';
import { fetchMarketSentiment } from './services/gemini';
import StockList from './components/StockList';
import DetailPanel from './components/DetailPanel';
import LeaderboardView from './components/LeaderboardView';
import { RefreshCw, Terminal, LayoutDashboard, ListOrdered, Activity, AlertTriangle } from 'lucide-react';

// --- Main App Component ---

const App: React.FC = () => {
  // Data State
  const [data, setData] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<React.ReactNode | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockSentiment | null>(null);
  const [view, setView] = useState<'dashboard' | 'leaderboard'>('dashboard');

  // 1. Data Loading Effect
  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await fetchMarketSentiment();
      setData(result);
      if (result.topPositive.length > 0 && !selectedStock) {
        setSelectedStock(result.topPositive[0]);
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      // Transient Error - stay on dashboard but show error
      setFetchError(err.message || "Failed to analyze market data.");
    } finally {
      setLoading(false);
    }
  }, [selectedStock]);

  // Trigger load on mount
  useEffect(() => {
    if (!data) {
      loadData();
    }
  }, [data, loadData]);

  const handleRefresh = () => {
    loadData();
  };

  // 2. Loading State (Initial or Refresh)
  // We overlay this on the dashboard if data exists, otherwise show skeleton
  const isInitialLoading = loading && !data;

  // 3. Dashboard
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-100 bg-gray-900 selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Terminal size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">SENTIX <span className="text-gray-500 font-normal ml-1">TERMINAL</span></h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-gray-800/50 p-1 rounded-lg border border-gray-700">
            <button 
              onClick={() => setView('dashboard')}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${view === 'dashboard' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}
              `}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
            <button 
              onClick={() => setView('leaderboard')}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${view === 'leaderboard' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}
              `}
            >
              <ListOrdered size={16} />
              Leaderboard
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></span>
              {loading ? 'SYNCING...' : 'LIVE'}
            </div>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all
              ${loading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'}
            `}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'ANALYZING...' : 'REFRESH'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden max-w-[1920px] mx-auto w-full relative">
        
        {fetchError && !data && (
           <div className="flex items-center justify-center h-[600px] border border-red-900/50 bg-red-900/10 rounded-2xl p-6">
            <div className="text-center max-w-xl w-full text-red-300">
              <AlertTriangle className="mx-auto mb-4" size={48} />
              <p className="text-lg font-bold mb-2">Analysis Failed</p>
              <p className="mb-6 font-mono text-sm">{fetchError}</p>
              <button 
                onClick={handleRefresh} 
                className="px-6 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-700 rounded text-white transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {isInitialLoading ? (
          // Skeleton Loader
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-8 bg-gray-800 rounded w-1/2"></div>
              <div className="h-[400px] bg-gray-800 rounded-xl border border-gray-700"></div>
              <div className="h-[400px] bg-gray-800 rounded-xl border border-gray-700"></div>
            </div>
            <div className="lg:col-span-9">
              <div className="h-full bg-gray-800 rounded-xl border border-gray-700 p-8">
                 <div className="flex justify-center items-center h-full flex-col gap-4 text-gray-600">
                    <Activity size={64} className="animate-bounce" />
                    <p className="font-mono text-sm tracking-wider">GENERATING MARKET ANALYSIS...</p>
                 </div>
              </div>
            </div>
          </div>
        ) : data ? (
          view === 'dashboard' ? (
            <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Lists */}
              <div className="lg:col-span-3 flex flex-col gap-6 h-[calc(100vh-8rem)] overflow-hidden">
                <div className="flex-1 min-h-0">
                  <StockList 
                    title="Bullish Movers" 
                    stocks={data.topPositive} 
                    onSelect={setSelectedStock} 
                    selectedSymbol={selectedStock?.symbol}
                    type="positive"
                  />
                </div>
                <div className="flex-1 min-h-0">
                  <StockList 
                    title="Bearish Movers" 
                    stocks={data.topNegative} 
                    onSelect={setSelectedStock} 
                    selectedSymbol={selectedStock?.symbol}
                    type="negative"
                  />
                </div>
              </div>

              {/* Right Column: Detail View */}
              <div className="lg:col-span-9 h-[calc(100vh-8rem)]">
                <DetailPanel stock={selectedStock} />
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-8rem)]">
              <LeaderboardView data={data} />
            </div>
          )
        ) : null}
      </main>
    </div>
  );
};

export default App;