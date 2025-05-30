import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CalendarToday, Folder, Link as LinkIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function RepoShare() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [expiryDate, setExpiryDate] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/repos`, {
        withCredentials: true,
      })
      .then((res) => {
        setRepos(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load repositories');
      })
      .finally(() => setLoading(false));
  }, []);

  const createShare = async () => {
    if (!selectedRepo || !expiryDate) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/share`,
        {
          repo: selectedRepo,
          expiresAt: expiryDate.toISOString(),
        },
        { withCredentials: true }
      );
      setShareLink(response.data.shareLink);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
        Share Private Repository
      </h1>

      <div className="bg-zinc-900 p-6 rounded-xl shadow-lg space-y-6 border border-green-800">
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded">{error}</div>
        )}

        {/* Repo Selector */}
        <div>
          <label className="block text-sm text-white mb-2">Repository</label>
          <div className="relative">
            <Folder className="absolute left-3 top-3 text-green-500" />
            <select
              className="w-full pl-10 pr-4 py-2 bg-black border border-green-700 rounded focus:outline-none focus:ring-2 focus:ring-green-600 text-white"
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a repository</option>
              {repos.map((repo) => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.private ? '🔒' : '🌐'} {repo.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm text-white mb-2">
            Expiry Date & Time
          </label>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Pick expiry"
              value={expiryDate}
              onChange={setExpiryDate}
              minDateTime={new Date()}
              renderInput={({ inputRef, inputProps }) => (
                <div className="relative">
                  <CalendarToday className="absolute left-3 top-3 text-green-500" />
                  <input
                    ref={inputRef}
                    {...inputProps}
                    className="w-full pl-10 pr-4 py-2 bg-black border border-green-700 rounded focus:outline-none focus:ring-2 focus:ring-green-600 text-white"
                    placeholder="Select date and time"
                  />
                </div>
              )}
            />
          </LocalizationProvider>
        </div>

        {/* Generate Button */}
        <button
          onClick={createShare}
          disabled={!selectedRepo || !expiryDate || loading}
          className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-2 rounded transition"
        >
          {loading ? 'Generating...' : 'Generate Share Link'}
        </button>
      </div>

      {/* Share Link Result */}
      {shareLink && (
        <div className="mt-6 bg-zinc-900 p-6 rounded-xl shadow-lg border border-green-800 space-y-3">
          <h2 className="text-lg font-semibold text-green-400 mb-2">
            Shareable Link Created
          </h2>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-3 text-green-500" />
            <input
              value={shareLink}
              readOnly
              className="w-full pl-10 pr-4 py-2 bg-black border border-green-700 rounded text-white"
            />
          </div>
          <p className="text-sm text-gray-400">
            Expires: {new Date(expiryDate).toLocaleString()}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(shareLink)}
            className="mt-2 px-4 py-2 border border-green-600 text-green-400 rounded hover:bg-green-800"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default RepoShare;
