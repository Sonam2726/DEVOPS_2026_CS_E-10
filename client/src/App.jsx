import {
  BrowserRouter,
  Navigate,
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
import Reviews from "./pages/Reviews";

import Landing from "./pages/Landing";
import Matching from "./pages/Matching";
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

import MatchDetails from "./pages/MatchDetails";
import Exchange from "./Exchange";


// =========================
// DAY 7 - SESSIONS
// =========================
import Sessions from "./pages/Sessions";
import SessionDetails from "./SessionDetails";
import Chat from "./pages/chat";
import ChatScreen from "./pages/ChatScreen";
import About from "./pages/About";


function ProtectedRoute({ children }) {
  const isLoggedIn =
    localStorage.getItem("skillbridgeLoggedIn") === "true";

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}


function AppContent() {
  const location = useLocation();

  const isWorkspacePage = [
    "/dashboard",
    "/notifications",
    "/settings",
  ].includes(location.pathname.toLowerCase());

  return (
    <>
      {/* Main Navbar */}
      {!isWorkspacePage && <Navbar />}

      <Routes>

        {/* =========================
            LANDING PAGE
        ========================= */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* =========================
            HOME PAGE
        ========================= */}
        <Route
          path="/home"
          element={<Home />}
        />

        {/* =========================
            REVIEWS PAGE
        ========================= */}
        <Route
          path="/reviews"
          element={<Reviews />}
        />

        {/* =========================
            DAY 3 - MATCHING
        ========================= */}
        <Route
          path="/matching"
          element={<Matching />}
        />

        {/* =========================
            DAY 4 - MATCH DETAILS
        ========================= */}
        <Route
          path="/match-details/:id"
          element={<MatchDetails />}
        />

        {/* =========================
            DAY 5 - SKILL EXCHANGE
        ========================= */}
        <Route
          path="/exchange"
          element={<Exchange />}
        />
        <Route
  path="/about"
  element={<About />}
/>

        {/* =========================
            DAY 6 - REQUESTS
        ========================= */}
        <Route
          path="/requests"
          element={<Requests />}
        />

        {/* =========================
            DAY 7 - SESSIONS
        ========================= */}
        <Route
  path="/sessions"
  element={<Sessions />}
/>

<Route
  path="/session-details/:id"
  element={<SessionDetails />}
/>
{/* =========================
    DAY 9 - CHAT LIST
========================= */}

<Route
  path="/chat"
  element={<Chat />}
/>

<Route
  path="/chat/:id"
  element={<ChatScreen />}
/>

        {/* =========================
            OFFER SKILL
        ========================= */}
        <Route
          path="/offer-skill"
          element={<OfferSkill />}
        />

        {/* =========================
            PROFILE
        ========================= */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* =========================
            SEARCH
        ========================= */}
        <Route
          path="/search"
          element={<Search />}
        />

        {/* =========================
            SKILL PREVIEW
        ========================= */}
        <Route
          path="/skill/:id"
          element={<SkillPreview />}
        />

        {/* =========================
            DISCOVER
        ========================= */}
        <Route
          path="/discover"
          element={<Discover />}
        />

        {/* =========================
            AUTHENTICATION
        ========================= */}
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

        {/* =========================
            DASHBOARD
        ========================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================
            DAY 1 + DAY 2
            SKILL DETAILS
        ========================= */}
        <Route
          path="/skill-details"
          element={<SkillDetails />}
        />

        {/* =========================
            NOTIFICATIONS
        ========================= */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* =========================
            SETTINGS
        ========================= */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

      </Routes>

      {/* Footer */}
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