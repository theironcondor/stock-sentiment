import React, { useState, useEffect, useCallback } from 'react';
import { MarketAnalysis, StockSentiment } from './types';
import { fetchMarketSentiment } from './services/gemini';
import StockList from './components/StockList';
import DetailPanel from './components/DetailPanel';
import LeaderboardView from './components/LeaderboardView';
import { RefreshCw, Terminal, LayoutDashboard, ListOrdered } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockSentiment | null>(null);
  const [view, setView] = useState<'dashboard' | 'leaderboard'>('dashboard');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMarketSentiment();
      setData(result);
      // Default to first positive stock if available
      if (result.topPositive.length > 0 && !selectedStock) {
        setSelectedStock(result.topPositive[0]);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "MISSING_API_KEY") {
        setError(
          <div className="text-left">
            <p className="font-bold text-red-400 mb-2">API Key Configuration Error</p>
            <p className="mb-2">The app cannot find your <code>REACT_APP_API_KEY</code>.</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-300">
              <li>Go to Vercel Dashboard → Settings → Environment Variables.</li>
              <li>Ensure <code>REACT_APP_API_KEY</code> is set correctly.</li>
              <li><strong>IMPORTANT:</strong> Go to "Deployments" and click <strong>Redeploy</strong>.</li>
            </ol>
            <p className="mt-2 text-xs text-gray-400">Environment variables are only applied during the build process.</p>
          </div>
        );
      } else {
        setError("Failed to generate market analysis. The AI model might be busy or the search failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedStock]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    loadData();
  };

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
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              LIVE FEED
            </div>
            <div>S&P 500</div>
            <div>NASDAQ 100</div>
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
            {loading ? 'ANALYZING...' : 'REFRESH SCAN'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden max-w-[1920px] mx-auto w-full">
        {error ? (
          <div className="flex items-center justify-center h-[600px] border border-red-900/50 bg-red-900/10 rounded-2xl">
            <div className="text-center max-w-lg">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                 {error}
              </div>
              <button onClick={handleRefresh} className="mt-6 px-6 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white font-medium">Retry Connection</button>
            </div>
          </div>
        ) : loading && !data ? (
          // Loading Skeleton
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-8 bg-gray-800 rounded w-1/2"></div>
              <div className="h-[400px] bg-gray-800 rounded-xl"></div>
              <div className="h-[400px] bg-gray-800 rounded-xl"></div>
            </div>
            <div className="lg:col-span-9">
              <div className="h-full bg-gray-800 rounded-xl"></div>
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