import React, { useState, useEffect, useCallback } from 'react';
import { MarketAnalysis, StockSentiment } from './types';
import { fetchMarketSentiment } from './services/gemini';
import StockList from './components/StockList';
import DetailPanel from './components/DetailPanel';
import LeaderboardView from './components/LeaderboardView';
import { RefreshCw, Terminal, LayoutDashboard, ListOrdered, Key, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockSentiment | null>(null);
  const [view, setView] = useState<'dashboard' | 'leaderboard'>('dashboard');
  const [manualKey, setManualKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);

  const loadData = useCallback(async (keyOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use the key passed in, or the one in state, or undefined (which falls back to env var)
      const keyToUse = (keyOverride || manualKey || '').trim();
      // Pass undefined if empty string to trigger env var lookup in service
      const result = await fetchMarketSentiment(keyToUse || undefined);
      
      setData(result);
      if (result.topPositive.length > 0 && !selectedStock) {
        setSelectedStock(result.topPositive[0]);
      }
    } catch (err: any) {
      console.error("App Error Boundary:", err);
      
      let errorMessage = "An unexpected error occurred.";
      let isKeyError = false;

      if (err.message === "MISSING_API_KEY") {
        isKeyError = true;
        errorMessage = "MISSING_API_KEY";
      } else if (err.message === "INVALID_KEY_FORMAT") {
        errorMessage = "The API Key format is invalid. It should start with 'AIza'.";
        isKeyError = true;
      } else if (err.message && err.message.includes("403")) {
        errorMessage = "Access Denied (403). Your API Key might be invalid or has quota limits.";
        isKeyError = true;
      } else if (err.message && err.message.includes("400")) {
        errorMessage = "Bad Request (400). Please check your API key.";
        isKeyError = true;
      } else {
        errorMessage = err.message || "Failed to generate market analysis.";
      }

      if (isKeyError || errorMessage === "MISSING_API_KEY") {
        setError(
          <div className="text-left w-full">
            <div className="flex items-center gap-2 mb-4 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Authentication Failed</h3>
            </div>
            
            {errorMessage !== "MISSING_API_KEY" && (
              <p className="mb-4 text-red-300 bg-red-900/20 p-3 rounded border border-red-900/50 text-sm font-mono break-all">
                Error: {errorMessage}
              </p>
            )}

            <p className="mb-4 text-gray-300">
              The app could not find a valid API Key in the environment variables, or the key was malformed.
            </p>
            
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Enter Gemini API Key Manually
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={14} className="text-gray-500" />
                  </div>
                  <input
                    type={showKey ? "text" : "password"}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-600 rounded-md leading-5 bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Paste full key string here..."
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff size={14} className="text-gray-500" /> : <Eye size={14} className="text-gray-500" />}
                  </div>
                </div>
                <button
                  onClick={() => loadData(manualKey)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  disabled={!manualKey}
                >
                  Save & Retry
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                This key is used only for this session and is not stored on any server.
              </p>
            </div>
          </div>
        );
      } else {
        setError(
          <div>
             <p className="text-red-400 font-bold mb-2">System Error</p>
             <p className="text-gray-400 text-sm font-mono mb-4">{errorMessage}</p>
             <button onClick={() => loadData()} className="text-blue-400 hover:text-blue-300 underline">Try Again</button>
          </div>
        );
      }
    } finally {
      setLoading(false);
    }
  }, [manualKey, selectedStock]);

  useEffect(() => {
    // Initial load
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
          <div className="flex items-center justify-center h-[600px] border border-red-900/50 bg-red-900/10 rounded-2xl p-6">
            <div className="text-center max-w-xl w-full">
              {error}
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