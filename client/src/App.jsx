import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Discover from "./pages/Discover";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />
        {/* Home Page */}
        <Route path="/home" element={<Home />} />
        {/* Discover Page */}
        <Route path="/discover" element={<Discover />} />

        {/* Register Page */}
        <Route path="/register" element={<Register />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;