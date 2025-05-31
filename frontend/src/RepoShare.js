import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Folder, Link as LinkIcon, AccountTree } from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create a custom theme for the DateTimePicker
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#22c55e", // green-500
    },
    background: {
      paper: "#18181b", // zinc-900
      default: "#09090b", // zinc-950
    },
  },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: "white",
          "&.Mui-selected": {
            backgroundColor: "#22c55e", // green-500
            "&:hover": {
              backgroundColor: "#16a34a", // green-600
            },
          },
          "&:hover": {
            backgroundColor: "#3f3f46", // zinc-700
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#18181b", // zinc-900
        },
      },
    },
  },
});

function RepoShare() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [expiryDate, setExpiryDate] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

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
        setError(err.response?.data?.error || "Failed to load repositories");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRepo) {
      setBranches([]);
      setSelectedBranch("");
      return;
    }

    setLoading(true);
    const [owner, repo] = selectedRepo.split("/");

    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/repos/${owner}/${repo}/branches`,
        { withCredentials: true }
      )
      .then((res) => {
        setBranches(res.data);
        if (res.data.length > 0) setSelectedBranch(res.data[0].name);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to load branches");
        setBranches([]);
        setSelectedBranch("");
      })
      .finally(() => setLoading(false));
  }, [selectedRepo]);

  const createShare = async () => {
    if (!selectedRepo || !expiryDate || !selectedBranch) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/share`,
        {
          repo: selectedRepo,
          branch: selectedBranch,
          expiresAt: expiryDate.toISOString(),
        },
        { withCredentials: true }
      );
      setShareLink(response.data.shareLink);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopySuccess("Copied to clipboard!");
      setTimeout(() => setCopySuccess(""), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-4 py-8 min-h-screen"
    >
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
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
            <Folder className="absolute left-3 top-1.5 text-green-500" />
            <select
              className="w-full pl-10 pr-4 py-2 bg-black border border-green-700 rounded focus:outline-none focus:ring-2 focus:ring-green-600 text-white"
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a repository</option>
              {repos.map((repo) => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.private ? "🔒" : "🌐"} {repo.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Branch Selector */}
        {branches.length > 0 && (
          <div>
            <label className="block text-sm text-white mb-2">Branch</label>
            <div className="relative">
              <AccountTree className="absolute left-3 top-1.5 text-green-500" />
              <select
                className="w-full pl-10 pr-4 py-2 bg-black border border-green-700 rounded focus:outline-none focus:ring-2 focus:ring-green-600 text-white"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                disabled={loading}
              >
                {branches.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Date Picker */}
        <ThemeProvider theme={darkTheme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Pick expiry"
              value={expiryDate}
              onChange={setExpiryDate}
              minDateTime={new Date()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      backgroundColor: "black",
                      "& fieldset": {
                        borderColor: "#15803d", // green-700
                      },
                      "&:hover fieldset": {
                        borderColor: "#16a34a", // green-600
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#22c55e", // green-500
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#d1d5db", // gray-300
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#22c55e", // green-500
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </ThemeProvider>
        
        {/* Generate Button */}
        <button
          onClick={createShare}
          disabled={!selectedRepo || !expiryDate || !selectedBranch || loading}
          className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-2 rounded transition"
        >
          {loading ? "Generating..." : "Generate Share Link"}
        </button>
      </div>

      {/* Share Link Result */}
      {shareLink && (
        <div className="mt-6 bg-zinc-900 p-6 rounded-xl shadow-lg border border-green-800 space-y-3 relative">
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
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="mt-2 px-4 py-2 border border-green-600 text-green-400 rounded hover:bg-green-800"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => window.open(shareLink, "_blank")}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Open Link
            </button>
          </div>
          {copySuccess && (
            <div className="absolute top-0 right-0 mt-2 mr-2 bg-green-600 text-white px-3 py-1 rounded shadow">
              {copySuccess}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default RepoShare;
