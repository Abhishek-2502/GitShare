import { GitHub } from "@mui/icons-material"; 

function Footer() {
  return (
    <footer className="text-white py-10 px-8 mt-auto border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm tracking-wide mb-2 md:mb-0">
          GitShare &copy; {new Date().getFullYear()} - Securely share private GitHub repositories
        </p>
        <a
          href="https://github.com/Abhishek-2502" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-gray-300 hover:text-white transition"
        >
          <span className="mr-2">Developed by Abhishek Rajput</span>
          <GitHub className="w-4 h-4" />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
