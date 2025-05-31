import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExitToApp, GitHub } from "@mui/icons-material";

function Header({ user, handleLogin, handleLogout }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <GitHub fontSize="large" className="text-gray-300" />
          <span className="text-2xl font-bold text-white">GitShare</span>
        </motion.div>

        {/* User Section */}
        {user ? (
          <div className="flex items-center gap-6 relative text-white">
            {/* Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  setShowDropdown(!showDropdown);
                }}
                className="flex items-center gap-1 hover:text-green-400 transition font-medium focus:outline-none"
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                Tools{" "}
                <span
                  className={`text-sm transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-48 bg-white text-gray-900 shadow-xl rounded-xl py-2 z-50 border border-gray-200"
                  >
                    <li>
                      <a
                        href="https://git-followers-tracker.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-5 py-3 text-sm hover:bg-gray-400 transition rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Git Followers Tracker
                      </a>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={handleLogout}
              className="hover:text-red-400 transition"
              title="Logout"
            >
              <ExitToApp />
            </motion.button>

            {/* GitHub Profile */}
            <motion.a
              whileHover={{ scale: 1.1 }}
              href={`https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Go to ${user.login}'s GitHub`}
            >
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            </motion.a>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleLogin}
            className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-green-500 transition"
          >
            Login with GitHub
          </motion.button>
        )}
      </div>
    </header>
  );
}

export default Header;
