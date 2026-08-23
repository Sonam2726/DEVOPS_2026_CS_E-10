import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Sonam's Home Page */}
        <Route path="/home" element={<Home />} />

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