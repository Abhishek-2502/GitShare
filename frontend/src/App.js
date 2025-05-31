import { useRef, useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import RepoShare from "./RepoShare";
import RepoViewer from "./RepoViewer";
import Footer from "./components/footer";
import Header from "./components/header";
import './index.css';
import { Check, Close } from "@mui/icons-material";

function App() {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const initVanta = async () => {
      const THREE = await import('three');
      const VANTA = await import('vanta/dist/vanta.fog.min');

      if (!vantaEffect) {
        setVantaEffect(
          VANTA.default({
            el: vantaRef.current,
            THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            highlightColor: 0x00ff99,
            midtoneColor: 0x003300,
            lowlightColor: 0x000000,
            baseColor: 0x111111,
            blurFactor: 0.6,
            speed: 1.5,
            zoom: 0.8,
          })
        );
      }
    };

    initVanta();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin h-12 w-12 border-4 border-green-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={vantaRef} className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Header component */}
      <Header user={user} handleLogin={handleLogin} handleLogout={handleLogout} />

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

      {/* Footer component */}
      <Footer />
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="text-center py-20 px-4 flex flex-col items-center justify-center w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-7xl font-extrabold text-white mb-4 mt-10">
        Welcome to GitShare
      </h1>
      <p className="text-2xl text-gray-300 max-w-xl mx-auto mb-8">
        Share your private GitHub repositories securely with expiration dates and easy access.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate("/share")}
        className="bg-gray-900 px-6 py-3 rounded-xl font-semibold text-white hover:bg-green-500 transition text-lg mb-16"
      >
        Get Started
      </motion.button>

      {/* Comparison Section */}
      <section className="w-full max-w-6xl text-left py-20 mt-20 px-4 mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 text-white">
            How
            <span className="text-green-400"> GitShare</span> is Better
          </h2>
          <p className="text-gray-400 mt-2">
            See how GitShare simplifies the process of sharing private repositories
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Without GitShare */}
          <div className="bg-black p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="inline-block px-3 py-1 bg-red-800 text-red-200 text-xs rounded-full mb-4">Complex</div>
            <h3 className="text-2xl font-bold mb-6 text-white">Without GitShare</h3>
            <ul className="space-y-7 text-gray-300">
              <li> <Close className="text-red-500" /> <strong>GitHub account required</strong><br /><span className="text-sm">Recipients need a GitHub account to view your repositories</span></li>
              <li> <Close className="text-red-500" /> <strong>Add as collaborator</strong><br /><span className="text-sm">Need to add recipients as contributors to grant access</span></li>
              <li> <Close className="text-red-500" /> <strong>Limited sharing options</strong><br /><span className="text-sm">Difficult to share with non-GitHub users like employers</span></li>
              <li> <Close className="text-red-500" /> <strong>No usage analytics</strong><br /><span className="text-sm">Can't track repository views or engagement metrics</span></li>
              <li> <Close className="text-red-500" /> <strong>Permanent access</strong><br /><span className="text-sm">Collaborators retain access until manually removed</span></li>
            </ul>
          </div>

          {/* With GitShare */}
          <div className="bg-black p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="inline-block px-3 py-1 bg-green-800 text-green-200 text-xs rounded-full mb-4">Simple</div>
            <h3 className="text-2xl font-bold mb-6 text-white">With GitShare</h3>
            <ul className="space-y-7 text-gray-300">
              <li><Check className="text-green-400" /> <strong>No GitHub account required</strong><br /><span className="text-sm">Anyone with the link can view your repositories</span></li>
              <li><Check className="text-green-400" />  <strong>One-click sharing</strong><br /><span className="text-sm">Generate shareable links in seconds</span></li>
              <li><Check className="text-green-400" />  <strong>Universal access</strong><br /><span className="text-sm">Share with anyone, GitHub user or not</span></li>
              <li><Check className="text-green-400" /> <strong>Detailed analytics</strong><br /><span className="text-sm">Track views and engagement for each shared repository</span></li>
              <li><Check className="text-green-400" />  <strong>Time-limited access</strong><br /><span className="text-sm">Set expiration dates for your shared links</span></li>
            </ul>
          </div>
        </div>
      </section>
    </motion.div>
  );
}


export default App;
