import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { GitHub, Share, ExitToApp, HomeFilled } from "@mui/icons-material";
import RepoShare from "./RepoShare";
import RepoViewer from "./RepoViewer";
import Footer from "./components/footer";
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/github`;
  };

  const handleLogout = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/logout`;
  };

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user");
        if (res.data.authenticated) {
          setUser({
            login: res.data.username,
            avatar_url: res.data.avatar,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setUser(null);
        } else {
          console.error("Error fetching user:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin h-12 w-12 border-4 border-green-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <header className="bg-green-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
          >
            <GitHub fontSize="large" />
            <span className="text-2xl font-bold">GitShare</span>
          </motion.div>

          {user ? (
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={handleLogout}
                className="text-white hover:text-red-400 transition"
                title="Logout"
              >
                <ExitToApp />
              </motion.button>
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={user.avatar_url}
                alt={user.login}
                className="w-10 h-10 rounded-full border-2 border-white"
                title={user.login}
              />

            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogin}
              className="bg-green-600 px-5 py-2 rounded-xl font-semibold hover:bg-green-500 transition"
            >
              Login with GitHub
            </motion.button>
          )}
        </div>
      </header>

      <main className="flex-grow px-6 py-8 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/share"
            element={user ? <RepoShare /> : <Navigate to="/" />}
          />
          <Route path="/share/:token" element={<RepoViewer />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="text-center py-20 px-4 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-extrabold text-green-500 mb-4">
        Welcome to GitShare
      </h1>
      <p className="text-lg text-gray-300 max-w-xl mx-auto mb-8">
        Share your private GitHub repositories securely with expiration dates and easy access.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate("/share")}
        className="bg-green-600 px-6 py-3 rounded-xl font-semibold text-white hover:bg-green-500 transition text-lg"
      >
        Get Started
      </motion.button>
    </motion.div>
  );
}


export default App;
