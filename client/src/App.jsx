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
import MySkills from "./pages/MySkills";
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
import AuthenticatedLayout from "./components/AuthenticatedLayout";


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("skillbridgeToken");
  const isLoggedIn =
    localStorage.getItem("skillbridgeLoggedIn") === "true" && Boolean(token);

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}


function AppContent() {
  const location = useLocation();

  const publicRoutes = [
    "/",
    "/home",
    "/about",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isWorkspacePage = !publicRoutes.includes(
    location.pathname.toLowerCase()
  );

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

        <Route
          path="/about"
          element={<About />}
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

        <Route
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<ChatScreen />} />
          <Route path="/my-skills" element={<MySkills />} />
          <Route path="/offer-skill" element={<OfferSkill />} />
          <Route path="/search" element={<Search />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/skill/:id" element={<SkillPreview />} />
          <Route path="/skill-details/:id" element={<SkillDetails />} />
          <Route path="/skill-details" element={<SkillDetails />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/match-details/:id" element={<MatchDetails />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/session-details/:id" element={<SessionDetails />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/reviews" element={<Reviews />} />
        </Route>

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