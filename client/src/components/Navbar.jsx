import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-600"
        >
          SkillBridge
          <span className="text-violet-600"> AI</span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">

          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            About
          </Link>

          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Get Started
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;