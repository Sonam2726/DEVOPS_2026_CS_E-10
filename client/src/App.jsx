// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";

// import Landing from "./pages/Landing";
// import Register from "./pages/Register";
// import Login from "./pages/Login";
// import Home from "./pages/Home";
// import Discover from "./pages/Discover";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";

// function App() {
//   return (
//     <BrowserRouter>
//       <Navbar />

//       <Routes>
//         {/* Landing Page */}
//         <Route path="/" element={<Landing />} />
//         {/* Home Page */}
//         <Route path="/home" element={<Home />} />
//         {/* Discover Page */}
//         <Route path="/discover" element={<Discover />} />

//         {/* Register Page */}
//         <Route path="/register" element={<Register />} />

//         {/* Login Page */}
//         <Route path="/login" element={<Login />} />

//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />
//       </Routes>

//       <Footer />
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const location = useLocation();

  const isDashboard =
    location.pathname.toLowerCase() === "/dashboard";

  return (
    <>
      {!isDashboard && <Navbar />}

      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Existing pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/discover" element={<Discover />} />

        {/* Authentication */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

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