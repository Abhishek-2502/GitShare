import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ExitToApp, GitHub } from "@mui/icons-material";

function Header({ user, handleLogin, handleLogout }) {
  const navigate = useNavigate();

  return (
    <header className="shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <GitHub fontSize="large" className=" text-gray-300" />
          <span className="text-2xl font-bold text-white">GitShare</span>
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
