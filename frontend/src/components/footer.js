import React from "react";

function Footer() {
  return (
    <footer className="bg-green-800 text-white text-center py-4 mt-auto">
      <p className="text-sm tracking-wide">
        GitShare &copy; {new Date().getFullYear()} — Securely share private GitHub repositories
      </p>
    </footer>
  );
}

export default Footer;
