import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Table as TableIcon, RefreshCw, X, LogIn, LogOut, 
  Settings, Database, AlertCircle, CheckCircle2, ChevronDown, ExternalLink, 
  UploadCloud, DownloadCloud
} from 'lucide-react';
import { googleSignIn, logout, initAuth, getAccessToken } from '../lib/auth';
import { fetchSheetData, parseSheetToScreens, updateSheetData, prepareScreensForSheet } from '../lib/sheets';
import { saveScreensToFirebase, saveSheetConfigToFirebase, getSheetConfigFromFirebase } from '../lib/firebase';
import { ScreenData } from '../../types';

interface SheetControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (screens: ScreenData[]) => void;
  currentScreens: ScreenData[];
}

export const SheetControlPanel: React.FC<SheetControlPanelProps> = ({ isOpen, onClose, onSync, currentScreens }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState(() => localStorage.getItem('gsheet_id') || '');
  const [sheetRange, setSheetRange] = useState('A1:Z100');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    // Load initial config from Firebase
    const loadConfig = async () => {
      const config = await getSheetConfigFromFirebase();
      if (config) {
        setSpreadsheetId(config.spreadsheetId);
        setSheetRange(config.range || 'A1:Z100');
      }
    };
    loadConfig();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setPreviewData([]);
  };

  const handleFetch = async () => {
    if (!spreadsheetId) {
      setError('Please enter a Spreadsheet ID');
      return;
    }

    const currentToken = token || await getAccessToken();
    if (!currentToken) {
      setError('Please sign in first');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      localStorage.setItem('gsheet_id', spreadsheetId);
      // Save to Firebase config
      await saveSheetConfigToFirebase(spreadsheetId, sheetRange);
      
      const data = await fetchSheetData(spreadsheetId, sheetRange, currentToken);
      setPreviewData(data);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!spreadsheetId) {
      setError('Please enter a Spreadsheet ID');
      return;
    }

    const currentToken = token || await getAccessToken();
    if (!currentToken) {
      setError('Please sign in first');
      return;
    }

    setIsExporting(true);
    setError(null);
    try {
      const values = prepareScreensForSheet(currentScreens);
      await updateSheetData(spreadsheetId, sheetRange, values, currentToken);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to export data. Ensure you have edit access to the sheet.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleApply = () => {
    if (previewData.length < 2) return;
    const screens = parseSheetToScreens(previewData);
    onSync(screens);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TableIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Sheets Control Panel</h2>
              <p className="text-sm text-slate-400">Sync your presentation content from Google Sheets</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Auth Section */}
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border border-slate-600" />
                    <div>
                      <p className="text-sm font-medium text-white">{user.displayName}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-white">Not signed in</p>
                    <p className="text-xs text-slate-400">Sign in to access your Google Sheets</p>
                  </div>
                )}
              </div>
              <button
                onClick={user ? handleLogout : handleLogin}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  user 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-white hover:bg-slate-100 text-slate-900'
                }`}
              >
                {user ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {user ? 'Sign Out' : 'Sign in with Google'}
              </button>
            </div>
          </section>

          {/* Config Section */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Spreadsheet ID
                </label>
                <input 
                  type="text" 
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="Paste your Spreadsheet ID here"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Range
                </label>
                <input 
                  type="text" 
                  value={sheetRange}
                  onChange={(e) => setSheetRange(e.target.value)}
                  placeholder="e.g. Sheet1!A1:Z100"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={isLoading || isExporting || !user}
                onClick={handleFetch}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                Import from Sheet
              </button>

              <button
                disabled={isLoading || isExporting || !user}
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all border border-slate-600"
              >
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Export Current Data
              </button>
              {spreadsheetId && (
                <a 
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                  title="Open in Google Sheets"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Successfully fetched {previewData.length} rows
              </motion.div>
            )}
          </section>

          {/* Table Preview */}
          {previewData.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Preview Table</h3>
                <span className="text-xs text-slate-500">First row treated as headers</span>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700">
                      {previewData[0].map((header, i) => (
                        <th key={i} className="px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-tight">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(1, 6).map((row, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-700/20 transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-3 text-sm text-slate-400 truncate max-w-[200px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 6 && (
                  <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-800/50">
                    + {previewData.length - 6} more rows...
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <p className="text-xs text-slate-500 max-w-md">
            Data will be parsed according to the headers in your sheet. 
            Ensure headers match: <code className="text-emerald-500">title, subtitle, description, bgUrl...</code>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={previewData.length < 2}
              onClick={handleApply}
              className="px-8 py-2 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 rounded-lg font-bold transition-all"
            >
              Apply to Presentation
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
