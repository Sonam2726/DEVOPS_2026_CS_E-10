import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Search from "./pages/Search";
import SkillPreview from "./pages/SkillPreview";
import Requests from "./pages/Requests"; 
import Profile from "./pages/Profile";
import OfferSkill from "./pages/OfferSkill";


import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SkillDetails from "./pages/SkillDetails";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";


function AppContent() {
  const location = useLocation();

  const isWorkspacePage = [
    "/dashboard",
    "/notifications",
    "/settings",
  ].includes(location.pathname.toLowerCase());

  return (
    <>
      {/* Main Navbar is hidden on Dashboard, Notifications and Settings */}
      {!isWorkspacePage && <Navbar />}

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
        {/*Request Page */}
        <Route
          path="/requests"
          element={<Requests />}
        />
        {/* Offer skill page */}
        <Route
          path="/offer-skill"
          element={<OfferSkill />}
        />
        {/*Profile Page*/}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Search Page */}
        <Route
          path="/search"
          element={<Search />}
        />


          {/* Preview page */}
        <Route path="/skill/:id" element={<SkillPreview />} />

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

        {/* Notifications */}
        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={<Settings />}
        />

      </Routes>

      {/* Footer is hidden on workspace pages */}
      {!isWorkspacePage && <Footer />}
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