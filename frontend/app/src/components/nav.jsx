import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/30 backdrop-blur-md shadow-md px-8 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-2xl font-extrabold text-gray-900 tracking-wide" onClick={e=>window.location.href="/"}>Quantiva</div>

      {/* Links */}
      <div className="hidden md:flex space-x-12 text-gray-800 text-lg">
        <Link to="/explore" className="hover:text-black transition">Explore</Link>
        <Link to="/investments" className="hover:text-black transition">Investments</Link>
        <Link to="/portfolio" className="hover:text-black transition">Portfolio</Link>
      </div>

      {/* CTA Button */}
      <Link to="/get-started">
        <button className="px-6 py-2 bg-black text-white text-lg font-semibold rounded-full hover:opacity-90 transition">
          Get Started
        </button>
      </Link>
    </nav>
  );
}
