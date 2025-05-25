import { Link } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("authToken");
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/50 backdrop-blur-lg shadow-lg px-6 py-3 flex items-center justify-between z-50">
      {/* Logo */}
      <div
        className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-indigo-600 transition duration-300 ease-in-out"
        onClick={(e) => (window.location.href = "/")}
      >
        Quantiva
      </div>

      {/* Links */}
      <div className="hidden md:flex space-x-10 text-gray-700 font-medium">
        <Link
          to="/explore"
          className="hover:text-indigo-600 transition duration-300 ease-in-out"
        >
          Explore
        </Link>
        <Link
          to="/investments"
          className="hover:text-indigo-600 transition duration-300 ease-in-out"
        >
          Investments
        </Link>
        <Link
          to="/portfolio"
          className="hover:text-indigo-600 transition duration-300 ease-in-out"
        >
          Portfolio
        </Link>
      </div>

      {/* CTA Button */}
      {!token && (
        <Link to="/register">
          <button className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out">
            Get Started
          </button>
        </Link>
      )}
    </nav>
  );
}