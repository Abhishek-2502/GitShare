import { motion } from "framer-motion";

function RepoManage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto mt-8 px-4 py-8 min-h-screen"
    >
      <h1 className="text-5xl font-bold text-white mb-6 text-center">
         Coming Soon!
      </h1>
    </motion.div>
  );
}

export default RepoManage;
