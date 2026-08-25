import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Search from "./pages/Search";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SkillDetails from "./pages/SkillDetails";

function AppContent() {
  const location = useLocation();

  const isDashboard =
    location.pathname.toLowerCase() === "/dashboard";

  return (
    <>
      {/* Navbar is hidden on Dashboard */}
      {!isDashboard && <Navbar />}

      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* Home Page */}
        <Route
          path="/home"
          element={<Home />}
        />
        {/* Search Page */}
        <Route path="/search" element={<Search />} />

        {/* Discover Page */}
        <Route
          path="/discover"
          element={<Discover />}
        />

        {/* Authentication Pages */}
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Skill Details */}
        <Route
          path="/skill-details"
          element={<SkillDetails />}
        />
      </Routes>

      {/* Footer is hidden on Dashboard */}
      {!isDashboard && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;